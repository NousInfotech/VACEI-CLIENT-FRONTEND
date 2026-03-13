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
import { format, isPast, isToday } from "date-fns";
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
import AttentionBanner from "@/components/dashboard/company/AttentionBanner";
import CompanyNoticeBoard from "@/components/dashboard/company/CompanyNoticeBoard";
import CompanyAnalytics from "@/components/dashboard/company/CompanyAnalytics";
import ComplianceDeadlineCard from "@/components/dashboard/company/ComplianceDeadlineCard";
import ActiveEngagementsList from "@/components/dashboard/company/ActiveEngagementsList";
import AIOptionsSuggestions from "@/components/dashboard/company/AIOptionsSuggestions";


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
  const { sidebarData } = useGlobalDashboard();

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

  const engagementComplianceMap = useMemo(() => {
    const map: Record<string, any> = {};
    if (sidebarData) {
      sidebarData.forEach(s => {
        if (s.activeEngagements) {
          s.activeEngagements.forEach(e => {
            map[e.id] = s.worstCompliance;
          });
        }
      });
    }
    return map;
  }, [sidebarData]);

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

        const nextEntry = upcomingEntries[0] || null;
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
      id: e.id,
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

  const mappedEngagements = activeServices.map(s => ({
    id: s.id || Math.random().toString(),
    name: s.name,
    status: s.status, // Internal workflow status (e.g. "Waiting for Information")
    complianceStatus: (engagementComplianceMap[s.id] || "ON_TRACK") as any,
    href: s.href
  }));

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

  const isLoadingDashboard = authLoading || !dashboardSummary;
  const isFinancialLoading = loading;

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
    <div className="min-h-screen">
      <div className="mx-auto space-y-5">
        {/* Header Section */}
        <PageHeader
          title={getGreeting()}
          subtitle={username ? "Here's your business tasks and what's happening today." : "Welcome back! Here's what's happening with your business today."}
          activeCompany={companies.find(c => c.id === activeCompanyId)?.name || "ACME LTD"}
          todoStats={{
            total: todoCounts.done,
            completed: 0,
            healthStatus: healthStatus as 'Action Required' | 'Healthy'
          }}
          todoStatsHref={`/dashboard/${activeCompanyId}/todo-list`}
          isLoading={isLoadingDashboard}
        />

        {/* 1. Attention Banner */}
        <div className="animate-in fade-in slide-in-from-top-4 duration-500">
            <AttentionBanner 
                title={activeFocus?.serviceName || "Action Required"}
                subtitle={`Follow up: ${activeFocus?.taskDescription || "compliance-status"}`}
                onAction={() => router.push(workspaceUrl)}
                isLoading={isLoadingDashboard}
            />
        </div>

        {/* 2. Main content area (Split into rows for explicit alignment) */}
        
        {/* Top Row: Notice Board & Deadlines | Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            <div className="lg:col-span-8 space-y-5">
                <CompanyNoticeBoard isLoading={isLoadingDashboard} />
                <ComplianceDeadlineCard 
                    title={nextCalendarDeadline?.title}
                    dueDate={nextCalendarDeadline?.dueDate ? format(new Date(nextCalendarDeadline.dueDate), "MMM dd, yyyy") : undefined}
                    description={nextCalendarDeadline?.description || ""}
                    category={nextCalendarDeadline?.serviceCategory}
                    frequency={nextCalendarDeadline?.frequency}
                    startDate={nextCalendarDeadline?.startDate}
                    isLoading={isLoadingDashboard}
                />
            </div>
            <div className="lg:col-span-4">
                <CompanyAnalytics isLoading={isFinancialLoading || isLoadingDashboard} />
            </div>
        </div>

        {/* Bottom Row: Active Engagements & AI Suggestions | Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            <div className="lg:col-span-8">
                <ActiveEngagementsList engagements={mappedEngagements} isLoading={isLoadingDashboard} />
            </div>
            <div className="lg:col-span-4">
                <AIOptionsSuggestions isLoading={isLoadingDashboard} />
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
