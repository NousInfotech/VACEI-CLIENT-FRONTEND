/**
 * Central auth refresh and fetch handling for client portal.
 * Patches fetch so 401 responses trigger token refresh and one retry.
 */

const backendUrl = process.env.NEXT_PUBLIC_VACEI_BACKEND_URL?.replace(/\/?$/, "/") || "http://localhost:5000/api/v1/";
const refreshUrl = `${backendUrl}auth/refresh`;

export function getBackendUrl(): string {
  return backendUrl;
}

export function clearAuthStorage(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("email");
  localStorage.removeItem("user_id");
  localStorage.removeItem("username");
  localStorage.removeItem("role");
  localStorage.removeItem("client_id");
  localStorage.removeItem("client_folder_id");
  document.cookie = "client-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax";
  document.cookie = "client-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=None; Secure";
}

/**
 * Try to refresh the access token using the stored refresh token.
 * Updates localStorage with new token (and refreshToken if returned).
 * @returns true if refresh succeeded, false otherwise.
 */
export async function tryRefreshToken(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) return false;

  try {
    const res = await fetch(refreshUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
      credentials: "include",
    });

    if (!res.ok) return false;
    const data = await res.json().catch(() => null);
    const result = data?.data ?? data;
    const newToken = result?.token;
    if (!newToken) return false;

    localStorage.setItem("token", newToken);
    const newRefreshToken = result?.refreshToken;
    if (newRefreshToken) {
      localStorage.setItem("refreshToken", newRefreshToken);
    }

    const isHttps = window.location.protocol === "https:";
    const cookieOptions = isHttps
      ? "SameSite=None; Secure; Path=/; Max-Age=86400"
      : "SameSite=Lax; Path=/; Max-Age=86400";
    document.cookie = `client-token=${encodeURIComponent(newToken)}; ${cookieOptions}`;
    return true;
  } catch {
    return false;
  }
}

function redirectToLogin(): void {
  if (typeof window === "undefined") return;
  const path = window.location.pathname || "";
  if (path.startsWith("/login") || path.startsWith("/forgot-password")) return;
  clearAuthStorage();
  window.location.href = "/login?message=" + encodeURIComponent("Session expired. Please log in again.");
}

let fetchPatched = false;

/**
 * Patch global fetch so that 401 responses trigger one refresh attempt and retry.
 * Call once on client (e.g. from a layout or provider useEffect).
 * Network errors (e.g. "Failed to fetch") are rethrown and do not trigger redirect.
 */
export function initAuthRefresh(): void {
  if (typeof window === "undefined" || fetchPatched) return;
  fetchPatched = true;
  const originalFetch = window.fetch;
  window.fetch = async function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const url = typeof input === "string" ? input : input instanceof Request ? input.url : input.toString();
    // If input is a Request, clone once so we can retry with a fresh body after 401 (Request body is single-use).
    const retryInput: RequestInfo | URL | null =
      input instanceof Request ? input.clone() : null;

    let res: Response;
    try {
      res = await originalFetch.call(window, input, init);
    } catch (err) {
      // Network/CORS/abort error – rethrow so callers can handle; do not redirect.
      throw err;
    }

    if (res.status === 401) {
      const isRefreshEndpoint = url.includes("/auth/refresh");
      const refreshToken = typeof window !== "undefined" ? localStorage.getItem("refreshToken") : null;
      if (!isRefreshEndpoint && refreshToken) {
        const refreshed = await tryRefreshToken();
        if (refreshed) {
          const newToken = localStorage.getItem("token");
          const newHeaders = new Headers(init?.headers);
          if (newToken) newHeaders.set("Authorization", `Bearer ${newToken}`);
          const retryInit = { ...init, headers: newHeaders };
          if (retryInput !== null) {
            const req = retryInput as Request;
            const authHeaders = new Headers(req.headers);
            if (newToken) authHeaders.set("Authorization", `Bearer ${newToken}`);
            return originalFetch.call(window, new Request(req, { headers: authHeaders }));
          }
          return originalFetch.call(window, input, retryInit);
        }
      }
      redirectToLogin();
    }
    return res;
  };
}
