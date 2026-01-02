// api/recurringExpenses.ts
export interface Attachment {
  fileUrl: string;
  fileName: string;
  fileType: string;
}

// Interface for a single Transaction
export interface Transaction {
   
    id: number;
    txnDate: string; // ISO string for transaction date
    amount: number;
      attachments: Attachment[]; // ✅ Make this an array
    recurringExpenseSummaryId: number; // Link to the RecurringExpenseSummary
}

// Interface for the Recurring Expense data as received from the backend
export interface RecurringExpense {
    id: number;
    vendorId: string;
    vendorName: string;
    totalAmount: number;
    transactionCount: number;
    active: boolean;
    intuitAccountId: number;
    createdAt: string; // ISO string
    updatedAt: string; // ISO string
    transactions: Transaction[]; // Add this line to include the transactions array
}

// Interface for the pagination metadata received from the backend
export interface Pagination {
    totalCount: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}

// Interface for the full response from the paginated recurring expenses API
export interface PaginatedRecurringExpensesResponse {
    message: string;
    expenses: RecurringExpense[]; // This now uses the corrected interface
    pagination: Pagination;
}

// Interface for parameters to fetch recurring expenses
export interface FetchRecurringExpensesParams {
    page?: number;
    limit?: number;
}

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/?$/, "/") || "";

/**
 * Fetches a paginated list of recurring expenses for a specific user.
 * @param {FetchRecurringExpensesParams} params - The parameters for fetching expenses.
 * @returns {Promise<PaginatedRecurringExpensesResponse>} - The response containing expenses and pagination info.
 * @throws {Error} If the API call fails or the backend URL is not defined.
 */
export async function fetchPaginatedRecurringExpenses(
    params: FetchRecurringExpensesParams
): Promise<PaginatedRecurringExpensesResponse> {

    const token = localStorage.getItem("token") || "";

    if (!backendUrl) {
        console.error("NEXT_PUBLIC_BACKEND_URL is not defined.");
        throw new Error("Backend API URL is not configured.");
    }

    const query = new URLSearchParams();
    query.append('page', (params.page || 1).toString());
    query.append('limit', (params.limit || 10).toString());

    const baseUrl = backendUrl.endsWith('/') ? backendUrl : `${backendUrl}/`;

    const url = `${baseUrl}recurring-expenses/user-expenses?${query.toString()}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            let errorMessage = `HTTP error! status: ${response.status}`;
            try {
                const errorData = await response.json();
                errorMessage = errorData.error || errorData.message || errorMessage;
            } catch (e) {
                // Fallback if response body is not JSON or parsing fails
            }
            throw new Error(errorMessage);
        }

        const data: PaginatedRecurringExpensesResponse = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching paginated recurring expenses:", error);
        throw error;
    }
}