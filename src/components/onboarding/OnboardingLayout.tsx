'use client';

import Image from 'next/image';
import { StepIndicator } from './StepIndicator';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card2';
import { Spinner } from '@/components/ui/spinner';
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
  disabled?: boolean; // Disable continue button
  logoSrc?: string;
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
  disabled = false,
  logoSrc = '/logo/Logo.webp',
  className,
}: OnboardingLayoutProps) {
  const showBackButton = currentStep > 1 && onBack;
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-40 py-8">
      <Card className={cn("w-full shadow-lg h-[85vh] flex flex-col", className)}>
        <CardContent className="p-8 flex flex-col h-full overflow-hidden">
          {/* Header Section: Logo + Step Indicator (Stable) */}
          <div className="shrink-0">
            {/* Logo */}
            <div className="mb-6">
              <Image
                src={logoSrc}
                alt="Logo"
                width={120}
                height={40}
                className="object-contain"
              />
            </div>
 
             {/* Step Indicator */}
            <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />
          </div>
 
           {/* Scrollable Content Section */}
          <div className="flex-1 overflow-y-auto min-h-0 py-4 pr-2 custom-scrollbar">
            {children}
          </div>
 
           {/* Actions Section (Stable) */}
          {!hideActions && (
            <div className="flex justify-between items-center pt-6 border-t gap-3 shrink-0 mt-auto bg-white px-2">
              <div className="flex gap-2">
                {showBackButton && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onBack}
                    disabled={disabled}
                  >
                    Back
                  </Button>
                )}
                <Button
                  type="button"
                  variant="outline"
                  onClick={onSaveExit}
                  disabled={disabled}
                >
                  Save & exit
                </Button>
              </div>
              <Button
                type="button"
                onClick={onContinue}
                disabled={disabled}
              >
                {disabled && (
                  <Spinner className="text-current" size={16} />
                )}
                {continueLabel}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

