// utils/api/authService.tsx

const backendUrl = process.env.NEXT_PUBLIC_VACEI_BACKEND_URL?.replace(/\/?$/, "/") || "http://localhost:5000/api/v1/";

// Get auth token from localStorage
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
    if ([401, 403].includes(res.status)) {
      console.error("Authentication error:", errorData.error || errorData.message);
      throw new Error(errorData.error || errorData.message || "Authentication failed. Please log in.");
    }

    // For all other non-OK responses (e.g., 400, 500, etc.)
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
      const res = await fetch(`${backendUrl}auth/change-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify(payload),
    });

    const response = await handleResponse(res);
    return {
      message: response.message || "Password changed successfully",
    };
  } catch (error) {
    console.error("Error changing password in service:", error);
    throw error;
  }
}

/**
 * Payload for changing a user's profile.
 */
interface UpdateProfilePayload {
  firstName?: string;
  lastName?: string;
}

/**
 * API call to change a user's profile.
 */
export async function updateProfile(payload: UpdateProfilePayload): Promise<any> {
  try {
    const res = await fetch(`${backendUrl}auth/me`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify(payload),
    });

    return await handleResponse(res);
  } catch (error) {
    console.error("Error updating profile in service:", error);
    throw error;
  }
}

/**
 * User data structure from backend
 */
interface User {
  id: string;
  email: string | null;
  phone: string | null;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
}

/**
 * Login response structure from backend
 */
interface LoginResponse {
  user: User;
  client?: any | null;
  organizationMember?: any | null;
  token?: string;
}

/**
 * Backend API response wrapper
 */
interface BackendLoginResponse {
  data: LoginResponse;
  message: string;
}

/**
 * Login payload
 */
interface LoginPayload {
  email: string;
  password: string;
}

/**
 * Transformed login response for frontend compatibility
 */
interface TransformedLoginResponse {
  token: string;
  username: string;
  user_id: string;
  user: User;
  client?: any | null;
  organizationMember?: any | null;
}

/**
 * Login user
 * @param payload - Object containing email and password
 * @returns A promise that resolves to TransformedLoginResponse on success
 */
export async function login({ email, password }: LoginPayload): Promise<TransformedLoginResponse> {
  try {
    const res = await fetch(`${backendUrl}auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      credentials: "include",
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ message: "Failed to login" }));
      throw new Error(errorData.message || errorData.error || `Login failed: ${res.status} ${res.statusText}`);
    }

    const responseData: BackendLoginResponse = await res.json();
    const loginData = responseData.data || responseData;
    const token = loginData.token;
    const user = loginData.user;
    
    if (!token) {
      console.warn('No token in response:', responseData);
      throw new Error("No authentication token received. Please contact support.");
    }
    
    if (!user) {
      throw new Error("User data not found in response.");
    }

    // Transform response to match frontend expectations
    return {
      token,
      username: `${user.firstName || ''} ${user.lastName || ''}`.trim() || email.split("@")[0],
      user_id: user.id,
      user,
      client: loginData.client,
      organizationMember: loginData.organizationMember,
    };
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
}
