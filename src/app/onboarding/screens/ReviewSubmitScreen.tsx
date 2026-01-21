'use client';

import { useState, useEffect } from 'react';
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout';
import { Card, CardContent } from '@/components/ui/card2';
import { Button } from '@/components/ui/button';
import { OnboardingData } from '@/interfaces';
import { submitOnboardingRequest } from '@/api/onboardingService';
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
    // Load saved data
    const saved = localStorage.getItem('onboarding-data');
    if (saved) {
      setOnboardingData(JSON.parse(saved));
    }
  }, []);

  const handleSubmit = async () => {
    if (!onboardingData) return;

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
        onComplete();
      }, 2000);
    } catch (error) {
      console.error('Failed to submit:', error);
      alert('Failed to submit request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <OnboardingLayout
        currentStep={4}
        totalSteps={7}
        onContinue={() => {}}
        onSaveExit={onSaveExit}
        onBack={onBack}
        hideActions={true}
      >
        <div className="text-center space-y-4 py-8">
          <div className="text-4xl mb-4">✓</div>
          <h1 className="text-2xl font-semibold">Thank you</h1>
          <p className="text-muted-foreground">
            Your quotation will be sent within 24 hours.
          </p>
        </div>
      </OnboardingLayout>
    );
  }

  if (!onboardingData) {
    return (
        <OnboardingLayout 
          currentStep={4} 
          totalSteps={7} 
          onContinue={onBack} 
          onSaveExit={onSaveExit}
          onBack={onBack}
          continueLabel="Go Back"
        >
          <p>Loading review data...</p>
        </OnboardingLayout>
    );
  }

  const serviceNames: Record<string, string> = {
    accounting: 'Accounting & Bookkeeping',
    vat: 'VAT Returns',
    audit: 'Audit',
    payroll: 'Payroll',
    directorship: 'Directorship service',
    secretary: 'Company Secretary',
    address: 'Registered Address',
    tax: 'Tax Advisory',
  };

  return (
    <OnboardingLayout
      currentStep={4}
      totalSteps={7}
      onContinue={handleSubmit}
      onSaveExit={onSaveExit}
      onBack={onBack}
      continueLabel={isSubmitting ? 'Submitting...' : 'Submit request'}
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold mb-2">Review your request</h1>
        </div>

        {/* Company Summary */}
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-3">
              <h2 className="font-semibold">Company summary</h2>
              <Button variant="link" size="sm" onClick={onBack} asChild>
                <Link href="#edit">Edit</Link>
              </Button>
            </div>
            {onboardingData.companyType === 'existing' && onboardingData.existingCompanyDetails && (
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Type:</span> Existing Company</p>
                <p><span className="font-medium">Name:</span> {onboardingData.existingCompanyDetails.companyName}</p>
                <p><span className="font-medium">Registration:</span> {onboardingData.existingCompanyDetails.registrationNumber}</p>
                <p><span className="font-medium">Country:</span> {onboardingData.existingCompanyDetails.countryOfIncorporation}</p>
              </div>
            )}
            {onboardingData.companyType === 'new' && onboardingData.newCompanyDetails && (
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Type:</span> New Incorporation</p>
                <p><span className="font-medium">Proposed Names:</span></p>
                <ul className="list-disc list-inside ml-2">
                  {onboardingData.newCompanyDetails.proposedNames.name1 && (
                    <li>{onboardingData.newCompanyDetails.proposedNames.name1}</li>
                  )}
                  {onboardingData.newCompanyDetails.proposedNames.name2 && (
                    <li>{onboardingData.newCompanyDetails.proposedNames.name2}</li>
                  )}
                  {onboardingData.newCompanyDetails.proposedNames.name3 && (
                    <li>{onboardingData.newCompanyDetails.proposedNames.name3}</li>
                  )}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Selected Services */}
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-3">
              <h2 className="font-semibold">Selected services</h2>
              <Button variant="link" size="sm" onClick={onBack} asChild>
                <Link href="#edit">Edit</Link>
              </Button>
            </div>
            <div className="space-y-1">
              {onboardingData.selectedServices.map(serviceId => (
                <p key={serviceId} className="text-sm">• {serviceNames[serviceId] || serviceId}</p>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Roles & Services */}
        {onboardingData.companyType === 'new' && onboardingData.newCompanyDetails && (
          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-3">
                <h2 className="font-semibold">Roles & service choices</h2>
                <Button variant="link" size="sm" onClick={onBack} asChild>
                  <Link href="#edit">Edit</Link>
                </Button>
              </div>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Directors:</span> {
                  onboardingData.newCompanyDetails.directors.option === 'own' 
                    ? 'Own directors' 
                    : 'Directorship service'
                }</p>
                <p><span className="font-medium">Company Secretary:</span> {
                  onboardingData.newCompanyDetails.companySecretary.option === 'own'
                    ? 'Own appointment'
                    : 'Secretarial service'
                }</p>
                <p><span className="font-medium">Judicial Representative:</span> {
                  onboardingData.newCompanyDetails.judicialRepresentative.option === 'own'
                    ? 'Own appointment'
                    : 'Service provided'
                }</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </OnboardingLayout>
  );
}

