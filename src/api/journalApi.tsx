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

    const params = new URLSearchParams({
        page: page.toString(),
        limit: itemsPerPage.toString(),
        ...(searchTerm && { privateNote: searchTerm }),
        ...(accountName && { accountName }),
        ...(description && { description }),
        ...(postingType && { postingType }),
        ...(amount && { amount }),
    });

    const url: string = `${backendUrl}journal/getJournalItems/${parentId}?${params.toString()}`;

    const res: Response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
        throw new Error("Failed to load journal entries");
    }

    const data: FetchJournalItemResponse = await res.json();
    return data;
}
