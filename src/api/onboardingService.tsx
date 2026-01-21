const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/?$/, "/") || "";

import { 
  OnboardingProgress, 
  OnboardingData, 
  Quotation, 
  KYCPerson, 
  KYCCompanyDocument 
} from "@/interfaces";

// Get auth token from localStorage
function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("token") || "";
  return { Authorization: `Bearer ${token}` };
}

// Check if backend is available (for graceful fallback to localStorage)
async function isBackendAvailable(): Promise<boolean> {
  try {
    const token = localStorage.getItem("token");
    if (!token) return false;
    
    // Try a simple health check or use a test endpoint
    // For now, we'll catch errors in individual requests
    return true;
  } catch {
    return false;
  }
}

// Generic request function with localStorage fallback
async function request(method: string, endpoint: string, { params = {}, body = null as any, isFormData = false } = {} as { params?: Record<string, any>, body?: any, isFormData?: boolean }) {
  // Skip backend request if no backend URL is configured
  if (!backendUrl) {
    throw new Error("BACKEND_NOT_AVAILABLE");
  }

  try {
    const url = new URL(`${backendUrl}${endpoint}`);

    // Handle query params for GET requests
    if (method === "GET" && params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          url.searchParams.append(key, String(value));
        }
      });
    }

    const headers = getAuthHeaders();
    if (!isFormData) {
      headers["Content-Type"] = "application/json";
    }

    const res = await fetch(url, {
      method,
      headers,
      body: isFormData ? body : body ? JSON.stringify(body) : null,
    });

    if (!res.ok) {
      // If endpoint doesn't exist (404) or server error, throw special error
      if (res.status === 404 || res.status >= 500) {
        throw new Error("BACKEND_NOT_AVAILABLE");
      }
      const errorText = await res.text();
      throw new Error(errorText || `API request failed: ${res.status}`);
    }

    // In DELETE some APIs may not return JSON
    if (res.status === 204) return null;
    
    return await res.json();
  } catch (error: any) {
    // Network errors or missing endpoints - throw special error for fallback
    // Suppress console errors for known missing endpoints
    if (error.message === "Failed to fetch" || 
        error.message.includes("NetworkError") || 
        error.message === "BACKEND_NOT_AVAILABLE" ||
        error.message.includes("fetch")) {
      // Create error without triggering console logs
      const backendError = new Error("BACKEND_NOT_AVAILABLE");
      // Mark it so we know it's a handled error
      (backendError as any).isHandled = true;
      throw backendError;
    }
    throw error;
  }
}

// Get onboarding progress
// NOTE: Currently using localStorage only (no backend DB yet)
export async function getOnboardingProgress(): Promise<OnboardingProgress> {
  // Use localStorage only - no backend calls for now
  const saved = localStorage.getItem('onboarding-progress');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      return parsed;
    } catch (parseError) {
      // Invalid saved data, return default
      console.warn('Invalid onboarding progress data in localStorage:', parseError);
    }
  }
  
  // Return default progress if nothing is saved
  return {
    onboardingStatus: 'in_progress',
    currentStep: 1,
    completedSteps: [],
  };
}

// Save onboarding step data
export async function saveOnboardingStep(step: number, data: Partial<OnboardingData>): Promise<void> {
  try {
    return await request("POST", `onboarding/step/${step}`, { body: data });
  } catch (error: any) {
    // Fallback to localStorage if backend is not available
    if (error.message === "BACKEND_NOT_AVAILABLE" || error.message.includes("BACKEND_NOT_AVAILABLE")) {
      // Update progress in localStorage
      const currentProgress: OnboardingProgress = {
        onboardingStatus: 'in_progress',
        currentStep: step + 1,
        completedSteps: Array.from({ length: step }, (_, i) => i + 1),
      };
      localStorage.setItem('onboarding-progress', JSON.stringify(currentProgress));
      
      // Save step data to localStorage
      const existingData = JSON.parse(localStorage.getItem('onboarding-data') || '{}');
      localStorage.setItem('onboarding-data', JSON.stringify({
        ...existingData,
        ...data,
      }));
      return;
    }
    throw error;
  }
}

