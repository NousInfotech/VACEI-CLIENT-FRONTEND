"use client";

import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";


// Import standalone components
import InvoiceModal from "./components/InvoiceModal";
import PaymentModal from "./components/PaymentModal";
import { Button } from "@/components/ui/button";
import { Dropdown } from "@/components/Dropdown";
import { ChevronDown } from "lucide-react";
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
// Types
type InvoiceItem = {
    itemName: string;
    quantity?: number;
    unitPrice?: number;
    amount?: number;
};

type Invoice = {
    id: string;
    docNumber: string;
    invoiceId: number;
    txnDate: string;
    dueDate: string;
    customerName: string;
    totalAmount: number;
    balance: number;
    status: string;
    lineItems?: InvoiceItem[];
};

type InvoiceStats = {
    paidCount: number;
    paidTotal: number;
    unpaidCount: number;
    unpaidTotal: number;
};

const itemsPerPage = 10;

const SkeletonRow = () => (
    <tr className="border-b border-border animate-pulse">
        {Array(6)
            .fill(null)
            .map((_, i) => (
                <td key={i} className="p-3 px-6">
                    <div className="h-4 bg-gray-300 rounded w-full" />
                </td>
            ))}
    </tr>
);

const StatsCard = ({
    title,
    count,
    total,
    bgcolorClass,
    colorClass,
    currency = "€",
}: {
    title: string;
    count: number;
    total: number;
    bgcolorClass: string;
    colorClass: string;
    currency?: string;
}) => (
    <div className="rounded-xl p-3 w-full bg-card backdrop-blur-sm shadow-md hover:shadow-md transition-all duration-300 cursor-pointer border border-gray-100">
        <h3 className="text-sm font-semibold text-brand-body mb-1">{title}</h3>
        <div className="flex justify-between items-end">
            <p className="text-2xl font-semibold text-brand-body block">
                {currency}{total.toFixed(2)}
            </p>
            <p className={`flex items-center justify-center rounded-full font-semibold min-w-7 min-h-7 ${bgcolorClass} ${colorClass}`}>{count}</p>
        </div>
    </div>
);

