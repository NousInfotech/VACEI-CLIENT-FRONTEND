'use client';

import { useState, useEffect } from 'react';
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout';
import { Card, CardContent } from '@/components/ui/card2';
import { Button } from '@/components/ui/button';
import { OnboardingData } from '@/interfaces';
import { submitOnboardingRequest, getOnboardingDataFromDB } from '@/api/onboardingService';
import Link from 'next/link';

interface ReviewSubmitScreenProps {
  onComplete: () => void;
  onSaveExit: () => void;
  onBack: () => void;
}

export default function ReviewSubmitScreen({ onComplete, onSaveExit, onBack }: ReviewSubmitScreenProps) {
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      // 1. Load from localStorage
      const saved = localStorage.getItem('onboarding-data');
      let data: any = null;
      if (saved) {
        try {
          data = JSON.parse(saved);
        } catch (e) {
          console.warn('Failed to parse localStorage onboarding-data');
        }
      }

      // 2. Load from DB if authenticated
      const token = localStorage.getItem('token');
      if (token) {
        const dbOnboarding = await getOnboardingDataFromDB();
        if (dbOnboarding?.data) {
          data = { ...data, ...dbOnboarding.data };
        }
      }

      if (data) {
        setOnboardingData(data);
      }
    };

    loadData();
  }, []);

  const handleSubmit = async () => {
    if (!onboardingData) return;

    // PATH B: New Company Profile (incorporationStatus: false) - no service request needed, can proceed directly
    const incorporationStatus = onboardingData.incorporationStatus;
    if (incorporationStatus === false) {
      // PATH B: Skip service request submission, proceed directly
      setSubmitted(true);
      setTimeout(() => {
        // Clear onboarding progress from localStorage on success
        localStorage.removeItem('onboarding-progress');
        localStorage.removeItem('onboarding-data');
        onComplete();
      }, 1000);
      return;
    }

    // PATH A: Existing Company → Incorporation Service
    setIsSubmitting(true);
    try {
      const result = await submitOnboardingRequest(onboardingData);
      setSubmitted(true);
      
      // Store quotation ID for next step
      if (result.quotationId) {
        localStorage.setItem('quotation-id', result.quotationId);
      }

      // Auto-advance after a short delay
      setTimeout(() => {
        // Clear onboarding progress from localStorage on success
        localStorage.removeItem('onboarding-progress');
        localStorage.removeItem('onboarding-data');
        onComplete();
      }, 2000);
    } catch (error: any) {
      // CRITICAL: If submission fails, DO NOT allow continuation
      console.error('Failed to submit:', error);
      const errorMessage = error.message || 'Failed to submit request. Please try again.';
      alert(`Failed to submit request: ${errorMessage}\n\nPlease check your connection and try again.`);
      setIsSubmitting(false);
      // Block navigation - don't call onComplete()
      return;
    }
  };

  if (submitted) {
    // Check incorporation status from localStorage (created in Step 3)
    // NEW WORKFLOW:
    // PATH A: Existing Company (incorporationStatus: true) → Already incorporated → Proceed to KYC
    // PATH B: New Company (incorporationStatus: false) → Needs incorporation → Service request submitted
    const savedData = localStorage.getItem('onboarding-data');
    let incorporationStatus: boolean | null = null;
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        incorporationStatus = parsed.incorporationStatus;
      } catch (e) {
        // Fallback: existing companies have incorporationStatus: true
        incorporationStatus = onboardingData?.companyType === 'existing' ? true : false;
      }
    }
    
    return (
      <OnboardingLayout
        currentStep={4}
        totalSteps={4}
        onContinue={() => {}}
        onSaveExit={onSaveExit}
        onBack={onBack}
        hideActions={true}
      >
        <div className="text-center space-y-4 py-8">
          <div className="text-4xl mb-4">✓</div>
          <h1 className="text-2xl font-semibold">Thank you</h1>
          <p className="text-muted-foreground">
            {incorporationStatus === true 
              ? 'Your company profile has been created. You can proceed to KYC verification.'
              : 'Your quotation will be sent within 24 hours.'}
          </p>
        </div>
      </OnboardingLayout>
    );
  }

  if (!onboardingData) {
    return (
        <OnboardingLayout 
          currentStep={4} 
          totalSteps={4} 
          onContinue={onBack} 
          onSaveExit={onSaveExit}
          onBack={onBack}
          continueLabel="Go Back"
        >
          <p>Loading review data...</p>
        </OnboardingLayout>
    );
  }

  // Check if PATH A (Existing Company - incorporationStatus: true)
  const isPathA = onboardingData.incorporationStatus === true;

  return (
    <OnboardingLayout
      currentStep={4}
      totalSteps={4}
      onContinue={handleSubmit}
      onSaveExit={onSaveExit}
      onBack={onBack}
      continueLabel={
        !isPathA 
          ? 'Continue' 
          : (isSubmitting ? 'Submitting...' : 'Submit request')
      }
      disabled={isSubmitting}
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold mb-2">Review your request</h1>
        </div>

        {/* Company Summary */}
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-3">
              <h2 className="font-semibold">Company overview</h2>
              <Button variant="link" size="sm" onClick={onBack} asChild>
                <Link href="#edit">Edit</Link>
              </Button>
            </div>
            {onboardingData.companyType === 'existing' && onboardingData.existingCompanyDetails && (
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Company Name:</span> {onboardingData.existingCompanyDetails.companyName}</p>
                <p><span className="font-medium">Registration Number:</span> {onboardingData.existingCompanyDetails.registrationNumber}</p>
                <p><span className="font-medium">Registered Address:</span> {onboardingData.existingCompanyDetails.registeredAddress}</p>
                {onboardingData.existingCompanyDetails.industry && onboardingData.existingCompanyDetails.industry.length > 0 && (
                  <p><span className="font-medium">Industry:</span> {onboardingData.existingCompanyDetails.industry.join(', ')}</p>
                )}
                {onboardingData.existingCompanyDetails.summary && (
                  <p><span className="font-medium">Description:</span> {onboardingData.existingCompanyDetails.summary}</p>
                )}
              </div>
            )}
            {onboardingData.companyType === 'new' && onboardingData.newCompanyDetails && (
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Company Name:</span> {onboardingData.newCompanyDetails.proposedNames.name1}</p>
                <p><span className="font-medium">Registration Number:</span> {onboardingData.newCompanyDetails.registrationNumber}</p>
                <p><span className="font-medium">Registered Address:</span> {onboardingData.newCompanyDetails.registeredAddress.address}</p>
                {onboardingData.newCompanyDetails.industry && onboardingData.newCompanyDetails.industry.length > 0 && (
                  <p><span className="font-medium">Industry:</span> {onboardingData.newCompanyDetails.industry.join(', ')}</p>
                )}
                {onboardingData.newCompanyDetails.summary && (
                  <p><span className="font-medium">Description:</span> {onboardingData.newCompanyDetails.summary}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </OnboardingLayout>
  );
}

