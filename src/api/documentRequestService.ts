/**
 * Document Request API Service
 * APIs: GET all, Upload, Clear
 * Flow: Load requests → Display cards → Upload (PENDING) / Download+Clear (UPLOADED)
 */

const backendUrl =
  process.env.NEXT_PUBLIC_VACEI_BACKEND_URL?.replace(/\/?$/, "/") ||
  "http://localhost:5000/api/v1/";

function getAuthHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("token") || "";
  return { Authorization: `Bearer ${token}` };
}

function getErrorMessage(status: number, action: string): string {
  switch (status) {
    case 400: return `Invalid request. Please check your input and try again.`;
    case 401: return `Session expired. Please log in again.`;
    case 403: return `You don't have permission to ${action}.`;
    case 404: return `Resource not found. It may have been removed.`;
    case 413: return `File is too large. Please choose a smaller file.`;
    case 500: return `Server error. Please try again later.`;
    default: return `Failed to ${action}. Please try again.`;
  }
}

export interface DocumentFile {
  id: string;
  file_name: string;
  url: string;
  size?: number;
}

export interface DocumentItem {
  id: string;
  _id?: string;
  name?: string;
  documentName?: string;
  type?: string;
  count?: string;
  isMandatory?: boolean;
  status?: string;
  fileId?: string | null;
  templateFileId?: string | null;
  file?: DocumentFile | null;
  templateFile?: DocumentFile | null;
  children?: DocumentItem[];
  createdAt?: string;
}

export interface DocumentRequestDocumentMultiple {
  _id: string;
  name: string;
  instruction?: string;
  type?: string | { type: string };
  multiple: Array<{ id?: string; _id?: string; label: string; url?: string; [k: string]: any }>;
}

export interface DocumentRequest {
  id: string;
  _id?: string;
  title?: string;
  name?: string;
  category?: string;
  description?: string | null;
  status?: string;
  deadline?: string | null;
  engagementId?: string | null;
  documents?: DocumentItem[];
  requestedDocuments?: DocumentItem[];
  multipleDocuments?: DocumentRequestDocumentMultiple[];
  createdAt?: string;
}

/**
 * GET /document-requests?engagementId={engagementId}
 */
export async function getDocumentRequests(
  engagementId: string,
  signal?: AbortSignal
): Promise<DocumentRequest[]> {
  const response = await fetch(
    `${backendUrl}document-requests?engagementId=${engagementId}`,
    {
      method: "GET",
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      },
      signal,
    }
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    const msg = err.message || err.error || getErrorMessage(response.status, "fetch document requests");
    throw new Error(msg);
  }

  const result = await response.json();
  const data = result.data ?? result;
  return Array.isArray(data) ? data : [];
}

/**
 * POST /document-requests/{documentRequestId}/documents/{requestedDocumentId}/upload
 * Body: multipart/form-data, field "files" (max 10)
 */
export async function uploadDocumentRequestFile(
  documentRequestId: string,
  requestedDocumentId: string,
  files: File[],
  signal?: AbortSignal
): Promise<{ id: string; documentName: string; status: string; file?: DocumentFile }> {
  const formData = new FormData();
  files.forEach((f) => formData.append("files", f));

  const response = await fetch(
    `${backendUrl}document-requests/${documentRequestId}/documents/${requestedDocumentId}/upload`,
    {
      method: "POST",
      headers: getAuthHeaders(),
      body: formData,
      signal,
    }
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    const msg = err.message || err.error || getErrorMessage(response.status, "upload file");
    throw new Error(msg);
  }

  const result = await response.json();
  const data = result.data ?? result;
  return data;
}

/**
 * PATCH /document-requests/{documentRequestId}/documents/{requestedDocumentId}/clear
 * Body: { reason: string } (required)
 */
export async function clearDocumentRequestFile(
  documentRequestId: string,
  requestedDocumentId: string,
  reason: string,
  signal?: AbortSignal
): Promise<{ id: string; status: string }> {
  const response = await fetch(
    `${backendUrl}document-requests/${documentRequestId}/documents/${requestedDocumentId}/clear`,
    {
      method: "PATCH",
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ reason }),
      signal,
    }
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    const msg = err.message || err.error || getErrorMessage(response.status, "clear document");
    throw new Error(msg);
  }

  const result = await response.json();
  const data = result.data ?? result;
  return data;
}
/**
 * POST /document-requests/{documentRequestId}/bulk-upload
 * Body: multipart/form-data, field "files"
 */
export async function bulkUploadDocumentRequestFiles(
  documentRequestId: string,
  files: File[],
  signal?: AbortSignal
): Promise<any> {
  const formData = new FormData();
  files.forEach((f) => formData.append("files", f));

  const response = await fetch(
    `${backendUrl}document-requests/${documentRequestId}/bulk-upload`,
    {
      method: "POST",
      headers: getAuthHeaders(),
      body: formData,
      signal,
    }
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    const msg = err.message || err.error || getErrorMessage(response.status, "bulk upload files");
    throw new Error(msg);
  }

  const result = await response.json();
  const data = result.data ?? result;
  return data;
}
