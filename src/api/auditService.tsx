// ETB and audit-related data: use NEXT_PUBLIC_VACEI_BACKEND_URL (e.g. http://localhost:5000/api/v1)
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

export type ShareClass = 'CLASS_A' | 'CLASS_B' | 'CLASS_C' | 'ORDINARY' | 'A' | 'B' | 'C' | string;
export type RepresentationRole = 'DIRECTOR' | 'SHAREHOLDER' | 'LEGAL_REPRESENTATIVE' | 'JUDICIAL_REPRESENTATIVE' | 'SECRETARY';

export interface CompanyShareClass {
  id: string;
  class: ShareClass;
  issued: number;
  perShareValue?: number;
}

export interface CompanyInvolvement {
  id: string;
  partyType?: 'PERSON' | 'COMPANY';
  role: RepresentationRole[];
  classA: number;
  classB: number;
  classC: number;
  ordinary: number;
  classAPaidUpPercentage?: number;
  classBPaidUpPercentage?: number;
  classCPaidUpPercentage?: number;
  ordinaryPaidUpPercentage?: number;
  person?: {
    id: string;
    name: string;
    address: string;
    nationality: string;
    email?: string;
    phone?: string;
  } | null;
  holderCompany?: {
    id: string;
    name: string;
    address: string;
    registrationNumber: string;
  } | null;
}



export interface PersonDetails {
  _id: string;
  name: string;
  nationality: string;
  address: string;
  email?: string;
  phone?: string;
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
  perShareValue?: number;
  paidUpPercentage?: number;
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
  shareClasses?: CompanyShareClass[];
  involvements?: CompanyInvolvement[];
  createdAt: string;
  updatedAt: string;
  __v: number;
  companyStartedAt: string | null;
  industry?: string;
  incorporationDate?: string;
  id: string;
  /** Library root folder ID for this company (when set, company library shows only this folder). */
  folderId?: string | null;
  incorporationStatus?: boolean;
  kycStatus?: boolean;
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
  serviceType: any;
  serviceCategory: any;
  id: string;
  _id: string;
  title: string;
  yearEndDate: string;
  clientId: string;
  companyId: string;
  organizationId?: string;
  organizationName?: string;
  documentRequests?: Array<any>;
  procedures?: Array<any>;
  trialBalanceDoc?: any;
  /** Partner/org team members - used for direct chat when engagement room access is denied */
  orgTeam?: Array<{ userId: string;[k: string]: unknown }>;
  rejectionReason?: string;
  createdAt?: string;
  updatedAt?: string;

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

// Adjustment Types (mapped from audit-entries type=ADJUSTMENT)
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
  /** Adjustment code from backend (e.g. AJ001) */
  code?: string;
}

// Reclassification Types (mapped from audit-entries type=RECLASSIFICATION)
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
  /** Reclassification code from backend (e.g. RC001) */
  code?: string;
}

// ----------------------------------------------------------------------------
// KYC V2 Types
// ----------------------------------------------------------------------------

export interface FileResponse {
  id: string;
  url: string;
  file_name: string;
  size: number;
  mime_type: string;
}

export interface RequestedDocument {
  id: string;
  documentRequestId: string;
  parentId?: string | null;
  documentName: string;
  type: 'DIRECT' | 'TEMPLATE';
  count: 'SINGLE' | 'MULTIPLE';
  isMandatory: boolean;
  status: 'PENDING' | 'UPLOADED' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
  fileId?: string | null;
  templateFileId?: string | null;
  file?: FileResponse | null;
  templateFile?: FileResponse | null;
  rejectionReason?: string;
  children?: RequestedDocument[];
}

export interface KycDocumentRequest {
  id: string;
  title: string;
  description?: string;
  status: string;
  requestedDocuments: RequestedDocument[];
}

export type DocumentRequest = KycDocumentRequest;

export interface UploadDocumentResponse {
  success: boolean;
  message: string;
  data?: any;
}

export interface ClearDocumentResponse {
  success: boolean;
  message: string;
  data?: any;
}

export interface KycWorkflowItem {
  id: string;
  kycCycleId: string;
  personId?: string;
  companyId?: string;
  status: string;
  documentRequest: KycDocumentRequest;
  person?: {
    id: string;
    name: string;
    address?: string;
    nationality?: string;
  };
}

export interface KycCycle {
  id: string;
  companyId: string;
  status: string;
  workflowType: 'Shareholder' | 'Representative';
  involvementKycs: KycWorkflowItem[];
}

