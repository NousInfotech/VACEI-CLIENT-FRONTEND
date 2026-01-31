'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout';
import { Card, CardContent } from '@/components/ui/card2';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/onboarding/StatusBadge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AlertMessage from '@/components/AlertMessage';
import { KYCPerson, KYCCompanyDocument } from '@/interfaces';
import { 
  getKYCPersons, 
  inviteKYCPerson, 
  getKYCCompanyDocuments, 
  uploadKYCCompanyDocument,
  getIncorporationDocuments,
  uploadIncorporationDocument
} from '@/api/onboardingService';
import { OnboardingProgress } from '@/interfaces';

interface KYCDashboardScreenProps {
  onComplete: () => void;
  onSaveExit: () => void;
  onBack?: () => void;
}

export default function KYCDashboardScreen({ onComplete, onSaveExit }: KYCDashboardScreenProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'people' | 'company' | 'incorporation'>('people');
  const [people, setPeople] = useState<KYCPerson[]>([]);
  const [companyDocuments, setCompanyDocuments] = useState<KYCCompanyDocument[]>([]);
  const [incorporationDocuments, setIncorporationDocuments] = useState<KYCCompanyDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCompleting, setIsCompleting] = useState(false); // Loading state for "Complete Onboarding" button
  const [errorMessage, setErrorMessage] = useState<{ message: string; variant: 'danger' | 'warning' | 'info' | 'success' } | null>(null);
  const [isUserExists, setIsUserExists] = useState(false);
  const [uploadingDocId, setUploadingDocId] = useState<string | null>(null); // Track which document is being uploaded
  // Initialize incorporationStatus from localStorage to avoid null state
  const [incorporationStatus, setIncorporationStatus] = useState<boolean | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const onboardingData = JSON.parse(localStorage.getItem('onboarding-data') || '{}');
        return onboardingData.incorporationStatus === true ? true : null; // null means not yet determined or false
      } catch {
        return null;
      }
    }
    return null;
  }); // Track if company needs incorporation
  // Default documents state
  const [defaultKycDocuments, setDefaultKycDocuments] = useState<Array<{ id: string; name: string; status: 'pending' | 'uploaded' }>>([
    { id: 'default-company-profile', name: 'Company Profile', status: 'pending' },
    { id: 'default-supporting-documents', name: 'Supporting Documents', status: 'pending' },
  ]);
  const [defaultIncorporationDocuments, setDefaultIncorporationDocuments] = useState<Array<{ id: string; name: string; status: 'pending' | 'uploaded' }>>([
    { id: 'default-company-profile-incorp', name: 'Company Profile', status: 'pending' },
    { id: 'default-supporting-documents-incorp', name: 'Supporting Documents', status: 'pending' },
  ]);

  useEffect(() => {
    // Load default documents from localStorage on mount
    const storedKycDocs = localStorage.getItem('default-kyc-documents');
    if (storedKycDocs) {
      try {
        const parsed = JSON.parse(storedKycDocs);
        if (Array.isArray(parsed)) {
          setDefaultKycDocuments(parsed);
        }
      } catch (e) {
        console.warn('Failed to parse stored default KYC documents:', e);
      }
    }

    const storedIncorpDocs = localStorage.getItem('default-incorporation-documents');
    if (storedIncorpDocs) {
      try {
        const parsed = JSON.parse(storedIncorpDocs);
        if (Array.isArray(parsed)) {
          setDefaultIncorporationDocuments(parsed);
        }
      } catch (e) {
        console.warn('Failed to parse stored default incorporation documents:', e);
      }
    }

    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Get companyId from localStorage
      const onboardingData = JSON.parse(localStorage.getItem('onboarding-data') || '{}');
      const companyId = onboardingData.companyId;
      
      if (!companyId) {
        console.error('Company ID not found');
        setLoading(false);
        return;
      }

      // Load default documents from localStorage if they exist
      const storedKycDocs = localStorage.getItem('default-kyc-documents');
      if (storedKycDocs) {
        try {
          const parsed = JSON.parse(storedKycDocs);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setDefaultKycDocuments(parsed);
          }
        } catch (e) {
          console.warn('Failed to parse stored default KYC documents:', e);
        }
      }

      const storedIncorpDocs = localStorage.getItem('default-incorporation-documents');
      if (storedIncorpDocs) {
        try {
          const parsed = JSON.parse(storedIncorpDocs);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setDefaultIncorporationDocuments(parsed);
          }
        } catch (e) {
          console.warn('Failed to parse stored default incorporation documents:', e);
        }
      }

      // IMPORTANT: Check actual company status from backend API
      // This ensures we get the latest incorporationStatus (which may have been updated by platform members)
      // Use onboarding data as initial value (set during company creation)
      let actualIncorporationStatus: boolean = onboardingData.incorporationStatus === true;
      let incorporationCycleId: string | null = null;
      
      try {
        const backendUrl = process.env.NEXT_PUBLIC_VACEI_BACKEND_URL?.replace(/\/?$/, "/") || "http://localhost:5000/api/v1/";
        const token = localStorage.getItem('token');
        
        const companyResponse = await fetch(`${backendUrl}companies/${companyId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (companyResponse.ok) {
          const companyData = await companyResponse.json();
          const company = companyData.data || companyData;
          
          // Get actual incorporation status from backend
          actualIncorporationStatus = company.incorporationStatus === true;
          
          // Get incorporation cycle ID from the first active incorporation cycle
          if (company.incorporationCycles && company.incorporationCycles.length > 0) {
            const activeCycle = company.incorporationCycles.find((cycle: any) => 
              cycle.status === 'PENDING' || cycle.status === 'IN_PROGRESS' || cycle.status === 'COMPLETED'
            );
            if (activeCycle) {
              incorporationCycleId = activeCycle.id;
              // Store it in localStorage for future use
              localStorage.setItem('incorporation-cycle-id', activeCycle.id);
            }
          }
          
          // Update localStorage with actual status
          localStorage.setItem('onboarding-data', JSON.stringify({
            ...onboardingData,
            incorporationStatus: actualIncorporationStatus,
          }));
        } else {
          // Fallback to localStorage if API call fails
          console.warn('Failed to fetch company status, using localStorage value');
          actualIncorporationStatus = onboardingData.incorporationStatus === true;
          incorporationCycleId = localStorage.getItem('incorporation-cycle-id');
        }
      } catch (apiError) {
        // Fallback to localStorage if API call fails
        console.warn('Error fetching company status, using localStorage value:', apiError);
        actualIncorporationStatus = onboardingData.incorporationStatus === true;
        incorporationCycleId = localStorage.getItem('incorporation-cycle-id');
      }
      
      setIncorporationStatus(actualIncorporationStatus);
      
      // NEW WORKFLOW:
      // PATH A: Existing Company (incorporationStatus: false) → Needs incorporation → KYC available after incorporation
      // PATH B: New Company Profile (incorporationStatus: true) → Already incorporated → KYC available directly
      let peopleData: KYCPerson[] = [];
      let documentsData: KYCCompanyDocument[] = [];
      
      if (actualIncorporationStatus === true) {
        // PATH B: New Company Profile - already incorporated - KYC cycle should exist or can be created
        try {
          [peopleData, documentsData] = await Promise.all([
        getKYCPersons(),
        getKYCCompanyDocuments(),
      ]);
        } catch (kycError) {
          console.warn('Failed to load KYC data (may not be available yet):', kycError);
          // Set empty arrays if KYC data can't be loaded
          peopleData = [];
          documentsData = [];
        }
      } else {
        // PATH A: Existing Company → Incorporation Service (incorporationStatus: false)
        // KYC cycle is only created AFTER incorporation is completed
        // However, we can still show people (directors/shareholders) that were added during company creation
        // KYC documents will be available after incorporation is completed
        console.log('PATH A: Existing Company needs incorporation service. Loading people data (KYC documents will be available after incorporation is completed).');
        try {
          // Try to fetch people from backend (involvements created during company creation)
          peopleData = await getKYCPersons();
        } catch (kycError) {
          console.warn('Failed to load people data (may not be available yet):', kycError);
          // Set empty array if people data can't be loaded
          peopleData = [];
        }
        // KYC company documents are not available until incorporation is completed
        documentsData = [];
      }
      
      // Ensure both are arrays
      setPeople(Array.isArray(peopleData) ? peopleData : []);
      setCompanyDocuments(Array.isArray(documentsData) ? documentsData : []);
      
      // NEW WORKFLOW:
      // PATH A: Existing Company (incorporationStatus: false) → Load incorporation documents if cycle exists
      // PATH B: New Company Profile (incorporationStatus: true) → No incorporation cycle, no documents
      if (actualIncorporationStatus === false && incorporationCycleId) {
        // PATH A: Existing Company → Incorporation Service → Load incorporation documents
        try {
          console.log('PATH A: Loading incorporation documents for cycle:', incorporationCycleId);
          const incorporationDocs = await getIncorporationDocuments(incorporationCycleId);
          console.log('Incorporation documents loaded:', incorporationDocs);
          setIncorporationDocuments(Array.isArray(incorporationDocs) ? incorporationDocs : []);
        } catch (incorpError: any) {
          console.error('Failed to load incorporation documents:', incorpError);
          // Check if it's a 404 (document request not created yet) vs other error
          if (incorpError.message?.includes('404') || incorpError.message?.includes('Not Found')) {
            // Document request hasn't been created by platform members yet
            console.log('Document request not created yet by platform members');
            setIncorporationDocuments([]);
          } else {
            // Other error - set empty array
            setIncorporationDocuments([]);
          }
        }
      } else {
        // PATH B: New Company Profile - no incorporation cycle needed
        // OR PATH A: No incorporation cycle yet
        console.log(actualIncorporationStatus === true 
          ? 'PATH B: New Company Profile - no incorporation cycle needed'
          : 'PATH A: No incorporation cycle ID found yet');
        setIncorporationDocuments([]);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      // Set empty arrays on error
      setPeople([]);
      setCompanyDocuments([]);
      setIncorporationDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (personId: string) => {
    try {
      await inviteKYCPerson(personId);
      await loadData(); // Refresh data
      setErrorMessage({ message: 'Invite sent successfully.', variant: 'success' });
      setTimeout(() => setErrorMessage(null), 3000);
    } catch (error) {
      console.error('Failed to invite person:', error);
      setErrorMessage({ message: 'Failed to send invite. Please try again.', variant: 'danger' });
    }
  };

  const handleDocumentUpload = async (documentId: string, file: File) => {
    setUploadingDocId(documentId);
    try {
      console.log('Uploading KYC document:', { documentId, fileName: file.name });
      await uploadKYCCompanyDocument(documentId, file);
      await loadData(); // Refresh data
      setErrorMessage({ message: 'Document uploaded successfully.', variant: 'success' });
      setTimeout(() => setErrorMessage(null), 3000);
    } catch (error: any) {
      console.error('Failed to upload document:', error);
      const errorMsg = error.message || 'Failed to upload document. Please try again.';
      setErrorMessage({ message: errorMsg, variant: 'danger' });
    } finally {
      setUploadingDocId(null);
      // Reset file input
      const fileInput = document.getElementById(`file-${documentId}`) as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    }
  };

  const handleIncorporationDocumentUpload = async (documentId: string, file: File) => {
    const incorporationCycleId = localStorage.getItem('incorporation-cycle-id');
    if (!incorporationCycleId) {
      setErrorMessage({ 
        message: 'Incorporation cycle not found. Please complete the service request submission first.', 
        variant: 'warning' 
      });
      return;
    }

    setUploadingDocId(documentId);
    try {
      console.log('Uploading incorporation document:', { incorporationCycleId, documentId, fileName: file.name });
      await uploadIncorporationDocument(incorporationCycleId, documentId, file);
      await loadData(); // Refresh data
      setErrorMessage({ message: 'Incorporation document uploaded successfully.', variant: 'success' });
      setTimeout(() => setErrorMessage(null), 3000);
    } catch (error: any) {
      console.error('Failed to upload incorporation document:', error);
      const errorMsg = error.message || 'Failed to upload document. Please try again.';
      setErrorMessage({ message: errorMsg, variant: 'danger' });
    } finally {
      setUploadingDocId(null);
      // Reset file input
      const fileInput = document.getElementById(`incorp-file-${documentId}`) as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    }
  };

  // Handle default KYC document upload
  const handleDefaultKycDocumentUpload = async (documentId: string, file: File) => {
    setUploadingDocId(documentId);
    try {
      const backendUrl = process.env.NEXT_PUBLIC_VACEI_BACKEND_URL?.replace(/\/?$/, "/") || "http://localhost:5000/api/v1/";
      const token = localStorage.getItem('token');
      const onboardingData = JSON.parse(localStorage.getItem('onboarding-data') || '{}');
      const companyId = onboardingData.companyId;

      if (!companyId) {
        throw new Error('Company ID not found');
      }

      // Upload to library first
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folderId', companyId); // Use companyId as folderId
      formData.append('tags', JSON.stringify(['kyc', 'default', documentId]));

      const uploadResponse = await fetch(`${backendUrl}library/files/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file to library');
      }

      // Update local state
      setDefaultKycDocuments(prev => 
        prev.map(doc => doc.id === documentId ? { ...doc, status: 'uploaded' as const } : doc)
      );

      // Store in localStorage to persist across refreshes
      const stored = localStorage.getItem('default-kyc-documents');
      const storedDocs = stored ? JSON.parse(stored) : defaultKycDocuments;
      const updatedDocs = storedDocs.map((doc: any) => 
        doc.id === documentId ? { ...doc, status: 'uploaded' } : doc
      );
      localStorage.setItem('default-kyc-documents', JSON.stringify(updatedDocs));

      setErrorMessage({ message: 'Document uploaded successfully.', variant: 'success' });
      setTimeout(() => setErrorMessage(null), 3000);
    } catch (error: any) {
      console.error('Failed to upload default KYC document:', error);
      const errorMsg = error.message || 'Failed to upload document. Please try again.';
      setErrorMessage({ message: errorMsg, variant: 'danger' });
    } finally {
      setUploadingDocId(null);
      // Reset file input
      const fileInput = document.getElementById(`default-kyc-file-${documentId}`) as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    }
  };

  // Handle default incorporation document upload
  const handleDefaultIncorporationDocumentUpload = async (documentId: string, file: File) => {
    setUploadingDocId(documentId);
    try {
      const backendUrl = process.env.NEXT_PUBLIC_VACEI_BACKEND_URL?.replace(/\/?$/, "/") || "http://localhost:5000/api/v1/";
      const token = localStorage.getItem('token');
      const onboardingData = JSON.parse(localStorage.getItem('onboarding-data') || '{}');
      const companyId = onboardingData.companyId;

      if (!companyId) {
        throw new Error('Company ID not found');
      }

      // Upload to library first
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folderId', companyId); // Use companyId as folderId
      formData.append('tags', JSON.stringify(['incorporation', 'default', documentId]));

      const uploadResponse = await fetch(`${backendUrl}library/files/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file to library');
      }

      // Update local state
      setDefaultIncorporationDocuments(prev => 
        prev.map(doc => doc.id === documentId ? { ...doc, status: 'uploaded' as const } : doc)
      );

      // Store in localStorage to persist across refreshes
      const stored = localStorage.getItem('default-incorporation-documents');
      const storedDocs = stored ? JSON.parse(stored) : defaultIncorporationDocuments;
      const updatedDocs = storedDocs.map((doc: any) => 
        doc.id === documentId ? { ...doc, status: 'uploaded' } : doc
      );
      localStorage.setItem('default-incorporation-documents', JSON.stringify(updatedDocs));

      setErrorMessage({ message: 'Document uploaded successfully.', variant: 'success' });
      setTimeout(() => setErrorMessage(null), 3000);
    } catch (error: any) {
      console.error('Failed to upload default incorporation document:', error);
      const errorMsg = error.message || 'Failed to upload document. Please try again.';
      setErrorMessage({ message: errorMsg, variant: 'danger' });
    } finally {
      setUploadingDocId(null);
      // Reset file input
      const fileInput = document.getElementById(`default-incorp-file-${documentId}`) as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    }
  };

  const handleContinue = async () => {
    // CRITICAL: Set loading state IMMEDIATELY when button is clicked
    setIsCompleting(true);
    setErrorMessage(null); // Clear any previous errors
    
    // Complete sign-up: Create User, Client, and Company records
    try {
      // Get user registration data from localStorage (temporary storage during onboarding)
      const onboardingDataStr = localStorage.getItem('onboarding-data');
      if (!onboardingDataStr) {
        setIsCompleting(false);
        setErrorMessage({ message: 'Onboarding data not found. Please start over.', variant: 'danger' });
        return;
      }

      const onboardingData = JSON.parse(onboardingDataStr);
      
      // Validate required user data
      if (!onboardingData.email || !onboardingData.password || !onboardingData.firstName || !onboardingData.lastName) {
        setIsCompleting(false);
        setErrorMessage({ 
          message: 'Missing required information. Please go back to step 1 to complete your registration.', 
          variant: 'warning' 
        });
        return;
      }

      // Verify records exist (they should be created in Step 1 and Step 3)
      const userId = onboardingData.userId;
      const clientId = onboardingData.clientId;
      const companyId = onboardingData.companyId;

      if (!userId || !clientId) {
        throw new Error('User and Client records not found. Please complete Step 1 first.');
      }

      // Ensure token exists - it should be stored from Step 1 auto-login
      let token = localStorage.getItem('token');
      
      // If token doesn't exist, log in again to get it
      if (!token) {
        console.log('Token not found, logging in to get token...');
        try {
          const backendUrl = process.env.NEXT_PUBLIC_VACEI_BACKEND_URL?.replace(/\/?$/, "/") || "http://localhost:5000/api/v1/";
          const loginResponse = await fetch(`${backendUrl}auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
        email: onboardingData.email,
        password: onboardingData.password,
            }),
            credentials: 'include',
          });

          if (loginResponse.ok) {
            const loginResult = await loginResponse.json();
            token = loginResult.data?.token || loginResult.token || loginResult.data?.data?.token;
            
            if (token) {
              localStorage.setItem('token', token);
              localStorage.setItem('email', btoa(onboardingData.email));
              localStorage.setItem('user_id', btoa(userId));
              localStorage.setItem('username', btoa(`${onboardingData.firstName} ${onboardingData.lastName}`));
              
              const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
              const cookieOptions = isHttps 
                ? 'SameSite=None; Secure; Path=/; Max-Age=86400'
                : 'SameSite=Lax; Path=/; Max-Age=86400';
              
              if (typeof document !== 'undefined') {
                document.cookie = `client-token=${encodeURIComponent(token)}; ${cookieOptions}`;
              }
              console.log('✅ Token stored successfully after login');
            } else {
              throw new Error('Login succeeded but no token received');
            }
          } else {
            throw new Error('Failed to login to get token');
          }
        } catch (loginError) {
          console.error('Failed to get token:', loginError);
          throw new Error('Failed to authenticate. Please try logging in manually.');
        }
      }

      // Store company ID and company data before clearing onboarding data (for dashboard company selection)
      if (companyId) {
        localStorage.setItem('vacei-active-company', companyId);
        
        // Also fetch and store company details immediately so it's available on dashboard
        try {
          const backendUrl = process.env.NEXT_PUBLIC_VACEI_BACKEND_URL?.replace(/\/?$/, "/") || "http://localhost:5000/api/v1/";
          const companyResponse = await fetch(`${backendUrl}companies/${companyId}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            credentials: 'include',
          });

          if (companyResponse.ok) {
            const companyResult = await companyResponse.json();
            const companyData = companyResult.data || companyResult;
            
            // Store company in companies array format for dashboard
            const companyForStorage = {
              id: companyData.id,
              name: companyData.name,
              registrationNumber: companyData.registrationNumber,
            };
            
            // Store as array (even if single company) to match dashboard expectations
            localStorage.setItem('vacei-companies', JSON.stringify([companyForStorage]));
            console.log('✅ Company stored in localStorage for dashboard:', companyForStorage);
          } else {
            console.warn('Failed to fetch company details, will be fetched on dashboard load');
          }
        } catch (error) {
          console.warn('Error fetching company details, will be fetched on dashboard load:', error);
        }
      }

      // Mark onboarding as completed
      const completedProgress: OnboardingProgress = {
        onboardingStatus: 'completed',
        currentStep: 7,
        completedSteps: [1, 2, 3, 4, 5, 6, 7],
      };
      localStorage.setItem('onboarding-progress', JSON.stringify(completedProgress));

      // Clear onboarding data (but keep token and user info)
      localStorage.removeItem('onboarding-data');
      localStorage.removeItem('quotation-id');
      localStorage.removeItem('kyc-invites');
      localStorage.removeItem('kyc-uploads');
      
      // CRITICAL: Navigate to dashboard IMMEDIATELY after successful completion
      console.log('✅ Onboarding completed successfully. Navigating to dashboard.', {
        userId: userId,
        clientId: clientId,
        companyId: companyId,
        hasToken: !!token,
      });
      
      // Force navigation to dashboard - this ensures the user is redirected after successful onboarding
      // Using window.location.href ensures a full page reload and proper auth initialization
      if (typeof window !== 'undefined') {
        // Set signup completion flag to trigger company refresh in TopHeader
        sessionStorage.setItem('signup-completed', 'true');
        // Full page reload ensures middleware/auth is properly initialized
        window.location.href = '/dashboard';
      } else {
        // Fallback for SSR
        sessionStorage.setItem('signup-completed', 'true');
        router.push('/dashboard');
      }
      // Note: Don't set isCompleting to false here - navigation will happen immediately
    } catch (error: any) {
      // CRITICAL: Set loading to false IMMEDIATELY on error and show error toast
      setIsCompleting(false);
      console.error('Failed to complete sign-up:', error);
      const errorMsg = error.message || 'Failed to complete sign-up. Please try again.';
      
      // Check if user already exists
      if (errorMsg.toLowerCase().includes('already exists') || errorMsg.toLowerCase().includes('user with this')) {
        setIsUserExists(true);
        setErrorMessage({
          message: 'An account with this email or phone number already exists. Would you like to log in instead?',
          variant: 'warning',
        });
      } else {
        setErrorMessage({
          message: errorMsg,
          variant: 'danger',
        });
      }
    }
  };

  const handleGoToLogin = () => {
    // Clear onboarding data and redirect to login
    localStorage.removeItem('onboarding-data');
    localStorage.removeItem('onboarding-progress');
    router.push('/login');
  };

  if (loading) {
    return (
      <OnboardingLayout currentStep={7} totalSteps={7} onContinue={onComplete} onSaveExit={onSaveExit}>
        <p>Loading KYC dashboard...</p>
      </OnboardingLayout>
    );
  }

  return (
    <>
      {/* Toast notification - rendered outside layout for proper positioning */}
      {errorMessage && (
        <AlertMessage
          message={errorMessage.message}
          variant={errorMessage.variant}
          onClose={() => {
            setErrorMessage(null);
            setIsUserExists(false);
          }}
          duration={isUserExists ? 0 : 6000} // Don't auto-close if user exists, let them choose
        />
      )}
      
      {/* Loading overlay - shown when completing onboarding */}
      {isCompleting && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-8 shadow-xl max-w-md mx-4">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
              <h3 className="text-lg font-semibold mb-2">Completing Onboarding...</h3>
              <p className="text-sm text-muted-foreground">
                Please wait while we create your account and set everything up.
              </p>
            </div>
          </div>
        </div>
      )}
      
      <OnboardingLayout
        currentStep={7}
        totalSteps={7}
        onContinue={handleContinue}
        onSaveExit={onSaveExit}
        continueLabel={isCompleting ? 'Completing onboarding...' : 'Complete Onboarding'}
        disabled={isCompleting} // Disable button when completing
      >
        <div className="space-y-6">
          {/* Action buttons for user exists error - shown inline */}
          {errorMessage && isUserExists && (
            <div className="flex gap-2 p-4 bg-warning/10 border border-warning/30 rounded-lg">
              <Button
                onClick={handleGoToLogin}
                className="bg-primary text-primary-foreground"
              >
                Go to Login
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setErrorMessage(null);
                  setIsUserExists(false);
                }}
              >
                Use Different Email
              </Button>
            </div>
          )}
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold mb-2">KYC Dashboard</h1>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setLoading(true);
                loadData();
              }}
              disabled={loading}
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'people' | 'company' | 'incorporation')}>
          <TabsList>
            <TabsTrigger value="people">People</TabsTrigger>
            <TabsTrigger value="company">Company</TabsTrigger>
            <TabsTrigger value="incorporation">Incorporation</TabsTrigger>
          </TabsList>

          <TabsContent value="people" className="space-y-4">
            {/* New Company Profile path (incorporationStatus === true) - original logic */}
            {incorporationStatus === true ? (
              people.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground mb-2">
                    No people found for KYC verification.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    People will appear here once they are added to your company or KYC verification is initiated.
                  </p>
                </div>
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
              )
            ) : (
              /* Existing Company path (incorporationStatus === false) - match New Company Profile exactly */
              people.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground mb-2">
                    No people found for KYC verification.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    People will appear here once they are added to your company or KYC verification is initiated.
                  </p>
                </div>
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
              )
            )}
          </TabsContent>

          <TabsContent value="company" className="space-y-4">
            {incorporationStatus === false ? (
              // PATH A: Existing Company → Incorporation Service - KYC documents only available after incorporation
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground mb-2">
                  KYC documents will be available after incorporation is completed.
                </p>
                <p className="text-xs text-muted-foreground">
                  Please complete the incorporation service process first. You can upload incorporation documents in the "Incorporation" tab.
                </p>
              </div>
            ) : (incorporationStatus === true || incorporationStatus === null) && companyDocuments.length === 0 ? (
              // Existing company or incorporation completed, but no documents yet
              <div className="space-y-4">
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground mb-2">
                    {incorporationStatus === true 
                      ? 'Document requests have not been created yet by our team.'
                      : 'No KYC documents required at this time.'}
                  </p>
                  {incorporationStatus === true && (
                    <p className="text-xs text-muted-foreground">
                      Our platform team will create KYC document requests for you shortly. You'll be able to upload documents once they're ready.
                    </p>
                  )}
                </div>

                {/* Default Documents Section - Show for PATH B (New Company Profile) */}
                {incorporationStatus !== false && defaultKycDocuments.length > 0 && (
                  <div className="space-y-3">
                    {defaultKycDocuments.map((doc) => (
                      <Card key={doc.id}>
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">{doc.name}</p>
                                <StatusBadge status={doc.status === 'uploaded' ? 'uploaded' : 'pending'} className="mt-2" />
                              </div>
                            </div>

                            {doc.status === 'pending' && (
                              <div>
                                <input
                                  type="file"
                                  id={`default-kyc-file-${doc.id}`}
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      handleDefaultKycDocumentUpload(doc.id, file);
                                    }
                                  }}
                                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                  disabled={uploadingDocId === doc.id}
                                />
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => {
                                    const fileInput = document.getElementById(`default-kyc-file-${doc.id}`) as HTMLInputElement;
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

                            {doc.status === 'uploaded' && (
                              <div className="text-sm text-muted-foreground">
                                Document uploaded successfully
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {/* Default Documents Section - shown above platform-created documents for PATH B */}
                {incorporationStatus !== false && defaultKycDocuments.length > 0 && (
                  <>
                    {defaultKycDocuments.map((doc) => (
                      <Card key={doc.id}>
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">{doc.name}</p>
                                <StatusBadge status={doc.status === 'uploaded' ? 'uploaded' : 'pending'} className="mt-2" />
                              </div>
                            </div>

                            {doc.status === 'pending' && (
                              <div>
                                <input
                                  type="file"
                                  id={`default-kyc-file-${doc.id}`}
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      handleDefaultKycDocumentUpload(doc.id, file);
                                    }
                                  }}
                                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                  disabled={uploadingDocId === doc.id}
                                />
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => {
                                    const fileInput = document.getElementById(`default-kyc-file-${doc.id}`) as HTMLInputElement;
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

                            {doc.status === 'uploaded' && (
                              <div className="text-sm text-muted-foreground">
                                Document uploaded successfully
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </>
                )}

                {/* Platform-created document requests */}
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
                              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                              disabled={uploadingDocId === doc.id}
                            />
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => {
                                const fileInput = document.getElementById(`file-${doc.id}`) as HTMLInputElement;
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
          </TabsContent>

          <TabsContent value="incorporation" className="space-y-4">
            {incorporationStatus === true ? (
              // PATH B: New Company Profile - incorporation tab not applicable
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground mb-2">
                  Incorporation documents are not applicable for new company profiles.
                </p>
                <p className="text-xs text-muted-foreground">
                  Your company is already incorporated. Please proceed with KYC verification in the "People" and "Company" tabs.
                </p>
              </div>
            ) : incorporationStatus === false && incorporationDocuments.length === 0 ? (
              // PATH A: Existing Company → Incorporation Service - incorporation documents
              <div className="space-y-4">
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground mb-2">
                    {localStorage.getItem('incorporation-cycle-id') 
                      ? 'Document requests have not been created yet by our team.' 
                      : 'Incorporation documents will be available after service request submission.'}
                  </p>
                  {localStorage.getItem('incorporation-cycle-id') ? (
                    <p className="text-xs text-muted-foreground">
                      Our platform team will create document requests for you shortly. You'll be able to upload documents once they're ready.
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Please complete the incorporation service request submission in Step 5 to proceed with incorporation.
                    </p>
                  )}
                </div>

                {/* Default Incorporation Documents Section - only for PATH A */}
                {localStorage.getItem('incorporation-cycle-id') && (
                  <div className="space-y-3">
                    {defaultIncorporationDocuments.map((doc) => (
                      <Card key={doc.id}>
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">{doc.name}</p>
                                <StatusBadge status={doc.status === 'uploaded' ? 'uploaded' : 'pending'} className="mt-2" />
                              </div>
                            </div>

                            {doc.status === 'pending' && (
                              <div>
                                <input
                                  type="file"
                                  id={`default-incorp-file-${doc.id}`}
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      handleDefaultIncorporationDocumentUpload(doc.id, file);
                                    }
                                  }}
                                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                  disabled={uploadingDocId === doc.id}
                                />
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => {
                                    const fileInput = document.getElementById(`default-incorp-file-${doc.id}`) as HTMLInputElement;
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

                            {doc.status === 'uploaded' && (
                              <div className="text-sm text-muted-foreground">
                                Document uploaded successfully
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            ) : incorporationDocuments.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground mb-2">
                  No incorporation documents required at this time.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Default Incorporation Documents Section - shown above platform-created documents */}
                {incorporationStatus === false && localStorage.getItem('incorporation-cycle-id') && (
                  <>
                    {defaultIncorporationDocuments.map((doc) => (
                      <Card key={doc.id}>
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">{doc.name}</p>
                                <StatusBadge status={doc.status === 'uploaded' ? 'uploaded' : 'pending'} className="mt-2" />
                              </div>
                            </div>

                            {doc.status === 'pending' && (
                              <div>
                                <input
                                  type="file"
                                  id={`default-incorp-file-${doc.id}`}
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      handleDefaultIncorporationDocumentUpload(doc.id, file);
                                    }
                                  }}
                                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                  disabled={uploadingDocId === doc.id}
                                />
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => {
                                    const fileInput = document.getElementById(`default-incorp-file-${doc.id}`) as HTMLInputElement;
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

                            {doc.status === 'uploaded' && (
                              <div className="text-sm text-muted-foreground">
                                Document uploaded successfully
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </>
                )}

                {/* Platform-created incorporation document requests */}
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
                                  handleIncorporationDocumentUpload(doc.id, file);
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

                        {(doc.status === 'uploaded' && doc.progress === 100) && (
                          <div className="text-xs text-muted-foreground">
                            ✓ Document uploaded successfully
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
    </>
  );
}