// Submit onboarding request
export async function submitOnboardingRequest(data: OnboardingData): Promise<{ success: boolean; quotationId?: string }> {
  try {
    return await request("POST", "onboarding/submit", { body: data });
  } catch (error: any) {
    // Fallback to localStorage if backend is not available
    if (error.message === "BACKEND_NOT_AVAILABLE" || error.message.includes("BACKEND_NOT_AVAILABLE")) {
      // Generate mock quotation ID for development
      const mockQuotationId = `QUO-${Date.now()}`;
      localStorage.setItem('quotation-id', mockQuotationId);
      
      // Update progress
      const currentProgress: OnboardingProgress = {
        onboardingStatus: 'in_progress',
        currentStep: 5,
        completedSteps: [1, 2, 3, 4],
      };
      localStorage.setItem('onboarding-progress', JSON.stringify(currentProgress));
      
      return {
        success: true,
        quotationId: mockQuotationId,
      };
    }
    throw error;
  }
}

// Get quotation
export async function getQuotation(quotationId: string): Promise<Quotation> {
  try {
    return await request("GET", `onboarding/quotation/${quotationId}`);
  } catch (error: any) {
    // Fallback to mock quotation if backend is not available
    if (error.message === "BACKEND_NOT_AVAILABLE" || error.message.includes("BACKEND_NOT_AVAILABLE")) {
      // Return mock quotation for development
      return {
        id: quotationId,
        reference: quotationId,
        services: [
          { name: 'Accounting & Bookkeeping', fee: 500 },
          { name: 'VAT Returns', fee: 300 },
        ],
        totalFee: 800,
        terms: 'Terms and conditions apply. Services will commence upon acceptance.',
      };
    }
    throw error;
  }
}

// Accept quotation
export async function acceptQuotation(quotationId: string): Promise<void> {
  try {
    return await request("POST", `onboarding/quotation/${quotationId}/accept`);
  } catch (error: any) {
    // Fallback to localStorage if backend is not available
    if (error.message === "BACKEND_NOT_AVAILABLE" || error.message.includes("BACKEND_NOT_AVAILABLE")) {
      // Update progress
      const currentProgress: OnboardingProgress = {
        onboardingStatus: 'in_progress',
        currentStep: 6,
        completedSteps: [1, 2, 3, 4, 5],
      };
      localStorage.setItem('onboarding-progress', JSON.stringify(currentProgress));
      return;
    }
    throw error;
  }
}

// Request quotation changes
export async function requestQuotationChanges(quotationId: string, comments: string): Promise<void> {
  try {
    return await request("POST", `onboarding/quotation/${quotationId}/request-changes`, { body: { comments } });
  } catch (error: any) {
    // Fallback to localStorage if backend is not available
    if (error.message === "BACKEND_NOT_AVAILABLE" || error.message.includes("BACKEND_NOT_AVAILABLE")) {
      // Store change request in localStorage for development
      const changeRequests = JSON.parse(localStorage.getItem('quotation-change-requests') || '[]');
      changeRequests.push({ quotationId, comments, timestamp: new Date().toISOString() });
      localStorage.setItem('quotation-change-requests', JSON.stringify(changeRequests));
      return;
    }
    throw error;
  }
}

