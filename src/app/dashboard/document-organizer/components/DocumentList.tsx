"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FolderPlus, FileText, CheckCircle } from 'lucide-react';
import DocumentPreview from "../components/DocumentPreview";
import { fetchUploadStatusSummary } from "@/api/documentApi"; // Updated import
import {
    fetchDocuments,
    fetchCategories,
    fetchTags,
    deleteDocument,
    fetchStatuses,
} from "@/api/documenService";
import Pagination from "@/components/Pagination";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    Edit03Icon,
    Delete02Icon,
    ViewIcon,
} from "@hugeicons/core-free-icons";

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

const statusStyles: Record<string, string> = {
    Approved: "bg-sidebar-background text-green-800 border border-green-300 rounded-0",
    "Awaiting Review":
        "bg-yellow-100 text-yellow-800 border border-yellow-300 rounded-0",
    Rejected: "bg-red-100 text-red-800 border border-red-300 rounded",
};

const SkeletonRow = () => (
    <tr className="border-b border-border animate-pulse">
        {[40, 24, 32, 16, 20, 24].map((w, i) => (
            <td key={i} className="p-3 px-8">
                <div className={`h-4 bg-gray-300 rounded-0 w-${w}`}></div>
            </td>
        ))}
    </tr>
);

const SkeletonFilter = () => (
    <div className="animate-pulse grid md:grid-cols-4 gap-4 mb-4">
        {Array(4)
            .fill(0)
            .map((_, i) => (
                <div key={i} className="h-10 bg-gray-300 rounded-0 w-full"></div>
            ))}
    </div>
);

