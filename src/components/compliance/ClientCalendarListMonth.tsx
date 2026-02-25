"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  List as ListIcon,
  Calendar as CalendarIcon,
  CheckCircle2,
  AlertCircle,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import PillTabs from "@/components/shared/PillTabs";
import { Badge } from "@/components/ui/badge";
import ComplianceMonthView from "@/components/engagement/ComplianceMonthView";
import { listComplianceCalendars, type ComplianceCalendarEntry } from "@/api/complianceCalendarService";
import { useActiveCompany } from "@/context/ActiveCompanyContext";

type ComplianceStatus = "filed" | "upcoming" | "due_today" | "overdue";

interface ComplianceItem {
  id: string;
  complianceId: string;
  companyName?: string;
  title: string;
  dueDate: string;
  status: ComplianceStatus;
  authority: string;
  description: string;
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

  return {
    id: c.id,
    complianceId: c.id,
    companyName: c.company?.name,
    title: c.title,
    dueDate: c.dueDate,
    status,
    authority: c.customServiceCycle?.title || c.serviceCategory,
    description: c.description || "",
  };
}

const statusConfig: Record<
  ComplianceStatus,
  { label: string; color: string; icon: any }
> = {
  filed: {
    label: "Completed",
    color: "bg-emerald-50 text-emerald-600 border-emerald-100",
    icon: CheckCircle2,
  },
  upcoming: {
    label: "Upcoming",
    color: "bg-blue-50 text-blue-600 border-blue-100",
    icon: Clock,
  },
  due_today: {
    label: "Due Today",
    color: "bg-orange-50 text-orange-600 border-orange-100",
    icon: AlertCircle,
  },
  overdue: {
    label: "Overdue",
    color: "bg-red-50 text-red-600 border-red-100",
    icon: AlertCircle,
  },
};

export default function ClientCalendarListMonth() {
  const [viewMode, setViewMode] = useState<"list" | "month">("list");
  const [items, setItems] = useState<ComplianceItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { activeCompanyId } = useActiveCompany();

  useEffect(() => {
    const fetchEntries = async () => {
      setLoading(true);
      try {
        const params: { companyId?: string } = {};
        if (activeCompanyId) {
          params.companyId = activeCompanyId;
        }
        const data = await listComplianceCalendars(params);
        const mapped = Array.isArray(data) ? data.map(mapApiToComplianceItem) : [];
        setItems(mapped);
      } catch (error) {
        console.error("Failed to fetch compliance calendar entries for client view", error);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEntries();
  }, [activeCompanyId]);

  const allItems = useMemo(() => items, [items]);

  return (
    <div className="space-y-6">
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

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-8 w-64 rounded-0" />
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-0" />
          ))}
        </div>
      ) : viewMode === "list" ? (
        <div className="grid gap-4">
          {allItems.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-gray-200 bg-gray-50/30">
              <p className="text-sm text-gray-400 font-medium tracking-wide bg-white px-4 py-2 border border-gray-100 inline-block">
                No calendar deadlines found.
              </p>
            </div>
          ) : (
            allItems.map((item) => {
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
  );
}

