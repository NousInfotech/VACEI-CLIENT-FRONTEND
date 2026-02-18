// Use VACEI backend URL for company data
const apiUrl = process.env.NEXT_PUBLIC_VACEI_BACKEND_URL?.replace(/\/?$/, "/") || "http://localhost:5000/api/v1/";
const backendUrl = apiUrl;

// Get auth token from localStorage
function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("token") || "";
  return { Authorization: `Bearer ${token}` };
}

// ============================================================================
// TYPES
// ============================================================================



export interface PersonDetails {
  _id: string;
  name: string;
  nationality: string;
  address: string;
  supportingDocuments: any[];
  id: string;
}

export interface PerShareValue {
  value: number;
  currency: string;
}

export interface ShareClassData {
  totalShares: number;
  class: string;
  type: string;
}

export interface Shareholder {
  personId: PersonDetails;
  sharePercentage: number;
  paidUpSharesPercentage: number;
  sharesData: ShareClassData[];
  _id: string;
  id: string;
}

export interface RepresentationalSchema {
  personId: PersonDetails;
  role: string[];
  _id: string;
  id: string;
}

export interface CorporateEntity {
  _id: string;
  clientId: string;
  name: string;
  registrationNumber: string;
  id: string;
}

export interface ShareholdingCompany {
  companyId: CorporateEntity;
  sharesData: ShareClassData[];
  sharePercentage?: number;
  paidUpSharesPercentage: number;
  _id: string;
  id: string;
}

export interface RepresentationalCompany {
  companyId: CorporateEntity;
  role: string[];
  _id: string;
  id: string;
}

export interface Company {
  _id: string;
  clientId: string;
  organizationId: string;
  name: string;
  registrationNumber: string;
  address: string;
  description?: string;
  supportingDocuments: any[];
  authorizedShares: number;
  issuedShares: number;
  perShareValue: PerShareValue;
  totalShares: ShareClassData[];
  shareHoldingCompanies: ShareholdingCompany[];
  shareHolders: Shareholder[];
  representationalSchema: RepresentationalSchema[];
  representationalCompany: RepresentationalCompany[];
  createdAt: string;
  updatedAt: string;
  __v: number;
  companyStartedAt: string | null;
  industry?: string; 
  incorporationDate?: string;
  id: string;
}


export interface HierarchyShareData {
  totalShares: number;
  class: string;
  type: string;
}

export interface HierarchyNode {
  id: string;
  name: string;
  type: "person" | "company";
  address: string;
  sharesData: HierarchyShareData[];
  totalShares: number;
  roles: string[];
  nationality?: string;
  children?: HierarchyNode[];
}

export interface HierarchyData {
  id: string;
  name: string;
  totalShares: HierarchyShareData[];
  type: string;
  address: string;
  shareholders: HierarchyNode[];
}


// Engagement Types
export interface Engagement {
  _id: string;
  title: string;
  yearEndDate: string;
  clientId: string;
  companyId: string;
  organizationId?: string;
  documentRequests?: Array<any>;
  procedures?: Array<any>;
  trialBalanceDoc?: any;
}

// Extended Trial Balance Types
export interface ExtendedTrialBalance {
  _id: string;
  engagement: string;
  rows: Array<{
    _id?: string;
    rowId?: string;
    code?: string;
    accountName?: string;
    currentYear?: number;
    priorYear?: number;
    adjustments?: number;
    reclassifications?: number;
    finalBalance?: number;
    classification?: string;
  }>;
}

// Adjustment Types
export interface Adjustment {
  _id: string;
  engagementId: string;
  etbId: string;
  rowId: string;
  dr: number;
  cr: number;
  value: number;
  refs: string[];
  status?: string;
  entries?: Array<any>;
}

// Reclassification Types
export interface Reclassification {
  _id: string;
  engagementId: string;
  etbId: string;
  rowId: string;
  dr: number;
  cr: number;
  value: number;
  refs: string[];
  status?: string;
  entries?: Array<any>;
}

// KYC Types
export interface KYC {
  _id: string;
  companyId: string;
  [key: string]: any;
}

// Document Request Types
export interface DocumentRequest {
  _id: string;
  engagementId: string;
  title?: string;
  description?: string;
  documents?: Array<any>;
  [key: string]: any;
}

