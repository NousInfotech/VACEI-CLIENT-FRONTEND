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
  // Normalize backend URL - ensure it ends with a slash
  const normalizedBackendUrl = backendUrl.endsWith('/') ? backendUrl : `${backendUrl}/`;
  const encodedQuery = encodeURIComponent(query);
  const url = `${normalizedBackendUrl}search?q=${encodedQuery}&page=${page}&limit=${limit}`;

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

    // Handle different response structures
    // Case 1: Direct array response
    if (Array.isArray(jsonResponse)) {
      return {
        success: true,
        data: jsonResponse,
        totalCount: jsonResponse.length
      };
    }

    // Case 2: Nested data structure
    // { success: true, message: "...", data: { success: true, message: "...", data: [...], totalCount: X } }
    if (jsonResponse && jsonResponse.data && typeof jsonResponse.data === 'object' && jsonResponse.data.data !== undefined) {
      return {
        success: jsonResponse.data.success !== false, // Default to true if not explicitly false
        message: jsonResponse.data.message,
        data: Array.isArray(jsonResponse.data.data) ? jsonResponse.data.data : [],
        totalCount: jsonResponse.data.totalCount || 0
      };
    }

    // Case 3: Flat structure with data array
    // { success: true, data: [...], totalCount: X }
    if (jsonResponse && jsonResponse.data !== undefined) {
      return {
        success: jsonResponse.success !== false,
        message: jsonResponse.message,
        data: Array.isArray(jsonResponse.data) ? jsonResponse.data : [],
        totalCount: jsonResponse.totalCount || (Array.isArray(jsonResponse.data) ? jsonResponse.data.length : 0)
      };
    }

    // Case 4: Response with results array (alternative structure)
    if (jsonResponse && jsonResponse.results && Array.isArray(jsonResponse.results)) {
      return {
        success: jsonResponse.success !== false,
        message: jsonResponse.message,
        data: jsonResponse.results,
        totalCount: jsonResponse.totalCount || jsonResponse.results.length
      };
    }

    // Case 5: Default - return as is
    return {
      success: jsonResponse.success !== false,
      message: jsonResponse.message || 'Search completed',
      data: [],
      totalCount: 0
    };
  } catch (error: any) {
    // Catch network errors or unexpected issues before fetch.
    console.error('Network or unexpected search error:', error);
    return { success: false, message: error.message || 'A network error occurred.' };
  }
};