export default function DocumentList() {
    const router = useRouter();

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear - 4 + i);

    const [documents, setDocuments] = useState<any[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState("");
    const [filterCategory, setFilterCategory] = useState("");
    const [filterYear, setFilterYear] = useState("");
    const searchParams = useSearchParams();
    const encodedStatus = searchParams.get("status");
    const initialStatus = encodedStatus ? (() => {
        try {
            return atob(encodedStatus);
        } catch {
            return "";
        }
    })() : "";

    const [filterStatus, setFilterStatus] = useState(initialStatus);
    const [filterMonth, setFilterMonth] = useState("");
    const [selectedTags, setSelectedTags] = useState<string[]>([]);

    const [categories, setCategories] = useState<any[]>([]);
    const [tags, setTags] = useState<any[]>([]);
    const [statuses, setStatuses] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    // New state for the dashboard summary data
    const [summary, setSummary] = useState({
        filesUploadedThisMonth: 0,
        typeBreakdown: { "Invoices": 0, "Receipts": 0, "Statements": 0, "Other": 0 },
        monthlyStatusBreakdown: { "Pending Review": 0, "Processed": 0, "Needs Correction": 0, "Other": 0 },
    });

    const handleView = (doc: any) => {
        const encoded = btoa(JSON.stringify(doc.id));
        router.push(
            `/dashboard/document-organizer/document-view?param=${encodeURIComponent(
                encoded
            )}`
        );
    };

    const handleEdit = (doc: any) => {
        const encoded = btoa(JSON.stringify(doc.id));
        router.push(
            `/dashboard/document-organizer/document-upload?doc=${encodeURIComponent(
                encoded
            )}`
        );
    };

    const handleDelete = async (doc: any) => {
        if (
            window.confirm(`Are you sure you want to delete "${doc.document_title}"?`)
        ) {
            try {
                await deleteDocument(doc.id);
                alert("Document deleted");
                setDocuments((docs) => docs.filter((d) => d.id !== doc.id));
            } catch (e) {
                alert("Error deleting document");
                console.error(e);
            }
        }
    };

    // Decode base64 status param on initial mount
    useEffect(() => {
        const encodedStatus = searchParams.get("status");
        if (encodedStatus) {
            try {
                const decoded = atob(encodedStatus);
                setFilterStatus(decoded);
            } catch (e) {
                console.warn("Invalid base64 status param:", encodedStatus);
            }
        }
    }, []);

    // Combined data fetching for initial load to improve performance
    useEffect(() => {
        (async () => {
            try {
                const [cats, tgs, sts] = await Promise.all([
                    fetchCategories(),
                    fetchTags(),
                    fetchStatuses(),
                ]);
                setCategories(cats);
                setTags(tgs);
                setStatuses(sts);
                const dashboardSummary = await fetchUploadStatusSummary();
                if (dashboardSummary) {
                    setSummary(dashboardSummary);
                }
            } catch (e) {
                console.error("Error fetching initial data:", e);
            } finally {
                setInitialLoading(false);
            }
        })();
    }, []);

    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                const res = await fetchDocuments({
                    page,
                    limit: 10,
                    search,
                    category: filterCategory,
                    year: filterYear,
                    month: filterMonth,
                    status: filterStatus,
                    tags: selectedTags,
                });
                setDocuments(res.data);
                setPage(res.page);
                setTotalPages(res.totalPages);
            } catch (e) {
                console.error(e);
                setDocuments([]);
            } finally {
                setLoading(false);
            }
        })();
    }, [
        page,
        search,
        filterCategory,
        filterYear,
        filterMonth,
        selectedTags,
        filterStatus,
    ]);

    const handleTagToggle = (tagName: string) => {
        setSelectedTags((prev) =>
            prev.includes(tagName)
                ? prev.filter((tag) => tag !== tagName)
                : [...prev, tagName]
        );
        setPage(1);
    };

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };

    return (
        <div className="space-y-6 relative min-h-screen">
            <div className="w-full overflow-x-auto lg:max-w-[1400px]">
                {initialLoading ? (
                    <SkeletonFilter />
                ) : (
                    <>
                        <div className="grid md:grid-cols-3 gap-6 mb-6">
                            {/* Documents This Month */}
                            <div className="rounded-xl p-3 w-full bg-card backdrop-blur-sm shadow-md hover:shadow-md transition-all duration-300 cursor-pointer border border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="bg-sidebar-background text-card-foreground rounded-full w-9 h-9 flex items-center justify-center shadow-md">
                                        <FolderPlus className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-brand-body">Documents</h3>
                                        <p className="text-xs text-brand-primary">This Month</p>
                                    </div>
                                </div>
                                <div>
                                    {summary.filesUploadedThisMonth > 0 ? (
                                        <div className="flex justify-between items-end">
                                            <span className="text-2xl font-semibold text-brand-body block"> {summary.filesUploadedThisMonth}</span>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-800 mt-3 text-center block">No data to show</p>
                                    )}
                                </div>
                            </div>

                            {/* Documents By Category */}
                            <div className="rounded-xl p-3 w-full bg-card backdrop-blur-sm shadow-md hover:shadow-md transition-all duration-300 cursor-pointer border border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="bg-sidebar-background text-card-foreground rounded-full w-9 h-9 flex items-center justify-center shadow-md">
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-brand-body">Documents</h3>
                                        <p className="text-xs text-brand-primary">By Category</p>
                                    </div>
                                </div>
                                <div>
                                    {Object.values(summary.typeBreakdown).some(v => v > 0) ? (
                                        Object.entries(summary.typeBreakdown).map(([key, value]) =>
                                            value > 0 ? (
                                                <div key={key} className="flex justify-between items-end">
                                                    <p className="text-[11px] font-medium">{key}</p>
                                                    <p className="text-2xl font-semibold text-brand-body block">{value}</p>
                                                </div>
                                            ) : null
                                        )
                                    ) : (
                                        <p className="text-sm text-gray-800 mt-3 text-center block">No data to show</p>
                                    )}
                                </div>
                            </div>

                            {/* Documents By Status */}
                            <div className="rounded-xl p-3 w-full bg-card backdrop-blur-sm shadow-md hover:shadow-md transition-all duration-300 cursor-pointer border border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="bg-sidebar-background text-card-foreground rounded-full w-9 h-9 flex items-center justify-center shadow-md">
                                        <CheckCircle className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-brand-body">Documents</h3>
                                        <p className="text-xs text-brand-primary">By Status</p>
                                    </div>
                                </div>
                                <div>
                                    {Object.values(summary.monthlyStatusBreakdown).some(v => v > 0) ? (
                                        Object.entries(summary.monthlyStatusBreakdown).map(([key, value]) =>
                                            value > 0 ? (
                                                <div key={key} className="flex justify-between items-end">
                                                    <p className="text-[11px] font-medium">{key}</p>
                                                    <span className="text-2xl font-semibold text-brand-body block">{value}</span>
                                                </div>
                                            ) : null
                                        )
                                    ) : (
                                        <p className="text-sm text-gray-800 mt-3 text-center block">No data to show</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-4 gap-4 mb-4">
                            <input
                                type="text"
                                placeholder="Search by Title or notes"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full border border-border rounded-lg px-3 py-2 bg-card focus:outline-none"
                            />
                            <select
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value)}
                                className="w-full border border-border rounded-lg px-3 py-2 bg-card focus:outline-none"
                            >
                                <option value="">All Categories</option>
                                {categories.map(({ id, name }) => (
                                    <option key={id} value={name}>
                                        {name}
                                    </option>
                                ))}
                            </select>
                            <select
                                value={filterYear}
                                onChange={(e) => setFilterYear(e.target.value)}
                                className="w-full md:w-auto rounded-md border border-border bg-card focus:border-border focus:ring focus:ring-blue-200 focus:ring-opacity-50 px-3 py-2 text-sm text-brand-body focus:outline-none"
                            >
                                <option value="">All Years</option>
                                {years.map((y) => (
                                    <option key={y} value={y.toString()}>
                                        {y}
                                    </option>
                                ))}
                            </select>
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="w-full border border-border rounded-lg px-3 py-2 bg-card focus:outline-none"
                            >
                                <option value="">All Statuses</option>
                                {statuses.map(({ id, name }) => (
                                    <option key={id} value={id}>
                                        {name}
                                    </option>
                                ))}
                            </select>
                            <select
                                value={filterMonth}
                                onChange={(e) => setFilterMonth(e.target.value)}
                                className="w-full border border-border rounded-lg px-3 py-2 bg-card focus:outline-none"
                            >
                                <option value="">All Months</option>
                                {Array.from({ length: 12 }, (_, i) => (
                                    <option key={i + 1} value={i + 1}>
                                        {new Date(0, i).toLocaleString("default", {
                                            month: "long",
                                        })}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </>
                )}

                {!initialLoading && tags.length > 0 && (
                    <div className="mb-5">
                        <label className="block text-sm mb-1">Tags</label>
                        <div className="border border-border rounded-lg px-3 py-2 bg-card max-h-48 overflow-x-auto flex flex-wrap gap-2">
                            {tags.map((tag) => {
                                const isSelected = selectedTags.includes(String(tag.id));
                                return (
                                    <label
                                        key={tag.id}
                                        className={`relative flex items-center gap-2 cursor-pointer select-none w-full mb-1 ${isSelected ? "bg-card" : ""}`}
                                        onClick={() => handleTagToggle(String(tag.id))}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            readOnly
                                            className="peer appearance-none w-4 h-4 border border-border rounded-none checked:border-[#00799c] checked:bg-[#00799c]"
                                        />
                                        <svg
                                            className="absolute w-3 h-3 text-card-foreground hidden peer-checked:block pointer-events-none left-0.5 top-0.5"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="3"
                                        >
                                            <path
                                                d="M5 13l4 4L19 7"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                        <span className="inline-flex items-center gap-2 text-xs font-medium text-gray-800">
                                            <span
                                                className="w-2 h-2 rounded-full inline-block"
                                                style={{ backgroundColor: tag.color || "#ccc" }}
                                            />
                                            {tag.name}
                                        </span>
                                    </label>
                                );
                            })}
                        </div>
                    </div>
                )}

                <div className="w-full overflow-x-auto rounded-md border">
                    <ScrollArea className="xl:max-w-[90vw] md:max-w-[65vw] w-full max-w-[76vw]">
                        <table className="w-full text-sm">
                            <thead className="border-b border-border bg-brand-body">
                                <tr>
                                    {[
                                        "Title",
                                        "Category",
                                        "Tags",
                                        "Document Status",
                                        "Extraction Status",
                                        "Uploaded",

                                        "Action",
                                    ].map((title) => (
                                        <th
                                            key={title}
                                            className="p-2.5 border-r border-border font-medium text-start px-8"
                                        >
                                            {title}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {loading
                                    ? Array(5)
                                        .fill(null)
                                        .map((_, i) => <SkeletonRow key={i} />)
                                    : documents.length
                                        ? documents.map((doc) => (
                                            <tr key={doc.id} className="border-b border-border">
                                                <td className="p-3 px-8 border-border text-brand-body">
                                                    {doc.document_title}
                                                </td>
                                                <td className="p-3 px-8 border-border text-brand-body">
                                                    {doc.categories?.length
                                                        ? doc.categories.map((c: any) => c.name).join(", ")
                                                        : "N/A"}
                                                </td>
                                                <td className="p-3 px-8 border-border text-brand-body">
                                                    {doc.tags && doc.tags.length > 0 ? (
                                                        <div className="flex flex-wrap gap-2">
                                                            {doc.tags.map(({ id, name, color }: any, idx: number) => (
                                                                <span
                                                                    key={id ?? idx}
                                                                    className="inline-flex items-center gap-2 text-xs font-medium text-gray-800"
                                                                >
                                                                    <span
                                                                        className="w-2 h-2 rounded-full inline-block"
                                                                        style={{ backgroundColor: color }}
                                                                    />
                                                                    {name}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted-foreground italic">N/A</span>
                                                    )}
                                                </td>
                                                <td className="p-3 px-8 border-border text-brand-body">
                                                    <span
                                                        className={`inline-block text-[10px] font-medium px-2 py-0.5 ${statusStyles[doc.statusName] ?? "bg-gray-200 text-gray-800 border border-border"
                                                            }`}
                                                    >
                                                        {doc.statusName || "Unknown"}
                                                    </span>
                                                </td>

                                                <td className="p-3 px-8 border-border text-brand-body">
                                                    {doc.files.every(
                                                        (file: { azureAnalysisResult: any; extractedKeyValuePairs: any[] }) =>
                                                            file.azureAnalysisResult || file.extractedKeyValuePairs.length > 0
                                                    ) ? (
                                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-sidebar-background text-green-800">
                                                            Done
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                                                            Pending
                                                        </span>
                                                    )}
                                                </td>


                                                <td className="p-3 px-8 border-border text-brand-body">
                                                    {doc.year && doc.month
                                                        ? `${new Date(
                                                            doc.year,
                                                            doc.month - 1
                                                        ).toLocaleString("default", {
                                                            month: "long",
                                                            year: "numeric",
                                                        })}`
                                                        : doc.createdAt?.slice(0, 10)}
                                                </td>

                                                <td className="p-3 px-8 border-border">
                                                    <div className="flex gap-3">
                                                        <button
                                                            className="text-muted-foreground hover:text-brand-primary transition-colors duration-200 cursor-pointer"
                                                            onClick={() => handleView(doc)}
                                                            title="View"
                                                        >
                                                            <HugeiconsIcon icon={ViewIcon} className="w-5 h-5" />
                                                        </button>

                                                        <button
                                                            className="text-muted-foreground hover:text-brand-primary transition-colors duration-200 cursor-pointer"
                                                            onClick={() => handleEdit(doc)}
                                                            title="Edit"
                                                        >
                                                            <HugeiconsIcon icon={Edit03Icon} className="w-5 h-5" />
                                                        </button>

                                                        <button
                                                            className="text-muted-foreground hover:text-brand-primary transition-colors duration-200 cursor-pointer"
                                                            onClick={() => handleDelete(doc)}
                                                            title="Delete"
                                                        >
                                                            <HugeiconsIcon icon={Delete02Icon} className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                        : (
                                            <tr>
                                                <td colSpan={6} className="p-4 text-center text-muted-foreground">
                                                    No documents found.
                                                </td>
                                            </tr>
                                        )}
                            </tbody>
                        </table>
                    </ScrollArea>
                </div>

                {!initialLoading && totalPages > 1 && (
                    <Pagination
                        currentPage={page}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                )}
            </div>
        </div>
    );
}