// ============================================================================
// 2. COMPANY APIs
// ============================================================================

/**
 * Get companies by client ID (from middleware)
 * @returns Promise<Company[]>
 */
export async function getCompanies(): Promise<Pick<Company, "_id" | "name" | "registrationNumber" | "incorporationStatus" | "kycStatus">[]> {
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
      incorporationStatus: company.incorporationStatus,
      kycStatus: company.kycStatus,
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
export async function getKycByCompanyId(companyId: string): Promise<any[]> {
  const response = await fetch(`${backendUrl}companies/${companyId}/kyc`, {
    method: "GET",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || error.message || "Failed to fetch KYC");
  }

  const result = await response.json();
  // V2 returns { success: true, data: {...}, message: "..." }
  const data = result && typeof result === 'object' && 'data' in result ? result.data : result;
  if (!data) return [];
  return Array.isArray(data) ? data : [data];
}

export interface IncorporationCycle {
  id: string;
  companyId: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED';
  startedAt: string;
  completedAt: string | null;
  documentRequests?: KycDocumentRequest[];
}

/**
 * Get Incorporation Cycle by company ID
 * @param companyId - Company ID
 * @returns Promise<IncorporationCycle | null>
 */
export async function getIncorporationByCompanyId(companyId: string): Promise<IncorporationCycle | null> {
  const response = await fetch(`${backendUrl}incorporation/company/${companyId}`, {
    method: "GET",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    if (response.status === 404) return null;
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || error.message || "Failed to fetch incorporation data");
  }

  const result = await response.json();
  return result.data || result;
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
    let message = "Failed to fetch engagement";
    try {
      const error = await response.json();
      message = error.message || error.error || message;
    } catch {
      message = response.status === 403
        ? "Not authorized to access this engagement"
        : response.status === 404
          ? "Engagement not found"
          : message;
    }
    throw new Error(message);
  }

  const result = await response.json();
  // Backend returns { success: true, data: {...} }; API uses "id", UI often expects "_id"
  const raw = result.data || result;
  if (raw && typeof raw.id === "string" && raw._id === undefined) {
    return { ...raw, _id: raw.id };
  }
  return raw;
}

// ============================================================================
// 4.1 ENGAGEMENT MILESTONES & UPDATES APIs (READ-ONLY)
// ============================================================================

