// app/dashboard/notifications/notificationApi.ts

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/?$/, "") || "";

// Auth header utility (copied from your example)
function getAuthHeaders(): Record<string, string> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Helper to handle API responses (copied and slightly adapted from your example)
async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: "Something went wrong" }));
    if ([401, 403].includes(res.status)) {
      console.error("Authentication error:", errorData.message);
      // In a real application, you might redirect to login here
      throw new Error("Authentication failed. Please log in.");
    }
    throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
  }
  return res.json() as Promise<T>; // Cast to generic type T
}

/**
 * Interface for a single Notification object as returned from the backend.
 */
export interface Notification {
  id: number;
  userId: number;
  message: string;
  type: string; // e.g., "task_assigned", "meeting_scheduled", "chat_message", "general"
  entityType?: string; // Optional: e.g., "Task", "Meeting", "Chat"
  entityId?: number;  // Optional: ID of the related entity
  read: boolean;
  createdAt: string; // ISO 8601 string date
  deletedAt?: string; // ISO 8601 string date, present if soft-deleted
    link?: string; // Optional: URL for the notification to navigate to
}

/**
 * Interface for the response when fetching a list of notifications.
 * Assuming your backend will implement pagination similar to journal entries.
 */
export interface FetchNotificationsResponse {
  notifications: Notification[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number; // Added totalItems for more complete pagination info
  };
}

/**
 * Interface for the response when fetching unread count.
 */
export interface FetchUnreadCountResponse {
  unreadCount: number;
}

/**
 * Fetches notifications for the authenticated user.
 * @param {object} [filters] - Optional filters for notifications.
 * @param {number} [filters.page=1] - The current page number for pagination.
 * @param {number} [filters.limit=10] - Number of items per page. // <--- CHANGED THIS LINE
 * @param {boolean} [filters.read] - Filter by read status (true for read, false for unread).
 * @returns {Promise<FetchNotificationsResponse>} A promise that resolves to the list of notifications and pagination info.
 */
export async function fetchNotificationsAPI(
  filters?: {
    page?: number;
    limit?: number; // <--- CHANGED THIS LINE
    read?: boolean; // true for read, false for unread
  }
): Promise<FetchNotificationsResponse> {
  try {
    const { page = 1, limit = 10, read } = filters || {}; // <--- CHANGED THIS LINE (destructured 'limit' instead of 'itemsPerPage')

    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(), // This is now correct because 'limit' is destructured from filters
    });

    if (read !== undefined) {
      params.append('read', read.toString()); // 'true' or 'false'
    }

    const url: string = `${backendUrl}/notifications?${params.toString()}`; // Added / after backendUrl

    const res: Response = await fetch(url, {
      headers: getAuthHeaders(),
      // cache: 'no-store', // Consider adding cache control for fresh data
    });

    const data = await handleResponse<FetchNotificationsResponse>(res);
    return data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
}

/**
 * Fetches the count of unread notifications for the authenticated user.
 * @returns {Promise<FetchUnreadCountResponse>} A promise that resolves to the unread count.
 */
export async function fetchUnreadCountAPI(): Promise<FetchUnreadCountResponse> {
  try {
    const url: string = `${backendUrl}/notifications/unread-count`; // Added / after backendUrl

    const res: Response = await fetch(url, {
      headers: getAuthHeaders(),
      // cache: 'no-store', // Consider adding cache control for fresh data
    });

    const data = await handleResponse<FetchUnreadCountResponse>(res);
    return data;
  } catch (error) {
    console.error('Error fetching unread count:', error);
    throw error;
  }
}

/**
 * Marks a specific notification as read.
 * @param {number} notificationId - The ID of the notification to mark as read.
 * @returns {Promise<void>} A promise that resolves if the operation is successful.
 */
export async function markNotificationAsReadAPI(
  notificationId: number
): Promise<void> {
  try {
    const url: string = `${backendUrl}/notifications/${notificationId}/read`; // Added / after backendUrl

    const res: Response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(), // Use the utility function
      },
    });

    // handleResponse for void return type (no data expected back, just check ok status)
    await handleResponse<any>(res); // Expects no specific data, just checks for res.ok
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
}

/**
 * Marks all unread notifications for the authenticated user as read.
 * @returns {Promise<void>} A promise that resolves if the operation is successful.
 */
export async function markAllNotificationsAsReadAPI(): Promise<void> {
  try {
    const url: string = `${backendUrl}/notifications/mark-all-read`; // Added / after backendUrl

    const res: Response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(), // Use the utility function
      },
    });

    await handleResponse<any>(res); // Expects no specific data, just checks for res.ok
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
}

/**
 * Soft-deletes a specific notification.
 * @param {number} notificationId - The ID of the notification to delete.
 * @returns {Promise<void>} A promise that resolves if the operation is successful.
 */
export async function deleteNotificationAPI(
  notificationId: number
): Promise<void> {
  try {
    const url: string = `${backendUrl}/notifications/${notificationId}`; // Added / after backendUrl

    const res: Response = await fetch(url, {
      method: 'DELETE',
      headers: getAuthHeaders(), // Use the utility function
    });

    await handleResponse<any>(res); // Expects no specific data, just checks for res.ok
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
}