// app/dashboard/general-ledger/items/journalApi.ts

export interface JournalLine {
    id: string;
    accountName: string;
    description: string;
    postingType: "Debit" | "Credit";
    amount: number;
}

export interface FetchJournalItemResponse {
    journalLines: JournalLine[];
    totalDebit: number;
    totalCredit: number;
    pagination: {
        currentPage: number;
        totalPages: number;
    };
}

// Mock implementation - no backend calls
export async function fetchJournalItemAPI(
    backendUrl: string,
    parentId: string,
    token: string,
    page: number = 1,
    itemsPerPage: number = 10,
    searchTerm: string = "",
    accountName: string = "",
    description: string = "",
    postingType: string = "",
    amount: string = ""
): Promise<FetchJournalItemResponse> {
    const { mockGetJournalItems } = await import('./mockApiService');
    return await mockGetJournalItems({
        parentId,
        page,
        limit: itemsPerPage,
        accountName: accountName || undefined,
        description: description || undefined,
        postingType: postingType || undefined,
        amount: amount || undefined,
    });
}
