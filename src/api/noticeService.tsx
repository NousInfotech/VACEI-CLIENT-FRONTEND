
const backendUrl = process.env.NEXT_PUBLIC_VACEI_BACKEND_URL?.replace(/\/?$/, "/") || "http://localhost:5000/api/v1/";

// Get auth token from localStorage
function getAuthHeaders(): Record<string, string> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Helper to handle API responses
async function handleResponse(res: Response): Promise<any> {
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: "Something went wrong" }));
    throw errorData;
  }
  const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return res.json();
  }
  return {};
}

export interface Notice {
  id: string;
  title: string;
  description: string;
  targetRoles: string[];
  type: string;
  status: string;
  scheduledAt: string;
  createdAt: string;
}

/**
 * Fetch notices scheduled for today.
 */
export async function fetchTodayNotices(): Promise<Notice[]> {
  try {
    const res = await fetch(`${backendUrl}notices/today`, {
      method: "GET",
      headers: {
        ...getAuthHeaders(),
      },
    });

    const response = await handleResponse(res);
    return response.data || [];
  } catch (error) {
    console.error("Error fetching today notices in service:", error);
    throw error;
  }
}
