"use client";

import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useRouter } from "next/navigation";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area" 

const SkeletonRow = () => (
    <tr className="border-b border-border animate-pulse">
        {[40, 24, 32, 16, 20, 24].map((w, i) => (
            <td key={i} className="p-3 px-8">
                <div className={`h-4 bg-gray-300 rounded-0 w-${w}`}></div>
            </td>
        ))}
    </tr>
);
const SkeletonCard = () => (
    <div className="rounded-xl p-3 w-full bg-card backdrop-blur-sm shadow-md hover:shadow-md transition-all duration-300 cursor-pointer border border-gray-100 animate-pulse">
        <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-brand-body">Loading...</p>
            <div className="h-6 bg-gray-300 rounded w-[30px]"></div>
        </div>
    </div>
);

export default function JournalList() {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "";
    const [journalEntries, setJournalEntries] = useState<any[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const router = useRouter();
    const [totalDebit, setTotalDebit] = useState(0);
    const [totalCredit, setTotalCredit] = useState(0);

    // Use Date objects here instead of strings
    const [fromDate, setFromDate] = useState<Date | null>(null);
    const [toDate, setToDate] = useState<Date | null>(null);

    const itemsPerPage = 10;

    // Handle view details
    const handleView = (entry: any) => {
        var encodedId = btoa(entry.id);
        router.push(`/dashboard/general-ledger/items?parent=${encodedId}`);
    };

    // When fromDate changes, ensure toDate is never before fromDate
    const handleFromDateChange = (date: Date | null) => {
        setFromDate(date);
        if (date && toDate && toDate < date) {
            setToDate(date);
        }
    };

    // When toDate changes, prevent it from being less than fromDate
    const handleToDateChange = (date: Date | null) => {
        if (fromDate && date && date < fromDate) {
            setToDate(fromDate);
        } else {
            setToDate(date);
        }
    };

    // Format date as yyyy-MM-dd for query params
    const formatDate = (date: Date | null) =>
        date ? date.toISOString().slice(0, 10) : "";

    // Simple validation: toDate can't be before fromDate
    const isDateRangeValid = !fromDate || !toDate || toDate >= fromDate;

    const fetchJournalData = async (
        page = 1,
        searchTerm = "",
        from: Date | null = null,
        to: Date | null = null
    ) => {
        if (!isDateRangeValid) return; // Do not fetch if invalid date range

        setLoading(true);
        try {
            const token = localStorage.getItem("token") || "";
            const params = new URLSearchParams({
                page: page.toString(),
                limit: itemsPerPage.toString(),
                ...(searchTerm && { privateNote: searchTerm }),
                ...(from && { fromDate: formatDate(from) }),
                ...(to && { toDate: formatDate(to) }),
            });

            const url = `${backendUrl}journal?${params.toString()}`;
            const res = await fetch(url, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) throw new Error("Failed to load journal entries");
            const data = await res.json();

            setJournalEntries(data.journalEntries || []);
            setTotalDebit(data.totalDebit || 0);
            setTotalCredit(data.totalCredit || 0);
            setPage(data.pagination?.currentPage || 1);
            setTotalPages(data.pagination?.totalPages || 1);
        } catch (error) {
            console.error("Error fetching journal data:", error);
            setJournalEntries([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!backendUrl) return console.error("Backend URL is not set");
        fetchJournalData(page, search, fromDate, toDate);
    }, [backendUrl, page, search, fromDate, toDate]);

    return (
        <section className="mx-auto max-w-[1400px] w-full pt-5">
            <div className="bg-card border border-border rounded-[16px] p-4 shadow-md w-full mx-auto transition-all duration-300 hover:shadow-md">
                <h1 className="text-xl leading-normal text-brand-body capitalize font-medium">General Ledger</h1>
                <hr className="my-3 border-t border-gray-100" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    {loading ? (
                        <>
                            <SkeletonCard />
                            <SkeletonCard />
                            <SkeletonCard />
                        </>
                    ) : (
                        <>
                            <div className="rounded-xl p-3 w-full bg-card backdrop-blur-sm shadow-md hover:shadow-md transition-all duration-300 cursor-pointer border border-border">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-semibold text-brand-body">
                                        Total Debit
                                    </p>
                                    <p className="text-2xl font-semibold text-red-600">
                                        €{totalDebit.toLocaleString()}
                                    </p>
                                </div>
                            </div>
                            <div className="rounded-xl p-3 w-full bg-card backdrop-blur-sm shadow-md hover:shadow-md transition-all duration-300 cursor-pointer border border-border">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-semibold text-brand-body">
                                        Total Credit
                                    </p>
                                    <p className="text-2xl font-semibold text-green-600">
                                        €{totalCredit.toLocaleString()}
                                    </p>
                                </div>
                            </div>
                            <div className="rounded-xl p-3 w-full bg-card backdrop-blur-sm shadow-md hover:shadow-md transition-all duration-300 cursor-pointer border border-border">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-semibold text-brand-body">
                                        Closing Balance
                                    </p>
                                    <p className="text-2xl font-semibold text-gray-800">
                                        €{(totalDebit - totalCredit).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <div className="mt-5">
                    <div className="grid md:grid-cols-4 gap-6 mb-5">
                        <div className="w-full grid">
                            <DatePicker
                                selected={fromDate}
                                onChange={handleFromDateChange}
                                dateFormat="yyyy-MM-dd"
                                placeholderText="From date"
                                className="w-full border border-border rounded-lg px-3 py-2 bg-card focus:outline-none"
                                maxDate={toDate || undefined} // Prevent fromDate > toDate
                                isClearable
                            />
                        </div>

                        <div className="w-full grid">
                            <DatePicker
                                selected={toDate}
                                onChange={handleToDateChange}
                                dateFormat="yyyy-MM-dd"
                                placeholderText="To date"
                                className="w-full border border-border rounded-lg px-3 py-2 bg-card focus:outline-none"
                                minDate={fromDate || undefined} // Prevent toDate < fromDate
                                isClearable
                            />
                        </div>

                        <input
                            type="text"
                            placeholder="Search by Reference"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full border border-border rounded-lg px-3 py-2 bg-card focus:outline-none"
                        />
                    </div>

                    {/* Show error message if date range is invalid */}
                    {!isDateRangeValid && (
                        <p className="text-red-600 mb-4">
                            Error: "To date" cannot be earlier than "From date".
                        </p>
                    )}

                    <div className="w-full overflow-x-auto rounded-md border">
                        <ScrollArea className="xl:max-w-[90vw] md:max-w-[65vw] w-full max-w-[76vw]">
                            <table className="w-full text-sm">
                                <thead className="border-b border-border bg-brand-body">
                                    <tr>
                                        {["Sr No", "Transaction Date", "Reference", "Action"].map(
                                            (title) => (
                                                <th
                                                    key={title}
                                                    className="p-2.5 border-r border-border font-medium text-start px-8"
                                                >
                                                    {title}
                                                </th>
                                            )
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading
                                        ? Array(5)
                                            .fill(null)
                                            .map((_, i) => <SkeletonRow key={i} />)
                                        : journalEntries.length
                                            ? journalEntries.map((entry, index) => (
                                                <tr key={entry.id} className="border-b border-border">
                                                    <td className="p-3 px-8">
                                                        {(page - 1) * itemsPerPage + index + 1}
                                                    </td>
                                                    <td className="p-3 px-8">
                                                        {entry.txnDate
                                                            ? new Date(entry.txnDate).toISOString().slice(0, 10)
                                                            : "-"}
                                                    </td>
                                                    <td className="p-3 px-8">{entry.privateNote}</td>
                                                    <td className="p-3 px-8">
                                                        <button
                                                            className="w-6 h-6 text-card-foreground rounded-full text-sm text-center flex items-center cursor-pointer justify-center"
                                                            onClick={() => handleView(entry)}
                                                        >
                                                            <i
                                                                className="fi fi-rr-eye leading-0"
                                                                title="View"
                                                            ></i>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                            : (
                                                <tr>
                                                    <td colSpan={5} className="p-4 text-center text-muted-foreground">
                                                        No journal entries found.
                                                    </td>
                                                </tr>
                                            )}
                                </tbody>
                            </table>
                        </ScrollArea>

                        {/* Pagination */}
                        <div className="flex justify-end space-x-4 py-4">
                            <button
                                disabled={page === 1}
                                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                                className="px-3 py-1 border border-border rounded disabled:opacity-40"
                            >
                                Prev
                            </button>
                            <span className="inline-block px-3 py-1 border border-border rounded">
                                {page} / {totalPages}
                            </span>
                            <button
                                disabled={page === totalPages}
                                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                                className="px-3 py-1 border border-border rounded disabled:opacity-40"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
