'use client';

import { useState } from 'react';
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout';
import { Card } from '@/components/ui/card2';
import { Button } from '@/components/ui/button';
import { CompanyType } from '@/interfaces';
import { saveOnboardingStep } from '@/api/onboardingService';
import { Building2, FileText } from 'lucide-react';

interface WelcomeScreenProps {
  onComplete: () => void;
  onSaveExit: () => void;
  onBack?: () => void;
}

export default function WelcomeScreen({ onComplete, onSaveExit, onBack }: WelcomeScreenProps) {
  const [selectedType, setSelectedType] = useState<CompanyType | null>(null);
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (!selectedType) return;

    setLoading(true);
    try {
      // Always save to localStorage first
      const existingData = JSON.parse(localStorage.getItem('onboarding-data') || '{}');
      localStorage.setItem('onboarding-data', JSON.stringify({
        ...existingData,
        companyType: selectedType,
      }));

      // Try to save to backend (will fallback to localStorage if backend unavailable)
      try {
        await saveOnboardingStep(2, { companyType: selectedType });
      } catch (error: any) {
        // If backend error, localStorage is already saved, so continue
        console.warn('Backend save failed, using localStorage:', error.message);
      }
      
      onComplete();
    } catch (error) {
      console.error('Failed to save step:', error);
      setLoading(false);
      // Even if there's an error, proceed if localStorage save worked
      onComplete();
    }
  };

  return (
    <OnboardingLayout
      currentStep={2}
      totalSteps={7}
      onContinue={handleContinue}
      onSaveExit={onSaveExit}
      onBack={onBack}
      continueLabel={loading ? 'Saving...' : 'Continue'}
      disabled={loading}
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold mb-2">Welcome — let&apos;s get you set up</h1>
          <p className="text-sm text-muted-foreground">
            This takes about 5–10 minutes. You can save and continue anytime.
          </p>
        </div>

        <div className="space-y-4">
          {/* Existing Company Card */}
          <Card
            className={`p-6 cursor-pointer transition-all hover:shadow-md ${
              selectedType === 'existing' ? 'ring-2 ring-primary border-primary' : ''
            }`}
            onClick={() => setSelectedType('existing')}
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2">Existing Company — Incorporation Service</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  You have an existing company and need incorporation services (Accounting, VAT, Audit, Payroll, Tax Advisory, etc.).
                </p>
                <Button
                  variant={selectedType === 'existing' ? 'default' : 'outline'}
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedType('existing');
                  }}
                >
                  Select
                </Button>
              </div>
            </div>
          </Card>

          {/* New Incorporation Card */}
          <Card
            className={`p-6 cursor-pointer transition-all hover:shadow-md ${
              selectedType === 'new' ? 'ring-2 ring-primary border-primary' : ''
            }`}
            onClick={() => setSelectedType('new')}
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2">New Company Profile</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Create a new company profile. Your company is already incorporated. Services are not available for this path.
                </p>
                <Button
                  variant={selectedType === 'new' ? 'default' : 'outline'}
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedType('new');
                  }}
                >
                  Select
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </OnboardingLayout>
  );
}

