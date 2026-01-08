'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function CompanySetupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [companyName, setCompanyName] = useState('');
  const [country, setCountry] = useState('');
  const [industry, setIndustry] = useState('');
  const [fyeMonth, setFyeMonth] = useState('');
  const [fyeDay, setFyeDay] = useState('');

  const handleNext = () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else {
      // Finish → store minimal profile and go to choose services
      if (typeof window !== 'undefined') {
        const profile = { companyName, country, industry, fyeMonth, fyeDay };
        localStorage.setItem('vacei-onboarding-company-profile', JSON.stringify(profile));
      }
      router.push('/onboarding/choose-services');
    }
  };

  const stepLabel = `Company Setup (Step ${step}/3)`;

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: 'hsl(var(--background))' }}>
      <div className="w-full max-w-xl bg-card border border-border rounded-2xl shadow-lg p-8 space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-brand-body">{stepLabel}</h1>
          <p className="text-sm text-muted-foreground">
            Capture the minimum details your accountant needs. You can complete the rest later from Settings.
          </p>
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-brand-body">Company name</label>
              <input
                className="w-full h-11 rounded-lg border border-border bg-input px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="ACME LTD"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-brand-body">Country</label>
                <input
                  className="w-full h-11 rounded-lg border border-border bg-input px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="Malta"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-brand-body">Industry</label>
                <input
                  className="w-full h-11 rounded-lg border border-border bg-input px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  placeholder="Technology, Hospitality…"
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-brand-body">Fiscal year end</label>
              <div className="flex gap-3">
                <input
                  className="w-1/2 h-11 rounded-lg border border-border bg-input px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring"
                  value={fyeDay}
                  onChange={(e) => setFyeDay(e.target.value)}
                  placeholder="DD"
                />
                <input
                  className="w-1/2 h-11 rounded-lg border border-border bg-input px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring"
                  value={fyeMonth}
                  onChange={(e) => setFyeMonth(e.target.value)}
                  placeholder="MM"
                />
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 text-sm text-muted-foreground">
            <p>That&apos;s it for now. You can refine company details, directors and filings from the CSP workspace later.</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Company profile will appear under Settings → Company profile.</li>
              <li>You can add more companies at any time from the header company selector.</li>
            </ul>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <Button onClick={handleNext}>{step < 3 ? 'Next' : 'Continue'}</Button>
        </div>
      </div>
    </div>
  );
}


