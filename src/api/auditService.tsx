// const apiUrl = (process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/?$/, "/") || "http://localhost:8000/api/");
const apiUrl = process.env.NEXT_PUBLIC_AUDIT_BACKEND_URL?.replace(/\/?$/, "/") || "";
const backendUrl = apiUrl + "accounting-portal";

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

export interface HierarchyResponse {
  success: boolean;
  data: HierarchyData;
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
  const response = await fetch(`${backendUrl}/companies`, {
    method: "GET",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch companies");
  }

  return response.json();
}

/**
 * Get company by ID
 * @param id - Company ID
 * @returns Promise<Company>
 */
export async function getCompanyById(id: string): Promise<Company> {
  const response = await fetch(`${backendUrl}/companies/${id}`, {
    method: "GET",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch company");
  }

  return response.json();
}
/**
 * Get company hierarchy by ID
 * @param id - Company ID
 * @returns Promise<HierarchyResponse>
 */
export async function getCompanyHierarchy(id: string): Promise<HierarchyResponse> {
  const response = await fetch(`${backendUrl}/companies/${id}/hierarchy`, {
    method: "GET",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch company hierarchy");
  }

  return response.json();
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
  const response = await fetch(`${backendUrl}/kyc?companyId=${companyId}`, {
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
 * @returns Promise<Engagement[]>
 */
export async function getEngagements(): Promise<Engagement[]> {
  const response = await fetch(`${backendUrl}/engagements`, {
    method: "GET",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch engagements");
  }

  return response.json();
}

/**
 * Get engagement by ID
 * @param id - Engagement ID
 * @returns Promise<Engagement>
 */
export async function getEngagementById(id: string): Promise<Engagement> {
  const response = await fetch(`${backendUrl}/engagements/${id}`, {
    method: "GET",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch engagement");
  }

  return response.json();
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
  const response = await fetch(`${backendUrl}/etb?engagementId=${engagementId}`, {
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
  const response = await fetch(`${backendUrl}/adjustments?etbId=${etbId}`, {
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
  const response = await fetch(`${backendUrl}/adjustments/${id}`, {
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
  const response = await fetch(`${backendUrl}/reclassifications?etbId=${etbId}`, {
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
  const response = await fetch(`${backendUrl}/reclassifications/${id}`, {
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
    `${backendUrl}/document-requests?engagementId=${engagementId}`,
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

  const response = await fetch(`${backendUrl}/document-requests/${requestId}/documents`, {
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
    `${backendUrl}/document-requests/${requestId}/clear/${docIndex}`,
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

