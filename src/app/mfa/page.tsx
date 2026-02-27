'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';

type MfaMethod = 'email' | 'totp' | 'webauthn';

function bufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = btoa(binary);
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/u, '');
}

function base64UrlToBuffer(base64url: string): ArrayBuffer {
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

function toPublicKeyRequestOptions(options: Record<string, unknown>): CredentialRequestOptions {
  const challenge = options.challenge as string;
  const allowCredentials = options.allowCredentials as
    | Array<{ id: string; type: string; transports?: string[] }>
    | undefined;

  return {
    publicKey: {
      challenge: base64UrlToBuffer(challenge),
      timeout: (options.timeout as number) ?? 60000,
      rpId: (options.rpId as string) || undefined,
      userVerification: (options.userVerification as any) || 'preferred',
      allowCredentials: allowCredentials?.map((cred) => ({
        id: base64UrlToBuffer(cred.id),
        type: 'public-key' as const,
        transports: cred.transports as AuthenticatorTransport[] | undefined,
      })),
    },
  };
}

function MfaForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const method = (searchParams.get('method') as MfaMethod) || 'email';
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const backendUrl =
    process.env.NEXT_PUBLIC_VACEI_BACKEND_URL?.replace(/\/?$/, '/') ||
    'http://localhost:5000/api/v1/';

  useEffect(() => {
    if (!email) {
      router.push('/login');
    }
  }, [email, router]);

  const completeLogin = (loginData: any) => {
    const { token, user, client } = loginData;
    // Store auth token and user info (Sync with LoginForm.tsx)
    localStorage.setItem('token', token);
    localStorage.setItem('username', btoa(`${user?.firstName || ''} ${user?.lastName || ''}`));
    localStorage.setItem('email', btoa(email));
    localStorage.setItem('user_id', btoa(user?.id || ''));
    if (user?.role) localStorage.setItem('role', btoa(user.role.toLowerCase()));

    if (client?.id) localStorage.setItem('client_id', btoa(client.id));
    if (client?.folderId) localStorage.setItem('client_folder_id', btoa(client.folderId));

    // Set cookie for middleware access
    const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
    const cookieOptions = isHttps
      ? 'SameSite=None; Secure; Path=/; Max-Age=86400'
      : 'SameSite=Lax; Path=/; Max-Age=86400';

    if (typeof document !== 'undefined') {
      document.cookie = `client-token=${encodeURIComponent(token)}; ${cookieOptions}`;
    }
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim().length !== 6) {
      setError('Please enter the 6‑digit code.');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const response = await fetch(`${backendUrl}auth/mfa/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          otp: code,
          method: method === 'totp' ? 'totp' : 'email',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Verification failed' }));
        throw new Error(errorData.message || 'Invalid or expired code.');
      }

      const responseData = await response.json();
      const loginData = responseData.data || responseData;
      completeLogin(loginData);
      router.push('/global-dashboard');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleWebAuthn = async () => {
    setError(null);
    setLoading(true);
    try {
      const challengeRes = await fetch(`${backendUrl}auth/mfa/webauthn/login-challenge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!challengeRes.ok) {
        const errData = await challengeRes.json().catch(() => ({}));
        throw new Error(errData.message || 'Unable to start WebAuthn login');
      }
      const challengeJson = await challengeRes.json();
      const { options } = challengeJson.data || challengeJson;

      const cred = await navigator.credentials.get(
        toPublicKeyRequestOptions(options as Record<string, unknown>),
      );
      if (!cred || cred.type !== 'public-key') {
        throw new Error('Verification was cancelled or failed.');
      }

      const publicKeyCred = cred as PublicKeyCredential;
      const assertion = publicKeyCred.response as AuthenticatorAssertionResponse;

      const webauthnResponse = {
        id: publicKeyCred.id,
        rawId: bufferToBase64Url(publicKeyCred.rawId),
        type: publicKeyCred.type,
        response: {
          clientDataJSON: bufferToBase64Url(assertion.clientDataJSON),
          authenticatorData: bufferToBase64Url(assertion.authenticatorData),
          signature: bufferToBase64Url(assertion.signature),
          userHandle: assertion.userHandle ? bufferToBase64Url(assertion.userHandle) : undefined,
        },
        clientExtensionResults:
          (publicKeyCred as unknown as { getClientExtensionResults?: () => Record<string, unknown> })
            .getClientExtensionResults?.() ?? {},
      };

      const verifyRes = await fetch(`${backendUrl}auth/mfa/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          method: 'webauthn',
          webauthnResponse,
        }),
      });

      if (!verifyRes.ok) {
        const errData = await verifyRes.json().catch(() => ({ message: 'Verification failed' }));
        throw new Error(errData.message || 'Biometric verification failed');
      }

      const verifyJson = await verifyRes.json();
      const loginData = verifyJson.data || verifyJson;
      completeLogin(loginData);
      router.push('/global-dashboard');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const copy =
    method === 'email'
      ? (
          <>
            We&apos;ve sent a 6‑digit code to <span className="font-bold">{email}</span>.
          </>
        )
      : method === 'totp'
        ? 'Enter the 6‑digit code from your authenticator app.'
        : 'Use your device fingerprint, face, or security key to sign in.';

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: 'hsl(var(--background))' }}
    >
      <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-lg p-8 space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold text-brand-body">Verify Identity</h1>
          <p className="text-sm text-muted-foreground">{copy}</p>
        </div>

        {method === 'webauthn' ? (
          <div className="space-y-4">
            <p className="text-xs text-muted-foreground text-center">
              When prompted, use your device&apos;s fingerprint, face, or security key.
            </p>
            {error && <p className="text-sm text-red-500 mt-1 text-center">{error}</p>}
            <Button
              type="button"
              className="w-full h-11 mt-2"
              disabled={loading}
              onClick={handleWebAuthn}
            >
              {loading ? 'Verifying...' : 'Verify with device security'}
            </Button>
          </div>
        ) : (
          <form onSubmit={handleCodeSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-brand-body">
                {method === 'email' ? 'Email security code' : 'Authenticator app code'}
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
                className="w-full h-12 rounded-lg border border-border bg-input px-4 tracking-[0.5em] text-center text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring"
                placeholder="000000"
                required
              />
              {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
            </div>

            <Button type="submit" className="w-full h-11 mt-2" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify & Sign In'}
            </Button>

            <p className="text-xs text-muted-foreground text-center mt-2">
              Didn&apos;t receive a code? Check your spam folder or contact support.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

export default function MfaVerifyPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MfaForm />
    </Suspense>
  );
}

