'use client';

import Image from 'next/image';
import { StepIndicator } from './StepIndicator';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card2';
import { cn } from '@/lib/utils';

interface OnboardingLayoutProps {
  currentStep: number;
  totalSteps: number;
  children: React.ReactNode;
  onContinue: () => void;
  onSaveExit: () => void;
  onBack?: () => void;
  continueLabel?: string;
  hideActions?: boolean;
  className?: string;
}

export function OnboardingLayout({
  currentStep,
  totalSteps,
  children,
  onContinue,
  onSaveExit,
  onBack,
  continueLabel = 'Continue',
  hideActions = false,
  className,
}: OnboardingLayoutProps) {
  const showBackButton = currentStep > 1 && onBack;
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <Card className={cn("w-full max-w-[720px] shadow-lg", className)}>
        <CardContent className="p-8">
          {/* Logo */}
          <div className="mb-6">
            <Image
              src="/logo.svg"
              alt="Logo"
              width={120}
              height={40}
              className="object-contain"
            />
          </div>

          {/* Step Indicator */}
          <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />

          {/* Content */}
          <div className="mb-8">
            {children}
          </div>

          {/* Actions */}
          {!hideActions && (
            <div className="flex justify-between items-center pt-4 border-t gap-3">
              <div className="flex gap-2">
                {showBackButton && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onBack}
                  >
                    Back
                  </Button>
                )}
                <Button
                  type="button"
                  variant="outline"
                  onClick={onSaveExit}
                >
                  Save & exit
                </Button>
              </div>
              <Button
                type="button"
                onClick={onContinue}
              >
                {continueLabel}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

