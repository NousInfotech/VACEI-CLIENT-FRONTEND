// api/quickbooksApi.ts (changed from .js to .ts to indicate TypeScript usage)

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    if (!token) {
        // It's good to throw an Error instance.
        throw new Error('Authentication token not found.');
    }
    return {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
    };
};

export const checkQuickbooksAuth = async (backendUrl: string | undefined) => {
    // Add a check for backendUrl
    if (!backendUrl) {
        return { success: false, error: 'Backend URL is not defined.' };
    }

    try {
        const headers = getAuthHeaders();
        const res = await fetch(`${backendUrl}intuitAccount/checkAuth`, {
            method: 'POST',
            headers: headers,
        });
        const data = await res.json();
        return { success: res.ok, data };
    } catch (error: unknown) { // Explicitly type 'error' as unknown
        console.error('Error checking QuickBooks authentication:', error);
        // Type narrowing for error
        let errorMessage = 'An unknown error occurred during authentication check.';
        if (error instanceof Error) {
            errorMessage = error.message;
        } else if (typeof error === 'string') {
            errorMessage = error;
        } else if (typeof error === 'object' && error !== null && 'message' in error && typeof (error as any).message === 'string') {
            errorMessage = (error as any).message;
        }
        return { success: false, error: errorMessage };
    }
};

export const syncQuickbooksData = async (backendUrl: string | undefined, endpoint: string) => {
    // Add a check for backendUrl
    if (!backendUrl) {
        return { success: false, error: 'Backend URL is not defined.' };
    }

    try {
        const headers = getAuthHeaders();
        const response = await fetch(`${backendUrl}${endpoint}`, {
            method: 'POST',
            headers: headers,
        });
        const data = await response.json();
        return { success: response.ok, data };
    } catch (error: unknown) { // Explicitly type 'error' as unknown
        console.error(`Error syncing data from ${endpoint}:`, error);
        // Type narrowing for error
        let errorMessage = `An unknown error occurred during sync from ${endpoint}.`;
        if (error instanceof Error) {
            errorMessage = error.message;
        } else if (typeof error === 'string') {
            errorMessage = error;
        } else if (typeof error === 'object' && error !== null && 'message' in error && typeof (error as any).message === 'string') {
            errorMessage = (error as any).message;
        }
        return { success: false, error: errorMessage };
    }
};