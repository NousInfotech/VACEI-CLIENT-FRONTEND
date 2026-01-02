// src/api/searchService.js
import { SearchResponse } from '@/interfaces/index'; // Import your interface
/**
 * Performs a search API call with authorization.
 *
 * @param {string} query The search query string.
 * @param {string} backendUrl The base URL of your backend API.
 * @param {string} token The authorization token (e.g., JWT).
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of search results.
 * @throws {Error} If the network request fails or the response is not OK.
 */export const search = async (
  query: string,
  backendUrl: string,
  token: string,
  page: number,
  limit: number
): Promise<SearchResponse> => { // <--- **Crucial Change Here**
  const url = `${backendUrl}search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`;

  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) {
      let errorMessage = 'Failed to fetch search results.';
      try {
        const errorData = await res.json();
        errorMessage = errorData.message || errorMessage;
      } catch (parseError) {
        console.error('Failed to parse error response JSON:', parseError);
      }
      // Instead of throwing an Error, return a SearchResponse indicating failure
      return { success: false, message: errorMessage };
    }

    const jsonResponse = await res.json();

    // --- FIX/WORKAROUND STARTS HERE ---
    // Check if the data is nested.
    // The expected nested structure is:
    // { success: true, message: "...", data: { success: true, message: "...", data: [...], totalCount: X } }
    if (jsonResponse && jsonResponse.data && typeof jsonResponse.data === 'object' && jsonResponse.data.data !== undefined) {
      // If it's nested, return the inner 'data' object which contains the actual results and totalCount
      console.warn("Detected nested 'data' from backend. Extracting inner data.");
      // Ensure the returned structure matches SearchResponse
      return {
        success: jsonResponse.data.success || true, // Assume success if data is found this way
        message: jsonResponse.data.message,
        data: jsonResponse.data.data,
        totalCount: jsonResponse.data.totalCount
      };
    } else {
      // Otherwise, return the response as is (e.g., if the backend is already sending the correct, flat structure)
      // Assert that jsonResponse directly matches SearchResponse
      return jsonResponse as SearchResponse;
    }
    // --- FIX/WORKAROUND ENDS HERE ---
  } catch (error: any) {
    // Catch network errors or unexpected issues before fetch.
    console.error('Network or unexpected search error:', error);
    return { success: false, message: error.message || 'A network error occurred.' };
  }
};