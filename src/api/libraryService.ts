/**
 * Library API Service
 * Routes: /api/v1/library/folders and /api/v1/library/files
 * Flow: 1) Get root folders → 2) Get folder contents (child folders + files) → 3) View/Download files
 * DB: Folder (rootType, parentId) → children folders + files (folderId, file_name, url)
 * See: VACEI-BACKEND-V2/docs/api/folder.api.md, file.api.md
 */

const backendUrl =
  process.env.NEXT_PUBLIC_VACEI_BACKEND_URL?.replace(/\/?$/, "/") ||
  "http://localhost:5000/api/v1/";

function getAuthHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("token") || "";
  return { Authorization: `Bearer ${token}` };
}

export type LibraryRootType = "CLIENT" | "ORGANIZATION" | "PLATFORM";

/** Folder (roots or child) - supports both API doc and backend shapes */
export interface LibraryFolderView {
  id?: string;
  folder_id?: string;
  name?: string;
  folder_name?: string;
  parentId?: string | null;
  tags?: string[];
  updatedAt?: string;
  createdAt?: string;
  rootType?: LibraryRootType;
}

/** File in folder contents - API doc includes file_url; backend may omit (fetch via download) */
export interface LibraryFileItem {
  id?: string;
  file_id?: string;
  filename?: string;
  file_name?: string;
  type?: string;
  file_type?: string;
  size?: number;
  file_size?: number;
  url?: string;
  file_url?: string;
  tags?: string[];
  updatedAt?: string;
  createdAt?: string;
}

/** Folder content response - supports folders/childFolders, normalized in context */
export interface FolderContentResponse {
  folder?: LibraryFolderView;
  folders?: LibraryFolderView[];
  childFolders?: LibraryFolderView[];
  files?: LibraryFileItem[];
  pagination?: { total: number; page: number; limit: number; totalPages: number };
}

/** Download URL response */
export interface FileDownloadResponse {
  url: string;
  fileName?: string;
  file_name?: string;
}

/**
 * Get all root folders (backend filters by user access - CLIENT, ORGANIZATION, PLATFORM)
 * Path: GET /api/v1/library/folders/roots
 */
export async function getRootFolders(signal?: AbortSignal): Promise<LibraryFolderView[]> {
  const response = await fetch(`${backendUrl}library/folders/roots`, {
    method: "GET",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
    signal,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || err.error || "Failed to fetch root folders");
  }

  const result = await response.json();
  const data = result.data ?? result;
  return Array.isArray(data) ? data : [];
}

/**
 * Get folder content (child folders + files)
 * Path: GET /api/v1/library/folders/:id/content
 * API doc: GET /folders/:id/contents (backend uses content singular)
 * Query: page, limit, order, orderBy, search, tags (optional)
 */
export async function getFolderContent(
  folderId: string,
  params?: { page?: number; limit?: number; search?: string; tags?: string[] },
  signal?: AbortSignal
): Promise<FolderContentResponse> {
  const q = new URLSearchParams()
  if (params?.page) q.set("page", String(params.page))
  if (params?.limit) q.set("limit", String(params.limit))
  if (params?.search) q.set("search", params.search)
  if (params?.tags?.length) q.set("tags", params.tags.join(","))
  const query = q.toString()
  const response = await fetch(
    `${backendUrl}library/folders/${folderId}/content${query ? `?${query}` : ""}`,
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
    throw new Error(err.message || err.error || "Failed to fetch folder content");
  }

  const result = await response.json();
  const data = result.data ?? result;
  if (!data || typeof data !== "object") {
    throw new Error("Invalid folder content response");
  }
  return data as FolderContentResponse;
}

/**
 * Get file download URL (required for view/download - folder contents don't include url)
 * Path: GET /api/v1/library/files/:id/download
 */
export async function getFileDownloadUrl(
  fileId: string,
  signal?: AbortSignal
): Promise<FileDownloadResponse> {
  const response = await fetch(`${backendUrl}library/files/${fileId}/download`, {
    method: "GET",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
    signal,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || err.error || "Failed to get file download URL");
  }

  const result = await response.json();
  const data = result.data ?? result;
  if (!data?.url) {
    throw new Error("Invalid file download response");
  }
  return {
    url: data.url,
    fileName: data.fileName ?? data.file_name ?? "file",
  };
}
