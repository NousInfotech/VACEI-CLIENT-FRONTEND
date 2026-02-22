"use client";

import { useState, useEffect } from "react";
import { Building2, CheckCircle2, AlertCircle, AlertTriangle, ChevronDown, LayoutGrid, CalendarDays, ExternalLink } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import { useGlobalDashboard } from "@/context/GlobalDashboardContext";
import { cn } from "@/lib/utils";
import Dropdown from "@/components/Dropdown";
import { Button } from "@/components/ui/button";
import { listComplianceCalendars, ComplianceCalendarEntry } from "@/api/complianceCalendarService";
import { format, isPast, isToday, addDays } from "date-fns";

export default function GlobalCompliancePage() {
    const { companies, loading: contextLoading } = useGlobalDashboard();
    const [selectedCompanyId, setSelectedCompanyId] = useState<string | "all">("all");
    const [calendarEntries, setCalendarEntries] = useState<ComplianceCalendarEntry[]>([]);
    const [loadingEntries, setLoadingEntries] = useState(false);

    const selectedCompany = companies.find(c => c.id === selectedCompanyId);
    
    useEffect(() => {
        const fetchEntries = async () => {
            setLoadingEntries(true);
            try {
                const params = selectedCompanyId === "all" ? {} : { companyId: selectedCompanyId };
                const data = await listComplianceCalendars(params);
                setCalendarEntries(data);
            } catch (error) {
                console.error("Failed to fetch compliance entries:", error);
            } finally {
                setLoadingEntries(false);
            }
        };

        fetchEntries();
    }, [selectedCompanyId]);

    const filteredCompanies = selectedCompanyId === "all" 
        ? companies 
        : companies.filter(c => c.id === selectedCompanyId);

    // Calculate totals from calendar entries for better accuracy
    const totalOverdue = calendarEntries.filter(e => isPast(new Date(e.dueDate)) && !isToday(new Date(e.dueDate))).length;
    const totalDueSoon = calendarEntries.filter(e => {
        const due = new Date(e.dueDate);
        return !isPast(due) && due <= addDays(new Date(), 7);
    }).length;

    const getStatusConfig = (overdue: number, dueSoon: number) => {
        if (overdue > 0) return { label: "Overdue", color: "text-red-600", bg: "bg-red-50", border: "border-red-200", icon: AlertCircle };
        if (dueSoon > 0) return { label: "Due Soon", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", icon: AlertTriangle };
        return { label: "Upcoming", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", icon: CheckCircle2 };
    };

    if (contextLoading) {
        return <div className="p-8 text-center text-slate-400">Loading compliance data...</div>;
    }

    return (
        <div className="space-y-8 pb-12">
            <PageHeader 
                title="Compliance Overview"
                subtitle="Monitor statutory deadlines and filing requirements across all companies."
                icon={LayoutGrid}
                actions={
                    <div className="flex items-center gap-3 bg-white p-1 rounded-2xl border border-slate-200 shadow-sm self-start md:self-auto">
                        <Dropdown
                            trigger={
                                <Button variant="ghost" className="h-10 px-4 rounded-xl text-slate-900 hover:bg-slate-50 gap-2 border-none">
                                    <Building2 size={16} className="text-primary-color-new" />
                                    <span className="max-w-[150px] truncate">
                                        {selectedCompanyId === "all" ? "All Companies" : selectedCompany?.name}
                                    </span>
                                    <ChevronDown size={14} className="text-slate-400" />
                                </Button>
                            }
                            align="right"
                            className="border-none"
                            contentClassName="bg-white border-slate-200 text-slate-900 rounded-2xl p-1 shadow-2xl"
                        >
                            <div className="p-1">
                                <button
                                    onClick={() => setSelectedCompanyId("all")}
                                    className={cn(
                                        "flex w-full items-center px-4 py-2.5 text-sm font-medium rounded-xl transition-colors hover:bg-slate-50",
                                        selectedCompanyId === "all" ? "bg-slate-100 text-slate-900" : "text-slate-600"
                                    )}
                                >
                                    All Companies
                                </button>
                                {companies.map(company => (
                                    <button
                                        key={company.id}
                                        onClick={() => setSelectedCompanyId(company.id)}
                                        className={cn(
                                            "flex w-full items-center px-4 py-2.5 text-sm font-medium rounded-xl transition-colors hover:bg-slate-50",
                                            selectedCompanyId === company.id ? "bg-slate-100 text-slate-900" : "text-slate-600"
                                        )}
                                    >
                                        {company.name}
                                    </button>
                                ))}
                            </div>
                        </Dropdown>
                    </div>
                }
            />


            {/* Compliance Table-like View */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {selectedCompanyId === "all" ? <LayoutGrid className="w-5 h-5 text-primary-color-new" /> : <CalendarDays className="w-5 h-5 text-primary-color-new" />}
                        <h3 className="font-bold text-slate-900">
                            {selectedCompanyId === "all" ? "Company Compliance Status" : `${selectedCompany?.name} Deadlines`}
                        </h3>
                    </div>
                    <span className="text-xs text-slate-400 font-medium">
                        {selectedCompanyId === "all" ? `${filteredCompanies.length} company(s)` : `${calendarEntries.length} total item(s)`}
                    </span>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50/50">
                                <th className="px-8 py-4">Compliance Item</th>
                                {selectedCompanyId === "all" && <th className="px-8 py-4">Company</th>}
                                <th className="px-8 py-4">Service</th>
                                <th className="px-8 py-4">Status</th>
                                <th className="px-8 py-4 text-right">Due Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loadingEntries ? (
                                <tr>
                                    <td colSpan={4} className="px-8 py-12 text-center">
                                        <div className="flex flex-col items-center gap-3 text-primary">
                                            <div className="w-6 h-6 border-2 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
                                            <span className="text-sm font-bold uppercase tracking-widest text-slate-600">Loading compliance items...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : calendarEntries.length === 0 ? (
                                <tr>
                                    <td colSpan={selectedCompanyId === "all" ? 5 : 4} className="px-8 py-12 text-center text-slate-400 font-medium italic">
                                        No compliance items found.
                                    </td>
                                </tr>
                            ) : (
                                calendarEntries.map(entry => {
                                    const dueDate = new Date(entry.dueDate);
                                    const isOverdue = isPast(dueDate) && !isToday(dueDate);
                                    const isDueSoon = !isPast(dueDate) && dueDate <= addDays(new Date(), 7);
                                    
                                    const status = isOverdue 
                                        ? { label: "Overdue", color: "text-red-600", bg: "bg-red-50", border: "border-red-200", icon: AlertCircle }
                                        : isDueSoon 
                                            ? { label: "Due Soon", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", icon: AlertTriangle }
                                            : { label: "Upcoming", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", icon: CheckCircle2 };
                                    
                                    const StatusIcon = status.icon;

                                    return (
                                        <tr key={entry.id} className="group hover:bg-slate-50 transition-colors">
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-black font-sans">
                                                        {entry.title}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">
                                                        {entry.frequency}
                                                    </span>
                                                </div>
                                            </td>
                                            {selectedCompanyId === "all" && (
                                                <td className="px-8 py-6">
                                                    <span className="text-sm font-medium text-slate-900">
                                                        {entry.company?.name || (entry.type === 'GLOBAL' ? 'Global' : 'Other')}
                                                    </span>
                                                </td>
                                            )}
                                            <td className="px-8 py-6">
                                                <span className="inline-flex items-center px-2 py-1 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider">
                                                    {entry.serviceCategory}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className={cn(
                                                    "flex items-center gap-2 px-3 py-1.5 rounded-full border w-fit text-xs font-bold uppercase tracking-wider",
                                                    status.color, status.bg, status.border
                                                )}>
                                                    <StatusIcon size={14} />
                                                    {status.label}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <span className={cn(
                                                    "text-sm font-bold",
                                                    isOverdue ? "text-red-600" : isDueSoon ? "text-amber-600" : "text-black"
                                                )}>
                                                    {format(dueDate, "dd MMM yyyy")}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
