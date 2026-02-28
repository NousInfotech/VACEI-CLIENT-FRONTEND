const backendUrl = process.env.NEXT_PUBLIC_VACEI_BACKEND_URL?.replace(/\/?$/, "/") || "http://localhost:5000/api/v1/";

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
  if (!token) {
    console.warn('No token found in localStorage. API calls may fail.');
  }
  return token ? { Authorization: `Bearer ${token}` } : {};
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

    // Debug: Log if token is missing for authenticated endpoints
    if (method !== "GET" && !headers.Authorization) {
      console.warn(`[API Request] No token available for ${method} ${endpoint}`);
    }

    const res = await fetch(url, {
      method,
      headers,
      body: isFormData ? body : body ? JSON.stringify(body) : null,
    });

    if (!res.ok) {
      // For 404 errors, preserve the status code in error message for better handling
      if (res.status === 404) {
        const errorText = await res.text().catch(() => 'Not Found');
        const error = new Error(`404: ${errorText || 'Not Found'}`);
        (error as any).status = 404;
        throw error;
      }
      // If server error (500+), throw special error
      if (res.status >= 500) {
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

// Create User + Client (Step 1)
// After user creation, automatically logs in to get and store the token
export async function createClient(userData: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}): Promise<{
  user: {
    id: string;
    email: string | null;
    phone: string | null;
    firstName: string;
    lastName: string;
  };
  client: {
    id: string;
    userId: string;
  };
  token?: string;
}> {
  try {
    // Step 1: Create User + Client
    const response = await fetch(`${backendUrl}clients`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: userData.email,
        password: userData.password,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone || undefined,
      }),
    });

    if (!response.ok) {
      let errorMessage = "Failed to create account";
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || `Server error: ${response.status}`;
      } catch {
        errorMessage = `Server error: ${response.status} ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();
    const clientData = result.data || result;

    // Step 2: Automatically login to get token
    let token: string | undefined;
    try {
      const loginResponse = await fetch(`${backendUrl}auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userData.email,
          password: userData.password,
        }),
        credentials: "include",
      });

      if (loginResponse.ok) {
        const loginResult = await loginResponse.json();
        // Try multiple possible token locations in response
        token = loginResult.data?.token || loginResult.token || loginResult.data?.data?.token;
        
        // Store token and user info
        if (token) {
          localStorage.setItem("token", token);
          localStorage.setItem("email", btoa(userData.email));
          localStorage.setItem("user_id", btoa(clientData.user.id));
          localStorage.setItem("username", btoa(`${userData.firstName} ${userData.lastName}`));
          
          // Store client specific IDs for library and other features
          const loginClientData = loginResult.data?.client || loginResult.client;
          if (loginClientData?.id) {
            localStorage.setItem("client_id", btoa(loginClientData.id));
          }
          if (loginClientData?.folderId) {
            localStorage.setItem("client_folder_id", btoa(loginClientData.folderId));
          }
          
          const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
          const cookieOptions = isHttps 
            ? 'SameSite=None; Secure; Path=/; Max-Age=86400'
            : 'SameSite=Lax; Path=/; Max-Age=86400';
          
          if (typeof document !== 'undefined') {
            document.cookie = `client-token=${encodeURIComponent(token)}; ${cookieOptions}`;
          }
          
          console.log('Token stored successfully after login');
        } else {
          // Token not found in response - log the full response for debugging
          console.warn('Login succeeded but no token in response:', loginResult);
        }
      } else {
        // Login failed - get error message
        let errorMessage = 'Login failed';
        try {
          const errorData = await loginResponse.json();
          errorMessage = errorData.message || errorData.error || `Login failed: ${loginResponse.status}`;
        } catch {
          errorMessage = `Login failed: ${loginResponse.status} ${loginResponse.statusText}`;
        }
        console.error('User created but auto-login failed:', errorMessage);
        // Don't throw error - allow user to proceed, but they'll need to login manually
      }
    } catch (loginError: any) {
      // Login error - log but don't fail the user creation
      console.error('User created but auto-login failed with exception:', loginError);
    }

    return {
      user: clientData.user,
      client: {
        id: clientData.id,
        userId: clientData.userId,
      },
      token: token,
    };
  } catch (error: any) {
    if (error.message === "BACKEND_NOT_AVAILABLE" || error.message.includes("BACKEND_NOT_AVAILABLE")) {
      throw new Error("Backend is not available. Please try again later.");
    }
    throw error;
  }
}

// Create Company (Step 3)
export async function createCompany(companyData: {
  name: string;
  registrationNumber: string;
  address: string;
  companyType: 'PRIMARY' | 'NON_PRIMARY';
  legalType: 'LTD' | 'PLC';
  summary?: string;
  industry?: string[];
  authorizedShares: number;
  issuedShares: number;
  companyStartDate: string; // ISO datetime string
  clientId?: string;
  incorporationStatus: boolean; // true if already incorporated, false if needs incorporation service
  shareDetails?: Array<{
    class: 'A' | 'B' | 'C' | 'ORDINARY';
    issued: number;
  }>;
  involvementDetails?: Array<{
    personName: string;
    personAddress: string;
    personNationality: string;
    role: Array<'DIRECTOR' | 'LEGAL_REPRESENTATIVE' | 'JUDICIAL_REPRESENTATIVE' | 'SHAREHOLDER' | 'SECRETARY'>; // Array of roles as per API spec
    classA?: number;
    classB?: number;
    classC?: number;
    ordinary?: number;
  }>;
}): Promise<{
  id: string;
  name: string;
  registrationNumber: string;
  incorporationStatus: boolean;
  kycStatus: boolean;
}> {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${backendUrl}companies`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(companyData),
    });

    if (!response.ok) {
      let errorMessage = "Failed to create company";
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || `Server error: ${response.status}`;
      } catch {
        errorMessage = `Server error: ${response.status} ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();
    const company = result.data || result;

    return {
      id: company.id,
      name: company.name,
      registrationNumber: company.registrationNumber,
      incorporationStatus: company.incorporationStatus ?? false,
      kycStatus: company.kycStatus ?? false,
    };
  } catch (error: any) {
    if (error.message === "BACKEND_NOT_AVAILABLE" || error.message.includes("BACKEND_NOT_AVAILABLE")) {
      throw new Error("Backend is not available. Please try again later.");
    }
    throw error;
  }
}

