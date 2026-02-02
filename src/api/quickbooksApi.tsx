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

// Mock implementation - no backend calls
export const checkQuickbooksAuth = async (backendUrl: string | undefined) => {
    try {
        const { mockCheckQuickbooksAuth } = await import('./mockApiService');
        return await mockCheckQuickbooksAuth();
    } catch (error: unknown) {
        console.error('Error checking QuickBooks authentication:', error);
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
    try {
        const { mockSyncQuickbooksData } = await import('./mockApiService');
        return await mockSyncQuickbooksData(endpoint);
    } catch (error: unknown) {
        console.error(`Error syncing data from ${endpoint}:`, error);
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