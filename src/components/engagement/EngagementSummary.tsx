"use client";

import React, { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Upload,
  CheckCircle2,
  Phone,
  Calendar,
  LayoutDashboard,
  Library,
  ClipboardList,
  Flag,
  History,
  FileText,
  Download,
  Eye,
  Clock,
  CheckCircle,
  Circle,
  TrendingUp,
  TrendingDown,
  Users,
  Building2,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Receipt,
  FileCheck,
  Info,
} from "lucide-react";
import {
  MBR_FILINGS_MOCK,
  getActiveMBRFiling,
  getMBRServiceStatusFromFilings,
  type MBRFiling,
} from "@/lib/mbrFilingsData";
import {
  VAT_PERIODS_MOCK,
  getActiveVATPeriod,
  type VATPeriod,
} from "@/lib/vatPeriodsData";
import { cn } from "@/lib/utils";
import DashboardCard from "../DashboardCard";
import PillTabs, { Tab } from "../shared/PillTabs";
import ServiceMessages from "./ServiceMessages";
import { LibraryExplorer } from "../library/LibraryExplorer";
import DocumentRequestsTab from "./DocumentRequestsTab";
import MilestonesTab from "./MilestonesTab";
import ComplianceCalendarTab from "./ComplianceCalendarTab";
import StatCard from "@/components/StatCard";
import CashFlowChart from "@/components/CashFlowChart";
import PLSummaryChart from "@/components/PLSummaryChart";
import {
  fetchDashboardSummary,
  ProcessedDashboardStat,
} from "@/api/financialReportsApi";
import { HugeiconsIcon } from "@hugeicons/react";
import { Alert02Icon, Message01Icon } from "@hugeicons/core-free-icons";
import { useSearchParams } from "next/navigation";
import { fetchDocuments } from "@/api/documentApi";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type EngagementStatus =
  | "on_track"
  | "due_soon"
  | "action_required"
  | "overdue";
export type WorkflowStatus =
  | "waiting"
  | "in_progress"
  | "submitted"
  | "completed";

export interface EngagementAction {
  type: "upload" | "confirm" | "schedule";
  label: string;
  onClick?: () => void;
}

interface EngagementSummaryProps {
  serviceName: string;
  description: string;
  status: EngagementStatus;
  cycle: string;
  workflowStatus: WorkflowStatus;
  neededFromUser?: string;
  actions?: EngagementAction[];
  messages?: any[];
  className?: string;
}

const statusConfig: Record<EngagementStatus, { label: string; color: string }> =
  {
    on_track: {
      label: "On track (handled by us)",
      color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    },
    due_soon: {
      label: "Due soon",
      color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    },
    action_required: {
      label: "Your input required",
      color: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    },
    overdue: {
      label: "Overdue",
      color: "bg-red-500/10 text-red-500 border-red-500/20",
    },
  };

const workflowStatusConfig: Record<
  WorkflowStatus,
  { label: string; color: string }
> = {
  waiting: {
    label: "Action needed from you",
    color: "text-orange-500 border-orange-500/20",
  },
  in_progress: {
    label: "We are working on this",
    color: "text-blue-500 border-blue-500/20",
  },
  submitted: {
    label: "Submitted",
    color: "text-purple-500 border-purple-500/20",
  },
  completed: {
    label: "Filed & completed",
    color: "text-green-500 border-green-500/20",
  },
};

