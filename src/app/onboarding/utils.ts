import { getOnboardingProgress } from '@/api/onboardingService';

export async function checkOnboardingStatus(): Promise<{ 
  isCompleted: boolean; 
  currentStep?: number;
  shouldRedirect: boolean;
}> {
  try {
    const progress = await getOnboardingProgress();
    
    if (progress.onboardingStatus === 'completed') {
      return { 
        isCompleted: true, 
        shouldRedirect: false 
      };
    }
    
    return {
      isCompleted: false,
      currentStep: progress.currentStep || 1,
      shouldRedirect: true,
    };
  } catch (error) {
    console.error('Failed to check onboarding status:', error);
    // On error, allow access (fail open) - user can complete onboarding later
    return {
      isCompleted: false,
      shouldRedirect: false,
    };
  }
}

