// agingService.ts

// Interface for a single AgingRow (individual vendor/customer entry)
export interface AgingRow {
    id: number;
    agingDataId: number;
    entityName: string;
    entityId: string | null;
    current: number;
    agingBucket1_30: number;
    agingBucket31_60: number;
    agingBucket61_90: number;
    agingBucket91Over: number;
    total: number;
    createdAt: string; // ISO string
}

// Interface for a single AgingData record (summary report)
export interface AgingData {
    id: number;
    intuitAccountId: number;
    reportDate: string; // ISO string for the report date (YYYY-MM-DD)
    type: 'AP' | 'AR'; // Corresponds to AgingReportType enum in Prisma
    currency: string;
    current: number;
    agingBucket1_30: number;
    agingBucket31_60: number;
    agingBucket61_90: number;
    agingBucket91Over: number;
    total: number;
    createdAt: string; // ISO string
    rows: AgingRow[]; // Include the associated detail rows
}

// Interface for the pagination metadata
export interface Pagination {
    totalCount: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}

// Corrected: Interface for the full response from the paginated aging data API
export interface PaginatedAgingDataResponse {
    message: string;
    data: AgingData[]; // Array of AgingData records
    pagination: Pagination;
}

// Interface for parameters to fetch paginated aging data
export interface FetchAgingDataParams {
    intuitAccountId: number; // Required to filter by account
    page?: number;
    limit?: number;
    startDate?: string; // New: Start date for transaction creation (YYYY-MM-DD)
    endDate?: string;   // Renamed from asOfDate: End date for aging (YYYY-MM-DD)
}

// Mock implementation - no backend calls
// Simulate API delay
async function simulateDelay(ms: number = 300) {
    await new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Fetches a paginated list of aging data (AP/AR reports) for a specific Intuit account.
 * This is a general utility function that fetches both AR and AP if available,
 * allowing filtering by a creation date range and an "as of" date for aging.
 *
 * @param {FetchAgingDataParams} params - The parameters for fetching aging data.
 * @returns {Promise<PaginatedAgingDataResponse>} - The response containing aging records and pagination info.
 * @throws {Error} If the API call fails or the backend URL is not defined.
 */
export async function fetchPaginatedAgingData(
    params: FetchAgingDataParams
): Promise<PaginatedAgingDataResponse> {
    const { intuitAccountId, page = 1, limit = 10, startDate, endDate } = params;

    // Simulate API delay
    await simulateDelay(300);

    if (typeof intuitAccountId !== 'number' || isNaN(intuitAccountId)) {
        throw new Error('Invalid intuitAccountId provided. It must be a number.');
    }

    // Mock aging data
    const mockRows: AgingRow[] = [
        {
            id: 1,
            agingDataId: 1,
            entityName: "Vendor A",
            entityId: "vendor-1",
            current: 5000,
            agingBucket1_30: 3000,
            agingBucket31_60: 2000,
            agingBucket61_90: 0,
            agingBucket91Over: 0,
            total: 10000,
            createdAt: new Date().toISOString(),
        },
        {
            id: 2,
            agingDataId: 1,
            entityName: "Vendor B",
            entityId: "vendor-2",
            current: 8000,
            agingBucket1_30: 5000,
            agingBucket31_60: 3000,
            agingBucket61_90: 0,
            agingBucket91Over: 0,
            total: 16000,
            createdAt: new Date().toISOString(),
        },
    ];

    const mockAgingData: AgingData = {
        id: 1,
        intuitAccountId: intuitAccountId,
        reportDate: endDate || new Date().toISOString().split('T')[0],
        type: 'AP',
        currency: 'EUR',
        current: 13000,
        agingBucket1_30: 8000,
        agingBucket31_60: 5000,
        agingBucket61_90: 0,
        agingBucket91Over: 0,
        total: 26000,
        createdAt: new Date().toISOString(),
        rows: mockRows,
    };

    // Calculate pagination details
    const totalCount = 1; // One aging data record
    const totalPages = Math.ceil(totalCount / limit);

    return {
        message: "Success",
        data: [mockAgingData],
        pagination: {
            totalCount,
            totalPages,
            currentPage: page,
            pageSize: limit,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
        },
    };
}

// Interface for parameters specifically for fetchArAgingData/fetchApAgingData
interface FetchSpecificAgingParams {
    intuitAccountId: number;
    startDate?: string;
    endDate?: string;
}

/**
 * Fetches Accounts Receivable (AR) aging data for a specific Intuit account,
 * filtered by transaction creation date range and aged as of the end date.
 *
 * @param {object} params - The parameters including intuitAccountId, startDate, and endDate.
 * @param {number} params.intuitAccountId - The ID of the Intuit account.
 * @param {string} [params.startDate] - The start date for filtering transactions (YYYY-MM-DD).
 * @param {string} [params.endDate] - The end date to fetch the aging report as of (YYYY-MM-DD).
 * @returns {Promise<AgingData | null>} - The AR aging data or null if not found.
 * @throws {Error} If the API call fails.
 */
export async function fetchArAgingData({ intuitAccountId, startDate, endDate }: FetchSpecificAgingParams): Promise<AgingData | null> {
    try {
        const response = await fetchPaginatedAgingData({ intuitAccountId, page: 1, limit: 10, startDate, endDate });
        const arRecord = response.data.find(record => record.type === 'AR');
        return arRecord || null;
    } catch (error) {
        console.error("Error fetching AR aging data:", error);
        throw error;
    }
}

/**
 * Fetches Accounts Payable (AP) aging data for a specific Intuit account,
 * filtered by transaction creation date range and aged as of the end date.
 *
 * @param {object} params - The parameters including intuitAccountId, startDate, and endDate.
 * @param {number} params.intuitAccountId - The ID of the Intuit account.
 * @param {string} [params.startDate] - The start date for filtering transactions (YYYY-MM-DD).
 * @param {string} [params.endDate] - The end date to fetch the aging report as of (YYYY-MM-DD).
 * @returns {Promise<AgingData | null>} - The AP aging data or null if not found.
 * @throws {Error} If the API call fails.
 */
export async function fetchApAgingData({ intuitAccountId, startDate, endDate }: FetchSpecificAgingParams): Promise<AgingData | null> {
    try {
        const response = await fetchPaginatedAgingData({ intuitAccountId, page: 1, limit: 10, startDate, endDate });
        const apRecord = response.data.find(record => record.type === 'AP');
        return apRecord || null;
    } catch (error) {
        console.error("Error fetching AP aging data:", error);
        throw error;
    }
}