// src/utils/authUtils.ts

/**
 * Retrieves the client ID from localStorage.
 * The client ID is expected to be stored as a Base64-encoded string.
 *
 * @returns {string | null} The Base64-encoded client ID string, or null if not found.
 */
export const getClientIdFromLocalStorage = (): string | null => {
  // Get the Base64-encoded client ID directly from localStorage
  const encodedClientId = localStorage.getItem("client_id");
  return encodedClientId; // Return it as is, without decoding
};

/**
 * Retrieves the user ID from localStorage.
 * The user ID is expected to be stored as a Base64-encoded string.
 *
 * @returns {string | null} The Base64-encoded user ID string, or null if not found.
 */
export const getUserIdFromLocalStorage = (): string | null => {
  // Get the Base64-encoded user ID directly from localStorage
  const encodedUserId = localStorage.getItem("user_id"); // Assuming key is "user_id"
  return encodedUserId; // Return it as is, without decoding
};

/**
 * Retrieves the user email from localStorage.
 *
 * @returns {string | null} The user email string, or null if not found.
 */
export const getUserEmailFromLocalStorage = (): string | null => {
  return localStorage.getItem("email"); // Assuming key is "email"
};

/**
 * Retrieves the client email from localStorage.
 *
 * @returns {string | null} The client email string, or null if not found.
 */
export const getClientEmailFromLocalStorage = (): string | null => {
  return localStorage.getItem("client_email"); // Assuming key is "client_email"
};

export const getEncodedUsername = (): string | null => {
  return localStorage.getItem("username"); // Assuming key is "client_email"
};
export const getDecodedUsername = (): string | null => {
  if (typeof window !== 'undefined') { // Ensure this runs only on the client-side
    const encodedUsername = localStorage.getItem("username");
    if (encodedUsername) {
      try {
        return atob(encodedUsername);
      } catch (e) {
        console.error("Error decoding username:", e);
        return null; // Return null or a default value if decoding fails
      }
    }
  }
  return null; // Return null if not found or not in a browser environment
};