export const EngagementSummary: React.FC<EngagementSummaryProps> = ({
  serviceName,
  description,
  status,
  cycle,
  workflowStatus,
  neededFromUser,
  actions = [],
  messages = [],
  className,
}) => {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = React.useState("dashboard");
  const [stats, setStats] = useState<ProcessedDashboardStat[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentDocuments, setRecentDocuments] = useState<any[]>([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [mbrCurrentFilingId, setMbrCurrentFilingId] = useState<string | null>(
    null,
  );
  const [mbrReferenceExpanded, setMbrReferenceExpanded] = useState(false);

  const [activeVatPeriodId, setActiveVatPeriodId] = useState<string | null>(
    null,
  );

  const isMBRFilings = serviceName === "MBR Filings" || serviceName === "Filings";
  const isVAT = serviceName === "VAT";
  const isTax = serviceName === "Tax";
  const mbrFilings = MBR_FILINGS_MOCK;
  const mbrActiveFiling = isMBRFilings
    ? getActiveMBRFiling(mbrFilings, mbrCurrentFilingId)
    : undefined;
  const mbrStatus = isMBRFilings
    ? getMBRServiceStatusFromFilings(mbrFilings)
    : status;
  const vatPeriods = VAT_PERIODS_MOCK;
  const vatActivePeriod = isVAT
    ? getActiveVATPeriod(vatPeriods, activeVatPeriodId)
    : undefined;

  const mbrStats = React.useMemo(() => {
    if (!isMBRFilings) return null;
    const now = new Date();
    const thirtyDaysFromNow = new Date(
      now.getTime() + 30 * 24 * 60 * 60 * 1000,
    );
    const thisYear = now.getFullYear().toString();

    return {
      overdue: mbrFilings.filter(
        (f) =>
          !f.submitted_at &&
          new Date(f.due_date) < now &&
          (f.filing_status === "waiting_on_you" ||
            f.filing_status === "in_progress"),
      ).length,
      dueSoon: mbrFilings.filter(
        (f) =>
          !f.submitted_at &&
          new Date(f.due_date) >= now &&
          new Date(f.due_date) <= thirtyDaysFromNow,
      ).length,
      inProgress: mbrFilings.filter((f) => f.filing_status === "in_progress")
        .length,
      completedThisYear: mbrFilings.filter(
        (f) =>
          f.filing_status === "completed" &&
          f.submitted_at?.startsWith(thisYear),
      ).length,
    };
  }, [isMBRFilings, mbrFilings]);

  const statusInfo =
    statusConfig[isMBRFilings ? mbrStatus : status] || statusConfig.on_track;
  const workflowInfo =
    workflowStatusConfig[workflowStatus] || workflowStatusConfig.in_progress;

  // Handle deep-linking from query params
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // MBR Filings: treat "dashboard" as "overview"
  useEffect(() => {
    if (isMBRFilings && activeTab === "dashboard") {
      setActiveTab("overview");
    }
  }, [isMBRFilings, activeTab]);

  useEffect(() => {
    const loadDashboardData = async () => {
      // Only fetch stats for Accounting & Bookkeeping
      if (serviceName !== "Accounting & Bookkeeping") return;

      setLoading(true);
      try {
        const fetchedStats = await fetchDashboardSummary();
        const filteredStats = fetchedStats.stats.filter(
          (stat: { title: string }) =>
            stat.title !== "Revenue YTD" && stat.title !== "Net income YTD",
        );
        setStats(filteredStats);
      } catch (error) {
        console.error("Failed to load dashboard summary:", error);
        setStats([]);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, [serviceName]);

  // Load recent documents for Quick Access Documents section
  useEffect(() => {
    const loadRecentDocuments = async () => {
      setDocumentsLoading(true);
      try {
        const serviceCategoryMap: Record<string, string> = {
          "Accounting & Bookkeeping": "accounting",
          VAT: "vat",
          Tax: "tax",
          Payroll: "payroll",
          "Statutory Audit": "audit",
          "Corporate Services": "corporate",
          "CFO Services": "cfo",
          "MBR Filing": "mbr-filing",
          "MBR Filings": "mbr-filing",
          Incorporation: "incorporation",
          "Business Plans": "business-plans",
          Liquidation: "liquidation",
        };

        const category = serviceCategoryMap[serviceName] || "";
        const res = await fetchDocuments({
          page: 1,
          limit: 4,
          category: category || undefined,
        });
        const docs = Array.isArray(res) ? res : res.data || [];
        setRecentDocuments(docs.slice(0, 4));
      } catch (error) {
        console.error("Failed to load recent documents:", error);
        setRecentDocuments([]);
      } finally {
        setDocumentsLoading(false);
      }
    };
    loadRecentDocuments();
  }, [serviceName]);

  const MessageIcon = React.useMemo(() => (props: any) => (
    <HugeiconsIcon icon={Message01Icon} {...props} />
  ), []);

  const tabs: Tab[] = isMBRFilings
    ? [
        { id: "overview", label: "Overview", icon: LayoutDashboard },
        { id: "filings", label: "Filings", icon: FileCheck },
      ]
    : isVAT
      ? [
          { id: "dashboard", label: "Overview", icon: LayoutDashboard },
          { id: "vat_periods", label: "VAT Periods", icon: FileCheck },
          {
            id: "document_requests",
            label: "Document Requests",
            icon: ClipboardList,
          },
          { id: "milestones", label: "Milestones", icon: Flag },
          { id: "library", label: "Library", icon: Library },
          {
            id: "compliance_calendar",
            label: "Compliance Calendar",
            icon: Calendar,
          },
          { id: "messages", label: "Message", icon: MessageIcon },
          { id: "mbr_filings", label: "Filings", icon: FileCheck },
        ]
      : [
          { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
          {
            id: "document_requests",
            label: "Document Requests",
            icon: ClipboardList,
          },
          { id: "milestones", label: "Milestones", icon: Flag },
          { id: "library", label: "Library", icon: Library },
          {
            id: "compliance_calendar",
            label: "Compliance Calendar",
            icon: Calendar,
          },
          { id: "messages", label: "Message", icon: MessageIcon },
          ...(serviceName === "Tax" ||
          serviceName === "Statutory Audit" ||
          serviceName === "Payroll" ||
          serviceName === "Accounting & Bookkeeping"
            ? [
                {
                  id: "mbr_filings",
                  label: "Filings",
                  icon: FileCheck as React.ElementType,
                },
              ]
            : []),
        ];

  return (
    <TooltipProvider>
      <div className={cn("space-y-6", className)}>
      {/* Service Header */}
      <DashboardCard className="p-8 bg-[#0f1729] border-white/10 overflow-hidden relative rounded-0">
        {/* Subtle Decorative Gradient */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-4">
              <h2 className="text-3xl font-medium text-white tracking-tight">
                {serviceName}
              </h2>
              <Badge
                className={cn(
                  "rounded-0 border px-3 py-1 text-xs font-bold uppercase tracking-widest bg-transparent",
                  statusInfo.color,
                )}
              >
                {statusInfo.label}
              </Badge>
            </div>
            <p className="text-white/60 text-sm max-w-2xl leading-relaxed">
              {description}
            </p>
            {isMBRFilings && (
              <p className="text-white/40 text-xs mt-2 italic">
                We prepare and submit all MBR filings for you. You’ll only be asked for input when required.
              </p>
            )}
          </div>
        </div>
      </DashboardCard>

      <PillTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      {/* MBR Filings: Overview tab */}
      {isMBRFilings && activeTab === "overview" && mbrActiveFiling && (
        <div className="space-y-8">
          {/* Compliance Status Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <DashboardCard className="p-4 border-l-4 border-red-500 rounded-0">
              <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest mb-1">
                Overdue items
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {mbrStats?.overdue}
              </p>
            </DashboardCard>
            <DashboardCard className="p-4 border-l-4 border-yellow-500 rounded-0">
              <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest mb-1">
                Due soon (30 days)
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {mbrStats?.dueSoon}
              </p>
            </DashboardCard>
            <DashboardCard className="p-4 border-l-4 border-blue-500 rounded-0">
              <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest mb-1">
                In progress
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {mbrStats?.inProgress}
              </p>
            </DashboardCard>
            <DashboardCard className="p-4 border-l-4 border-green-500 rounded-0">
              <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest mb-1">
                Completed this year
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {mbrStats?.completedThisYear}
              </p>
            </DashboardCard>
          </div>

          {/* Compliance & Actions */}
          <DashboardCard className="grid grid-cols-1 md:grid-cols-2 rounded-0 overflow-hidden p-0">
            <div className="p-8 border-r border-gray-100/50 flex flex-col justify-center space-y-6">
              <div className="space-y-2">
                <p className="text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">
                  Next Filing
                </p>
                <div className="flex items-center gap-3 text-gray-900">
                  <div className="w-10 h-10 rounded-0 bg-primary/5 flex items-center justify-center border border-primary/10">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-lg font-medium">
                    {mbrActiveFiling.filing_type}{" "}
                    {mbrActiveFiling.reference_period}
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">
                  Current Status
                </p>
                <Badge
                  className={cn(
                    "rounded-0 border px-3 py-1 text-xs font-semibold uppercase tracking-widest bg-transparent w-fit block",
                    mbrActiveFiling.filing_status === "waiting_on_you" &&
                      "text-orange-500 border-orange-500/20",
                    mbrActiveFiling.filing_status === "in_progress" &&
                      "text-blue-500 border-blue-500/20",
                    mbrActiveFiling.filing_status === "submitted" &&
                      "text-purple-500 border-purple-500/20",
                    mbrActiveFiling.filing_status === "completed" &&
                      "text-green-500 border-green-500/20",
                  )}
                >
                  {mbrActiveFiling.filing_status === "waiting_on_you" &&
                    "Action needed from you"}
                  {mbrActiveFiling.filing_status === "in_progress" &&
                    "We are working on this"}
                  {mbrActiveFiling.filing_status === "submitted" &&
                    "Submitted to MBR"}
                  {mbrActiveFiling.filing_status === "completed" &&
                    "Filed & completed"}
                </Badge>
              </div>
            </div>
            <div className="p-8 bg-gray-50/30 flex flex-col justify-between">
              {mbrActiveFiling.filing_status === "waiting_on_you" && (
                <>
                  <div className="space-y-3">
                    <p className="text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">
                      What we need from you
                    </p>
                    <ul className="space-y-2 text-sm text-gray-900">
                      <li className="flex items-center gap-2">
                        <Circle className="w-4 h-4 text-primary shrink-0" />
                        Confirm company details
                      </li>
                      <li className="flex items-center gap-2">
                        <Circle className="w-4 h-4 text-primary shrink-0" />
                        Approve directors/shareholders list
                      </li>
                      <li className="flex items-center gap-2">
                        <Circle className="w-4 h-4 text-primary shrink-0" />
                        Upload signed documents (if required)
                      </li>
                    </ul>
                  </div>
                  <div className="flex flex-wrap gap-3 mt-6">
                    <Button className="h-12 px-6 rounded-0 font-medium uppercase tracking-widest text-xs gap-3">
                      <CheckCircle2 className="w-4 h-4" />
                      Confirm details
                    </Button>
                    <Button
                      variant="outline"
                      className="h-12 px-6 rounded-0 font-medium uppercase tracking-widest text-xs gap-3"
                    >
                      <Upload className="w-4 h-4" />
                      Upload documents
                    </Button>
                    <Button
                      variant="outline"
                      className="h-12 px-6 rounded-0 font-medium uppercase tracking-widest text-xs gap-3"
                    >
                      <Phone className="w-4 h-4" />
                      Schedule call
                    </Button>
                  </div>
                </>
              )}
              {mbrActiveFiling.filing_status === "in_progress" && (
                <p className="text-gray-700 font-medium">
                  We&apos;re preparing your filing.
                </p>
              )}
              {(mbrActiveFiling.filing_status === "submitted" ||
                mbrActiveFiling.filing_status === "completed") && (
                <>
                  <p className="text-gray-700 font-medium">
                    Filing submitted on{" "}
                    {mbrActiveFiling.submitted_at
                      ? new Date(
                          mbrActiveFiling.submitted_at,
                        ).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "—"}
                  </p>
                  {mbrActiveFiling.documents?.length > 0 && (
                    <Button variant="outline" className="mt-4 gap-2">
                      <Receipt className="w-4 h-4" />
                      View receipt
                    </Button>
                  )}
                </>
              )}
            </div>
          </DashboardCard>

          {/* Current Filing section */}
          <DashboardCard className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-1 h-6 bg-gray-900 rounded-full" />
                <h3 className="text-lg font-medium tracking-tight">
                  Current Filing
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">
                    Filing Name
                  </p>
                  <p className="text-sm font-semibold text-gray-900 mt-1">
                    {mbrActiveFiling.filing_type}{" "}
                    {mbrActiveFiling.reference_period}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">
                    Due Date
                  </p>
                  <p className="text-sm font-semibold text-gray-900 mt-1">
                    {new Date(mbrActiveFiling.due_date).toLocaleDateString(
                      "en-GB",
                      { day: "numeric", month: "short", year: "numeric" },
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">
                    Status
                  </p>
                  <p className="text-sm font-semibold text-gray-900 mt-1">
                    {mbrActiveFiling.filing_status === "waiting_on_you" &&
                      "Action needed from you"}
                    {mbrActiveFiling.filing_status === "in_progress" &&
                      "We are working on this"}
                    {mbrActiveFiling.filing_status === "submitted" &&
                      "Submitted to MBR"}
                    {mbrActiveFiling.filing_status === "completed" &&
                      "Filed & completed"}
                  </p>
                </div>
              </div>
              {(mbrActiveFiling.filing_status === "waiting_on_you" ||
                mbrActiveFiling.filing_status === "in_progress") && (
                <div className="flex flex-wrap gap-3">
                  <Button size="sm" className="gap-2">
                    <Upload className="w-3 h-3" />
                    Upload
                  </Button>
                  <Button size="sm" variant="outline" className="gap-2">
                    <CheckCircle2 className="w-3 h-3" />
                    Confirm details
                  </Button>
                </div>
              )}
              <p className="text-xs text-gray-500 pt-2">
                We prepare and submit statutory filings on your behalf.
              </p>
            </div>
          </DashboardCard>

          {/* Reference list (collapsed by default) */}
          <DashboardCard className="p-6">
            <button
              type="button"
              onClick={() => setMbrReferenceExpanded(!mbrReferenceExpanded)}
              className="flex items-center justify-between w-full text-left"
            >
              <h3 className="text-lg font-medium tracking-tight">
                Filing Details — {mbrActiveFiling.filing_type}{" "}
                {mbrActiveFiling.reference_period}
              </h3>
              {mbrReferenceExpanded ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </button>
            {mbrReferenceExpanded && (
              <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">
                    Filing type
                  </p>
                  <p className="font-medium text-gray-900">
                    {mbrActiveFiling.filing_type}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">
                    Reference year / period
                  </p>
                  <p className="font-medium text-gray-900">
                    {mbrActiveFiling.reference_period}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">
                    Submitted date
                  </p>
                  <p className="font-medium text-gray-900">
                    {mbrActiveFiling.submitted_at
                      ? new Date(
                          mbrActiveFiling.submitted_at,
                        ).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">
                    Receipt / acknowledgement
                  </p>
                  <p className="font-medium text-gray-900">
                    {mbrActiveFiling.documents?.length ? "Available" : "—"}
                  </p>
                </div>
              </div>
            )}
          </DashboardCard>

          {/* Service Library */}
          <DashboardCard className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1 h-6 bg-gray-900 rounded-full" />
              <h3 className="text-lg font-medium tracking-tight">
                Service Library
              </h3>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Filed returns, receipts, resolutions, and supporting docs for MBR
              Filings.
            </p>
            <LibraryExplorer />
          </DashboardCard>

          {/* Service Messages */}
          <DashboardCard className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <HugeiconsIcon icon={Message01Icon} className="w-5 h-5 text-gray-500" />
              <h3 className="text-lg font-medium tracking-tight">Messages</h3>
            </div>
            <ServiceMessages serviceName={serviceName} messages={messages} />
          </DashboardCard>
        </div>
      )}

      {/* MBR Filings: Filings tab (table) */}
      {((isMBRFilings && activeTab === "filings") ||
        activeTab === "mbr_filings") && (
        <DashboardCard className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 bg-gray-900 rounded-full" />
              <h3 className="text-lg font-medium tracking-tight">Filings</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">
                      Filing Type
                    </th>
                    <th className="text-left py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">
                      Reference / Period
                    </th>
                    <th className="text-left py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">
                      Due Date
                    </th>
                    <th className="text-left py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">
                      Filing Status
                    </th>
                    <th className="text-left py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">
                      <div className="flex items-center gap-1">
                        Service Status
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="w-3 h-3 cursor-help text-gray-400" />
                          </TooltipTrigger>
                          <TooltipContent className="bg-gray-900 text-white border-gray-800 text-[10px] py-1 px-2 rounded-0">
                            Shows whether we are on track or if your input is required.
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </th>
                    <th className="text-left py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">
                      Submitted On
                    </th>
                    <th className="text-left py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">
                      Documents
                    </th>
                    <th className="text-right py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">
                      Open
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {mbrFilings.map((f) => (
                    <tr
                      key={f.id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-3 px-4 font-medium text-gray-900">
                        {f.filing_type}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {f.reference_period}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {new Date(f.due_date).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          className={cn(
                            "rounded-0 border px-2 py-0.5 text-xs font-semibold uppercase tracking-widest bg-transparent",
                            f.filing_status === "waiting_on_you" &&
                              "text-orange-500 border-orange-500/20",
                            f.filing_status === "in_progress" &&
                              "text-blue-500 border-blue-500/20",
                            f.filing_status === "submitted" &&
                              "text-purple-500 border-purple-500/20",
                            f.filing_status === "completed" &&
                              "text-green-500 border-green-500/20",
                          )}
                        >
                          {f.filing_status === "waiting_on_you" &&
                            "Action needed from you"}
                          {f.filing_status === "in_progress" &&
                            "We are working on this"}
                          {f.filing_status === "submitted" &&
                            "Submitted to MBR"}
                          {f.filing_status === "completed" &&
                            "Filed & completed"}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant="outline"
                          className="text-xs font-medium"
                        >
                          {f.service_status === "on_track" &&
                            "On track (handled by us)"}
                          {f.service_status === "due_soon" && "Due soon"}
                          {f.service_status === "action_required" &&
                            "Your input required"}
                          {f.service_status === "overdue" && "Overdue"}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {f.submitted_at
                          ? new Date(f.submitted_at).toLocaleDateString(
                              "en-GB",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              },
                            )
                          : "—"}
                      </td>
                      <td className="py-3 px-4">
                        {(f.filing_status === "submitted" ||
                          f.filing_status === "completed") &&
                        f.documents?.length > 0 ? (
                          <span className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs p-0"
                            >
                              View
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs p-0"
                            >
                              Download
                            </Button>
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs italic">
                            Available after submission
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {f.filing_status === "waiting_on_you" ? (
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="default"
                              size="sm"
                              className="text-xs h-8 px-4"
                              onClick={() => {
                                setMbrCurrentFilingId(f.id);
                                setActiveTab("overview");
                              }}
                            >
                              Upload / Respond
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs h-8 px-4"
                              onClick={() => {
                                setMbrCurrentFilingId(f.id);
                                setActiveTab("overview");
                              }}
                            >
                              View details
                            </Button>
                          </div>
                        ) : f.filing_status === "completed" ||
                          f.filing_status === "submitted" ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs h-8 px-4"
                            onClick={() => {
                              setMbrCurrentFilingId(f.id);
                              setActiveTab("overview");
                            }}
                          >
                            View filing
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs h-8 px-4"
                            onClick={() => {
                              setMbrCurrentFilingId(f.id);
                              setActiveTab("overview");
                            }}
                          >
                            Open
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </DashboardCard>
      )}

      {/* VAT: VAT Periods tab (table of all periods; Open loads period into Overview) */}
      {isVAT && activeTab === "vat_periods" && (
        <DashboardCard className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 bg-gray-900 rounded-full" />
              <h3 className="text-lg font-medium tracking-tight">
                VAT Periods
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">
                      Period
                    </th>
                    <th className="text-left py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">
                      Due Date
                    </th>
                    <th className="text-left py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">
                      Filing Status
                    </th>
                    <th className="text-left py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">
                      <div className="flex items-center gap-1">
                        Service Status
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="w-3 h-3 cursor-help text-gray-400" />
                          </TooltipTrigger>
                          <TooltipContent className="bg-gray-900 text-white border-gray-800 text-[10px] py-1 px-2 rounded-0">
                            Shows whether we are on track or if your input is required.
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </th>
                    <th className="text-left py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">
                      Submitted On
                    </th>
                    <th className="text-left py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">
                      Documents
                    </th>
                    <th className="text-right py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">
                      Open
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {vatPeriods.map((p) => (
                    <tr
                      key={p.id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-3 px-4 font-medium text-gray-900">
                        {p.period}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {new Date(p.due_date).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          className={cn(
                            "rounded-0 border px-2 py-0.5 text-xs font-semibold uppercase tracking-widest bg-transparent",
                            p.filing_status === "waiting_on_you" &&
                              "text-orange-500 border-orange-500/20",
                            p.filing_status === "in_progress" &&
                              "text-blue-500 border-blue-500/20",
                            p.filing_status === "submitted" &&
                              "text-purple-500 border-purple-500/20",
                            p.filing_status === "completed" &&
                              "text-green-500 border-green-500/20",
                          )}
                        >
                          {p.filing_status === "waiting_on_you" &&
                            "Action needed from you"}
                          {p.filing_status === "in_progress" && "We are working on this"}
                          {p.filing_status === "submitted" && "Submitted"}
                          {p.filing_status === "completed" && "Filed & completed"}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant="outline"
                          className="text-xs font-medium"
                        >
                          {p.service_status === "on_track" && "On track (handled by us)"}
                          {p.service_status === "due_soon" && "Due soon"}
                          {p.service_status === "action_required" &&
                            "Your input required"}
                          {p.service_status === "overdue" && "Overdue"}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {p.submitted_at
                          ? new Date(p.submitted_at).toLocaleDateString(
                              "en-GB",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              },
                            )
                          : "—"}
                      </td>
                      <td className="py-3 px-4">
                        {(p.filing_status === "submitted" ||
                          p.filing_status === "completed") &&
                        p.documents?.length > 0 ? (
                          <span className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs p-0"
                            >
                              View
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs p-0"
                            >
                              Download
                            </Button>
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs"
                          onClick={() => {
                            setActiveVatPeriodId(p.id);
                            setActiveTab("dashboard");
                          }}
                        >
                          Open
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </DashboardCard>
      )}

      {activeTab === "dashboard" && (
        <div className="space-y-8">
          {/* Compliance & Action Box */}
          <DashboardCard className="grid grid-cols-1 md:grid-cols-2 rounded-0 overflow-hidden p-0">
            {/* Left Side: Status Info */}
            <div className="p-8 border-r border-gray-100/50 flex flex-col justify-center space-y-6">
              <div className="space-y-2">
                <p className="text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">
                  Current cycle/period
                </p>
                <div className="flex items-center gap-3 text-gray-900">
                  <div className="w-10 h-10 rounded-0 bg-primary/5 flex items-center justify-center border border-primary/10">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-lg font-medium">{cycle}</span>
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">
                  Current status
                </p>
                <Badge
                  className={cn(
                    "rounded-0 border px-3 py-1 text-xs font-semibold uppercase tracking-widest bg-transparent w-fit block",
                    workflowInfo.color,
                  )}
                >
                  {workflowInfo.label}
                </Badge>
              </div>
            </div>

            {/* Right Side: Action Info */}
            <div className="p-8 bg-gray-50/30 flex flex-col justify-between">
              <div className="space-y-3">
                <p className="text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">
                  What we need from you
                </p>
                {neededFromUser ? (
                  <div className="flex gap-3">
                    <div className="w-1.5 h-auto bg-primary/20 rounded-full" />
                    <p className="text-gray-900 font-medium leading-tight text-lg">
                      {neededFromUser}
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 text-emerald-600 bg-emerald-50 p-4 border border-emerald-100/50">
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                    <p className="font-medium">
                      Nothing required from you right now.
                    </p>
                  </div>
                )}
              </div>

              {actions.length > 0 && (
                <div className="flex flex-wrap gap-3 mt-8">
                  {actions.map((action, index) => (
                    <Button
                      key={index}
                      variant={action.type === "upload" ? "default" : "outline"}
                      className={cn(
                        "h-12 px-6 rounded-0 font-medium uppercase tracking-widest text-xs gap-3 transition-all",
                        action.type === "upload"
                          ? "bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20"
                          : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50",
                      )}
                      onClick={action.onClick}
                    >
                      {action.type === "upload" && (
                        <Upload className="w-4 h-4" />
                      )}
                      {action.type === "confirm" && (
                        <CheckCircle2 className="w-4 h-4" />
                      )}
                      {action.type === "schedule" && (
                        <Phone className="w-4 h-4" />
                      )}
                      {action.label}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </DashboardCard>

          {/* GLOBAL DASHBOARD SECTIONS - ALL SERVICES */}

          {/* SECTION 1: Service Overview Summary */}
          <DashboardCard className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <p className="text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">
                  Current Period
                </p>
                <p className="text-sm font-semibold text-gray-900">{cycle}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">
                  Overall Status
                </p>
                <Badge
                  className={cn(
                    "rounded-0 border px-2 py-0.5 text-xs font-semibold uppercase tracking-widest bg-transparent w-fit",
                    statusInfo.color,
                  )}
                >
                  {statusInfo.label}
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">
                  Last Update
                </p>
                <p className="text-sm font-semibold text-gray-900">
                  {new Date().toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">
                  Next Step
                </p>
                <p className="text-sm font-semibold text-gray-900">
                  {workflowStatus === "waiting"
                    ? "Action needed from you"
                    : workflowStatus === "in_progress"
                      ? `Processing ${cycle} records`
                      : workflowStatus === "submitted"
                        ? "Submitted to authority"
                        : "Completed"}
                </p>
              </div>
            </div>
          </DashboardCard>

          {/* SECTION 2: Recent Activity Feed */}
          <DashboardCard className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-1 h-6 bg-gray-900 rounded-full" />
                <h3 className="text-lg font-medium tracking-tight">
                  Recent Activity
                </h3>
              </div>
              <div className="space-y-3">
                {[
                  { action: "Bank statements uploaded", date: "Jan 10" },
                  { action: "VAT return submitted", date: "Jan 20" },
                  { action: "Payroll processed", date: "Jan 25" },
                ]
                  .slice(0, serviceName === "Payroll" ? 5 : 3)
                  .map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <span className="text-sm text-gray-900">
                          {item.action}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">{item.date}</span>
                    </div>
                  ))}
              </div>
            </div>
          </DashboardCard>

          {/* SECTION 3: Quick Access Documents */}
          <DashboardCard className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-6 bg-gray-900 rounded-full" />
                  <h3 className="text-lg font-medium tracking-tight">
                    Quick Access Documents
                  </h3>
                </div>
              </div>
              {documentsLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-12 bg-gray-50 rounded animate-pulse"
                    />
                  ))}
                </div>
              ) : recentDocuments.length > 0 ? (
                <div className="space-y-2">
                  {recentDocuments.map((doc, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <FileText className="w-4 h-4 text-gray-400" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {doc.name || doc.title || "Document"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {doc.createdAt
                              ? new Date(doc.createdAt).toLocaleDateString(
                                  "en-US",
                                  {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  },
                                )
                              : doc.date || "Recent"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-3 text-xs"
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          View
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-3 text-xs"
                        >
                          <Download className="w-3 h-3 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-sm text-gray-500">
                  No documents available yet
                </div>
              )}
            </div>
          </DashboardCard>

          {/* SERVICE-SPECIFIC SECTIONS */}

          {/* Accounting & Bookkeeping: Financial Snapshot */}
          {serviceName === "Accounting & Bookkeeping" && (
            <DashboardCard className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-6 bg-gray-900 rounded-full" />
                  <h3 className="text-lg font-medium tracking-tight">
                    Financial Snapshot
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg border border-gray-100 bg-white">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">
                        Revenue
                      </p>
                      <TrendingUp className="w-4 h-4 text-emerald-500" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      €
                      {stats.find((s) => s.title?.includes("Revenue"))
                        ?.amount || "—"}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Current period</p>
                  </div>
                  <div className="p-4 rounded-lg border border-gray-100 bg-white">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">
                        Expenses
                      </p>
                      <TrendingDown className="w-4 h-4 text-red-500" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      €
                      {stats.find((s) => s.title?.includes("Expense"))
                        ?.amount || "—"}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Current period</p>
                  </div>
                  <div className="p-4 rounded-lg border border-gray-100 bg-white">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">
                        Net Position
                      </p>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      €
                      {stats.find((s) => s.title?.includes("Net"))?.amount ||
                        "—"}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Current period</p>
                  </div>
                </div>
              </div>
            </DashboardCard>
          )}

          {/* Audit: Audit Progress Steps */}
          {serviceName === "Statutory Audit" && (
            <DashboardCard className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-6 bg-gray-900 rounded-full" />
                  <h3 className="text-lg font-medium tracking-tight">
                    Audit Progress
                  </h3>
                </div>
                <div className="space-y-4">
                  {[
                    { step: "Planning", status: "completed" },
                    { step: "Fieldwork", status: "in_progress" },
                    { step: "Review", status: "pending" },
                    { step: "Final Report", status: "pending" },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4">
                      <div className="shrink-0">
                        {item.status === "completed" ? (
                          <CheckCircle className="w-5 h-5 text-emerald-500" />
                        ) : item.status === "in_progress" ? (
                          <Clock className="w-5 h-5 text-blue-500" />
                        ) : (
                          <Circle className="w-5 h-5 text-gray-300" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {item.step}
                        </p>
                        <p className="text-xs text-gray-500">
                          {item.status === "completed"
                            ? "Completed"
                            : item.status === "in_progress"
                              ? "In progress"
                              : "Pending"}
                        </p>
                      </div>
                      <Badge
                        className={cn(
                          "rounded-0 border px-2 py-0.5 text-xs font-semibold uppercase tracking-widest bg-transparent",
                          item.status === "completed"
                            ? "text-emerald-500 border-emerald-500/20"
                            : item.status === "in_progress"
                              ? "text-blue-500 border-blue-500/20"
                              : "text-gray-400 border-gray-200",
                        )}
                      >
                        {item.status === "completed"
                          ? "✓"
                          : item.status === "in_progress"
                            ? "⏳"
                            : "○"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </DashboardCard>
          )}

          {/* VAT: Current Cycle (period name, status, Upload/Confirm) */}
          {isVAT && vatActivePeriod && (
            <DashboardCard className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-6 bg-gray-900 rounded-full" />
                  <h3 className="text-lg font-medium tracking-tight">
                    Current Cycle
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">
                      VAT Period
                    </p>
                    <p className="text-sm font-semibold text-gray-900 mt-1">
                      {vatActivePeriod.period}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">
                      Status
                    </p>
                    <Badge className="mt-1 rounded-0 border px-2 py-0.5 text-xs font-semibold uppercase tracking-widest bg-transparent text-gray-700 border-gray-200">
                      {vatActivePeriod.filing_status === "waiting_on_you" &&
                        "Waiting on you"}
                      {vatActivePeriod.filing_status === "in_progress" &&
                        "In progress"}
                      {vatActivePeriod.filing_status === "submitted" &&
                        "Submitted"}
                      {vatActivePeriod.filing_status === "completed" &&
                        "Completed"}
                    </Badge>
                  </div>
                </div>
                {(vatActivePeriod.filing_status === "waiting_on_you" ||
                  vatActivePeriod.filing_status === "in_progress") && (
                  <div className="flex flex-wrap gap-3">
                    <Button size="sm" className="gap-2">
                      <Upload className="w-3 h-3" />
                      Upload
                    </Button>
                    <Button size="sm" variant="outline" className="gap-2">
                      <CheckCircle2 className="w-3 h-3" />
                      Confirm no changes
                    </Button>
                  </div>
                )}
                <p className="text-xs text-gray-500">
                  View all periods in the VAT Periods tab.
                </p>
              </div>
            </DashboardCard>
          )}

          {/* Tax: Current Cycle (tax period) */}
          {isTax && (
            <DashboardCard className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-6 bg-gray-900 rounded-full" />
                  <h3 className="text-lg font-medium tracking-tight">
                    Current Cycle
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">
                      Tax Period
                    </p>
                    <p className="text-sm font-semibold text-gray-900 mt-1">
                      {cycle}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">
                      Status
                    </p>
                    <Badge
                      className={cn(
                        "mt-1 rounded-0 border px-2 py-0.5 text-xs font-semibold uppercase tracking-widest bg-transparent w-fit",
                        workflowInfo.color,
                      )}
                    >
                      {workflowInfo.label}
                    </Badge>
                  </div>
                </div>
              </div>
            </DashboardCard>
          )}

          {/* Corporate Services: Active Corporate Services */}
          {serviceName === "Corporate Services" && (
            <DashboardCard className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-6 bg-gray-900 rounded-full" />
                  <h3 className="text-lg font-medium tracking-tight">
                    Active Corporate Services
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">
                          Service Type
                        </th>
                        <th className="text-left py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">
                          Holder/Provider
                        </th>
                        <th className="text-left py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">
                          Status
                        </th>
                        <th className="text-left py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">
                          Renewal/Expiry
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        {
                          type: "Director",
                          holder: "John Smith",
                          status: "Active",
                          expiry: "N/A",
                        },
                        {
                          type: "Secretary",
                          holder: "Jane Doe",
                          status: "Active",
                          expiry: "Dec 31, 2026",
                        },
                        {
                          type: "Registered Office",
                          holder: "VACEI Ltd",
                          status: "Active",
                          expiry: "Annual",
                        },
                      ].map((row, idx) => (
                        <tr
                          key={idx}
                          className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                        >
                          <td className="py-3 px-4 font-medium text-gray-900">
                            {row.type}
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            {row.holder}
                          </td>
                          <td className="py-3 px-4">
                            <Badge className="rounded-0 border px-2 py-0.5 text-xs font-semibold uppercase tracking-widest bg-transparent text-emerald-500 border-emerald-500/20">
                              {row.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            {row.expiry}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </DashboardCard>
          )}

          {/* Payroll: Employees Overview */}
          {serviceName === "Payroll" && (
            <DashboardCard className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-6 bg-gray-900 rounded-full" />
                    <h3 className="text-lg font-medium tracking-tight">
                      Employees Overview
                    </h3>
                  </div>
                  <Button variant="outline" size="sm" className="text-xs">
                    View All Employees
                    <ArrowRight className="w-3 h-3 ml-2" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="p-4 rounded-lg border border-gray-100 bg-white">
                    <div className="flex items-center gap-3 mb-2">
                      <Users className="w-5 h-5 text-gray-400" />
                      <p className="text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">
                        Total Employees
                      </p>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">12</p>
                  </div>
                  <div className="p-4 rounded-lg border border-gray-100 bg-white">
                    <div className="flex items-center gap-3 mb-2">
                      <CheckCircle className="w-5 h-5 text-emerald-500" />
                      <p className="text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">
                        Active This Period
                      </p>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">12</p>
                  </div>
                  <div className="p-4 rounded-lg border border-gray-100 bg-white">
                    <div className="flex items-center gap-3 mb-2">
                      <Clock className="w-5 h-5 text-orange-500" />
                      <p className="text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">
                        Pending Changes
                      </p>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">0</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-[0.2em] mb-2">
                    Recent Employees
                  </p>
                  {[
                    { name: "John Smith", role: "Manager", status: "Active" },
                    { name: "Jane Doe", role: "Developer", status: "Active" },
                    {
                      name: "Mike Johnson",
                      role: "Designer",
                      status: "Active",
                    },
                  ].map((emp, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-gray-50/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Users className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {emp.name}
                          </p>
                          <p className="text-xs text-gray-500">{emp.role}</p>
                        </div>
                      </div>
                      <Badge className="rounded-0 border px-2 py-0.5 text-xs font-semibold uppercase tracking-widest bg-transparent text-emerald-500 border-emerald-500/20">
                        {emp.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </DashboardCard>
          )}

          {/* CFO: Overview, Engagements, Activity */}
          {serviceName === "CFO Services" && (
            <>
              <DashboardCard className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-6 bg-gray-900 rounded-full" />
                    <h3 className="text-lg font-medium tracking-tight">
                      Service Overview Summary
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    Strategic finance support, reporting insights, and
                    leadership guidance — tailored to your current priorities.
                  </p>
                </div>
              </DashboardCard>

              <DashboardCard className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-6 bg-gray-900 rounded-full" />
                    <h3 className="text-lg font-medium tracking-tight">
                      Active CFO Engagements
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">
                            Engagement
                          </th>
                          <th className="text-left py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">
                            Start date
                          </th>
                          <th className="text-left py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">
                            Status
                          </th>
                          <th className="text-left py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">
                            End / renewal
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          {
                            name: "Monthly performance & KPI pack",
                            start: "Jan 05, 2026",
                            status: "In progress",
                            end: "Monthly",
                          },
                          {
                            name: "Budgeting & forecasting",
                            start: "Jan 12, 2026",
                            status: "Waiting on you",
                            end: "Feb 2026",
                          },
                        ].map((row, idx) => (
                          <tr
                            key={idx}
                            className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                          >
                            <td className="py-3 px-4 font-medium text-gray-900">
                              {row.name}
                            </td>
                            <td className="py-3 px-4 text-gray-600">
                              {row.start}
                            </td>
                            <td className="py-3 px-4">
                              <Badge className="rounded-0 border px-2 py-0.5 text-xs font-semibold uppercase tracking-widest bg-transparent text-gray-700 border-gray-200">
                                {row.status}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 text-gray-600">
                              {row.end}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </DashboardCard>

              <DashboardCard className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-6 bg-gray-900 rounded-full" />
                    <h3 className="text-lg font-medium tracking-tight">
                      Recent Activity Feed
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {[
                      {
                        action: "Draft forecast shared for review",
                        date: "Jan 23",
                      },
                      {
                        action: "KPI pack prepared",
                        date: "Jan 18",
                      },
                      {
                        action: "Strategy call scheduled",
                        date: "Jan 10",
                      },
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-primary" />
                          <span className="text-sm text-gray-900">
                            {item.action}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {item.date}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </DashboardCard>
            </>
          )}

          {/* MBR Filing: period, status, requirements, filings table */}
          {serviceName === "MBR Filing" && (
            <>
              <DashboardCard className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-6 bg-gray-900 rounded-full" />
                    <h3 className="text-lg font-medium tracking-tight">
                      Current Filing Period
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-lg border border-gray-100 bg-white">
                      <p className="text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">
                        Period
                      </p>
                      <p className="text-sm font-semibold text-gray-900 mt-2">
                        {cycle}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg border border-gray-100 bg-white">
                      <p className="text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">
                        Filing Status
                      </p>
                      <Badge className="mt-2 rounded-0 border px-2 py-0.5 text-xs font-semibold uppercase tracking-widest bg-transparent text-blue-600 border-blue-200">
                        In progress
                      </Badge>
                    </div>
                    <div className="p-4 rounded-lg border border-gray-100 bg-white">
                      <p className="text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">
                        What is required
                      </p>
                      <p className="text-sm text-gray-600 mt-2">
                        Upload or confirm required documents.
                      </p>
                    </div>
                  </div>
                </div>
              </DashboardCard>

              <DashboardCard className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-6 bg-gray-900 rounded-full" />
                    <h3 className="text-lg font-medium tracking-tight">
                      Filings Summary
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">
                            Year
                          </th>
                          <th className="text-left py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">
                            Filing type
                          </th>
                          <th className="text-left py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">
                            Status
                          </th>
                          <th className="text-left py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">
                            Submission date
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          {
                            year: "2026",
                            type: "Annual Return",
                            status: "In progress",
                            date: "—",
                          },
                          {
                            year: "2025",
                            type: "Annual Return",
                            status: "Submitted",
                            date: "Dec 20, 2025",
                          },
                        ].map((row, idx) => (
                          <tr
                            key={idx}
                            className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                          >
                            <td className="py-3 px-4 font-medium text-gray-900">
                              {row.year}
                            </td>
                            <td className="py-3 px-4 text-gray-600">
                              {row.type}
                            </td>
                            <td className="py-3 px-4">
                              <Badge className="rounded-0 border px-2 py-0.5 text-xs font-semibold uppercase tracking-widest bg-transparent text-gray-700 border-gray-200">
                                {row.status}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 text-gray-600">
                              {row.date}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </DashboardCard>
            </>
          )}

          {/* Incorporation: progress, uploaded docs, company details */}
          {serviceName === "Incorporation" && (
            <>
              <DashboardCard className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-6 bg-gray-900 rounded-full" />
                    <h3 className="text-lg font-medium tracking-tight">
                      Incorporation Progress
                    </h3>
                  </div>
                  <div className="space-y-4">
                    {[
                      { step: "Name approval", status: "completed" as const },
                      { step: "Documentation", status: "in_progress" as const },
                      { step: "Registration", status: "pending" as const },
                      { step: "Completion", status: "pending" as const },
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center gap-4">
                        <div className="shrink-0">
                          {item.status === "completed" ? (
                            <CheckCircle className="w-5 h-5 text-emerald-500" />
                          ) : item.status === "in_progress" ? (
                            <Clock className="w-5 h-5 text-blue-500" />
                          ) : (
                            <Circle className="w-5 h-5 text-gray-300" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {item.step}
                          </p>
                          <p className="text-xs text-gray-500">
                            {item.status === "completed"
                              ? "Completed"
                              : item.status === "in_progress"
                                ? "In progress"
                                : "Pending"}
                          </p>
                        </div>
                        <Badge
                          className={cn(
                            "rounded-0 border px-2 py-0.5 text-xs font-semibold uppercase tracking-widest bg-transparent",
                            item.status === "completed"
                              ? "text-emerald-500 border-emerald-500/20"
                              : item.status === "in_progress"
                                ? "text-blue-500 border-blue-500/20"
                                : "text-gray-400 border-gray-200",
                          )}
                        >
                          {item.status === "completed"
                            ? "✓"
                            : item.status === "in_progress"
                              ? "⏳"
                              : "○"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </DashboardCard>

              <DashboardCard className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-6 bg-gray-900 rounded-full" />
                    <h3 className="text-lg font-medium tracking-tight">
                      Uploaded Documents
                    </h3>
                  </div>
                  <div className="space-y-2">
                    {[
                      { name: "ID document(s)", status: "Received" },
                      { name: "Proof of address", status: "Pending" },
                      {
                        name: "Draft memorandum & articles",
                        status: "Pending",
                      },
                    ].map((doc, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-gray-50/50"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="w-4 h-4 text-gray-400" />
                          <p className="text-sm font-medium text-gray-900">
                            {doc.name}
                          </p>
                        </div>
                        <Badge className="rounded-0 border px-2 py-0.5 text-xs font-semibold uppercase tracking-widest bg-transparent text-gray-700 border-gray-200">
                          {doc.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </DashboardCard>

              <DashboardCard className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-6 bg-gray-900 rounded-full" />
                    <h3 className="text-lg font-medium tracking-tight">
                      Company Details (Read only)
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { label: "Company name", value: "—" },
                      { label: "Registration number", value: "—" },
                      { label: "Incorporation date", value: "—" },
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-lg border border-gray-100 bg-white"
                      >
                        <p className="text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">
                          {item.label}
                        </p>
                        <p className="text-sm font-semibold text-gray-900 mt-2">
                          {item.value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </DashboardCard>
            </>
          )}

          {/* Business Plans: status, milestones, latest docs */}
          {serviceName === "Business Plans" && (
            <>
              <DashboardCard className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-6 bg-gray-900 rounded-full" />
                    <h3 className="text-lg font-medium tracking-tight">
                      Project Status
                    </h3>
                  </div>
                  <Badge className="rounded-0 border px-2 py-0.5 text-xs font-semibold uppercase tracking-widest bg-transparent text-orange-600 border-orange-200 w-fit">
                    Draft
                  </Badge>
                </div>
              </DashboardCard>

              <DashboardCard className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-6 bg-gray-900 rounded-full" />
                    <h3 className="text-lg font-medium tracking-tight">
                      Milestones
                    </h3>
                  </div>
                  <div className="space-y-2">
                    {[
                      { label: "Research", status: "Completed" },
                      { label: "Draft", status: "In progress" },
                      { label: "Review", status: "Pending" },
                      { label: "Final submission", status: "Pending" },
                    ].map((m, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-gray-50/50"
                      >
                        <p className="text-sm font-medium text-gray-900">
                          {m.label}
                        </p>
                        <Badge className="rounded-0 border px-2 py-0.5 text-xs font-semibold uppercase tracking-widest bg-transparent text-gray-700 border-gray-200">
                          {m.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </DashboardCard>

              <DashboardCard className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-6 bg-gray-900 rounded-full" />
                    <h3 className="text-lg font-medium tracking-tight">
                      Latest Version Documents
                    </h3>
                  </div>
                  <div className="text-sm text-gray-500">
                    Documents will appear here once uploaded.
                  </div>
                </div>
              </DashboardCard>
            </>
          )}

          {/* Liquidation: steps, status, actions log */}
          {serviceName === "Liquidation" && (
            <>
              <DashboardCard className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-6 bg-gray-900 rounded-full" />
                    <h3 className="text-lg font-medium tracking-tight">
                      Liquidation Process
                    </h3>
                  </div>
                  <div className="space-y-2">
                    {[
                      "Appointment of liquidator",
                      "Asset review",
                      "Creditor notifications",
                      "Closure",
                    ].map((step, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-gray-50/50"
                      >
                        <p className="text-sm font-medium text-gray-900">
                          {step}
                        </p>
                        <Badge className="rounded-0 border px-2 py-0.5 text-xs font-semibold uppercase tracking-widest bg-transparent text-gray-700 border-gray-200">
                          Pending
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </DashboardCard>

              <DashboardCard className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-6 bg-gray-900 rounded-full" />
                    <h3 className="text-lg font-medium tracking-tight">
                      Current Status
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600">{workflowInfo.label}</p>
                </div>
              </DashboardCard>

              <DashboardCard className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-6 bg-gray-900 rounded-full" />
                    <h3 className="text-lg font-medium tracking-tight">
                      Recent Actions
                    </h3>
                  </div>
                  <div className="text-sm text-gray-500">No activity yet</div>
                </div>
              </DashboardCard>
            </>
          )}

          {/* Financial Statistics Section - Only for Accounting & Bookkeeping */}
          {serviceName === "Accounting & Bookkeeping" && (
            <div className="space-y-8">
              {/* Financial Statistics */}
              <DashboardCard className="px-5 py-6">
                <div className="space-y-6">
                  <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-3">
                      <div className="w-1 h-6 bg-gray-900 rounded-full" />
                      <h3 className="text-xl font-medium tracking-tight">
                        Financial Statistics
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                      <p className="text-[10px] font-medium uppercase tracking-[0.2em]">
                        Real-time Updates
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    {loading ? (
                      Array(3)
                        .fill(null)
                        .map((_, idx) => (
                          <DashboardCard
                            key={idx}
                            hover={false}
                            className="h-48 bg-white/50 animate-pulse border-white/30"
                          />
                        ))
                    ) : stats.length > 0 ? (
                      stats.map((stat) => (
                        <StatCard key={stat.title} {...stat} />
                      ))
                    ) : (
                      <DashboardCard
                        hover={false}
                        className="col-span-full bg-white/40 border border-dashed border-gray-200 py-16 flex flex-col items-center justify-center text-center relative overflow-hidden backdrop-blur-sm"
                      >
                        <div className="absolute inset-0 pointer-events-none" />
                        <div className="relative z-10">
                          <div className="w-20 h-20 rounded-3xl bg-white shadow-xl flex items-center justify-center mb-6 mx-auto transform -rotate-6">
                            <HugeiconsIcon
                              icon={Alert02Icon}
                              className="w-10 h-10 text-gray-300"
                            />
                          </div>
                          <h4 className="text-xl font-bold text-gray-900 mb-2">
                            Awaiting Analytic Data
                          </h4>
                          <p className="text-sm text-gray-500 max-w-sm mx-auto font-medium leading-relaxed">
                            Your financial insights are currently being
                            synchronized.
                          </p>
                        </div>
                      </DashboardCard>
                    )}
                  </div>
                </div>
              </DashboardCard>

              {/* Charts */}
              <div className="flex flex-col gap-4">
                <CashFlowChart />
                <PLSummaryChart />
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "library" && <LibraryExplorer />}

      {activeTab === "document_requests" && <DocumentRequestsTab />}

      {activeTab === "milestones" && <MilestonesTab />}

      {activeTab === "compliance_calendar" && (
        <ComplianceCalendarTab serviceName={serviceName} />
      )}

      {activeTab === "service_history" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-gray-900">
                Engagement History
              </h3>
              <p className="text-sm text-gray-500">
                Chronological record of all significant updates and
                interactions.
              </p>
            </div>
          </div>
          <div className="border border-gray-100 bg-white">
            <div className="divide-y divide-gray-50">
              {[
                {
                  date: "2026-01-25",
                  action: "VAT Return Filed",
                  user: "Sarah Jones",
                  status: "Success",
                },
                {
                  date: "2026-01-22",
                  action: "Document Request Completed",
                  user: "Client (You)",
                  status: "Success",
                },
                {
                  date: "2026-01-18",
                  action: "Period Review Started",
                  user: "Sarah Jones",
                  status: "In Progress",
                },
                {
                  date: "2026-01-15",
                  action: "System Audit Check",
                  user: "VACEI System",
                  status: "Automated",
                },
              ].map((log, i) => (
                <div
                  key={i}
                  className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-xs font-bold text-gray-400 w-24">
                      {log.date}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-gray-900">
                        {log.action}
                      </div>
                      <div className="text-[10px] text-gray-500 font-medium">
                        By {log.user}
                      </div>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className="text-[10px] font-bold uppercase tracking-widest border-gray-100 text-gray-400"
                  >
                    {log.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "messages" && (
        <ServiceMessages serviceName={serviceName} messages={messages} />
      )}
    </div>
    </TooltipProvider>
  );
};

export default EngagementSummary;
