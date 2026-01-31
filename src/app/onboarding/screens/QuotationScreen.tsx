'use client';

import { useState, useEffect } from 'react';
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout';
import { Card, CardContent } from '@/components/ui/card2';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/onboarding/StatusBadge';
import { Quotation } from '@/interfaces';
import { getQuotation, acceptQuotation, requestQuotationChanges, getIncorporationDocuments, uploadIncorporationDocument } from '@/api/onboardingService';

interface QuotationScreenProps {
  onComplete: () => void;
  onSaveExit: () => void;
  onBack: () => void;
}

interface IncorporationDocument {
  id: string;
  name: string;
  status: string;
  progress?: number;
}

export default function QuotationScreen({ onComplete, onSaveExit, onBack }: QuotationScreenProps) {
  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepted, setAccepted] = useState(false);
  const [showChangeRequest, setShowChangeRequest] = useState(false);
  const [changeComments, setChangeComments] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [incorporationDocuments, setIncorporationDocuments] = useState<IncorporationDocument[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [uploadingDocId, setUploadingDocId] = useState<string | null>(null);

  useEffect(() => {
    loadQuotation();
  }, []);

  const loadQuotation = async () => {
    try {
      // NEW WORKFLOW:
      // PATH A: Existing Company (incorporationStatus: false) → Service request created → Show quotation
      // PATH B: New Company Profile (incorporationStatus: true) → No service request → Skip quotation
      const onboardingData = JSON.parse(localStorage.getItem('onboarding-data') || '{}');
      const incorporationStatus = onboardingData.incorporationStatus;
      
      // PATH B: New Company Profile - already incorporated, no quotation needed
      if (incorporationStatus === true) {
        console.log('PATH B: New Company Profile - already incorporated. No quotation needed.');
        setLoading(false);
        // Allow user to proceed directly (quotation is not needed for new company profiles)
        return;
      }
      
      // PATH A: Existing Company → Incorporation Service → Load quotation
      const quotationId = localStorage.getItem('quotation-id');
      if (quotationId) {
        const data = await getQuotation(quotationId);
        setQuotation(data);
      } else {
        console.warn('No quotation ID found. Service request may not have been created yet.');
      }
    } catch (error) {
      console.error('Failed to load quotation:', error);
      // Don't show alert for missing quotations (may be expected for new company profiles)
    } finally {
      setLoading(false);
    }
  };

  const loadIncorporationDocuments = async () => {
    // PATH A: Load incorporation documents after quotation acceptance
    const incorporationCycleId = localStorage.getItem('incorporation-cycle-id');
    if (!incorporationCycleId) {
      console.log('No incorporation cycle ID found');
      return;
    }

    setLoadingDocs(true);
    try {
      const docs = await getIncorporationDocuments(incorporationCycleId);
      setIncorporationDocuments(Array.isArray(docs) ? docs : []);
    } catch (error: any) {
      console.error('Failed to load incorporation documents:', error);
      // Check if it's a 404 (document request not created yet) vs other error
      if (error.message?.includes('404') || error.message?.includes('Not Found')) {
        console.log('Document request not created yet by platform members');
        setIncorporationDocuments([]);
      } else {
        setIncorporationDocuments([]);
      }
    } finally {
      setLoadingDocs(false);
    }
  };

  const handleDocumentUpload = async (documentId: string, file: File) => {
    const incorporationCycleId = localStorage.getItem('incorporation-cycle-id');
    if (!incorporationCycleId) {
      alert('Incorporation cycle ID not found. Please try again.');
      return;
    }

    setUploadingDocId(documentId);
    try {
      await uploadIncorporationDocument(incorporationCycleId, documentId, file);
      // Reload documents after upload
      await loadIncorporationDocuments();
      alert('Document uploaded successfully!');
    } catch (error: any) {
      console.error('Failed to upload document:', error);
      alert(`Failed to upload document: ${error.message || 'Please try again.'}`);
    } finally {
      setUploadingDocId(null);
      // Reset file input
      const fileInput = document.getElementById(`incorp-file-${documentId}`) as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
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
      
      // PATH A: After quotation acceptance, load incorporation documents
      const onboardingData = JSON.parse(localStorage.getItem('onboarding-data') || '{}');
      const incorporationStatus = onboardingData.incorporationStatus;
      
      if (incorporationStatus === false) {
        // PATH A: Existing Company → Incorporation Service - load incorporation documents
        await loadIncorporationDocuments();
      }
    } catch (error) {
      console.error('Failed to accept quotation:', error);
      alert('Failed to accept quotation. Please try again.');
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
        currentStep={6} 
        totalSteps={8} 
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
    // PATH A: Show incorporation documents after quotation acceptance
    const onboardingData = JSON.parse(localStorage.getItem('onboarding-data') || '{}');
    const incorporationStatus = onboardingData.incorporationStatus;
    const isPathA = incorporationStatus === false;

    return (
      <OnboardingLayout 
        currentStep={6} 
        totalSteps={8} 
        onContinue={onComplete}
        onSaveExit={onSaveExit}
        onBack={onBack}
        continueLabel="Continue to KYC"
      >
        <div className="space-y-6">
          <div className="text-center space-y-4 py-4">
          <div className="text-4xl mb-4">✓</div>
          <h1 className="text-2xl font-semibold">Quotation Accepted</h1>
          <p className="text-muted-foreground">
              Thank you for accepting the quotation.
            </p>
          </div>

          {isPathA && (
            <Card>
              <CardContent className="p-6 space-y-4">
                <div>
                  <h2 className="text-xl font-semibold mb-2">Incorporation Documents</h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    Please upload the required incorporation documents for the services you selected.
                  </p>
                </div>

                {loadingDocs ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-muted-foreground">Loading document requests...</p>
                  </div>
                ) : incorporationDocuments.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-muted-foreground mb-2">
                      Document requests have not been created yet by our team.
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Our platform team will create document requests for you shortly. You'll be able to upload documents once they're ready.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={loadIncorporationDocuments}
                      className="mt-4"
                    >
                      Refresh
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {incorporationDocuments.map((doc) => (
                      <Card key={doc.id}>
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">{doc.name}</p>
                                <StatusBadge status={doc.status as any} className="mt-2" />
                              </div>
                            </div>

                            {doc.status === 'pending' && (
                              <div>
                                <input
                                  type="file"
                                  id={`incorp-file-${doc.id}`}
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      handleDocumentUpload(doc.id, file);
                                    }
                                  }}
                                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                  disabled={uploadingDocId === doc.id}
                                />
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => {
                                    const fileInput = document.getElementById(`incorp-file-${doc.id}`) as HTMLInputElement;
                                    if (fileInput && !uploadingDocId) {
                                      fileInput.click();
                                    }
                                  }}
                                  disabled={uploadingDocId === doc.id}
                                >
                                  {uploadingDocId === doc.id ? 'Uploading...' : 'Upload'}
                                </Button>
                              </div>
                            )}

                            {doc.status === 'uploaded' && doc.progress !== undefined && (
                              <div>
                                <div className="w-full bg-muted rounded-full h-2 mb-2">
                                  <div
                                    className="bg-primary h-2 rounded-full transition-all"
                                    style={{ width: `${doc.progress}%` }}
                                  />
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  {doc.progress}% complete
                                </p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </OnboardingLayout>
    );
  }

  // NEW WORKFLOW:
  // PATH A: Existing Company (incorporationStatus: false) → Quotation should exist
  // PATH B: New Company Profile (incorporationStatus: true) → No quotation needed
  const onboardingData = JSON.parse(localStorage.getItem('onboarding-data') || '{}');
  const incorporationStatus = onboardingData.incorporationStatus;

  if (!quotation) {
    // PATH B: New Company Profile - quotation is not needed - allow proceeding
    if (incorporationStatus === true) {
      return (
        <OnboardingLayout 
          currentStep={6} 
          totalSteps={8} 
          onContinue={onComplete} 
          onSaveExit={onSaveExit}
          onBack={onBack}
          continueLabel="Continue"
        >
          <div className="text-center space-y-4 py-8">
            <div className="text-4xl mb-4">✓</div>
            <h1 className="text-2xl font-semibold">New Company Profile</h1>
            <p className="text-muted-foreground">
              Your company profile has been created. No quotation is needed. You can proceed to the KYC verification step.
            </p>
          </div>
        </OnboardingLayout>
      );
    }
    
    // PATH A: Existing Company → Incorporation Service → Quotation should exist - show error
    return (
      <OnboardingLayout 
        currentStep={6} 
        totalSteps={8} 
        onContinue={onBack} 
        onSaveExit={onSaveExit}
        onBack={onBack}
        continueLabel="Go Back"
      >
        <div className="text-center space-y-4 py-8">
          <p className="text-muted-foreground">No quotation found. Please go back and resubmit your incorporation service request.</p>
        </div>
      </OnboardingLayout>
    );
  }

  // Ensure services array exists
  const services = quotation.services || [];

  return (
    <OnboardingLayout
      currentStep={6}
      totalSteps={8}
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
                {services.length > 0 ? (
                  services.map((service, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{service.name}</span>
                      <span className="font-medium">€{service.fee.toFixed(2)}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No services listed</p>
                )}
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span>€{quotation.totalFee.toFixed(2)}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Final pricing may vary based on specific requirements. Our team will confirm the exact amount before proceeding.
              </p>
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

