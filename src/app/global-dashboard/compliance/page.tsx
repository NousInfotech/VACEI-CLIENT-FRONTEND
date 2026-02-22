"use client";

import { useState, useEffect, useMemo } from "react";
import { 
    Building2, 
    CheckCircle2, 
    AlertCircle, 
    ChevronDown, 
    LayoutGrid, 
    CalendarDays, 
    List as ListIcon, 
    Calendar as CalendarIcon,
    Clock,
    Calendar as CalendarIconLucide
} from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import { useGlobalDashboard } from "@/context/GlobalDashboardContext";
import { cn } from "@/lib/utils";
import Dropdown from "@/components/Dropdown";
import { Button } from "@/components/ui/button";
import { listComplianceCalendars, ComplianceCalendarEntry } from "@/api/complianceCalendarService";
import { format, isPast, isToday } from "date-fns";
import { Badge } from "@/components/ui/badge";
import PillTabs from "@/components/shared/PillTabs";
import { Skeleton } from "@/components/ui/skeleton";
import ComplianceMonthView from "@/components/engagement/ComplianceMonthView";

export type ComplianceStatus = 'filed' | 'upcoming' | 'due_today' | 'overdue'

interface ComplianceItem {
  id: string
  complianceId: string
  companyId?: string
  companyName?: string
  title: string
  type: string
  dueDate: string
  status: ComplianceStatus
  authority: string
  description: string
  cta: string
}

function mapApiToComplianceItem(c: ComplianceCalendarEntry): ComplianceItem {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const deadline = new Date(c.dueDate)
  deadline.setHours(0, 0, 0, 0)
  
  const isPastDate = deadline.getTime() < today.getTime()
  const isTodayDate = deadline.getTime() === today.getTime()

  // For Global Calendar, we don't have a dedicated status field like EngagementCompliance
  // but we can infer it or just use 'upcoming'/'overdue'/'due_today'
  let status: ComplianceStatus = 'upcoming'
  if (isPastDate) status = 'overdue'
  else if (isTodayDate) status = 'due_today'
  else status = 'upcoming'

  return {
    id: c.id,
    complianceId: c.id,
    companyId: c.companyId || undefined,
    companyName: c.company?.name || (c.type === 'GLOBAL' ? 'Global' : 'Other'),
    title: c.title,
    type: c.frequency,
    dueDate: c.dueDate,
    status,
    authority: c.customServiceCycle?.title || c.serviceCategory,
    description: c.description || '',
    cta: 'Mark as done',
  }
}

const statusConfig: Record<ComplianceStatus, { label: string; color: string; icon: any; tone: "success" | "info" | "warning" | "danger" }> = {
  filed: { 
    label: 'Completed', 
    color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    icon: CheckCircle2,
    tone: 'success'
  },
  upcoming: { 
    label: 'Upcoming', 
    color: 'bg-blue-50 text-blue-600 border-blue-100',
    icon: Clock,
    tone: 'info'
  },
  due_today: { 
    label: 'Due Today', 
    color: 'bg-orange-50 text-orange-600 border-orange-100',
    icon: AlertCircle,
    tone: 'warning'
  },
  overdue: { 
    label: 'Overdue', 
    color: 'bg-red-50 text-red-600 border-red-100',
    icon: AlertCircle,
    tone: 'danger'
  },
}

function SummaryCard({
  label,
  value,
  tone,
  onClick,
  isActive,
}: {
  label: string;
  value: number;
  tone: "danger" | "warning" | "info" | "success";
  onClick: () => void;
  isActive: boolean;
}) {
  const toneClasses = {
    danger: {
      border: "border-red-500/30",
      bg: "bg-red-50/50",
      text: "text-red-500",
    },
    warning: {
      border: "border-orange-500/30",
      bg: "bg-orange-50/50",
      text: "text-orange-500",
    },
    info: {
      border: "border-blue-500/30",
      bg: "bg-blue-50/50",
      text: "text-blue-500",
    },
    success: {
      border: "border-emerald-500/30",
      bg: "bg-emerald-50/50",
      text: "text-emerald-500",
    },
  };

  const classes = toneClasses[tone];

  return (
    <div
      className={cn(
        "cursor-pointer transition-all rounded-0 border p-4",
        classes.border,
        classes.bg,
        isActive ? "ring-2 ring-primary" : "bg-white"
      )}
      onClick={onClick}
    >
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{label}</p>
      <p className={cn("text-2xl font-bold tabular-nums", classes.text)}>{value}</p>
    </div>
  );
}

