"use client";
import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useActiveCompany } from "@/context/ActiveCompanyContext";
import StatCard from "@/components/StatCard";
import DashboardCard from "@/components/DashboardCard";
import DashboardActionButton from "@/components/DashboardActionButton";
import PageHeader from "@/components/shared/PageHeader";
import CashFlowChart from "@/components/CashFlowChart";
import PLSummaryChart from "@/components/PLSummaryChart";
import { getDecodedUsername, verifyAuthentication, handleAuthError } from "@/utils/authUtils";
import { fetchDashboardSummary, ProcessedDashboardStat } from "@/api/financialReportsApi";
import NoticeBoard from "@/components/dashboard/NoticeBoard";
import { fetchUploadStatusSummary } from "@/api/documentApi";
import { fetchTasks } from "@/api/taskService";
import type { Task } from "@/interfaces";
import { fetchPayrollData, transformPayrollSubmissionsToComplianceItems } from "@/lib/payrollComplianceIntegration";
import { HugeiconsIcon } from '@hugeicons/react';
import { AddressBookIcon, Alert02Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { User, AlertCircle, CheckCircle, ArrowRight, Clock, MoreVertical, Upload, Plus, MessageCircle, Calendar, CheckSquare, FileText, Search, Briefcase } from "lucide-react";
import { getOnboardingProgress } from "@/api/onboardingService";
import CurrentFocus, { FocusItem } from "@/components/dashboard/CurrentFocus";
import NextComplianceDeadline from "@/components/dashboard/NextComplianceDeadline";

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

export default function DashboardPage() {
  const router = useRouter();
  const [uploadSummary, setUploadSummary] = useState<UploadStatusSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadLoading, setUploadLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true); // Loading state for auth verification
  const [revenueYTD, setRevenueYTD] = useState<{ amount: string; change: string } | null>(null);
  const [netIncomeYTD, setNetIncomeYTD] = useState<{ amount: string; change: string } | null>(null);
  const [username, setUsername] = useState<string>(''); // State for username to avoid hydration error
  const [complianceCounts, setComplianceCounts] = useState({ overdue: 0, dueSoon: 0, waiting: 0, done: 0 });
  // Use context instead of local state
  const { activeCompanyId, companies, setCompanies } = useActiveCompany();
  const loadingCompanies = false; // Context handles loading implicitely or we can add it if needed
  const [stats, setStats] = useState<ProcessedDashboardStat[]>([]);

  // CRITICAL: Verify authentication on mount (before loading any data)
  // This prevents page flash by showing loading state while verifying
  useEffect(() => {
    const checkAuthentication = async () => {
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
          
          router.push('/login?message=' + encodeURIComponent('Session expired. Please login again.'));
          return; // Don't proceed with loading data
        }
        
        // Authentication verified - proceed with loading dashboard data
        setAuthLoading(false);
      } catch (error) {
        console.error('Authentication check failed:', error);
        // On error, treat as unauthenticated
        handleAuthError(error, router);
      }
    };
    
    checkAuthentication();
  }, [router]);

  // Fetch companies from backend
  useEffect(() => {
    if (authLoading) return; // Wait for auth verification
    
    const fetchCompanies = async () => {
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
          }));
          setCompanies(mappedCompanies);
        }
      } catch (error) {
        console.error("Failed to fetch companies:", error);
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

  // Load dashboard data (only after auth is verified)
  useEffect(() => {
    if (authLoading) return; // Wait for auth verification
    
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        const fetchedStats = await fetchDashboardSummary();
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
        // Extract YTD data for Yearly Progress BEFORE filtering for StatCards
        /*  const revenueYTDStat = fetchedStats.find((stat: { title: string; }) => stat.title === "Revenue YTD");
         const netIncomeYTDStat = fetchedStats.find((stat: { title: string; }) => stat.title === "Net income YTD");
 
         if (revenueYTDStat) {
           setRevenueYTD({ amount: revenueYTDStat.amount, change: revenueYTDStat.change });
         }
         if (netIncomeYTDStat) {
           setNetIncomeYTD({ amount: netIncomeYTDStat.amount, change: netIncomeYTDStat.change });
         } */

        // Filter out YTD stats from the array to be displayed as cards
        const filteredStats = fetchedStats.stats.filter(
          (stat: { title: string; }) => stat.title !== "Revenue YTD" && stat.title !== "Net income YTD"
        );
        setStats(filteredStats);

      } catch (error: any) {
        console.error("Failed to load dashboard summary:", error);
        
        // Handle authentication errors
        if (error?.message?.toLowerCase().includes('authentication') || 
            error?.message?.toLowerCase().includes('unauthorized') ||
            error?.status === 401 || 
            error?.status === 403) {
          handleAuthError(error, router);
          return; // Don't set loading to false, redirect will happen
        }
        
        // Other errors - show empty state
        setStats([]);
        setRevenueYTD(null);
        setNetIncomeYTD(null);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, [router, authLoading, activeCompanyId]);

  useEffect(() => {
    const loadUploadSummary = async () => {
      setUploadLoading(true);
      try {
        const summary = await fetchUploadStatusSummary();
        setUploadSummary(summary);
      } catch (error) {
        console.error("Failed to load upload status summary:", error);
        setUploadSummary(null);
      } finally {
        setUploadLoading(false);
      }
    };
    loadUploadSummary();
  }, []);

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const taskResponse = await fetchTasks({ page: 1 });
        const tasks = taskResponse.data || [];
        const now = new Date();
        let overdue = 0, dueSoon = 0, waiting = 0, done = 0;
        tasks.forEach((t: any) => {
          const status = (t.status || "").toLowerCase();
          const due = t.dueDate ? new Date(t.dueDate) : null;
          if (status.includes("resolved") || status.includes("done")) {
            done += 1;
            return;
          }
          if (due) {
            const diff = (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
            if (diff < 0) overdue += 1;
            else if (diff <= 7) dueSoon += 1;
          }
          waiting += 1;
        });
        // Include payroll submissions in compliance counts
        const payrollData = await fetchPayrollData();
        if (payrollData) {
          const payrollItems = transformPayrollSubmissionsToComplianceItems(payrollData, 1000000);
          payrollItems.forEach((item) => {
            if (item.status === "Overdue") overdue += 1;
            else if (item.status === "Due soon") dueSoon += 1;
            else if (item.status === "Waiting on you") waiting += 1;
            else if (item.status === "Completed") done += 1;
          });
        }
        
        setComplianceCounts({ overdue, dueSoon, waiting, done });
      } catch (e) {
        console.error("Failed to load tasks for compliance snapshot", e);
      }
    };
    loadTasks();
  }, []);

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

  const activeServices = [
    { name: "Bookkeeping", status: "In progress", next: "Review March", nextStepType: "client", href: "/dashboard/services/bookkeeping" },
    { name: "VAT", status: "Due soon (30 Jun)", next: "Missing docs", nextStepType: "client", href: "/dashboard/services/vat" },
    { name: "Tax", status: "In progress", next: "Review documents", nextStepType: "client", href: "/dashboard/services/tax" },
    { name: "Payroll", status: "Done", next: "Next run 28th", nextStepType: "vacei", href: "/dashboard/services/payroll" },
    { name: "Audit", status: "Waiting on you", next: "Reply Q#12", nextStepType: "client", href: "/dashboard/services/audit" },
  ];
  const recentlyCompleted = [
    { text: "VAT Q1 submitted", action: "View receipt", href: "/dashboard/services/vat" },
    { text: "Payroll May filed", action: "View confirmation", href: "/dashboard/services/payroll" },
    { text: "MBR BO2 submitted", action: "View form", href: "/dashboard/services/csp-mbr/mbr-submissions/BO2" },
  ];
  const recentActivity = [
    { text: "9 docs uploaded today", time: "2 hours ago", service: "Documents", href: "/dashboard/documents" },
    { text: "VAT checks completed", time: "5 hours ago", service: "VAT", href: "/dashboard/services/vat" },
  ];
  const messagesUpdates = [
    { text: "Need 1 more invoice", sender: "John (Accountant)", time: "1 hour ago" },
    { text: "Audit query sent", sender: "System", time: "3 hours ago" },
  ];
  const healthStatus = complianceCounts.overdue > 0 ? "Needs attention" : complianceCounts.dueSoon > 0 ? "Needs attention" : "Healthy";
  
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

  // Show loading state while verifying authentication (prevents page flash)
  if (authLoading) {
    return (
      <div className="min-h-screen bg-brand-body flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
          <p className="text-gray-600">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-body p-4">
      <div className=" mx-auto space-y-8">
        {/* Premium Dashboard Header */}
        <PageHeader 
          title={getGreeting()}
          subtitle={username ? "Here's your compliance status and what's happening with your business today." : "Welcome back! Here's what's happening with your business today."}
          activeCompany={companies.find(c => c.id === activeCompanyId)?.name || "ACME LTD"}
          badge={
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-700 font-bold text-xs uppercase tracking-widest shadow-sm text-white`}>
              <span className={`w-2 h-2 rounded-full animate-pulse ${
                healthStatus === "Healthy" ? "bg-success" : "bg-warning"
              }`}></span>
              {healthStatus}
            </div>
          }
          riskLevel={undefined}
          // actions={
          //   <DashboardActionButton 
          //     Icon={User}
          //     title="Contact Accountant"
          //     subtitle="Get expert assistance"
          //     onClick={handleContactAccountantClick}
          //     className="bg-white/5 border border-white/10 hover:bg-white/10 text-white"
          //   />
          // }
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

        <CurrentFocus item={(() => {
          // Priority logic for current focus
          // 1. Overdue
          // 2. Due soon
          // 3. Waiting
          
          if (complianceCounts.overdue > 0) {
            return {
              serviceName: "Compliance",
              taskDescription: "You have overdue regulatory filings that require immediate action",
              status: 'overdue',
              primaryActionType: 'upload',
              primaryActionLink: '/dashboard/todo-list?filter=overdue',
              secondaryActionLink: '/dashboard/compliance'
            } as FocusItem;
          } else if (complianceCounts.dueSoon > 0) {
            return {
              serviceName: "VAT Return",
              taskDescription: "Upcoming deadline. Please confirm no changes for the period.",
              status: 'due_soon',
              primaryActionType: 'confirm',
              primaryActionLink: '/dashboard/services/vat',
              secondaryActionLink: '/dashboard/compliance'
            } as FocusItem;
          } else if (complianceCounts.waiting > 0) {
            // Find a service that is waiting
            const focusService = activeServices.find(s => s.status.toLowerCase().includes('waiting')) || activeServices[0];
            return {
              serviceName: focusService.name,
              taskDescription: focusService.next,
              status: 'waiting_on_you',
              primaryActionType: 'view',
              primaryActionLink: focusService.href,
              secondaryActionLink: '/dashboard/todo-list'
            } as FocusItem;
          }
          return null; // All set!
        })()} />

        {/* Notice Board and Stats Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          {/* Notice Board */}
          <NoticeBoard />

          {/* Performance Indicators / Compliance Overview - Clickable Status Cards */}
          <div>
            <div className="flex items-center justify-between mb-5 px-1 pt-2 h-[34px]">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-gray-700" />
                <h2 className="text-lg font-semibold text-gray-900 uppercase tracking-widest">Compliance Overview</h2>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-6" style={{ height: '280px' }}>
              <Link href="/dashboard/todo-list?filter=overdue" className="h-[128px]">
                <DashboardCard animate className="p-5 cursor-pointer hover:shadow-lg transition-all h-full flex flex-col justify-center">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-medium text-gray-700 tracking-widest uppercase">Action needed</span>
                    <span className="text-3xl font-semibold text-destructive tabular-nums">{complianceCounts.overdue}</span>
                  </div>
                </DashboardCard>
              </Link>
              <Link href="/dashboard/compliance?filter=due-soon" className="h-[128px]">
                <DashboardCard animate className="p-5 cursor-pointer hover:shadow-lg transition-all h-full flex flex-col justify-center">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-medium text-gray-700 tracking-widest uppercase">Due soon</span>
                    <span className="text-3xl font-semibold text-warning tabular-nums">{complianceCounts.dueSoon}</span>
                  </div>
                </DashboardCard>
              </Link>
              <Link href="/dashboard/todo-list?filter=waiting" className="h-[128px]">
                <DashboardCard animate className="p-5 cursor-pointer hover:shadow-lg transition-all h-full flex flex-col justify-center">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-medium text-gray-700 tracking-widest uppercase">Overdue</span>
                    <span className="text-3xl font-semibold text-info tabular-nums">{complianceCounts.waiting}</span>
                  </div>
                </DashboardCard>
              </Link>
              <Link href="/dashboard/compliance?filter=completed" className="h-[128px]">
                <DashboardCard animate className="p-5 cursor-pointer hover:shadow-lg transition-all h-full flex flex-col justify-center">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-medium text-gray-700 tracking-widest uppercase">Active services</span>
                    <span className="text-3xl font-semibold text-success tabular-nums">{complianceCounts.done}</span>
                  </div>
                </DashboardCard>
              </Link>
            </div>
          </div>
        </div>

        {/* Your Current Focus */}
 

        <div className="mt-6 mb-8">
          <NextComplianceDeadline />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Priority Actions & Services */}
          <div className="lg:col-span-2 space-y-6">
            {/* Redesigned Active Services */}
            <div className="space-y-4">
              <div className="flex flex-col">
                <h3 className="text-2xl font-bold text-gray-900">Active Services</h3>
                <p className="text-sm text-gray-500">Manage your ongoing accounting and tax services</p>
              </div>
              
              <div className="space-y-3">
                {activeServices.map((service, idx) => {
                  const getIcon = (name: string) => {
                    if (name === "Bookkeeping") return <FileText className="text-blue-600" size={24} />;
                    if (name === "VAT") return <Briefcase className="text-amber-600" size={24} />;
                    if (name === "Audit") return <Search className="text-rose-600" size={24} />;
                    return <CheckCircle className="text-emerald-600" size={24} />;
                  };

                  const getIconBg = (name: string) => {
                    if (name === "Bookkeeping") return "bg-blue-50";
                    if (name === "VAT") return "bg-amber-50";
                    if (name === "Audit") return "bg-rose-50";
                    return "bg-emerald-50";
                  };

                  return (
                    <div key={idx} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-4 flex-1">
                        <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shrink-0", getIconBg(service.name))}>
                          {getIcon(service.name)}
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-xl font-bold text-gray-900">{service.name}</h4>
                          <div className="flex items-center gap-3">
                            {service.name === "Bookkeeping" && (
                              <span className="text-sm font-semibold text-gray-500">REG NO: REG#87777448</span>
                            )}
                            {service.name === "VAT" && (
                              <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Due 30 June</span>
                            )}
                            {service.name === "Audit" && service.status.includes("Waiting") && (
                              <div className="flex items-center gap-1.5 text-rose-600 font-semibold text-sm">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                                <span>Waiting for your response</span>
                              </div>
                            )}
                            <span className="text-sm text-gray-500">{service.name === "Bookkeeping" ? "Month documents" : service.name === "VAT" ? "Next step: Review March documents" : service.next}</span>
                          </div>
                        </div>
                      </div>
                      <Link href={service.href}>
                        <Button className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-5 py-2.5 h-auto flex items-center gap-2 group">
                          View Details
                          <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recently Completed */}
            {/* <DashboardCard className="overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-1 h-6 bg-gray-900 rounded-full" />
                  <h3 className="text-xl font-semibold text-gray-900">Recently Completed</h3>
                </div>
                <span className="text-[10px] uppercase bg-black text-white px-2 py-1 rounded-full font-medium">3 New</span>
              </div>
              <div className="p-4 space-y-3">
                {recentlyCompleted.map((item, idx) => (
                  <DashboardCard key={idx} className="group/completed flex items-center justify-between rounded-xl border border-gray-50 bg-gray-50/50 px-4 py-3 transition-all duration-300 gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 shrink-0 flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 text-gray-600" />
                      </div>
                      <span className="text-base font-medium truncate">{item.text}</span>
                    </div>
                    <Link href={item.href} className="shrink-0">
                      <Button size="sm" className="whitespace-nowrap">
                        {item.action}
                      </Button>
                    </Link>
                  </DashboardCard>
                ))}
              </div>
            </DashboardCard> */}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <DashboardCard className="overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-300 flex items-center gap-4">
                <div className="w-1 h-6 bg-gray-900 rounded-full" />
                <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
              </div>
              <div className="flex flex-col gap-2 p-3">
                <Link href="/dashboard/document-organizer/document-upload">
                  <Button variant="outline" className="w-full justify-start gap-3 h-11 border-gray-100 hover:bg-gray-50 transition-colors">
                    <Upload className="w-4 h-4" />
                    <span>Upload document</span>
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  className="w-full justify-start gap-3 h-11 border-gray-100 hover:bg-gray-50 transition-colors"
                  onClick={handleContactAccountantClick}
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Message advisor</span>
                </Button>
                <Link href="/dashboard/compliance">
                  <Button variant="outline" className="w-full justify-start gap-3 h-11 border-gray-100 hover:bg-gray-50 transition-colors">
                    <Calendar className="w-4 h-4" />
                    <span>View deadlines</span>
                  </Button>
                </Link>
              </div>
            </DashboardCard>

            {/* Refined Compliance Snapshot */}
            <DashboardCard className="overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-300 flex items-center gap-4">
                <div className="w-1 h-6 bg-gray-900 rounded-full" />
                <h3 className="text-lg font-medium text-gray-900">Compliance Snapshot</h3>
              </div>
              <div className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Kpi label="Overdue" value={complianceCounts.overdue} tone="danger" />
                  <Kpi label="Due soon" value={complianceCounts.dueSoon} tone="warning" />
                </div>
                <DashboardCard className="border border-info/30 bg-info/5 px-4 py-3">
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest mb-1">Next Deadline</p>
                  <p className="text-sm font-bold text-gray-900">VAT Return – 30 June</p>
                </DashboardCard>
              </div>
            </DashboardCard>
          </div>

          {/* Activity Feed - Full Width */}
          {/* <div className="lg:col-span-3">
            <DashboardCard className="overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-4">
                <div className="w-1 h-6 bg-gray-900 rounded-full" />
                <h3 className="text-xl font-semibold text-gray-900">Activity Feed</h3>
              </div>
              <div className="p-5 space-y-6">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <p className="text-[12px] font-bold uppercase tracking-widest mb-3 text-gray-400">Live Updates</p>
                    <div className="flex flex-col gap-3">
                      {recentActivity.map((activity, idx) => (
                        <Link key={idx} href={activity.href}>
                          <DashboardCard className="p-4 border-none shadow-sm bg-gray-50/50 hover:bg-white transition-all transform hover:-translate-x-1 cursor-pointer">
                            <div className="flex gap-4 items-start">
                              <div className="mt-1.5 shrink-0">
                                <div className="w-2 h-2 rounded-full bg-gray-900" />
                              </div>
                              <div className="space-y-1 flex-1 min-w-0">
                                <p className="text-base font-medium leading-tight text-gray-700">{activity.text}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-primary/10 text-primary uppercase tracking-widest">
                                    {activity.service}
                                  </span>
                                  <p className="text-[10px] font-medium text-gray-500 uppercase tracking-widest">{activity.time}</p>
                                </div>
                              </div>
                            </div>
                          </DashboardCard>
                        </Link>
                      ))}
                    </div>
                  </div>
                  
                  <div className="pt-5 md:pt-0 md:border-l md:border-gray-100 md:pl-8">
                    <p className="text-[12px] font-bold uppercase tracking-widest mb-3 text-gray-400">Client Alerts</p>
                    <div className="space-y-3">
                      {messagesUpdates.map((msg, idx) => (
                        <DashboardCard key={idx} className="p-4 border-none shadow-sm bg-gray-50/50 hover:bg-white transition-all transform hover:-translate-x-1">
                          <p className="text-sm font-medium text-gray-700 italic leading-relaxed">"{msg.text}"</p>
                          <div className="mt-2 flex justify-between items-center text-[10px] font-medium tracking-widest text-gray-700">
                            <span>{msg.sender}</span>
                            <span>{msg.time}</span>
                          </div>
                        </DashboardCard>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </DashboardCard>
          </div> */}
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
