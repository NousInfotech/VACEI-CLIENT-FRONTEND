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
} from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import { cn } from "@/lib/utils";
import Dropdown from "@/components/Dropdown";
import { Button } from "@/components/ui/button";
import { listComplianceCalendars, type ComplianceCalendarEntry } from "@/api/complianceCalendarService";
import { useSearchParams, useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import PillTabs from "@/components/shared/PillTabs";
import { Skeleton } from "@/components/ui/skeleton";
import ComplianceMonthView from "@/components/engagement/ComplianceMonthView";
import { getCompanies } from "@/api/auditService";
import ComplianceCalendarApiSection from "@/app/dashboard/compliance/ComplianceCalendarApiSection";

export type ComplianceStatus = "filed" | "upcoming" | "due_today" | "overdue";

interface ComplianceItem {
  id: string;
  complianceId: string;
  companyId?: string;
  companyName?: string;
  title: string;
  type: string;
  dueDate: string;
  status: ComplianceStatus;
  authority: string;
  description: string;
  cta: string;
}

function mapApiToComplianceItem(c: ComplianceCalendarEntry): ComplianceItem {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const deadline = new Date(c.dueDate);
  deadline.setHours(0, 0, 0, 0);

  const isPastDate = deadline.getTime() < today.getTime();
  const isTodayDate = deadline.getTime() === today.getTime();

  let status: ComplianceStatus = "upcoming";
  if (isPastDate) status = "overdue";
  else if (isTodayDate) status = "due_today";
  else status = "upcoming";

  return {
    id: c.id,
    complianceId: c.id,
    companyId: c.companyId || undefined,
    companyName: c.company?.name || (c.type === "GLOBAL" ? "Global" : "Other"),
    title: c.title,
    type: c.frequency,
    dueDate: c.dueDate,
    status,
    authority: c.customServiceCycle?.title || c.serviceCategory,
    description: c.description || "",
    cta: "View details",
  };
}

const statusConfig: Record<
  ComplianceStatus,
  { label: string; color: string; icon: any; tone: "success" | "info" | "warning" | "danger" }
> = {
  filed: {
    label: "Completed",
    color: "bg-emerald-50 text-emerald-600 border-emerald-100",
    icon: CheckCircle2,
    tone: "success",
  },
  upcoming: {
    label: "Upcoming",
    color: "bg-blue-50 text-blue-600 border-blue-100",
    icon: Clock,
    tone: "info",
  },
  due_today: {
    label: "Due Today",
    color: "bg-orange-50 text-orange-600 border-orange-100",
    icon: AlertCircle,
    tone: "warning",
  },
  overdue: {
    label: "Overdue",
    color: "bg-red-50 text-red-600 border-red-100",
    icon: AlertCircle,
    tone: "danger",
  },
};

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

export default function ClientComplianceOverview() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [companies, setCompanies] = useState<{ id: string; name: string }[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);

  const [selectedCompanyId, setSelectedCompanyId] = useState<string | "all">("all");
  const [calendarEntries, setCalendarEntries] = useState<ComplianceCalendarEntry[]>([]);
  const [loadingEntries, setLoadingEntries] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "month">("list");
  const [activeFilter, setActiveFilter] = useState<ComplianceStatus | "all">("all");

  useEffect(() => {
    const initialFilter = searchParams.get("filter");
    if (initialFilter === "due-soon") setActiveFilter("upcoming");
    if (initialFilter === "completed") setActiveFilter("filed");
  }, [searchParams]);

  useEffect(() => {
    const loadCompanies = async () => {
      setLoadingCompanies(true);
      try {
        const list = await getCompanies();
        const mapped =
          list?.map((c: { _id?: string; id?: string; name: string }) => ({
            id: c._id || (c as any).id || "",
            name: c.name,
          })) ?? [];
        setCompanies(mapped);
      } catch (e) {
        console.error("Failed to load companies for compliance overview", e);
        setCompanies([]);
      } finally {
        setLoadingCompanies(false);
      }
    };
    loadCompanies();
  }, []);

  useEffect(() => {
    const fetchEntries = async () => {
      setLoadingEntries(true);
      try {
        const params = selectedCompanyId === "all" ? {} : { companyId: selectedCompanyId };
        const data = await listComplianceCalendars(params);
        setCalendarEntries(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch compliance entries:", error);
      } finally {
        setLoadingEntries(false);
      }
    };

    fetchEntries();
  }, [selectedCompanyId]);

  const selectedCompany = companies.find((c) => c.id === selectedCompanyId);

  const allItems: ComplianceItem[] = useMemo(
    () => calendarEntries.map(mapApiToComplianceItem),
    [calendarEntries]
  );

  const filteredItems = activeFilter === "all" ? allItems : allItems.filter((item) => item.status === activeFilter);

  const counts = {
    overdue: allItems.filter((i) => i.status === "overdue").length,
    due_today: allItems.filter((i) => i.status === "due_today").length,
    upcoming: allItems.filter((i) => i.status === "upcoming").length,
    filed: allItems.filter((i) => i.status === "filed").length,
  };

  if (loadingCompanies) {
    return <div className="p-8 text-center text-slate-400">Loading compliance data...</div>;
  }

  return (
    <div className="space-y-8 pb-12">
      <PageHeader
        title="Compliance Overview"
        subtitle="Track your statutory deadlines and filings across all your companies."
        icon={LayoutGrid}
        actions={
          <div className="flex items-center gap-3 bg-white p-1 rounded-2xl border border-slate-200 shadow-sm self-start md:self-auto">
            <Dropdown
              trigger={
                <Button
                  variant="ghost"
                  className="h-10 px-4 rounded-xl text-slate-900 hover:bg-slate-50 gap-2 border-none"
                >
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
                {companies.map((company) => (
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <SummaryCard
            label="Overdue"
            value={counts.overdue}
            tone="danger"
            onClick={() => setActiveFilter(activeFilter === "overdue" ? "all" : "overdue")}
            isActive={activeFilter === "overdue"}
          />
          <SummaryCard
            label="Due Today"
            value={counts.due_today}
            tone="warning"
            onClick={() => setActiveFilter(activeFilter === "due_today" ? "all" : "due_today")}
            isActive={activeFilter === "due_today"}
          />
          <SummaryCard
            label="Upcoming"
            value={counts.upcoming}
            tone="info"
            onClick={() => setActiveFilter(activeFilter === "upcoming" ? "all" : "upcoming")}
            isActive={activeFilter === "upcoming"}
          />
          <SummaryCard
            label="Completed"
            value={counts.filed}
            tone="success"
            onClick={() => setActiveFilter(activeFilter === "filed" ? "all" : "filed")}
            isActive={activeFilter === "filed"}
          />
        </div>

        <div className="space-y-6">
          {/* Calendar deadlines table (restored from original Compliance Calendar page) */}
          <ComplianceCalendarApiSection />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-gray-900 tracking-tight">
                {viewMode === "list" ? "Compliance Deadlines" : "Compliance Calendar"}
              </h3>
              <p className="text-sm text-gray-500">
                {viewMode === "list"
                  ? "Track and manage your statutory obligations."
                  : "Interactive timeline of your filing deadlines."}
              </p>
            </div>
            <div className="w-fit">
              <PillTabs
                tabs={[
                  { id: "list", label: "List view", icon: ListIcon },
                  { id: "month", label: "Month view", icon: CalendarIcon },
                ]}
                activeTab={viewMode}
                onTabChange={(id) => setViewMode(id as "list" | "month")}
                className="bg-gray-50 border border-gray-100"
              />
            </div>
          </div>

          {loadingEntries ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-64 rounded-0" />
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-0" />
              ))}
            </div>
          ) : viewMode === "list" ? (
            <div className="grid gap-4">
              {filteredItems.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-gray-200 bg-gray-50/30">
                  <p className="text-sm text-gray-400 font-medium tracking-wide bg-white px-4 py-2 border border-gray-100 inline-block">
                    No items found for the current filter.
                  </p>
                </div>
              ) : (
                filteredItems.map((item) => {
                  const config = statusConfig[item.status] || statusConfig.upcoming;
                  const StatusIcon = config.icon || Clock;

                  return (
                    <div
                      key={item.id}
                      className="group bg-white border border-gray-100 p-6 flex flex-col md:flex-row md:items-center gap-6 relative overflow-hidden"
                    >
                      <div
                        className={cn(
                          "absolute left-0 top-0 bottom-0 w-1",
                          item.status === "filed" && "bg-emerald-500",
                          item.status === "upcoming" && "bg-blue-500",
                          item.status === "due_today" && "bg-orange-500",
                          item.status === "overdue" && "bg-red-500"
                        )}
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge
                            className={cn(
                              "rounded-0 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest border",
                              config.color
                            )}
                          >
                            <StatusIcon className="w-3 h-3 mr-1.5" />
                            {config.label}
                          </Badge>
                          {item.companyName && (
                            <span className="text-[11px] font-medium text-gray-500 truncate max-w-xs">
                              {item.companyName}
                            </span>
                          )}
                        </div>
                        <h4 className="text-base font-semibold text-gray-900 mb-1 truncate">
                          {item.title}
                        </h4>
                        {item.description && (
                          <p className="text-sm text-gray-500 line-clamp-2">{item.description}</p>
                        )}
                      </div>

                      <div className="flex flex-col items-start md:items-end gap-3 min-w-[180px]">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <CalendarDays className="w-4 h-4 text-gray-400" />
                          <span>
                            {new Date(item.dueDate).toLocaleDateString(undefined, {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-400 uppercase tracking-wide">
                          <span>{item.authority}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            <ComplianceMonthView
              items={allItems.map((i) => ({
                id: i.id,
                complianceId: i.complianceId,
                title: i.title,
                status: i.status,
                dueDate: i.dueDate,
                authority: i.authority,
              }))}
            />
          )}
        </div>
      </div>
    </div>
  );
}

