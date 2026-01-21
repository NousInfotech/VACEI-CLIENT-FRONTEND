'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getOnboardingProgress } from '@/api/onboardingService';
import WelcomeScreen from './screens/WelcomeScreen';
import CompanyDetailsScreen from './screens/CompanyDetailsScreen';
import ServicesSelectionScreen from './screens/ServicesSelectionScreen';
import ReviewSubmitScreen from './screens/ReviewSubmitScreen';
import QuotationScreen from './screens/QuotationScreen';
import KYCIntroductionScreen from './screens/KYCIntroductionScreen';
import KYCDashboardScreen from './screens/KYCDashboardScreen';
import { OnboardingProgress } from '@/interfaces';

const TOTAL_STEPS = 7;

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [onboardingProgress, setOnboardingProgress] = useState<OnboardingProgress | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // Immediate check on mount - if completed, redirect right away
    const checkAndRedirect = () => {
      const saved = localStorage.getItem('onboarding-progress');
      if (saved) {
        try {
          const localProgress = JSON.parse(saved);
          // Check if completed OR if all steps are done (currentStep > 7 or completedSteps.length >= 7)
          if (localProgress.onboardingStatus === 'completed' || 
              localProgress.currentStep > 7 || 
              (localProgress.completedSteps && localProgress.completedSteps.length >= 7)) {
            // Fix: Mark as completed if not already marked
            if (localProgress.onboardingStatus !== 'completed') {
              const completedProgress: OnboardingProgress = {
                onboardingStatus: 'completed',
                currentStep: 7,
                completedSteps: [1, 2, 3, 4, 5, 6, 7],
              };
              localStorage.setItem('onboarding-progress', JSON.stringify(completedProgress));
            }
            setIsRedirecting(true);
            router.replace('/dashboard');
            // Fallback: force redirect if router doesn't work
            setTimeout(() => {
              if (typeof window !== 'undefined' && window.location.pathname === '/onboarding') {
                window.location.href = '/dashboard';
              }
            }, 200);
            return true; // Indicates we should stop here
          }
        } catch {
          // Invalid data, continue
        }
      }
      return false;
    };

    // Check immediately
    if (checkAndRedirect()) {
      return; // Don't load progress if redirecting
    }

    // Load progress for non-completed onboarding
    loadProgress();
  }, [router]);

  const loadProgress = async () => {
    try {
      // Use localStorage only (no backend calls)
      const progress = await getOnboardingProgress();
      
      // Fix: If currentStep > 7 or all steps completed, mark as completed
      if (progress.currentStep > 7 || progress.completedSteps.length >= 7) {
        const completedProgress: OnboardingProgress = {
          onboardingStatus: 'completed',
          currentStep: 7,
          completedSteps: [1, 2, 3, 4, 5, 6, 7],
        };
        localStorage.setItem('onboarding-progress', JSON.stringify(completedProgress));
        setOnboardingProgress(completedProgress);
        setIsRedirecting(true);
        router.replace('/dashboard');
        setTimeout(() => {
          if (typeof window !== 'undefined' && window.location.pathname === '/onboarding') {
            window.location.href = '/dashboard';
          }
        }, 200);
        setLoading(false);
        return;
      }
      
      setOnboardingProgress(progress);
      
      // If onboarding is completed, redirect to dashboard
      if (progress.onboardingStatus === 'completed') {
        setIsRedirecting(true);
        router.replace('/dashboard');
        // Fallback: force redirect if router doesn't work
        setTimeout(() => {
          if (typeof window !== 'undefined' && window.location.pathname === '/onboarding') {
            window.location.href = '/dashboard';
          }
        }, 200);
        setLoading(false);
        return;
      }
      
      // Resume from last incomplete step (ensure it's valid: 1-7)
      if (progress.currentStep && progress.currentStep > 1 && progress.currentStep <= 7) {
        setCurrentStep(progress.currentStep);
      } else if (progress.currentStep > 7) {
        // Invalid step number, start from step 1
        setCurrentStep(1);
      }
    } catch (error) {
      console.error('Failed to load onboarding progress:', error);
      // On error, start from step 1
      setCurrentStep(1);
    } finally {
      setLoading(false);
    }
  };

  const handleStepComplete = (step: number) => {
    if (step < TOTAL_STEPS) {
      setCurrentStep(step + 1);
    } else {
      // Onboarding complete
      router.push('/dashboard');
    }
  };

  // Check if all steps are completed (even if status says in_progress)
  const isAllStepsCompleted = (onboardingProgress?.completedSteps?.length ?? 0) >= 7 || 
                               (onboardingProgress?.currentStep ?? 0) > 7;

  // Show redirecting screen if completed or redirecting
  if (isRedirecting || 
      onboardingProgress?.onboardingStatus === 'completed' || 
      isAllStepsCompleted) {
    // If all steps are done but status isn't completed, fix it
    if (isAllStepsCompleted && onboardingProgress?.onboardingStatus !== 'completed') {
      const completedProgress: OnboardingProgress = {
        onboardingStatus: 'completed',
        currentStep: 7,
        completedSteps: [1, 2, 3, 4, 5, 6, 7],
      };
      localStorage.setItem('onboarding-progress', JSON.stringify(completedProgress));
      if (!isRedirecting) {
        setIsRedirecting(true);
        router.replace('/dashboard');
        setTimeout(() => {
          if (typeof window !== 'undefined' && window.location.pathname === '/onboarding') {
            window.location.href = '/dashboard';
          }
        }, 200);
      }
    }
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Ensure currentStep is valid (1-7)
  const validStep = currentStep >= 1 && currentStep <= 7 ? currentStep : 1;

  return (
    <>
      {validStep === 1 && (
        <WelcomeScreen
          onComplete={() => handleStepComplete(1)}
          onSaveExit={handleSaveExit}
        />
      )}
      {validStep === 2 && (
        <CompanyDetailsScreen
          onComplete={() => handleStepComplete(2)}
          onSaveExit={handleSaveExit}
          onBack={() => setCurrentStep(1)}
        />
      )}
      {validStep === 3 && (
        <ServicesSelectionScreen
          onComplete={() => handleStepComplete(3)}
          onSaveExit={handleSaveExit}
          onBack={() => setCurrentStep(2)}
        />
      )}
      {validStep === 4 && (
        <ReviewSubmitScreen
          onComplete={() => handleStepComplete(4)}
          onSaveExit={handleSaveExit}
          onBack={() => setCurrentStep(3)}
        />
      )}
      {validStep === 5 && (
        <QuotationScreen
          onComplete={() => handleStepComplete(5)}
          onSaveExit={handleSaveExit}
          onBack={() => setCurrentStep(4)}
        />
      )}
      {validStep === 6 && (
        <KYCIntroductionScreen
          onComplete={() => handleStepComplete(6)}
          onSaveExit={handleSaveExit}
          onBack={() => setCurrentStep(5)}
        />
      )}
      {validStep === 7 && (
        <KYCDashboardScreen
          onComplete={() => handleStepComplete(7)}
          onSaveExit={handleSaveExit}
        />
      )}
    </>
  );

  function handleSaveExit() {
    // Save progress and redirect to login or home
    router.push('/login');
  }
}
