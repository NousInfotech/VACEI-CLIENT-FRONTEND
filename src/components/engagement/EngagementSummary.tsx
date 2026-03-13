"use client";

import React, { useEffect, useState, Suspense } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Upload,
  CheckCircle2,
  Calendar,
  LayoutDashboard,
  Library,
  BookMarked,
  ClipboardList,
  Flag,
  FileText,
  Clock,
  Circle,
  FileCheck,
  MessageSquare,
  Info,
  RefreshCw,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { SERVICE_METADATA } from "@/lib/menuData";
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
import EngagementChatTab from "./EngagementChatTab";
import ServiceMessages from "./ServiceMessages";
import { LibraryExplorer } from "../library/LibraryExplorer";
import ClientAuditTab from "./ClientAuditTab";
import DocumentRequestsTab from "./DocumentRequestsTab";
import MilestonesTab from "./MilestonesTab";
import ComplianceCalendarTab from "./ComplianceCalendarTab";
import WorkFlowSplitTab from "./WorkFlowSplitTab";
import {
  fetchDashboardSummary,
  ProcessedDashboardStat,
} from "@/api/financialReportsApi";
import { getTodos, TodoItem, updateTodoStatus } from "@/api/todoService";
import { useGlobalDashboard } from "@/context/GlobalDashboardContext";
import { useDocumentRequests } from "./hooks/useDocumentRequests";
import { useEngagementUpdates } from "./hooks/useEngagementUpdates";
import { useMilestones } from "./hooks/useMilestones";
import { HugeiconsIcon } from "@hugeicons/react";
import { Alert02Icon, Notification02Icon } from "@hugeicons/core-free-icons";
import { useSearchParams, useRouter } from "next/navigation";
import { fetchDocuments } from "@/api/documentApi";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useEngagement } from "./hooks/useEngagement";
import UpdatesTab from "./UpdatesTab";
import FilingsTab from "./FilingsTab";
import ClientBookkeepingContent from "./bookkeeping/ClientBookkeepingContent";
import { ENGAGEMENT_CONFIG } from "@/config/engagementConfig";
import EngagementDashboard from "./EngagementDashboard";

export type EngagementStatus =
  | "on_track"
  | "due_soon"
  | "due_today"
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

