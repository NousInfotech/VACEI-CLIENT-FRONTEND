'use client';

import { useState, useEffect } from 'react';
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout';
import { Card, CardContent } from '@/components/ui/card2';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Quotation } from '@/interfaces';
import { getQuotation, acceptQuotation, requestQuotationChanges } from '@/api/onboardingService';

interface QuotationScreenProps {
  onComplete: () => void;
  onSaveExit: () => void;
  onBack: () => void;
}

export default function QuotationScreen({ onComplete, onSaveExit, onBack }: QuotationScreenProps) {
  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepted, setAccepted] = useState(false);
  const [showChangeRequest, setShowChangeRequest] = useState(false);
  const [changeComments, setChangeComments] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadQuotation();
  }, []);

  const loadQuotation = async () => {
    try {
      const quotationId = localStorage.getItem('quotation-id');
      if (quotationId) {
        const data = await getQuotation(quotationId);
        setQuotation(data);
      }
    } catch (error) {
      console.error('Failed to load quotation:', error);
      alert('Failed to load quotation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!termsAccepted) {
      alert('Please accept the terms and conditions.');
      return;
    }

    if (!quotation) return;

    setIsProcessing(true);
    try {
      await acceptQuotation(quotation.id);
      setAccepted(true);
      setTimeout(() => {
        onComplete();
      }, 2000);
    } catch (error) {
      console.error('Failed to accept quotation:', error);
      alert('Failed to accept quotation. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRequestChanges = async () => {
    if (!quotation || !changeComments.trim()) {
      alert('Please provide comments for the requested changes.');
      return;
    }

    setIsProcessing(true);
    try {
      await requestQuotationChanges(quotation.id, changeComments);
      alert('Change request submitted. We will review and get back to you.');
      setShowChangeRequest(false);
      setChangeComments('');
    } catch (error) {
      console.error('Failed to request changes:', error);
      alert('Failed to submit change request. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <OnboardingLayout 
        currentStep={5} 
        totalSteps={7} 
        onContinue={onBack} 
        onSaveExit={onSaveExit}
        onBack={onBack}
        continueLabel="Go Back"
      >
        <p>Loading quotation...</p>
      </OnboardingLayout>
    );
  }

  if (accepted) {
    return (
      <OnboardingLayout 
        currentStep={5} 
        totalSteps={7} 
        onContinue={() => {}}
        onSaveExit={onSaveExit}
        onBack={onBack}
        hideActions={true}
      >
        <div className="text-center space-y-4 py-8">
          <div className="text-4xl mb-4">✓</div>
          <h1 className="text-2xl font-semibold">Quotation Accepted</h1>
          <p className="text-muted-foreground">
            Thank you for accepting the quotation. You will be redirected to the next step.
          </p>
        </div>
      </OnboardingLayout>
    );
  }

  if (!quotation) {
    return (
      <OnboardingLayout 
        currentStep={5} 
        totalSteps={7} 
        onContinue={onBack} 
        onSaveExit={onSaveExit}
        onBack={onBack}
        continueLabel="Go Back"
      >
        <p>No quotation found. Please go back and resubmit your request.</p>
      </OnboardingLayout>
    );
  }

  return (
    <OnboardingLayout
      currentStep={5}
      totalSteps={7}
      onContinue={() => {}}
      onSaveExit={onSaveExit}
      onBack={onBack}
      hideActions={true}
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold mb-2">Quotation</h1>
        </div>

        <Card>
          <CardContent className="p-6 space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Quote reference</p>
              <p className="font-semibold">{quotation.reference}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-2">Services included</p>
              <div className="space-y-2">
                {quotation.services.map((service, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>{service.name}</span>
                    <span className="font-medium">€{service.fee.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>€{quotation.totalFee.toFixed(2)}</span>
              </div>
            </div>

            <div className="pt-4 border-t">
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-1"
                />
                <span className="text-sm text-muted-foreground">
                  I accept the terms and conditions
                </span>
              </label>
            </div>

            {showChangeRequest ? (
              <div className="space-y-3 pt-4 border-t">
                <label className="text-sm font-medium block">Request changes</label>
                <textarea
                  value={changeComments}
                  onChange={(e) => setChangeComments(e.target.value)}
                  placeholder="Please describe the changes you'd like..."
                  rows={4}
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                />
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowChangeRequest(false);
                      setChangeComments('');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleRequestChanges}
                    disabled={isProcessing || !changeComments.trim()}
                  >
                    {isProcessing ? 'Submitting...' : 'Submit Request'}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowChangeRequest(true)}
                  disabled={isProcessing}
                >
                  Request changes
                </Button>
                <Button
                  onClick={handleAccept}
                  disabled={isProcessing || !termsAccepted}
                  className="flex-1"
                >
                  {isProcessing ? 'Processing...' : 'Accept quotation'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </OnboardingLayout>
  );
}

