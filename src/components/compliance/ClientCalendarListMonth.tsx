"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  List as ListIcon,
  Calendar as CalendarIcon,
  CheckCircle2,
  AlertCircle,
  Clock,
  Eye,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import PillTabs from "@/components/shared/PillTabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import ComplianceMonthView from "@/components/engagement/ComplianceMonthView";
import { listComplianceCalendars, type ComplianceCalendarEntry } from "@/api/complianceCalendarService";
import { useActiveCompany } from "@/context/ActiveCompanyContext";
import { type ComplianceItem, type ComplianceStatus } from "@/components/engagement/types/compliance";

const SERVICE_NAME_MAPPING: Record<string, string> = {
  "ACCOUNTING": "Accounting",
  "AUDITING": "Audit",
  "VAT": "VAT",
  "TAX": "Tax",
  "PAYROLL": "Payroll",
  "CSP": "Corporate Services",
  "MBR": "MBR Filing",
  "CFO": "CFO Services",
  "LEGAL": "Legal",
  "TECHNOLOGY": "Technology",
  "INCORPORATION": "Incorporation",
  "PROJECTS_TRANSACTIONS": "Projects & Transactions",
  "GRANTS_AND_INCENTIVES": "Grants & Incentives"
};

const getFriendlyServiceName = (category: string) => {
  return SERVICE_NAME_MAPPING[category.toUpperCase()] || category;
};

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

  const authority = c.customServiceCycle?.title || getFriendlyServiceName(c.serviceCategory || '');

  return {
    id: c.id,
    complianceId: c.id,
    engagementId: "", // Compliance calendar entries don't have a specific engagementId in this context
    title: c.title,
    dueDate: c.dueDate,
    status,
    authority,
    description: c.description || "",
    type: getFriendlyServiceName(c.serviceCategory || ''),
    cta: "Mark as done",
    apiStatus: "", // Fixed: c.status does not exist on ComplianceCalendarEntry
    serviceCategory: c.serviceCategory || "",
    canMarkDone: false, // Calendar items usually aren't markable as done from here
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
  const [selectedItem, setSelectedItem] = useState<ComplianceItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

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
                    </div>
                    <h4 className="text-base font-semibold text-gray-900 mb-1 truncate">
                      {item.title}
                    </h4>
                    {item.description && (
                      <p className="text-sm text-gray-500 line-clamp-1">{item.description}</p>
                    )}
                  </div>

                  <div className="flex flex-col items-start md:items-end gap-3 min-w-[140px]">
                    <div className="flex items-center gap-2 text-sm text-gray-900 font-semibold">
                      <CalendarDays className="w-4 h-4 text-gray-400" />
                      <span>
                        {new Date(item.dueDate).toLocaleDateString(undefined, {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                      <span>{item.authority}</span>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center md:pl-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedItem(item);
                        setIsDetailModalOpen(true);
                      }}
                      className="bg-white hover:bg-gray-50 text-gray-700 border-gray-200 font-bold uppercase tracking-widest text-[10px]"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        <ComplianceMonthView
          items={allItems}
          onSelectEvent={(item) => {
            setSelectedItem(item);
            setIsDetailModalOpen(true);
          }}
        />
      )}

      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Compliance Details"
        size="wide"
      >
        {selectedItem && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <Badge className={cn("px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest border", statusConfig[selectedItem.status]?.color)}>
                    {statusConfig[selectedItem.status]?.label}
                  </Badge>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{selectedItem.type}</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mt-2">{selectedItem.title}</h3>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 py-6 border-y border-gray-100">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Due Date</p>
                <div className="flex items-center gap-2 text-gray-900 font-semibold">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  {new Date(selectedItem.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Authority</p>
                <div className="flex items-center gap-2 text-gray-900 font-semibold">
                  <Clock className="w-4 h-4 text-gray-400" />
                  {selectedItem.authority}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Description</p>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 min-h-[100px]">
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                  {selectedItem.description || "No description provided for this compliance requirement."}
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-4 gap-3">
              <Button variant="outline" onClick={() => setIsDetailModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

