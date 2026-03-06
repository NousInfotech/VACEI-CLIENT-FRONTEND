const apiUrl = process.env.NEXT_PUBLIC_VACEI_BACKEND_URL?.replace(/\/?$/, "/") || "http://localhost:5000/api/v1/";
const backendUrl = apiUrl;

function getAuthHeaders(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem("token") || "";
  return { Authorization: `Bearer ${token}` };
}

export type FilingStatus = 'DRAFT' | 'CLIENT_REVIEW' | 'FILED' | 'CANCELLED';

export interface FilingFileView {
  id: string;
  fileId: string;
  file: {
    id: string;
    file_name: string;
    file_size?: number;
    url: string;
  };
}

export interface FilingItem {
  id: string;
  engagementId: string;
  name: string;
  folderId: string;
  status: FilingStatus;
  statusHistory: any[];
  createdAt: string;
  updatedAt: string;
  files: FilingFileView[];
  comments?: FilingCommentItem[];
  signOffs?: FilingSignOffItem[];
}

export interface FilingCommentItem {
  id: string;
  engagementFilingId: string;
  userId: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    role: string;
  };
  comment: string;
  parentCommentId: string | null;
  referencedFileIds?: string[];
  replies?: FilingCommentItem[];
  createdAt: string;
  updatedAt: string;
}

export interface FilingSignOffItem {
  id: string;
  engagementFilingId: string;
  userId: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  signOffStatus: boolean;
  createdAt: string;
}

/**
 * Get filings for an engagement
 * @param engagementId - Engagement ID
 * @returns Promise<FilingItem[]>
 */
export async function getFilings(engagementId: string): Promise<FilingItem[]> {
  const response = await fetch(`${backendUrl}engagements/${engagementId}/filings`, {
    method: "GET",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || error.error || "Failed to fetch filings");
  }

  const result = await response.json();
  return result.data || result || [];
}

/**
 * Get a single filing for an engagement
 */
export async function getFilingById(engagementId: string, filingId: string): Promise<FilingItem> {
  const response = await fetch(`${backendUrl}engagements/${engagementId}/filings/${filingId}`, {
    method: "GET",
    headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
  });
  if (!response.ok) throw new Error("Failed to fetch filing");
  const result = await response.json();
  return result.data;
}

/**
 * Get comments for a filing
 */
export async function getFilingComments(engagementId: string, filingId: string): Promise<FilingCommentItem[]> {
  const response = await fetch(`${backendUrl}engagements/${engagementId}/filings/${filingId}/comments`, {
    method: "GET",
    headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
  });
  if (!response.ok) throw new Error("Failed to fetch comments");
  const result = await response.json();
  return result.data || [];
}

/**
 * Add a comment to a filing
 */
export async function addFilingComment(
  engagementId: string, 
  filingId: string, 
  comment: string, 
  parentCommentId?: string, 
  referencedFileIds?: string[]
): Promise<FilingCommentItem> {
  const response = await fetch(`${backendUrl}engagements/${engagementId}/filings/${filingId}/comments`, {
    method: "POST",
    headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ comment, parentCommentId, referencedFileIds }),
  });
  if (!response.ok) throw new Error("Failed to add comment");
  const result = await response.json();
  return result.data;
}

/**
 * Get sign-offs for a filing
 */
export async function getFilingSignOffs(engagementId: string, filingId: string): Promise<FilingSignOffItem[]> {
  const response = await fetch(`${backendUrl}engagements/${engagementId}/filings/${filingId}/sign-offs`, {
    method: "GET",
    headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
  });
  if (!response.ok) throw new Error("Failed to fetch sign-offs");
  const result = await response.json();
  return result.data || [];
}

/**
 * Toggle sign-off for a filing
 */
export async function toggleFilingSignOff(engagementId: string, filingId: string, signOffStatus: boolean): Promise<FilingSignOffItem> {
  const response = await fetch(`${backendUrl}engagements/${engagementId}/filings/${filingId}/sign-offs`, {
    method: "POST",
    headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ signOffStatus }),
  });
  if (!response.ok) throw new Error("Failed to update sign-off");
  const result = await response.json();
  return result.data;
}
