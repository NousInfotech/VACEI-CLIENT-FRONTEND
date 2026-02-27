'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getOnboardingProgress, saveOnboardingStep } from '@/api/onboardingService';
import UserRegistrationScreen from './screens/UserRegistrationScreen';
import WelcomeScreen from './screens/WelcomeScreen';
import CompanyDetailsScreen from './screens/CompanyDetailsScreen';
import ReviewSubmitScreen from './screens/ReviewSubmitScreen';
import KYCIntroductionScreen from './screens/KYCIntroductionScreen';
import KYCDashboardScreen from './screens/KYCDashboardScreen';
import { OnboardingProgress } from '@/interfaces';

const TOTAL_STEPS = 4;

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [onboardingProgress, setOnboardingProgress] = useState<OnboardingProgress | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // Check if user is logged out (no token) - if so, clear stale onboarding data for fresh signup
    const token = localStorage.getItem('token');
    if (!token) {
      // User is not logged in - clear any stale onboarding data to allow fresh signup
      localStorage.removeItem('onboarding-progress');
      localStorage.removeItem('onboarding-data');
      localStorage.removeItem('service-request-id');
      localStorage.removeItem('quotation-id');
      localStorage.removeItem('incorporation-cycle-id');
      // Start fresh onboarding
      setCurrentStep(1);
      setLoading(false);
      return;
    }

    // Immediate check on mount - if completed, redirect right away
    const checkAndRedirect = () => {
      const saved = localStorage.getItem('onboarding-progress');
      if (saved) {
        try {
          const localProgress = JSON.parse(saved);
          // Check if completed OR if all steps are done (currentStep > 4)
          if (localProgress.onboardingStatus === 'completed' || 
              localProgress.currentStep > TOTAL_STEPS) {
            // Fix: Mark as completed if not already marked
            if (localProgress.onboardingStatus !== 'completed') {
              const completedProgress: OnboardingProgress = {
                onboardingStatus: 'completed',
                currentStep: TOTAL_STEPS,
                completedSteps: [1, 2, 3, 4],
              };
              localStorage.setItem('onboarding-progress', JSON.stringify(completedProgress));
            }
            setIsRedirecting(true);
            router.replace('/global-dashboard');
            // Fallback: force redirect if router doesn't work
            setTimeout(() => {
              if (typeof window !== 'undefined' && window.location.pathname === '/onboarding') {
                window.location.href = '/global-dashboard';
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
      const token = localStorage.getItem('token');
      
      // If we have a token, they've already signed up (Step 1 complete)
      // We should check if they already have a company
      if (token) {
        try {
          const backendUrl = process.env.NEXT_PUBLIC_VACEI_BACKEND_URL?.replace(/\/?$/, "/") || "http://localhost:5000/api/v1/";
          const response = await fetch(`${backendUrl}companies`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          if (response.ok) {
            const result = await response.json();
            const companies = result.data || result || [];
            
            if (companies.length > 0) {
              const company = companies[0];
              // If they have a company, Step 1-3 are essentially done or in progress
              // Let's check if we should go directly to dashboard
              if (company.incorporationStatus && company.kycStatus) {
                setIsRedirecting(true);
                router.replace('/global-dashboard');
                return;
              }
              
              // If they have a company but onboarding not marked complete, start at Step 4 (Review)
              // This is a safe "resume" point for users who already have a company record
              setCurrentStep(4);
              setLoading(false);
              return;
            }
          }
        } catch (e) {
          console.warn('Failed to fetch companies for progress check:', e);
        }
        
        // If authenticated but no company found, skip Step 1 (Signup) and go to Step 2 (Welcome)
        const progress = await getOnboardingProgress();
        if (progress.currentStep === 1) {
           setCurrentStep(2);
        } else {
           setCurrentStep(progress.currentStep);
        }
        setLoading(false);
        return;
      }

      // Use localStorage fallback if not handled above
      const progress = await getOnboardingProgress();
      
      // Fix: If currentStep > 4 or all steps completed, mark as completed
      if (progress.currentStep > TOTAL_STEPS || progress.completedSteps.length >= TOTAL_STEPS) {
        const completedProgress: OnboardingProgress = {
          onboardingStatus: 'completed',
          currentStep: TOTAL_STEPS,
          completedSteps: [1, 2, 3, 4],
        };
        localStorage.setItem('onboarding-progress', JSON.stringify(completedProgress));
        setOnboardingProgress(completedProgress);
        setIsRedirecting(true);
        router.replace('/global-dashboard');
        setTimeout(() => {
          if (typeof window !== 'undefined' && window.location.pathname === '/onboarding') {
            window.location.href = '/global-dashboard';
          }
        }, 200);
        setLoading(false);
        return;
      }
      
      setOnboardingProgress(progress);
      
      // If onboarding is completed, redirect to dashboard
      if (progress.onboardingStatus === 'completed') {
        setIsRedirecting(true);
        router.replace('/global-dashboard');
        // Fallback: force redirect if router doesn't work
        setTimeout(() => {
          if (typeof window !== 'undefined' && window.location.pathname === '/onboarding') {
            window.location.href = '/global-dashboard';
          }
        }, 200);
        setLoading(false);
        return;
      }
      
      // Resume from last incomplete step (ensure it's valid: 1-4)
      if (progress.currentStep && progress.currentStep >= 1 && progress.currentStep <= TOTAL_STEPS) {
        setCurrentStep(progress.currentStep);
      } else if (progress.currentStep > TOTAL_STEPS) {
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
      const completedProgress: OnboardingProgress = {
        onboardingStatus: 'completed',
        currentStep: TOTAL_STEPS,
        completedSteps: [1, 2, 3, 4],
      };
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
          onBack={() => setCurrentStep(1)}
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
        completedSteps: onboardingProgress?.completedSteps || [],
      };
      localStorage.setItem('onboarding-progress', JSON.stringify(currentProgress));
      
      // Also save step progress to backend if possible
      try {
        await saveOnboardingStep(currentStep, {});
      } catch (error) {
        // If backend save fails, localStorage is already saved, so continue
        console.warn('Backend save failed on exit, using localStorage:', error);
      }
    } catch (error) {
      console.error('Failed to save progress on exit:', error);
    } finally {
      // Redirect to login
    router.push('/login');
    }
  }
}

