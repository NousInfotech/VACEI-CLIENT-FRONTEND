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

  const handleContinue = async () => {
    if (!selectedType) return;

    try {
      // Always save to localStorage first
      const existingData = JSON.parse(localStorage.getItem('onboarding-data') || '{}');
      localStorage.setItem('onboarding-data', JSON.stringify({
        ...existingData,
        companyType: selectedType,
      }));

      // Try to save to backend (will fallback to localStorage if backend unavailable)
      try {
        await saveOnboardingStep(1, { companyType: selectedType });
      } catch (error: any) {
        // If backend error, localStorage is already saved, so continue
        console.warn('Backend save failed, using localStorage:', error.message);
      }
      
      onComplete();
    } catch (error) {
      console.error('Failed to save step:', error);
      // Even if there's an error, proceed if localStorage save worked
      onComplete();
    }
  };

  return (
    <OnboardingLayout
      currentStep={1}
      totalSteps={7}
      onContinue={handleContinue}
      onSaveExit={onSaveExit}
      onBack={onBack}
      continueLabel="Continue"
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
                <h3 className="font-semibold text-lg mb-2">My company is already incorporated</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  You already have a registered company and need services.
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
                <h3 className="font-semibold text-lg mb-2">I need to incorporate a company</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  You want us to set up a new company for you.
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

