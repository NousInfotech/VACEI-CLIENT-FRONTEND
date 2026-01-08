"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import StatCard from "@/components/StatCard";
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
  const healthStatus = complianceCounts.overdue > 0 ? "🟥 Needs attention" : complianceCounts.dueSoon > 0 ? "🟨 Needs attention" : "🟩 Healthy";

  return (
    <section className="mx-auto max-w-[1400px] w-full pt-5 space-y-6"> 
      {/* Welcome Header */}
      <div className="bg-card border border-border rounded-card shadow-md px-6 py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-brand-body mb-2">
              Welcome back, <span className="font-bold">{username || 'User'}</span>
            </h1>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-muted-foreground">Company: <span className="font-semibold text-brand-body">{activeCompany}</span></span>
              <span className="text-brand-body">{healthStatus}</span>
            </div>
          </div>
          <Button
            variant="default"
            onClick={handleContactAccountantClick}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm shadow-sm hover:shadow-md transition-shadow"
          >
            <HugeiconsIcon icon={AddressBookIcon} className="w-4.5 h-4.5 size-custom" />
            Contact Accountant
          </Button>
        </div>

        {!uploadLoading && uploadSummary?.filesUploadedThisMonth === 0 && (
          <div className="mt-4 flex items-start gap-3 p-4 border-l-4 border-warning bg-warning/10 border-r border-t border-b border-border rounded-lg shadow-sm">
            <HugeiconsIcon icon={Alert02Icon} className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
            <p className="m-0 text-sm text-brand-body">
              <strong className="font-semibold">Warning:</strong> No documents uploaded this month.
            </p>
          </div>
        )}
      </div>

      {/* Compliance KPI Strip */}
      <div className="bg-card border border-border rounded-card shadow-md px-6 py-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h3 className="text-base font-semibold text-brand-body">Compliance Overview</h3>
          <div className="flex flex-wrap items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Overdue:</span>
              <span className="text-destructive font-bold text-lg">{complianceCounts.overdue}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Due soon (7d):</span>
              <span className="text-warning font-bold text-lg">{complianceCounts.dueSoon}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Waiting on you:</span>
              <span className="text-info font-bold text-lg">{complianceCounts.waiting}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Done (30d):</span>
              <span className="text-success font-bold text-lg">{complianceCounts.done}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Priority Actions & Services */}
        <div className="lg:col-span-2 space-y-6">
          {/* Top Priority Actions */}
          <div className="bg-card border border-border rounded-card shadow-md px-6 py-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-brand-body">Top Priority Actions</h3>
              <Link href="/dashboard/compliance/list">
                <Button variant="ghost" size="sm" className="text-xs">View all</Button>
              </Link>
            </div>
            <div className="space-y-2.5">
              {topPriorityActions.map((action) => (
                <div key={action.id} className="flex items-center justify-between rounded-lg border border-border bg-muted/20 px-4 py-3 hover:bg-muted/30 transition-colors shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary font-semibold text-xs">
                      {action.id}
                    </span>
                    <span className="text-sm text-brand-body font-medium">{action.text}</span>
                  </div>
                  <Link href={action.href}>
                    <Button size="sm" variant="default" className="text-xs rounded-lg shadow-sm hover:shadow-md transition-shadow">
                      {action.action}
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Active Services */}
          <div className="bg-card border border-border rounded-card shadow-md px-6 py-5">
            <h3 className="text-lg font-semibold text-brand-body mb-4">Active Services</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {activeServices.map((service, idx) => (
                <div key={idx} className="rounded-lg border border-border bg-muted/20 px-4 py-3 hover:bg-muted/30 transition-colors shadow-sm">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-brand-body text-sm mb-1">{service.name}</h4>
                      <p className="text-xs text-muted-foreground">{service.status}</p>
                    </div>
                    <Link href={service.href}>
                      <Button size="sm" variant="outline" className="text-xs rounded-lg shadow-sm hover:shadow-md transition-shadow h-7">
                        Open
                      </Button>
                    </Link>
                  </div>
                  <p className="text-xs text-muted-foreground">Next: {service.next}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Financial Stats */}
          <div className="bg-card border border-border rounded-card shadow-md px-6 py-5">
            <h3 className="text-lg font-semibold text-brand-body mb-4">Financial Overview</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {loading ? (
                Array(3).fill(null).map((_, idx) => (
                  <div key={idx} className="h-[100px] bg-gray-200 animate-pulse rounded-lg" />
                ))
              ) : stats.length > 0 ? (
                stats.map((stat) => <StatCard key={stat.title} {...stat} />)
              ) : (
                <div className="col-span-full text-center py-10">
                  <p className="text-xl font-medium text-muted-foreground">No financial data found for cards.</p>
                </div>
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
          <div className="bg-card border border-border rounded-card shadow-md px-6 py-5">
            <h3 className="text-lg font-semibold text-brand-body mb-4">Recently Completed</h3>
            <div className="space-y-2.5">
              {recentlyCompleted.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between rounded-lg border border-border bg-muted/20 px-4 py-3 hover:bg-muted/30 transition-colors shadow-sm">
                  <div className="flex items-center gap-2.5">
                    <span className="text-success text-lg">✅</span>
                    <span className="text-sm text-brand-body font-medium">{item.text}</span>
                  </div>
                  <Link href={item.href}>
                    <Button size="sm" variant="ghost" className="text-xs rounded-lg shadow-sm hover:shadow-md transition-shadow h-7">
                      {item.action}
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity & Messages */}
          <div className="bg-card border border-border rounded-card shadow-md px-6 py-5">
            <h3 className="text-lg font-semibold text-brand-body mb-4">Recent Activity</h3>
            <div className="space-y-2.5 mb-5">
              {recentActivity.map((activity, idx) => (
                <div key={idx} className="text-sm text-brand-body flex items-start gap-2">
                  <span className="text-muted-foreground mt-0.5">•</span>
                  <span>{activity}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-border pt-4">
              <h4 className="text-sm font-semibold text-brand-body mb-3">Messages / Updates</h4>
              <div className="space-y-2.5">
                {messagesUpdates.map((msg, idx) => (
                  <div key={idx} className="text-sm text-brand-body flex items-start gap-2">
                    <span className="text-muted-foreground mt-0.5">•</span>
                    <span>{msg}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Compliance Snapshot */}
          <div className="bg-card border border-border rounded-card shadow-md px-6 py-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-brand-body">Compliance Snapshot</h3>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <Kpi label="Overdue" value={complianceCounts.overdue} tone="danger" />
              <Kpi label="Due soon" value={complianceCounts.dueSoon} tone="warning" />
              <Kpi label="Waiting" value={complianceCounts.waiting} tone="info" />
              <Kpi label="Done" value={complianceCounts.done} tone="success" />
            </div>
            <Link href="/dashboard/compliance/list">
              <Button variant="outline" size="sm" className="w-full rounded-lg text-xs shadow-sm hover:shadow-md transition-shadow">
                View compliance list
              </Button>
            </Link>
          </div>

          {/* Upload Status Summary */}
          <div className="bg-card border border-border rounded-card shadow-md px-6 py-5">
            <h3 className="text-lg font-semibold text-brand-body mb-4">Upload Status</h3>
            <div className="space-y-4">
              {uploadLoading ? (
                Array(4).fill(null).map((_, idx) => (
                  <div key={`upload-skeleton-${idx}`}>
                    <div className="h-6 w-3/4 bg-gray-200 animate-pulse mb-2.5 rounded"></div>
                    <div className="h-1 w-full bg-gray-200 animate-pulse rounded-full"></div>
                  </div>
                ))
              ) : uploadSummary ? (
                <>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex gap-2 items-center">
                        <img src="/document-upload.svg" alt="Documents Uploaded" className="w-5 h-5" />
                        <p className="text-sm text-brand-body font-medium">
                          Documents Uploaded: <span className="text-primary font-semibold">{uploadSummary.documentsUploaded}</span>
                        </p>
                      </div>
                      <Link href={`/dashboard/document-organizer/document-listing`} passHref>
                        <div className="bg-sidebar-background text-sidebar-foreground w-6 h-6 rounded-full relative flex items-center justify-center cursor-pointer shadow-md hover:shadow-lg transition-all" title="View Uploaded Documents">
                          <i className="fi fi-br-plus text-sidebar-foreground text-[10px] block leading-0"></i>
                        </div>
                      </Link>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted relative overflow-hidden">
                      {uploadSummary.documentsUploaded > 0 && (
                        <div className="h-full w-full rounded-full bg-primary"></div>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex gap-2 items-center">
                        <img src="/document-pending.svg" alt="Documents Processed" className="w-5 h-5" />
                        <p className="text-sm text-brand-body font-medium">
                          Documents Processed: <span className="text-warning font-semibold">{uploadSummary.documentsProcessed}</span>
                        </p>
                      </div>
                      <Link href={`/dashboard/document-organizer/document-listing?status=${encodedProcessedStatus}`} passHref>
                        <div className="bg-sidebar-background text-sidebar-foreground w-6 h-6 rounded-full relative flex items-center justify-center cursor-pointer shadow-md hover:shadow-lg transition-all" title="View Processed Documents">
                          <i className="fi fi-br-plus text-sidebar-foreground text-[10px] block leading-0"></i>
                        </div>
                      </Link>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted relative overflow-hidden">
                      <div className="h-full rounded-full bg-warning" style={{ width: `${processedPercentage}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex gap-2 items-center">
                        <img src="/document-pending.svg" alt="Documents Pending" className="w-5 h-5" />
                        <p className="text-sm text-brand-body font-medium">
                          Documents Pending: <span className="text-destructive font-semibold">{uploadSummary.documentsPending}</span>
                        </p>
                      </div>
                      <Link href={`/dashboard/document-organizer/document-listing?status=${encodedPendingStatus}`} passHref>
                        <div className="bg-sidebar-background text-sidebar-foreground w-6 h-6 rounded-full relative flex items-center justify-center cursor-pointer shadow-md hover:shadow-lg transition-all" title="View Pending Documents">
                          <i className="fi fi-br-plus text-sidebar-foreground text-[10px] block leading-0"></i>
                        </div>
                      </Link>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted relative overflow-hidden">
                      <div className="h-full rounded-full bg-destructive" style={{ width: `${pendingPercentage}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex gap-2 items-center">
                        <img src="/document-pending.svg" alt="Documents Needs Correction" className="w-5 h-5" />
                        <p className="text-sm text-brand-body font-medium">
                          Documents Needs Correction: <span className="text-destructive font-semibold">{uploadSummary.documentsNeedsCorrection}</span>
                        </p>
                      </div>
                      <Link href={`/dashboard/document-organizer/document-listing?status=${encodedNeedCorrectionStatus}`} passHref>
                        <div className="bg-sidebar-background text-sidebar-foreground w-6 h-6 rounded-full relative flex items-center justify-center cursor-pointer shadow-md hover:shadow-lg transition-all" title="View Documents Needs Correction">
                          <i className="fi fi-br-plus text-sidebar-foreground text-[10px] block leading-0"></i>
                        </div>
                      </Link>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted relative overflow-hidden">
                      <div className="h-full rounded-full bg-destructive" style={{ width: `${needCorrectionPercentage}%` }}></div>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No upload data available.</p>
              )}
            </div>
          </div>

          {/* Yearly Progress */}
          {netIncomeYTD && (
            <div className="bg-card border border-border rounded-card shadow-md px-6 py-5">
              <h3 className="text-lg font-semibold text-brand-body mb-4">Yearly Progress</h3>
              <div className="bg-muted border border-border rounded-lg px-4 py-3 shadow-sm">
                <p className="font-medium text-sm text-brand-body mb-1">Income</p>
                <p className="flex items-center gap-1 font-semibold text-base text-brand-body">
                  {netIncomeYTD.change}{" "}
                  <i className={`${getArrowIcon(netIncomeYTD.change)} leading-0 block text-xs`} />
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Pending Actions */}
      {pendingTasks.length > 0 && (
        <div className="bg-card border border-border rounded-card shadow-md px-6 py-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-brand-body">Pending Actions</h3>
            <Link href="/dashboard/compliance/list">
              <Button variant="outline" size="sm" className="rounded-lg text-xs shadow-sm hover:shadow-md transition-shadow">
                View all
              </Button>
            </Link>
          </div>
          <div className="space-y-2">
            {pendingTasks.map((task) => (
              <Link
                key={task.id}
                href={`/dashboard/compliance/detail?taskId=${btoa(task.id.toString())}`}
                className="flex items-center justify-between rounded-lg border border-border bg-muted/20 px-4 py-3 text-sm hover:bg-muted/30 hover:shadow-md transition-all shadow-sm"
              >
                <div>
                  <p className="font-medium text-brand-body">{task.title}</p>
                  {task.dueDate && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Due {new Date(task.dueDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <span className="text-xs rounded-lg bg-muted border border-border px-2.5 py-1 text-brand-body font-medium">
                  {task.status || "Open"}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
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
  return (
    <div className={`rounded-lg border ${toneBorders[tone]} bg-card px-3 py-2.5 shadow-sm`}>
      <p className="text-xs font-medium text-muted-foreground mb-1">{label}</p>
      <p className={`text-lg font-semibold ${toneText[tone]}`}>{value}</p>
    </div>
  );
}