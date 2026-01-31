"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
import { User, AlertCircle, CheckCircle, ArrowRight, Clock, MoreVertical, Upload, Plus, MessageCircle, Calendar, CheckSquare } from "lucide-react";
import { getOnboardingProgress } from "@/api/onboardingService";

// Company interface
interface Company {
  id: string;
  name: string;
  registrationNumber?: string;
}

interface UploadStatusSummary {
  documentsUploaded: number;
  documentsProcessed: number;
  documentsPending: number;
  documentsNeedsCorrection: number;
  filesUploadedThisMonth: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<ProcessedDashboardStat[]>([]);
  const [uploadSummary, setUploadSummary] = useState<UploadStatusSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadLoading, setUploadLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true); // Loading state for auth verification
  const [revenueYTD, setRevenueYTD] = useState<{ amount: string; change: string } | null>(null);
  const [netIncomeYTD, setNetIncomeYTD] = useState<{ amount: string; change: string } | null>(null);
  const [username, setUsername] = useState<string>(''); // State for username to avoid hydration error
  const [complianceCounts, setComplianceCounts] = useState({ overdue: 0, dueSoon: 0, waiting: 0, done: 0 });
  const [activeCompany, setActiveCompany] = useState<string>("ACME LTD");
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);

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
      setLoadingCompanies(true);
      try {
        const backendUrl = process.env.NEXT_PUBLIC_VACEI_BACKEND_URL?.replace(/\/?$/, "/") || "http://localhost:5000/api/v1/";
        const token = localStorage.getItem('token');
        
        if (!token) {
          console.warn('No token found, cannot fetch companies');
          setLoadingCompanies(false);
          return;
        }

        const response = await fetch(`${backendUrl}companies`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch companies: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        const companiesData = result.data || result || [];
        
        // Map backend response to Company interface
        const mappedCompanies: Company[] = companiesData.map((c: any) => ({
          id: c.id,
          name: c.name,
          registrationNumber: c.registrationNumber,
        }));

        setCompanies(mappedCompanies);
        
        // Store in localStorage
        localStorage.setItem("vacei-companies", JSON.stringify(mappedCompanies));
            
        // Set active company - prioritize stored companyId, otherwise use first company
        const storedActiveCompanyId = localStorage.getItem("vacei-active-company");
        if (mappedCompanies.length > 0) {
          if (storedActiveCompanyId) {
            const company = mappedCompanies.find(c => c.id === storedActiveCompanyId);
            if (company) {
              setActiveCompany(company.name);
              console.log('✅ Active company set from stored ID:', company.name);
            } else {
              // If stored ID doesn't exist in fetched companies, use first company
              setActiveCompany(mappedCompanies[0].name);
              localStorage.setItem("vacei-active-company", mappedCompanies[0].id);
              console.log('⚠️ Stored company ID not found, using first company:', mappedCompanies[0].name);
            }
          } else {
            // No stored company, use first one
            setActiveCompany(mappedCompanies[0].name);
            localStorage.setItem("vacei-active-company", mappedCompanies[0].id);
            console.log('✅ Active company set to first company:', mappedCompanies[0].name);
          }
        } else {
          console.warn('⚠️ No companies returned from API');
        }
      } catch (error) {
        console.error("Failed to fetch companies:", error);
        // Fallback to localStorage if available (e.g., after onboarding completion)
        const storedCompanies = localStorage.getItem("vacei-companies");
        if (storedCompanies) {
          try {
            const parsed = JSON.parse(storedCompanies);
            setCompanies(parsed);
            console.log('✅ Using companies from localStorage fallback:', parsed);
            
            const storedCompanyId = localStorage.getItem("vacei-active-company");
            if (parsed.length > 0) {
              if (storedCompanyId) {
                const company = parsed.find((c: Company) => c.id === storedCompanyId);
              if (company) {
                setActiveCompany(company.name);
                  console.log('✅ Active company set from localStorage:', company.name);
                } else {
                  setActiveCompany(parsed[0].name);
                  localStorage.setItem("vacei-active-company", parsed[0].id);
                  console.log('✅ Active company set to first from localStorage:', parsed[0].name);
                }
              } else {
                setActiveCompany(parsed[0].name);
                localStorage.setItem("vacei-active-company", parsed[0].id);
                console.log('✅ Active company set to first from localStorage:', parsed[0].name);
              }
            }
          } catch (e) {
            console.error("Failed to parse stored companies:", e);
        }
        } else {
          console.warn('⚠️ No companies in localStorage and API fetch failed');
        }
      } finally {
        setLoadingCompanies(false);
    }
    };

    fetchCompanies();
  }, [authLoading]);

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
  }, [router, authLoading]);

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

  const totalUploaded = uploadSummary?.documentsUploaded || 0;
  const processedPercentage = totalUploaded > 0 ? ((uploadSummary?.documentsProcessed || 0) / totalUploaded) * 100 : 0;
  const pendingPercentage = totalUploaded > 0 ? ((uploadSummary?.documentsPending || 0) / totalUploaded) * 100 : 0;
  const needCorrectionPercentage = totalUploaded > 0 ? ((uploadSummary?.documentsNeedsCorrection || 0) / totalUploaded) * 100 : 0;
  const encodedPendingStatus = btoa('1');
  const encodedProcessedStatus = btoa('2');
  const encodedNeedCorrectionStatus = btoa('3');

  const activeServices = [
    { name: "Bookkeeping", status: "In progress", next: "Review March", nextStepType: "client", href: "/dashboard/services/bookkeeping" },
    { name: "VAT & Tax", status: "Due soon (30 Jun)", next: "Missing docs", nextStepType: "client", href: "/dashboard/services/vat" },
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
    { text: "VAT checks completed", time: "5 hours ago", service: "VAT & Tax", href: "/dashboard/services/vat" },
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
    <div className="min-h-screen bg-brand-body p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Premium Dashboard Header */}
        <PageHeader 
          title={getGreeting()}
          subtitle={username ? "Here's your compliance status and what's happening with your business today." : "Welcome back! Here's what's happening with your business today."}
          activeCompany={activeCompany}
          badge={
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-700 font-bold text-xs uppercase tracking-widest shadow-sm text-white`}>
              <span className={`w-2 h-2 rounded-full animate-pulse ${
                healthStatus === "Healthy" ? "bg-success" : "bg-warning"
              }`}></span>
              {healthStatus}
            </div>
          }
          riskLevel={riskLevel}
          actions={
            <DashboardActionButton 
              Icon={User}
              title="Contact Accountant"
              subtitle="Get expert assistance"
              onClick={handleContactAccountantClick}
              className="bg-white/5 border border-white/10 hover:bg-white/10 text-white"
            />
          }
        />

        {/* Notice Board */}
        <NoticeBoard />
        {/* Warning Banner */}
        {!uploadLoading && uploadSummary?.filesUploadedThisMonth === 0 && (
          <DashboardCard>
            <div className="px-8 py-5 flex items-center gap-6">
              <div className="shrink-0">
                <DashboardCard className="p-3 bg-[#0f1729]">
                  <AlertCircle className="w-6 h-6" color="white"/>
                </DashboardCard>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-warning text-white uppercase tracking-widest">
                    Warning
                  </span>
                </div>
                <p className="text-lg text-gray-700 font-medium leading-relaxed">
                No documents uploaded this month.
                </p>
              </div>
            </div>
          </DashboardCard>
        )}



      {/* Performance Indicators / Compliance Overview - Clickable Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Link href="/dashboard/todo-list?filter=overdue">
          <DashboardCard animate className="p-6 cursor-pointer hover:shadow-lg transition-all">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-gray-700 tracking-widest">Overdue</span>
            <span className="text-3xl font-semibold text-destructive tabular-nums">{complianceCounts.overdue}</span>
          </div>
        </DashboardCard>
        </Link>
        <Link href="/dashboard/compliance?filter=due-soon">
          <DashboardCard animate className="p-6 cursor-pointer hover:shadow-lg transition-all">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-gray-700 tracking-widest">Due soon (7d)</span>
            <span className="text-3xl font-semibold text-warning tabular-nums">{complianceCounts.dueSoon}</span>
          </div>
        </DashboardCard>
        </Link>
        <Link href="/dashboard/todo-list?filter=waiting">
          <DashboardCard animate className="p-6 cursor-pointer hover:shadow-lg transition-all">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-gray-700 tracking-widest">Waiting</span>
            <span className="text-3xl font-semibold text-info tabular-nums">{complianceCounts.waiting}</span>
          </div>
        </DashboardCard>
        </Link>
        <Link href="/dashboard/compliance?filter=completed">
          <DashboardCard animate className="p-6 cursor-pointer hover:shadow-lg transition-all">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-gray-700 tracking-widest">Completed (30d)</span>
            <span className="text-3xl font-semibold text-success tabular-nums">{complianceCounts.done}</span>
          </div>
        </DashboardCard>
        </Link>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Priority Actions & Services */}
        <div className="lg:col-span-2 space-y-6">
          {/* Modern Active Services */}
          <DashboardCard className="overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-100 flex items-center gap-4">
              <div className="w-1 h-7 bg-gray-900 rounded-full" />
              <div className="flex flex-col">
              <h3 className="text-xl font-semibold text-gray-900">Active Services</h3>
              <p className="text-sm text-gray-600">Manage your ongoing accounting and tax services</p>
              </div>
            </div>
            <div className="p-6">
              <div className="grid sm:grid-cols-2 gap-4">
                {activeServices.map((service, idx) => (
                  <DashboardCard key={idx} className="group/service relative rounded-xl border bg-white/50 p-5 transition-all duration-300">
                    <div className="flex items-start justify-between mb-4 gap-3">
                      <div className="space-y-1 min-w-0">
                        <h4 className="font-semibold text-xl truncate">{service.name}</h4>
                        <div className="flex items-center gap-1.5 overflow-hidden">
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                            service.status.includes('Done') ? 'bg-success' : 
                            service.status.includes('soon') ? 'bg-warning' : 
                            service.status.includes('Waiting') ? 'bg-destructive' : 'bg-gray-400'
                          }`} />
                          <p className="text-xs font-medium uppercase truncate">{service.status}</p>
                        </div>
                      </div>
                      <Link href={service.href} className="shrink-0">
                        <Button size="sm" className="whitespace-nowrap">
                          Details
                        </Button>
                      </Link>
                    </div>
                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-[10px] font-medium gap-2">
                      <div className="flex items-center gap-2 shrink-0">
                        {service.nextStepType === "client" ? (
                          <>
                            <User className="w-3 h-3 text-gray-600" />
                            <span>Next step required from you:</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-3 h-3 text-success" />
                            <span>Next step (we're working on it):</span>
                          </>
                        )}
                      </div>
                      <span className="uppercase tracking-widest truncate font-semibold">{service.next}</span>
                    </div>
                  </DashboardCard>
                ))}
              </div>
            </div>
          </DashboardCard>

          {/* Financial Statistics */}
          <DashboardCard className="px-5 py-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                <div className="w-1 h-6 bg-gray-900 rounded-full" />
                <h3 className="text-xl font-medium tracking-tight">Financial Statistics</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                <p className="text-[10px] font-medium uppercase tracking-[0.2em]">Real-time Updates</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {loading ? (
                Array(3).fill(null).map((_, idx) => (
                  <DashboardCard key={idx} hover={false} className="h-48 bg-white/50 animate-pulse border-white/30" />
                ))
              ) : stats.length > 0 ? (
                stats.map((stat) => <StatCard key={stat.title} {...stat} />)
              ) : (
                <DashboardCard hover={false} className="col-span-full bg-white/40 border border-dashed border-gray-200 py-16 flex flex-col items-center justify-center text-center relative overflow-hidden backdrop-blur-sm">
                  <div className="absolute inset-0 to-gray-50/50 pointer-events-none" />
                  <div className="relative z-10">
                    <div className="w-20 h-20 rounded-3xl bg-white shadow-xl flex items-center justify-center mb-6 mx-auto transform -rotate-6 group-hover:rotate-0 transition-transform duration-500">
                      <HugeiconsIcon icon={Alert02Icon} className="w-10 h-10 text-gray-300" />
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">Awaiting Analytic Data</h4>
                    <p className="text-sm text-gray-500 max-w-sm mx-auto font-medium leading-relaxed">
                      Your financial insights are currently being synchronized. Detailed statistics will appear here once your reports are processed.
                    </p>
                  </div>
                </DashboardCard>
              )}
            </div>
          </div>
          </DashboardCard>

          {/* Charts */}
          <div className="space-y-5">
            <CashFlowChart />
            <PLSummaryChart />
          </div>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6 flex flex-col justify-between">
          {/* Recently Completed */}
          <DashboardCard className="overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-1 h-6 bg-gray-900 rounded-full" />
                <h3 className="text-lg font-semibold text-gray-900">Recently Completed</h3>
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
                    <span className="text-sm font-medium truncate">{item.text}</span>
                  </div>
                  <Link href={item.href} className="shrink-0">
                    <Button size="sm" className="whitespace-nowrap">
                      {item.action}
                    </Button>
                  </Link>
                </DashboardCard>
              ))}
            </div>
          </DashboardCard>

          {/* Activity Feed */}
          <DashboardCard className="overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-4">
              <div className="w-1 h-6 bg-gray-900 rounded-full" />
              <h3 className="text-lg font-semibold text-gray-900">Activity Feed</h3>
            </div>
            <div className="p-5 space-y-6">
              <div>
                <p className="text-[15px] font-semibold uppercase tracking-widest mb-3">Live Updates</p>
                <div className="flex flex-col gap-3">
                  {recentActivity.map((activity, idx) => (
                    <Link key={idx} href={activity.href}>
                      <DashboardCard className="p-4 border-none shadow-sm bg-gray-50/50 hover:bg-white transition-all transform hover:-translate-x-1 cursor-pointer">
                      <div className="flex gap-4 items-start">
                        <div className="mt-1.5 shrink-0">
                          <div className="w-2 h-2 rounded-full bg-gray-900" />
                        </div>
                          <div className="space-y-1 flex-1 min-w-0">
                          <p className="text-sm font-medium leading-tight text-gray-700">{activity.text}</p>
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
              
              <div className="pt-5 border-t border-gray-100">
                <p className="text-[15px] font-semibold uppercase tracking-widest mb-3">Client Alerts</p>
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
          </DashboardCard>

          {/* Quick Actions */}
          <DashboardCard className="overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-300 flex items-center gap-4">
              <div className="w-1 h-6 bg-gray-900 rounded-full" />
              <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
            </div>
            <div className="flex flex-col gap-2 p-3">
              <Link href="/dashboard/document-organizer/document-upload">
                <Button variant="outline" className="w-full justify-start gap-3 h-11">
                  <Upload className="w-4 h-4" />
                  <span>Upload document</span>
                </Button>
              </Link>
              <Link href="/dashboard/services/request">
                <Button variant="outline" className="w-full justify-start gap-3 h-11">
                  <Plus className="w-4 h-4" />
                  <span>Request a service</span>
                </Button>
              </Link>
              <Button 
                variant="outline" 
                className="w-full justify-start gap-3 h-11"
                onClick={handleContactAccountantClick}
              >
                <MessageCircle className="w-4 h-4" />
                <span>Message accountant</span>
              </Button>
              <Link href="/dashboard/compliance">
                <Button variant="outline" className="w-full justify-start gap-3 h-11">
                  <Calendar className="w-4 h-4" />
                  <span>View compliance calendar</span>
                </Button>
              </Link>
              <Link href="/dashboard/todo-list">
                <Button variant="outline" className="w-full justify-start gap-3 h-11">
                  <CheckSquare className="w-4 h-4" />
                  <span>To do list</span>
                </Button>
              </Link>
            </div>
          </DashboardCard>

          {/* Compliance Snapshot */}
          <DashboardCard className="overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-300 flex items-center gap-4">
              <div className="w-1 h-6 bg-gray-900 rounded-full" />
              <h3 className="text-lg font-medium text-gray-900">Compliance Snapshot</h3>
            </div>
            <div className="p-4">
              {/* Next Statutory Deadline */}
              <div className="mb-4 p-3 rounded-lg bg-warning/5 border border-warning/20">
                <p className="text-[10px] font-medium text-gray-500 uppercase tracking-widest mb-1">Next Deadline:</p>
                <p className="text-sm font-semibold text-gray-900">VAT Return – 30 June</p>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mb-4">
                <Kpi label="Overdue" value={complianceCounts.overdue} tone="danger" />
                <Kpi label="Due soon" value={complianceCounts.dueSoon} tone="warning" />
                <Kpi label="Waiting" value={complianceCounts.waiting} tone="info" />
                <Kpi label="Done" value={complianceCounts.done} tone="success" />
              </div>
              <Link href="/dashboard/compliance/list">
                <Button variant="default" className="w-full">
                  View full list
                </Button>
              </Link>
            </div>
          </DashboardCard>

          {/* Upload Status */}
          {/* <DashboardCard className="overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-300 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-1 h-6 bg-gray-900 rounded-full" />
                <h3 className="text-lg font-medium text-gray-900">Upload Status</h3>
              </div>
              <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            </div>
            <div className="p-4 space-y-3">
              {uploadLoading ? (
                Array(4).fill(null).map((_, idx) => (
                  <DashboardCard key={`upload-skeleton-${idx}`} className="p-4 space-y-2 border-none shadow-sm bg-gray-50/50">
                    <div className="h-4 w-1/2 bg-gray-100 animate-pulse rounded" />
                    <div className="h-1.5 w-full bg-gray-50 animate-pulse rounded-full" />
                  </DashboardCard>
                ))
              ) : uploadSummary ? (
                <>
                  <UploadProgress 
                    label="Uploaded" 
                    value={uploadSummary.documentsUploaded} 
                    total={uploadSummary.documentsUploaded}
                    color="bg-gray-900"
                    icon="/document-upload.svg"
                    link="/dashboard/document-organizer/document-listing"
                  />
                  <UploadProgress 
                    label="Processed" 
                    value={uploadSummary.documentsProcessed} 
                    total={uploadSummary.documentsUploaded}
                    color="bg-warning"
                    icon="/document-pending.svg"
                    link={`/dashboard/document-organizer/document-listing?status=${encodedProcessedStatus}`}
                  />
                  <UploadProgress 
                    label="Pending" 
                    value={uploadSummary.documentsPending} 
                    total={uploadSummary.documentsUploaded}
                    color="bg-destructive"
                    icon="/document-pending.svg"
                    link={`/dashboard/document-organizer/document-listing?status=${encodedPendingStatus}`}
                  />
                  <UploadProgress 
                    label="Correction" 
                    value={uploadSummary.documentsNeedsCorrection} 
                    total={uploadSummary.documentsUploaded}
                    color="bg-destructive"
                    icon="/document-pending.svg"
                    link={`/dashboard/document-organizer/document-listing?status=${encodedNeedCorrectionStatus}`}
                  />
                </>
              ) : (
                <div className="py-4 text-center">
                  <p className="text-sm text-gray-500 font-medium uppercase tracking-widest">No data</p>
                </div>
              )}
            </div>
          </DashboardCard> */}

          {/* Yearly Progress */}
          {/* {netIncomeYTD && (
            <DashboardCard className="overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-300 flex items-center gap-4">
                <div className="w-1 h-6 bg-gray-900 rounded-full" />
                <h3 className="text-lg font-medium text-gray-900">Yearly Progress</h3>
              </div>
              <div className="p-4">
                <DashboardCard className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-[10px] uppercase tracking-widest">Net Income</p>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                      netIncomeYTD.change.includes('+') ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
                    }`}>
                      YTD Performance
                    </span>
                  </div>
                  <div className="flex items-end justify-between">
                    <p className="font-semibold text-2xl text-gray-900 tracking-tight">{netIncomeYTD.amount}</p>
                    <div className={`flex items-center gap-1 font-medium text-sm ${
                      netIncomeYTD.change.includes('+') ? 'text-success' : 'text-destructive'
                    }`}>
                      <span>{netIncomeYTD.change}</span>
                      <i className={`${getArrowIcon(netIncomeYTD.change)} text-xs`} />
                    </div>
                  </div>
                </DashboardCard>
              </div>
            </DashboardCard>
          )} */}
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
