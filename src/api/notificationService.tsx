// app/dashboard/notifications/notificationApi.ts

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/?$/, "") || "";

// Mock notification data stored in memory
let mockNotifications: Notification[] = [
  {
    id: 1,
    userId: 1,
    message: "New task assigned: Review quarterly financial statements",
    type: "task_assigned",
    entityType: "Task",
    entityId: 101,
    read: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    link: "/dashboard/task/101",
  },
  {
    id: 2,
    userId: 1,
    message: "Meeting scheduled: Client consultation on Friday at 2:00 PM",
    type: "meeting_scheduled",
    entityType: "Meeting",
    entityId: 202,
    read: false,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
    link: "/dashboard/schedule",
  },
  {
    id: 3,
    userId: 1,
    message: "New chat message from your accountant",
    type: "chat_message",
    entityType: "Chat",
    entityId: 303,
    read: true,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    link: "/dashboard/messages",
  },
  {
    id: 4,
    userId: 1,
    message: "Document upload completed: Tax return 2024",
    type: "general",
    entityType: "Document",
    entityId: 404,
    read: true,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    link: "/dashboard/documents/404",
  },
  {
    id: 5,
    userId: 1,
    message: "Company incorporation status updated",
    type: "general",
    entityType: "Company",
    entityId: 505,
    read: false,
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
    link: "/dashboard/company",
  },
];

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
    limit?: number;
    read?: boolean; // true for read, false for unread
  }
): Promise<FetchNotificationsResponse> {
  // Return mock data instead of making API call
  try {
    const { page = 1, limit = 10, read } = filters || {};

    // Filter notifications based on read status
    let filteredNotifications = [...mockNotifications];
    if (read !== undefined) {
      filteredNotifications = filteredNotifications.filter(n => n.read === read);
    }

    // Sort by createdAt (newest first)
    filteredNotifications.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // Paginate
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedNotifications = filteredNotifications.slice(startIndex, endIndex);
    const totalItems = filteredNotifications.length;
    const totalPages = Math.ceil(totalItems / limit);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));

    return {
      notifications: paginatedNotifications,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
      },
    };
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
  // Return mock data instead of making API call
  try {
    // Count unread notifications
    const unreadCount = mockNotifications.filter(n => !n.read).length;

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 50));

    return {
      unreadCount,
    };
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
  // Update mock data instead of making API call
  try {
    const notification = mockNotifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 50));
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
  // Update mock data instead of making API call
  try {
    mockNotifications.forEach(notification => {
      notification.read = true;
    });

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 50));
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
  // Update mock data instead of making API call
  try {
    mockNotifications = mockNotifications.filter(n => n.id !== notificationId);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 50));
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
}