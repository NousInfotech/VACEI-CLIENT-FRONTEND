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
      <div className="bg-card border-border border rounded-card shadow-md px-5 py-6">
        <div className="md:flex justify-between items-center mb-4 ">
          <h1 className="text-[32px] leading-normal text-brand-body capitalize font-light">
            Welcome back, <span className="font-semibold text-brand-body">{username || 'User'}</span>
          </h1>
          <Button
            variant="default"
            onClick={handleContactAccountantClick}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm cursor-pointer !font-normal"
          >
            <HugeiconsIcon icon={AddressBookIcon} className="w-4.5 h-4.5 size-custom" />
            Contact Accountant
          </Button>
        </div>

        {!uploadLoading && uploadSummary?.filesUploadedThisMonth === 0 && (
          <div className="mb-8 flex items-start gap-2 p-3 border-l-4 border-destructive bg-destructive/10 text-destructive rounded-lg shadow-md">
            <HugeiconsIcon icon={Alert02Icon} className="w-6 h-6" />
            <p className="m-0">
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
        <div className="mb-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 lg:grid-cols-2 gap-5">
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
            <div className="bg-card border-border border rounded-card shadow-md mb-5">
              <div className="pt-3 px-5 pb-3 border-b border-border">
                <h3 className="text-xl leading-normal text-brand-body capitalize font-medium">
                  Compliance snapshot
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-3 py-5 px-5 text-sm">
                <Kpi label="Overdue" value={complianceCounts.overdue} tone="danger" />
                <Kpi label="Due soon" value={complianceCounts.dueSoon} tone="warning" />
                <Kpi label="Waiting" value={complianceCounts.waiting} tone="info" />
                <Kpi label="Done" value={complianceCounts.done} tone="success" />
              </div>
              <div className="px-5 pb-4">
                <Link href="/dashboard/compliance/list">
                  <Button variant="outline" size="sm" className="rounded-full text-xs">
                    View compliance list
                  </Button>
                </Link>
              </div>
            </div>

            <div className="bg-card border-border border rounded-card shadow-md mb-5">
              <div className="pt-3 px-5 pb-3 border-b border-border">
                <h3 className="text-xl leading-normal text-brand-body capitalize font-medium">
                  Upload Status Summary
                </h3>
              </div>
              <div className="space-y-6 py-5 px-5">
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
                          <p className="text-sm text-[#3D3D3D] font-normal leading-6">
                            Documents Uploaded:{" "}
                            <span className="text-primary font-medium">{uploadSummary.documentsUploaded}</span>
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
                      <div className="progress bg-[#D9D9D9] h-[4px] w-full rounded-full relative">
                        {uploadSummary.documentsUploaded > 0 && (
                          <div className="progress-bar bg-primary h-[4px] w-full rounded-full"></div>
                        )}
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-start">
                        <div className="flex gap-2 items-center mb-2.5">
                          <img src="/document-pending.svg" alt="Documents Processed" className="w-5 h-5" />
                          <p className="text-sm text-[#3D3D3D] font-normal leading-6">
                            Documents Processed:{" "}
                            <span className="text-[#E53933] font-medium">{uploadSummary.documentsProcessed}</span>
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

                      <div className="progress bg-[#D9D9D9] h-[4px] w-full rounded-full relative">
                        <div
                          className="progress-bar bg-[#EA9813] h-[4px] rounded-full"
                          style={{ width: `${processedPercentage}%` }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-start">
                        <div className="flex gap-2 items-center mb-2.5">
                          <img src="/document-pending.svg" alt="Documents Processed" className="w-5 h-5" />
                          <p className="text-sm text-[#3D3D3D] font-normal leading-6">
                            Documents Pending:{" "}
                            <span className="text-[#E53933] font-medium">{uploadSummary.documentsPending}</span>
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

                      <div className="progress bg-[#D9D9D9] h-[4px] w-full rounded-full relative">
                        <div
                          className="progress-bar bg-[#E53933] h-[4px] rounded-full"
                          style={{ width: `${pendingPercentage}%` }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-start">
                        <div className="flex gap-2 items-center mb-2.5">
                          <img src="/document-pending.svg" alt="Documents Processed" className="w-5 h-5" />
                          <p className="text-sm text-[#3D3D3D] font-normal leading-6">
                            Documents Needs Correction:{" "}
                            <span className="text-[#E53933] font-medium">{uploadSummary.documentsNeedsCorrection}</span>
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

                      <div className="progress bg-[#D9D9D9] h-[4px] w-full rounded-full relative">
                        <div
                          className="progress-bar bg-[#E53933] h-[4px] rounded-full"
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
              <div className="bg-card border-border border rounded-card shadow-md">
                <div className="pt-3 px-5 pb-3 border-b border-border">
                  <h3 className="text-xl leading-normal text-brand-body capitalize font-medium">
                    Yearly Progress
                  </h3>
                </div>

                <div className="space-y-6 py-5 px-5">
                  {loading ? (
                    Array(2)
                      .fill(null)
                      .map((_, idx) => (
                        <div
                          key={`yearly-progress-skeleton-${idx}`}
                          className="bg-gray-200 animate-pulse h-10 rounded-full mb-3"
                        />
                      ))
                  ) : (
                    <div className="bg-sidebar-background rounded-full px-5 py-[7px] flex items-center justify-between text-success-foreground mb-3 shadow-md">
                      <p className="font-medium text-sm">Income</p>
                      <p className="flex items-center font-medium text-sm">
                        {netIncomeYTD.change}{" "}
                        <i
                          className={`${getArrowIcon(netIncomeYTD.change)} leading-0 block`}
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
        <div className="bg-card border-border border rounded-card shadow-md px-5 py-6 mt-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xl leading-normal text-brand-body capitalize font-medium">
              Pending actions
            </h3>
            <Link href="/dashboard/compliance/list">
              <Button variant="outline" size="sm" className="rounded-full text-xs">
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
                  className="flex items-center justify-between rounded-lg border border-border/70 bg-muted/30 px-3 py-2 text-sm hover:bg-muted/50"
                >
                  <div>
                    <p className="font-medium text-brand-body">{task.title}</p>
                    {task.dueDate && (
                      <p className="text-xs text-muted-foreground">
                        Due {new Date(task.dueDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <span className="text-[11px] rounded-full bg-primary/10 px-2 py-1 text-primary">
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
  const toneClasses: Record<typeof tone, string> = {
    danger: "border-red-200 bg-red-50 text-red-800",
    warning: "border-amber-200 bg-amber-50 text-amber-800",
    info: "border-sky-200 bg-sky-50 text-sky-800",
    success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  };
  return (
    <div className={`rounded-[12px] border px-3 py-2 text-xs shadow-sm ${toneClasses[tone]}`}>
      <p className="font-medium">{label}</p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
    </div>
  );
}