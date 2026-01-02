// utils/api/authService.tsx

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/?$/, "") || "";

// Auth header utility (can be shared or duplicated if services are very distinct)
function getAuthHeaders(): Record<string, string> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Helper to handle API responses
async function handleResponse(res: Response): Promise<any> {
  if (!res.ok) {
    // Attempt to parse error data from response body
    const errorData = await res.json().catch(() => ({ message: "Something went wrong (non-JSON error)" }));

    // Special handling for 401/403: still throw a standard Error for consistency
    // or you could throw errorData directly here as well if your frontend expects it.
    // For this case, let's keep throwing an Error object for authentication failures.
    if ([401, 403].includes(res.status)) {
      console.error("Authentication error:", errorData.error);
      throw new Error(errorData.error || "Authentication failed. Please log in.");
    }

    // For all other non-OK responses (e.g., 400, 500, etc.)
    // Throw the entire errorData object returned from the backend.
    // This allows the caller to access properties like 'error', 'message', etc.
    throw errorData; 
  }

  // Check if the response is JSON. Some successful responses might be 204 No Content.
  const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return res.json();
  }
  return {}; // Return an empty object for non-JSON successful responses (e.g., 204 No Content)
}

/**
 * Payload for changing a user's password.
 */
interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

/**
 * Response for changing a user's password.
 */
interface ChangePasswordResponse {
  message: string;
}

/**
 * API call to change a user's password.
 * @param payload - Object containing currentPassword and newPassword.
 * @returns A promise that resolves to ChangePasswordResponse on success.
 */
export async function changePassword(payload: ChangePasswordPayload): Promise<ChangePasswordResponse> {
  try {
    const res = await fetch(`${backendUrl}/user/change-password`, { // Assuming this is your endpoint
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify(payload),
    });

    return handleResponse(res);
  } catch (error) {
    console.error("Error changing password in service:", error); // Changed log message
    throw error; // Re-throw the error received from handleResponse
  }
}

// You might also add other auth-related functions here (e.g., login, register, forgot password)



interface LoginResponse {
  token: string;
  username: string;
  user_id: string;
}

interface LoginPayload {
  email: string;
  password: string;
}

export async function login({ email, password }: LoginPayload): Promise<LoginResponse> {
  const response = await fetch(`${backendUrl}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    credentials: "include",
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message || "Failed to login");
  }

  return response.json();
}