export default function InvoiceList() {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "";
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [paymentInvoice, setPaymentInvoice] = useState<Invoice | null>(null);
    const [stats, setStats] = useState<InvoiceStats>({
        paidCount: 0,
        paidTotal: 0,
        unpaidCount: 0,
        unpaidTotal: 0,
    });
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [fromDate, setFromDate] = useState<Date | null>(null);
    const [toDate, setToDate] = useState<Date | null>(null);
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

    const formatDate = (date: Date | null) => date?.toISOString().slice(0, 10) || "";
    const isDateRangeValid = !fromDate || !toDate || toDate >= fromDate;

    const clearFilters = () => {
        setSearch("");
        setStatusFilter("");
        setFromDate(null);
        setToDate(null);
    };

    const fetchInvoices = async () => {
        if (!isDateRangeValid || !backendUrl) return;

        setLoading(true);
        try {
            const token = localStorage.getItem("token") || "";
            const params = new URLSearchParams({
                page: page.toString(),
                limit: itemsPerPage.toString(),
                ...(search && { customerName: search }),
                ...(fromDate && { fromDate: formatDate(fromDate) }),
                ...(toDate && { toDate: formatDate(toDate) }),
                ...(statusFilter && { status: statusFilter }),
            });

            const res = await fetch(`${backendUrl}invoices?${params.toString()}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) throw new Error("Failed to fetch invoices");

            const data = await res.json();
            setInvoices(data.invoices || []);
            setPage(data.pagination?.currentPage || 1);
            setTotalPages(data.pagination?.totalPages || 1);
        } catch (err) {
            console.error("Invoice fetch failed:", err);
            setInvoices([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        if (!isDateRangeValid || !backendUrl) return;

        try {
            const token = localStorage.getItem("token") || "";
            const params = new URLSearchParams({
                ...(search && { customerName: search }),
                ...(fromDate && { fromDate: formatDate(fromDate) }),
                ...(toDate && { toDate: formatDate(toDate) }),
            });
            const res = await fetch(`${backendUrl}invoices/stats?${params.toString()}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) throw new Error("Failed to fetch stats");
            const data = await res.json();

            if (data.success && data.stats) {
                setStats(data.stats);
            }
        } catch (err) {
            console.error("Stats fetch failed:", err);
            setStats({ paidCount: 0, paidTotal: 0, unpaidCount: 0, unpaidTotal: 0 });
        }
    };

    useEffect(() => {
        fetchInvoices();
        fetchStats();
    }, [page, search, fromDate, toDate, statusFilter]);

    const handlePaymentSuccess = () => {
        setPaymentInvoice(null);
        fetchInvoices();
        fetchStats();
    };

    return (
        <section className="mx-auto max-w-[1400px] w-full pt-5">
            <div className="bg-card border border-border rounded-[16px] p-4 shadow-md w-full mx-auto transition-all duration-300 hover:shadow-md">
                <h1 className="text-xl leading-normal text-brand-body capitalize font-medium">Invoices</h1>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-6">
                    <StatsCard
                        title="Paid Invoices"
                        count={stats.paidCount}
                        total={stats.paidTotal}
                        bgcolorClass="bg-green-600"
                        colorClass="text-green-100"
                    />
                    <StatsCard
                        title="Unpaid Invoices"
                        count={stats.unpaidCount}
                        total={stats.unpaidTotal}
                        bgcolorClass="bg-red-600"
                        colorClass="text-red-100"
                    />
                    <StatsCard
                        title="Total Invoices"
                        count={stats.paidCount + stats.unpaidCount}
                        total={stats.paidTotal + stats.unpaidTotal}
                        bgcolorClass="bg-blue-600"
                        colorClass="text-blue-100"
                    />
                    <StatsCard
                        title="Outstanding Balance"
                        count={stats.unpaidCount}
                        total={stats.unpaidTotal}
                        bgcolorClass="bg-yellow-600"
                        colorClass="text-yellow-100"
                    />
                </div>

                {/* Filters */}
                <div className="flex flex-wrap md:flex-nowrap gap-4 mt-4 mb-6">
                    <div className="relative">
                        <DatePicker
                            selected={fromDate}
                            onChange={(date) => {
                                setFromDate(date);
                                setPage(1);
                                if (toDate && date && toDate < date) setToDate(date);
                            }}
                            placeholderText="From Date"
                            className="w-full md:w-auto min-w-[150px] px-3 py-2 text-sm text-brand-body border-border bg-card border rounded-lg"
                            dateFormat="yyyy-MM-dd"
                            maxDate={toDate || undefined}
                            isClearable
                            popperClassName="z-50"
                        />
                    </div>

                    <div className="relative">
                        <DatePicker
                            selected={toDate}
                            onChange={(date) => {
                                if (fromDate && date && date < fromDate) setToDate(fromDate);
                                else setToDate(date);
                                setPage(1);
                            }}
                            placeholderText="To Date"
                            className="w-full md:w-auto min-w-[150px] px-3 py-2 text-sm text-brand-body border-border bg-card border rounded-lg"
                            dateFormat="yyyy-MM-dd"
                            minDate={fromDate || undefined}
                            isClearable
                            popperClassName="z-50"
                        />
                    </div>

                    <div>
                        <input
                            type="text"
                            placeholder="Search by Customer"
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1); // reset page on search
                            }}
                            className="w-full md:w-auto min-w-[150px] px-3 py-2 text-sm text-brand-body border-border bg-card border rounded-lg"
                        />
                    </div>
                    <div>
                        <Dropdown
                            align="left"
                            label={statusFilter || "All Statuses"}
                            searchable={true}
                            items={[
                                { id: "all", label: "All Statuses", onClick: () => { setStatusFilter(""); setPage(1); } },
                                { id: "Paid", label: "Paid", onClick: () => { setStatusFilter("Paid"); setPage(1); } },
                                { id: "Unpaid", label: "Unpaid", onClick: () => { setStatusFilter("Unpaid"); setPage(1); } },
                            ]}
                            trigger={
                                <div className="border border-border rounded-lg px-3 py-2 bg-card flex justify-between items-center cursor-pointer hover:border-gray-400 transition-colors h-10 min-w-[150px] shadow-sm">
                                    <span className="text-sm text-gray-700 truncate">
                                        {statusFilter || "All Statuses"}
                                    </span>
                                    <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                                </div>
                            }
                        />
                    </div>
                    <Button
                        variant={"default"}
                        onClick={clearFilters}                    >
                        Clear Filters
                    </Button>
                </div>

                {!isDateRangeValid && (
                    <p className="text-red-600 mb-4">
                        Error: "To date" cannot be earlier than "From date".
                    </p>
                )}

                {/* Table */}
                <div className="w-full overflow-x-auto rounded-md border">
                    <ScrollArea className="xl:max-w-[90vw] md:max-w-[65vw] w-full max-w-[76vw]">
                        <Table className="w-full text-sm">
                            <TableHeader className="border-b border-border bg-brand-body">
                                <TableRow>
                                    {[
                                        "#",
                                        "Invoice No",
                                        "Date",
                                        "Customer",
                                        "Status",
                                        "Total",
                                        "Action",
                                    ].map((col) => (
                                        <TableHead
                                            key={col}
                                            className="p-2.5 border-r border-border font-medium text-left px-6"
                                        >
                                            {col}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    Array(5)
                                        .fill(null)
                                        .map((_, i) => <SkeletonRow key={i} />)
                                ) : invoices.length > 0 ? (
                                    invoices.map((inv, idx) => (
                                        <TableRow key={inv.id} className="border-b border-border">
                                            <TableCell className="p-3 px-6">
                                                {(page - 1) * itemsPerPage + idx + 1}
                                            </TableCell>
                                            <TableCell className="p-3 px-6">{inv.docNumber}</TableCell>
                                            <TableCell className="p-3 px-6">{inv.txnDate?.slice(0, 10)}</TableCell>
                                            <TableCell className="p-3 px-6">{inv.customerName}</TableCell>
                                            <TableCell className="p-3 px-6">
                                                <span
                                                    className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${inv.status?.toLowerCase() === "paid"
                                                        ? "bg-green-100 text-green-700"
                                                        : "bg-red-100 text-red-700"
                                                        }`}
                                                >
                                                    {inv.status || "Unknown"}
                                                </span>
                                            </TableCell>
                                            <TableCell className="p-3 px-6">€{inv.totalAmount?.toFixed(2)}</TableCell>
                                            <TableCell className="p-3 px-6 flex items-center gap-2">
                                                <button
                                                    className="w-6 h-6 text-sidebar-foreground bg-sidebar-background hover:bg-sidebar-hover rounded-full text-sm text-center flex items-center cursor-pointer justify-center shadow-sm"
                                                    onClick={() => setSelectedInvoice(inv)}
                                                >
                                                    <i className="fi fi-rr-eye leading-0" title="View"></i>
                                                </button>
                                                {inv.balance > 0 && (
                                                    <button
                                                        onClick={() => setPaymentInvoice(inv)}
                                                        className="w-6 h-6 text-sidebar-foreground bg-sidebar-background hover:bg-sidebar-hover rounded-full text-sm text-center flex items-center cursor-pointer justify-center shadow-sm"
                                                    >
                                                        <i className="fi fi-rr-credit-card leading-0" title="Record Payment"></i>
                                                    </button>
                                                )}

                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center text-muted-foreground p-4">
                                            No invoices found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </ScrollArea>

                    {paymentInvoice && (
                        <PaymentModal
                            invoice={paymentInvoice}
                            onClose={() => setPaymentInvoice(null)}
                            onPaymentSuccess={handlePaymentSuccess}
                        />
                    )}

                    {/* Pagination */}
                    <div className="flex justify-end space-x-4 py-4">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage((p) => Math.max(p - 1, 1))}
                            className="px-3 py-1 border border-border rounded disabled:opacity-40"
                        >
                            Prev
                        </button>
                        <span className="px-3 py-1 border border-border rounded">
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

            {selectedInvoice && (
                <InvoiceModal
                    invoice={selectedInvoice}
                    onClose={() => setSelectedInvoice(null)}
                />
            )}
        </section>
    );
}