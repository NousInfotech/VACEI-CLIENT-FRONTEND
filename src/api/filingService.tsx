const apiUrl = process.env.NEXT_PUBLIC_VACEI_BACKEND_URL?.replace(/\/?$/, "/") || "http://localhost:5000/api/v1/";
const backendUrl = apiUrl;

function getAuthHeaders(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem("token") || "";
  return { Authorization: `Bearer ${token}` };
}

export type FilingStatus = 'DRAFT' | 'FILED' | 'CANCELLED';

export interface FilingItem {
  id: string;
  engagementId: string;
  name: string;
  fileId: string;
  folderId: string;
  status: FilingStatus;
  statusHistory: any[];
  createdAt: string;
  updatedAt: string;
  file?: {
    id: string;
    file_name: string;
    file_size: number;
    url: string;
  };
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
