// app/dashboard/notifications/notificationApi.ts

const backendUrl = process.env.NEXT_PUBLIC_VACEI_BACKEND_URL?.replace(/\/?$/, "/") || "http://localhost:5000/api/v1/";

// Auth header utility
function getAuthHeaders(): Record<string, string> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Helper to handle API responses
async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: "Something went wrong" }));
    if ([401, 403].includes(res.status)) {
      console.error("Authentication error:", errorData.message);
      throw new Error("Authentication failed. Please log in.");
    }
    throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
  }
  const result = await res.json();
  return result.data || result; // Backend wraps success response in "data"
}

export function getPortalRedirectUrl(url?: string): string {
  if (!url) return '';
  const cleaned = url.replace(/^\/(partner|platform|client)/, '');
  if (cleaned.startsWith('/dashboard')) return cleaned;
  if (cleaned.startsWith('/')) return `/dashboard${cleaned}`;
  return cleaned;
}

export interface Notification {
  id: string;
  userId: string;
  role: string;
  type: string;
  title: string;
  content: string;
  redirectUrl: string;
  isRead: boolean;
  createdAt: string;
}

export interface FetchNotificationsResponse {
  items: Notification[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface FetchUnreadCountResponse {
  count: number;
}

export async function fetchNotificationsAPI(
  filters?: {
    page?: number;
    limit?: number;
    read?: boolean;
  }
): Promise<FetchNotificationsResponse> {
  const queryParams = new URLSearchParams();
  if (filters?.page) queryParams.append('page', filters.page.toString());
  if (filters?.limit) queryParams.append('limit', filters.limit.toString());
  if (filters?.read !== undefined) queryParams.append('isRead', filters.read.toString());

  const res = await fetch(`${backendUrl}notifications?${queryParams.toString()}`, {
    headers: getAuthHeaders(),
  });

  const response = await handleResponse<FetchNotificationsResponse>(res);
  
  if (response && response.items) {
    response.items = response.items.map(notif => ({
      ...notif,
      redirectUrl: getPortalRedirectUrl(notif.redirectUrl)
    }));
  }
  
  return response;
}

export async function fetchUnreadCountAPI(): Promise<FetchUnreadCountResponse> {
  const res = await fetch(`${backendUrl}notifications/unread-count`, {
    headers: getAuthHeaders(),
  });
  return handleResponse<FetchUnreadCountResponse>(res);
}

export async function markNotificationAsReadAPI(notificationId: string): Promise<void> {
  const res = await fetch(`${backendUrl}notifications/read/${notificationId}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
  });
  await handleResponse(res);
}

export interface NotificationPreference {
  emailEnabled: boolean;
  inAppEnabled: boolean;
  pushEnabled: boolean;
  soundEnabled: boolean;
}

export async function fetchPreferencesAPI(): Promise<NotificationPreference> {
  const res = await fetch(`${backendUrl}notifications/preferences`, {
    headers: getAuthHeaders(),
  });
  return handleResponse<NotificationPreference>(res);
}

export async function updatePreferencesAPI(preferences: Partial<NotificationPreference>): Promise<NotificationPreference> {
  const res = await fetch(`${backendUrl}notifications/preferences`, {
    method: 'PATCH',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(preferences),
  });
  return handleResponse<NotificationPreference>(res);
}

export async function markAllNotificationsAsReadAPI(): Promise<void> {
  const res = await fetch(`${backendUrl}notifications/read-all`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
  });
  await handleResponse(res);
}