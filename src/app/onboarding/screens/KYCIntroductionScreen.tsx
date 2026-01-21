'use client';

import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout';
import { Button } from '@/components/ui/button';

interface KYCIntroductionScreenProps {
  onComplete: () => void;
  onSaveExit: () => void;
  onBack: () => void;
}

export default function KYCIntroductionScreen({ onComplete, onSaveExit, onBack }: KYCIntroductionScreenProps) {
  return (
    <OnboardingLayout
      currentStep={6}
      totalSteps={7}
      onContinue={onComplete}
      onSaveExit={onSaveExit}
      onBack={onBack}
      continueLabel="Go to KYC dashboard"
    >
      <div className="space-y-6 text-center py-8">
        <div>
          <h1 className="text-2xl font-semibold mb-4">Next step: Identity verification</h1>
        </div>

        <div className="space-y-4 text-left max-w-md mx-auto">
          <div className="flex items-start gap-3">
            <span className="text-primary mt-1">•</span>
            <p className="text-sm text-muted-foreground">
              Each director and shareholder completes KYC privately.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-primary mt-1">•</span>
            <p className="text-sm text-muted-foreground">
              Company KYC is completed once.
            </p>
          </div>
        </div>
      </div>
    </OnboardingLayout>
  );
}

