'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function MfaVerifyPage() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // UI-only: in a real implementation we would post to backend
    if (code.trim().length !== 6) {
      setError('Please enter the 6‑digit code.');
      return;
    }
    setError(null);
    // Pretend success and send user to dashboard
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: 'hsl(var(--background))' }}>
      <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-lg p-8 space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold text-brand-body">Verify</h1>
          <p className="text-sm text-muted-foreground">
            Enter the 6‑digit code from your authenticator app or SMS to finish signing in.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-brand-body">6‑digit code</label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
              className="w-full h-12 rounded-lg border border-border bg-input px-4 tracking-[0.5em] text-center text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring"
              placeholder="••••••"
            />
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
          </div>

          <Button type="submit" className="w-full h-11 mt-2">
            Verify
          </Button>

          <p className="text-xs text-muted-foreground text-center mt-2">
            Didn&apos;t receive a code? Contact your firm or try another method.
          </p>
        </form>
      </div>
    </div>
  );
}