// Get KYC persons
export async function getKYCPersons(): Promise<KYCPerson[]> {
  try {
    return await request("GET", "onboarding/kyc/persons");
  } catch (error: any) {
    // Fallback to mock data if backend is not available
    if (error.message === "BACKEND_NOT_AVAILABLE" || error.message.includes("BACKEND_NOT_AVAILABLE")) {
      // Try to get from saved onboarding data
      const saved = localStorage.getItem('onboarding-data');
      if (saved) {
        try {
          const data = JSON.parse(saved);
          const persons: KYCPerson[] = [];
          
          // Check if it's a new company with newCompanyDetails
          if (data.companyType === 'new' && data.newCompanyDetails) {
            // Add directors - only if option is 'own' and persons exist
            const directors = data.newCompanyDetails.directors;
              if (directors) {
              // Check if option is 'own' (not 'service')
              if (directors.option === 'own') {
                const directorsArray = Array.isArray(directors.persons) ? directors.persons : [];
                
                directorsArray.forEach((person: any, index: number) => {
                  if (person) {
                    const fullName = person.fullName?.trim() || '';
                    const email = person.email?.trim() || '';
                    
                    // Include person if they have either fullName or email
                    if (fullName || email) {
                      persons.push({
                        id: `director-${index}`,
                        name: fullName || email || 'Unnamed Director',
                        role: 'director',
                        status: 'pending',
                      });
                    }
                  }
                });
              }
            }
            
            // Add shareholders
            const shareholders = data.newCompanyDetails.shareholders;
            if (Array.isArray(shareholders) && shareholders.length > 0) {
              shareholders.forEach((person: any, index: number) => {
                if (person) {
                  const fullName = person.fullName?.trim() || '';
                  const email = person.email?.trim() || '';
                  
                  if (fullName || email) {
                    persons.push({
                      id: `shareholder-${index}`,
                      name: fullName || email || 'Unnamed Shareholder',
                      role: 'shareholder',
                      status: 'pending',
                    });
                  }
                }
              });
            }
          }
          
          // Also check for existing company if needed
          if (data.companyType === 'existing' && data.existingCompanyDetails) {
            // Existing companies might not have directors/shareholders in the same format
            // but we can add them if the structure is similar
          }
          
          return persons;
        } catch (parseError) {
          console.error('Failed to parse onboarding data:', parseError);
          return [];
        }
      }
      return [];
    }
    throw error;
  }
}

// Invite/resend KYC for person
export async function inviteKYCPerson(personId: string): Promise<void> {
  try {
    return await request("POST", `onboarding/kyc/persons/${personId}/invite`);
  } catch (error: any) {
    // Fallback to localStorage if backend is not available
    if (error.message === "BACKEND_NOT_AVAILABLE" || error.message.includes("BACKEND_NOT_AVAILABLE")) {
      // Store invite status in localStorage for development
      const invites = JSON.parse(localStorage.getItem('kyc-invites') || '{}');
      invites[personId] = { invited: true, timestamp: new Date().toISOString() };
      localStorage.setItem('kyc-invites', JSON.stringify(invites));
      return;
    }
    throw error;
  }
}

// Get KYC company documents
export async function getKYCCompanyDocuments(): Promise<KYCCompanyDocument[]> {
  try {
    return await request("GET", "onboarding/kyc/company/documents");
  } catch (error: any) {
    // Fallback to mock data if backend is not available
    if (error.message === "BACKEND_NOT_AVAILABLE" || error.message.includes("BACKEND_NOT_AVAILABLE")) {
      // Return default company documents
      return [
        {
          id: 'company-profile',
          name: 'Company Profile',
          type: 'company_profile',
          status: 'pending',
        },
        {
          id: 'supporting-docs',
          name: 'Supporting Documents',
          type: 'supporting_document',
          status: 'pending',
        },
      ];
    }
    throw error;
  }
}

// Upload KYC company document
export async function uploadKYCCompanyDocument(documentId: string, file: File): Promise<void> {
  try {
    const formData = new FormData();
    formData.append("file", file);
    return await request("POST", `onboarding/kyc/company/documents/${documentId}/upload`, { 
      body: formData, 
      isFormData: true 
    });
  } catch (error: any) {
    // Fallback to localStorage if backend is not available
    if (error.message === "BACKEND_NOT_AVAILABLE" || error.message.includes("BACKEND_NOT_AVAILABLE")) {
      // Store upload info in localStorage for development
      const uploads = JSON.parse(localStorage.getItem('kyc-uploads') || '{}');
      uploads[documentId] = {
        fileName: file.name,
        fileSize: file.size,
        uploadedAt: new Date().toISOString(),
        status: 'uploaded',
        progress: 100,
      };
      localStorage.setItem('kyc-uploads', JSON.stringify(uploads));
      return;
    }
    throw error;
  }
}