// Update Company (Step 3 revision)
export async function updateCompany(companyId: string, companyData: {
  name: string;
  registrationNumber: string;
  address: string;
  companyType: 'PRIMARY' | 'NON_PRIMARY';
  legalType: 'LTD' | 'PLC';
  summary?: string;
  industry?: string[];
  authorizedShares: number;
  issuedShares: number;
  companyStartDate: string; // ISO datetime string
  clientId?: string;
  incorporationStatus: boolean; // true if already incorporated, false if needs incorporation service
  shareDetails?: Array<{
    class: 'A' | 'B' | 'C' | 'ORDINARY';
    issued: number;
  }>;
  involvementDetails?: Array<{
    personName: string;
    personAddress: string;
    personNationality: string;
    role: Array<'DIRECTOR' | 'LEGAL_REPRESENTATIVE' | 'JUDICIAL_REPRESENTATIVE' | 'SHAREHOLDER' | 'SECRETARY'>; // Array of roles as per API spec
    classA?: number;
    classB?: number;
    classC?: number;
    ordinary?: number;
  }>;
}): Promise<{
  id: string;
  name: string;
  registrationNumber: string;
  incorporationStatus: boolean;
  kycStatus: boolean;
}> {
  try {
    const token = localStorage.getItem("token");
    const backendUrl = process.env.NEXT_PUBLIC_VACEI_BACKEND_URL?.replace(/\/?$/, "/") || "http://localhost:5000/api/v1/";
    const response = await fetch(`${backendUrl}companies/${companyId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(companyData),
    });

    if (!response.ok) {
      let errorMessage = "Failed to update company";
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || `Server error: ${response.status}`;
      } catch {
        errorMessage = `Server error: ${response.status} ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();
    const company = result.data || result;

    return {
      id: company.id,
      name: company.name,
      registrationNumber: company.registrationNumber,
      incorporationStatus: company.incorporationStatus ?? false,
      kycStatus: company.kycStatus ?? false,
    };
  } catch (error: any) {
    if (error.message === "BACKEND_NOT_AVAILABLE" || error.message.includes("BACKEND_NOT_AVAILABLE")) {
      throw new Error("Backend is not available. Please try again later.");
    }
    throw error;
  }
}


/**
 * Get onboarding data from database (stored in client preferences)
 */
export async function getOnboardingDataFromDB(): Promise<any | null> {
  try {
    const encodedClientId = localStorage.getItem('client_id');
    if (!encodedClientId) return null;
    
    const clientId = atob(encodedClientId);
    const response = await request("GET", `clients/${clientId}`);
    
    if (response?.data?.preferences?.onboarding) {
      return response.data.preferences.onboarding;
    }
    return response?.preferences?.onboarding || null;
  } catch (error) {
    console.warn('Failed to fetch onboarding data from DB:', error);
    return null;
  }
}

/**
 * Save onboarding data to database (stored in client preferences)
 */
export async function saveOnboardingDataToDB(data: any): Promise<void> {
  try {
    const encodedClientId = localStorage.getItem('client_id');
    if (!encodedClientId) return;
    
    const clientId = atob(encodedClientId);
    
    // First get existing preferences to avoid overwriting other settings
    const currentClient = await request("GET", `clients/${clientId}`);
    const currentPreferences = (currentClient?.data?.preferences || currentClient?.preferences || {});
    
    const updatedPreferences = {
      ...currentPreferences,
      onboarding: {
        ...(currentPreferences.onboarding || {}),
        ...data
      }
    };
    
    await request("PUT", `clients/${clientId}`, {
      body: { preferences: updatedPreferences }
    });
  } catch (error) {
    console.error('Failed to save onboarding data to DB:', error);
  }
}

// Get onboarding progress
export async function getOnboardingProgress(): Promise<OnboardingProgress> {
  const token = localStorage.getItem('token');
  
  // Try to get from DB if authenticated
  if (token) {
    const dbData = await getOnboardingDataFromDB();
    if (dbData?.progress) {
      // Sync DB progress to localStorage for fallback
      localStorage.setItem('onboarding-progress', JSON.stringify(dbData.progress));
      if (dbData.data) {
        localStorage.setItem('onboarding-data', JSON.stringify(dbData.data));
      }
      return dbData.progress;
    }
  }

  // Fallback to localStorage
  const saved = localStorage.getItem('onboarding-progress');
  
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      return parsed;
    } catch (parseError) {
      console.warn('Invalid onboarding progress data in localStorage:', parseError);
    }
  }
  
  // Return default progress if nothing is saved
  return {
    onboardingStatus: 'in_progress',
    currentStep: token ? 2 : 1,
    completedSteps: token ? [1] : [],
  };
}

// Save onboarding step data
export async function saveOnboardingStep(step: number, data: any): Promise<void> {
  // Update progress
  const currentProgress: OnboardingProgress = {
    onboardingStatus: 'in_progress',
    currentStep: step + 1,
    completedSteps: Array.from({ length: step }, (_, i) => i + 1),
  };
  
  // Save to localStorage (fallback)
  localStorage.setItem('onboarding-progress', JSON.stringify(currentProgress));
  
  const existingData = JSON.parse(localStorage.getItem('onboarding-data') || '{}');
  const updatedData = {
    ...existingData,
    ...data,
  };
  localStorage.setItem('onboarding-data', JSON.stringify(updatedData));
  
  // Sync to database if token is present
  const token = localStorage.getItem('token');
  if (token) {
    await saveOnboardingDataToDB({
      progress: currentProgress,
      data: updatedData
    });
  }
}

