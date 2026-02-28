import { saveAs } from 'file-saver';

/**
 * Downloads a file from a URL, with enhanced error handling for cross-origin and HTML responses.
 * @param url The absolute URL of the file to download.
 * @param fileName The desired name for the downloaded file.
 */
export const downloadFile = async (url: string, fileName: string) => {
  try {
    // Attempt to fetch the file as a Blob to handle cross-origin and check content type
    const response = await fetch(url, {
      mode: 'cors',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`);
    }

    // Check if we accidentally got an HTML page (common in SPA routing or error pages)
    const contentType = response.headers.get('Content-Type');
    if (contentType && contentType.includes('text/html')) {
      console.error('Download received HTML instead of file. URL might be incorrect or protected.');
      throw new Error('Received invalid file format (HTML).');
    }

    const blob = await response.blob();
    saveAs(blob, fileName);
  } catch (error) {
    console.error('Download utility failed:', error);
    // Fallback to direct download if fetch fails (e.g., due to CORS)
    // Note: This might still result in an HTML download if the server redirects,
    // but it's the best we can do without a backend proxy or pre-signed URLs.
    saveAs(url, fileName);
  }
};
