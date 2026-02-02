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
 */// Mock implementation - no backend calls
export const search = async (
  query: string,
  backendUrl: string,
  token: string,
  page: number,
  limit: number
): Promise<SearchResponse> => {
  try {
    const { mockSearch } = await import('./mockApiService');
    return await mockSearch(query, page, limit);
  } catch (error: any) {
    console.error('Search error:', error);
    return { success: false, message: error.message || 'A network error occurred.' };
  }
};