export default function GlobalCompliancePage() {
    const { companies, loading: contextLoading } = useGlobalDashboard();
    const [selectedCompanyId, setSelectedCompanyId] = useState<string | "all">("all");
    const [calendarEntries, setCalendarEntries] = useState<ComplianceCalendarEntry[]>([]);
    const [loadingEntries, setLoadingEntries] = useState(false);
    const [viewMode, setViewMode] = useState<'list' | 'month'>('list')
    const [activeFilter, setActiveFilter] = useState<ComplianceStatus | 'all'>('all')

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

    const allItems: ComplianceItem[] = useMemo(
        () => calendarEntries.map(mapApiToComplianceItem),
        [calendarEntries]
    )
    
    const filteredItems = activeFilter === 'all' 
        ? allItems 
        : allItems.filter((item: ComplianceItem) => item.status === activeFilter)

    const counts = {
        overdue: allItems.filter((i: ComplianceItem) => i.status === 'overdue').length,
        due_today: allItems.filter((i: ComplianceItem) => i.status === 'due_today').length,
        upcoming: allItems.filter((i: ComplianceItem) => i.status === 'upcoming').length,
        filed: allItems.filter((i: ComplianceItem) => i.status === 'filed').length,
    }

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

            <div className="space-y-8">
                {/* Summary Cards Strip */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <SummaryCard
                        label="Overdue"
                        value={counts.overdue}
                        tone="danger"
                        onClick={() => setActiveFilter(activeFilter === 'overdue' ? 'all' : 'overdue')}
                        isActive={activeFilter === 'overdue'}
                    />
                    <SummaryCard
                        label="Due Today"
                        value={counts.due_today}
                        tone="warning"
                        onClick={() => setActiveFilter(activeFilter === 'due_today' ? 'all' : 'due_today')}
                        isActive={activeFilter === 'due_today'}
                    />
                    <SummaryCard
                        label="Upcoming"
                        value={counts.upcoming}
                        tone="info"
                        onClick={() => setActiveFilter(activeFilter === 'upcoming' ? 'all' : 'upcoming')}
                        isActive={activeFilter === 'upcoming'}
                    />
                    <SummaryCard
                        label="Completed"
                        value={counts.filed}
                        tone="success"
                        onClick={() => setActiveFilter(activeFilter === 'filed' ? 'all' : 'filed')}
                        isActive={activeFilter === 'filed'}
                    />
                </div>

                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h3 className="text-xl font-bold text-gray-900 tracking-tight">
                                {viewMode === 'list' ? 'Compliance Deadlines' : 'Compliance Calendar'}
                            </h3>
                            <p className="text-sm text-gray-500">
                                {viewMode === 'list' 
                                    ? 'Track and manage your statutory obligations.' 
                                    : 'Interactive timeline of your filing deadlines.'}
                            </p>
                        </div>
                        {/* View Toggle */}
                        <div className="w-fit">
                            <PillTabs
                                tabs={[
                                    { id: 'list', label: 'List view', icon: ListIcon },
                                    { id: 'month', label: 'Month view', icon: CalendarIcon }
                                ]}
                                activeTab={viewMode}
                                onTabChange={(id) => setViewMode(id as 'list' | 'month')}
                                className="bg-gray-50 border border-gray-100"
                            />
                        </div>
                    </div>

                    {loadingEntries ? (
                        <div className="space-y-4">
                            <Skeleton className="h-8 w-64 rounded-0" />
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Skeleton key={i} className="h-24 rounded-0" />
                            ))}
                        </div>
                    ) : viewMode === 'list' ? (
                        <div className="grid gap-4">
                            {filteredItems.length === 0 ? (
                                <div className="text-center py-20 border border-dashed border-gray-200 bg-gray-50/30">
                                    <p className="text-sm text-gray-400 font-medium tracking-wide bg-white px-4 py-2 border border-gray-100 inline-block">
                                        No items found for the current filter.
                                    </p>
                                </div>
                            ) : (
                                filteredItems.map((item: ComplianceItem) => {
                                    const config = statusConfig[item.status] || statusConfig.upcoming
                                    const StatusIcon = config.icon || Clock

                                    return (
                                        <div 
                                            key={item.id}
                                            className="group bg-white border border-gray-100 p-6 flex flex-col md:flex-row md:items-center gap-6 relative overflow-hidden"
                                        >
                                            <div className={cn(
                                                "absolute left-0 top-0 bottom-0 w-1",
                                                item.status === 'filed' && "bg-emerald-500",
                                                item.status === 'upcoming' && "bg-blue-500",
                                                item.status === 'due_today' && "bg-orange-500",
                                                item.status === 'overdue' && "bg-red-500"
                                            )} />

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <Badge className={cn("rounded-0 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest border", config.color)}>
                                                        <StatusIcon className="w-3 h-3 mr-1.5" />
                                                        {config.label}
                                                    </Badge>
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{item.type}</span>
                                                    {selectedCompanyId === "all" && (
                                                        <span className="text-[10px] font-bold text-primary border border-primary/20 bg-primary/5 px-2 py-0.5 uppercase tracking-widest">
                                                            {item.companyName}
                                                        </span>
                                                    )}
                                                </div>
                                                
                                                <h4 className="text-lg font-bold text-gray-900 group-hover:text-primary transition-colors tracking-tight mb-1">
                                                    {item.title}
                                                </h4>
                                                
                                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                                                    <div className="flex items-center gap-1.5">
                                                        <CalendarIconLucide className="w-3.5 h-3.5 text-gray-400" />
                                                        <span>Due: <span className="text-gray-900 font-semibold">{format(new Date(item.dueDate), "dd MMM yyyy")}</span></span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                                                        <span>Authority: <span className="text-gray-900 font-semibold">{item.authority}</span></span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="shrink-0 flex items-center md:justify-end gap-3 mt-4 md:mt-0">
                                                <Badge variant="outline" className="text-xs font-medium text-gray-500 border-gray-200">
                                                    View Details
                                                </Badge>
                                            </div>
                                        </div>
                                    )
                                })
                            )}
                        </div>
                    ) : (
                        <div className="bg-white border border-gray-100 p-6 overflow-hidden">
                            <ComplianceMonthView items={allItems} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
