const backendUrl =
  process.env.NEXT_PUBLIC_VACEI_BACKEND_URL?.replace(/\/?$/, "/") ||
  "http://localhost:5000/api/v1/";

function getAuthHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("token") || "";
  return { Authorization: `Bearer ${token}` };
}

const supportBase = `${backendUrl}support`;

export interface SupportRequestItem {
  id: string;
  userId: string;
  companyId: string | null;
  organizationId: string | null;
  subject: string;
  description: string | null;
  status: "PENDING" | "ACCEPTED";
  createdAt: string;
  updatedAt: string;
  user?: { id: string; firstName: string; lastName: string; email: string | null };
  company?: { id: string; name: string } | null;
  attachments?: { id: string; file_name: string; url?: string }[];
  tickets?: { id: string; status: string; category: string }[];
}

export interface TicketUpdateItem {
  id: string;
  title: string | null;
  description: string | null;
  createdAt: string;
  createdBy?: { id: string; firstName: string; lastName: string };
}

export interface TicketItem {
  id: string;
  supportRequestId: string | null;
  createdById: string;
  category: "CLIENT_PORTAL" | "PARTNER_PORTAL";
  status: string;
  createdAt: string;
  updatedAt: string;
  supportRequest?: { id: string; subject: string; status: string } | null;
  updates?: TicketUpdateItem[];
}

export async function createSupportRequest(
  payload: { subject: string; description?: string; companyId?: string },
  files?: File[]
): Promise<SupportRequestItem> {
  const formData = new FormData();
  formData.append("subject", payload.subject);
  if (payload.description) formData.append("description", payload.description);
  if (payload.companyId) formData.append("companyId", payload.companyId);
  if (files) {
    files.forEach((f) => formData.append("files", f));
  }

  const response = await fetch(`${supportBase}/support-requests`, {
    method: "POST",
    headers: {
      ...getAuthHeaders(),
    },
    body: formData,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || "Failed to create support request");
  }
  const result = await response.json();
  return result.data;
}

export async function getSupportRequests(params?: {
  page?: number;
  limit?: number;
  status?: string;
}): Promise<{ data: SupportRequestItem[]; meta: { total: number; page: number; limit: number; totalPages: number } }> {
  const search = new URLSearchParams();
  if (params?.page != null) search.set("page", String(params.page));
  if (params?.limit != null) search.set("limit", String(params.limit));
  if (params?.status) search.set("status", params.status);
  const qs = search.toString();
  const url = `${supportBase}/support-requests${qs ? `?${qs}` : ""}`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || "Failed to fetch support requests");
  }
  const result = await response.json();
  return {
    data: result.data ?? [],
    meta: result.meta ?? { total: 0, page: 1, limit: 10, totalPages: 0 },
  };
}

export async function getTicketById(ticketId: string): Promise<TicketItem> {
  const response = await fetch(`${supportBase}/tickets/${ticketId}`, {
    method: "GET",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || "Failed to fetch ticket");
  }
  const result = await response.json();
  return result.data;
}

export async function createTicketUpdate(
  ticketId: string,
  payload: { title?: string; description?: string }
): Promise<TicketUpdateItem> {
  const response = await fetch(`${supportBase}/tickets/${ticketId}/updates`, {
    method: "POST",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || "Failed to add update");
  }
  const result = await response.json();
  return result.data;
}

export async function getSupportRequestById(id: string): Promise<SupportRequestItem> {
  const response = await fetch(`${supportBase}/support-requests/${id}`, {
    method: "GET",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || "Failed to fetch support request");
  }
  const result = await response.json();
  return result.data;
}

export async function getTickets(params?: {
  page?: number;
  limit?: number;
  supportRequestId?: string;
  status?: string;
}): Promise<{ data: TicketItem[]; meta: { total: number; page: number; limit: number; totalPages: number } }> {
  const search = new URLSearchParams();
  if (params?.page != null) search.set("page", String(params.page));
  if (params?.limit != null) search.set("limit", String(params.limit));
  if (params?.supportRequestId) search.set("supportRequestId", params.supportRequestId);
  if (params?.status) search.set("status", params.status);
  const qs = search.toString();
  const url = `${supportBase}/tickets${qs ? `?${qs}` : ""}`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || "Failed to fetch tickets");
  }
  const result = await response.json();
  return {
    data: result.data ?? [],
    meta: result.meta ?? { total: 0, page: 1, limit: 10, totalPages: 0 },
  };
}
