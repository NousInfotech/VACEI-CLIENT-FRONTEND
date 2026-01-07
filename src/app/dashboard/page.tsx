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

  // Set username on client side to avoid hydration error
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const decoded = getDecodedUsername();
      if (decoded) {
        setUsername(decoded);
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

  return (
    <section className="mx-auto max-w-[1400px] w-full pt-5"> 
      <div className="bg-card border border-border rounded-card shadow-md px-6 py-6">
        <div className="md:flex justify-between items-center mb-6">
          <h1 className="text-[32px] leading-normal text-brand-body capitalize font-light">
            Welcome back, <span className="font-semibold text-brand-body">{username || 'User'}</span>
          </h1>
          <Button
            variant="default"
            onClick={handleContactAccountantClick}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm cursor-pointer !font-normal shadow-sm hover:shadow-md transition-shadow"
          >
            <HugeiconsIcon icon={AddressBookIcon} className="w-4.5 h-4.5 size-custom" />
            Contact Accountant
          </Button>
        </div>

        {!uploadLoading && uploadSummary?.filesUploadedThisMonth === 0 && (
          <div className="mb-6 flex items-start gap-3 p-4 border-l-4 border-warning bg-card border-r border-t border-b border-border rounded-lg shadow-sm">
            <HugeiconsIcon icon={Alert02Icon} className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
            <p className="m-0 text-sm text-brand-body">
              <strong className="font-semibold">Warning:</strong> No documents uploaded this month.
            </p>
          </div>
        )}
        <div className="flex flex-wrap items-center lg:gap-10 gap-5 mb-12" style={{ display: "none" }}>
          <button
            style={{ display: "none" }}
            className="bg-cream flex gap-2.5 border border-main text-[#3D3D3D] py-3 px-5 rounded-lg font-medium cursor-pointer"
          >
            <i className="fi fi-rr-code-pull-request text-[22px] block leading-0"></i>{" "}
            New Service Request
          </button>
          <button
            style={{ display: "none" }}
            className="bg-cream flex gap-2.5 border border-main text-[#3D3D3D] py-3 px-5 rounded-lg font-medium cursor-pointer"
          >
            <i className="fi fi-rr-settings text-[22px] block leading-0"></i>{" "}
            Request Upgrade
          </button>
        </div>
        <div className="mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 lg:grid-cols-2 gap-4">
            {loading ? (
              Array(3)
                .fill(null)
                .map((_, idx) => (
                  <div
                    key={idx}
                    className="h-[100px] bg-gray-200 animate-pulse rounded-lg"
                  />
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

        <div className="flex lg:flex-row flex-col gap-5">
          <div className="lg:w-2/3 w-full">
            <CashFlowChart />
            <PLSummaryChart />
          </div>
          <div className="lg:w-4/12 w-full">
            <div className="bg-card border border-border rounded-card shadow-md mb-5">
              <div className="pt-4 px-5 pb-3 border-b border-border">
                <h3 className="text-lg font-semibold text-brand-body">
                  Compliance snapshot
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-3 py-5 px-5">
                <Kpi label="Overdue" value={complianceCounts.overdue} tone="danger" />
                <Kpi label="Due soon" value={complianceCounts.dueSoon} tone="warning" />
                <Kpi label="Waiting" value={complianceCounts.waiting} tone="info" />
                <Kpi label="Done" value={complianceCounts.done} tone="success" />
              </div>
              <div className="px-5 pb-4">
                <Link href="/dashboard/compliance/list">
                  <Button variant="outline" size="sm" className="rounded-lg text-xs shadow-sm hover:shadow-md transition-shadow">
                    View compliance list
                  </Button>
                </Link>
              </div>
            </div>

            <div className="bg-card border border-border rounded-card shadow-md mb-5">
              <div className="pt-4 px-5 pb-3 border-b border-border">
                <h3 className="text-lg font-semibold text-brand-body">
                  Upload Status Summary
                </h3>
              </div>
              <div className="space-y-5 py-5 px-5">
                {uploadLoading ? (
                  Array(3).fill(null).map((_, idx) => (
                    <div key={`upload-skeleton-${idx}`}>
                      <div className="h-6 w-3/4 bg-gray-200 animate-pulse mb-2.5 rounded"></div>
                      <div className="h-1 w-full bg-gray-200 animate-pulse rounded-full"></div>
                    </div>
                  ))
                ) : uploadSummary ? (
                  <>
                    <div>
                      <div className="flex justify-between items-start">
                        <div className="flex gap-2 items-center mb-2.5">
                          <img src="/document-upload.svg" alt="Documents Uploaded" className="w-5 h-5" />
                          <p className="text-sm text-brand-body font-normal leading-6">
                            Documents Uploaded:{" "}
                            <span className="text-brand-primary font-semibold">{uploadSummary.documentsUploaded}</span>
                          </p>
                        </div>

                        <Link
                          href={`/dashboard/document-organizer/document-listing`}
                          passHref
                        >
                          <div
                            className="bg-sidebar-background text-sidebar-foreground w-6 h-6 rounded-full relative flex items-center justify-center cursor-pointer shadow-md hover:shadow-lg transition-all"
                            title="View Uploaded Documents"
                          >
                            <i className="fi fi-br-plus text-sidebar-foreground text-[10px] block leading-0"></i>
                          </div>
                        </Link>
                      </div>
                      <div className="h-[6px] w-full rounded-full bg-muted relative overflow-hidden">
                        {uploadSummary.documentsUploaded > 0 && (
                          <div className="h-full w-full rounded-full bg-primary"></div>
                        )}
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-start">
                        <div className="flex gap-2 items-center mb-2.5">
                          <img src="/document-pending.svg" alt="Documents Processed" className="w-5 h-5" />
                          <p className="text-sm text-brand-body font-normal leading-6">
                            Documents Processed:{" "}
                            <span className="text-brand-primary font-semibold">{uploadSummary.documentsProcessed}</span>
                          </p>
                        </div>
                        <Link href={`/dashboard/document-organizer/document-listing?status=${encodedProcessedStatus}`} passHref>
                          <div
                            className="bg-sidebar-background text-sidebar-foreground w-6 h-6 rounded-full relative flex items-center justify-center cursor-pointer shadow-md hover:shadow-lg transition-all"
                            title="Upload New Document"
                          >
                            <i className="fi fi-br-plus text-sidebar-foreground text-[10px] block leading-0"></i>
                          </div>
                        </Link>
                      </div>

                      <div className="h-[6px] w-full rounded-full bg-muted relative overflow-hidden">
                        <div
                          className="h-full rounded-full bg-warning"
                          style={{ width: `${processedPercentage}%` }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-start">
                        <div className="flex gap-2 items-center mb-2.5">
                          <img src="/document-pending.svg" alt="Documents Processed" className="w-5 h-5" />
                          <p className="text-sm text-brand-body font-normal leading-6">
                            Documents Pending:{" "}
                            <span className="text-brand-primary font-semibold">{uploadSummary.documentsPending}</span>
                          </p>
                        </div>
                        <Link href={`/dashboard/document-organizer/document-listing?status=${encodedPendingStatus}`} passHref>
                          <div
                            className="bg-sidebar-background text-sidebar-foreground w-6 h-6 rounded-full relative flex items-center justify-center cursor-pointer shadow-md hover:shadow-lg transition-all"
                            title="Upload New Document"
                          >
                            <i className="fi fi-br-plus text-sidebar-foreground text-[10px] block leading-0"></i>
                          </div>
                        </Link>
                      </div>

                      <div className="h-[6px] w-full rounded-full bg-muted relative overflow-hidden">
                        <div
                          className="h-full rounded-full bg-destructive"
                          style={{ width: `${pendingPercentage}%` }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-start">
                        <div className="flex gap-2 items-center mb-2.5">
                          <img src="/document-pending.svg" alt="Documents Processed" className="w-5 h-5" />
                          <p className="text-sm text-brand-body font-normal leading-6">
                            Documents Needs Correction:{" "}
                            <span className="text-brand-primary font-semibold">{uploadSummary.documentsNeedsCorrection}</span>
                          </p>
                        </div>
                        <Link href={`/dashboard/document-organizer/document-listing?status=${encodedNeedCorrectionStatus}`} passHref>
                          <div
                            className="bg-sidebar-background text-sidebar-foreground w-6 h-6 rounded-full relative flex items-center justify-center cursor-pointer shadow-md hover:shadow-lg transition-all"
                            title="Upload New Document"
                          >
                            <i className="fi fi-br-plus text-sidebar-foreground text-[10px] block leading-0"></i>
                          </div>
                        </Link>
                      </div>

                      <div className="h-[6px] w-full rounded-full bg-muted relative overflow-hidden">
                        <div
                          className="h-full rounded-full bg-destructive"
                          style={{ width: `${needCorrectionPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="col-span-full text-center py-5">
                    <p className="text-base font-medium text-muted-foreground">No upload data available.</p>
                  </div>
                )}
              </div>
            </div>
            {(netIncomeYTD) && (
              <div className="bg-card border border-border rounded-card shadow-md">
                <div className="pt-4 px-5 pb-3 border-b border-border">
                  <h3 className="text-lg font-semibold text-brand-body">
                    Yearly Progress
                  </h3>
                </div>

                <div className="space-y-4 py-5 px-5">
                  {loading ? (
                    Array(2)
                      .fill(null)
                      .map((_, idx) => (
                        <div
                          key={`yearly-progress-skeleton-${idx}`}
                          className="h-10 bg-muted animate-pulse rounded-lg"
                        />
                      ))
                  ) : (
                    <div className="bg-muted border border-border rounded-lg px-4 py-3 flex items-center justify-between shadow-sm">
                      <p className="font-medium text-sm text-brand-body">Income</p>
                      <p className="flex items-center gap-1 font-semibold text-sm text-brand-body">
                        {netIncomeYTD.change}{" "}
                        <i
                          className={`${getArrowIcon(netIncomeYTD.change)} leading-0 block text-xs`}
                        />
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Pending actions (tasks) */}
        <div className="bg-card border border-border rounded-card shadow-md px-6 py-6 mt-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-brand-body">
              Pending actions
            </h3>
            <Link href="/dashboard/compliance/list">
              <Button variant="outline" size="sm" className="rounded-lg text-xs shadow-sm hover:shadow-md transition-shadow">
                Compliance list
              </Button>
            </Link>
          </div>
          {pendingTasks.length === 0 ? (
            <p className="text-sm text-muted-foreground">No pending actions found.</p>
          ) : (
            <div className="space-y-2">
              {pendingTasks.map((task) => (
                <Link
                  key={task.id}
                  href={`/dashboard/compliance/detail?taskId=${btoa(task.id.toString())}`}
                  className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3 text-sm hover:shadow-md transition-all shadow-sm"
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
          )}
        </div>
      </div>
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