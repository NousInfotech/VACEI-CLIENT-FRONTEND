'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

type Company = { id: string; name: string };

export default function CompanySelectPage() {
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const raw = localStorage.getItem('vacei-onboarding-companies');
    if (raw) {
      try {
        const parsed: Company[] = JSON.parse(raw);
        setCompanies(parsed);
        if (parsed[0]) setSelectedId(parsed[0].id);
        return;
      } catch {
        // ignore
      }
    }
    const defaults: Company[] = [
      { id: 'c1', name: 'ACME LTD' },
      { id: 'c2', name: 'ACME HOLDING LTD' },
    ];
    setCompanies(defaults);
    setSelectedId(defaults[0].id);
    localStorage.setItem('vacei-onboarding-companies', JSON.stringify(defaults));
  }, []);

  const handleOpen = (id: string) => {
    localStorage.setItem('vacei-active-company', id);
    router.push('/dashboard');
  };

  const handleNext = () => {
    router.push('/onboarding/company-setup');
  };

  const handleAddCompany = () => {
    router.push('/onboarding/company-setup');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: 'hsl(var(--background))' }}>
      <div className="w-full max-w-xl bg-card border border-border rounded-2xl shadow-lg p-8 space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-brand-body">Select Company</h1>
          <p className="text-sm text-muted-foreground">
            Choose an existing company to open, or continue to add a new one.
          </p>
        </div>

        <div className="space-y-3">
          {companies.map((c) => (
            <div
              key={c.id}
              className={`flex items-center justify-between rounded-xl border px-4 py-3 text-sm shadow-sm cursor-pointer transition-all ${
                selectedId === c.id ? 'border-primary bg-muted' : 'border-border bg-card hover:shadow-md'
              }`}
              onClick={() => setSelectedId(c.id)}
            >
              <span className="font-medium text-brand-body">{c.name}</span>
              <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); handleOpen(c.id); }}>
                Open
              </Button>
            </div>
          ))}

          <button
            type="button"
            onClick={handleAddCompany}
            className="mt-2 inline-flex items-center gap-2 text-xs font-medium text-primary"
          >
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-border bg-card text-lg leading-none">
              +
            </span>
            Add / Create Company
          </button>
        </div>

        <div className="flex justify-end pt-2">
          <Button onClick={handleNext}>Next</Button>
        </div>
      </div>
    </div>
  );
}


