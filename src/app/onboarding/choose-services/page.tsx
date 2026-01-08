'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

const SERVICE_OPTIONS = [
  'Bookkeeping',
  'VAT & Tax',
  'Payroll',
  'Audit',
  'CSP/Corporate',
  'Legal',
  'Projects/Transactions',
] as const;

type ServiceKey = (typeof SERVICE_OPTIONS)[number];

export default function ChooseServicesPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<Record<ServiceKey, boolean>>({
    'Bookkeeping': true,
    'VAT & Tax': true,
    'Payroll': false,
    'Audit': false,
    'CSP/Corporate': false,
    'Legal': false,
    'Projects/Transactions': false,
  });

  const toggleService = (key: ServiceKey) => {
    setSelected((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleContinue = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('vacei-onboarding-services', JSON.stringify(selected));
    }
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: 'hsl(var(--background))' }}>
      <div className="w-full max-w-xl bg-card border border-border rounded-2xl shadow-lg p-8 space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-brand-body">What do you need?</h1>
          <p className="text-sm text-muted-foreground">
            Pick the services you&apos;re working with first. You can always add or remove services later.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SERVICE_OPTIONS.map((label) => {
            const active = selected[label];
            return (
              <button
                key={label}
                type="button"
                onClick={() => toggleService(label)}
                className={`flex items-center justify-between rounded-xl border px-4 py-3 text-sm font-medium shadow-sm transition-all ${
                  active
                    ? 'bg-primary text-primary-foreground border-primary shadow-md'
                    : 'bg-card text-brand-body border-border hover:shadow-md'
                }`}
              >
                <span>{label}</span>
                <span
                  className={`h-5 w-5 rounded-full border flex items-center justify-center text-[10px] ${
                    active ? 'border-primary-foreground bg-primary-foreground text-primary' : 'border-border bg-card text-muted-foreground'
                  }`}
                >
                  {active ? '✓' : ''}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex justify-end pt-2">
          <Button onClick={handleContinue}>Continue</Button>
        </div>
      </div>
    </div>
  );
}


