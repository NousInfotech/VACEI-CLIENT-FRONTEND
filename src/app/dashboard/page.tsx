"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import StatCard from "@/components/StatCard";
import DashboardCard from "@/components/DashboardCard";
import DashboardActionButton from "@/components/DashboardActionButton";
import CashFlowChart from "@/components/CashFlowChart";
import PLSummaryChart from "@/components/PLSummaryChart";
import { getDecodedUsername } from "@/utils/authUtils";
import { fetchDashboardSummary, ProcessedDashboardStat } from "@/api/financialReportsApi";
import { fetchUploadStatusSummary } from "@/api/documentApi";
import { fetchTasks } from "@/api/taskService";
import type { Task } from "@/interfaces";
import { HugeiconsIcon } from '@hugeicons/react';
import { AddressBookIcon, Alert02Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { User, AlertCircle, CheckCircle, ArrowRight } from "lucide-react";

interface UploadStatusSummary {
  documentsUploaded: number;
  documentsProcessed: number;
  documentsPending: number;
  documentsNeedsCorrection: number;
  filesUploadedThisMonth: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<ProcessedDashboardStat[]>([]);
  const [uploadSummary, setUploadSummary] = useState<UploadStatusSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadLoading, setUploadLoading] = useState(true);
  const [revenueYTD, setRevenueYTD] = useState<{ amount: string; change: string } | null>(null);
  const [netIncomeYTD, setNetIncomeYTD] = useState<{ amount: string; change: string } | null>(null);
  const [username, setUsername] = useState<string>(''); // State for username to avoid hydration error
  const [complianceCounts, setComplianceCounts] = useState({ overdue: 0, dueSoon: 0, waiting: 0, done: 0 });
  const [pendingTasks, setPendingTasks] = useState<Task[]>([]);
  const [activeCompany, setActiveCompany] = useState<string>("ACME LTD");

  // Set username on client side to avoid hydration error
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const decoded = getDecodedUsername();
      if (decoded) {
        setUsername(decoded);
      }
      const storedCompany = localStorage.getItem("vacei-active-company");
      const storedCompanies = localStorage.getItem("vacei-companies");
      if (storedCompany && storedCompanies) {
        try {
          const companies = JSON.parse(storedCompanies);
          const company = companies.find((c: { id: string; name: string }) => c.id === storedCompany);
          if (company) setActiveCompany(company.name);
        } catch {}
      }
    }
  }, []);

  useEffect(() => {
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

      } catch (error) {
        // console.error("Failed to load dashboard summary:", error);
        setStats([]);
        setRevenueYTD(null);
        setNetIncomeYTD(null);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, []);

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
        setComplianceCounts({ overdue, dueSoon, waiting, done });
        setPendingTasks(tasks.slice(0, 5));
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

  // Mock data for wireframe sections
  const topPriorityActions = [
    { id: 1, text: "Upload March bank statement", action: "Upload", href: "/dashboard/document-organizer/document-upload" },
    { id: 2, text: "Reply to Audit Query Q#12", action: "Reply", href: "/dashboard/messages" },
    { id: 3, text: "VAT Q2 missing 1 sales invoice", action: "Upload", href: "/dashboard/document-organizer/document-upload" },
  ];
  const activeServices = [
    { name: "Bookkeeping", status: "In progress", next: "Review March", href: "/dashboard/services/bookkeeping" },
    { name: "VAT & Tax", status: "Due soon (30 Jun)", next: "Missing docs", href: "/dashboard/services/vat" },
    { name: "Payroll", status: "Done", next: "Next run 28th", href: "/dashboard/services/payroll" },
    { name: "Audit", status: "Waiting on you", next: "Reply Q#12", href: "/dashboard/services/audit" },
  ];
  const recentlyCompleted = [
    { text: "VAT Q1 submitted", action: "View receipt", href: "/dashboard/services/vat" },
    { text: "Payroll May filed", action: "View confirmation", href: "/dashboard/services/payroll" },
    { text: "MBR BO2 submitted", action: "View form", href: "/dashboard/services/csp-mbr/mbr-submissions/BO2" },
  ];
  const recentActivity = [
    "9 docs uploaded today",
    "VAT checks completed",
  ];
  const messagesUpdates = [
    "\"Need 1 more invoice\"",
    "\"Audit query sent\"",
  ];
  const healthStatus = complianceCounts.overdue > 0 ? "Needs attention" : complianceCounts.dueSoon > 0 ? "Needs attention" : "Healthy";

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return `Good morning, ${username}!`;
    if (hour < 17) return `Good afternoon, ${username}!`;
    return `Good evening, ${username}!`;
  };

  return (
    <div className="min-h-screen bg-brand-body p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Premium Dashboard Header */}
        <DashboardCard animate className="p-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-4">
              <div className="space-y-1">
                <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">
                  {getGreeting()}
                </h1>
                <p className="text-gray-500 font-medium">Welcome back! Here's what's happening with your business today.</p>
              </div>
              
              <div className="flex flex-wrap items-center gap-4">
                <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 flex items-center gap-3 shadow-sm">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-widest">Company</span>
                  <div className="h-4 w-px bg-gray-200" />
                  <span className="text-sm font-bold text-gray-900">{activeCompany}</span>
                </div>
                
                <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-300 font-bold text-xs uppercase tracking-widest shadow-sm ${
                  healthStatus === "Healthy" ? "bg-success/5 border-success/20 text-success" : "bg-warning/5 border-warning/20 text-warning"
                }`}>
                  <span className={`w-2 h-2 rounded-full animate-pulse ${
                    healthStatus === "Healthy" ? "bg-success" : "bg-warning"
                  }`}></span>
                  {healthStatus}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <DashboardActionButton 
                Icon={User}
                title="Contact Accountant"
                subtitle="Get expert assistance"
                onClick={handleContactAccountantClick}
              />
            </div>
          </div>
        </DashboardCard>

        {/* Warning Banner */}
        {!uploadLoading && uploadSummary?.filesUploadedThisMonth === 0 && (
          <DashboardCard animate hover={false} className="border-warning/30 bg-warning/5 overflow-hidden">
            <div className="px-8 py-5 flex items-center gap-6">
              <div className="shrink-0">
                <div className="w-12 h-12 bg-warning/20 rounded-xl flex items-center justify-center shadow-inner">
                  <AlertCircle className="w-6 h-6 text-warning" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-warning text-white uppercase tracking-widest">
                    Warning
                  </span>
                </div>
                <p className="text-sm text-gray-700 font-medium leading-relaxed">
                No documents uploaded this month.
                </p>
              </div>
            </div>
          </DashboardCard>
        )}


      {/* Performance Indicators / Compliance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <DashboardCard animate className="p-6">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold text-gray-700 tracking-widest">Overdue</span>
            <span className="text-3xl font-semibold text-destructive tabular-nums">{complianceCounts.overdue}</span>
          </div>
        </DashboardCard>
        <DashboardCard animate className="p-6">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold text-gray-700 tracking-widest">Due soon (7d)</span>
            <span className="text-3xl font-semibold text-warning tabular-nums">{complianceCounts.dueSoon}</span>
          </div>
        </DashboardCard>
        <DashboardCard animate className="p-6">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold text-gray-700 tracking-widest">Waiting</span>
            <span className="text-3xl font-semibold text-info tabular-nums">{complianceCounts.waiting}</span>
          </div>
        </DashboardCard>
        <DashboardCard animate className="p-6">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold text-gray-700 tracking-widest">Completed (30d)</span>
            <span className="text-3xl font-semibold text-success tabular-nums">{complianceCounts.done}</span>
          </div>
        </DashboardCard>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Priority Actions & Services */}
        <div className="lg:col-span-2 space-y-6">
          {/* Top Priority Actions */}
          <DashboardCard animate className="overflow-hidden group">
            <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Top Priority Actions</h3>
                <p className="text-sm text-gray-600">Immediate steps required for your account</p>
              </div>
              <Link href="/dashboard/compliance/list">
                <Button variant="ghost" size="sm" className="text-xs font-bold hover:bg-gray-100 rounded-xl">View all</Button>
              </Link>
            </div>
            <div className="p-4 space-y-3">
              {topPriorityActions.map((action) => (
                <div key={action.id} className="group/item flex items-center justify-between rounded-xl border border-gray-50 bg-gray-50/50 px-6 py-4 hover:bg-white hover:shadow-md transition-all duration-300">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gray-900 text-white font-bold text-sm">
                      {action.id}
                    </div>
                    <div>
                      <span className="text-base text-gray-900 font-semibold block">{action.text}</span>
                      <span className="text-xs text-gray-500">Verification required</span>
                    </div>
                  </div>
                  <Link href={action.href}>
                    <Button size="sm" variant="outline" className="px-5 rounded-xl border-gray-300 hover:bg-gray-100 text-gray-700 font-bold">
                      {action.action}
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </DashboardCard>

          {/* Modern Active Services */}
          <DashboardCard className="overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-100">
              <h3 className="text-xl font-semibold text-gray-900">Active Services</h3>
              <p className="text-sm text-gray-600">Manage your ongoing accounting and tax services</p>
            </div>
            <div className="p-6">
              <div className="grid sm:grid-cols-2 gap-4">
                {activeServices.map((service, idx) => (
                  <div key={idx} className="group/service relative rounded-xl border border-gray-100 bg-white/50 p-5 hover:border-gray-300 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-start justify-between mb-4">
                      <div className="space-y-1">
                        <h4 className="font-bold text-gray-900 text-base">{service.name}</h4>
                        <div className="flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            service.status.includes('Done') ? 'bg-success' : 
                            service.status.includes('soon') ? 'bg-warning' : 
                            service.status.includes('Waiting') ? 'bg-destructive' : 'bg-gray-400'
                          }`} />
                          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{service.status}</p>
                        </div>
                      </div>
                      <Link href={service.href}>
                        <Button size="sm" variant="outline" className="rounded-xl border-gray-300 hover:bg-gray-100 text-gray-700 font-bold px-4 h-8 text-xs">
                          Details
                        </Button>
                      </Link>
                    </div>
                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-[10px] font-bold text-gray-400">
                      <span>NEXT STEP</span>
                      <span className="text-gray-900 uppercase tracking-widest">{service.next}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </DashboardCard>

          {/* Financial Statistics */}
          <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-xl font-semibold text-gray-900">Financial Statistics</h3>
              <p className="text-sm text-gray-500 font-bold uppercase tracking-widest">Monthly Updates</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                Array(3).fill(null).map((_, idx) => (
                  <DashboardCard key={idx} hover={false} className="h-32 bg-white/50 animate-pulse border-white/30" />
                ))
              ) : stats.length > 0 ? (
                stats.map((stat) => <StatCard key={stat.title} {...stat} />)
              ) : (
                <DashboardCard hover={false} className="col-span-full bg-white/50 border border-dashed border-gray-300 py-12 flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                    <HugeiconsIcon icon={Alert02Icon} className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-lg font-semibold text-gray-900">No analytic data available</p>
                  <p className="text-sm text-gray-500 max-w-xs">Financial stats will appear here once your reports are processed</p>
                </DashboardCard>
              )}
            </div>
          </div>

          {/* Charts */}
          <div className="space-y-5">
            <CashFlowChart />
            <PLSummaryChart />
          </div>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Recently Completed */}
          <DashboardCard className="overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Recently Completed</h3>
              <span className="text-[10px] font-bold text-success bg-success/10 px-2 py-0.5 rounded-full uppercase tracking-widest">3 New</span>
            </div>
            <div className="p-4 space-y-3">
              {recentlyCompleted.map((item, idx) => (
                <div key={idx} className="group/completed flex items-center justify-between rounded-xl border border-gray-50 bg-gray-50/50 px-4 py-3 hover:bg-white hover:shadow-sm transition-all duration-300">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-gray-600" />
                    </div>
                    <span className="text-sm text-gray-900 font-semibold">{item.text}</span>
                  </div>
                  <Link href={item.href}>
                    <Button size="sm" variant="ghost" className="h-8 px-3 text-[10px] font-bold text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                      {item.action}
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </DashboardCard>

          {/* Activity Feed */}
          <DashboardCard className="overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Activity Feed</h3>
            </div>
            <div className="p-5 space-y-6">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Live Updates</p>
                <div className="space-y-4">
                  {recentActivity.map((activity, idx) => (
                    <div key={idx} className="flex gap-3">
                      <div className="relative">
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-900 mt-1.5" />
                        {idx !== recentActivity.length - 1 && <div className="absolute top-4 left-[3px] w-px h-full bg-gray-100" />}
                      </div>
                      <span className="text-sm font-medium text-gray-900 leading-tight">{activity}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="pt-5 border-t border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Client Alerts</p>
                <div className="space-y-3">
                  {messagesUpdates.map((msg, idx) => (
                    <div key={idx} className="bg-gray-50/50 rounded-xl p-3 border border-gray-100">
                      <p className="text-sm font-medium text-gray-700 italic leading-relaxed">{msg}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </DashboardCard>

          {/* Compliance Snapshot */}
          <DashboardCard className="overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Compliance Snapshot</h3>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 gap-3 mb-4">
                <Kpi label="Overdue" value={complianceCounts.overdue} tone="danger" />
                <Kpi label="Due soon" value={complianceCounts.dueSoon} tone="warning" />
                <Kpi label="Waiting" value={complianceCounts.waiting} tone="info" />
                <Kpi label="Done" value={complianceCounts.done} tone="success" />
              </div>
              <Link href="/dashboard/compliance/list">
                <Button variant="outline" size="sm" className="w-full rounded-xl text-xs font-bold border-gray-300 hover:bg-gray-100 transition-all py-5">
                  View full list
                </Button>
              </Link>
            </div>
          </DashboardCard>

          {/* Upload Status */}
          <DashboardCard className="overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Upload Status</h3>
              <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            </div>
            <div className="p-6 space-y-5">
              {uploadLoading ? (
                Array(4).fill(null).map((_, idx) => (
                  <div key={`upload-skeleton-${idx}`} className="space-y-2">
                    <div className="h-4 w-1/2 bg-gray-100 animate-pulse rounded" />
                    <div className="h-1.5 w-full bg-gray-50 animate-pulse rounded-full" />
                  </div>
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
                  <p className="text-sm text-gray-500 font-bold uppercase tracking-widest">No data</p>
                </div>
              )}
            </div>
          </DashboardCard>

          {/* Yearly Progress */}
          {netIncomeYTD && (
            <DashboardCard className="overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">Yearly Progress</h3>
              </div>
              <div className="p-4">
                <div className="bg-gray-50/50 border border-gray-100 rounded-xl px-5 py-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-bold text-[10px] text-gray-400 uppercase tracking-widest">Net Income</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      netIncomeYTD.change.includes('+') ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
                    }`}>
                      YTD Performance
                    </span>
                  </div>
                  <div className="flex items-end justify-between">
                    <p className="font-semibold text-2xl text-gray-900 tracking-tight">{netIncomeYTD.amount}</p>
                    <div className={`flex items-center gap-1 font-bold text-sm ${
                      netIncomeYTD.change.includes('+') ? 'text-success' : 'text-destructive'
                    }`}>
                      <span>{netIncomeYTD.change}</span>
                      <i className={`${getArrowIcon(netIncomeYTD.change)} text-xs`} />
                    </div>
                  </div>
                </div>
              </div>
            </DashboardCard>
          )}
        </div>
      </div>

      {/* Pending Actions */}
      {pendingTasks.length > 0 && (
        <DashboardCard className="overflow-hidden group">
          <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Pending Actions</h3>
              <p className="text-sm text-gray-600">Tasks awaiting your attention</p>
            </div>
            <Link href="/dashboard/compliance/list">
              <Button variant="ghost" size="sm" className="text-xs font-bold hover:bg-gray-100 rounded-xl">View all</Button>
            </Link>
          </div>
          <div className="p-4 space-y-3">
            {pendingTasks.map((task) => (
              <Link
                key={task.id}
                href={`/dashboard/compliance/detail?taskId=${btoa(task.id.toString())}`}
                className="group/task flex items-center justify-between rounded-xl border border-gray-50 bg-gray-50/50 px-6 py-5 text-sm hover:bg-white hover:shadow-md transition-all duration-300"
              >
                <div className="space-y-1">
                  <p className="font-bold text-gray-900 text-base">{task.title}</p>
                  {task.dueDate && (
                    <div className="flex items-center gap-2">
                       <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Deadline:</span>
                       <span className="text-xs font-bold text-destructive">{new Date(task.dueDate).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-bold uppercase tracking-widest rounded-lg bg-white border border-gray-200 px-3 py-1.5 text-gray-900 shadow-sm">
                    {task.status || "Open"}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center">
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </DashboardCard>
      )}
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
    <div className={`rounded-2xl border ${toneBorders[tone]} ${toneBg[tone]} px-4 py-4 shadow-sm group hover:shadow-md transition-all`}>
      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{label}</p>
      <div className="flex items-end gap-1">
        <p className={`text-2xl font-black ${toneText[tone]} tabular-nums`}>{value}</p>
        <span className="text-[10px] font-bold text-muted-foreground/60 mb-1">items</span>
      </div>
    </div>
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
    <div className="group/progress font-medium">
      <div className="flex justify-between items-center mb-2.5">
        <div className="flex gap-3 items-center">
          <div className="w-8 h-8 rounded-xl bg-muted/30 flex items-center justify-center group-hover/progress:bg-white group-hover/progress:shadow-sm transition-all">
            <img src={icon} alt={label} className="w-4 h-4" />
          </div>
          <p className="text-sm text-brand-body font-bold">
            {label}: <span className="text-muted-foreground ml-1 tabular-nums">{value}</span>
          </p>
        </div>
        <Link href={link} passHref>
          <div className="w-7 h-7 rounded-full bg-white border border-border/40 flex items-center justify-center cursor-pointer shadow-sm hover:shadow-md hover:scale-110 transition-all">
            <i className="fi fi-br-plus text-primary text-[10px]"></i>
          </div>
        </Link>
      </div>
      <div className="h-1.5 w-full rounded-full bg-muted/40 relative overflow-hidden">
        <div 
          className={`h-full rounded-full ${color} transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(0,0,0,0.1)]`} 
          style={{ width: `${percentage}%` }} 
        />
      </div>
    </div>
  );
}
