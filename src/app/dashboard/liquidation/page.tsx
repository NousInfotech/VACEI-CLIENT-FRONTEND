"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import DashboardCard from "@/components/DashboardCard";
import DashboardActionButton from "@/components/DashboardActionButton";
import PageHeader from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  CircleDot,
  Lock,
  CalendarDays,
  FileText,
  Upload,
  Eye,
  ClipboardCheck,
  MessageSquare,
  Gavel,
  BadgeEuro,
} from "lucide-react";
import {
  getLiquidationProject,
  createLiquidationProject,
  updateLiquidationStatus,
  upsertComplianceTasksForMilestones,
  removeCompletedComplianceTasks,
} from "@/api/liquidationService";
import type { LiquidationStrictStatus } from "@/api/liquidationService";

const steps = [
  { key: "preparation", label: "Preparation" },
  { key: "resolutions", label: "Board & Shareholder Resolutions" },
  { key: "filings", label: "Statutory Filings" },
  { key: "final-accounts", label: "Final Accounts" },
  { key: "deregistration", label: "Deregistration" },
];

export default function LiquidationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeLiquidation, setActiveLiquidation] = useState(false);
  const [liquidationType, setLiquidationType] = useState<string | null>(null);
  const [initiatedAt, setInitiatedAt] = useState<Date | null>(null);
  const [liquidatorAppointed, setLiquidatorAppointed] = useState(true);
  const [liquidatorName, setLiquidatorName] = useState<string | null>("clv");
  const [referenceNumber, setReferenceNumber] = useState<string | null>("LQ-2025-0342");
  const [startDate, setStartDate] = useState<string>("15 March 2025");
  const [expectedCompletion, setExpectedCompletion] = useState<string>("Q4 2025");
  const [isCompleted, setIsCompleted] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [companyName, setCompanyName] = useState<string>("Your Company");

  const [requiredActions, setRequiredActions] = useState<
    { key: string; label: string; type: "upload" | "approve"; pending: boolean }[]
  >([
    { key: "bank-statements", label: "Upload latest bank statements", type: "upload", pending: true },
    { key: "board-resolutions", label: "Approve board resolutions", type: "approve", pending: true },
    { key: "liabilities", label: "Confirm outstanding liabilities", type: "approve", pending: false },
  ]);

  const actionsPending = requiredActions.some((a) => a.pending);

  const [milestones, setMilestones] = useState<
    { key: string; label: string; due: string; status: "Completed" | "Upcoming"; cta?: "Upload" | "View" }[]
  >([
    { key: "notice-filing", label: "Notice of liquidation filing", due: "22 March 2025", status: "Completed", cta: "View" },
    { key: "final-accounts", label: "Final accounts submission", due: "30 September 2025", status: "Upcoming", cta: "Upload" },
    { key: "deregistration", label: "Deregistration filing", due: "TBD", status: "Upcoming" },
  ]);

  const [liquidationDocs, setLiquidationDocs] = useState<
    { key: string; label: string; status: "Uploaded" | "Approved" | "Filed" | "Missing" }[]
  >([
    { key: "board-resolutions", label: "Board resolutions", status: "Missing" },
    { key: "shareholder-resolutions", label: "Shareholder resolutions", status: "Missing" },
    { key: "liquidator-appointment", label: "Liquidator appointment", status: "Missing" },
    { key: "final-accounts", label: "Final accounts", status: "Missing" },
    { key: "filing-confirmations", label: "Filing confirmations", status: "Missing" },
  ]);
  const [messages, setMessages] = useState<
    { id: string; author: "System" | "You"; text: string; timestamp: string }[]
  >([
    {
      id: "m1",
      author: "System",
      text: "Liquidator appointed",
      timestamp: new Date().toLocaleString(),
    },
    {
      id: "m2",
      author: "System",
      text: "Statutory filing submitted",
      timestamp: new Date().toLocaleString(),
    },
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [invoiceStatus] = useState("Invoice issued");
  const [invoiceUrl] = useState("#");
  const [strictStatus, setStrictStatus] = useState<LiquidationStrictStatus>("draft");

  const statusMap = useMemo(() => {
    if (isCompleted) {
      return steps.map((s) => ({ ...s, state: "completed" as const }));
    } else {
      const activeIndex = 2;
      return steps.map((s, idx) => {
        if (idx < activeIndex) return { ...s, state: "completed" as const };
        if (idx === activeIndex) return { ...s, state: "active" as const };
        return { ...s, state: "upcoming" as const };
      });
    }
  }, []);

  useEffect(() => {
    if (isCompleted) {
      setStrictStatus("completed");
    } else if (!activeLiquidation) {
      setStrictStatus("draft");
    } else if (actionsPending) {
      setStrictStatus("waiting_on_you");
    } else {
      setStrictStatus("in_progress");
    }
  }, [activeLiquidation, actionsPending, isCompleted]);

  useEffect(() => {
    const load = async () => {
      const companyId = typeof window !== "undefined" ? localStorage.getItem("vacei-active-company") || "" : "";
      const storedCompanies = typeof window !== "undefined" ? localStorage.getItem("vacei-companies") : null;

      if (companyId && storedCompanies) {
        try {
          const companies = JSON.parse(storedCompanies);
          const found = companies.find((c: any) => c.id === companyId || c._id === companyId);
          if (found) setCompanyName(found.name);
        } catch {}
      }

      if (!companyId) return;
      try {
        const project = await getLiquidationProject(companyId);
        if (project) {
          setActiveLiquidation(true);
          setLiquidationType(project.liquidation_type);
          setInitiatedAt(new Date(project.start_date));
          setStartDate(project.start_date);
          setExpectedCompletion(project.expected_completion);
          setLiquidatorName(project.liquidator || null);
          setIsCompleted(project.status === "completed");
          setStrictStatus(project.status);
          const ms = project.milestones.map((m) => ({
            key: m.id,
            label: m.name,
            due: m.due || "",
            status: m.status,
            cta: m.cta,
          }));
          setMilestones(ms);
        }
      } catch {}
    };
    load();
  }, []);

  // Check for uploaded document from URL params
  useEffect(() => {
    const uploadedDoc = searchParams.get("uploaded");
    if (uploadedDoc) {
      setLiquidationDocs((prev) =>
        prev.map((doc) =>
          doc.key === uploadedDoc ? { ...doc, status: "Uploaded" } : doc
        )
      );
      // Clean up URL parameter
      router.replace("/dashboard/liquidation", { scroll: false });
    }
  }, [searchParams, router]);

  return (
    <section className="flex flex-col gap-6 px-4 py-4 md:px-6 md:py-6 pt-2 md:pt-4">
      <PageHeader
        title="Liquidation"
        subtitle="Managed company wind-down services, handled step by step."
        description="This page shows the current status of your company’s liquidation process, key milestones, required actions, and statutory deadlines. Our team manages the process and will guide you through each stage."
        actions={
          activeLiquidation ? (
            <DashboardActionButton 
              Icon={Gavel}
              title="Liquidation Active"
              subtitle="View progress below"
              className="bg-white/5 border border-white/10 hover:bg-white/10 text-white cursor-default"
              showArrow={false}
            />
          ) : (
            <DashboardActionButton
              Icon={Gavel}
              title="Start Liquidation"
              subtitle="Begin the process"
              className="bg-white/5 border border-white/10 hover:bg-white/10 text-white"
              onClick={async () => {
                if (!liquidationType) return;
                const companyId = typeof window !== "undefined" ? localStorage.getItem("vacei-active-company") || "" : "";
                if (!companyId) return;
                const projectPayload = {
                  company_id: companyId,
                  project_type: "liquidation" as const,
                  liquidation_type: liquidationType as "MVL" | "CVL" | "Strike-off",
                  status: "in_progress" as const,
                  start_date: new Date().toISOString().split("T")[0],
                  expected_completion: expectedCompletion,
                  liquidator: liquidatorName || "",
                  milestones: milestones.map((m) => ({
                    id: m.key,
                    name: m.label,
                    due: m.due,
                    status: m.status,
                    cta: m.cta,
                  })),
                  documents: liquidationDocs.map((d) => ({
                    id: d.key,
                    name: d.label,
                    status: d.status,
                  })),
                  invoices: [],
                };
                try {
                  const created = await createLiquidationProject(projectPayload);
                  setActiveLiquidation(true);
                  setInitiatedAt(new Date(created.start_date));
                  setStartDate(created.start_date);
                  setExpectedCompletion(created.expected_completion);
                  setStrictStatus("in_progress");
                  setMessages((prev) => [
                    ...prev,
                    {
                      id: String(Date.now()),
                      author: "System",
                      text: "Liquidation started",
                      timestamp: new Date().toLocaleString(),
                    },
                  ]);
                  await upsertComplianceTasksForMilestones(created);
                } catch {}
              }}
            />
          )
        }
      />

      {actionsPending && !isCompleted && (
        <DashboardCard className="p-4 md:p-6 border-amber-200 bg-amber-50">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg md:text-xl font-semibold text-gray-900">Action Required</h2>
            <ClipboardCheck className="w-5 h-5 text-amber-600" />
          </div>
          <div className="space-y-2">
            {requiredActions
              .filter((a) => a.pending)
              .map((a) => (
                <div
                  key={a.key}
                  className="flex items-center justify-between rounded-lg bg-white border border-amber-200 p-3"
                >
                  <div className="text-sm md:text-base text-gray-800">{a.label}</div>
                  <div className="flex items-center gap-2">
                    {a.type === "upload" ? (
                      <Button
                        variant="default"
                        className="bg-brand-primary hover:bg-brand-active text-white"
                        onClick={() => {
                          setRequiredActions((prev) =>
                            prev.map((x) => (x.key === a.key ? { ...x, pending: false } : x))
                          );
                          const stillPending = requiredActions.some((x) => x.key !== a.key && x.pending);
                          if (!stillPending) {
                            setStrictStatus("in_progress");
                            (async () => {
                              const companyId = typeof window !== "undefined" ? localStorage.getItem("vacei-active-company") || "" : "";
                              if (!companyId) return;
                              try {
                                const project = await getLiquidationProject(companyId);
                                if (project && project.status !== "in_progress") {
                                  await updateLiquidationStatus(project.project_id, "in_progress");
                                }
                              } catch {}
                            })();
                          }
                        }}
                      >
                        Upload
                      </Button>
                    ) : (
                      <Button
                        variant="default"
                        className="bg-brand-primary hover:bg-brand-active text-white"
                        onClick={() => {
                          setRequiredActions((prev) =>
                            prev.map((x) => (x.key === a.key ? { ...x, pending: false } : x))
                          );
                          const stillPending = requiredActions.some((x) => x.key !== a.key && x.pending);
                          if (!stillPending) {
                            setStrictStatus("in_progress");
                            (async () => {
                              const companyId = typeof window !== "undefined" ? localStorage.getItem("vacei-active-company") || "" : "";
                              if (!companyId) return;
                              try {
                                const project = await getLiquidationProject(companyId);
                                if (project && project.status !== "in_progress") {
                                  await updateLiquidationStatus(project.project_id, "in_progress");
                                }
                              } catch {}
                            })();
                          }
                        }}
                      >
                        Approve
                      </Button>
                    )}
                  </div>
                </div>
              ))}
          </div>
          
        </DashboardCard>
      )}

      <DashboardCard className="p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg md:text-xl font-semibold text-gray-900">Liquidation Type</h2>
          {activeLiquidation && (
            <div className="flex items-center gap-2 text-xs md:text-sm text-gray-600">
              <Lock className="w-4 h-4 text-gray-500" />
              <span>Selection locked</span>
              {initiatedAt && (
                <span className="text-gray-500">
                  • Initiated {initiatedAt.toLocaleDateString()}
                </span>
              )}
            </div>
          )}
        </div>

        {!activeLiquidation ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button
              onClick={() => setLiquidationType("MVL")}
              className={`rounded-2xl border p-4 text-left transition-colors ${
                liquidationType === "MVL"
                  ? "bg-brand-muted border-brand-primary text-brand-primary"
                  : "bg-white border-gray-200 hover:bg-gray-50"
              }`}
            >
              <div className="font-medium">Members’ Voluntary Liquidation (MVL)</div>
            </button>
            <button
              onClick={() => setLiquidationType("CVL")}
              className={`rounded-2xl border p-4 text-left transition-colors ${
                liquidationType === "CVL"
                  ? "bg-brand-muted border-brand-primary text-brand-primary"
                  : "bg-white border-gray-200 hover:bg-gray-50"
              }`}
            >
              <div className="font-medium">Creditors’ Voluntary Liquidation (CVL)</div>
            </button>
            <button
              onClick={() => setLiquidationType("Strike-off")}
              className={`rounded-2xl border p-4 text-left transition-colors ${
                liquidationType === "Strike-off"
                  ? "bg-brand-muted border-brand-primary text-brand-primary"
                  : "bg-white border-gray-200 hover:bg-gray-50"
              }`}
            >
              <div className="font-medium">Strike-off (Dormant companies only)</div>
            </button>
          </div>
        ) : (
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
            <div className="text-sm text-gray-600">Selected</div>
            <div className="text-base md:text-lg font-semibold text-gray-900 mt-1">
              {liquidationType}
            </div>
          </div>
        )}
      </DashboardCard>

      <DashboardCard className="p-4 md:p-6">
        <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-4">Liquidation Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-gray-200 p-4 bg-white">
            <div className="text-sm text-gray-500">Liquidator appointed</div>
            <div className="text-base md:text-lg font-semibold text-gray-900 mt-1">
              {liquidatorAppointed ? "Yes" : "No"}
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 p-4 bg-white">
            <div className="text-sm text-gray-500">Liquidation start date</div>
            <div className="text-base md:text-lg font-semibold text-gray-900 mt-1">
              {startDate}
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 p-4 bg-white">
            <div className="text-sm text-gray-500">Expected completion</div>
            <div className="text-base md:text-lg font-semibold text-gray-900 mt-1">
              {expectedCompletion}
            </div>
          </div>
          {liquidatorName && (
            <div className="rounded-xl border border-gray-200 p-4 bg-white">
              <div className="text-sm text-gray-500">Liquidator name</div>
              <div className="text-base md:text-lg font-semibold text-gray-900 mt-1">
                {liquidatorName}
              </div>
            </div>
          )}
          {referenceNumber && (
            <div className="rounded-xl border border-gray-200 p-4 bg-white">
              <div className="text-sm text-gray-500">Reference number</div>
              <div className="text-base md:text-lg font-semibold text-gray-900 mt-1">
                {referenceNumber}
              </div>
            </div>
          )}
        </div>
      </DashboardCard>

      <DashboardCard className="p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg md:text-xl font-semibold text-gray-900">Status</h2>
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-brand-muted text-brand-primary">
            {strictStatus === "draft"
              ? "Draft"
              : strictStatus === "in_progress"
              ? "In progress"
              : strictStatus === "waiting_on_you"
              ? "Waiting on you"
              : "Completed"}
          </span>
        </div>
        <div className="flex flex-col gap-3">
          {statusMap.map((s) => {
            const isCompleted = s.state === "completed";
            const isActive = s.state === "active";
            return (
              <div
                key={s.key}
                className={`flex items-center justify-between rounded-xl border p-3 md:p-4 ${
                  isCompleted
                    ? "bg-green-50 border-green-200"
                    : isActive
                    ? "bg-brand-muted border-brand-primary"
                    : "bg-white border-gray-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  {isCompleted ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : isActive ? (
                    <CircleDot className="w-5 h-5 text-brand-primary" />
                  ) : (
                    <Lock className="w-5 h-5 text-gray-400" />
                  )}
                  <div
                    className={`text-sm md:text-base ${
                      isCompleted
                        ? "text-green-900 font-medium"
                        : isActive
                        ? "text-brand-primary font-medium"
                        : "text-gray-700"
                    }`}
                  >
                    {s.label}
                  </div>
                </div>
                <div className="text-xs md:text-sm">
                  {isCompleted ? (
                    <span className="text-green-700">Completed</span>
                  ) : isActive ? (
                    <span className="text-brand-primary">In progress</span>
                  ) : (
                    <span className="text-gray-500">Locked</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
      </DashboardCard>

      <DashboardCard className="p-4 md:p-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-brand-primary" />
            <h2 className="text-lg md:text-xl font-semibold text-gray-900">Key Deadlines</h2>
          </div>
          <a
            href="/dashboard/compliance"
            className="inline-flex items-center rounded-lg px-3 py-1.5 text-sm bg-brand-primary hover:bg-brand-active text-white transition-colors"
          >
            Open Compliance Calendar
          </a>
        </div>
        <div className="space-y-3">
          {milestones.map((m) => (
            <div
              key={m.key}
              className={`flex items-center justify-between rounded-xl border p-3 md:p-4 ${
                m.status === "Completed" ? "bg-green-50 border-green-200" : "bg-white border-gray-200"
              }`}
            >
              <div className="space-y-0.5">
                <div className="text-sm md:text-base font-medium text-gray-900">{m.label}</div>
                <div className="text-xs md:text-sm text-gray-600">Due: {m.due}</div>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    m.status === "Completed"
                      ? "bg-success text-success-foreground"
                      : "bg-brand-muted text-brand-primary"
                  }`}
                >
                  {m.status}
                </span>
              </div>
              <div className="shrink-0">
                {m.cta && m.status !== "Completed" && (
                  <Button
                    className="bg-brand-primary hover:bg-brand-active text-white"
                    onClick={async () => {
                      const companyId = typeof window !== "undefined" ? localStorage.getItem("vacei-active-company") || "" : "";
                      if (!companyId) return;
                      setMilestones((prev) =>
                        prev.map((x) =>
                          x.key === m.key ? { ...x, status: "Completed", cta: "View" } : x
                        )
                      );
                      try {
                        const project = await getLiquidationProject(companyId);
                        if (project) {
                          await removeCompletedComplianceTasks({
                            ...project,
                            milestones: project.milestones.map((mm) =>
                              mm.id === m.key ? { ...mm, status: "Completed" } : mm
                            ),
                          });
                        }
                      } catch {}
                    }}
                  >
                    {m.cta}
                  </Button>
                )}
                {m.cta === "View" && m.status === "Completed" && (
                  <Button variant="outline" className="border-gray-300 text-gray-700">
                    View
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </DashboardCard>

      <DashboardCard className="p-4 md:p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg md:text-xl font-semibold text-gray-900">Required Liquidation Documents</h2>
          <FileText className="w-5 h-5 text-brand-primary" />
        </div>
        <div className="space-y-2">
          {liquidationDocs.map((d) => (
            <div
              key={d.key}
              className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-3 md:p-4"
            >
              <div className="space-y-0.5">
                <div className="text-sm md:text-base font-medium text-gray-900">{d.label}</div>
              </div>
              <div className="flex items-center gap-2">
                {d.status === "Uploaded" && (
                  <Button
                    variant="outline"
                    size="icon"
                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                    onClick={() => {
                      // TODO: Open document preview
                      console.log("View document:", d.key);
                    }}
                    title="View"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                )}
                <Button
                  size="icon"
                  className={`${isCompleted ? "bg-gray-200 text-gray-500 cursor-not-allowed" : "bg-brand-primary hover:bg-brand-active text-white"}`}
                  disabled={isCompleted}
                  onClick={() => {
                    router.push(`/dashboard/liquidation/upload/${d.key}`);
                  }}
                  title="Upload"
                >
                  <Upload className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-gray-200">
          <Button
            className="w-full bg-brand-primary hover:bg-brand-active text-white disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed"
            disabled={liquidationDocs.some((doc) => doc.status === "Missing")}
            onClick={() => {
              router.push("/dashboard/liquidation/engagement");
            }}
          >
            Go To Start Liquidation
          </Button>
        </div>
      </DashboardCard>
      <DashboardCard className="p-4 md:p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg md:text-xl font-semibold text-gray-900">Liquidation Messages</h2>
          <MessageSquare className="w-5 h-5 text-brand-primary" />
        </div>
        <div className="space-y-2">
          {messages.map((m) => (
            <div
              key={m.id}
              className="rounded-xl border border-gray-200 bg-white p-3 md:p-4"
            >
              <div className="flex items-center justify-between">
                <div className="font-medium text-gray-900">{m.author}</div>
                <div className="text-xs text-gray-500">{m.timestamp}</div>
              </div>
              <div className="mt-1 text-sm text-gray-700">{m.text}</div>
            </div>
          ))}
        </div>
        {!isCompleted && (
          <div className="mt-3 flex items-center gap-2">
            <input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1 rounded-lg border border-gray-300 bg-white p-2 text-sm"
              placeholder="Type a message"
            />
            <Button
              className="bg-brand-primary hover:bg-brand-active text-white"
              onClick={() => {
                if (!newMessage.trim()) return;
                setMessages((prev) => [
                  ...prev,
                  {
                    id: String(Date.now()),
                    author: "You",
                    text: newMessage.trim(),
                    timestamp: new Date().toLocaleString(),
                  },
                ]);
                setNewMessage("");
              }}
            >
              Send
            </Button>
          </div>
        )}
      </DashboardCard>
      <DashboardCard className="p-4 md:p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg md:text-xl font-semibold text-gray-900">Fees</h2>
          <BadgeEuro className="w-5 h-5 text-brand-primary" />
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-3 md:p-4 flex items-center justify-between">
          <div>
            <div className="text-sm md:text-base font-medium text-gray-900">
              Liquidation professional fees
            </div>
            <div className="text-xs md:text-sm text-gray-600">Status: {invoiceStatus}</div>
          </div>
          <div>
            <Button variant="outline" className="border-gray-300 text-gray-700" onClick={() => {}}>
              View invoice
            </Button>
          </div>
        </div>
        
        {!isCompleted && (
          <div className="mt-4">
            <Button
              variant="outline"
              className="border-gray-300 text-gray-700"
              onClick={async () => {
                setIsCompleted(true);
                setShowSuccessModal(true);
                const companyId = typeof window !== "undefined" ? localStorage.getItem("vacei-active-company") || "" : "";
                if (!companyId) return;
                try {
                  const project = await getLiquidationProject(companyId);
                  if (project) {
                    const updated = await updateLiquidationStatus(project.project_id, "completed");
                    await removeCompletedComplianceTasks(updated);
                  }
                } catch {}
                setStrictStatus("completed");
              }}
            >
              Mark as completed
            </Button>
          </div>
        )}
      </DashboardCard>
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl animate-in fade-in zoom-in duration-200 border border-gray-100">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="rounded-full bg-green-100 p-3 ring-4 ring-green-50">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-semibold text-gray-900">Liquidation Completed</h2>
                <p className="text-sm text-gray-600">
                  This company has been successfully liquidated. All statutory filings and final accounts have been processed.
                </p>
              </div>
              <Button 
                className="w-full bg-gray-900 text-white hover:bg-gray-800"
                onClick={() => setShowSuccessModal(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
