"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchJournalItemAPI, JournalLine } from "../../../../../api/journalApi";
import Link from "next/link"; // Import Link for client-side navigation
import { Select } from "@/components/ui/select";

const SkeletonRow = () => (
    <tr className="border-b border-border animate-pulse">
        {[8, 40, 32, 16, 24].map((w, i) => (
            <td key={i} className="p-3 px-8">
                <div className={`h-4 bg-gray-300 rounded`} style={{ width: `${w}%` }}></div>
            </td>
        ))}
    </tr>
);

const SkeletonCard = () => (
    <div className="border border-neutral-200 bg-card p-4 animate-pulse">
        <p className="text-xs text-neutral-500 uppercase mb-1">Loading...</p>
        <div className="h-6 bg-gray-300 rounded w-1/2"></div>
    </div>
);

export default function JournalListContent() {
    const backendUrl: string = process.env.NEXT_PUBLIC_BACKEND_URL || "";
    const searchParams = useSearchParams();
    const router = useRouter();

    const [parentId, setParentId] = useState<string | null>(null);
    const [journalLines, setJournalLines] = useState<JournalLine[]>([]);
    const [page, setPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [loading, setLoading] = useState<boolean>(true);
    const [search, setSearch] = useState<string>("");
    const [accountNameFilter, setAccountNameFilter] = useState<string>("");
    const [descriptionFilter, setDescriptionFilter] = useState<string>("");
    const [postingTypeFilter, setPostingTypeFilter] = useState<"" | "Credit" | "Debit">("");
    const [amountFilter, setAmountFilter] = useState<string>("");
    const [totalDebit, setTotalDebit] = useState<number>(0);
    const [totalCredit, setTotalCredit] = useState<number>(0);

    const itemsPerPage: number = 10;

    const handleView = (line: JournalLine) => {
        router.push(`/dashboard/general-ledger/items?id=${encodeURIComponent(line.id)}`);
    };

    const fetchJournalItem = async () => {
        setLoading(true);
        try {
            const token: string = localStorage.getItem("token") || "";
            if (!parentId) {
                console.warn("Parent ID is null, cannot fetch journal items.");
                setLoading(false);
                return;
            }

            const data = await fetchJournalItemAPI(
                backendUrl,
                parentId,
                token,
                page,
                itemsPerPage,
                search,
                accountNameFilter,
                descriptionFilter,
                postingTypeFilter,
                amountFilter
            );

            setJournalLines(data.journalLines || []);
            setTotalDebit(data.totalDebit || 0);
            setTotalCredit(data.totalCredit || 0);
            setPage(data.pagination?.currentPage || 1);
            setTotalPages(data.pagination?.totalPages || 1);
        } catch (error: any) {
            console.error("Error fetching journal data:", error.message);
            setJournalLines([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const encodedParent: string | null = searchParams.get("parent");
        if (encodedParent) {
            try {
                const decodedId: string = atob(encodedParent);
                setParentId(decodedId);
            } catch (error: any) {
                console.error("Invalid base64 string:", error.message);
                setLoading(false);
            }
        } else {
            setLoading(false);
        }
    }, [searchParams]);

    useEffect(() => {
        if (!backendUrl || !parentId) return;
        fetchJournalItem();
    }, [
        backendUrl,
        page,
        search,
        parentId,
        accountNameFilter,
        descriptionFilter,
        postingTypeFilter,
        amountFilter,
    ]);

    return (
        <div className="space-y-8">
            <div className="space-y-6 relative min-h-screen">
                {/* Use flexbox to position the heading and button */}
                <div className="flex justify-between items-center pb-5 border-b border-border">
                    <h1 className="text-2xl font-medium">Ledger Items</h1>
                    <Link href="/dashboard/general-ledger" passHref>
                        <button className="bg-sidebar-background hover:bg-sidebar-hover text-sidebar-foreground py-2 px-4 rounded focus:outline-none shadow-md">
                            Go Back
                        </button>
                    </Link>
                </div>
                {/* End of Header with Button */}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {loading && !parentId ? ( // Show skeleton cards initially if parentId is not yet determined
                        <>
                            <SkeletonCard />
                            <SkeletonCard />
                            <SkeletonCard />
                        </>
                    ) : (
                        <>
                            <div className="border border-neutral-200 bg-card p-4">
                                <p className="text-xs text-neutral-500 uppercase mb-1">Total Debit</p>
                                <p className="text-lg font-semibold text-red-600">€{totalDebit.toLocaleString()}</p>
                            </div>
                            <div className="border border-neutral-200 bg-card p-4">
                                <p className="text-xs text-neutral-500 uppercase mb-1">Total Credit</p>
                                <p className="text-lg font-semibold text-green-600">€{totalCredit.toLocaleString()}</p>
                            </div>
                            <div className="border border-neutral-200 bg-card p-4">
                                <p className="text-xs text-neutral-500 uppercase mb-1">Closing Balance</p>
                                <p className="text-lg font-semibold text-gray-800">
                                    €{(totalDebit - totalCredit).toLocaleString()}
                                </p>
                            </div>
                        </>
                    )}
                </div>

                <div className="bg-card shadow p-6 mt-5">
                    <div className="grid md:grid-cols-4 gap-6 mb-5">
                        <input
                            type="text"
                            placeholder="Filter by Account Name"
                            value={accountNameFilter}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAccountNameFilter(e.target.value)}
                            className="w-full border p-2 text-sm border-border rounded-0 focus:outline-none"
                        />

                        <input
                            type="text"
                            placeholder="Filter by Description"
                            value={descriptionFilter}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDescriptionFilter(e.target.value)}
                            className="w-full border p-2 text-sm border-border rounded-0 focus:outline-none"
                        />

                        <Select
                            value={postingTypeFilter}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setPostingTypeFilter(e.target.value as "" | "Credit" | "Debit")}
                            className="w-full"
                        >
                            <option value="">Filter by Posting Type</option>
                            <option value="Credit">Credit</option>
                            <option value="Debit">Debit</option>
                        </Select>

                        <input
                            type="text"
                            placeholder="Filter by Amount"
                            value={amountFilter}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAmountFilter(e.target.value)}
                            className="w-full border p-2 text-sm border-border rounded-0 focus:outline-none"
                        />
                    </div>

                    <div className="w-full overflow-x-auto lg:max-w-[1400px]">
                        <table className="w-full text-sm text-muted-foreground border-collapse table_custom1">
                            <thead className="text-xs text-brand-body uppercase bg-brand-body">
                                <tr>
                                    <th className="text-left px-6 py-3">S.No</th>
                                    {["Account Name", "Description", "Posting Type", "Amount"].map((title: string) => (
                                        <th
                                            key={title}
                                            className="text-left px-6 py-3 cursor-pointer hover:underline"
                                        >
                                            {title}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {loading
                                    ? Array.from({ length: 5 }).map((_, i: number) => <SkeletonRow key={i} />)
                                    : journalLines.length > 0
                                        ? journalLines.map((line: JournalLine, index: number) => (
                                            <tr
                                                key={line.id || index}
                                                className="border-b border-border"
                                            >
                                                <td className="px-6 py-3 text-brand-body">
                                                    {(page - 1) * itemsPerPage + index + 1}
                                                </td>
                                                <td className="px-6 py-3 text-brand-body">{line.accountName || "-"}</td>
                                                <td className="px-6 py-3 text-brand-body">{line.description || "-"}</td>
                                                <td className="px-6 py-3 text-brand-body">
                                                    <span
                                                        className={`inline-block text-xs font-medium px-2 py-1 ${
                                                            line.postingType === "Debit"
                                                                ? "bg-red-100 text-red-700"
                                                                : "bg-sidebar-background text-green-700"
                                                        }`}
                                                    >
                                                        {line.postingType}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-3 text-brand-body">
                                                    {line.amount !== undefined ? "€" + line.amount : "-"}
                                                </td>
                                            </tr>
                                        ))
                                        : (
                                            <tr>
                                                <td colSpan={5} className="p-4 text-center text-muted-foreground">
                                                    No journal lines found.
                                                </td>
                                            </tr>
                                        )}
                            </tbody>
                        </table>

                        {!loading && (
                            <div className="flex justify-end space-x-4 py-4">
                                <button
                                    disabled={page === 1}
                                    onClick={() => setPage((p: number) => Math.max(p - 1, 1))}
                                    className="px-3 py-1 border border-border rounded disabled:opacity-40"
                                >
                                    Prev
                                </button>
                                <span className="inline-block px-3 py-1 border border-border rounded">
                                    {page} / {totalPages}
                                </span>
                                <button
                                    disabled={page === totalPages}
                                    onClick={() => setPage((p: number) => Math.min(p + 1, totalPages))}
                                    className="px-3 py-1 border border-border rounded disabled:opacity-40"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}