export interface UploadDocumentResponse {
  success: boolean;
  message: string;
  documentRequest: DocumentRequest;
}

export interface ClearDocumentResponse {
  success: boolean;
  message: string;
  document: any;
}

// ============================================================================
// 2. COMPANY APIs
// ============================================================================

/**
 * Get companies by client ID (from middleware)
 * @returns Promise<Company[]>
 */
export async function getCompanies(): Promise<Pick<Company, "_id" | "name" | "registrationNumber">[]> {
  try {
    const response = await fetch(`${backendUrl}companies`, {
    method: "GET",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
      credentials: 'include',
  });

  if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || error.message || "Failed to fetch companies");
  }

    const result = await response.json();
    
    // Backend returns { success: true, data: [...], message: "..." }
    // Extract the data field if present, otherwise use the whole response
    const companiesData = result.data || result || [];
    
    // Ensure it's an array
    if (!Array.isArray(companiesData)) {
      console.warn('getCompanies: Expected array but got:', typeof companiesData, companiesData);
      return [];
    }
    
    // Transform Supabase company format to frontend format
    return companiesData.map((company: any) => ({
      _id: company.id || company._id,
      id: company.id || company._id,
      name: company.name,
      registrationNumber: company.registrationNumber,
    }));
  } catch (error) {
    console.error('Error fetching companies:', error);
    throw error;
  }
}

/**
 * Get company by ID
 * @param id - Company ID
 * @returns Promise<Company>
 */
export async function getCompanyById(id: string): Promise<Company> {
  // Fetch from VACEI backend
  const response = await fetch(`${backendUrl}companies/${id}`, {
    method: "GET",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.error || errorData.message || `Failed to fetch company: ${response.status}`;
    throw new Error(errorMessage);
  }

  const result = await response.json();
  // Backend returns { success: true, data: {...}, message: "..." }
  // Extract the data field if present, otherwise use the whole response
  const companyData = result.data || result;
  
  // Ensure the company data has both _id and id fields for compatibility
  if (companyData.id && !companyData._id) {
    companyData._id = companyData.id;
  }
  if (companyData._id && !companyData.id) {
    companyData.id = companyData._id;
  }
  
  return companyData as Company;
}
/**
 * Get company hierarchy by ID
 * @param id - Company ID
 * @returns Promise<HierarchyResponse>
 */
export async function getCompanyHierarchy(id: string): Promise<HierarchyData> {
  const response = await fetch(`${backendUrl}companies/${id}/hierarchy`, {
    method: "GET",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || error.message || "Failed to fetch company hierarchy");
  }

  const result = await response.json();
  // Backend returns { success: true, data: {...}, message: "..." }
  // Extract the data field if present, otherwise use the whole response
  return result.data || result;
}

// ============================================================================
// 3. KYC APIs
// ============================================================================

/**
 * Get KYC by company ID
 * @param companyId - Company ID (query parameter)
 * @returns Promise<KYC>
 */
export async function getKycByCompanyId(companyId: string): Promise<KYC> {
  const response = await fetch(`${backendUrl}kyc?companyId=${companyId}`, {
    method: "GET",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch KYC");
  }

  return response.json();
}

// ============================================================================
// 4. ENGAGEMENT APIs
// ============================================================================

/**
 * Get engagements by client ID (from middleware)
 * @param companyId - Optional company ID to filter engagements
 * @param signal - Optional AbortSignal to cancel the request
 * @returns Promise<Engagement[]>
 */
export async function getEngagements(companyId?: string, signal?: AbortSignal): Promise<Engagement[]> {
  const url = new URL(`${backendUrl}engagements`);
  if (companyId) {
    url.searchParams.append('companyId', companyId);
  }

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
    signal,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || error.error || "Failed to fetch engagements");
  }

  const result = await response.json();
  // Backend returns { success: true, data: [...], message: "..." }
  // Extract the data field if present, otherwise use the whole response
  return result.data || result || [];
}

/**
 * Get engagement by ID
 * @param id - Engagement ID
 * @param signal - Optional AbortSignal to cancel the request
 * @returns Promise<Engagement>
 */
