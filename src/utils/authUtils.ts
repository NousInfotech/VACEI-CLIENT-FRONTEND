/**
 * Get decoded username from localStorage
 */
export function getDecodedUsername(): string | null {
  if (typeof window === 'undefined') return null;

  try {
    const encoded = localStorage.getItem('username');
    if (!encoded) return null;
    return atob(encoded);
  } catch (error) {
    console.error('Error decoding username:', error);
    return null;
  }
}

/**
 * Get user ID from localStorage (raw value, may be base64-encoded).
 */
export function getUserIdFromLocalStorage(): string | null {
  if (typeof window === 'undefined') return null;

  try {
    const userId = localStorage.getItem('user_id') || localStorage.getItem('userId');
    if (!userId) return null;
    return userId;
  } catch (error) {
    console.error('Error getting user ID:', error);
    return null;
  }
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Get user ID normalized for comparison (decodes base64 to UUID when applicable).
 * Use when comparing with API IDs (e.g. chat senderId, participant id).
 */
export function getDecodedUserId(): string | null {
  const raw = getUserIdFromLocalStorage();
  if (!raw) return null;
  if (UUID_REGEX.test(raw)) return raw;
  try {
    const decoded = atob(raw);
    if (UUID_REGEX.test(decoded)) return decoded;
  } catch {
    /* not base64 */
  }
  return raw;
}

/**
 * Utility function to handle authentication errors and redirect to login
 * This prevents page flash by handling 401 errors consistently
 */
export function handleAuthError(error: any, router: any): void {
  // Check if error is a 401/403 authentication error
  const isAuthError =
    error?.message?.toLowerCase().includes('authentication') ||
    error?.message?.toLowerCase().includes('unauthorized') ||
    error?.message?.toLowerCase().includes('token expired') ||
    error?.status === 401 ||
    error?.status === 403;

  if (isAuthError) {
    // Clear auth data
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('email');
      localStorage.removeItem('user_id');
      localStorage.removeItem('username');

      // Clear cookie
      document.cookie = 'client-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax';
      document.cookie = 'client-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=None; Secure';
    }

    // Redirect to login
    router.push('/login?message=' + encodeURIComponent('Session expired. Please login again.'));
  }
}

/**
 * Verify authentication by calling a lightweight backend endpoint
 * Returns true if authenticated, false otherwise
 */
export async function verifyAuthentication(): Promise<boolean> {
  // Use VACEI backend URL (same as onboarding flow)
  const backendUrl = process.env.NEXT_PUBLIC_VACEI_BACKEND_URL?.replace(/\/?$/, "/") || "http://localhost:5000/api/v1/";
  const token = localStorage.getItem('token');

  if (!token) {
    console.warn('No token found in localStorage');
    return false;
  }

  try {
    // Call /auth/me endpoint to verify token
    // This endpoint is protected and requires valid authentication
    const response = await fetch(`${backendUrl}auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      console.warn('Authentication verification failed:', response.status, response.statusText);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Authentication verification error:', error);
    return false;
  }
}
