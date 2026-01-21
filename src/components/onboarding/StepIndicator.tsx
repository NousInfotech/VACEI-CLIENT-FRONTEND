'use client';

import { cn } from "@/lib/utils";

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <span className="text-sm font-medium text-muted-foreground">
        Step {currentStep} of {totalSteps}
      </span>
      <div className="flex gap-2">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <div
            key={index}
            className={cn(
              "h-1.5 w-8 rounded-full transition-colors",
              index + 1 <= currentStep
                ? "bg-primary"
                : "bg-muted"
            )}
          />
        ))}
      </div>
    </div>
  );
}