export async function getEngagementById(id: string, signal?: AbortSignal): Promise<Engagement> {
  const response = await fetch(`${backendUrl}engagements/${id}`, {
    method: "GET",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
    signal,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch engagement");
  }

  const result = await response.json();
  // Backend returns { success: true, data: {...} }
  return result.data || result;
}

// ============================================================================
// 4.1 ENGAGEMENT MILESTONES & UPDATES APIs (READ-ONLY)
// ============================================================================

export interface EngagementMilestone {
  id: string;
  engagementId: string;
  title: string;
  description: string | null;
  status: "PENDING" | "ACHIEVED";
  createdById: string;
  markedById: string | null;
  createdAt: string;
  updatedAt: string;
  creator: { id: string; firstName: string; lastName: string };
  marker: { id: string; firstName: string; lastName: string } | null;
}

export async function getEngagementMilestones(
  engagementId: string,
  signal?: AbortSignal,
): Promise<EngagementMilestone[]> {
  const response = await fetch(`${backendUrl}engagements/${engagementId}/milestones`, {
    method: "GET",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
    signal,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || error.error || "Failed to fetch milestones");
  }

  const result = await response.json();
  return result.data || result || [];
}

export interface EngagementUpdate {
  id: string;
  engagementId: string;
  title: string | null;
  message: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  creator: { id: string; firstName: string; lastName: string };
}

export async function getEngagementUpdates(
  engagementId: string,
  signal?: AbortSignal,
): Promise<EngagementUpdate[]> {
  const response = await fetch(`${backendUrl}engagements/${engagementId}/updates`, {
    method: "GET",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
    signal,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || error.error || "Failed to fetch updates");
  }

  const result = await response.json();
  return result.data || result || [];
}

// ============================================================================
// 4.2 ENGAGEMENT COMPLIANCES API (READ-ONLY)
// ============================================================================

export interface EngagementCompliance {
  id: string;
  engagementId: string;
  companyId: string;
  service: string;
  type: string;
  moduleId: string | null;
  customServiceCycleId: string | null;
  title: string;
  description: string | null;
  customerComment: string | null;
  startDate: string;
  deadline: string;
  status: "ACTION_REQUIRED" | "ACTION_TAKEN" | "IN_PROGRESS" | "PENDING" | "COMPLETED" | "OVERDUE";
  statusHistory?: Array<{
    status: string;
    changedAt: string;
    changedBy: { organizationMemberId: string };
    reason: string | null;
  }>;
  createdById: string | null;
  role: string;
  cta: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: {
    id: string;
    user: { id: string; firstName: string; lastName: string };
  };
  customServiceCycle?: { id: string; title: string } | null;
}

export async function getEngagementCompliances(
  engagementId: string,
  signal?: AbortSignal,
): Promise<EngagementCompliance[]> {
  const response = await fetch(`${backendUrl}engagements/${engagementId}/compliances`, {
    method: "GET",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
    signal,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || error.error || "Failed to fetch compliances");
  }

  const result = await response.json();
  return result.data || result || [];
}

export async function getEngagementComplianceById(
  engagementId: string,
  complianceId: string,
  signal?: AbortSignal,
): Promise<EngagementCompliance> {
  const response = await fetch(`${backendUrl}engagements/${engagementId}/compliances/${complianceId}`, {
    method: "GET",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
    signal,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || error.error || "Failed to fetch compliance");
  }

  const result = await response.json();
  return result.data || result;
}

/**
 * Update compliance status (CLIENT can only set ACTION_TAKEN)
 * PATCH /api/v1/engagements/:engagementId/compliances/:complianceId/status
 */
export async function updateComplianceStatus(
  engagementId: string,
  complianceId: string,
  payload: { status: "ACTION_TAKEN" },
  signal?: AbortSignal,
): Promise<EngagementCompliance> {
  const response = await fetch(
    `${backendUrl}engagements/${engagementId}/compliances/${complianceId}/status`,
    {
      method: "PATCH",
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal,
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || error.error || "Failed to update compliance status");
  }

  const result = await response.json();
  return result.data || result;
}

// ============================================================================
// 5. EXTENDED TRIAL BALANCE APIs
// ============================================================================

/**
 * Get Extended Trial Balance by engagement ID
 * @param engagementId - Engagement ID (query parameter)
 * @returns Promise<ExtendedTrialBalance>
 */
export async function getEtb(engagementId: string): Promise<ExtendedTrialBalance> {
  const response = await fetch(`${backendUrl}etb?engagementId=${engagementId}`, {
    method: "GET",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch Extended Trial Balance");
  }

  return response.json();
}

// ============================================================================
// 6. ADJUSTMENT APIs
// ============================================================================

/**
 * Get adjustments by ETB ID
 * @param etbId - Extended Trial Balance ID (query parameter)
 * @returns Promise<Adjustment[]>
 */
export async function getAdjustments(etbId: string): Promise<Adjustment[]> {
  const response = await fetch(`${backendUrl}adjustments?etbId=${etbId}`, {
    method: "GET",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch adjustments");
  }

  return response.json();
}

/**
 * Get adjustment by ID
 * @param id - Adjustment ID
 * @returns Promise<Adjustment>
 */
export async function getAdjustmentById(id: string): Promise<Adjustment> {
  const response = await fetch(`${backendUrl}adjustments/${id}`, {
    method: "GET",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch adjustment");
  }

  return response.json();
}

// ============================================================================
// 7. RECLASSIFICATION APIs
// ============================================================================

/**
 * Get reclassifications by ETB ID
 * @param etbId - Extended Trial Balance ID (query parameter)
 * @returns Promise<Reclassification[]>
 */
export async function getReclassifications(etbId: string): Promise<Reclassification[]> {
  const response = await fetch(`${backendUrl}reclassifications?etbId=${etbId}`, {
    method: "GET",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch reclassifications");
  }

  return response.json();
}

/**
 * Get reclassification by ID
 * @param id - Reclassification ID
 * @returns Promise<Reclassification>
 */
export async function getReclassificationById(id: string): Promise<Reclassification> {
  const response = await fetch(`${backendUrl}reclassifications/${id}`, {
    method: "GET",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch reclassification");
  }

  return response.json();
}

// ============================================================================
// 8. DOCUMENT REQUEST APIs
// ============================================================================

/**
 * Get document requests by engagement ID
 * @param engagementId - Engagement ID (query parameter)
 * @returns Promise<DocumentRequest[]>
 */
export async function getDocumentRequestsByEngagementId(
  engagementId: string
): Promise<DocumentRequest[]> {
  const response = await fetch(
    `${backendUrl}document-requests?engagementId=${engagementId}`,
    {
      method: "GET",
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch document requests");
  }

  return response.json();
}

/**
 * Upload documents to document request
 * @param requestId - Document Request ID
 * @param files - Array of File objects
 * @param body - Additional form data (optional)
 * @returns Promise<UploadDocumentResponse>
 */
export async function uploadDocumentRequestDocument(
  requestId: string,
  files: File[],
  body?: Record<string, any>
): Promise<UploadDocumentResponse> {
  const formData = new FormData();

  // Add files
  files.forEach((file) => {
    formData.append("files", file);
  });

  // Add additional body data if provided
  if (body) {
    Object.keys(body).forEach((key) => {
      formData.append(key, typeof body[key] === "string" ? body[key] : JSON.stringify(body[key]));
    });
  }

  const response = await fetch(`${backendUrl}document-requests/${requestId}/documents`, {
    method: "POST",
    headers: {
      ...getAuthHeaders(),
      // Don't set Content-Type for FormData, browser will set it with boundary
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to upload documents");
  }

  return response.json();
}

/**
 * Clear single document from document request
 * @param requestId - Document Request ID
 * @param docIndex - Document index to clear
 * @returns Promise<ClearDocumentResponse>
 */
export async function clearDocumentRequestDocument(
  requestId: string,
  docIndex: number
): Promise<ClearDocumentResponse> {
  const response = await fetch(
    `${backendUrl}document-requests/${requestId}/clear/${docIndex}`,
    {
      method: "POST",
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to clear document");
  }

  return response.json();
}

// ============================================================================
// EXPORT ALL APIs
// ============================================================================

export const accountingPortalApi = {

  // Company
  getCompanies,
  getCompanyById,
  getCompanyHierarchy,

  // KYC
  getKycByCompanyId,

  // Engagements
  getEngagements,
  getEngagementById,

  // Extended Trial Balance
  getEtb,

  // Adjustments
  getAdjustments,
  getAdjustmentById,

  // Reclassifications
  getReclassifications,
  getReclassificationById,

  // Document Requests
  getDocumentRequestsByEngagementId,
  uploadDocumentRequestDocument,
  clearDocumentRequestDocument,
};

