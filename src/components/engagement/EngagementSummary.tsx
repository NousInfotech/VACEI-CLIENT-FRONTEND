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
import { useEngagement } from "./hooks/useEngagement";

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
  const isIncorporation = serviceName === "Incorporation";
  const isBusinessPlans = serviceName === "Business Plans";
  const isLiquidation = serviceName === "Liquidation";
  const isPayroll = serviceName === "Payroll";
  const isCorporate = serviceName === "Corporate Services";
  const isCFO = serviceName === "CFO Services";
  const isAccounting = serviceName === "Accounting & Bookkeeping";
  const isAudit = serviceName === "Statutory Audit";
  const isBankingPayments = serviceName === "Banking & Payments";
  const isRegulatedLicenses = serviceName === "Regulated Licenses";
  const isInternationalStructuring = serviceName === "International Structuring";
  const isCryptoAssets = serviceName === "Crypto & Digital Assets";


  const { engagement } = useEngagement();
  const engagementData = engagement as any;

  const mbrFilings = engagementData?.filings || MBR_FILINGS_MOCK;
  const mbrActiveFiling = isMBRFilings
    ? getActiveMBRFiling(mbrFilings, mbrCurrentFilingId)
    : undefined;
  const mbrStatus = isMBRFilings
    ? getMBRServiceStatusFromFilings(mbrFilings)
    : status;

  const vatPeriods = engagementData?.periods || VAT_PERIODS_MOCK;
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
        (f: any) =>
          !f.submitted_at &&
          new Date(f.due_date) < now &&
          (f.filing_status === "waiting_on_you" ||
            f.filing_status === "in_progress"),
      ).length,
      dueSoon: mbrFilings.filter(
        (f: any) =>
          !f.submitted_at &&
          new Date(f.due_date) >= now &&
          new Date(f.due_date) <= thirtyDaysFromNow,
      ).length,
      inProgress: mbrFilings.filter((f: any) => f.filing_status === "in_progress")
        .length,
      completedThisYear: mbrFilings.filter(
        (f: any) =>
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

  // Set recent documents from mock data if available
  useEffect(() => {
    if (engagementData?.quickAccessDocs) {
      setRecentDocuments(engagementData.quickAccessDocs);
    }
  }, [engagementData?.quickAccessDocs]);

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
      { id: "dashboard", label: "Overview", icon: LayoutDashboard },
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
      { id: "filings", label: "Filings", icon: FileCheck },
    ]
    : isVAT
      ? [
        { id: "dashboard", label: "Overview", icon: LayoutDashboard },
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
        { id: "vat_periods", label: "Filings", icon: FileCheck },
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
        ...(engagementData?.filings?.length > 0 &&
          !isPayroll && !isCorporate && !isCFO &&
          serviceName !== "Tax" &&
          serviceName !== "Statutory Audit" &&
          serviceName !== "Accounting & Bookkeeping" &&
          serviceName !== "Incorporation" &&
          serviceName !== "Business Plans" &&
          serviceName !== "Liquidation"
          ? [
            {
              id: "mbr_filings",
              label: "Filings",
              icon: FileCheck as React.ElementType,
            },
          ]
          : []),
        ...(isPayroll ? [
          { id: "payroll_filings", label: "Filings", icon: FileCheck },
        ] : []),
        ...(isCorporate ? [
          { id: "corporate_filings", label: "Filings", icon: FileCheck },
        ] : []),
        ...(isCFO ? [
          { id: "cfo_filings", label: "Filings", icon: FileCheck },
        ] : []),
        ...(isAccounting ? [
          { id: "accounting_filings", label: "Filings", icon: FileCheck },
        ] : []),
        ...(isAudit ? [
          { id: "audit_filings", label: "Filings", icon: FileCheck },
        ] : []),
        ...(isTax ? [
          { id: "tax_filings", label: "Filings", icon: FileCheck },
        ] : []),
        ...(isIncorporation ? [
          { id: "incorporation_filings", label: "Filings", icon: FileCheck },
        ] : []),
        ...(isBusinessPlans ? [
          { id: "business_plans_filings", label: "Filings", icon: FileCheck },
        ] : []),
        ...(isLiquidation ? [
          { id: "liquidation_filings", label: "Filings", icon: FileCheck },
        ] : []),
        ...(isBankingPayments ? [
          { id: "banking_payments_filings", label: "Filings", icon: FileCheck },
        ] : []),
        ...(isInternationalStructuring ? [
          {
            id: "international_filings",
            label: "Filings",
            icon: FileCheck,
          },
        ] : []),

        ...(isCryptoAssets ? [
          {
            id: "crypto_filings",
            label: "Filings",
            icon: FileCheck,
          },
        ] : []),

        ...(isRegulatedLicenses ? [
          { id: "regulated_licenses_filings", label: "Filings", icon: FileCheck },
        ] : []),
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
                {isBankingPayments ? "Manage bank documents, approvals, and payment workflows." :
                  isRegulatedLicenses ? "Manage license applications, renewals, and ongoing regulatory compliance." : description}
              </p>
              {isMBRFilings && (
                <p className="text-white/40 text-xs mt-2 italic">
                  We prepare and submit all MBR filings for you. You’ll only be asked for input when required.
                </p>
              )}
              {isBankingPayments && (
                <p className="text-white/40 text-xs mt-2 italic">
                  We manage your bank reconciliations and payment processing. Approvals are requested when needed.
                </p>
              )}
            </div>
          </div>
        </DashboardCard>

        <PillTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />


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
                        {mbrFilings.some((f: any) => f.filing_type) && (
                          <th className="text-left py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">
                            Filing Type
                          </th>
                        )}
                        {mbrFilings.some((f: any) => f.reference) && (
                          <th className="text-left py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">
                            Reference
                          </th>
                        )}
                        {mbrFilings.some((f: any) => f.due_date) && (
                          <th className="text-left py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">
                            Due Date
                          </th>
                        )}
                        {mbrFilings.some((f: any) => f.filing_status) && (
                          <th className="text-left py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">
                            Filing Status
                          </th>
                        )}
                        {mbrFilings.some((f: any) => f.service_status) && (
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
                        )}
                        {mbrFilings.some((f: any) => f.submitted_at) && (
                          <th className="text-left py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">
                            Submitted On
                          </th>
                        )}
                        {mbrFilings.some((f: any) => f.documents?.length > 0) && (
                          <th className="text-left py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">
                            Documents
                          </th>
                        )}
                        <th className="text-right py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">
                          Open
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {mbrFilings.map((f: any) => (
                        <tr
                          key={f.id}
                          className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                        >
                          {mbrFilings.some((x: any) => x.filing_type) && (
                            <td className="py-3 px-4 font-medium text-gray-900">
                              {f.filing_type}
                            </td>
                          )}
                          {mbrFilings.some((x: any) => x.reference) && (
                            <td className="py-3 px-4 text-gray-600">
                              {f.reference}
                            </td>
                          )}
                          {mbrFilings.some((x: any) => x.due_date) && (
                            <td className="py-3 px-4 text-gray-600">
                              {f.due_date ? new Date(f.due_date).toLocaleDateString("en-GB", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              }) : "—"}
                            </td>
                          )}
                          {mbrFilings.some((x: any) => x.filing_status) && (
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
                                  "Waiting on you"}
                                {f.filing_status === "in_progress" &&
                                  "In progress"}
                                {f.filing_status === "submitted" &&
                                  "Submitted"}
                                {f.filing_status === "completed" &&
                                  "Completed"}
                                {(!["waiting_on_you", "in_progress", "submitted", "completed"].includes(f.filing_status)) && (
                                  typeof f.filing_status === 'object' ? f.filing_status.label : f.filing_status
                                )}
                              </Badge>
                            </td>
                          )}
                          {mbrFilings.some((x: any) => x.service_status) && (
                            <td className="py-3 px-4">
                              <Badge
                                variant="outline"
                                className="text-xs font-medium"
                              >
                                {f.service_status === "on_track" &&
                                  "On track"}
                                {f.service_status === "due_soon" && "Due soon"}
                                {f.service_status === "action_required" &&
                                  "Action required"}
                                {f.service_status === "overdue" && "Overdue"}
                                {(!["on_track", "due_soon", "action_required", "overdue"].includes(f.service_status)) && f.service_status}
                              </Badge>
                            </td>
                          )}
                          {mbrFilings.some((x: any) => x.submitted_at) && (
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
                          )}
                          {mbrFilings.some((x: any) => x.documents?.length > 0 || true) && (
                            <td className="py-3 px-4">
                              {f.documents && f.documents.length > 0 ? (
                                <div className="flex gap-1 items-center">
                                  {f.documents.map((doc: string, dIdx: number) => (
                                    <React.Fragment key={dIdx}>
                                      <button className="text-blue-600 hover:underline text-[10px] font-medium">
                                        {doc}
                                      </button>
                                      {dIdx < f.documents.length - 1 && (
                                        <span className="text-gray-300 mx-0.5">·</span>
                                      )}
                                    </React.Fragment>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-gray-400 text-xs">—</span>
                              )}
                            </td>
                          )}
                          <td className="py-3 px-4 text-right">
                            {f.filing_status === "waiting_on_you" ? (
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="default"
                                  size="sm"
                                  className="text-xs h-8 px-4"
                                  onClick={() => {
                                    setMbrCurrentFilingId(f.id);
                                    setActiveTab("dashboard");
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
                                    setActiveTab("dashboard");
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
                                  setActiveTab("dashboard");
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
                                  setActiveTab("dashboard");
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
                  Filings
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
                        Frequency
                      </th>
                      <th className="text-left py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">
                        Due Date
                      </th>
                      <th className="text-left py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">
                        Period Status
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
                        Downloads
                      </th>
                      <th className="text-right py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">
                        Open
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {vatPeriods.map((p: any) => (
                      <tr
                        key={p.id}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-3 px-4 font-medium text-gray-900">
                          {p.period}
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {p.frequency || "Quarterly"}
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {p.due_date ? new Date(p.due_date).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          }) : "—"}
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            className={cn(
                              "rounded-0 border px-2 py-0.5 text-xs font-semibold uppercase tracking-widest bg-transparent",
                              (p.filing_status === "waiting_on_you" || p.filing_status === "Waiting on you") &&
                              "text-orange-500 border-orange-500/20",
                              (p.filing_status === "in_progress" || p.filing_status === "In progress") &&
                              "text-blue-500 border-blue-500/20",
                              (p.filing_status === "submitted" || p.filing_status === "Submitted") &&
                              "text-purple-500 border-purple-500/20",
                              (p.filing_status === "completed" || p.filing_status === "Completed") &&
                              "text-green-500 border-green-500/20",
                            )}
                          >
                            {p.filing_status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-xs font-bold uppercase tracking-wider rounded-0",
                              (p.service_status === "action_required" || p.service_status === "Action required") ? "text-red-600 border-red-100" : "text-emerald-600 border-emerald-100"
                            )}
                          >
                            {p.service_status}
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
                          {p.downloads && p.downloads.length > 0 ? (
                            <div className="flex flex-wrap gap-1 text-[10px] font-medium text-blue-600">
                              {p.downloads.map((d: string, i: number) => (
                                <React.Fragment key={i}>
                                  <button className="hover:underline">{d}</button>
                                  {i < p.downloads.length - 1 && <span className="text-gray-300">·</span>}
                                </React.Fragment>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-400 text-xs">—</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs text-blue-600 hover:text-blue-800 p-0 h-auto font-medium"
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

        {isAccounting && activeTab === "accounting_filings" && (
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
                      <th className="text-left py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">Period</th>
                      <th className="text-left py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">Frequency</th>
                      <th className="text-left py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">Period Status</th>
                      <th className="text-left py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">Service Status</th>
                      <th className="text-left py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">Completed On</th>
                      <th className="text-left py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">Deliverables</th>
                      <th className="text-right py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">Open</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(engagementData?.accountingFilings || []).map((f: any) => (
                      <tr key={f.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-4 font-medium text-gray-900">{f.period}</td>
                        <td className="py-4 px-4 text-gray-600">{f.frequency}</td>
                        <td className="py-4 px-4">
                          <Badge
                            className={cn(
                              "rounded-0 border px-2 py-0.5 text-xs font-semibold uppercase tracking-widest bg-transparent",
                              f.periodStatus === "In progress" && "text-blue-500 border-blue-500/20",
                              f.periodStatus === "Completed" && "text-green-500 border-green-500/20"
                            )}
                          >
                            {f.periodStatus}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          <Badge variant="outline" className="text-xs font-medium text-emerald-600 border-emerald-100">
                            {f.serviceStatus === "on_track" ? "On track" : f.serviceStatus}
                          </Badge>
                        </td>
                        <td className="py-4 px-4 text-gray-600">{f.completedOn}</td>
                        <td className="py-4 px-4">
                          <div className="flex gap-1 items-center">
                            {f.deliverables?.map((d: string, i: number) => (
                              <React.Fragment key={i}>
                                <button className="text-blue-600 hover:underline text-[10px] font-medium">{d}</button>
                                {i < f.deliverables.length - 1 && <span className="text-gray-300 mx-0.5">·</span>}
                              </React.Fragment>
                            ))}
                            {(!f.deliverables || f.deliverables.length === 0) && <span className="text-gray-400">—</span>}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <Button variant="ghost" size="sm" className="text-xs text-blue-600 hover:text-blue-800 p-0 h-auto font-medium">
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

        {isAudit && activeTab === "audit_filings" && (
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
                      <th className="text-left py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">Engagement</th>
                      <th className="text-left py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">Financial Year</th>
                      <th className="text-left py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">Status</th>
                      <th className="text-left py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">Service Status</th>
                      <th className="text-left py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">Report Date</th>
                      <th className="text-left py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">Deliverables</th>
                      <th className="text-right py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">Open</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(engagementData?.auditFilings || []).map((f: any) => (
                      <tr key={f.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-4 font-medium text-gray-900">{f.engagement}</td>
                        <td className="py-4 px-4 text-gray-600">{f.financialYear}</td>
                        <td className="py-4 px-4">
                          <Badge
                            className={cn(
                              "rounded-0 border px-2 py-0.5 text-xs font-semibold uppercase tracking-widest bg-transparent",
                              f.status === "In progress" && "text-blue-500 border-blue-500/20",
                              f.status === "Completed" && "text-green-500 border-green-500/20"
                            )}
                          >
                            {f.status}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          <Badge variant="outline" className="text-xs font-medium text-emerald-600 border-emerald-100">
                            {f.serviceStatus === "on_track" ? "On track" : f.serviceStatus}
                          </Badge>
                        </td>
                        <td className="py-4 px-4 text-gray-600">{f.reportDate}</td>
                        <td className="py-4 px-4">
                          <div className="flex gap-1 items-center">
                            {f.deliverables?.map((d: string, i: number) => (
                              <React.Fragment key={i}>
                                <button className="text-blue-600 hover:underline text-[10px] font-medium">{d}</button>
                                {i < f.deliverables.length - 1 && <span className="text-gray-300 mx-0.5">·</span>}
                              </React.Fragment>
                            ))}
                            {(!f.deliverables || f.deliverables.length === 0) && <span className="text-gray-400">—</span>}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <Button variant="ghost" size="sm" className="text-xs text-blue-600 hover:text-blue-800 p-0 h-auto font-medium">
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

        {isTax && activeTab === "tax_filings" && (
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
                      <th className="text-left py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">Tax Type</th>
                      <th className="text-left py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">Period / Year</th>
                      <th className="text-left py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">Due Date</th>
                      <th className="text-left py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">Filing Status</th>
                      <th className="text-left py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">Service Status</th>
                      <th className="text-left py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">Filed On</th>
                      <th className="text-left py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">Documents</th>
                      <th className="text-right py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">Open</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(engagementData?.taxFilings || []).map((f: any) => (
                      <tr key={f.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-4 font-medium text-gray-900">{f.taxType}</td>
                        <td className="py-4 px-4 text-gray-600">{f.periodYear}</td>
                        <td className="py-4 px-4 text-gray-600">{f.dueDate}</td>
                        <td className="py-4 px-4">
                          <Badge
                            className={cn(
                              "rounded-0 border px-2 py-0.5 text-xs font-semibold uppercase tracking-widest bg-transparent",
                              f.filingStatus === "In progress" && "text-blue-500 border-blue-500/20",
                              f.filingStatus === "Filed" && "text-green-500 border-green-500/20",
                              f.filingStatus === "Waiting on you" && "text-orange-500 border-orange-500/20"
                            )}
                          >
                            {f.filingStatus}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          <Badge
                            className={cn(
                              "rounded-0 border px-2 py-0.5 text-[10px] font-bold uppercase tracking-tighter bg-transparent h-5",
                              f.serviceStatus === "on_track" || f.serviceStatus === "On track" ? "text-emerald-600 border-emerald-100" : "text-amber-600 border-amber-100"
                            )}
                          >
                            {f.serviceStatus === "on_track" || f.serviceStatus === "On track" ? "On track" : "Action required"}
                          </Badge>
                        </td>
                        <td className="py-4 px-4 text-gray-600">{f.filedOn}</td>
                        <td className="py-4 px-4">
                          <div className="flex gap-1 items-center">
                            {f.documents?.map((d: string, i: number) => (
                              <React.Fragment key={i}>
                                <button className="text-blue-600 hover:underline text-[10px] font-medium">{d}</button>
                                {i < f.documents.length - 1 && <span className="text-gray-300 mx-0.5">·</span>}
                              </React.Fragment>
                            ))}
                            {(!f.documents || f.documents.length === 0) && <span className="text-gray-400">—</span>}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <Button variant="ghost" size="sm" className="text-xs text-blue-600 hover:text-blue-800 p-0 h-auto font-medium">
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

        {isIncorporation && activeTab === "incorporation_filings" && (
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
                      <th className="text-left py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">Stage</th>
                      <th className="text-left py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">Description</th>
                      <th className="text-left py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">Status</th>
                      <th className="text-left py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">Service Status</th>
                      <th className="text-left py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">Completed On</th>
                      <th className="text-left py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">Documents</th>
                      <th className="text-right py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">Open</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(engagementData?.incorporationFilings || []).map((f: any) => (
                      <tr key={f.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-4 font-medium text-gray-900">{f.stage}</td>
                        <td className="py-4 px-4 text-gray-600">{f.description}</td>
                        <td className="py-4 px-4">
                          <Badge
                            className={cn(
                              "rounded-0 border px-2 py-0.5 text-xs font-semibold uppercase tracking-widest bg-transparent",
                              f.status === "Completed" && "text-green-500 border-green-500/20",
                              f.status === "Waiting on you" && "text-orange-500 border-orange-500/20",
                              f.status === "In progress" && "text-blue-500 border-blue-500/20",
                              f.status === "Not started" && "text-gray-400 border-gray-200"
                            )}
                          >
                            {f.status}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          <Badge
                            className={cn(
                              "rounded-0 border px-2 py-0.5 text-[10px] font-bold uppercase tracking-tighter bg-transparent h-5",
                              f.serviceStatus === "on_track" || f.serviceStatus === "On track" ? "text-emerald-600 border-emerald-100" : "text-amber-600 border-amber-100"
                            )}
                          >
                            {f.serviceStatus === "on_track" || f.serviceStatus === "On track" ? "On track" : "Action required"}
                          </Badge>
                        </td>
                        <td className="py-4 px-4 text-gray-600">{f.completedOn}</td>
                        <td className="py-4 px-4">
                          <div className="flex gap-1 items-center">
                            {f.documents?.map((d: string, i: number) => (
                              <React.Fragment key={i}>
                                <button className="text-blue-600 hover:underline text-[10px] font-medium">{d}</button>
                                {i < f.documents.length - 1 && <span className="text-gray-300 mx-0.5">·</span>}
                              </React.Fragment>
                            ))}
                            {(!f.documents || f.documents.length === 0) && <span className="text-gray-400">—</span>}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <Button variant="ghost" size="sm" className="text-xs text-blue-600 hover:text-blue-800 p-0 h-auto font-medium">
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

        {isBusinessPlans && activeTab === "business_plans_filings" && (
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
                      <th className="text-left py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">Stage / Version</th>
                      <th className="text-left py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">Description</th>
                      <th className="text-left py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">Status</th>
                      <th className="text-left py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">Service Status</th>
                      <th className="text-left py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">Completed On</th>
                      <th className="text-left py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">Documents</th>
                      <th className="text-right py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">Open</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(engagementData?.businessPlansFilings || []).map((f: any) => (
                      <tr key={f.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-4 font-medium text-gray-900">{f.stageVersion}</td>
                        <td className="py-4 px-4 text-gray-600">{f.description}</td>
                        <td className="py-4 px-4">
                          <Badge
                            className={cn(
                              "rounded-0 border px-2 py-0.5 text-xs font-semibold uppercase tracking-widest bg-transparent",
                              f.status === "Completed" && "text-green-500 border-green-500/20",
                              f.status === "In progress" && "text-blue-500 border-blue-500/20",
                              f.status === "Not started" && "text-gray-400 border-gray-200"
                            )}
                          >
                            {f.status}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          <Badge
                            className={cn(
                              "rounded-0 border px-2 py-0.5 text-[10px] font-bold uppercase tracking-tighter bg-transparent h-5",
                              f.serviceStatus === "on_track" || f.serviceStatus === "On track" ? "text-emerald-600 border-emerald-100" : "text-amber-600 border-amber-100"
                            )}
                          >
                            {f.serviceStatus === "on_track" || f.serviceStatus === "On track" ? "On track" : "Action required"}
                          </Badge>
                        </td>
                        <td className="py-4 px-4 text-gray-600">{f.completedOn}</td>
                        <td className="py-4 px-4">
                          <div className="flex gap-1 items-center">
                            {f.documents?.map((d: string, i: number) => (
                              <React.Fragment key={i}>
                                <button className="text-blue-600 hover:underline text-[10px] font-medium">{d}</button>
                                {i < f.documents.length - 1 && <span className="text-gray-300 mx-0.5">·</span>}
                              </React.Fragment>
                            ))}
                            {(!f.documents || f.documents.length === 0) && <span className="text-gray-400">—</span>}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <Button variant="ghost" size="sm" className="text-xs text-blue-600 hover:text-blue-800 p-0 h-auto font-medium">
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

        {isLiquidation && activeTab === "liquidation_filings" && (
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
                      <th className="text-left py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">Stage / Filing</th>
                      <th className="text-left py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">Description</th>
                      <th className="text-left py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">Status</th>
                      <th className="text-left py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">Service Status</th>
                      <th className="text-left py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">Completed On</th>
                      <th className="text-left py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">Documents</th>
                      <th className="text-right py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">Open</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(engagementData?.liquidationFilings || []).map((f: any) => (
                      <tr key={f.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-4 font-medium text-gray-900">{f.stageFiling}</td>
                        <td className="py-4 px-4 text-gray-600">{f.description}</td>
                        <td className="py-4 px-4">
                          <Badge
                            className={cn(
                              "rounded-0 border px-2 py-0.5 text-xs font-semibold uppercase tracking-widest bg-transparent",
                              f.status === "Completed" && "text-green-500 border-green-500/20",
                              f.status === "Waiting on you" && "text-orange-500 border-orange-500/20",
                              f.status === "In progress" && "text-blue-500 border-blue-500/20",
                              f.status === "Not started" && "text-gray-400 border-gray-200"
                            )}
                          >
                            {f.status}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          <Badge
                            className={cn(
                              "rounded-0 border px-2 py-0.5 text-[10px] font-bold uppercase tracking-tighter bg-transparent h-5",
                              f.serviceStatus === "on_track" || f.serviceStatus === "On track" ? "text-emerald-600 border-emerald-100" : "text-amber-600 border-amber-100"
                            )}
                          >
                            {f.serviceStatus === "on_track" || f.serviceStatus === "On track" ? "On track" : "Action required"}
                          </Badge>
                        </td>
                        <td className="py-4 px-4 text-gray-600">{f.completedOn}</td>
                        <td className="py-4 px-4">
                          <div className="flex gap-1 items-center">
                            {f.documents?.map((d: string, i: number) => (
                              <React.Fragment key={i}>
                                <button className="text-blue-600 hover:underline text-[10px] font-medium">{d}</button>
                                {i < f.documents.length - 1 && <span className="text-gray-300 mx-0.5">·</span>}
                              </React.Fragment>
                            ))}
                            {(!f.documents || f.documents.length === 0) && <span className="text-gray-400">—</span>}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <Button variant="ghost" size="sm" className="text-xs text-blue-600 hover:text-blue-800 p-0 h-auto font-medium">
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

        {isBankingPayments && activeTab === "banking_payments_filings" && (
          <DashboardCard className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-6 bg-gray-900 rounded-full" />
                  <h3 className="text-lg font-medium tracking-tight">Filings</h3>
                </div>
                <div className="flex gap-2">
                  {["Bank Statements", "Payment Confirmations", "Mandates & Bank Forms", "Source of Funds"].map((cat) => (
                    <Badge key={cat} variant="outline" className="text-[10px] rounded-0 uppercase tracking-widest cursor-pointer hover:bg-gray-100">
                      {cat}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">Title</th>
                      <th className="text-left py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">Category</th>
                      <th className="text-left py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">Period</th>
                      <th className="text-left py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">Status</th>
                      <th className="text-left py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">Updated Date</th>
                      <th className="text-left py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">Documents</th>
                      <th className="text-right py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">Open</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(engagementData?.bankingPaymentsFilings || []).map((f: any) => (
                      <tr key={f.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-4 font-medium text-gray-900">{f.title}</td>
                        <td className="py-4 px-4 text-gray-600">
                          <Badge variant="secondary" className="text-[10px] rounded-0 bg-gray-100 text-gray-600 border-none">
                            {f.category}
                          </Badge>
                        </td>
                        <td className="py-4 px-4 text-gray-600">{f.period}</td>
                        <td className="py-4 px-4">
                          <Badge
                            className={cn(
                              "rounded-0 border px-2 py-0.5 text-xs font-semibold uppercase tracking-widest bg-transparent",
                              f.status === "Completed" && "text-green-500 border-green-500/20",
                              f.status === "Active" && "text-blue-500 border-blue-500/20",
                              f.status === "Pending" && "text-orange-500 border-orange-500/20"
                            )}
                          >
                            {f.status}
                          </Badge>
                        </td>
                        <td className="py-4 px-4 text-gray-600">{f.updatedDate}</td>
                        <td className="py-4 px-4">
                          <div className="flex gap-1 items-center">
                            {f.documents?.map((d: string, i: number) => (
                              <React.Fragment key={i}>
                                <button className="text-blue-600 hover:underline text-[10px] font-medium">{d}</button>
                                {i < f.documents.length - 1 && <span className="text-gray-300 mx-0.5">·</span>}
                              </React.Fragment>
                            ))}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <Button variant="ghost" size="sm" className="text-xs text-blue-600 hover:text-blue-800 p-0 h-auto font-medium">
                            View Documents
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

        {isRegulatedLicenses && activeTab === "regulated_licenses_filings" && (
          <DashboardCard className="p-8">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-6 bg-gray-900 rounded-full" />
                  <h3 className="text-lg font-medium tracking-tight">Regulatory Filings</h3>
                </div>
                <div className="flex gap-2">
                  {["All", "Annual Returns", "Notifications", "Ad-hoc"].map((cat) => (
                    <Badge key={cat} variant="outline" className="text-[10px] rounded-0 uppercase tracking-widest cursor-pointer hover:bg-gray-100 font-medium">
                      {cat}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">Title / Type</th>
                      <th className="text-left py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">Regulator</th>
                      <th className="text-left py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">Submitted Date</th>
                      <th className="text-left py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">Status</th>
                      <th className="text-left py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">Queries</th>
                      <th className="text-left py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">Documents</th>
                      <th className="text-right py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(engagementData?.regulatedLicensesFilings || []).map((f: any) => (
                      <tr key={f.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-4">
                          <p className="font-bold text-gray-900">{f.title}</p>
                          <p className="text-[10px] text-gray-400 uppercase font-medium">{f.type}</p>
                        </td>
                        <td className="py-4 px-4 text-gray-600 font-medium">{f.regulator}</td>
                        <td className="py-4 px-4 text-gray-600">{f.submissionDate}</td>
                        <td className="py-4 px-4">
                          <Badge
                            className={cn(
                              "rounded-0 border px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest bg-transparent",
                              f.status === "Approved" ? "text-emerald-500 border-emerald-500/20" :
                                f.status === "Pending Regulator" ? "text-blue-500 border-blue-500/20" :
                                  f.status === "Query Received" ? "text-orange-500 border-orange-500/20" : "text-gray-400 border-gray-200"
                            )}
                          >
                            {f.status}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          {f.queryRounds > 0 ? (
                            <div className="flex flex-col gap-1">
                              <span className="text-xs font-bold text-gray-900">Round {f.queryRounds} active</span>
                              <span className="text-[10px] text-orange-600 font-medium uppercase tracking-tighter">Response Required</span>
                            </div>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex flex-wrap gap-2">
                            {f.documents?.map((d: string, i: number) => (
                              <button key={i} className="text-blue-600 hover:underline text-[10px] font-bold truncate max-w-[80px]">{d}</button>
                            ))}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right whitespace-nowrap">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800 text-[10px] font-bold uppercase tracking-widest p-0 h-auto font-medium">
                              View Linked
                            </Button>
                            {f.status === "Query Received" && (
                              <Button size="sm" className="bg-orange-600 hover:bg-orange-700 text-white text-[10px] font-bold uppercase tracking-widest h-7 px-3 rounded-0">
                                Upload Response
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </DashboardCard>
        )}

        {isInternationalStructuring &&
  activeTab === "international_filings" && (
    <DashboardCard className="p-6">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 bg-gray-900 rounded-full" />
          <h3 className="text-lg font-medium tracking-tight">
            Group Filings
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                {[
                  "Entity",
                  "Country",
                  "Filing",
                  "Period / Event",
                  "Due Date",
                  "Status",
                  "Responsibility",
                  "Action",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-widest"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {(engagementData?.internationalStructuringFilings || []).map(
                (f: any) => (
                  <tr
                    key={f.id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4 font-medium">
                      {f.entity}
                    </td>

                    <td className="py-3 px-4 text-gray-600">
                      {f.country}
                    </td>

                    <td className="py-3 px-4">
                      {f.filing}
                    </td>

                    <td className="py-3 px-4 text-gray-600">
                      {f.period}
                    </td>

                    <td className="py-3 px-4 text-gray-600">
                      {f.dueDate}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      <Badge
                        className={cn(
                          "rounded-full px-2 py-0.5 text-xs flex items-center gap-1 w-fit",
                          f.status === "due_soon" &&
                            "bg-orange-100 text-orange-600",
                          f.status === "in_progress" &&
                            "bg-blue-100 text-blue-600",
                          f.status === "submitted" &&
                            "bg-emerald-100 text-emerald-600",
                          f.status === "waiting_on_advisor" &&
                            "bg-red-100 text-red-600",
                          f.status === "on_track" &&
                            "bg-green-100 text-green-600",
                        )}
                      >
                        ●{" "}
                        {f.status.replaceAll("_", " ")}
                      </Badge>
                    </td>

                    <td className="py-3 px-4 text-gray-600">
                      {f.responsibility}
                    </td>

                    {/* Action */}
                    <td className="py-3 px-4 text-right">
                      {f.action === "upload" ? (
                        <Button size="sm">Upload</Button>
                      ) : (
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      )}
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardCard>
  )}


        {/* Crypto & Digital Assets: Filings */}
{isCryptoAssets && activeTab === "crypto_filings" && (
  <DashboardCard className="p-6">
    <div className="space-y-4">

      <div className="flex items-center gap-3">
        <div className="w-1 h-6 bg-gray-900 rounded-full" />
        <h3 className="text-lg font-medium tracking-tight">
          Filings
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">

          <thead>
            <tr className="border-b border-gray-200">

              {[
                "Entity",
                "Activity Type",
                "Filing / Report",
                "Period / Event",
                "Due Date",
                "Status",
                "Responsibility",
                "Action",
              ].map((h) => (
                <th
                  key={h}
                  className="text-left py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]"
                >
                  {h}
                </th>
              ))}

            </tr>
          </thead>

          <tbody>
            {(engagementData?.cryptoDigitalAssetsFilings || []).map(
              (f: any) => (
                <tr
                  key={f.id}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-3 px-4 font-medium">{f.entity}</td>
                  <td className="py-3 px-4 text-gray-600">{f.activityType}</td>
                  <td className="py-3 px-4 text-gray-600">{f.filing}</td>
                  <td className="py-3 px-4 text-gray-600">{f.period}</td>
                  <td className="py-3 px-4 text-gray-600">{f.dueDate}</td>

                  {/* Status */}
                  <td className="py-3 px-4">
                    <Badge
                      className={cn(
                        "rounded-0 border px-2 py-0.5 text-xs font-semibold uppercase tracking-widest bg-transparent",

                        f.status === "completed" &&
                          "text-emerald-500 border-emerald-500/20",

                        f.status === "due_soon" &&
                          "text-orange-500 border-orange-500/20",

                        f.status === "ready" &&
                          "text-blue-500 border-blue-500/20",

                        f.status === "waiting_on_you" &&
                          "text-red-500 border-red-500/20",

                        f.status === "on_track" &&
                          "text-green-500 border-green-500/20",

                        f.status === "prepared" &&
                          "text-purple-500 border-purple-500/20"
                      )}
                    >
                      {f.status.replaceAll("_", " ")}
                    </Badge>
                  </td>

                  <td className="py-3 px-4 text-gray-600">
                    {f.responsibility}
                  </td>

                  {/* Action */}
                  <td className="py-3 px-4 text-right">
                    {f.action === "upload" ? (
                      <Button size="sm" variant="outline">
                        Upload
                      </Button>
                    ) : (
                      <Button size="sm" variant="ghost">
                        View
                      </Button>
                    )}
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>

    </div>
  </DashboardCard>
)}



        {/* CFO: Filings tab (table of all CFO deliverables) */}
        {isCFO && activeTab === "cfo_filings" && (
          <DashboardCard className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-1 h-6 bg-gray-900 rounded-full" />
                <h3 className="text-lg font-medium tracking-tight">
                  Filings
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">
                        Service
                      </th>
                      <th className="text-left py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">
                        Frequency
                      </th>
                      <th className="text-left py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">
                        Current Period
                      </th>
                      <th className="text-left py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">
                        Next Deliverable
                      </th>
                      <th className="text-left py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">
                        Service Status
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
                    {(engagementData?.cfoFilings || []).map((f: any, idx: number) => (
                      <tr
                        key={idx}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-3 px-4 font-medium text-gray-900">
                          {f.service}
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {f.frequency}
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {f.currentPeriod}
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            className={cn(
                              "rounded-0 border px-2 py-0.5 text-xs font-semibold uppercase tracking-widest bg-transparent",
                              (f.status === "Completed") &&
                              "text-emerald-500 border-emerald-500/20",
                              (f.status === "In progress") &&
                              "text-blue-500 border-blue-500/20",
                              (f.status === "Waiting on you") &&
                              "text-orange-500 border-orange-500/20",
                              (f.status === "Scheduled") &&
                              "text-purple-500 border-purple-500/20",
                            )}
                          >
                            {f.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {f.nextDeliverable}
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-xs font-bold uppercase tracking-wider rounded-0",
                              (f.service_status === "Action required") ? "text-red-600 border-red-100" :
                                (f.service_status === "Due soon") ? "text-orange-600 border-orange-100" : "text-emerald-600 border-emerald-100"
                            )}
                          >
                            {f.service_status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          {f.documents && f.documents.length > 0 ? (
                            <div className="flex gap-2">
                              {f.documents.map((d: string, i: number) => (
                                <button key={i} className="text-blue-600 hover:underline text-[10px] font-medium">{d}</button>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-400 text-xs">—</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs text-blue-600 hover:text-blue-800 p-0 h-auto font-medium"
                            onClick={() => {
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

        {/* Corporate: Filings tab (table of all corporate roles/registers) */}
        {isCorporate && activeTab === "corporate_filings" && (
          <DashboardCard className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-1 h-6 bg-gray-900 rounded-full" />
                <h3 className="text-lg font-medium tracking-tight">
                  Filings
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">
                        Service / Role
                      </th>
                      <th className="text-left py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">
                        Holder / Provider
                      </th>
                      <th className="text-left py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">
                        Start Date
                      </th>
                      <th className="text-left py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">
                        Expiry Date
                      </th>
                      <th className="text-left py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">
                        Service Status
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
                    {(engagementData?.corporateServicesStatus || []).map((row: any, idx: number) => (
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
                          <Badge
                            className={cn(
                              "rounded-0 border px-2 py-0.5 text-xs font-semibold uppercase tracking-widest bg-transparent",
                              (row.status === "Active") &&
                              "text-emerald-500 border-emerald-500/20",
                              (row.status === "Action required") &&
                              "text-red-500 border-red-500/20",
                            )}
                          >
                            {row.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {row.startDate ? new Date(row.startDate).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          }) : "—"}
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {row.expiry ? new Date(row.expiry).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          }) : "—"}
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-xs font-bold uppercase tracking-wider rounded-0",
                              (row.service_status === "Action required") ? "text-red-600 border-red-100" :
                                (row.service_status === "Due soon") ? "text-orange-600 border-orange-100" : "text-emerald-600 border-emerald-100"
                            )}
                          >
                            {row.service_status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          {row.documents && row.documents.length > 0 ? (
                            <div className="flex gap-2">
                              {row.documents.map((d: string, i: number) => (
                                <button key={i} className="text-blue-600 hover:underline text-[10px] font-medium">{d}</button>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-400 text-xs">—</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs text-blue-600 hover:text-blue-800 p-0 h-auto font-medium"
                            onClick={() => {
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
        {isPayroll && activeTab === "payroll_filings" && (
          <DashboardCard className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-1 h-6 bg-gray-900 rounded-full" />
                <h3 className="text-lg font-medium tracking-tight">
                  Filings
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">
                        Month
                      </th>
                      <th className="text-left py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">
                        Pay Date
                      </th>
                      <th className="text-left py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">
                        Period Status
                      </th>
                      <th className="text-left py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">
                        Service Status
                      </th>
                      <th className="text-left py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">
                        Completed On
                      </th>
                      <th className="text-left py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">
                        Payroll Outputs
                      </th>
                      <th className="text-right py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">
                        Open
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {(engagementData?.filings || []).map((f: any) => (
                      <tr
                        key={f.id}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-3 px-4 font-medium text-gray-900">
                          {f.month}
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {f.pay_date ? new Date(f.pay_date).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          }) : "—"}
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            className={cn(
                              "rounded-0 border px-2 py-0.5 text-xs font-semibold uppercase tracking-widest bg-transparent",
                              (f.filing_status === "waiting_on_you" || f.filing_status === "Waiting on you") &&
                              "text-orange-500 border-orange-500/20",
                              (f.filing_status === "in_progress" || f.filing_status === "In progress") &&
                              "text-blue-500 border-blue-500/20",
                              (f.filing_status === "submitted" || f.filing_status === "Submitted") &&
                              "text-purple-500 border-purple-500/20",
                              (f.filing_status === "completed" || f.filing_status === "Completed") &&
                              "text-green-500 border-green-500/20",
                            )}
                          >
                            {f.filing_status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-xs font-bold uppercase tracking-wider rounded-0",
                              (f.service_status === "action_required" || f.service_status === "Action required") ? "text-red-600 border-red-100" : "text-emerald-600 border-emerald-100"
                            )}
                          >
                            {f.service_status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {f.completed_at
                            ? new Date(f.completed_at).toLocaleDateString(
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
                          {f.payroll_outputs && f.payroll_outputs.length > 0 ? (
                            <div className="flex flex-wrap gap-1 text-[10px] font-medium text-blue-600">
                              {f.payroll_outputs.map((d: string, i: number) => (
                                <React.Fragment key={i}>
                                  <button className="hover:underline">{d}</button>
                                  {i < f.payroll_outputs.length - 1 && <span className="text-gray-300">·</span>}
                                </React.Fragment>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-400 text-xs">—</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs text-blue-600 hover:text-blue-800 p-0 h-auto font-medium"
                            onClick={() => {
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
            {isMBRFilings ? (
              /* MBR FILINGS SPECIFIC DASHBOARD (RESTORED "BEFORE" LOOK) */
              <>
                {/* 1. Statistics Cards (top of page for MBR) */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <DashboardCard className="p-4 border-l-4 border-red-500 rounded-0">
                    <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest mb-1">
                      Overdue items
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {/* {mbrStats?.overdue} */}1
                    </p>
                  </DashboardCard>
                  <DashboardCard className="p-4 border-l-4 border-yellow-500 rounded-0">
                    <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest mb-1">
                      Due soon (30 days)
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {/* {mbrStats?.dueSoon} */}1
                    </p>
                  </DashboardCard>
                  <DashboardCard className="p-4 border-l-4 border-blue-500 rounded-0">
                    <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest mb-1">
                      In progress
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {/* {mbrStats?.inProgress} */}1
                    </p>
                  </DashboardCard>
                  <DashboardCard className="p-4 border-l-4 border-green-500 rounded-0">
                    <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest mb-1">
                      Completed this year
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {/* {mbrStats?.completedThisYear} */}2
                    </p>
                  </DashboardCard>
                </div>

                {/* 2. Specialized MBR "Next Filing" & "What we need from you" Box */}
                <DashboardCard className="grid grid-cols-1 md:grid-cols-2 rounded-0 overflow-hidden p-0">
                  {/* Left Side: Next Filing */}
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
                          {mbrActiveFiling
                            ? `${mbrActiveFiling.filing_type} ${mbrActiveFiling.reference_period}`
                            : "No active filing"}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <p className="text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">
                        Current status
                      </p>
                      {mbrActiveFiling && (
                        <Badge
                          className={cn(
                            "rounded-0 border px-3 py-1 text-xs font-semibold uppercase tracking-widest bg-transparent w-fit block",
                            mbrActiveFiling.filing_status === "waiting_on_you"
                              ? "text-orange-500 border-orange-500/20"
                              : mbrActiveFiling.filing_status === "in_progress"
                                ? "text-blue-500 border-blue-500/20"
                                : mbrActiveFiling.filing_status === "submitted"
                                  ? "text-purple-500 border-purple-500/20"
                                  : "text-green-500 border-green-500/20",
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
                      )}
                    </div>
                  </div>

                  {/* Right Side: What we need from you */}
                  <div className="p-8 bg-gray-50/30 flex flex-col justify-between">
                    <div className="space-y-3">
                      <p className="text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">
                        What we need from you
                      </p>
                      {mbrActiveFiling?.filing_status === "waiting_on_you" ? (
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
                      ) : (
                        <div className="flex items-center gap-3 text-emerald-600 bg-emerald-50 p-4 border border-emerald-100/50">
                          <CheckCircle2 className="w-5 h-5 shrink-0" />
                          <p className="font-medium">
                            Nothing required from you right now.
                          </p>
                        </div>
                      )}
                    </div>

                    {mbrActiveFiling?.filing_status === "waiting_on_you" && (
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
                      </div>
                    )}
                  </div>
                </DashboardCard>

                {/* 3. Current Filing Action Card (New Refined UI) */}
                <DashboardCard className="p-0 rounded-0 overflow-hidden border-gray-100">
                  <div className="p-8 space-y-8">
                    <div className="flex items-center gap-3">
                      <div className="w-1 h-6 bg-primary rounded-full" />
                      <h3 className="text-xl font-bold text-gray-900 tracking-tight">
                        Current Filing
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div className="space-y-2">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                          Filing Name
                        </p>
                        <p className="text-sm font-bold text-gray-900">
                          {mbrActiveFiling ? `${mbrActiveFiling.filing_type} ${mbrActiveFiling.reference_period}` : "No active filing"}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                          Due Date
                        </p>
                        <p className="text-sm font-bold text-gray-900">
                          {mbrActiveFiling ? new Date(mbrActiveFiling.due_date).toLocaleDateString("en-GB", { day: 'numeric', month: 'short', year: 'numeric' }) : "—"}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                          Status
                        </p>
                        <p className="text-sm font-bold text-gray-900">
                          {mbrActiveFiling?.filing_status === "waiting_on_you" ? "Action needed from you" :
                            mbrActiveFiling?.filing_status === "in_progress" ? "We are working on this" :
                              mbrActiveFiling?.filing_status === "submitted" ? "Submitted to MBR" :
                                mbrActiveFiling?.filing_status === "completed" ? "Filed & completed" : "—"}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <Button className="h-10 px-6 rounded-0 font-bold bg-[#0f1729] text-white hover:bg-[#0f1729]/90 text-xs gap-3">
                        <Upload className="w-4 h-4" />
                        Upload
                      </Button>
                      <Button
                        variant="outline"
                        className="h-10 px-6 rounded-0 font-bold border-gray-200 text-gray-700 hover:bg-gray-50 text-xs gap-3 shadow-sm"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Confirm details
                      </Button>
                    </div>
                  </div>
                  <div className="px-8 py-4 bg-gray-50/50 border-t border-gray-100">
                    <p className="text-xs text-gray-500">
                      We prepare and submit statutory filings on your behalf.
                    </p>
                  </div>
                </DashboardCard>

                {/* 3. Filing Details - Collapsible */}
                <DashboardCard className="p-0 rounded-0 overflow-hidden border-gray-100">
                  <button
                    onClick={() => setMbrReferenceExpanded(!mbrReferenceExpanded)}
                    className="w-full p-8 flex items-center justify-between text-left hover:bg-gray-50/50 transition-colors"
                  >
                    <h3 className="text-xl font-bold text-gray-900 tracking-tight">
                      Filing Details — {mbrActiveFiling?.filing_type} {mbrActiveFiling?.reference_period}
                    </h3>
                    {mbrReferenceExpanded ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </button>

                  {mbrReferenceExpanded && (
                    <div className="p-8 pt-0 space-y-8 animate-in slide-in-from-top-2 duration-200 border-t border-gray-50">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                        <div className="space-y-2">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            Filing Type
                          </p>
                          <p className="text-sm font-bold text-gray-900">
                            {mbrActiveFiling?.filing_type || "—"}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            Reference Year / Period
                          </p>
                          <p className="text-sm font-bold text-gray-900">
                            {mbrActiveFiling?.reference_period || "—"}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            Submitted Date
                          </p>
                          <p className="text-sm font-bold text-gray-900">
                            {mbrActiveFiling?.submitted_at ? new Date(mbrActiveFiling.submitted_at).toLocaleDateString("en-GB") : "—"}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            Receipt / Acknowledgement
                          </p>
                          <p className="text-sm font-bold text-gray-900">
                            —
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </DashboardCard>
              </>
            ) : (
              /* GENERIC DASHBOARD (FOR ALL OTHER SERVICES) */
              <>
                {/* SECTION 1: Service Overview Summary */}
                <DashboardCard className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <p className="text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">
                        Current Period
                      </p>
                      <p className="text-sm font-semibold text-gray-900">
                        {isBankingPayments ? engagementData?.currentPeriod : cycle}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">
                        Overall Status
                      </p>
                      <Badge
                        className={cn(
                          "rounded-0 border px-2 py-0.5 text-xs font-semibold uppercase tracking-widest bg-transparent w-fit",
                          isBankingPayments ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : statusInfo.color,
                        )}
                      >
                        {isBankingPayments ? "ON TRACK (HANDLED BY US)" : statusInfo.label}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">
                        Last Update
                      </p>
                      <p className="text-sm font-semibold text-gray-900">
                        {isBankingPayments ? engagementData?.lastUpdate : new Date().toLocaleDateString("en-US", {
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
                        {(isBankingPayments || isRegulatedLicenses) ? engagementData?.nextStep : (workflowStatus === "waiting"
                          ? "Action needed from you"
                          : workflowStatus === "in_progress"
                            ? `Processing ${cycle} records`
                            : workflowStatus === "submitted"
                              ? "Submitted to authority"
                              : "Completed")}
                      </p>
                    </div>
                  </div>
                </DashboardCard>

                {/* Specialized Layout for Banking & Payments */}
                {isBankingPayments ? (
                  <div className="space-y-8">
                    {/* ROW 1: Current Cycle & Required Actions */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* 1.1 Current cycle / period card */}
                      <DashboardCard className="p-8 flex items-center justify-between">
                        <div className="space-y-2">
                          <p className="text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">
                            Current cycle/period
                          </p>
                          <div className="flex items-center gap-3 text-gray-900">
                            <div className="w-10 h-10 rounded-0 bg-primary/5 flex items-center justify-center border border-primary/10">
                              <Calendar className="w-5 h-5 text-primary" />
                            </div>
                            <span className="text-lg font-medium">{engagementData?.currentPeriod}</span>
                          </div>
                        </div>
                        <div className="space-y-3 text-right">
                          <p className="text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">
                            Current status
                          </p>
                          <Badge
                            className="rounded-0 border px-3 py-1 text-xs font-semibold uppercase tracking-widest bg-emerald-50 text-emerald-600 border-emerald-500/20 w-fit block"
                          >
                            ON TRACK
                          </Badge>
                        </div>
                      </DashboardCard>

                      {/* 1.2 What we need from you */}
                      <DashboardCard className="p-8 bg-gray-50/30 flex flex-col justify-center">
                        <div className="space-y-4">
                          <p className="text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">
                            What we need from you
                          </p>
                          {engagementData?.actionNeeded ? (
                            <div className="flex items-center justify-between gap-6">
                              <div className="flex gap-4">
                                <div className="w-1.5 h-auto bg-primary/20 rounded-full" />
                                <div className="space-y-1">
                                  <p className="text-gray-900 font-bold leading-tight text-lg">
                                    {engagementData.actionNeeded.title}
                                  </p>
                                  <p className="text-gray-500 text-xs">
                                    {engagementData.actionNeeded.description}
                                  </p>
                                </div>
                              </div>
                              <Button className="h-10 rounded-0 font-bold uppercase tracking-widest text-[10px] px-6 shadow-lg shadow-primary/20 shrink-0">
                                {engagementData.actionNeeded.ctaLabel}
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-3 text-emerald-600 bg-emerald-50 p-4 border border-emerald-100/50">
                              <CheckCircle2 className="w-5 h-5 shrink-0" />
                              <p className="font-medium text-sm">Nothing required from you right now.</p>
                            </div>
                          )}
                        </div>
                      </DashboardCard>
                    </div>

                    {/* ROW 2: Payments Snapshot (Full Width) */}
                    <DashboardCard className="p-8">
                      <div className="space-y-6">
                        <div className="flex items-center gap-3">
                          <div className="w-1 h-6 bg-gray-900 rounded-full" />
                          <h3 className="text-lg font-medium tracking-tight">Payments Snapshot</h3>
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                          {[
                            { label: "Pending approval", count: (engagementData?.payments || []).filter((p: any) => p.status === "Pending Approval").length, color: "orange" },
                            { label: "Scheduled", count: (engagementData?.payments || []).filter((p: any) => p.status === "Scheduled").length, color: "blue" },
                            { label: "Executed", count: (engagementData?.payments || []).filter((p: any) => p.status === "Executed").length, color: "emerald" },
                            { label: "Failed", count: (engagementData?.payments || []).filter((p: any) => p.status === "Failed").length, color: "red" },
                          ].map((item) => (
                            <DashboardCard key={item.label} className="p-5 rounded-lg border border-gray-100 bg-gray-50/30 flex flex-col items-center justify-center text-center">
                              <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest mb-1">{item.label}</p>
                              <p className={cn("text-3xl font-semibold", `text-${item.color}-600`)}>{item.count}</p>
                            </DashboardCard>
                          ))}
                        </div>
                      </div>
                    </DashboardCard>

                    {/* ROW 3: Operations (Side-by-side) */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* 3.1 Recent Activity */}
                      <DashboardCard className="p-6">
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="w-1 h-6 bg-gray-900 rounded-full" />
                            <h3 className="text-lg font-medium tracking-tight">Recent Activity</h3>
                          </div>
                          <div className="space-y-3">
                            {(engagementData?.recentActivity || []).map((item: any, idx: number) => (
                              <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                                <div className="flex items-center gap-3">
                                  <div className="w-2 h-2 rounded-full bg-primary" />
                                  <span className="text-sm text-gray-900">{item.action}</span>
                                </div>
                                <span className="text-xs text-gray-500">{item.date}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </DashboardCard>

                      {/* 3.2 Banking Overview */}
                      <DashboardCard className="p-6">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-1 h-6 bg-gray-900 rounded-full" />
                              <h3 className="text-lg font-medium tracking-tight">Banking Overview</h3>
                            </div>
                            <Button variant="outline" size="sm" className="text-[10px] h-7 uppercase tracking-wider font-bold">
                              Add Account
                            </Button>
                          </div>
                          <div className="space-y-2">
                            {(engagementData?.bankAccounts || []).map((acc: any, idx: number) => (
                              <div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-gray-50/50">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100">
                                    <Building2 className="w-4 h-4 text-blue-600" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-semibold text-gray-900">{acc.institution}</p>
                                    <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">{acc.accountNo} • {acc.currency}</p>
                                  </div>
                                </div>
                                <Badge className="rounded-0 border px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest bg-transparent text-emerald-600 border-emerald-500/10">
                                  {acc.status}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      </DashboardCard>
                    </div>

                    {/* ROW 4: Documents (Full Width) */}
                    <DashboardCard className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-1 h-6 bg-gray-900 rounded-full" />
                            <h3 className="text-lg font-medium tracking-tight">Quick Access Documents</h3>
                          </div>
                        </div>
                        <div className="flex flex-col gap-3">
                          {(engagementData?.quickAccessDocs || []).map((doc: any, idx: number) => (
                            <div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition-colors">
                              <div className="flex items-center gap-3 flex-1">
                                <FileText className="w-4 h-4 text-gray-400" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">{doc.name}</p>
                                  <p className="text-xs text-gray-500">{doc.date}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm" className="h-8 px-3 text-xs">View</Button>
                                <Button variant="ghost" size="sm" className="h-8 px-3 text-xs">Download</Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </DashboardCard>
                  </div>

                ) : isInternationalStructuring ? (
                  <div className="space-y-8">




                    {/* ROW 1: Current Cycle + Required Actions */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* 1.1 Current cycle / period card */}
                      <DashboardCard className="p-8 flex items-center justify-between">
                        <div className="space-y-2">
                          <p className="text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">
                            Current cycle/period
                          </p>
                          <div className="flex items-center gap-3 text-gray-900">
                            <div className="w-10 h-10 rounded-0 bg-primary/5 flex items-center justify-center border border-primary/10">
                              <Calendar className="w-5 h-5 text-primary" />
                            </div>
                            <span className="text-lg font-medium">{engagementData?.currentPeriod}</span>
                          </div>
                        </div>
                        <div className="space-y-3 text-right">
                          <p className="text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">
                            Current status
                          </p>
                          <Badge
                            className="rounded-0 border px-3 py-1 text-xs font-semibold uppercase tracking-widest bg-emerald-50 text-emerald-600 border-emerald-500/20 w-fit block"
                          >
                            ON TRACK
                          </Badge>
                        </div>
                      </DashboardCard>

                      {/* 1.2 What we need from you */}
                      <DashboardCard className="p-8 bg-gray-50/30 flex flex-col justify-center">
                        <div className="space-y-4">
                          <p className="text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">
                            What we need from you
                          </p>
                          {engagementData?.actionNeeded ? (
                            <div className="flex items-center justify-between gap-6">
                              <div className="flex gap-4">
                                <div className="w-1.5 h-auto bg-primary/20 rounded-full" />
                                <div className="space-y-1">
                                  <p className="text-gray-900 font-bold leading-tight text-lg">
                                    {engagementData.actionNeeded.title}
                                  </p>
                                  <p className="text-gray-500 text-xs">
                                    {engagementData.actionNeeded.description}
                                  </p>
                                </div>
                              </div>
                              <Button className="h-10 rounded-0 font-bold uppercase tracking-widest text-[10px] px-6 shadow-lg shadow-primary/20 shrink-0">
                                {engagementData.actionNeeded.ctaLabel}
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-3 text-emerald-600 bg-emerald-50 p-4 border border-emerald-100/50">
                              <CheckCircle2 className="w-5 h-5 shrink-0" />
                              <p className="font-medium text-sm">Nothing required from you right now.</p>
                            </div>
                          )}
                        </div>
                      </DashboardCard>
                    </div>

                    {/* ROW 2: Structure Summary */}
                    <DashboardCard className="p-8">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-1 h-6 bg-gray-900 rounded-full" />
                          <h3 className="text-lg font-medium tracking-tight">
                            Group Structure Overview
                          </h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-[10px] uppercase text-gray-400 pb-1">Entities</p>
                            <p className="text-xl font-bold">{engagementData?.entities || 6}</p>
                          </div>

                          <div>
                            <p className="text-[10px] uppercase text-gray-400 pb-1">Jurisdictions</p>
                            <p className="text-xl font-bold">{engagementData?.jurisdictions || 4}</p>
                          </div>

                          <div>
                            <p className="text-[10px] uppercase text-gray-400 pb-1">Status</p>
                            <Badge>{engagementData?.structureStatus || "Implementation"}</Badge>
                          </div>

                          <div>
                            <p className="text-[10px] uppercase text-gray-400 pb-1">Risk Level</p>
                            <Badge variant="outline">Medium</Badge>
                          </div>
                        </div>
                      </div>
                    </DashboardCard>

                    {/* ROW 3: Recent Activity */}
                    <DashboardCard className="p-8">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-1 h-6 bg-gray-900 rounded-full" />
                          <h3 className="text-lg font-medium tracking-tight">
                            Recent Structuring Activity
                          </h3>
                        </div>

                        {(engagementData?.recentActivity || []).map((a: any, i: number) => (
                          <div
                            key={i}
                            className="flex justify-between text-sm border-b py-2"
                          >
                            <span>{a.action}</span>
                            <span className="text-gray-400">{a.date}</span>
                          </div>
                        ))}
                      </div>
                    </DashboardCard>

                  </div>

                ) : isCryptoAssets ? (
                  <div className="space-y-8">




                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* 1.1 Current cycle / period card */}
                      <DashboardCard className="p-8 flex items-center justify-between">
                        <div className="space-y-2">
                          <p className="text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">
                            Current cycle/period
                          </p>
                          <div className="flex items-center gap-3 text-gray-900">
                            <div className="w-10 h-10 rounded-0 bg-primary/5 flex items-center justify-center border border-primary/10">
                              <Calendar className="w-5 h-5 text-primary" />
                            </div>
                            <span className="text-lg font-medium">{engagementData?.currentPeriod}</span>
                          </div>
                        </div>
                        <div className="space-y-3 text-right">
                          <p className="text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">
                            Current status
                          </p>
                          <Badge
                            className="rounded-0 border px-3 py-1 text-xs font-semibold uppercase tracking-widest bg-emerald-50 text-emerald-600 border-emerald-500/20 w-fit block"
                          >
                            ON TRACK
                          </Badge>
                        </div>
                      </DashboardCard>

                      {/* 1.2 What we need from you */}
                      <DashboardCard className="p-8 bg-gray-50/30 flex flex-col justify-center">
                        <div className="space-y-4">
                          <p className="text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">
                            What we need from you
                          </p>
                          {engagementData?.actionNeeded ? (
                            <div className="flex items-center justify-between gap-6">
                              <div className="flex gap-4">
                                <div className="w-1.5 h-auto bg-primary/20 rounded-full" />
                                <div className="space-y-1">
                                  <p className="text-gray-900 font-bold leading-tight text-lg">
                                    {engagementData.actionNeeded.title}
                                  </p>
                                  <p className="text-gray-500 text-xs">
                                    {engagementData.actionNeeded.description}
                                  </p>
                                </div>
                              </div>
                              <Button className="h-10 rounded-0 font-bold uppercase tracking-widest text-[10px] px-6 shadow-lg shadow-primary/20 shrink-0">
                                {engagementData.actionNeeded.ctaLabel}
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-3 text-emerald-600 bg-emerald-50 p-4 border border-emerald-100/50">
                              <CheckCircle2 className="w-5 h-5 shrink-0" />
                              <p className="font-medium text-sm">Nothing required from you right now.</p>
                            </div>
                          )}
                        </div>
                      </DashboardCard>
                    </div>

                    {/* ROW 2: Portfolio Summary */}
                    <DashboardCard className="p-8">

                      <div className="space-y-4">

                        <div className="flex items-center gap-3">
                          <div className="w-1 h-6 bg-gray-900 rounded-full" />
                          <h3 className="text-lg font-medium tracking-tight">
                            Crypto Exposure Overview
                          </h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                          {/* Exposure Type */}
                          <div>
                            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em] pb-1">
                              Exposure Type
                            </p>
                            <p className="text-md font-bold text-gray-900">
                              {engagementData?.exposureType || "Business"}
                            </p>
                          </div>

                          {/* Nature of Activity */}
                          <div>
                            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em] pb-1">
                              Activity Nature
                            </p>
                            <p className="text-md font-bold text-gray-900">
                              {engagementData?.activityNature || "Trading & Holding"}
                            </p>
                          </div>

                          {/* Structuring Status */}
                          <div>
                            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em] pb-1">
                              Structuring Status
                            </p>
                            <Badge className="bg-orange-100 text-orange-600">
                              {engagementData?.cryptoStatus || "Under Review"}
                            </Badge>
                          </div>

                        </div>

                      </div>

                    </DashboardCard>


                    {/* ROW 3: Activity */}
                    <DashboardCard className="p-8">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-1 h-6 bg-gray-900 rounded-full" />
                          <h3 className="text-lg font-medium tracking-tight">
                            Crypto Compliance Activity
                          </h3>
                        </div>

                        {(engagementData?.recentActivity || []).map((a: any, i: number) => (
                          <div
                            key={i}
                            className="flex justify-between text-sm border-b py-2"
                          >
                            <span>{a.action}</span>
                            <span className="text-gray-400">{a.date}</span>
                          </div>
                        ))}
                      </div>
                    </DashboardCard>

                  </div>


                ) : isRegulatedLicenses ? (
                  <div className="space-y-8">
                    {/* ROW 1: Active License Cases */}
                    <DashboardCard className="p-8">
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-1 h-6 bg-gray-900 rounded-full" />
                            <h3 className="text-lg font-medium tracking-tight">Active License Cases</h3>
                          </div>
                          <Button variant="outline" size="sm" className="text-[10px] font-bold uppercase tracking-widest rounded-0">
                            New Application
                          </Button>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-gray-100">
                                <th className="text-left py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-widest">License Type</th>
                                <th className="text-left py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-widest">Regulator</th>
                                <th className="text-left py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-widest">Case Type</th>
                                <th className="text-left py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-widest">Status</th>
                                <th className="text-left py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-widest">Target Date</th>
                                <th className="text-right py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-widest">Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {(engagementData?.licenseCases || []).map((c: any) => (
                                <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                  <td className="py-4 px-4 font-bold text-gray-900">{c.licenseType}</td>
                                  <td className="py-4 px-4 text-gray-600 font-medium">{c.regulator}</td>
                                  <td className="py-4 px-4 text-gray-500">{c.caseType}</td>
                                  <td className="py-4 px-4">
                                    <Badge variant="outline" className="rounded-0 text-[10px] font-bold uppercase tracking-tighter bg-blue-50 text-blue-600 border-blue-100 font-medium">
                                      {c.status}
                                    </Badge>
                                  </td>
                                  <td className="py-4 px-4 text-gray-600">{c.targetDate}</td>
                                  <td className="py-4 px-4 text-right">
                                    <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800 text-[10px] font-bold uppercase tracking-widest p-0">
                                      View Details
                                    </Button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </DashboardCard>

                    {/* ROW 2: What we need from you & Recent Activity */}
                    <div className="space-y-8">
                      {/* 2.1 What we need from you (Priority-based) */}
                      <DashboardCard className="p-8 border-blue-100 flex flex-col justify-center">
                        <div className="space-y-6">
                          <div className="flex items-center gap-3">
                            <div className="w-1 h-6 bg-black rounded-full" />
                            <h3 className="text-lg font-medium tracking-tight">What we need from you</h3>
                          </div>
                          {engagementData?.actionNeeded ? (
                            <div className="space-y-6">
                              <div className="p-4 bg-white border border-blue-100/50 shadow-sm">
                                <p className="text-lg font-bold mb-2">{engagementData.actionNeeded.title}</p>
                                <p className="text-sm leading-relaxed font-medium">
                                  {engagementData.actionNeeded.description}
                                </p>
                              </div>
                              <Button className="h-12 rounded-0 font-bold uppercase tracking-[0.2em] text-xs shadow-lg shadow-blue-500/20">
                                {engagementData.actionNeeded.ctaLabel}
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-3 text-emerald-600 bg-emerald-50 p-4 border border-emerald-100/50">
                              <CheckCircle2 className="w-5 h-5 shrink-0" />
                              <p className="font-medium text-sm">Nothing required from you right now.</p>
                            </div>
                          )}
                        </div>
                      </DashboardCard>


                    </div>


                  </div>
                ) : (
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
                              {action.type === "upload" && <Upload className="w-4 h-4" />}
                              {action.type === "confirm" && <CheckCircle2 className="w-4 h-4" />}
                              {action.type === "schedule" && <Phone className="w-4 h-4" />}
                              {action.label}
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                  </DashboardCard>
                )}


                {/* Payments Table (Dashboard MVP) */}
                {isBankingPayments && (
                  <DashboardCard className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-1 h-6 bg-gray-900 rounded-full" />
                        <h3 className="text-lg font-medium tracking-tight">Current Payments</h3>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-gray-200">
                              <th className="text-left py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em] bg-gray-50/50">Beneficiary</th>
                              <th className="text-left py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em] bg-gray-50/50">Amount</th>
                              <th className="text-left py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em] bg-gray-50/50">Execution Date</th>
                              <th className="text-left py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em] bg-gray-50/50">Status</th>
                              <th className="text-right py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em] bg-gray-50/50">Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(engagementData?.payments || []).map((p: any) => (
                              <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                <td className="py-3 px-4 font-medium text-gray-900">{p.beneficiary}</td>
                                <td className="py-3 px-4 text-gray-900 font-bold">{p.amount}</td>
                                <td className="py-3 px-4 text-gray-600">{p.date}</td>
                                <td className="py-3 px-4">
                                  <Badge
                                    className={cn(
                                      "rounded-0 border px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest bg-transparent",
                                      p.status === "Executed" && "text-emerald-500 border-emerald-500/10",
                                      p.status === "Pending Approval" && "text-orange-500 border-orange-500/10",
                                      p.status === "Scheduled" && "text-blue-500 border-blue-500/10",
                                      p.status === "Failed" && "text-red-500 border-red-500/10"
                                    )}
                                  >
                                    {p.status}
                                  </Badge>
                                </td>
                                <td className="py-3 px-4 text-right">
                                  {p.status === "Pending Approval" ? (
                                    <Button size="sm" className="h-8 px-4 text-[10px] uppercase tracking-widest font-bold">
                                      Approve
                                    </Button>
                                  ) : (
                                    <Button variant="ghost" size="sm" className="h-8 px-4 text-[10px] uppercase tracking-widest font-bold text-blue-600">
                                      View
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

                {/* SECTION 2: Recent Activity Feed */}
                {!isBankingPayments && (
                  <DashboardCard className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-1 h-6 bg-gray-900 rounded-full" />
                        <h3 className="text-lg font-medium tracking-tight">
                          Recent Activity
                        </h3>
                      </div>
                      <div className="space-y-3">
                        {(engagementData?.recentActivity || [
                          { action: "Bank statements uploaded", date: "Jan 10" },
                          { action: "VAT return submitted", date: "Jan 20" },
                          { action: "Payroll processed", date: "Jan 25" },
                        ])
                          .slice(0, serviceName === "Payroll" ? 5 : 3)
                          .map((item: any, idx: number) => (
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
                )}

                {/* SECTION 3: Quick Access Documents */}
                {!isBankingPayments && (
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
                      ) : (engagementData?.quickAccessDocs?.length > 0 || recentDocuments.length > 0) ? (
                        <div className="space-y-2">
                          {(engagementData?.quickAccessDocs?.length > 0 ? engagementData.quickAccessDocs : recentDocuments).map((doc: any, idx: number) => (
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
                                <Button variant="ghost" size="sm" className="h-8 px-3 text-xs">
                                  <Eye className="w-3 h-3 mr-1" />
                                  View
                                </Button>
                                <Button variant="ghost" size="sm" className="h-8 px-3 text-xs">
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
                )}
              </>
            )}


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
                          ?.amount || engagementData?.financialStatements?.revenue || "—"}
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
                        {(stats.find((s) => s.title?.includes("Expense"))
                          ?.amount || engagementData?.financialStatements?.expenses || "—")}
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
                          engagementData?.financialStatements?.netIncome || "—"}
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
                    {(engagementData?.auditProgress || [
                      { step: "Planning", status: "completed" },
                      { step: "Fieldwork", status: "in_progress" },
                      { step: "Review", status: "pending" },
                      { step: "Final Report", status: "pending" },
                    ]).map((item: any, idx: number) => (
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
                      {/* <Badge className="mt-1 rounded-0 border px-2 py-0.5 text-xs font-semibold uppercase tracking-widest bg-transparent text-gray-700 border-gray-200">
                        {vatActivePeriod.filing_status === "waiting_on_you" &&
                          "Waiting on you"}
                        {vatActivePeriod.filing_status === "in_progress" &&
                          "In progress"}
                        {vatActivePeriod.filing_status === "submitted" &&
                          "Submitted"}
                        {vatActivePeriod.filing_status === "completed" &&
                          "Completed"}
                      </Badge> */}
                      <Badge className="mt-1 rounded-0 border px-2 py-0.5 text-xs font-semibold uppercase tracking-widest bg-transparent text-gray-700 border-gray-200">
                        In Progress
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
                            Service / Role
                          </th>
                          <th className="text-left py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">
                            Holder / Provider
                          </th>
                          <th className="text-left py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">
                            Status
                          </th>
                          <th className="text-left py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">
                            Start Date
                          </th>
                          <th className="text-left py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">
                            Expiry Date
                          </th>
                          <th className="text-left py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">
                            Service Status
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
                        {(engagementData?.corporateServicesStatus || []).map((row: any, idx: number) => (
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
                              <Badge
                                className={cn(
                                  "rounded-0 border px-2 py-0.5 text-xs font-semibold uppercase tracking-widest bg-transparent",
                                  (row.status === "Active") &&
                                  "text-emerald-500 border-emerald-500/20",
                                  (row.status === "Action required") &&
                                  "text-red-500 border-red-500/20",
                                )}
                              >
                                {row.status}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 text-gray-600">
                              {row.startDate ? new Date(row.startDate).toLocaleDateString("en-GB", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              }) : "—"}
                            </td>
                            <td className="py-3 px-4 text-gray-600">
                              {row.expiry ? new Date(row.expiry).toLocaleDateString("en-GB", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              }) : "—"}
                            </td>
                            <td className="py-3 px-4">
                              <Badge
                                variant="outline"
                                className={cn(
                                  "text-xs font-bold uppercase tracking-wider rounded-0",
                                  (row.service_status === "Action required") ? "text-red-600 border-red-100" :
                                    (row.service_status === "Due soon") ? "text-orange-600 border-orange-100" : "text-emerald-600 border-emerald-100"
                                )}
                              >
                                {row.service_status}
                              </Badge>
                            </td>
                            <td className="py-3 px-4">
                              {row.documents && row.documents.length > 0 ? (
                                <div className="flex gap-2">
                                  {row.documents.map((d: string, i: number) => (
                                    <button key={i} className="text-blue-600 hover:underline text-[10px] font-medium">{d}</button>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-gray-400 text-xs">—</span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs text-blue-600 hover:text-blue-800 p-0 h-auto font-medium"
                                onClick={() => {
                                  // Logic for opening service details
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
                      <p className="text-2xl font-bold text-gray-900">
                        {engagementData?.payrollOverview?.totalEmployees || 12}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg border border-gray-100 bg-white">
                      <div className="flex items-center gap-3 mb-2">
                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                        <p className="text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">
                          Active This Period
                        </p>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">
                        {engagementData?.payrollOverview?.activeThisPeriod || 12}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg border border-gray-100 bg-white">
                      <div className="flex items-center gap-3 mb-2">
                        <Clock className="w-5 h-5 text-orange-500" />
                        <p className="text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">
                          Pending Changes
                        </p>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">
                        {engagementData?.payrollOverview?.pendingChanges || 0}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-[0.2em] mb-2">
                      Recent Employees
                    </p>
                    {(engagementData?.payrollOverview?.recentEmployees || [
                      { name: "John Smith", role: "Manager", status: "Active" },
                      { name: "Jane Doe", role: "Developer", status: "Active" },
                      {
                        name: "Mike Johnson",
                        role: "Designer",
                        status: "Active",
                      },
                    ]).map((emp: any, idx: number) => (
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
                        CFO Filing Data
                      </h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">
                              Service
                            </th>
                            <th className="text-left py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">
                              Frequency
                            </th>
                            <th className="text-left py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">
                              Current Period
                            </th>
                            <th className="text-left py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">
                              Status
                            </th>
                            <th className="text-left py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">
                              Next Deliverable
                            </th>
                            <th className="text-left py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">
                              Service Status
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
                          {(engagementData?.cfoFilings || []).map((f: any, idx: number) => (
                            <tr
                              key={idx}
                              className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                            >
                              <td className="py-3 px-4 font-medium text-gray-900">
                                {f.service}
                              </td>
                              <td className="py-3 px-4 text-gray-600">
                                {f.frequency}
                              </td>
                              <td className="py-3 px-4 text-gray-600">
                                {f.currentPeriod}
                              </td>
                              <td className="py-3 px-4">
                                <Badge
                                  className={cn(
                                    "rounded-0 border px-2 py-0.5 text-xs font-semibold uppercase tracking-widest bg-transparent",
                                    (f.status === "Completed") &&
                                    "text-emerald-500 border-emerald-500/20",
                                    (f.status === "In progress") &&
                                    "text-blue-500 border-blue-500/20",
                                    (f.status === "Waiting on you") &&
                                    "text-orange-500 border-orange-500/20",
                                    (f.status === "Scheduled") &&
                                    "text-purple-500 border-purple-500/20",
                                  )}
                                >
                                  {f.status}
                                </Badge>
                              </td>
                              <td className="py-3 px-4 text-gray-600">
                                {f.nextDeliverable}
                              </td>
                              <td className="py-3 px-4">
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    "text-xs font-bold uppercase tracking-wider rounded-0",
                                    (f.service_status === "Action required") ? "text-red-600 border-red-100" :
                                      (f.service_status === "Due soon") ? "text-orange-600 border-orange-100" : "text-emerald-600 border-emerald-100"
                                  )}
                                >
                                  {f.service_status}
                                </Badge>
                              </td>
                              <td className="py-3 px-4">
                                {f.documents && f.documents.length > 0 ? (
                                  <div className="flex gap-2">
                                    {f.documents.map((d: string, i: number) => (
                                      <button key={i} className="text-blue-600 hover:underline text-[10px] font-medium">{d}</button>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-gray-400 text-xs">—</span>
                                )}
                              </td>
                              <td className="py-3 px-4 text-right">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-xs text-blue-600 hover:text-blue-800 p-0 h-auto font-medium"
                                  onClick={() => {
                                    setActiveTab("cfo_filings");
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

                <DashboardCard className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-1 h-6 bg-gray-900 rounded-full" />
                      <h3 className="text-lg font-medium tracking-tight">
                        Recent Activity Feed
                      </h3>
                    </div>
                    <div className="space-y-3">
                      {(engagementData?.recentActivity || [
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
                      ]).map((item: any, idx: number) => (
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

                {engagementData?.filings?.length > 0 && (
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
                              {engagementData.filings.some((f: any) => f.reference || f.year) && (
                                <th className="text-left py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">
                                  Year/Reference
                                </th>
                              )}
                              {engagementData.filings.some((f: any) => f.filing_type || f.type) && (
                                <th className="text-left py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">
                                  Filing type
                                </th>
                              )}
                              {engagementData.filings.some((f: any) => f.filing_status || f.status) && (
                                <th className="text-left py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">
                                  Status
                                </th>
                              )}
                              {engagementData.filings.some((f: any) => f.submitted_at || f.date || f.due_date) && (
                                <th className="text-left py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">
                                  Submission date
                                </th>
                              )}
                            </tr>
                          </thead>
                          <tbody>
                            {engagementData.filings.map((row: any, idx: number) => (
                              <tr
                                key={idx}
                                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                              >
                                {engagementData.filings.some((f: any) => f.reference || f.year) && (
                                  <td className="py-3 px-4 font-medium text-gray-900">
                                    {row.reference || row.year}
                                  </td>
                                )}
                                {engagementData.filings.some((f: any) => f.filing_type || f.type) && (
                                  <td className="py-3 px-4 text-gray-600">
                                    {row.filing_type || row.type}
                                  </td>
                                )}
                                {engagementData.filings.some((f: any) => f.filing_status || f.status) && (
                                  <td className="py-3 px-4">
                                    <Badge className="rounded-0 border px-2 py-0.5 text-xs font-semibold uppercase tracking-widest bg-transparent text-gray-700 border-gray-200">
                                      {row.filing_status || row.status}
                                    </Badge>
                                  </td>
                                )}
                                {engagementData.filings.some((f: any) => f.submitted_at || f.date || f.due_date) && (
                                  <td className="py-3 px-4 text-gray-600">
                                    {typeof (row.submitted_at || row.date || row.due_date) === 'object'
                                      ? (row.submitted_at?.date || row.due_date?.date || "—")
                                      : (row.submitted_at || row.date || row.due_date || "—")}
                                  </td>
                                )}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </DashboardCard>
                )}
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
                      {(engagementData?.incorporationProgress || [
                        { step: "Name approval", status: "completed" as const },
                        { step: "Documentation", status: "in_progress" as const },
                        { step: "Registration", status: "pending" as const },
                        { step: "Completion", status: "pending" as const },
                      ]).map((item: any, idx: number) => (
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
                      {(engagementData?.documentRequests?.slice(0, 3) || [
                        { title: "ID document(s)", status: "Received" },
                        { title: "Proof of address", status: "Pending" },
                        {
                          title: "Draft memorandum & articles",
                          status: "Pending",
                        },
                      ]).map((doc: any, idx: number) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-gray-50/50"
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="w-4 h-4 text-gray-400" />
                            <p className="text-sm font-medium text-gray-900">
                              {doc.title || doc.name}
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
                        { label: "Company name", value: engagementData?.summaryData?.companyName || "—" },
                        { label: "Registration number", value: engagementData?.summaryData?.registrationNumber || "—" },
                        { label: "Incorporation date", value: engagementData?.summaryData?.incorporationDate || "—" },
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
                    <Badge className={cn(
                      "rounded-0 border px-2 py-0.5 text-xs font-semibold uppercase tracking-widest bg-transparent w-fit",
                      workflowStatus === 'completed' ? "text-emerald-600 border-emerald-200" : "text-orange-600 border-orange-200"
                    )}>
                      {workflowStatus === 'completed' ? 'Finalized' : 'Draft'}
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
                      {(engagementData?.businessPlanMilestones || [
                        { label: "Research", status: "Completed" },
                        { label: "Draft", status: "In progress" },
                        { label: "Review", status: "Pending" },
                        { label: "Final submission", status: "Pending" },
                      ]).map((m: any, idx: number) => (
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
                    {recentDocuments.length > 0 ? (
                      <div className="space-y-2">
                        {recentDocuments.map((doc, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <FileText className="w-4 h-4 text-gray-400" />
                              <p className="text-sm font-medium text-gray-900">
                                {doc.name || doc.title}
                              </p>
                            </div>
                            <Badge className="rounded-0 border px-2 py-0.5 text-xs font-semibold uppercase tracking-widest bg-transparent text-gray-700 border-gray-200">
                              View
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500">
                        Documents will appear here once uploaded.
                      </div>
                    )}
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
                    <div className="space-y-4">
                      {(engagementData?.liquidationProcess || [
                        { step: "Appointment of liquidator", status: "pending" },
                        { step: "Asset review", status: "pending" },
                        { step: "Creditor notifications", status: "pending" },
                        { step: "Closure", status: "pending" },
                      ]).map((item: any, idx: number) => (
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
                    <div className="space-y-3">
                      {engagementData?.recentActivity?.length > 0 ? (
                        engagementData.recentActivity.map((activity: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between text-sm">
                            <span className="text-gray-900 font-medium">{activity.action}</span>
                            <span className="text-gray-400 text-xs">{activity.date}</span>
                          </div>
                        ))
                      ) : (
                        <div className="text-sm text-gray-500">No activity yet</div>
                      )}
                    </div>
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
                      ) : (stats.length > 0 || engagementData?.dashboardStats?.length > 0) ? (
                        (stats.length > 0 ? stats : engagementData.dashboardStats).map((stat: any) => (
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

        {activeTab === "library" && (
          <LibraryExplorer items={engagementData?.libraryItems} />
        )}

        {(activeTab === "document_requests" || activeTab === "requests") && <DocumentRequestsTab />}

        {activeTab === "milestones" && <MilestonesTab />}

        {activeTab === "compliance_calendar" && (
          <ComplianceCalendarTab serviceName={serviceName} />
        )}

        {activeTab === "filings" && isMBRFilings && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900 tracking-tight">Registry Filings</h3>
            </div>
            <div className="grid gap-4">
              {mbrFilings.map((filing: any) => (
                <DashboardCard key={filing.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h4 className="text-lg font-bold text-gray-900">{filing.filing_type}</h4>
                      {(filing.reference || filing.reference_period) && (
                        <p className="text-sm text-gray-500">Reference: {filing.reference || filing.reference_period}</p>
                      )}
                    </div>
                    <Badge className="rounded-0 border px-3 py-1 text-xs font-semibold uppercase tracking-widest bg-transparent">
                      {typeof filing.filing_status === 'object' ? filing.filing_status.label : filing.filing_status}
                    </Badge>
                  </div>
                </DashboardCard>
              ))}
            </div>
          </div>
        )}

        {activeTab === "periods" && isVAT && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900 tracking-tight">VAT Periods</h3>
            </div>
            <div className="grid gap-4">
              {vatPeriods.map((period: any) => (
                <DashboardCard key={period.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h4 className="text-lg font-bold text-gray-900">{period.period}</h4>
                      <p className="text-sm text-gray-500">Due Date: {new Date(period.due_date).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">Net Tax: €{period.net_tax?.toFixed(2) || '0.00'}</p>
                      <Badge className="rounded-0 border px-3 py-1 text-xs font-semibold uppercase tracking-widest bg-transparent mt-1">
                        {period.filing_status || period.status}
                      </Badge>
                    </div>
                  </div>
                </DashboardCard>
              ))}
            </div>
          </div>
        )}

        {(activeTab === "team" || activeTab === "Team") && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900 tracking-tight">Engagement Team</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {(engagementData?.team || []).map((member: any) => (
                <DashboardCard key={member.id} className="p-6">
                  <div className="flex items-center gap-4">
                    <img src={member.image} alt={member.name} className="w-12 h-12 rounded-full border-2 border-primary/20" />
                    <div>
                      <h4 className="font-bold text-gray-900">{member.name}</h4>
                      <p className="text-xs text-gray-500">{member.role}</p>
                      <p className="text-[10px] text-primary hover:underline cursor-pointer">{member.email}</p>
                    </div>
                  </div>
                </DashboardCard>
              ))}
            </div>
          </div>
        )}

        {activeTab === "timeline" && <MilestonesTab />}

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
                ].map((log: any, i: number) => (
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
          <ServiceMessages serviceName={serviceName} messages={engagementData?.messages || messages} />
        )}
      </div>
    </TooltipProvider>
  );
};

export default EngagementSummary;