function formatMilestoneDate(m: any): string {
  const raw = m?.date || m?.timestamp || m?.createdAt || m?.updatedAt
  if (!raw) return ''
  const d = new Date(raw)
  if (Number.isNaN(d.getTime())) return String(raw)
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

const MilestoneIconMini = ({ status }: { status: string }) => {
  switch (status) {
    case 'completed':
      return (
        <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white border-2 border-emerald-50">
          <CheckCircle2 className="w-4 h-4" />
        </div>
      )
    case 'in_progress':
      return (
        <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white border-2 border-blue-50">
          <Clock className="w-4 h-4" />
        </div>
      )
    default:
      return (
        <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 border border-dashed border-gray-300">
          <Circle className="w-3.5 h-3.5" />
        </div>
      )
  }
}

function normalizeMilestoneStatus(input: unknown): 'completed' | 'in_progress' | 'pending' | 'skipped' {
  const s = String(input || '').toLowerCase()
  if (['completed', 'done', 'closed', 'finalized', 'achieved'].includes(s)) return 'completed'
  if (['in_progress', 'in progress', 'active', 'working'].includes(s)) return 'in_progress'
  if (['skipped', 'skip', 'cancelled', 'cancel'].includes(s)) return 'skipped'
  return 'pending'
}

interface EngagementSummaryProps {
  serviceName: string;
  serviceSlug?: string;
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
  due_today: {
    label: "Due today",
    color: "bg-amber-500/10 text-amber-500 border-amber-500/20",
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

const resolveServiceEngagementBase = (service?: string) => {
  if (!service) return "";
  const normalized = service.toUpperCase().replace(/[-\s&]/g, "_");
  const metadataKey = (Object.keys(SERVICE_METADATA).find((k) =>
    normalized === k || normalized.includes(k)
  ) || "") as keyof typeof SERVICE_METADATA | "";
  if (!metadataKey) return "";
  return SERVICE_METADATA[metadataKey]?.href || "";
};

export const ServiceTodoTable = ({
  todos,
  loading,
  onOpen,
}: {
  todos: TodoItem[];
  loading: boolean;
  onOpen?: (todo: TodoItem) => void;
}) => {
  const router = useRouter();
  const { refreshSidebar } = useGlobalDashboard();

  const handleOpen = async (todo: TodoItem) => {
    if (onOpen) {
      onOpen(todo);
      return;
    }

    const type = (todo.type || "").toUpperCase();
    const serviceBase = resolveServiceEngagementBase(todo.service);
    
    if (type === "CUSTOM") {
      router.push(`/dashboard/todo-list/todo-list-view?taskId=${btoa(todo.id)}`);
      return;
    } 

    if (
      (type === "DOCUMENT_REQUEST" || type === "REQUESTED_DOCUMENT") &&
      todo.engagementId
    ) {
      const base = serviceBase 
        ? `${serviceBase}/engagements/${todo.engagementId}` 
        : `/dashboard/engagements/${todo.engagementId}`;
      router.push(
        `${base}?tab=workFlow${
          todo.moduleId ? `&scrollTo=${todo.moduleId}` : ""
        }`
      );
    } else if (type === "CHAT" && todo.engagementId) {
      // Instant status update for chat todos
      try {
        await updateTodoStatus(todo.id, "ACTION_TAKEN");
        refreshSidebar().catch(console.error);
      } catch (e) {
        console.error("Failed to auto-update chat todo status", e);
      }

      const base = serviceBase 
        ? `${serviceBase}/engagements/${todo.engagementId}` 
        : `/dashboard/engagements/${todo.engagementId}`;
      router.push(
        `${base}?tab=chat${
          todo.moduleId ? `&messageId=${todo.moduleId}` : ""
        }`
      );
    } else if (todo.engagementId) {
      const base = serviceBase 
        ? `${serviceBase}/engagements/${todo.engagementId}` 
        : `/dashboard/engagements/${todo.engagementId}`;
      router.push(base);
    } else {
      router.push(`/dashboard/todo-list/todo-list-view?taskId=${btoa(todo.id)}`);
    }
  };
  if (loading) return <Skeleton className="h-64 w-full" />;
  if (todos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-gray-50/50 border border-dashed border-gray-200">
        <ClipboardList className="w-12 h-12 text-gray-300 mb-4" />
        <p className="text-gray-500 font-medium">No todos found for this engagement.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">Task Title</th>
            <th className="text-left py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">Status</th>
            <th className="text-left py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">Deadline</th>
            <th className="text-right py-3 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">Action</th>
          </tr>
        </thead>
        <tbody>
          {todos.map((todo) => (
            <tr key={todo.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
              <td className="py-4 px-4">
                <p className="font-medium text-gray-900">{todo.title}</p>
                <p className="text-[10px] text-gray-500 uppercase font-medium">{todo.type || 'Engagement Task'}</p>
              </td>
              <td className="py-4 px-4">
                <Badge
                  className={cn(
                    "rounded-0 border px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest bg-transparent",
                    (todo.status?.toUpperCase() === 'COMPLETED' || todo.status?.toUpperCase() === 'ACTION_TAKEN') ? "text-emerald-500 border-emerald-500/20" :
                    todo.status?.toUpperCase() === 'ACTION_REQUIRED' ? "text-amber-500 border-amber-500/20" : "text-gray-400 border-gray-200"
                  )}
                >
                  {todo.status || 'Pending'}
                </Badge>
              </td>
              <td className="py-4 px-4 text-gray-600">
                {todo.deadline && todo.status?.toUpperCase() !== 'COMPLETED' && todo.status?.toUpperCase() !== 'ACTION_TAKEN' ? new Date(todo.deadline).toLocaleDateString('en-GB') : '—'}
              </td>
              <td className="py-4 px-4 text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-blue-600 hover:text-blue-800 text-[10px] font-bold uppercase tracking-widest p-0 h-auto"
                  onClick={() => handleOpen(todo)}
                >
                  {todo.cta ? (todo.cta.charAt(0).toUpperCase() + todo.cta.slice(1)) : 'Open'}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const EngagementSummary: React.FC<EngagementSummaryProps> = ({
  serviceName,
  serviceSlug,
  description,
  status,
  cycle,
  workflowStatus,
  neededFromUser,
  actions = [],
  messages = [],
  className,
}) => {
  const router = useRouter();
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


  const isBankingPayments = serviceName === "Banking & Payments";
  const isRegulatedLicenses = serviceName === "Regulated Licenses";
  const isInternationalStructuring = serviceName === "International Structuring";
  const isCryptoAssets = serviceName === "Crypto & Digital Assets";

  const [refreshTick, setRefreshTick] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { engagement, loading: engagementLoading, refetch: refetchEngagement } = useEngagement();
  const engagementData = (engagement || {}) as any;
  const sCat = engagementData?.serviceCategory || '';

  const isMBRFilings = sCat === "MBR" || serviceName === "MBR Filings" || serviceName === "Filings";
  const isVAT = sCat === "VAT" || serviceName === "VAT";
  const isTax = sCat === "TAX" || serviceName === "Tax";
  const isIncorporation = sCat === "INCORPORATION" || serviceName === "Incorporation";
  const isBusinessPlans = serviceName === "Business Plans";
  const isLiquidation = sCat === "LIQUIDATION" || serviceName === "Liquidation";
  const isPayroll = sCat === "PAYROLL" || serviceName === "Payroll";
  // Treat Legal service as a Corporate-style service so it also exposes the Filings tab
  const isCorporate =
    sCat === "CSP" ||
    serviceName === "Corporate Services" ||
    serviceSlug === "legal" ||
    serviceName.toLowerCase().includes("legal");
  const isCFO = sCat === "CFO" || serviceName === "CFO Services";
  const isAccounting = sCat === "ACCOUNTING" || serviceName === "Accounting & Bookkeeping";
  const isAudit = sCat === "AUDITING" || serviceName === "Statutory Audit" || serviceName === "Audit" || serviceName.toLowerCase().includes("audit");
  const engagementId = engagementData?._id || engagementData?.id;
  const engagementLibraryFolderId =
    engagementData?.libraryFolderId ||
    engagementData?.libraryRootFolderId ||
    null;

  const { documentRequests, loading: docsLoading, refetch: refetchDocumentRequests } = useDocumentRequests(engagementId);
  const { milestones, loading: milestonesLoading, reload: reloadMilestones } = useMilestones(engagementId);
  const { updates, loading: updatesLoading, refetch: refetchUpdates } = useEngagementUpdates(engagementId);
  const [engagementTodos, setEngagementTodos] = useState<TodoItem[]>([]);
  const [todosLoading, setTodosLoading] = useState(false);

  useEffect(() => {
    if (engagementId) {
      setTodosLoading(true);
      getTodos({ id: engagementId })
        .then((data) => setEngagementTodos(data))
        .catch((err) => console.error("Failed to fetch todos:", err))
        .finally(() => setTodosLoading(false));
    }
  }, [engagementId, refreshTick]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setRefreshTick((t) => t + 1);
    await Promise.allSettled([
      refetchEngagement(),
      refetchDocumentRequests(),
      refetchUpdates(),
      Promise.resolve(reloadMilestones()),
    ]);
    setIsRefreshing(false);
  };

  const hasAnyItems = React.useMemo(() => {
    return (documentRequests || []).length > 0 || (engagementTodos || []).length > 0;
  }, [documentRequests, engagementTodos]);

  const allPendingItems = React.useMemo(() => {
    const pendingDocs = (documentRequests || []).filter(r => {
      const isStatusPending = ['PENDING', 'REOPENED', 'REJECTED'].includes(r.status?.toUpperCase() || '');
      if (!isStatusPending) return false;
      
      // Check if there are actually any pending documents inside
      const hasPendingSingleDocs = (r.documents || []).some((d: any) => 
        !['UPLOADED', 'SUBMITTED', 'ACCEPTED'].includes(d.status?.toUpperCase() || '')
      );
      
      const hasPendingMultipleDocs = (r.multipleDocuments || []).some((group: any) => 
        (group.multiple || group.children || []).some((child: any) => 
          !['UPLOADED', 'SUBMITTED', 'ACCEPTED'].includes(child.status?.toUpperCase() || '')
        )
      );
      
      return hasPendingSingleDocs || hasPendingMultipleDocs;
    });
    
    const pendingTodos = (engagementTodos || []).filter(t => 
      !['COMPLETED', 'ACTION_TAKEN'].includes(t.status?.toUpperCase() || '')
    );

    return [...pendingDocs, ...pendingTodos];
  }, [documentRequests, engagementTodos]);

  const overallServiceStatus: EngagementStatus = React.useMemo(() => {
    if (docsLoading || !documentRequests) return "on_track";
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    if (allPendingItems.length === 0) return "on_track";

    // 1. Check for Overdue
    const hasOverdue = allPendingItems.some(item => {
      const deadline = item.deadline ? new Date(item.deadline) : null;
      if (!deadline) return false;
      const deadlineDate = new Date(deadline.getFullYear(), deadline.getMonth(), deadline.getDate());
      return deadlineDate < today;
    });
    if (hasOverdue) return "overdue";

    // 2. Check for Due Today
    const hasDueToday = allPendingItems.some(item => {
      const deadline = item.deadline ? new Date(item.deadline) : null;
      if (!deadline) return false;
      const deadlineDate = new Date(deadline.getFullYear(), deadline.getMonth(), deadline.getDate());
      return deadlineDate.getTime() === today.getTime();
    });
    if (hasDueToday) return "due_today";

    // 3. Check for Due Soon
    const hasDueSoon = allPendingItems.some(item => {
      const deadline = item.deadline ? new Date(item.deadline) : null;
      return deadline && new Date(deadline) > today;
    });
    if (hasDueSoon) return "due_soon";

    // 4. Fallback to Action Required if items exist but have no deadline
    return "action_required";
  }, [allPendingItems, docsLoading, documentRequests]);

  const apiStatus = engagementData?.status;
  const apiName = engagementData?.name || engagementData?.title;
  const displayStatus: EngagementStatus =
    engagementLoading
      ? "on_track" 
      : (apiStatus === "CANCELLED" || apiStatus === "TERMINATED")
      ? "overdue"
      : overallServiceStatus;
  const displayCycle = engagementLoading ? "" : (apiName || cycle);
  const displayWorkflowStatus: WorkflowStatus =
    engagementLoading
      ? "in_progress" 
      : apiStatus === "ACTIVE"
      ? "in_progress"
      : apiStatus === "COMPLETED"
      ? "completed"
      : allPendingItems.length === 0
      ? "in_progress"
      : apiStatus === "ASSIGNED" || apiStatus === "DRAFT"
      ? "waiting"
      : workflowStatus;

  const mockDataAllowed = ENGAGEMENT_CONFIG.USE_MOCK_DATA && !engagementData?.id && !engagementData?._id;
  const mbrFilings = (engagementData?.filings && engagementData.filings.length > 0) ? engagementData.filings : (mockDataAllowed ? MBR_FILINGS_MOCK : []);
  const mbrActiveFiling = isMBRFilings
    ? getActiveMBRFiling(mbrFilings, mbrCurrentFilingId)
    : undefined;
  const mbrStatus = isMBRFilings
    ? getMBRServiceStatusFromFilings(mbrFilings)
    : displayStatus;

  const vatPeriods = (engagementData?.periods && engagementData.periods.length > 0) ? engagementData.periods : (mockDataAllowed ? VAT_PERIODS_MOCK : []);
  const vatActivePeriod = isVAT
    ? getActiveVATPeriod(vatPeriods, activeVatPeriodId)
    : undefined;

  const currentStatusFromTodos = React.useMemo(() => {
    if (allPendingItems.length === 0) {
      if (!hasAnyItems) return statusConfig.on_track;

      const allTodos = engagementTodos || [];
      const anyActionTaken = allTodos.some(t => t.status?.toUpperCase() === 'ACTION_TAKEN');
      if (anyActionTaken) {
        return {
          label: "Action Taken",
          color: "bg-blue-500/10 text-blue-500 border-blue-500/20",
        };
      }
      return {
        label: "Completed",
        color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
      };
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const sortedItems = [...allPendingItems].sort((a, b) => {
      const dateA = a.deadline ? new Date(a.deadline) : new Date(8640000000000000);
      const dateB = b.deadline ? new Date(b.deadline) : new Date(8640000000000000);
      return dateA.getTime() - dateB.getTime();
    });

    const top = sortedItems[0] as any;

    if (top.deadline) {
      const dl = new Date(top.deadline);
      const dlDate = new Date(dl.getFullYear(), dl.getMonth(), dl.getDate());
      if (dlDate < today) {
        return {
          label: statusConfig.overdue.label,
          color: statusConfig.overdue.color,
        };
      }
      if (dlDate.getTime() === today.getTime()) {
        return {
          label: statusConfig.due_today.label,
          color: statusConfig.due_today.color,
        };
      }
      if (dlDate > today) {
        return {
          label: statusConfig.due_soon.label,
          color: statusConfig.due_soon.color,
        };
      }
    }

    return {
      label: "Action Required",
      color: statusConfig.action_required.color,
    };
  }, [allPendingItems]);

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
    statusConfig[isMBRFilings ? mbrStatus : displayStatus] || statusConfig.on_track;
  const workflowInfo =
    workflowStatusConfig[displayWorkflowStatus] || workflowStatusConfig.in_progress;

  // Handle deep-linking from query params; default to bookkeeping tab when on Accounting & Bookkeeping service
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) {
      setActiveTab(tab);
    } else if (isAccounting) {
      setActiveTab("bookkeeping");
    }
  }, [searchParams, isAccounting]);

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
  }, [serviceName, refreshTick]);

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
  }, [serviceName, refreshTick]);

  const UpdateIcon = React.useMemo(() => (props: any) => (
    <HugeiconsIcon icon={Notification02Icon} {...props} />
  ), []);

  const tabs: Tab[] = isMBRFilings
    ? [
      { id: "dashboard", label: "Overview", icon: LayoutDashboard },
      { id: "workFlow", label: "WorkFlow", icon: ClipboardList },
      { id: "milestones", label: "Milestones", icon: Flag },
      { id: "library", label: "Library", icon: Library },
      { id: "compliance_calendar", label: "Compliance Calendar", icon: Calendar },
      { id: "messages", label: "Updates", icon: UpdateIcon },
      { id: "chat", label: "Chat", icon: MessageSquare },
      { id: "filings", label: "Filings", icon: FileCheck },
    ]
    : isVAT
      ? [
        { id: "dashboard", label: "Overview", icon: LayoutDashboard },
        { id: "workFlow", label: "WorkFlow", icon: ClipboardList },
        { id: "milestones", label: "Milestones", icon: Flag },
        { id: "library", label: "Library", icon: Library },
        { id: "compliance_calendar", label: "Compliance Calendar", icon: Calendar },
        { id: "messages", label: "Updates", icon: UpdateIcon },
        { id: "chat", label: "Chat", icon: MessageSquare },
        { id: "vat_periods", label: "Filings", icon: FileCheck },
      ]
      : [
        { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
        { id: "workFlow", label: "WorkFlow", icon: ClipboardList },
        { id: "milestones", label: "Milestones", icon: Flag },
        ...(isAudit ? [{ id: "audit", label: "Audit", icon: FileText }] : []),
        ...(isAccounting ? [{ id: "bookkeeping", label: "BOOKKEEPING", icon: BookMarked }] : []),
        { id: "library", label: "Library", icon: Library },
        { id: "compliance_calendar", label: "Compliance Calendar", icon: Calendar },
        { id: "messages", label: "Updates", icon: UpdateIcon },
        { id: "chat", label: "Chat", icon: MessageSquare },
        ...(engagementData?.filings?.length > 0 &&
          !isPayroll && !isCorporate && !isCFO &&
          serviceName !== "Tax" &&
          serviceName !== "Statutory Audit" &&
          serviceName !== "Audit" &&
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
        ...(isPayroll ? [{ id: "filings", label: "Filings", icon: FileCheck }] : []),
        ...(isCorporate ? [{ id: "filings", label: "Filings", icon: FileCheck }] : []),
        ...(isCFO ? [{ id: "filings", label: "Filings", icon: FileCheck }] : []),
        ...(isAccounting ? [{ id: "filings", label: "Filings", icon: FileCheck }] : []),
        ...(isAudit ? [{ id: "filings", label: "Filings", icon: FileCheck }] : []),
        ...(isTax ? [{ id: "filings", label: "Filings", icon: FileCheck }] : []),
        ...(isIncorporation ? [{ id: "filings", label: "Filings", icon: FileCheck }] : []),
        ...(isBusinessPlans ? [{ id: "filings", label: "Filings", icon: FileCheck }] : []),
        ...(isLiquidation ? [{ id: "filings", label: "Filings", icon: FileCheck }] : []),
        ...(isBankingPayments ? [{ id: "filings", label: "Filings", icon: FileCheck }] : []),
        ...(isInternationalStructuring ? [{ id: "filings", label: "Filings", icon: FileCheck }] : []),
        ...(isCryptoAssets ? [{ id: "filings", label: "Filings", icon: FileCheck }] : []),
        ...(isRegulatedLicenses ? [{ id: "filings", label: "Filings", icon: FileCheck }] : []),
      ];

  return (
    <TooltipProvider>
      <div className={cn("space-y-6", className)}>
        {/* Service Header */}
        <DashboardCard className="p-8 bg-[#0f1729] border-white/10 overflow-hidden relative rounded-0">
          {/* Subtle Decorative Gradient */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-4">
                <div className="flex flex-col gap-3">
                  {engagementLoading ? (
                    <Skeleton className="h-4 w-32 rounded-0 bg-white/5" />
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-white uppercase tracking-[0.2em] bg-white/5 px-2.5 py-1 border border-white/10">
                        Organization: {engagementData?.organizationName || "Professional Service"}
                      </span>
                    </div>
                  )}
                  <div className="flex flex-wrap items-center gap-4">
                    <h2 className="text-3xl font-medium text-white tracking-tight">
                      {serviceName}
                    </h2>
                    {engagementLoading ? (
                      <Skeleton className="h-6 w-28 rounded-0 bg-white/5" />
                    ) : (
                      <Badge
                        className={cn(
                          "rounded-0 border px-3 py-1 text-xs font-bold uppercase tracking-widest bg-transparent",
                          statusInfo.color,
                        )}
                      >
                        {statusInfo.label}
                      </Badge>
                    )}
                  </div>
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

            <div className="flex items-center gap-3 self-start md:self-center">
              <Button
                variant="secondary"
                className="bg-white/10 text-white hover:bg-white/15 border border-white/10 rounded-0"
                onClick={handleRefresh}
                disabled={engagementLoading || isRefreshing}
              >
                <RefreshCw className={cn("h-4 w-4 mr-2", (engagementLoading || isRefreshing) && "animate-spin")} />
                Refresh
              </Button>
            </div>
          </div>
        </DashboardCard>

        <PillTabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={(tabId) => {
            setActiveTab(tabId);
            const params = new URLSearchParams(searchParams.toString());
            if (tabId === "dashboard") {
              params.delete("tab");
            } else {
              params.set("tab", tabId);
            }
            const qs = params.toString();
            router.push(qs ? `?${qs}` : "?", { scroll: false });
          }}
        />


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
              {(engagementData?.accountingFilings || []).length === 0 ? (
                <div className="py-12 text-center text-sm text-muted-foreground">
                  No filings available yet for this engagement.
                </div>
              ) : (
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
              )}
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
              {(engagementData?.auditFilings || []).length === 0 ? (
                <div className="py-12 text-center text-sm text-muted-foreground">
                  No filings available yet for this engagement.
                </div>
              ) : (
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
              )}
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
              {(engagementData?.taxFilings || []).length === 0 ? (
                <div className="py-12 text-center text-sm text-muted-foreground">
                  No filings available yet for this engagement.
                </div>
              ) : (
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
              )}
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
              {(engagementData?.incorporationFilings || []).length === 0 ? (
                <div className="py-12 text-center text-sm text-muted-foreground">
                  No filings available yet for this engagement.
                </div>
              ) : (
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
              )}
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
              {(engagementData?.businessPlansFilings || []).length === 0 ? (
                <div className="py-12 text-center text-sm text-muted-foreground">
                  No filings available yet for this engagement.
                </div>
              ) : (
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
              )}
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
              {(engagementData?.liquidationFilings || []).length === 0 ? (
                <div className="py-12 text-center text-sm text-muted-foreground">
                  No filings available yet for this engagement.
                </div>
              ) : (
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
              )}
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
                          "rounded-0 border px-2 py-0.5 text-xs font-semibold uppercase tracking-widest bg-transparent",
                          f.status === "due_soon" &&
                            "border-orange-500/20 text-orange-600",
                          f.status === "in_progress" &&
                            "border-blue-500/20 text-blue-600",
                          f.status === "submitted" &&
                            "border-emerald-500/20 text-emerald-600",
                          f.status === "waiting_on_advisor" &&
                            "border-red-500/20 text-red-600",
                          f.status === "on_track" &&
                            "border-green-500/20 text-green-600",
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
                        <Button size="sm">Upload</Button>
                      ) : (
                        <Button variant="outline" size="sm">
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
          <EngagementDashboard
            serviceName={serviceName}
            engagementData={engagementData}
            loading={loading}
            engagementLoading={engagementLoading}
            allPendingItems={allPendingItems}
            engagementTodos={engagementTodos}
            documentRequests={documentRequests}
            updates={updates}
            milestones={milestones}
            milestonesLoading={milestonesLoading}
            updatesLoading={updatesLoading}
            displayCycle={displayCycle}
            currentStatusFromTodos={currentStatusFromTodos}
            isAccounting={isAccounting}
            isMBRFilings={isMBRFilings}
            isBankingPayments={isBankingPayments}
            isInternationalStructuring={isInternationalStructuring}
            isRegulatedLicenses={isRegulatedLicenses}
            isCryptoAssets={isCryptoAssets}
            isCFO={isCFO}
            isCorporate={isCorporate}
            isPayroll={isPayroll}
            isAudit={isAudit}
            isTax={isTax}
            isIncorporation={isIncorporation}
            isBusinessPlans={isBusinessPlans}
            isLiquidation={isLiquidation}
            isVAT={isVAT}
            vatActivePeriod={vatActivePeriod}
            stats={stats}
            setActiveTab={setActiveTab}
            router={router}
            formatMilestoneDate={formatMilestoneDate}
          />
        )}







        {activeTab === "audit" && isAudit && (
          <ClientAuditTab />
        )}

        {activeTab === "bookkeeping" && isAccounting && (
          <ClientBookkeepingContent
            engagementId={engagementId ?? undefined}
            companyId={engagementData?.companyId ?? engagementData?.company?.id ?? undefined}
          />
        )}

        {activeTab === "library" && (
          <div className="flex flex-col h-[calc(100vh-100px)] overflow-hidden gap-5">
            <LibraryExplorer rootFolderId={engagementLibraryFolderId} />
          </div>
        )}

        {activeTab === "workFlow" && (
          <WorkFlowSplitTab
            engagementId={engagementId}
            todos={engagementTodos}
            todosLoading={todosLoading}
            refreshKey={refreshTick}
          />
        )}

        {activeTab === "milestones" && (
          <MilestonesTab refreshKey={refreshTick} />
        )}

        {activeTab === "compliance_calendar" && (
          <ComplianceCalendarTab serviceName={serviceName} refreshKey={refreshTick} />
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
          <UpdatesTab />
        )}

        {activeTab === "chat" && (
          <EngagementChatTab />
        )}

        {activeTab === "filings" && (
          <FilingsTab />
        )}
      </div>
    </TooltipProvider>
  );
};

export default EngagementSummary;
