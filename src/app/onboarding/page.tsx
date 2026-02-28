'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getOnboardingProgress, saveOnboardingStep, saveOnboardingDataToDB } from '@/api/onboardingService';
import UserRegistrationScreen from './screens/UserRegistrationScreen';
import WelcomeScreen from './screens/WelcomeScreen';
import CompanyDetailsScreen from './screens/CompanyDetailsScreen';
import ReviewSubmitScreen from './screens/ReviewSubmitScreen';
import KYCIntroductionScreen from './screens/KYCIntroductionScreen';
import KYCDashboardScreen from './screens/KYCDashboardScreen';
import { OnboardingProgress } from '@/interfaces';
import { Suspense } from 'react';

const TOTAL_STEPS = 4;

function OnboardingPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isContinue = searchParams.get('continue') === 'true';
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [onboardingProgress, setOnboardingProgress] = useState<OnboardingProgress | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    // If no token, we are at the signup phase (Step 1)
    if (!token) {
      setCurrentStep(1);
      setLoading(false);
      return;
    }

    // If we have a token, we should check progress
    loadProgress(token);
  }, []);

  const loadProgress = async (token: string) => {
    try {
      setLoading(true);

      // 1. Fetch backend progress (Client Preferences)
      const progress = await getOnboardingProgress();
      
      // 2. Fetch companies to check "fully registered" status
      const backendUrl = process.env.NEXT_PUBLIC_VACEI_BACKEND_URL?.replace(/\/?$/, "/") || "http://localhost:5000/api/v1/";
      const response = await fetch(`${backendUrl}companies`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const result = await response.json();
        const companies = result.data || result || [];
        
        if (companies.length > 0) {
          const company = companies[0];
          // Fully registered = Company exists AND (Incorporation complete AND KYC complete)
          // Note: If they just finished Step 4, they might still be in "onboarding" technically 
          // but we should send them to dashboard if the statuses are right.
          if (company.incorporationStatus && company.kycStatus) {
            setIsRedirecting(true);
            router.replace('/global-dashboard');
            return;
          }
        }
      }

      // 3. Handle step navigation based on progress
      if (progress.onboardingStatus === 'completed' || progress.currentStep > TOTAL_STEPS) {
        setIsRedirecting(true);
        router.replace('/global-dashboard');
        return;
      }

      // Resume from last incomplete step
      setCurrentStep(progress.currentStep || 2);
    } catch (error) {
      console.error('Failed to load onboarding progress:', error);
      // Fallback to minimal sensible step if authenticated
      setCurrentStep(2);
    } finally {
      setLoading(false);
    }
  };

  const handleStepComplete = async (step: number) => {
    if (step < TOTAL_STEPS) {
      // Ensure 'continue' param is added when moving past step 1
      if (step === 1) {
        router.push('/onboarding?continue=true');
      }
      setCurrentStep(step + 1);
    } else {
      // Onboarding complete - mark in DB
      const completedProgress: OnboardingProgress = {
        onboardingStatus: 'completed',
        currentStep: TOTAL_STEPS,
        completedSteps: [1, 2, 3, 4],
      };
      
      const token = localStorage.getItem('token');
      if (token) {
        await saveOnboardingStep(TOTAL_STEPS, {});
        // Also explicitly mark as completed
        const existingData = JSON.parse(localStorage.getItem('onboarding-data') || '{}');
        await saveOnboardingDataToDB({
          progress: completedProgress,
          data: existingData
        });
      }
      
      localStorage.setItem('onboarding-progress', JSON.stringify(completedProgress));
      router.push('/global-dashboard');
    }
  };

  // Check if all steps are completed (even if status says in_progress)
  const isAllStepsCompleted = (onboardingProgress?.completedSteps?.length ?? 0) >= TOTAL_STEPS || 
                               (onboardingProgress?.currentStep ?? 0) > TOTAL_STEPS;

  // Show redirecting screen if completed or redirecting
  if (isRedirecting || 
      onboardingProgress?.onboardingStatus === 'completed' || 
      isAllStepsCompleted) {
    // If all steps are done but status isn't completed, fix it
        if (isAllStepsCompleted && onboardingProgress?.onboardingStatus !== 'completed') {
          const completedProgress: OnboardingProgress = {
            onboardingStatus: 'completed',
            currentStep: TOTAL_STEPS,
            completedSteps: [1, 2, 3, 4],
          };
      localStorage.setItem('onboarding-progress', JSON.stringify(completedProgress));
      if (!isRedirecting) {
        setIsRedirecting(true);
        router.replace('/global-dashboard');
        setTimeout(() => {
          if (typeof window !== 'undefined' && window.location.pathname === '/onboarding') {
            window.location.href = '/global-dashboard';
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

  // Ensure currentStep is valid (1-4)
  const validStep = currentStep >= 1 && currentStep <= TOTAL_STEPS ? currentStep : 1;

  return (
    <>
      {validStep === 1 && (
        <UserRegistrationScreen
          onComplete={() => handleStepComplete(1)}
          onSaveExit={handleSaveExit}
        />
      )}
      {validStep === 2 && (
        <WelcomeScreen
          onComplete={() => handleStepComplete(2)}
          onSaveExit={handleSaveExit}
          onBack={() => router.push('/login')}
        />
      )}
      {validStep === 3 && (
        <CompanyDetailsScreen
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
    </>
  );

  async function handleSaveExit() {
    try {
      // Save current step progress before redirecting
      const currentProgress: OnboardingProgress = {
        onboardingStatus: 'in_progress',
        currentStep: currentStep,
        completedSteps: Array.from({ length: currentStep - 1 }, (_, i) => i + 1),
      };
      
      localStorage.setItem('onboarding-progress', JSON.stringify(currentProgress));
      
      // Also save step progress to backend if possible - use saveOnboardingDataToDB to avoid auto-advancing
      const token = localStorage.getItem('token');
      if (token) {
        const existingData = JSON.parse(localStorage.getItem('onboarding-data') || '{}');
        await saveOnboardingDataToDB({
          progress: currentProgress,
          data: existingData
        });
      }
    } catch (error) {
      console.error('Failed to save progress on exit:', error);
    } finally {
      // Redirect to login
      router.push('/login');
    }
  }
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading onboarding...</p>
        </div>
      </div>
    }>
      <OnboardingPageContent />
    </Suspense>
  );
}