export interface EngagementMilestone {
  id: string;
  engagementId: string;
  title: string;
  description: string | null;
  status: "PENDING" | "ACHIEVED" | "CANCELLED";
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

export async function updateEngagementMilestoneStatus(
  engagementId: string,
  milestoneId: string,
  status: "PENDING" | "ACHIEVED" | "CANCELLED",
  signal?: AbortSignal
): Promise<EngagementMilestone> {
  const response = await fetch(`${backendUrl}engagements/${engagementId}/milestones/${milestoneId}/status`, {
    method: "PATCH",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
    signal,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || error.error || "Failed to update milestone status");
  }

  const result = await response.json();
  return result.data || result;
}

export async function updateEngagementMilestone(
  engagementId: string,
  milestoneId: string,
  data: { title?: string; description?: string | null },
  signal?: AbortSignal
): Promise<EngagementMilestone> {
  const response = await fetch(`${backendUrl}engagements/${engagementId}/milestones/${milestoneId}`, {
    method: "PATCH",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
    signal,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || error.error || "Failed to update milestone");
  }

  const result = await response.json();
  return result.data || result;
}

export async function deleteEngagementMilestone(
  engagementId: string,
  milestoneId: string,
  signal?: AbortSignal
): Promise<void> {
  const response = await fetch(`${backendUrl}engagements/${engagementId}/milestones/${milestoneId}`, {
    method: "DELETE",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
    signal,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || error.error || "Failed to delete milestone");
  }
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

/**
 * Get compliances for an engagement.
 * When companyId is provided, uses the working Compliance Calendar API (GET /compliance-calendar?type=COMPANY&companyId=...).
 * When companyId is not provided, tries the legacy route (404) and returns [].
 */
export async function getEngagementCompliances(
  engagementId: string,
  options?: { companyId?: string; signal?: AbortSignal },
): Promise<EngagementCompliance[]> {
  const companyId = options?.companyId;
  const signal = options?.signal;

  if (companyId) {
    const { listComplianceCalendars } = await import("@/api/complianceCalendarService");
    const entries = await listComplianceCalendars({ type: "COMPANY", companyId });
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return entries.map((e) => {
      const dueDate = new Date(e.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      const isPast = dueDate.getTime() < today.getTime();
      const isToday = dueDate.getTime() === today.getTime();
      const status: EngagementCompliance["status"] = isPast ? "OVERDUE" : isToday ? "ACTION_REQUIRED" : "PENDING";
      return {
        id: e.id,
        engagementId,
        companyId: e.companyId ?? companyId,
        service: e.serviceCategory,
        type: e.type,
        moduleId: null,
        customServiceCycleId: e.customServiceCycleId,
        title: e.title,
        description: e.description,
        customerComment: null,
        startDate: e.startDate,
        deadline: e.dueDate,
        status,
        cta: "Mark as done",
        createdAt: e.createdAt,
        updatedAt: e.updatedAt,
        createdById: e.createdById,
        role: "",
        customServiceCycle: e.customServiceCycle,
        _fromComplianceCalendar: true,
      } as EngagementCompliance & { _fromComplianceCalendar?: boolean };
    });
  }

  const response = await fetch(`${backendUrl}engagements/${engagementId}/compliances`, {
    method: "GET",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
    signal,
  });

  if (!response.ok) {
    if (response.status === 404) return [];
    const error = await response.json().catch(() => ({ message: "Failed to fetch compliances" }));
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

const authFetch = (url: string, init?: RequestInit) =>
  fetch(url, {
    ...init,
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

/**
 * Get Extended Trial Balance by engagement ID.
 * Uses the same backend flow as VACEI_PARTNER_PORTAL: audit-cycles → trial-balances → with-accounts.
 * All requests use NEXT_PUBLIC_VACEI_BACKEND_URL (e.g. http://localhost:5000/api/v1).
 */
export async function getEtb(engagementId: string): Promise<ExtendedTrialBalance> {
  const base = backendUrl;

  // 1) Get audit cycles for this engagement (same as partner useETBData)
  const cyclesRes = await authFetch(
    `${base}audit-cycles?engagementId=${encodeURIComponent(engagementId)}`
  );
  if (!cyclesRes.ok) {
    const err = await cyclesRes.json().catch(() => ({}));
    throw new Error(err.error || err.message || "Failed to fetch audit cycles");
  }
  const cyclesPayload = await cyclesRes.json();
  const cycles = cyclesPayload?.data ?? cyclesPayload;
  const cyclesList = Array.isArray(cycles) ? cycles : [];
  const auditCycle = cyclesList[0] ?? null;
  const auditCycleId = auditCycle?.id;
  if (!auditCycleId) {
    return {
      _id: "",
      engagement: engagementId,
      rows: [],
    };
  }

  // 2) Get trial balances for this audit cycle
  const tbRes = await authFetch(`${base}audit-cycles/${auditCycleId}/trial-balances`);
  if (!tbRes.ok) {
    const err = await tbRes.json().catch(() => ({}));
    throw new Error(err.error || err.message || "Failed to fetch trial balances");
  }
  const tbPayload = await tbRes.json();
  const trialBalances = tbPayload?.data ?? tbPayload;
  const tbList = Array.isArray(trialBalances) ? trialBalances : [];
  const currentTb =
    tbList.find((tb: { role?: string }) => tb.role === "CURRENT") ?? tbList[0] ?? null;
  const trialBalanceId = currentTb?.id;
  if (!trialBalanceId) {
    return {
      _id: auditCycleId,
      engagement: engagementId,
      rows: [],
    };
  }

  // 3) Get trial balance with accounts (ETB rows)
  const withAccountsRes = await authFetch(
    `${base}audit-cycles/${auditCycleId}/trial-balances/${trialBalanceId}/with-accounts`
  );
  if (!withAccountsRes.ok) {
    const err = await withAccountsRes.json().catch(() => ({}));
    throw new Error(err.error || err.message || "Failed to fetch trial balance with accounts");
  }
  const withAccountsPayload = await withAccountsRes.json();
  const data = withAccountsPayload?.data ?? withAccountsPayload;
  const accounts = data?.accounts ?? [];
  if (!Array.isArray(accounts) || accounts.length === 0) {
    return {
      _id: trialBalanceId,
      engagement: engagementId,
      rows: [],
    };
  }

  const parseAmount = (value: unknown): number => {
    if (value === null || value === undefined || value === "-") return 0;
    if (typeof value === "number") return value;
    const parsed = parseFloat(String(value));
    return Number.isNaN(parsed) ? 0 : parsed;
  };

  const rows = accounts.map((account: Record<string, unknown>, index: number) => {
    const parts = [
      account.group1,
      account.group2,
      account.group3,
      account.group4,
    ].filter(Boolean) as string[];
    const classification = parts.join(" > ") || "";
    return {
      _id: String(account.id ?? index),
      rowId: String(account.id ?? index),
      code: String(account.code ?? ""),
      accountName: String(account.accountName ?? ""),
      currentYear: parseAmount(account.currentYear),
      priorYear: parseAmount(account.priorYear),
      adjustments: parseAmount(account.adjustmentAmount),
      reclassifications: parseAmount(account.reclassificationAmount),
      finalBalance: parseAmount(account.finalBalance),
      classification,
    };
  });

  return {
    _id: trialBalanceId,
    engagement: engagementId,
    rows,
  };
}

// ============================================================================
// 6. ADJUSTMENT APIs (use audit-entries like VACEI_PARTNER_PORTAL)
// ============================================================================

/**
 * Resolve auditCycleId and trialBalanceId for an engagement (same flow as getEtb).
 */
async function resolveAuditCycleAndTrialBalance(
  engagementId: string
): Promise<{ auditCycleId: string; trialBalanceId: string } | null> {
  const base = backendUrl;
  const cyclesRes = await authFetch(
    `${base}audit-cycles?engagementId=${encodeURIComponent(engagementId)}`
  );
  if (!cyclesRes.ok) return null;
  const cyclesPayload = await cyclesRes.json();
  const cycles = cyclesPayload?.data ?? cyclesPayload;
  const cyclesList = Array.isArray(cycles) ? cycles : [];
  const auditCycle = cyclesList[0] ?? null;
  const auditCycleId = auditCycle?.id;
  if (!auditCycleId) return null;

  const tbRes = await authFetch(`${base}audit-cycles/${auditCycleId}/trial-balances`);
  if (!tbRes.ok) return null;
  const tbPayload = await tbRes.json();
  const trialBalances = tbPayload?.data ?? tbPayload;
  const tbList = Array.isArray(trialBalances) ? trialBalances : [];
  const currentTb =
    tbList.find((tb: { role?: string }) => tb.role === "CURRENT") ?? tbList[0] ?? null;
  const trialBalanceId = currentTb?.id;
  if (!trialBalanceId) return null;

  return { auditCycleId, trialBalanceId };
}

/**
 * Get adjustments for an engagement.
 * Uses the same backend as VACEI_PARTNER_PORTAL: audit-cycles → trial-balances → audit-entries, filtered by type ADJUSTMENT.
 * @param engagementId - Engagement ID (not etbId)
 * @returns Promise<Adjustment[]>
 */
export async function getAdjustments(engagementId: string): Promise<Adjustment[]> {
  const resolved = await resolveAuditCycleAndTrialBalance(engagementId);
  if (!resolved) return [];

  const { auditCycleId, trialBalanceId } = resolved;
  const base = backendUrl;
  const res = await authFetch(
    `${base}audit-cycles/${auditCycleId}/trial-balances/${trialBalanceId}/audit-entries`
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || err.error || "Failed to fetch audit entries");
  }
  const payload = await res.json();
  const list = payload?.data ?? payload;
  const entries = Array.isArray(list) ? list : [];

  const adjustments = entries
    .filter((entry: { type?: string }) => entry.type === "ADJUSTMENT")
    .map((entry: Record<string, unknown>) => {
      const lines = (entry.lines as Array<Record<string, unknown>>) ?? [];
      let dr = 0;
      let cr = 0;
      const entriesMapped = lines.map((line: Record<string, unknown>) => {
        const value = Number(line.value) ?? 0;
        const isDebit = line.type === "DEBIT";
        if (isDebit) dr += value;
        else cr += value;
        const account = (line.trialBalanceAccount as Record<string, unknown>) ?? {};
        return {
          code: String(account.code ?? ""),
          accountName: String(account.accountName ?? ""),
          dr: isDebit ? value : 0,
          cr: isDebit ? 0 : value,
        };
      });
      return {
        _id: String(entry.id ?? entry._id ?? ""),
        engagementId,
        etbId: trialBalanceId,
        rowId: "",
        dr,
        cr,
        value: dr - cr,
        refs: entry.description ? [String(entry.description)] : [],
        status: (entry.status as string) ?? "DRAFT",
        entries: entriesMapped,
        code: entry.code != null ? String(entry.code) : undefined,
      } as Adjustment;
    });

  return adjustments;
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
// 7. RECLASSIFICATION APIs (use audit-entries like VACEI_PARTNER_PORTAL)
// ============================================================================

/**
 * Get reclassifications for an engagement.
 * Uses the same backend as VACEI_PARTNER_PORTAL: audit-cycles → trial-balances → audit-entries, filtered by type RECLASSIFICATION.
 * @param engagementId - Engagement ID (not etbId)
 * @returns Promise<Reclassification[]>
 */
export async function getReclassifications(engagementId: string): Promise<Reclassification[]> {
  const resolved = await resolveAuditCycleAndTrialBalance(engagementId);
  if (!resolved) return [];

  const { auditCycleId, trialBalanceId } = resolved;
  const base = backendUrl;
  const res = await authFetch(
    `${base}audit-cycles/${auditCycleId}/trial-balances/${trialBalanceId}/audit-entries`
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || err.error || "Failed to fetch audit entries");
  }
  const payload = await res.json();
  const list = payload?.data ?? payload;
  const entries = Array.isArray(list) ? list : [];

  const reclassifications = entries
    .filter((entry: { type?: string }) => entry.type === "RECLASSIFICATION")
    .map((entry: Record<string, unknown>) => {
      const lines = (entry.lines as Array<Record<string, unknown>>) ?? [];
      let dr = 0;
      let cr = 0;
      const entriesMapped = lines.map((line: Record<string, unknown>) => {
        const value = Number(line.value) ?? 0;
        const isDebit = line.type === "DEBIT";
        if (isDebit) dr += value;
        else cr += value;
        const account = (line.trialBalanceAccount as Record<string, unknown>) ?? {};
        return {
          code: String(account.code ?? ""),
          accountName: String(account.accountName ?? ""),
          dr: isDebit ? value : 0,
          cr: isDebit ? 0 : value,
        };
      });
      return {
        _id: String(entry.id ?? entry._id ?? ""),
        engagementId,
        etbId: trialBalanceId,
        rowId: "",
        dr,
        cr,
        value: dr - cr,
        refs: entry.description ? [String(entry.description)] : [],
        status: (entry.status as string) ?? "DRAFT",
        entries: entriesMapped,
        code: entry.code != null ? String(entry.code) : undefined,
      } as Reclassification;
    });

  return reclassifications;
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
 * Upload documents to a specific requested document requirement
 * @param requestId - Document Request ID (the container)
 * @param requestedDocumentId - The specific requirement ID
 * @param files - Array of File objects
 * @returns Promise<UploadDocumentResponse>
 */
export async function uploadRequestedDocument(
  requestId: string,
  requestedDocumentId: string,
  files: File[]
): Promise<UploadDocumentResponse> {
  const formData = new FormData();

  // Add files
  files.forEach((file) => {
    formData.append("files", file);
  });

  const response = await fetch(`${backendUrl}document-requests/${requestId}/documents/${requestedDocumentId}/upload`, {
    method: "POST",
    headers: {
      ...getAuthHeaders(),
      // Don't set Content-Type for FormData, browser will set it with boundary
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || error.message || "Failed to upload documents");
  }

  const result = await response.json();
  return result.data || result;
}

/**
 * Clear single document from document request
 * @param requestId - Document Request ID
 * @param docIndex - Document index to clear
 * @returns Promise<ClearDocumentResponse>
 */
/**
 * Clear single document from document request
 * @param requestId - Document Request ID
 * @param requestedDocumentId - Specific document ID to clear
 * @param reason - Reason for clearing (required by backend)
 * @returns Promise<ClearDocumentResponse>
 */
export async function clearRequestedDocument(
  requestId: string,
  requestedDocumentId: string,
  reason: string = "Cleared by user"
): Promise<ClearDocumentResponse> {
  const response = await fetch(
    `${backendUrl}document-requests/${requestId}/documents/${requestedDocumentId}/clear`,
    {
      method: "PATCH",
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ reason }),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || error.message || "Failed to clear document");
  }

  const result = await response.json();
  return result.data || result;
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
  uploadRequestedDocument,
  clearRequestedDocument,
};

