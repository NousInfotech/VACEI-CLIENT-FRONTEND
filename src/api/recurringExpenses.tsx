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

// Mock implementation - no backend calls
// Simulate API delay
async function simulateDelay(ms: number = 300) {
    await new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Fetches a paginated list of recurring expenses for a specific user.
 * @param {FetchRecurringExpensesParams} params - The parameters for fetching expenses.
 * @returns {Promise<PaginatedRecurringExpensesResponse>} - The response containing expenses and pagination info.
 * @throws {Error} If the API call fails or the backend URL is not defined.
 */
export async function fetchPaginatedRecurringExpenses(
    params: FetchRecurringExpensesParams
): Promise<PaginatedRecurringExpensesResponse> {
    // Simulate API delay
    await simulateDelay(300);

    const page = params.page || 1;
    const limit = params.limit || 10;

    // Mock recurring expenses
    const mockExpenses: RecurringExpense[] = [
        {
            id: 1,
            vendorId: "vendor-1",
            vendorName: "Office Supplies Co.",
            totalAmount: 5000,
            transactionCount: 12,
            active: true,
            intuitAccountId: 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            transactions: [
                {
                    id: 1,
                    txnDate: new Date().toISOString(),
                    amount: 500,
                    attachments: [],
                    recurringExpenseSummaryId: 1,
                },
            ],
        },
        {
            id: 2,
            vendorId: "vendor-2",
            vendorName: "Utility Services",
            totalAmount: 3600,
            transactionCount: 12,
            active: true,
            intuitAccountId: 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            transactions: [
                {
                    id: 2,
                    txnDate: new Date().toISOString(),
                    amount: 300,
                    attachments: [],
                    recurringExpenseSummaryId: 2,
                },
            ],
        },
    ];

    // Paginate
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedExpenses = mockExpenses.slice(startIndex, endIndex);
    const totalCount = mockExpenses.length;
    const totalPages = Math.ceil(totalCount / limit);

    return {
        message: "Success",
        expenses: paginatedExpenses,
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