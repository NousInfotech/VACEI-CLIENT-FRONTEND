"use client";
import Link from "next/link";
import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useActiveCompany } from "@/context/ActiveCompanyContext";
import StatCard from "@/components/StatCard";
import DashboardCard from "@/components/DashboardCard";
import { ShadowCard } from "@/components/ui/ShadowCard";
import DashboardActionButton from "@/components/DashboardActionButton";
import PageHeader from "@/components/shared/PageHeader";
import CashFlowChart from "@/components/CashFlowChart";
import PLSummaryChart from "@/components/PLSummaryChart";
import { getDecodedUsername, verifyAuthentication, handleAuthError } from "@/utils/authUtils";
import { ProcessedDashboardStat } from "@/api/financialReportsApi";
import { fetchDashboardSummary as fetchFinancialSummary } from "@/api/financialReportsApi";
import { fetchDashboardSummary, DashboardSummary } from "@/api/dashboardApi";
import { getTodos, updateTodoStatus } from "@/api/todoService";
import NoticeBoard from "@/components/dashboard/NoticeBoard";
import { fetchUploadStatusSummary } from "@/api/documentApi";
import { fetchTasks } from "@/api/taskService";
import { useGlobalDashboard } from "@/context/GlobalDashboardContext";
import type { Task } from "@/interfaces";
import { fetchPayrollData, transformPayrollSubmissionsToComplianceItems } from "@/lib/payrollComplianceIntegration";
import { listComplianceCalendars, type ComplianceCalendarEntry } from "@/api/complianceCalendarService";
import { isPast, isToday } from "date-fns";
import { HugeiconsIcon } from '@hugeicons/react';
import { AddressBookIcon, Alert02Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { User, AlertCircle, CheckCircle, ArrowRight, Clock, MoreVertical, Upload, Plus, MessageCircle, Calendar, CheckSquare, FileText, Search, Briefcase } from "lucide-react";
import { getOnboardingProgress } from "@/api/onboardingService";
import CurrentFocus, { FocusItem } from "@/components/dashboard/CurrentFocus";
import NextComplianceDeadline from "@/components/dashboard/NextComplianceDeadline";
import { DashboardSkeleton } from "@/components/shared/CommonSkeletons";
import { SERVICE_METADATA } from "@/lib/menuData";

// Company interface
interface Company {
  id: string;
  name: string;
  registrationNumber?: string;
}

interface UploadStatusSummary {
  filesUploadedThisMonth: number;
  typeBreakdown: {
    Invoices: number;
    Receipts: number;
    Statements: number;
    Other: number;
  };
  monthlyStatusBreakdown: {
    "Pending Review": number;
    Processed: number;
    "Needs Correction": number;
    Other: number;
  };
}

// Module-scoped cache to prevent unnecessary refetching on client-side navigation
const dashboardCache = {
  activeCompanyId: null as string | null,
  timestamp: 0,
  dashboardSummary: null as DashboardSummary | null,
  activeFocus: null as any,
  upcomingDeadlines: [] as any[],
  calendarDeadlines: [] as ComplianceCalendarEntry[],
  todoCounts: { overdue: 0, dueSoon: 0, waiting: 0, done: 0 },
  complianceCounts: { overdue: 0, dueSoon: 0, waiting: 0, upcoming: 0, done: 0 },
  statsLoaded: false,
  stats: [] as ProcessedDashboardStat[],
  netIncomeYTD: null as { amount: string; change: string } | null,
  authVerified: false,
  authTimestamp: 0,
  companiesFetched: false,
  // In-flight guards to prevent duplicate API calls (e.g. from React strict mode)
  authInFlight: false,
  companiesInFlight: false,
  summaryInFlight: false,
  complianceInFlight: false,
  financialInFlight: false,
};
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const AUTH_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const resolveServiceEngagementBase = (service?: string) => {
  if (!service) return "";
  const normalized = service.toUpperCase().replace(/[-\s&]/g, "_");
  const metadataKey = (Object.keys(SERVICE_METADATA).find((k) =>
    normalized === k || normalized.includes(k)
  ) || "") as keyof typeof SERVICE_METADATA | "";
  if (!metadataKey) return "";
  return SERVICE_METADATA[metadataKey]?.href || "";
};

const formatServiceName = (service?: string) => {
  if (!service) return "Action Required";
  const normalized = service.toUpperCase().replace(/[-\s&]/g, "_");
  const metadataKey = (Object.keys(SERVICE_METADATA).find((k) =>
    normalized === k || normalized.includes(k)
  ) || "") as keyof typeof SERVICE_METADATA | "";
  if (!metadataKey) return service;
  return SERVICE_METADATA[metadataKey]?.label || service;
};

export default function DashboardPage() {
  const router = useRouter();
  // Use context instead of local state first, since we read it for lazy init
  const { activeCompanyId, companies, setCompanies } = useActiveCompany();
  const { refreshSidebar } = useGlobalDashboard();

  const [uploadSummary, setUploadSummary] = useState<UploadStatusSummary | null>(null);

  // Lazy initialize state from cache to prevent loading flashes on back navigation
  const [loading, setLoading] = useState(() => {
    return !(dashboardCache.statsLoaded && (Date.now() - dashboardCache.timestamp < CACHE_TTL));
  });
  const [uploadLoading, setUploadLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(() => {
    return !(dashboardCache.authVerified && (Date.now() - dashboardCache.authTimestamp < AUTH_CACHE_TTL));
  }); // Loading state for auth verification

  const [revenueYTD, setRevenueYTD] = useState<{ amount: string; change: string } | null>(null);
  const [netIncomeYTD, setNetIncomeYTD] = useState<{ amount: string; change: string } | null>(() => dashboardCache.netIncomeYTD);
  const [username, setUsername] = useState<string>(''); // State for username to avoid hydration error

  const [todoCounts, setTodoCounts] = useState(() => dashboardCache.todoCounts);
  const [complianceCounts, setComplianceCounts] = useState<{ overdue: number; dueSoon: number; waiting: number; upcoming?: number; done: number }>(() => dashboardCache.complianceCounts);
  const [dashboardSummary, setDashboardSummary] = useState<DashboardSummary | null>(() => {
    return (Date.now() - dashboardCache.timestamp < CACHE_TTL)
      ? dashboardCache.dashboardSummary
      : null;
  });
  const [activeFocus, setActiveFocus] = useState<any>(() => dashboardCache.activeFocus);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState<any[]>(() => dashboardCache.upcomingDeadlines);
  const [calendarDeadlines, setCalendarDeadlines] = useState<ComplianceCalendarEntry[]>(() => dashboardCache.calendarDeadlines);
  const [nextCalendarDeadline, setNextCalendarDeadline] = useState<ComplianceCalendarEntry | null>(null);

  const loadingCompanies = false; // Context handles loading implicitely or we can add it if needed
  const [stats, setStats] = useState<ProcessedDashboardStat[]>(() => dashboardCache.stats);

  // CRITICAL: Verify authentication on mount (before loading any data)
  // This prevents page flash by showing loading state while verifying
  useEffect(() => {
    const checkAuthentication = async () => {
      // If we recently verified, skip the API call
      if (dashboardCache.authVerified && (Date.now() - dashboardCache.authTimestamp < AUTH_CACHE_TTL)) {
        setAuthLoading(false);
        return;
      }

      // Avoid duplicate calls while an auth check is already running
      if (dashboardCache.authInFlight) {
        return;
      }

      dashboardCache.authInFlight = true;

      setAuthLoading(true);
      try {
        const isAuthenticated = await verifyAuthentication();

        if (!isAuthenticated) {
          // Token is invalid or expired - redirect to login immediately
          // Clear auth data
          localStorage.removeItem('token');
          localStorage.removeItem('email');
          localStorage.removeItem('user_id');
          localStorage.removeItem('username');

          // Clear cookie
          if (typeof document !== 'undefined') {
            document.cookie = 'client-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax';
            document.cookie = 'client-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=None; Secure';
          }

          dashboardCache.authVerified = false;
          router.push('/login?message=' + encodeURIComponent('Session expired. Please login again.'));
          return; // Don't proceed with loading data
        }

        // Authentication verified - proceed with loading dashboard data
        dashboardCache.authVerified = true;
        dashboardCache.authTimestamp = Date.now();
        setAuthLoading(false);
      } catch (error) {
        console.error('Authentication check failed:', error);
        // On error, treat as unauthenticated
        dashboardCache.authVerified = false;
        handleAuthError(error, router);
      } finally {
        dashboardCache.authInFlight = false;
      }
    };

    checkAuthentication();
  }, [router]);

  // Fetch companies from backend
  useEffect(() => {
    if (authLoading) return; // Wait for auth verification
    if (dashboardCache.companiesFetched && companies.length > 0) return; // Skip if already fetched with recent auth
    if (dashboardCache.companiesInFlight) return; // Skip if a fetch is already running

    const fetchCompanies = async () => {
      dashboardCache.companiesInFlight = true;
      try {
        const backendUrl = process.env.NEXT_PUBLIC_VACEI_BACKEND_URL?.replace(/\/?$/, "/") || "http://localhost:5000/api/v1/";
        const token = localStorage.getItem('token');

        if (!token) return;

        const response = await fetch(`${backendUrl}companies`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const result = await response.json();
          const companiesData = result.data || result || [];
          const mappedCompanies = companiesData.map((c: any) => ({
            id: c.id,
            name: c.name,
            registrationNumber: c.registrationNumber,
            incorporationStatus: c.incorporationStatus,
            kycStatus: c.kycStatus,
          }));
          setCompanies(mappedCompanies);
          dashboardCache.companiesFetched = true;
        }
      } catch (error) {
        console.error("Failed to fetch companies:", error);
      } finally {
        dashboardCache.companiesInFlight = false;
      }
    };

    fetchCompanies();
  }, [authLoading, setCompanies]);

  // Set username on client side to avoid hydration error
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const decoded = getDecodedUsername();
      if (decoded) {
        setUsername(decoded);
      }
    }
  }, []);

  const loadDashboardSummary = useCallback(async (force = false) => {
    if (!activeCompanyId) return;

    if (
      !force &&
      dashboardCache.activeCompanyId === activeCompanyId &&
      dashboardCache.dashboardSummary &&
      Date.now() - dashboardCache.timestamp < 1000 // 1 second TTL for dashboard items
    ) {
      setDashboardSummary(dashboardCache.dashboardSummary);
      setActiveFocus(dashboardCache.activeFocus);
      setUpcomingDeadlines(dashboardCache.upcomingDeadlines);
      setCalendarDeadlines(dashboardCache.calendarDeadlines);
      setTodoCounts(dashboardCache.todoCounts);
      setComplianceCounts(dashboardCache.complianceCounts);
      return;
    }

    if (dashboardCache.summaryInFlight) {
      return;
    }

    dashboardCache.summaryInFlight = true;
    try {
      const summary = await fetchDashboardSummary(activeCompanyId);

      // Fetch todos to calculate refined counts (only ACTION_REQUIRED)
      const todos = await getTodos();
      const handledStatuses = ['ACTION_TAKEN', 'COMPLETED', 'UPLOADED', 'PENDING_REVIEW', 'HANDLED', 'SUBMITTED', 'PROCESSED', 'DONE'];
      const actionRequiredTodos = todos.filter(t => {
        const s = (t.status || '').toUpperCase();
        return s === 'ACTION_REQUIRED' || (!handledStatuses.includes(s) && (s === 'OVERDUE' || s === 'DUE_SOON'));
      });

      // Fetch compliance tasks (statutory deadlines)
      const taskResponse = await fetchTasks({ page: 1, limit: 100 });
      const tasks = taskResponse.data || [];

      // Filter tasks that require action 
      const actionRequiredTasks = tasks.filter((task: Task) => {
        if (!task.dueDate) return false;
        if (task.status?.toLowerCase().includes("completed") || task.status?.toLowerCase().includes("done")) return false;
        return true;
      }).map((task: Task) => ({
        ...task,
        deadline: task.dueDate, // map dueDate to deadline for easier sorting
        service: task.category || 'Compliance',
        title: task.title || 'Untitled Task',
      }));

      // Combine todos and tasks for the upcoming deadlines
      const allPendingItems: any[] = [...actionRequiredTodos, ...actionRequiredTasks];

      const sortedItems = [...allPendingItems].sort((a, b) => {
        const dateA = a.deadline ? new Date(a.deadline).getTime() : Infinity;
        const dateB = b.deadline ? new Date(b.deadline).getTime() : Infinity;
        return dateA - dateB;
      });

      const nowRaw = new Date();
      const today = new Date(nowRaw.getFullYear(), nowRaw.getMonth(), nowRaw.getDate());
      const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

      // Ensure we filter out only correctly identified future deadlines for the snapshot
      const upcomingDeadlinesItems = sortedItems.filter(t => {
        if (!t.deadline) return false;
        const dl = new Date(t.deadline);
        const dlDate = new Date(dl.getFullYear(), dl.getMonth(), dl.getDate());
        return dlDate.getTime() >= today.getTime();
      });
      const futureDeadlines = upcomingDeadlinesItems.length > 0 ? upcomingDeadlinesItems.slice(0, 3) : sortedItems.slice(0, 3);

      // Also set upcoming deadlines for the compliance snapshot (top 3)
      setUpcomingDeadlines(futureDeadlines);

      let newFocus = summary.focus;
      const isSummaryFocusHandled = newFocus && (
        handledStatuses.includes((newFocus.status || '').toUpperCase()) ||
        !actionRequiredTodos.some(t => String(t.id) === String(newFocus!.todoId))
      );

      if (!newFocus || isSummaryFocusHandled) {
        if (sortedItems.length > 0) {
          const nextItem = sortedItems[0];
          const now = new Date();
          const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
          let derivedStatus = 'waiting_on_you';
          if (nextItem.deadline) {
            const dl = new Date(nextItem.deadline);
            if (dl.toDateString() !== now.toDateString() && dl < now) derivedStatus = 'overdue';
            else if (dl.toDateString() !== now.toDateString() && dl > now && dl <= nextWeek) derivedStatus = 'due_soon';
          }
          newFocus = {
            serviceName: formatServiceName(nextItem.service),
            service: nextItem.service,
            taskDescription: nextItem.title,
            status: derivedStatus,
            primaryActionLabel: nextItem.cta 
              ? (nextItem.cta.charAt(0).toUpperCase() + nextItem.cta.slice(1)) 
              : (nextItem.category ? 'View Task' : 'Take Action'),
            todoId: nextItem.id
          };
        } else {
          newFocus = null;
        }
      }

      if (newFocus) {
        if (newFocus.id && !newFocus.todoId) {
          newFocus.todoId = newFocus.id;
        }

        if (newFocus.todoId) {
          const fullTodo = allPendingItems.find(t => String(t.id) === String(newFocus!.todoId));
          if (fullTodo) {
            newFocus = {
              ...newFocus,
              type: fullTodo.type,
              moduleId: fullTodo.moduleId,
              engagementId: fullTodo.engagementId,
              service: fullTodo.service,
              serviceName: formatServiceName(fullTodo.service),
              primaryActionLabel: fullTodo.cta 
                ? (fullTodo.cta.charAt(0).toUpperCase() + fullTodo.cta.slice(1)) 
                : newFocus!.primaryActionLabel
            };
          }
        }
      }

      setDashboardSummary(summary);
      setActiveFocus(newFocus);

      // Calculate Todo counts for Analytics (Top section)
      const todoOverdue = actionRequiredTodos.filter(t => {
        if (!t.deadline) return false;
        const dl = new Date(t.deadline);
        const dlDate = new Date(dl.getFullYear(), dl.getMonth(), dl.getDate());
        return dlDate.getTime() < today.getTime();
      }).length;

      const todoToday = actionRequiredTodos.filter(t => {
        if (!t.deadline) return false;
        const dl = new Date(t.deadline);
        const dlDate = new Date(dl.getFullYear(), dl.getMonth(), dl.getDate());
        return dlDate.getTime() === today.getTime();
      }).length;

      const todoSoon = actionRequiredTodos.filter(t => {
        if (!t.deadline) return false;
        const dl = new Date(t.deadline);
        const dlDate = new Date(dl.getFullYear(), dl.getMonth(), dl.getDate());
        return dlDate.getTime() > today.getTime() && dlDate.getTime() <= nextWeek.getTime();
      }).length;

      // Calculate Compliance counts for Snapshot (Sidebar)
      const complianceOverdue = actionRequiredTasks.filter(t => {
        if (!t.deadline) return false;
        const dl = new Date(t.deadline);
        const dlDate = new Date(dl.getFullYear(), dl.getMonth(), dl.getDate());
        return dlDate.getTime() < today.getTime();
      }).length;

      const complianceToday = actionRequiredTasks.filter(t => {
        if (!t.deadline) return false;
        const dl = new Date(t.deadline);
        const dlDate = new Date(dl.getFullYear(), dl.getMonth(), dl.getDate());
        return dlDate.getTime() === today.getTime();
      }).length;

      const complianceSoon = actionRequiredTasks.filter(t => {
        if (!t.deadline) return false;
        const dl = new Date(t.deadline);
        const dlDate = new Date(dl.getFullYear(), dl.getMonth(), dl.getDate());
        return dlDate.getTime() > today.getTime() && dlDate.getTime() <= nextWeek.getTime();
      }).length;

      setTodoCounts({
        overdue: todoOverdue,
        dueSoon: todoSoon,
        waiting: todoToday,
        done: actionRequiredTodos.length
      });

      setComplianceCounts({
        overdue: complianceOverdue,
        dueSoon: complianceSoon,
        waiting: complianceToday,
        done: tasks.length - (complianceOverdue + complianceSoon + complianceToday)
      });

      // Update cache (remaining fields handled by loadComplianceCalendar)
      dashboardCache.activeCompanyId = activeCompanyId;
      dashboardCache.timestamp = Date.now();
      dashboardCache.dashboardSummary = summary;
      dashboardCache.activeFocus = newFocus;
      dashboardCache.todoCounts = {
        overdue: todoOverdue,
        dueSoon: todoSoon,
        waiting: todoToday,
        done: actionRequiredTodos.length
      };
    } catch (error) {
      console.error("Failed to fetch dashboard summary:", error);
    } finally {
      dashboardCache.summaryInFlight = false;
    }
  }, [activeCompanyId]);

  useEffect(() => {
    if (authLoading || !activeCompanyId) return;
    loadDashboardSummary();
  }, [authLoading, activeCompanyId, loadDashboardSummary]);

  // Load next compliance deadline from Compliance Calendar for the active company
  useEffect(() => {
    if (authLoading || !activeCompanyId) return;

    if (dashboardCache.complianceInFlight) {
      return;
    }

    const loadComplianceCalendar = async () => {
      dashboardCache.complianceInFlight = true;
      try {
        const entries = await listComplianceCalendars({ companyId: activeCompanyId });
        if (!entries || entries.length === 0) {
          setNextCalendarDeadline(null);
          return;
        }

        const today = new Date();
        const normalizedToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());

        const withValidDates = entries.filter(e => !!e.dueDate);

        const overdueEntries = withValidDates.filter(e => {
          const dl = new Date(e.dueDate);
          const dlDate = new Date(dl.getFullYear(), dl.getMonth(), dl.getDate());
          return dlDate.getTime() < normalizedToday.getTime();
        }).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

        const upcomingEntries = withValidDates.filter(e => {
          const dl = new Date(e.dueDate);
          const dlDate = new Date(dl.getFullYear(), dl.getMonth(), dl.getDate());
          return dlDate.getTime() >= normalizedToday.getTime();
        }).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

        const nextEntry = overdueEntries[0] || upcomingEntries[0] || null;
        setNextCalendarDeadline(nextEntry || null);
        
        // Also set a list of upcoming calendar deadlines (top 3)
        const topUpcoming = upcomingEntries.slice(0, 3);
        setCalendarDeadlines(topUpcoming);
        dashboardCache.calendarDeadlines = topUpcoming;

        // Calculate sidebar counts based EXCLUSIVELY on calendar entries
        const calToday = withValidDates.filter(e => {
          const dl = new Date(e.dueDate);
          const dlDate = new Date(dl.getFullYear(), dl.getMonth(), dl.getDate());
          return dlDate.getTime() === normalizedToday.getTime();
        }).length;

        // In the compliance page, "Upcoming" is simply any date strictly greater than today.
        // It does not separate out "Due Soon". The user requested the exact same count here.
        const calUpcoming = withValidDates.filter(e => {
          const dl = new Date(e.dueDate);
          const dlDate = new Date(dl.getFullYear(), dl.getMonth(), dl.getDate());
          return dlDate.getTime() > normalizedToday.getTime();
        }).length;

        const newCounts = {
          overdue: overdueEntries.length,
          dueSoon: 0, // Not used when matching the precise "Upcoming" count from the compliance page
          waiting: calToday,
          upcoming: calUpcoming,
          done: entries.length
        };

        setComplianceCounts(newCounts);
        dashboardCache.complianceCounts = newCounts;

      } catch (error) {
        console.error("Failed to load compliance calendar for dashboard snapshot:", error);
        setNextCalendarDeadline(null);
      } finally {
        dashboardCache.complianceInFlight = false;
      }
    };

    loadComplianceCalendar();
  }, [authLoading, activeCompanyId]);

  // Load financial summary data (separately)
  useEffect(() => {
    if (authLoading) return; // Wait for auth verification

    if (
      dashboardCache.statsLoaded &&
      Date.now() - dashboardCache.timestamp < CACHE_TTL
    ) {
      setStats(dashboardCache.stats);
      setNetIncomeYTD(dashboardCache.netIncomeYTD);
      setLoading(false);
      return;
    }

    if (dashboardCache.financialInFlight) {
      return;
    }

    const loadFinancialData = async () => {
      setLoading(true);
      dashboardCache.financialInFlight = true;
      try {
        const fetchedStats = await fetchFinancialSummary();
        console.log(fetchedStats);

        if (fetchedStats.netIncomeYTD) {
          setNetIncomeYTD({
            amount: new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "EUR",
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }).format(fetchedStats.netIncomeYTD.value),
            change: fetchedStats.netIncomeYTD.change,
          });
        } else {
          setNetIncomeYTD(null);
        }

        const filteredStats = fetchedStats.stats.filter(
          (stat: { title: string; }) => stat.title !== "Revenue YTD" && stat.title !== "Net income YTD"
        );
        setStats(filteredStats);

        // Update cache
        dashboardCache.statsLoaded = true;
        dashboardCache.stats = filteredStats;
        if (fetchedStats.netIncomeYTD) {
          dashboardCache.netIncomeYTD = {
            amount: new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "EUR",
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }).format(fetchedStats.netIncomeYTD.value),
            change: fetchedStats.netIncomeYTD.change,
          };
        } else {
          dashboardCache.netIncomeYTD = null;
        }

      } catch (error: any) {
        console.error("Failed to load financial summary:", error);

        if (error?.message?.toLowerCase().includes('authentication') ||
          error?.message?.toLowerCase().includes('unauthorized') ||
          error?.status === 401 ||
          error?.status === 403) {
          handleAuthError(error, router);
          return;
        }

        setStats([]);
        setRevenueYTD(null);
        setNetIncomeYTD(null);
      } finally {
        setLoading(false);
        dashboardCache.financialInFlight = false;
      }
    };
    loadFinancialData();
  }, [router, authLoading]);

  const handleContactAccountantClick = () => {
    const chatBubbleButton = document.getElementById("openChatBubble");
    if (chatBubbleButton) {
      chatBubbleButton.click();
    }
  };

  const getArrowIcon = (change: string) => {
    if (change.includes('+')) {
      return "fi fi-rr-arrow-small-up";
    } else if (change.includes('-')) {
      return "fi fi-rr-arrow-small-down";
    }
    return "";
  };

  const totalUploaded = uploadSummary?.filesUploadedThisMonth || 0;
  const processedCount = uploadSummary?.monthlyStatusBreakdown?.Processed || 0;
  const pendingCount = uploadSummary?.monthlyStatusBreakdown?.["Pending Review"] || 0;
  const needsCorrectionCount = uploadSummary?.monthlyStatusBreakdown?.["Needs Correction"] || 0;
  const processedPercentage = totalUploaded > 0 ? (processedCount / totalUploaded) * 100 : 0;
  const pendingPercentage = totalUploaded > 0 ? (pendingCount / totalUploaded) * 100 : 0;
  const needCorrectionPercentage = totalUploaded > 0 ? (needsCorrectionCount / totalUploaded) * 100 : 0;
  const encodedPendingStatus = btoa('1');
  const encodedProcessedStatus = btoa('2');
  const encodedNeedCorrectionStatus = btoa('3');

  const activeServices = dashboardSummary?.activeEngagements.map(e => {
    const matchingTodos = upcomingDeadlines.filter(t =>
      (t.service || t.type || '').toLowerCase() === e.serviceCategory.toLowerCase() ||
      (t.title || '').toLowerCase().includes(e.serviceCategory.toLowerCase()) ||
      (e.name || '').toLowerCase().includes((t.service || t.type || '').toLowerCase())
    );
    const nextDeadline = matchingTodos.length > 0 ? matchingTodos[0].deadline : null;
    const nextStepDesc = matchingTodos.length > 0 ? matchingTodos[0].title : null;

    const serviceSlugMap: Record<string, string> = {
      ACCOUNTING: "bookkeeping",
      AUDITING: "audit",
      VAT: "vat",
      TAX: "tax",
      CSP: "csp-mbr",
      PAYROLL: "payroll",
      CFO: "cfo",
      MBR: "mbr-filing",
      INCORPORATION: "incorporation",
      PROJECTS_TRANSACTIONS: "project-transactions",
      ADVISORY: "business-plans",
      GRANTS_AND_INCENTIVES: "grants-incentives",
      LIQUIDATION: "liquidation",
    };
    const slug = serviceSlugMap[e.serviceCategory] || e.serviceCategory.toLowerCase();

    return {
      name: e.name || e.serviceCategory,
      category: e.serviceCategory,
      status: e.status,
      nextDeadline: nextDeadline,
      nextStepDescription: nextStepDesc,
      next: "View Details",
      nextStepType: "client",
      href: `/dashboard/${activeCompanyId}/services/${slug}/${e.id}`
    };
  }) || [];
  const recentlyCompleted = [
    { text: "VAT Q1 submitted", action: "View receipt", href: `/dashboard/${activeCompanyId}/services/vat` },
    { text: "Payroll May filed", action: "View confirmation", href: `/dashboard/${activeCompanyId}/services/payroll` },
    { text: "MBR BO2 submitted", action: "View form", href: `/dashboard/${activeCompanyId}/services/csp-mbr/mbr-submissions/BO2` },
  ];
  const recentActivity = [
    { text: "9 docs uploaded today", time: "2 hours ago", service: "Documents", href: `/dashboard/documents` },
    { text: "VAT checks completed", time: "5 hours ago", service: "VAT", href: `/dashboard/${activeCompanyId}/services/vat` },
  ];
  const messagesUpdates = [
    { text: "Need 1 more invoice", sender: "John (Accountant)", time: "1 hour ago" },
    { text: "Audit query sent", sender: "System", time: "3 hours ago" },
  ];
  const healthStatus = todoCounts.done > 0 ? "Action Required" : "Healthy";

  // Calculate Risk Level
  const getRiskLevel = () => {
    if (complianceCounts.overdue > 0) return { level: "High", color: "text-destructive" };
    if (complianceCounts.dueSoon > 2) return { level: "Medium", color: "text-warning" };
    return { level: "Low", color: "text-success" };
  };
  const riskLevel = getRiskLevel();

  const getGreeting = () => {
    const hour = new Date().getHours();
    let timeGreeting = '';
    if (hour < 12) {
      timeGreeting = 'Good morning';
    } else if (hour < 17) {
      timeGreeting = 'Good afternoon';
    } else {
      timeGreeting = 'Good evening';
    }

    // Include username if available
    if (username && username.trim()) {
      // Extract first name if full name is provided
      const firstName = username.split(' ')[0];
      return `${timeGreeting}, ${firstName}!`;
    }

    // Fallback greeting without name
    return `${timeGreeting}!`;
  };

  // Show loading state while verifying authentication or fetching data
  if (authLoading || loading || !dashboardSummary) {
    return (
      <div className="min-h-screen bg-brand-body">
        <DashboardSkeleton />
      </div>
    );
  }

  // Final URL for the Workspace card (Analytics section)
  const workspaceUrl = (() => {
    if (!activeFocus || !activeFocus.engagementId) return `/dashboard/${activeCompanyId}/todo-list`;
    
    const serviceBase = resolveServiceEngagementBase(activeFocus.service);
    if (!serviceBase) return `/dashboard/${activeCompanyId}/todo-list`;
    
    // Construct path: /dashboard/[companyId]/services/[slug]/engagements/[id]
    const base = serviceBase.replace('/dashboard/', `/dashboard/${activeCompanyId}/`);
    return `${base}/engagements/${activeFocus.engagementId}?tab=workFlow`;
  })();

  return (
    <div className="min-h-screen bg-brand-body p-4">
      <div className=" mx-auto space-y-8">
        {/* Premium Dashboard Header */}
        <PageHeader
          title={getGreeting()}
          subtitle={username ? "Here's your business tasks and what's happening today." : "Welcome back! Here's what's happening with your business today."}
          activeCompany={companies.find(c => c.id === activeCompanyId)?.name || "ACME LTD"}
          todoStats={{
            total: todoCounts.done, // total items considered
            completed: 0,
            healthStatus: healthStatus as 'Action Required' | 'Healthy'
          }}
          todoStatsHref={`/dashboard/${activeCompanyId}/todo-list`}
        />

        {/* 🔴 Priority Actions (Only if needed) */}
        {/* {complianceCounts.overdue > 0 && (
          <div className="animate-in fade-in slide-in-from-top-4 duration-500">
            <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
              🔴 Priority Actions
            </h2>
            <DashboardCard className="bg-red-50 border-red-100 p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold">
                  <AlertCircle size={24} />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-red-900">Your attention is required</h4>
                  <p className="text-red-700">{complianceCounts.overdue} overdue filings need action.</p>
                </div>
              </div>
              <Link href="/dashboard/todo-list?filter=overdue">
                <Button className="bg-red-600 hover:bg-red-700 text-white rounded-xl px-8 py-6 h-auto text-lg font-semibold shadow-lg shadow-red-200">
                  Review Now
                </Button>
              </Link>
            </DashboardCard>
          </div>
        )} */}

        <CurrentFocus item={activeFocus ? {
          serviceName: activeFocus.serviceName,
          taskDescription: activeFocus.taskDescription,
          status: (() => {
            const s = (activeFocus.status || '').toUpperCase();
            if (['ACTION_TAKEN', 'COMPLETED', 'UPLOADED', 'PENDING_REVIEW', 'HANDLED', 'SUBMITTED', 'PROCESSED', 'DONE'].includes(s)) {
              return 'handled';
            }
            if (s === 'OVERDUE') return 'overdue';
            if (s === 'DUE_SOON') return 'due_soon';
            return (activeFocus.status as any) || 'waiting_on_you';
          })(),
          primaryActionType: 'view',
          primaryActionLink: (() => {
            if (!activeFocus) return '';
            const type = (activeFocus.type || '').toUpperCase();
            const engagementId = activeFocus.engagementId;
            const moduleId = activeFocus.moduleId;
            const serviceBase = resolveServiceEngagementBase(activeFocus.service);

            // Chat handled specifically
            if (type === 'CHAT' && engagementId) {
              const base = serviceBase 
                ? `${serviceBase.replace('/dashboard/', `/dashboard/${activeCompanyId}/`)}/engagements/${engagementId}`
                : `/dashboard/${activeCompanyId}/engagements/${engagementId}`;
              const messageQuery = moduleId ? `&messageId=${moduleId}` : "";
              const todoQuery = `&todoId=${activeFocus.todoId}`;
              return `${base}?tab=chat${messageQuery}${todoQuery}`;
            }

            // Document requests handled specifically
            if ((type === 'DOCUMENT_REQUEST' || type === 'REQUESTED_DOCUMENT') && engagementId) {
              const base = serviceBase 
                ? `${serviceBase.replace('/dashboard/', `/dashboard/${activeCompanyId}/`)}/engagements/${engagementId}`
                : `/dashboard/${activeCompanyId}/engagements/${engagementId}`;
              const scrollQuery = moduleId ? `&scrollTo=${moduleId}` : "";
              return `${base}?tab=workFlow${scrollQuery}`;
            }

            // Default redirection logic for other types
            if (engagementId) {
              const base = serviceBase 
                ? `${serviceBase.replace('/dashboard/', `/dashboard/${activeCompanyId}/`)}/engagements/${engagementId}`
                : `/dashboard/${activeCompanyId}/engagements/${engagementId}`;
              return base;
            }

            // Fallback for tasks without engagement (custom tasks, general tasks)
            return `/dashboard/${activeCompanyId}/todo-list/todo-list-view?taskId=${btoa(String(activeFocus.todoId))}`;
          })(),
          primaryActionLabel: activeFocus.primaryActionLabel || 'Take Action',
          onPrimaryActionClick: async () => {
            if (activeFocus && activeFocus.type === 'CHAT' && activeFocus.todoId) {
                try {
                    // Update status on backend
                    await updateTodoStatus(activeFocus.todoId, 'ACTION_TAKEN');
                    
                    // Refresh data across the app
                    refreshSidebar().catch(console.error);
                    loadDashboardSummary(true).catch(console.error);
                } catch (e) {
                    console.error("Failed to update focus status on click", e);
                }
            }
          }
        } : null} />

        {/* Notice Board and Stats Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-stretch">
          {/* Notice Board */}
          <NoticeBoard />

          {/* Performance Indicators / Compliance Overview - Clickable Status Cards */}
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-5 px-1 pt-2 h-[34px] shrink-0">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-gray-700" />
                <h2 className="text-lg font-semibold text-gray-900 uppercase tracking-widest">Analytics</h2>
              </div>
            </div>

            <div className="grid grid-rows-3 gap-6 flex-1">
              {/* Workspace (big + action-first) */}
              <Link href={workspaceUrl} className="block h-full">
                <ShadowCard className="group p-5 h-full flex items-center justify-between gap-4 hover:border-primary/50 cursor-pointer overflow-hidden relative border-none shadow-sm hover:shadow-xl transition-all duration-300 bg-white">
                  <div className="flex items-center gap-5 relative z-10 w-full">
                    <div className="p-3.5 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                      <Briefcase className="h-7 w-7" />
                    </div>
                    <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <div>
                        <p className="text-lg font-bold text-gray-900 leading-tight">Workspace</p>
                        <p className="text-sm font-medium text-gray-500 mt-1">Requests & tasks</p>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
                         {todoCounts.overdue > 0 && <span className="bg-destructive/10 text-destructive text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wide border border-destructive/20">{todoCounts.overdue} Overdue</span>}
                         {todoCounts.waiting > 0 && <span className="bg-info/10 text-info text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wide border border-info/20">{todoCounts.waiting} Due Today</span>}
                      </div>
                    </div>
                    <Button className="h-10 px-5 rounded-xl font-medium bg-primary text-white hover:bg-primary/90 text-sm gap-2 whitespace-nowrap hidden md:flex shrink-0">
                      Open Workspace <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                  <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-primary/5 opacity-[0.5] rounded-full group-hover:scale-150 transition-transform duration-700 pointer-events-none" />
                </ShadowCard>
              </Link>
              
              {/* Drafts (approval-focused) */}
              <Link href={`/dashboard/${activeCompanyId}/documents`} className="block h-full">
                <ShadowCard className="group p-5 h-full flex items-center justify-between gap-4 hover:border-indigo-500/50 cursor-pointer overflow-hidden relative border-none shadow-sm hover:shadow-xl transition-all duration-300 bg-white">
                  <div className="flex items-center gap-5 relative z-10 w-full">
                    <div className="p-3.5 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                      <FileText className="h-7 w-7" />
                    </div>
                    <div className="flex-1">
                      <p className="text-lg font-bold text-gray-900 leading-tight">Drafts</p>
                      <p className="text-xs font-medium text-gray-500 mt-1">Review & approve</p>
                    </div>
                    <span className="text-indigo-600 border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 rounded-lg px-4 py-2 font-bold text-xs whitespace-nowrap hidden sm:flex items-center gap-1 shrink-0 transition-colors">
                      Open Drafts <ArrowRight className="w-3 h-3 ml-0.5" />
                    </span>
                  </div>
                  <div className="absolute -right-4 -bottom-4 w-28 h-28 bg-indigo-50 opacity-[0.5] rounded-full group-hover:scale-150 transition-transform duration-700 pointer-events-none" />
                </ShadowCard>
              </Link>
              
              {/* Deadlines (summary + status chips) */}
              <Link href={`/dashboard/${activeCompanyId}/compliance`} className="block h-full">
                <ShadowCard className="group p-5 h-full flex items-center justify-between gap-4 hover:border-emerald-500/50 cursor-pointer overflow-hidden relative border-none shadow-sm hover:shadow-xl transition-all duration-300 bg-white">
                  <div className="flex items-center gap-5 relative z-10 w-full">
                    <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                      <Calendar className="h-7 w-7" />
                    </div>
                    <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <div>
                        <p className="text-lg font-bold text-gray-900 leading-tight">Deadlines</p>
                        <p className="text-xs font-medium text-gray-500 mt-1">Upcoming filings</p>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
                         {todoCounts.overdue > 0 && <span className="bg-destructive/10 text-destructive text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wide border border-destructive/20">{todoCounts.overdue} Overdue</span>}
                         {todoCounts.dueSoon > 0 && <span className="bg-warning/10 text-warning text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wide border border-warning/20">{todoCounts.dueSoon} Due Soon</span>}
                         {todoCounts.waiting > 0 && <span className="bg-info/10 text-info text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wide border border-info/20">{todoCounts.waiting} Due Today</span>}
                      </div>
                    </div>
                    <span className="text-emerald-600 border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 rounded-lg px-4 py-2 font-bold text-xs whitespace-nowrap hidden sm:flex items-center gap-1 shrink-0 transition-colors">
                      View Calendar <ArrowRight className="w-3 h-3 ml-0.5" />
                    </span>
                  </div>
                  <div className="absolute -right-4 -bottom-4 w-28 h-28 bg-emerald-50 opacity-[0.5] rounded-full group-hover:scale-150 transition-transform duration-700 pointer-events-none" />
                </ShadowCard>
              </Link>
            </div>
          </div>
        </div>

        {/* Your Current Focus */}


        <div className="mt-6 mb-8">
          <NextComplianceDeadline />
        </div>

        <div className="flex flex-col gap-6 bg-gray-100 rounded-[10px]">
          {/* Redesigned Active Services - Top Full Width */}
          <div className="space-y-4 bg-white/50 p-4 rounded-2xl">
            <PageHeader
              title="Active Engagements"
              subtitle="Manage your ongoing accounting and tax services"
              animate={false}
              className="p-6"
            />
            <div className="grid grid-cols-1 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {activeServices.length > 0 ? (
                activeServices.map((service, idx) => {
                  const getIcon = (category: string) => {
                    if (category === "Bookkeeping") return <FileText className="text-blue-600" size={24} />;
                    if (category === "VAT") return <Briefcase className="text-amber-600" size={24} />;
                    if (category === "Audit") return <Search className="text-rose-600" size={24} />;
                    return <CheckCircle className="text-emerald-600" size={24} />;
                  };

                  const getIconBg = (category: string) => {
                    if (category === "Bookkeeping") return "bg-blue-50";
                    if (category === "VAT") return "bg-amber-50";
                    if (category === "Audit") return "bg-rose-50";
                    return "bg-emerald-50";
                  };

                  return (
                    <div key={idx} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-4 flex-1">
                        <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shrink-0", getIconBg(service.category))}>
                          {getIcon(service.category)}
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-xl font-bold text-gray-900">{service.name}</h4>
                          <div className="flex items-center gap-3">
                            {service.category === "Bookkeeping" && (
                              <span className="text-sm font-semibold text-gray-500">REG NO: REG#87777448</span>
                            )}
                            {service.nextDeadline && !['COMPLETED', 'HANDLED', 'SUBMITTED', 'PROCESSED', 'ACTION_TAKEN', 'UPLOADED', 'PENDING_REVIEW', 'DONE'].includes(service.status.toUpperCase()) && (
                              <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                                Due {new Date(service.nextDeadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                              </span>
                            )}
                            {service.status.toUpperCase().includes("WAITING") && !['COMPLETED', 'HANDLED', 'SUBMITTED', 'PROCESSED', 'ACTION_TAKEN', 'UPLOADED', 'PENDING_REVIEW', 'DONE'].includes(service.status.toUpperCase()) && (
                              <div className="flex items-center gap-1.5 text-rose-600 font-semibold text-sm">
                                <AlertCircle size={14} />
                                Action Required
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <Link href={service.href}>
                        <Button variant="default" size="icon" className="rounded-full hover:bg-gray-50">
                          <ArrowRight size={20} className="text-white" />
                        </Button>
                      </Link>
                    </div>
                  );
                })
              ) : (
                <div className="bg-white rounded-3xl border border-dashed border-gray-200 p-12 col-span-full flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center">
                    <Briefcase className="text-gray-300" size={32} />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-lg font-semibold text-gray-900">No active engagements</h4>
                    <p className="text-sm text-gray-500 max-w-[280px]">
                      You don&apos;t have any ongoing services at the moment. Explore our service library to get started.
                    </p>
                  </div>
                  <Link href={`/dashboard/${activeCompanyId}/library`}>
                    <Button variant="outline" className="rounded-xl px-6">
                      Explore Services
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div className="gap-6 items-stretch p-4">
            {/* Quick Actions - Bottom Left */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900 flex items-center gap-3">
                  <div className="w-1 h-6 bg-primary rounded-full" />
                  Quick Actions
                </h2>
              </div>
              <div className="flex flex-col gap-4">
                {[
                  { 
                    title: "Todo", 
                    description: "Manage tasks", 
                    icon: CheckSquare, 
                    path: `/dashboard/${activeCompanyId}/todo-list`,
                    color: "bg-primary"
                  },
                  { 
                    title: "Messages", 
                    description: "Team chat", 
                    icon: MessageCircle, 
                    path: `/dashboard/${activeCompanyId}/messages`,
                    color: "bg-indigo-600"
                  },
                  { 
                    title: "Compliance", 
                    description: "Regulatory tracking", 
                    icon: FileText, 
                    path: `/dashboard/${activeCompanyId}/compliance`,
                    color: "bg-emerald-600"
                  },
                  { 
                    title: "Settings", 
                    description: "Company settings", 
                    icon: User, 
                    path: `/dashboard/${activeCompanyId}/settings`,
                    color: "bg-gray-700"
                  }
                ].map((action, index) => (
                  <ShadowCard 
                    key={index} 
                    className="group p-5 hover:border-primary/50 cursor-pointer overflow-hidden relative border-none shadow-sm hover:shadow-xl transition-all duration-300 h-full flex flex-col justify-between bg-white"
                    onClick={() => router.push(action.path)}
                  >
                    <div className="space-y-3 relative z-10 flex items-center gap-5 h-full">
                      <div className={`w-10 h-10 rounded-xl ${action.color} flex items-center justify-center text-white shadow-xl group-hover:scale-110 transition-transform duration-300`}>
                        <action.icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-base text-gray-900">{action.title}</h3>
                        <p className="text-xs text-gray-500 leading-relaxed mt-1">{action.description}</p>
                      </div>
                      <div className="flex items-center text-primary font-bold text-xs group-hover:translate-x-1 transition-all duration-300 mt-2">
                        View <ArrowRight className="h-3 w-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                    {/* Decorative background element */}
                    <div className={`absolute -right-4 -bottom-4 w-24 h-24 ${action.color} opacity-[0.05] rounded-full group-hover:scale-150 transition-transform duration-700`} />
                  </ShadowCard>
                ))}
              </div>
            </div>

            {/* Refined Compliance Snapshot - Bottom Right */}
            {/* <DashboardCard className="overflow-hidden h-full flex flex-col">
              <div className="px-6 py-4 border-b border-gray-300 flex items-center gap-4">
                <div className="w-1 h-6 bg-gray-900 rounded-full" />
                <h3 className="text-lg font-medium text-gray-900">Compliance Snapshot</h3>
              </div>
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <Link href={`/dashboard/${activeCompanyId}/compliance`}>
                      <Kpi label="Due Today" value={complianceCounts.waiting} tone="info" />
                    </Link>
                    <Link href={`/dashboard/${activeCompanyId}/compliance`}>
                      <Kpi label="Upcoming" value={complianceCounts.upcoming || 0} tone="warning" />
                    </Link>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest px-1">Next Deadlines</p>
                    {nextCalendarDeadline || calendarDeadlines.length > 0 ? (
                      <div className="space-y-2">
                        {nextCalendarDeadline && (
                          <DashboardCard className="border border-info/30 bg-info/5 px-4 py-3">
                            <p className="text-sm font-bold text-gray-900">
                              {nextCalendarDeadline.company?.name ? `${nextCalendarDeadline.company.name} – ` : ""}
                              {nextCalendarDeadline.title}
                              {nextCalendarDeadline.dueDate
                                ? ` – ${new Date(nextCalendarDeadline.dueDate).toLocaleDateString('en-GB', {
                                    day: 'numeric',
                                    month: 'short',
                                  })}`
                                : ''}
                            </p>
                            <span className="text-[10px] text-info font-bold uppercase mt-1 inline-block">Next Calendar Entry</span>
                          </DashboardCard>
                        )}
                      </div>
                    ) : (
                      <DashboardCard className="border border-gray-200 bg-gray-50 px-4 py-6 text-center">
                        <p className="text-sm font-bold text-gray-400 italic">No upcoming compliance deadlines</p>
                      </DashboardCard>
                    )}
                  </div>
                </div>
              </div>
            </DashboardCard> */}
          </div>
        </div>

      </div>
    </div>
  );
}

function Kpi({ label, value, tone }: { label: string; value: number; tone: "danger" | "warning" | "info" | "success" }) {
  const toneBorders: Record<typeof tone, string> = {
    danger: "border-destructive/30",
    warning: "border-warning/30",
    info: "border-info/30",
    success: "border-success/30",
  };
  const toneText: Record<typeof tone, string> = {
    danger: "text-destructive",
    warning: "text-warning",
    info: "text-info",
    success: "text-success",
  };
  const toneBg: Record<typeof tone, string> = {
    danger: "bg-destructive/5",
    warning: "bg-warning/5",
    info: "bg-info/5",
    success: "bg-success/5",
  };

  return (
    <DashboardCard className={`border ${toneBorders[tone]} ${toneBg[tone]} px-4 py-4 group`}>
      <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest mb-1">{label}</p>
      <div className="flex items-end gap-1">
        <p className={`text-2xl font-semibold ${toneText[tone]} tabular-nums`}>{value}</p>
        <span className="text-[10px] font-medium text-muted-foreground/60 mb-1">items</span>
      </div>
    </DashboardCard>
  );
}

function UploadProgress({ label, value, total, color, icon, link }: {
  label: string;
  value: number;
  total: number;
  color: string;
  icon: string;
  link: string;
}) {
  const percentage = total > 0 ? (value / total) * 100 : 0;

  return (
    <DashboardCard className="p-2">
      <div className="flex justify-between items-center">
        <div className="flex gap-3 items-center">
          <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center group-hover/progress:bg-gray-900 group-hover/progress:text-white transition-all duration-300">
            <img src={icon} alt={label} className="w-4 h-4 group-hover/progress:invert transition-all duration-300" />
          </div>
          <p className="text-md text-brand-body font-medium">
            {label}: <span className="text-muted-foreground ml-1 tabular-nums">{value}</span>
          </p>
        </div>
        <Link href={link} passHref>
          <div className="w-7 h-7 rounded-full bg-white border border-border/40 flex items-center justify-center cursor-pointer shadow-sm hover:shadow-md hover:scale-110 transition-all">
            <i className="fi fi-br-plus text-primary text-[10px]"></i>
          </div>
        </Link>
      </div>
      <div className="h-1.5 w-full rounded-full bg-muted/20 relative overflow-hidden">
        <div
          className={`h-full rounded-full ${color} transition-all duration-1000 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </DashboardCard>
  );
}
