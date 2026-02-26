'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';

function MfaForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get("email") || "";
    const [code, setCode] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    
    const backendUrl = process.env.NEXT_PUBLIC_VACEI_BACKEND_URL?.replace(/\/?$/, "/") || "http://localhost:5000/api/v1/";

    useEffect(() => {
        if (!email) {
            router.push("/login");
        }
    }, [email, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (code.trim().length !== 6) {
          setError('Please enter the 6‑digit code.');
          return;
        }
        setError(null);
        setLoading(true);

        try {
            const response = await fetch(`${backendUrl}auth/verify-mfa`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp: code }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: "Verification failed" }));
                throw new Error(errorData.message || "Invalid or expired code.");
            }

            const responseData = await response.json();
            const loginData = responseData.data || responseData;
            const { token, user, client } = loginData;

            // Store auth token and user info (Sync with LoginForm.tsx)
            localStorage.setItem("token", token);
            localStorage.setItem("username", btoa(`${user?.firstName || ''} ${user?.lastName || ''}`));
            localStorage.setItem("email", btoa(email));
            localStorage.setItem("user_id", btoa(user?.id || ''));
            if (user?.role) localStorage.setItem("role", btoa(user.role.toLowerCase()));
            
            if (client?.id) localStorage.setItem("client_id", btoa(client.id));
            if (client?.folderId) localStorage.setItem("client_folder_id", btoa(client.folderId));

            // Set cookie for middleware access
            const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
            const cookieOptions = isHttps 
                ? 'SameSite=None; Secure; Path=/; Max-Age=86400' 
                : 'SameSite=Lax; Path=/; Max-Age=86400';
            
            if (typeof document !== 'undefined') {
                document.cookie = `client-token=${encodeURIComponent(token)}; ${cookieOptions}`;
            }

            router.push('/global-dashboard');
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: 'hsl(var(--background))' }}>
            <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-lg p-8 space-y-6">
                <div className="space-y-2 text-center">
                    <h1 className="text-2xl font-semibold text-brand-body">Verify Identity</h1>
                    <p className="text-sm text-muted-foreground">
                        We've sent a 6‑digit code to <span className="font-bold">{email}</span>.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-brand-body">Security Code</label>
                        <input
                            type="text"
                            inputMode="numeric"
                            maxLength={6}
                            value={code}
                            onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
                            className="w-full h-12 rounded-lg border border-border bg-input px-4 tracking-[0.5em] text-center text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring"
                            placeholder="••••••"
                            required
                        />
                        {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
                    </div>

                    <Button type="submit" className="w-full h-11 mt-2" disabled={loading}>
                        {loading ? "Verifying..." : "Verify & Sign In"}
                    </Button>

                    <p className="text-xs text-muted-foreground text-center mt-2">
                        Didn&apos;t receive a code? Check your spam folder or contact support.
                    </p>
                </form>
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


