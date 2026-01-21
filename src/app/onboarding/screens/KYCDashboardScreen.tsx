'use client';

import { useState, useEffect } from 'react';
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout';
import { Card, CardContent } from '@/components/ui/card2';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/onboarding/StatusBadge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { KYCPerson, KYCCompanyDocument } from '@/interfaces';
import { 
  getKYCPersons, 
  inviteKYCPerson, 
  getKYCCompanyDocuments, 
  uploadKYCCompanyDocument 
} from '@/api/onboardingService';
import { saveOnboardingStep } from '@/api/onboardingService';
import { OnboardingProgress } from '@/interfaces';

interface KYCDashboardScreenProps {
  onComplete: () => void;
  onSaveExit: () => void;
  onBack?: () => void;
}

export default function KYCDashboardScreen({ onComplete, onSaveExit }: KYCDashboardScreenProps) {
  const [activeTab, setActiveTab] = useState<'people' | 'company'>('people');
  const [people, setPeople] = useState<KYCPerson[]>([]);
  const [companyDocuments, setCompanyDocuments] = useState<KYCCompanyDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [peopleData, documentsData] = await Promise.all([
        getKYCPersons(),
        getKYCCompanyDocuments(),
      ]);
      setPeople(peopleData);
      setCompanyDocuments(documentsData);
    } catch (error) {
      console.error('Failed to load KYC data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (personId: string) => {
    try {
      await inviteKYCPerson(personId);
      await loadData(); // Refresh data
    } catch (error) {
      console.error('Failed to invite person:', error);
      alert('Failed to send invite. Please try again.');
    }
  };

  const handleDocumentUpload = async (documentId: string, file: File) => {
    try {
      await uploadKYCCompanyDocument(documentId, file);
      await loadData(); // Refresh data
      alert('Document uploaded successfully.');
    } catch (error) {
      console.error('Failed to upload document:', error);
      alert('Failed to upload document. Please try again.');
    }
  };

  const handleContinue = async () => {
    // Mark onboarding as complete
    try {
      // Mark as completed in localStorage immediately
      const completedProgress: OnboardingProgress = {
        onboardingStatus: 'completed',
        currentStep: 7,
        completedSteps: [1, 2, 3, 4, 5, 6, 7],
      };
      localStorage.setItem('onboarding-progress', JSON.stringify(completedProgress));
      
      // Try to save to backend (will fallback silently if unavailable)
      try {
        await saveOnboardingStep(7, {});
      } catch (error: any) {
        // Silently handle backend errors - localStorage is already saved
        if (error.message !== "BACKEND_NOT_AVAILABLE") {
          console.warn('Backend save failed, using localStorage:', error.message);
        }
      }
      
      // Navigate to dashboard
      if (typeof window !== 'undefined') {
        window.location.href = '/dashboard';
      } else {
        onComplete();
      }
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
      // Even on error, mark as complete in localStorage and proceed
      const completedProgress: OnboardingProgress = {
        onboardingStatus: 'completed',
        currentStep: 7,
        completedSteps: [1, 2, 3, 4, 5, 6, 7],
      };
      localStorage.setItem('onboarding-progress', JSON.stringify(completedProgress));
      // Navigate to dashboard
      if (typeof window !== 'undefined') {
        window.location.href = '/dashboard';
      } else {
        onComplete();
      }
    }
  };

  if (loading) {
    return (
      <OnboardingLayout currentStep={7} totalSteps={7} onContinue={onComplete} onSaveExit={onSaveExit}>
        <p>Loading KYC dashboard...</p>
      </OnboardingLayout>
    );
  }

  return (
    <OnboardingLayout
      currentStep={7}
      totalSteps={7}
      onContinue={handleContinue}
      onSaveExit={onSaveExit}
      continueLabel="Complete Onboarding"
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold mb-2">KYC Dashboard</h1>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'people' | 'company')}>
          <TabsList>
            <TabsTrigger value="people">People</TabsTrigger>
            <TabsTrigger value="company">Company</TabsTrigger>
          </TabsList>

          <TabsContent value="people" className="space-y-4">
            {people.length === 0 ? (
              <p className="text-sm text-muted-foreground">No people found.</p>
            ) : (
              <div className="space-y-3">
                {people.map((person) => (
                  <Card key={person.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <p className="font-medium">{person.name}</p>
                            <StatusBadge status={person.status} />
                          </div>
                          <p className="text-sm text-muted-foreground capitalize">{person.role}</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleInvite(person.id)}
                          disabled={person.status === 'completed' || person.status === 'in_progress'}
                        >
                          {person.status === 'pending' ? 'Invite' : 'Resend'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="company" className="space-y-4">
            {companyDocuments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No documents required.</p>
            ) : (
              <div className="space-y-3">
                {companyDocuments.map((doc) => (
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
                              id={`file-${doc.id}`}
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  handleDocumentUpload(doc.id, file);
                                }
                              }}
                              accept=".pdf,.jpg,.jpeg,.png"
                            />
                            <label htmlFor={`file-${doc.id}`}>
                              <Button variant="outline" size="sm" asChild>
                                <span>Upload</span>
                              </Button>
                            </label>
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
          </TabsContent>
        </Tabs>
      </div>
    </OnboardingLayout>
  );
}

