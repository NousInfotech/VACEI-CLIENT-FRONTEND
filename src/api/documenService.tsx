const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/?$/, "/") || "";
import axios from "axios";
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

export async function fetchStatuses() {
  return await request("GET", "documents/fetch-statuses");
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

export async function createOrUpdateDocument(
  formData: FormData,
  docId?: string,
  onUploadProgress?: (percent: number) => void
) {
  const endpoint = docId
    ? `documents/update/${docId}`
    : `documents/create`;

  const res = await axios.post(`${backendUrl}${endpoint}`, formData, {
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "multipart/form-data",
    },
    onUploadProgress: (progressEvent) => {
      if (progressEvent.total) {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        if (onUploadProgress) onUploadProgress(percent);
      }
    },
  });

  return res.data;
}

type FetchDocumentsParams = {
  page?: number;
  limit?: number;
  status?: string;
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
  status,
}: FetchDocumentsParams) {
  const params = {
    page,
    limit,
    ...(search && { search }),
    ...(category && { category }),
    ...(year && { year }),
    ...(month && { month }),
    ...(status && { status }),
    ...(tags && { tags: tags.join(",") }),
  };

  return await request("GET", "documents/get-documents", { params });
}

export async function deleteDocument(docId: any) {
  return await request("DELETE", `documents/${docId}`);
}
