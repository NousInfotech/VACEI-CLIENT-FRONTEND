// services/api.ts (or wherever your existing API functions are)

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/?$/, "/") || "";

// Get auth token from localStorage
function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("token") || "";
  return { Authorization: `Bearer ${token}` };
}

// Generic request function
async function request(method: string, endpoint: string, { params = {}, body = null, isFormData = false } = {}) {
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
    const errorText = await res.text();
    throw new Error(errorText || `API request failed: ${res.status}`);
  }

  // In DELETE some APIs may not return JSON
  if (res.status === 204) return null;

  return await res.json();
}

// --------------------- Individual API functions ---------------------

export async function fetchDocumentById(docId: string) {
  const result = await request("GET", "documents/get-documents", { params: { id: docId } });
  return result.data?.[0] || null;
}

export async function fetchCategories() {
  return await request("GET", "documents/categories");
}

export async function fetchTags() {
  return await request("GET", "documents/tags");
}

export async function fetchSubCategories(parentId: string) {
  return await request("GET", "documents/subCategories", { params: { parentId } });
}

export async function deleteFile(fileId: any) {
  await request("DELETE", `documents/delete-file/${fileId}`);
}

export async function createOrUpdateDocument(formData: FormData, docId: string | undefined) {
  const endpoint = docId
    ? `documents/update/${docId}`
    : `documents/create`;

  const res = await fetch(`${backendUrl}${endpoint}`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: formData,
  });

  if (!res.ok) throw new Error("Failed to upload document");
  return await res.json();
}

type FetchDocumentsParams = {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  year?: string | number;
  month?: string | number;
  tags?: string[];
};

export async function fetchDocuments({
  page = 1,
  limit = 10,
  search,
  category,
  year,
  month,
  tags,
}: FetchDocumentsParams) {
  const params = {
    page,
    limit,
    ...(search && { search }),
    ...(category && { category }),
    ...(year && { year }),
    ...(month && { month }),
    ...(tags && { tags: tags.join(",") }),
  };

  return await request("GET", "documents/get-documents", { params });
}

export async function deleteDocument(docId: any) {
  return await request("DELETE", `documents/${docId}`);
}

/**
 * Fetches the upload status summary (Documents Uploaded, Processed, Pending).
 * @returns {Promise<{ documentsUploaded: number, documentsProcessed: number, documentsPending: number }>}
 */
export async function fetchUploadStatusSummary() {
  // Mock data - simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));

  // Mock upload status summary
  return {
    documentsUploaded: 45,
    documentsProcessed: 38,
    documentsPending: 7,
  };
}