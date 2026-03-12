/**
 * KYC Service for Client Portal
 * Handles token-based KYC verification flow.
 */

const API_BASE = process.env.NEXT_PUBLIC_VACEI_BACKEND_URL?.replace(/\/?$/, '/') || 'http://localhost:5000/api/v1/'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ShareClass {
  class: string
  issued: number
  authorized: number
  perShareValue: number | null
}

export interface CompanyDetails {
  id: string
  name: string
  registrationNumber: string
  vatNumber: string | null
  address: string
  legalType: string | null
  companyType: string | null
  authorizedShares?: number
  issuedShares?: number
  shareClasses?: ShareClass[]
  industry?: string | null
  summary?: string | null
  companyStartedAt?: string | null
}

export interface FileResponse {
  id: string
  url: string
  file_name: string
}

export interface RequestedDocument {
  id: string
  documentName: string
  type: 'DIRECT' | 'TEMPLATE'
  count: 'SINGLE' | 'MULTIPLE'
  isMandatory: boolean
  status: 'PENDING' | 'UPLOADED' | 'ACCEPTED' | 'REJECTED'
  parentId: string | null
  file: FileResponse | null
  templateFile: FileResponse | null
  rejectionReason?: string
  children?: RequestedDocument[]
}

export interface DocumentRequest {
  id: string
  title: string
  description?: string
  status: string
  requestedDocuments: RequestedDocument[]
}

export interface KycDetails {
  involvementKyc: {
    id: string
    documentRequestId: string
    status: string
    person: { id: string; name: string; email: string | null } | null
    role: string[]
  }
  documentRequest: DocumentRequest
  companyDetails: CompanyDetails | null
  clientUserDetails: { firstName: string; lastName: string; email: string | null } | null
}

export interface KycResponse<T> {
  ok: boolean
  data?: T
  expired?: boolean
  message: string
}

// ─── API calls ────────────────────────────────────────────────────────────────

/**
 * Fetch KYC details using a secure token.
 */
export async function fetchKycDetails(token: string): Promise<
  { ok: true; data: KycDetails } |
  { ok: false; expired: boolean; message: string }
> {
  const res = await fetch(`${API_BASE}kyc/involvement-kyc/get-details`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  })
  const json = await res.json()
  
  if (res.status === 403 && json.details?.expired) {
    return { ok: false, expired: true, message: json.message || 'Link has expired.' }
  }
  
  if (!res.ok) {
    return { ok: false, expired: false, message: json.message || 'Failed to load KYC details.' }
  }
  
  return { ok: true, data: json.data }
}

/**
 * Request a resend of the KYC email.
 */
export async function resendKycEmail(token: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE}kyc/involvement-kyc/resend-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  })
  const json = await res.json()
  
  if (!res.ok) return { success: false, message: json.message || 'Failed to resend email.' }
  
  return { success: true, message: json.message || 'Email resent successfully.' }
}

/**
 * Upload one or more files for a specific document request.
 */
export async function uploadKycDocument(
  requestedDocumentId: string,
  documentRequestId: string,
  token: string,
  files: File[]
): Promise<{ success: boolean; message: string }> {
  const formData = new FormData()
  files.forEach(f => formData.append('files', f))

  const res = await fetch(
    `${API_BASE}document-requests/${documentRequestId}/documents/${requestedDocumentId}/upload/involvment-kyc`,
    {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData,
    }
  )
  const json = await res.json()
  
  if (!res.ok) return { success: false, message: json.message || 'Upload failed.' }
  
  return { success: true, message: json.message || 'Uploaded successfully.' }
}

/**
 * Clear an uploaded KYC document.
 */
export async function clearKycDocument(
  requestedDocumentId: string,
  documentRequestId: string,
  token: string,
  reason: string = 'Removed by user'
): Promise<{ success: boolean; message: string }> {
  const res = await fetch(
    `${API_BASE}document-requests/${documentRequestId}/documents/${requestedDocumentId}/clear/involvment-kyc`,
    {
      method: 'PATCH',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ reason }),
    }
  )
  const json = await res.json()
  
  if (!res.ok) return { success: false, message: json.message || 'Clear failed.' }
  
  return { success: true, message: json.message || 'Document cleared successfully.' }
}

/**
 * Bulk upload multiple files for a document request.
 * The backend will attempt to match filenames to requested documents.
 */
export async function bulkUploadKycDocuments(
  documentRequestId: string,
  token: string,
  files: File[]
): Promise<{ success: boolean; message: string }> {
  const formData = new FormData()
  files.forEach(f => formData.append('files', f))

  const res = await fetch(
    `${API_BASE}document-requests/${documentRequestId}/bulk-upload/involvment-kyc`,
    {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData,
    }
  )
  const json = await res.json()
  
  if (!res.ok) return { success: false, message: json.message || 'Bulk upload failed.' }
  
  return { success: true, message: json.message || 'Bulk upload successful.' }
}
/**
 * Helper to download a file from a URL by fetching it as a blob.
 */
export async function downloadFile(url: string, filename: string) {
  try {
    const response = await fetch(url)
    const blob = await response.blob()
    const blobUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = blobUrl
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(blobUrl)
  } catch (error) {
    console.error('Download failed:', error)
    // Fallback to opening in new tab if blob download fails
    window.open(url, '_blank')
  }
}