// Complete sign-up with onboarding data
// NOTE: User+Client are created in Step 1, Company is created in Step 3
// This function verifies records exist and returns them, or creates them if missing (for backward compatibility)
export async function completeSignUp(userData: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}): Promise<{
  user: {
    id: string;
    email: string | null;
    phone: string | null;
    firstName: string;
    lastName: string;
  };
  client: {
    id: string;
    userId: string;
  };
  company: {
    id: string;
    name: string;
    registrationNumber: string;
  } | null;
  token?: string;
}> {
  try {
    // Get onboarding data from localStorage (temporary storage during onboarding flow)
    const onboardingDataStr = localStorage.getItem('onboarding-data');
    if (!onboardingDataStr) {
      throw new Error('Onboarding data not found. Please complete the onboarding process first.');
    }

    const onboardingData: any = JSON.parse(onboardingDataStr);

    // Check if User+Client were already created in Step 1
    const userId = onboardingData.userId;
    const clientId = onboardingData.clientId;
    const companyId = onboardingData.companyId;

    // If records already exist, return them (they were created in earlier steps)
    if (userId && clientId) {
      // Records already created in Step 1 and Step 3, just return success
      return {
        user: {
          id: userId,
          email: userData.email,
          phone: userData.phone || null,
          firstName: userData.firstName,
          lastName: userData.lastName,
        },
        client: {
          id: clientId,
          userId: userId,
        },
        company: companyId ? {
          id: companyId,
          name: onboardingData.companyType === 'existing' 
            ? onboardingData.existingCompanyDetails?.companyName || 'Company'
            : onboardingData.newCompanyDetails?.proposedNames.name1 || 'Company',
          registrationNumber: onboardingData.companyType === 'existing'
            ? onboardingData.existingCompanyDetails?.registrationNumber || ''
            : onboardingData.newCompanyDetails?.registrationNumber || '',
        } : null,
      };
    }

    // If records don't exist, create them (backward compatibility)
    // Validate required fields
    if (!onboardingData.companyType) {
      throw new Error('Company type is required. Please go back and select a company type.');
    }
    
    if (onboardingData.companyType === 'existing' && !onboardingData.existingCompanyDetails) {
      throw new Error('Existing company details are required. Please go back and complete company details.');
    }
    
    if (onboardingData.companyType === 'new' && !onboardingData.newCompanyDetails) {
      throw new Error('New company details are required. Please go back and complete company details.');
    }

    // Clean up onboarding data before sending
    // Auto-fill missing director/company secretary/judicial representative info from user data
    // Filter out persons with empty emails and names, and convert empty emails to undefined
    let cleanedOnboardingData = { ...onboardingData };
    
    // Prepare user's full name and email for auto-filling
    const userFullName = `${userData.firstName} ${userData.lastName}`.trim();
    const userEmail = userData.email;
    
    if (cleanedOnboardingData.newCompanyDetails) {
      // Helper function to clean a person object
      // For directors/company secretary/judicial representative: auto-fill from user info if missing
      // For shareholders: don't auto-fill (they might be different people)
      const cleanPerson = (person: any, useUserInfo: boolean = false) => {
        if (!person) return null;
        
        let fullName = person.fullName?.trim() || '';
        let email = person.email?.trim() || '';
        
        // Auto-fill from user info if missing and useUserInfo is true
        if (useUserInfo) {
          if (!fullName && userFullName) {
            fullName = userFullName;
          }
          if (!email && userEmail) {
            email = userEmail;
          }
        }
        
        // If still no name or email, filter out
        if (!fullName && !email) return null;
        
        return {
          ...person,
          email: email || undefined,
          fullName: fullName || '',
        };
      };
      
      // Filter and clean directors (auto-fill from user info if missing)
      if (cleanedOnboardingData.newCompanyDetails.directors?.option === 'own') {
        // Ensure persons array exists
        if (!cleanedOnboardingData.newCompanyDetails.directors.persons) {
          cleanedOnboardingData.newCompanyDetails.directors.persons = [];
        }
        
        // Clean existing directors
        cleanedOnboardingData.newCompanyDetails.directors.persons = 
          cleanedOnboardingData.newCompanyDetails.directors.persons
            .map((p: any) => cleanPerson(p, true)) // Use user info for directors
            .filter((p: any) => p !== null);
        
        // If no directors after cleaning, add user as director
        if (cleanedOnboardingData.newCompanyDetails.directors.persons.length === 0) {
          cleanedOnboardingData.newCompanyDetails.directors.persons = [{
            fullName: userFullName,
            email: userEmail,
          }];
        }
      }
      
      // Filter and clean shareholders (don't auto-fill from user info)
      if (cleanedOnboardingData.newCompanyDetails.shareholders) {
        cleanedOnboardingData.newCompanyDetails.shareholders = 
          cleanedOnboardingData.newCompanyDetails.shareholders
            .map((p: any) => cleanPerson(p, false)) // Don't use user info for shareholders
            .filter((p: any) => p !== null);
      }
      
      // Clean company secretary person if exists (auto-fill from user info if missing)
      if (cleanedOnboardingData.newCompanyDetails.companySecretary?.person) {
        const cleanedSecretary = cleanPerson(
          cleanedOnboardingData.newCompanyDetails.companySecretary.person, 
          true // Use user info for company secretary
        );
        cleanedOnboardingData.newCompanyDetails.companySecretary.person = cleanedSecretary || undefined;
        
        // If option is 'own' but person is missing, create from user info
        if (
          cleanedOnboardingData.newCompanyDetails.companySecretary.option === 'own' &&
          !cleanedOnboardingData.newCompanyDetails.companySecretary.person
        ) {
          cleanedOnboardingData.newCompanyDetails.companySecretary.person = {
            fullName: userFullName,
            email: userEmail,
          };
        }
      }
      
      // Clean judicial representative person if exists (auto-fill from user info if missing)
      if (cleanedOnboardingData.newCompanyDetails.judicialRepresentative?.person) {
        const cleanedRep = cleanPerson(
          cleanedOnboardingData.newCompanyDetails.judicialRepresentative.person,
          true // Use user info for judicial representative
        );
        cleanedOnboardingData.newCompanyDetails.judicialRepresentative.person = cleanedRep || undefined;
        
        // If option is 'own' but person is missing, create from user info
        if (
          cleanedOnboardingData.newCompanyDetails.judicialRepresentative.option === 'own' &&
          !cleanedOnboardingData.newCompanyDetails.judicialRepresentative.person
        ) {
          cleanedOnboardingData.newCompanyDetails.judicialRepresentative.person = {
            fullName: userFullName,
            email: userEmail,
          };
        }
      }
    }

    // Combine user registration data with cleaned onboarding data
    const signUpData = {
      ...cleanedOnboardingData,
      ...userData,
    };

    // Call sign-up endpoint (no auth required) - creates User, Client, Company in Supabase
    console.log('Calling sign-up endpoint:', `${backendUrl}onboarding/sign-up`);
    console.log('Sign-up data keys:', Object.keys(signUpData));
    
    const response = await fetch(`${backendUrl}onboarding/sign-up`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(signUpData),
    });

    if (!response.ok) {
      let errorMessage = "Failed to complete sign-up";
      try {
        const errorData = await response.json();
        // Backend error structure: { success: false, error: "...", message: "..." }
        errorMessage = errorData.message || errorData.error || (typeof errorData.error === 'string' ? errorData.error : errorData.error?.message) || `Server error: ${response.status}`;
        console.error('Sign-up error response:', errorData);
        console.error('Response status:', response.status, response.statusText);
      } catch (parseError) {
        // If JSON parsing fails, try to get text
        try {
          const errorText = await response.text();
          errorMessage = errorText || `Server error: ${response.status} ${response.statusText}`;
          console.error('Sign-up error (non-JSON):', errorText);
        } catch (textError) {
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
          console.error('Failed to parse error response:', textError);
        }
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();
    
    // Store auth token and user info (keep these for session management)
    // Note: onboarding data will be cleared after successful sign-up
    if (result.data?.token) {
      localStorage.setItem("token", result.data.token);
      localStorage.setItem("email", btoa(userData.email));
      localStorage.setItem("user_id", btoa(result.data.user.id));
      localStorage.setItem("username", btoa(`${userData.firstName} ${userData.lastName}`));
      
      // Set cookie for middleware access
      const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
      const cookieOptions = isHttps 
        ? 'SameSite=None; Secure; Path=/; Max-Age=86400'
        : 'SameSite=Lax; Path=/; Max-Age=86400';
      
      if (typeof document !== 'undefined') {
        document.cookie = `client-token=${encodeURIComponent(result.data.token)}; ${cookieOptions}`;
      }
    }

    return result.data;
  } catch (error: any) {
    if (error.message === "BACKEND_NOT_AVAILABLE" || error.message.includes("BACKEND_NOT_AVAILABLE")) {
      throw new Error("Backend is not available. Please try again later.");
    }
    throw error;
  }
}

// Submit onboarding request
// According to backend docs: Only create service request if incorporationStatus: false
// If incorporationStatus: true, skip service request and proceed to KYC
// After service request submission, optionally create incorporation cycle (if client wants to initiate)
export async function submitOnboardingRequest(data: OnboardingData): Promise<{ success: boolean; quotationId?: string; serviceRequestId?: string; incorporationCycleId?: string }> {
  try {
    // Get companyId and incorporationStatus from localStorage (created in Step 3)
    const onboardingData = JSON.parse(localStorage.getItem('onboarding-data') || '{}');
    const companyId = onboardingData.companyId;
    const incorporationStatus = onboardingData.incorporationStatus;
    const companyType = data.companyType; // 'existing' or 'new'
    
    if (!companyId) {
      throw new Error('Company ID not found. Please complete company creation first.');
    }

    // NEW WORKFLOW:
    // PATH A: Existing Company (incorporationStatus: true) → Already incorporated → Skip service request, proceed to KYC
    // PATH B: New Company Profile (incorporationStatus: false) → Needs incorporation service → Create service request
    if (incorporationStatus === true) {
      // PATH A: Existing Company Profile - already incorporated
      // Cannot send incorporation service requests
      // Proceed directly to KYC phase
      console.log('PATH A: Existing Company Profile - already incorporated. Skipping service request creation.');
      return {
        success: true,
        // No serviceRequestId for existing companies that are already incorporated
      };
    }

    // PATH B: New Company → Came for Incorporation Service
    // Step 1: Create service request draft for INCORPORATION service
    // According to new workflow: ServiceRequests type = INCORPORATION
    // According to backend docs: POST /api/v1/service-requests with { companyId, service: "INCORPORATION" }
    const draftResponse = await request("POST", "service-requests", { 
      body: { 
        companyId: companyId,
        service: "INCORPORATION"
      } 
    });
    
    const serviceRequestId = draftResponse?.data?.id || draftResponse?.id;
    
    if (!serviceRequestId) {
      throw new Error('Failed to create service request draft');
    }

    // Step 2: Submit the service request
    // According to service-request.api.md: POST /api/v1/service-requests/:id/submit
    // Format: { generalDetails: [{ question, answer, attachedFiles? }], serviceDetails: [{ question, answer, attachedFiles? }] }
    // Note: attachedFiles are optional fileIds that must exist in submittedDocuments
    // PATH A: Build service request details
    // According to new workflow: ServiceRequests type = INCORPORATION (business services)
    // Services: Accounting & Bookkeeping, VAT Returns, Audit, Payroll, Tax Advisory, Directorship service, Company Secretary, Registered Address, etc.
    const generalDetails = [
      { 
        question: "Company Type", 
        answer: data.companyType,
      },
      { 
        question: "Service Type", 
        answer: "Incorporation Service",
      },
    ];
    
    const serviceDetails: any[] = [];
    if (data.companyType === 'existing' && data.existingCompanyDetails) {
      serviceDetails.push(
        { 
          question: "Company Name", 
          answer: data.existingCompanyDetails.companyName,
          // attachedFiles: [] // Optional
        },
        { 
          question: "Registration Number", 
          answer: data.existingCompanyDetails.registrationNumber,
          // attachedFiles: [] // Optional
        },
        { 
          question: "Country of Incorporation", 
          answer: data.existingCompanyDetails.countryOfIncorporation,
          // attachedFiles: [] // Optional
        },
      );
    } else if (data.companyType === 'new' && data.newCompanyDetails) {
      serviceDetails.push(
        { 
          question: "Proposed Company Names", 
          answer: Object.values(data.newCompanyDetails.proposedNames).filter(Boolean).join(", "),
          // attachedFiles: [] // Optional
        },
        { 
          question: "Legal Type", 
          answer: data.newCompanyDetails.legalType,
          // attachedFiles: [] // Optional
        },
      );
    }

    await request("POST", `service-requests/${serviceRequestId}/submit`, {
      body: {
        generalDetails,
        serviceDetails,
      }
    });

    // PATH A: Step 3: Create incorporation cycle (following new workflow: ServiceRequest → Incorporation Cycle)
    // According to incorporation.api.md: POST /api/v1/incorporation
    // According to new workflow: Incorporation Service → Incorporation ServiceRequest → Incorporation Cycle
    // Note: CLIENT can create it, but PLATFORM_MEMBERS typically do. We try to create it here to follow the workflow.
    let incorporationCycleId: string | undefined;
    try {
      const incorporationResponse = await request("POST", "incorporation", {
        body: {
          companyId: companyId,
          status: "PENDING"
        }
      });
      incorporationCycleId = incorporationResponse?.data?.id || incorporationResponse?.id;
      if (incorporationCycleId) {
        console.log('Incorporation cycle created successfully:', incorporationCycleId);
        localStorage.setItem('incorporation-cycle-id', incorporationCycleId);
      }
    } catch (incorpError: any) {
      // If incorporation cycle already exists (409 Conflict) or other error, continue
      // PLATFORM_MEMBERS will create it if needed, or it may already exist
      // This is not a critical error - the workflow can continue
      if (incorpError.message?.includes('409') || incorpError.message?.includes('Conflict')) {
        console.log('Incorporation cycle already exists (will be used)');
      } else {
        console.warn('Could not create incorporation cycle (will be created by platform members if needed):', incorpError.message);
      }
    }

    // Store service request ID (replacing quotation-id for consistency)
    localStorage.setItem('service-request-id', serviceRequestId);
    localStorage.setItem('quotation-id', serviceRequestId); // Keep for backward compatibility
    
    return {
      success: true,
      serviceRequestId: serviceRequestId,
      quotationId: serviceRequestId, // Map to quotationId for backward compatibility
      incorporationCycleId: incorporationCycleId,
    };
  } catch (error: any) {
    // Fallback to localStorage if backend is not available
    if (error.message === "BACKEND_NOT_AVAILABLE" || error.message.includes("BACKEND_NOT_AVAILABLE")) {
      // Generate mock service request ID for development
      const mockServiceRequestId = `SR-${Date.now()}`;
      localStorage.setItem('service-request-id', mockServiceRequestId);
      localStorage.setItem('quotation-id', mockServiceRequestId);
      
      // Update progress
      const currentProgress: OnboardingProgress = {
        onboardingStatus: 'in_progress',
        currentStep: 5,
        completedSteps: [1, 2, 3, 4],
      };
      localStorage.setItem('onboarding-progress', JSON.stringify(currentProgress));
      
      return {
        success: true,
        serviceRequestId: mockServiceRequestId,
        quotationId: mockServiceRequestId,
      };
    }
    throw error;
  }
}

// Get service request form schema (optional - for dynamic form rendering)
// According to service-request.api.md: GET /api/v1/service-requests/form-schema?service=INCORPORATION
export async function getServiceRequestFormSchema(service: string = 'INCORPORATION'): Promise<{ general: { formFields: any[] }; service: { formFields: any[] } }> {
  try {
    const response = await request("GET", `service-requests/form-schema`, {
      params: { service }
    });
    return response.data || response;
  } catch (error: any) {
    // If schema endpoint fails, return empty schema (fallback to hardcoded form)
    console.warn('Failed to get form schema, using default form:', error);
    return { general: { formFields: [] }, service: { formFields: [] } };
  }
}

// Service pricing configuration (standard pricing for each service)
// These are default prices that can be adjusted by platform members
const SERVICE_PRICING: Record<string, number> = {
  'INCORPORATION': 1500, // Company Incorporation - standard fee
  'ACCOUNTING': 500, // Accounting & Bookkeeping - monthly
  'AUDITING': 2000, // Audit Services - annual
  'VAT': 300, // VAT Returns - per return
  'CFO': 2500, // CFO Services - monthly
  'CSP': 400, // Company Secretary Services - monthly
  'LEGAL': 800, // Legal Services - per consultation
  'PAYROLL': 200, // Payroll Services - monthly
  'PROJECTS_TRANSACTIONS': 1000, // Projects & Transactions - per project
  'TECHNOLOGY': 1500, // Technology Services - per project
  'GRANTS_AND_INCENTIVES': 1200, // Grants & Incentives - per application
};

// Map service enum to readable name
const SERVICE_NAME_MAP: Record<string, string> = {
  'ACCOUNTING': 'Accounting & Bookkeeping',
  'AUDITING': 'Audit Services',
  'VAT': 'VAT Returns',
  'CFO': 'CFO Services',
  'CSP': 'Company Secretary Services',
  'LEGAL': 'Legal Services',
  'PAYROLL': 'Payroll Services',
  'PROJECTS_TRANSACTIONS': 'Projects & Transactions',
  'TECHNOLOGY': 'Technology Services',
  'GRANTS_AND_INCENTIVES': 'Grants & Incentives',
  'INCORPORATION': 'Company Incorporation',
};

// Get quotation (service request)
// According to service-request.api.md: GET /api/v1/service-requests/:id
export async function getQuotation(quotationId: string): Promise<Quotation> {
  try {
    const response = await request("GET", `service-requests/${quotationId}`);
    // Backend response structure: { success: true, data: { ...serviceRequest }, message: "..." }
    const serviceRequest = response.data || response;
    
    // Get service name and pricing
    const serviceType = serviceRequest.service || 'INCORPORATION';
    const serviceName = SERVICE_NAME_MAP[serviceType] || serviceType;
    const serviceFee = SERVICE_PRICING[serviceType] || 0;
    
    // Build services array with pricing
    const services = [
      {
        name: serviceName,
        fee: serviceFee,
      }
    ];
    
    // Calculate total fee
    const totalFee = services.reduce((sum, service) => sum + service.fee, 0);
    
    return {
      id: serviceRequest.id || quotationId,
      reference: serviceRequest.id || quotationId,
      services: services,
      totalFee: totalFee,
      terms: 'Terms and conditions apply. Final pricing may vary based on specific requirements. Services will commence upon acceptance and payment confirmation.',
    };
  } catch (error: any) {
    // Fallback to mock quotation if backend is not available
    if (error.message === "BACKEND_NOT_AVAILABLE" || error.message.includes("BACKEND_NOT_AVAILABLE")) {
      // Return mock quotation for development
      return {
        id: quotationId,
        reference: quotationId,
        services: [
          { name: 'Company Incorporation', fee: 1500 },
        ],
        totalFee: 1500,
        terms: 'Terms and conditions apply. Services will commence upon acceptance.',
      };
    }
    throw error;
  }
}

// Accept quotation (service request is already submitted in submitOnboardingRequest)
// This function is kept for backward compatibility but service request is already submitted
export async function acceptQuotation(quotationId: string): Promise<void> {
  try {
    // Service request is already submitted in submitOnboardingRequest
    // This endpoint is kept for UI flow compatibility
    // In the backend, the service request status will be updated by platform members
    const response = await request("GET", `service-requests/${quotationId}`);
    
    // Verify service request exists and is submitted
    const serviceRequest = response.data || response;
    if (serviceRequest.status !== 'SUBMITTED' && serviceRequest.status !== 'IN_REVIEW' && serviceRequest.status !== 'APPROVED') {
      throw new Error('Service request is not in a valid state for acceptance');
    }
    
    // Update progress
    const currentProgress: OnboardingProgress = {
      onboardingStatus: 'in_progress',
      currentStep: 6,
      completedSteps: [1, 2, 3, 4, 5],
    };
    localStorage.setItem('onboarding-progress', JSON.stringify(currentProgress));
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
// Note: Backend doesn't have a "request changes" endpoint for service requests
// Once a service request is submitted, it can only be updated by platform members
// This function stores comments for now - may need backend implementation or different workflow
export async function requestQuotationChanges(quotationId: string, comments: string): Promise<void> {
  try {
    // Check if service request is still in DRAFT status (can be updated)
    const serviceRequestResponse = await request("GET", `service-requests/${quotationId}`);
    const serviceRequest = serviceRequestResponse.data || serviceRequestResponse;
    
    if (serviceRequest.status === 'DRAFT') {
      // Can update the draft with comments in generalDetails or serviceDetails
      // For now, we'll store it as a note - backend may need to implement this
      throw new Error('Service request changes should be handled through draft updates. This feature needs backend implementation.');
    } else {
      // Service request is already submitted - can't be changed by client
      // Store comments for platform members to review
      throw new Error('Service request is already submitted. Changes must be requested through platform support.');
    }
  } catch (error: any) {
    // Fallback to localStorage if backend is not available or for development
    if (error.message === "BACKEND_NOT_AVAILABLE" || error.message.includes("BACKEND_NOT_AVAILABLE") || error.message.includes("needs backend")) {
      // Store change request in localStorage for development/platform review
      const changeRequests = JSON.parse(localStorage.getItem('quotation-change-requests') || '[]');
      changeRequests.push({ quotationId, comments, timestamp: new Date().toISOString() });
      localStorage.setItem('quotation-change-requests', JSON.stringify(changeRequests));
      return;
    }
    throw error;
  }
}

// Get KYC persons
// According to backend: GET /api/v1/companies/:companyId (includes involvements)
export async function getKYCPersons(): Promise<KYCPerson[]> {
  try {
    // Get companyId from localStorage
    const onboardingData = JSON.parse(localStorage.getItem('onboarding-data') || '{}');
    const companyId = onboardingData.companyId;
    
    if (!companyId) {
      // Fallback to localStorage if companyId not found
      return getKYCPersonsFromLocalStorage();
    }

    // Get company with transformed data (includes representationalSchema and shareHolders)
    const response = await request("GET", `companies/${companyId}`);
    const company = response.data || response;
    
    // Use the same approach as New Company Profile - combine representationalSchema and shareHolders
    // representationalSchema contains people with roles (directors, secretary, judicial rep)
    // shareHolders contains people with shares or SHAREHOLDER role
    const personMap = new Map<string, KYCPerson>(); // Use Map to avoid duplicates by personId
    
    // Add people from representationalSchema (directors, secretary, judicial rep)
    // IMPORTANT: Each involvement creates a separate entry in representationalSchema
    // A person can appear multiple times if they have multiple roles in separate involvements
    if (company.representationalSchema && Array.isArray(company.representationalSchema)) {
      company.representationalSchema.forEach((rep: any, index: number) => {
        const personId = rep.personId?._id || rep.personId?.id || rep._id || rep.id;
        const personName = rep.personId?.name || 'Unknown';
        const roles = Array.isArray(rep.role) ? rep.role : [rep.role];
        
        if (!personId) {
          console.warn(`[${index}] Skipping person in representationalSchema - no personId:`, rep);
          return;
        }
        
        // Process ALL roles for this person - create separate entries for each valid role
        // This ensures that if a person has both SECRETARY and JUDICIAL_REPRESENTATIVE,
        // both will appear in the People tab
        const rolesUpper = roles.map((r: string) => String(r).toUpperCase().trim());
        
        // Check for each role type (handle variations in role naming)
        const hasDirector = rolesUpper.some((r: string) => r === 'DIRECTOR');
        const hasSecretary = rolesUpper.some((r: string) => r === 'SECRETARY');
        const hasJudicialRep = rolesUpper.some((r: string) => 
          r === 'JUDICIAL_REPRESENTATIVE' || 
          r === 'JUDICIALREPRESENTATIVE' ||
          (r.includes('JUDICIAL') && r.includes('REPRESENTATIVE'))
        );
        
        // Create entries for each role the person has
        // Use composite key: personId-role to allow same person with multiple roles
        if (hasDirector) {
          const key = `${personId}-director`;
          if (!personMap.has(key)) {
            personMap.set(key, {
              id: personId,
              name: personName,
              role: 'director',
              status: 'pending',
            });
          }
        }
        
        if (hasSecretary) {
          const key = `${personId}-secretary`;
          if (!personMap.has(key)) {
            personMap.set(key, {
              id: personId,
              name: personName,
              role: 'secretary',
              status: 'pending',
            });
          }
        }
        
        if (hasJudicialRep) {
          const key = `${personId}-judicial_representative`;
          if (!personMap.has(key)) {
            personMap.set(key, {
              id: personId,
              name: personName,
              role: 'judicial_representative',
              status: 'pending',
            });
          }
        }
        
        // If no valid roles found, log a warning
        if (!hasDirector && !hasSecretary && !hasJudicialRep) {
          console.warn(`[${index}] Skipping person in representationalSchema - no valid role found:`, {
            personId,
            personName,
            roles,
            rolesUpper,
            rawRole: rep.role,
            fullRep: rep
          });
        }
      });
    } else {
      console.warn('representationalSchema is missing or not an array:', company.representationalSchema);
    }
    
    // Add people from shareHolders (shareholders)
    if (company.shareHolders && Array.isArray(company.shareHolders)) {
      company.shareHolders.forEach((sh: any) => {
        const personId = sh.personId?._id || sh.personId?.id || sh._id || sh.id;
        const personName = sh.personId?.name || 'Unknown';
        
        if (!personId) return;
        
        // Only add if not already added (to avoid duplicates)
        // If person already exists, keep their existing role (director/secretary/judicial_representative)
        // Only add as shareholder if they don't exist yet
        if (!personMap.has(personId)) {
          personMap.set(personId, {
            id: personId,
            name: personName,
            role: 'shareholder',
            status: 'pending',
          });
        }
      });
    }
    
    // Convert Map to array
    const personsArray = Array.from(personMap.values());
    
    // If backend returns empty array, fall back to localStorage completely
    if (personsArray.length === 0) {
      return getKYCPersonsFromLocalStorage();
    }
    
    // Note: Company Secretary and Judicial Representative should now be in backend
    // as they are passed during company creation with user info if person not provided
    // No localStorage fallback needed - data should come from backend
    
    return personsArray;
  } catch (error: any) {
    // Fallback to localStorage on error
    return getKYCPersonsFromLocalStorage();
  }
}

// Helper function to get KYC persons from localStorage
function getKYCPersonsFromLocalStorage(): KYCPerson[] {
  const saved = localStorage.getItem('onboarding-data');
  if (!saved) {
    return [];
  }
  
  try {
    const data = JSON.parse(saved);
    const persons: KYCPerson[] = [];
    
    // Get user info from step 1 for auto-filling
    const userFullName = data.firstName && data.lastName 
      ? `${data.firstName} ${data.lastName}`.trim() 
      : '';
    const userEmail = data.email || '';
    
    // Helper function to get person name and email (auto-fill from user if missing)
    const getPersonInfo = (person: any, useUserInfo: boolean = false) => {
      let fullName = person?.fullName?.trim() || '';
      let email = person?.email?.trim() || '';
      
      // Auto-fill from user info if missing and useUserInfo is true
      if (useUserInfo) {
        if (!fullName && userFullName) {
          fullName = userFullName;
        }
        if (!email && userEmail) {
          email = userEmail;
        }
      }
      
      return { fullName, email };
    };
    
    // Check if it's a new company with newCompanyDetails
    if (data.companyType === 'new' && data.newCompanyDetails) {
      // Add directors - only if option is 'own'
      const directors = data.newCompanyDetails.directors;
      if (directors && directors.option === 'own') {
        const directorsArray = Array.isArray(directors.persons) ? directors.persons : [];
        
        // If no directors provided, add user as director
        if (directorsArray.length === 0 && userFullName) {
          persons.push({
            id: 'director-user',
            name: userFullName,
            role: 'director',
            status: 'pending',
          });
        } else {
          // Process existing directors (auto-fill missing info from user)
          directorsArray.forEach((person: any, index: number) => {
            if (person) {
              const { fullName, email } = getPersonInfo(person, true); // Use user info for directors
              
              // Include person if they have either fullName or email after auto-fill
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
      
      // Add shareholders (don't auto-fill from user info)
      const shareholders = data.newCompanyDetails.shareholders;
      if (Array.isArray(shareholders) && shareholders.length > 0) {
        shareholders.forEach((person: any, index: number) => {
          if (person) {
            const { fullName, email } = getPersonInfo(person, false); // Don't use user info for shareholders
            
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
      
      // Add company secretary if option is 'own'
      const companySecretary = data.newCompanyDetails.companySecretary;
      if (companySecretary && companySecretary.option === 'own') {
        if (companySecretary.person) {
          const { fullName, email } = getPersonInfo(companySecretary.person, true);
          if (fullName || email) {
            persons.push({
              id: 'company-secretary',
              name: fullName || email || 'Unnamed Secretary',
              role: 'secretary',
              status: 'pending',
            });
          }
        } else if (userFullName) {
          // Auto-add user as company secretary if not provided
          persons.push({
            id: 'company-secretary-user',
            name: userFullName,
            role: 'secretary',
            status: 'pending',
          });
        }
      }
      
      // Add judicial representative if option is 'own'
      const judicialRepresentative = data.newCompanyDetails.judicialRepresentative;
      if (judicialRepresentative && judicialRepresentative.option === 'own') {
        if (judicialRepresentative.person) {
          const { fullName, email } = getPersonInfo(judicialRepresentative.person, true);
          if (fullName || email) {
            persons.push({
              id: 'judicial-representative',
              name: fullName || email || 'Unnamed Representative',
              role: 'judicial_representative',
              status: 'pending',
            });
          }
        } else if (userFullName) {
          // Auto-add user as judicial representative if not provided
          persons.push({
            id: 'judicial-representative-user',
            name: userFullName,
            role: 'judicial_representative',
            status: 'pending',
          });
        }
      }
    }
    
    // Check if it's an existing company with existingCompanyDetails (now includes people/roles)
    if (data.companyType === 'existing' && data.existingCompanyDetails) {
      const existingDetails = data.existingCompanyDetails;
      
      // Add directors - only if option is 'own'
      if (existingDetails.directors && existingDetails.directors.option === 'own') {
        const directorsArray = Array.isArray(existingDetails.directors.persons) ? existingDetails.directors.persons : [];
        
        directorsArray.forEach((person: any, index: number) => {
          if (person) {
            const { fullName, email } = getPersonInfo(person, true); // Use user info for directors
            
            // Include person if they have either fullName or email after auto-fill
            if (fullName || email) {
              persons.push({
                id: `director-existing-${index}`,
                name: fullName || email || 'Unnamed Director',
                role: 'director',
                status: 'pending',
              });
            }
          }
        });
      }
      
      // Add shareholders
      if (Array.isArray(existingDetails.shareholders) && existingDetails.shareholders.length > 0) {
        existingDetails.shareholders.forEach((person: any, index: number) => {
          if (person) {
            const { fullName, email } = getPersonInfo(person, false); // Don't use user info for shareholders
            
            if (fullName || email) {
              persons.push({
                id: `shareholder-existing-${index}`,
                name: fullName || email || 'Unnamed Shareholder',
                role: 'shareholder',
                status: 'pending',
              });
            }
          }
        });
      }
      
      // Add company secretary if option is 'own'
      if (existingDetails.companySecretary && existingDetails.companySecretary.option === 'own') {
        if (existingDetails.companySecretary.person) {
          const { fullName, email } = getPersonInfo(existingDetails.companySecretary.person, true);
          if (fullName || email) {
            persons.push({
              id: 'company-secretary-existing',
              name: fullName || email || 'Unnamed Secretary',
              role: 'secretary',
              status: 'pending',
            });
          }
        } else if (userFullName) {
          // Auto-add user as company secretary if not provided (same as New Company Profile)
          persons.push({
            id: 'company-secretary-existing-user',
            name: userFullName,
            role: 'secretary',
            status: 'pending',
          });
        }
      }
      
      // Add judicial representative if option is 'own'
      if (existingDetails.judicialRepresentative && existingDetails.judicialRepresentative.option === 'own') {
        if (existingDetails.judicialRepresentative.person) {
          const { fullName, email } = getPersonInfo(existingDetails.judicialRepresentative.person, true);
          if (fullName || email) {
            persons.push({
              id: 'judicial-representative-existing',
              name: fullName || email || 'Unnamed Representative',
              role: 'judicial_representative',
              status: 'pending',
            });
          }
        } else if (userFullName) {
          // Auto-add user as judicial representative if not provided (same as New Company Profile)
          persons.push({
            id: 'judicial-representative-existing-user',
            name: userFullName,
            role: 'judicial_representative',
            status: 'pending',
          });
        }
      }
    }
    
    return persons;
  } catch (parseError) {
    console.error('Failed to parse onboarding data for KYC persons:', parseError);
    return [];
  }
}

// Invite/resend KYC for person
// According to backend: POST /api/v1/companies/:companyId/kyc/:kycCycleId/involvement-kyc
// This creates an involvement KYC record which automatically creates a document request
export async function inviteKYCPerson(personId: string): Promise<void> {
  try {
    // Get companyId from localStorage
    const onboardingData = JSON.parse(localStorage.getItem('onboarding-data') || '{}');
    const companyId = onboardingData.companyId;
    
    if (!companyId) {
      throw new Error('Company ID not found');
    }

    // Step 1: Get company to find KYC cycle
    const companyResponse = await request("GET", `companies/${companyId}`);
    const company = companyResponse.data || companyResponse;
    
    // Find active KYC cycle
    const kycCycles = company.kycCycles || [];
    const activeKycCycle = kycCycles.find((cycle: any) => 
      cycle.status === 'PENDING' || cycle.status === 'IN_REVIEW'
    );
    
    if (!activeKycCycle || !activeKycCycle.id) {
      throw new Error('No active KYC cycle found');
    }

    // Step 2: Find involvement by personId
    // personId might be an involvement ID or we need to find it from involvements
    const involvements = company.involvements || [];
    const involvement = involvements.find((inv: any) => 
      inv.id === personId || inv.person?.id === personId
    );
    
    if (!involvement || !involvement.id) {
      throw new Error('Involvement not found for person');
    }

    // Step 3: Create involvement KYC
    // According to backend: POST /api/v1/companies/:companyId/kyc/:kycCycleId/involvement-kyc
    await request("POST", `companies/${companyId}/kyc/${activeKycCycle.id}/involvement-kyc`, {
      body: {
        kycCycleId: activeKycCycle.id,
        involvementId: involvement.id,
        status: 'PENDING', // optional, defaults to PENDING
      }
    });
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
// According to backend: GET /api/v1/kyc/:kycCycleId/document-requests
// First need to get company, then get KYC cycle, then get document requests
export async function getKYCCompanyDocuments(): Promise<KYCCompanyDocument[]> {
  try {
    // Get companyId from localStorage
    const onboardingData = JSON.parse(localStorage.getItem('onboarding-data') || '{}');
    const companyId = onboardingData.companyId;
    
    if (!companyId) {
      throw new Error('Company ID not found');
    }

    // Step 1: Get company to find KYC cycle
    const companyResponse = await request("GET", `companies/${companyId}`);
    const company = companyResponse.data || companyResponse;
    
    // Find active KYC cycle (status PENDING or IN_REVIEW)
    const kycCycles = company.kycCycles || [];
    const activeKycCycle = kycCycles.find((cycle: any) => 
      cycle.status === 'PENDING' || cycle.status === 'IN_REVIEW'
    );
    
    if (!activeKycCycle || !activeKycCycle.id) {
      // No active KYC cycle, return empty array
      console.log('No active KYC cycle found for company');
      return [];
    }
    
    console.log('Active KYC cycle found:', activeKycCycle.id, 'Status:', activeKycCycle.status);

    // Step 2: Get document requests for KYC cycle
    // According to backend: GET /api/v1/kyc/:kycCycleId/document-requests
    const docResponse = await request("GET", `kyc/${activeKycCycle.id}/document-requests`);
    let documentRequest = docResponse.data || docResponse;
    
    // Handle case where response is an array (multiple document requests) or single object
    let requestedDocuments: any[] = [];
    if (Array.isArray(documentRequest)) {
      // If array, get requestedDocuments from first document request
      if (documentRequest.length > 0 && documentRequest[0].requestedDocuments) {
        requestedDocuments = documentRequest[0].requestedDocuments;
      }
    } else if (documentRequest?.requestedDocuments) {
      requestedDocuments = documentRequest.requestedDocuments;
    }
    
    console.log('KYC requested documents:', requestedDocuments);
    
    // Map to KYCCompanyDocument format
    // According to incorporation.api.md: requestedDocuments have documentName, status, files
    const documents: KYCCompanyDocument[] = requestedDocuments.map((doc: any) => ({
      id: doc.id,
      name: doc.documentName || doc.name || doc.title || 'Document',
      type: doc.type || 'document',
      status: doc.status?.toLowerCase() || 'pending',
      progress: doc.status === 'UPLOADED' || doc.status === 'ACCEPTED' ? 100 : 
                doc.status === 'REJECTED' ? 0 : 
                doc.files && doc.files.length > 0 ? 50 : 0,
    }));
    
    return documents;
  } catch (error: any) {
    console.error('Error fetching KYC company documents:', error);
    // If 404, document request hasn't been created yet by platform members
    if (error.message?.includes('404') || error.message?.includes('Not Found') || error.status === 404) {
      console.log('Document request not found (404) - platform members need to create it first');
      return [];
    }
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

// Helper function: Upload file to library
// According to file.api.md: POST /api/v1/library/files/upload
async function uploadFileToLibrary(file: File, folderId: string, tags?: string[]): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);
  formData.append("folderId", folderId);
  if (tags && tags.length > 0) {
    formData.append("tags", JSON.stringify(tags));
  }
  
  const response = await request("POST", "library/files/upload", {
      body: formData, 
    isFormData: true,
    });
  
  const fileData = response?.data || response;
  if (!fileData?.id) {
    throw new Error('Failed to upload file to library');
  }
  
  return fileData.id;
}

// Upload KYC company document
// According to kyc.api.md: Files must be uploaded to library first, then attached using fileIds
// POST /api/v1/kyc/:kycCycleId/document-requests/requested-documents/:id/files expects { fileIds: ["uuid"] }
export async function uploadKYCCompanyDocument(documentId: string, file: File): Promise<void> {
  try {
    console.log('Starting KYC document upload:', { documentId, fileName: file.name, fileSize: file.size });
    
    // Get companyId from localStorage
    const onboardingData = JSON.parse(localStorage.getItem('onboarding-data') || '{}');
    const companyId = onboardingData.companyId;
    
    if (!companyId) {
      throw new Error('Company ID not found');
    }

    // Step 1: Get company to find KYC cycle
    const companyResponse = await request("GET", `companies/${companyId}`);
    const company = companyResponse.data || companyResponse;
    
    // Find active KYC cycle
    const kycCycles = company.kycCycles || [];
    const activeKycCycle = kycCycles.find((cycle: any) => 
      cycle.status === 'PENDING' || cycle.status === 'IN_REVIEW' || cycle.status === 'VERIFIED'
    );
    
    console.log('KYC cycles found:', kycCycles);
    console.log('Active KYC cycle:', activeKycCycle);
    
    if (!activeKycCycle || !activeKycCycle.id) {
      throw new Error('No active KYC cycle found. KYC cycle may not have been created yet.');
    }

    // Step 2: Get document request to get folderId
    // According to kyc.api.md: GET /api/v1/kyc/:kycCycleId/document-requests
    const docResponse = await request("GET", `kyc/${activeKycCycle.id}/document-requests`);
    let documentRequest = docResponse.data || docResponse;
    
    // Handle case where response is an array (multiple document requests)
    if (Array.isArray(documentRequest) && documentRequest.length > 0) {
      documentRequest = documentRequest[0];
    }
    
    console.log('KYC document request response:', documentRequest);
    
    if (!documentRequest) {
      throw new Error('Document request not found for KYC cycle');
    }
    
    if (!documentRequest.folderId) {
      throw new Error('Folder not created for document request. Please contact platform support.');
    }

    console.log('Uploading file to library with folderId:', documentRequest.folderId);

    // Step 3: Upload file to library first
    // According to file.api.md: POST /api/v1/library/files/upload
    const fileId = await uploadFileToLibrary(file, documentRequest.folderId, ['document-request', 'kyc', 'company']);
    
    console.log('File uploaded to library, fileId:', fileId);

    // Step 4: Attach file to requested document
    // According to kyc.api.md: POST /api/v1/kyc/:kycCycleId/document-requests/requested-documents/:id/files
    console.log('Attaching file to requested document');
    await request("POST", `kyc/${activeKycCycle.id}/document-requests/requested-documents/${documentId}/files`, {
      body: {
        fileIds: [fileId]
      }
    });
    
    console.log('KYC document uploaded successfully');
  } catch (error: any) {
    console.error('Error uploading KYC document:', error);
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

// Get incorporation document requests
// According to incorporation.api.md: GET /api/v1/incorporation/:incorporationCycleId/document-requests
export async function getIncorporationDocuments(incorporationCycleId: string): Promise<KYCCompanyDocument[]> {
  try {
    console.log('Fetching incorporation documents for cycle:', incorporationCycleId);
    // Get document requests for incorporation cycle
    const docResponse = await request("GET", `incorporation/${incorporationCycleId}/document-requests`);
    const documentRequest = docResponse.data || docResponse;
    
    console.log('Incorporation document request response:', documentRequest);
    
    // Handle case where response is an array (multiple document requests) or single object
    let requestedDocuments: any[] = [];
    if (Array.isArray(documentRequest)) {
      // If array, get requestedDocuments from first document request
      if (documentRequest.length > 0) {
        // Check if first item has requestedDocuments or is the document request itself
        if (documentRequest[0].requestedDocuments) {
          requestedDocuments = documentRequest[0].requestedDocuments;
        } else if (documentRequest[0].id && documentRequest[0].documentName) {
          // If array items are requested documents themselves
          requestedDocuments = documentRequest;
        }
      }
    } else if (documentRequest) {
      // Single object - check if it has requestedDocuments or is a document request itself
      if (documentRequest.requestedDocuments) {
        requestedDocuments = documentRequest.requestedDocuments;
      } else if (documentRequest.id && documentRequest.documentName) {
        // Single requested document
        requestedDocuments = [documentRequest];
      }
    }
    
    if (!requestedDocuments || requestedDocuments.length === 0) {
      console.log('No requested documents found for incorporation cycle - document request may not have been created yet');
      return [];
    }
    
    // Map to KYCCompanyDocument format (reusing same interface)
    const documents: KYCCompanyDocument[] = requestedDocuments.map((doc: any) => ({
      id: doc.id,
      name: doc.documentName || doc.name || 'Document',
      type: doc.type || 'document',
      status: doc.status?.toLowerCase() || 'pending',
      progress: doc.status === 'UPLOADED' || doc.status === 'ACCEPTED' ? 100 : 
                doc.status === 'REJECTED' ? 0 : 
                doc.files && doc.files.length > 0 ? 50 : 0,
    }));
    
    console.log('Mapped incorporation documents:', documents);
    return documents;
  } catch (error: any) {
    console.error('Error fetching incorporation documents:', error);
    // If 404, document request hasn't been created yet by platform members
    if (error.message?.includes('404') || error.message?.includes('Not Found')) {
      console.log('Document request not found (404) - platform members need to create it first');
      return [];
    }
    if (error.message === "BACKEND_NOT_AVAILABLE" || error.message.includes("BACKEND_NOT_AVAILABLE")) {
      return [];
    }
    throw error;
  }
}

// Upload incorporation document
// According to incorporation.api.md: Files must be uploaded to library first, then attached using fileIds
// POST /api/v1/incorporation/:incorporationCycleId/document-requests/requested-documents/:id/files expects { fileIds: ["uuid"] }
export async function uploadIncorporationDocument(incorporationCycleId: string, documentId: string, file: File): Promise<void> {
  try {
    console.log('Starting incorporation document upload:', { incorporationCycleId, documentId, fileName: file.name, fileSize: file.size });
    
    // Step 1: Get document request to get folderId
    // According to incorporation.api.md: GET /api/v1/incorporation/:incorporationCycleId/document-requests
    const docResponse = await request("GET", `incorporation/${incorporationCycleId}/document-requests`);
    let documentRequest = docResponse.data || docResponse;
    
    // Handle case where response is an array (multiple document requests)
    if (Array.isArray(documentRequest) && documentRequest.length > 0) {
      documentRequest = documentRequest[0];
    }
    
    console.log('Document request response:', documentRequest);
    
    if (!documentRequest) {
      throw new Error('Document request not found for incorporation cycle');
    }
    
    if (!documentRequest.folderId) {
      throw new Error('Folder not created for document request. Please contact platform support.');
    }

    console.log('Uploading file to library with folderId:', documentRequest.folderId);
    
    // Step 2: Upload file to library first
    // According to file.api.md: POST /api/v1/library/files/upload
    const fileId = await uploadFileToLibrary(file, documentRequest.folderId, ['document-request', 'incorporation']);
    
    console.log('File uploaded to library, fileId:', fileId);

    // Step 3: Attach file to requested document
    // According to incorporation.api.md: POST /api/v1/incorporation/:incorporationCycleId/document-requests/requested-documents/:id/files
    console.log('Attaching file to requested document');
    await request("POST", `incorporation/${incorporationCycleId}/document-requests/requested-documents/${documentId}/files`, {
      body: {
        fileIds: [fileId]
      }
    });
    
    console.log('Incorporation document uploaded successfully');
  } catch (error: any) {
    console.error('Error uploading incorporation document:', error);
    if (error.message === "BACKEND_NOT_AVAILABLE" || error.message.includes("BACKEND_NOT_AVAILABLE")) {
      // Store upload info in localStorage for development
      const uploads = JSON.parse(localStorage.getItem('incorporation-uploads') || '{}');
      uploads[documentId] = {
        fileName: file.name,
        fileSize: file.size,
        uploadedAt: new Date().toISOString(),
        status: 'uploaded',
        progress: 100,
      };
      localStorage.setItem('incorporation-uploads', JSON.stringify(uploads));
      return;
    }
    throw error;
  }
}

