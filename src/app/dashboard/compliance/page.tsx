"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import DashboardCard from "@/components/DashboardCard";
import { PageHeader } from "@/components/shared/PageHeader";
import Dropdown from "@/components/Dropdown";
import { ChevronDown, Calendar as CalendarIcon, List, HelpCircle, Download, Upload, MessageSquare, CheckCircle, Eye, AlertCircle, X, ArrowRight, Users } from "lucide-react";
import { fetchTasks } from "@/api/taskService";
import type { Task } from "@/interfaces";
import ParentSchedule from "@/app/dashboard/schedule/page";
import { fetchPayrollData, transformPayrollSubmissionsToComplianceItems } from "@/lib/payrollComplianceIntegration";

// Compliance status types
type ComplianceStatus = "Waiting on you" | "In progress" | "Due soon" | "Completed" | "Overdue";

// Service types
type ServiceType = "VAT" | "Tax" | "Payroll" | "Corporate Services" | "Audit" | "Other" | "All";

// Period filter types
type PeriodFilter = "This month" | "Next 3 months" | "This year" | "All";

// Compliance item interface
interface ComplianceItem {
  id: number;
  obligationName: string;
  dueDate: string;
  service: ServiceType;
  status: ComplianceStatus;
  actionType: "upload" | "reply" | "approve" | "view" | "resolve";
  relatedServiceId?: number;
}

// Payroll Service Card Component
function PayrollServiceCard() {
  const [payrollSubmissions, setPayrollSubmissions] = useState<Array<{ name: string; status: string; due_date?: string }>>([]);
  
  useEffect(() => {
    const loadPayrollData = async () => {
      const data = await fetchPayrollData();
      if (data) {
        setPayrollSubmissions(data.submissions);
      }
    };
    loadPayrollData();
  }, []);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    if (status === "submitted") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium bg-success/10 text-success border-success/30 shadow-sm">
          Submitted
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium bg-muted text-muted-foreground border-border shadow-sm">
        Pending
      </span>
    );
  };

  return (
    <DashboardCard className="border-l-4 border-l-primary p-6 md:p-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
            <Users className="h-5 w-5 text-primary" />
          </div>
        <div>
            <h2 className="text-lg font-semibold text-brand-body">Payroll Service</h2>
            <p className="text-xs text-muted-foreground">Statutory submissions and obligations</p>
          </div>
        </div>
        <Link href="/dashboard/services/payroll">
          <Button variant="default" size="sm" className="rounded-lg">
            Go to Payroll
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>

      <div className="space-y-3 pt-4 border-t border-border">
        <h3 className="mt-3 text-sm font-semibold text-brand-body mb-2">STATUTORY SUBMISSIONS</h3>
        {payrollSubmissions.map((submission, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-brand-body">
                  • {submission.name}
                </span>
              </div>
              {submission.due_date && (
                <p className="text-xs text-muted-foreground">
                  Due: {formatDate(submission.due_date)}
                </p>
              )}
            </div>
            {getStatusBadge(submission.status)}
          </div>
        ))}
      </div>
    </DashboardCard>
  );
}

export default function ComplianceCalendarPage() {
  const [viewMode, setViewMode] = useState<"list" | "month">("list");
  const [complianceItems, setComplianceItems] = useState<ComplianceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showHelpModal, setShowHelpModal] = useState(false);
  
  // Filters
  const [serviceFilter, setServiceFilter] = useState<ServiceType>("All");
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>("All");
  const [statusFilter, setStatusFilter] = useState<ComplianceStatus | "All">("All");
  const [summaryFilter, setSummaryFilter] = useState<ComplianceStatus | "Upcoming" | null>(null);

  // Summary counts
  const [summaryCounts, setSummaryCounts] = useState({
    overdue: 0,
    waitingOnYou: 0,
    dueSoon: 0,
    upcoming: 0,
  });

  // Load compliance items
  const loadComplianceItems = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch tasks and transform to compliance items
      const taskResponse = await fetchTasks({ page: 1, limit: 100 });
      const tasks = taskResponse.data || [];
      
      // Transform tasks to compliance items
      const items: ComplianceItem[] = tasks
        .filter((task: Task) => task.dueDate) // Only items with deadlines
        .map((task: Task) => {
          const dueDate = new Date(task.dueDate as string);
          const now = new Date();
          const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          
          let status: ComplianceStatus;
          if (task.status?.toLowerCase().includes("completed") || task.status?.toLowerCase().includes("done")) {
            status = "Completed";
          } else if (daysUntilDue < 0) {
            status = "Overdue";
          } else if (task.status?.toLowerCase().includes("waiting")) {
            status = "Waiting on you";
          } else if (daysUntilDue <= 7) {
            status = "Due soon";
          } else {
            status = "In progress";
          }

          // Determine action type based on status
          let actionType: "upload" | "reply" | "approve" | "view" | "resolve";
          if (status === "Waiting on you") {
            const title = (task.title || "").toLowerCase();
            if (title.includes("upload")) actionType = "upload";
            else if (title.includes("reply") || title.includes("query")) actionType = "reply";
            else if (title.includes("approve") || title.includes("sign")) actionType = "approve";
            else actionType = "view";
          } else if (status === "Overdue") {
            actionType = "resolve";
          } else {
            actionType = "view";
          }

          // Map category to service
          const category = (task.category || "").toLowerCase();
          let service: ServiceType = "Other";
          if (category.includes("vat")) service = "VAT";
          else if (category.includes("tax")) service = "Tax";
          else if (category.includes("payroll")) service = "Payroll";
          else if (category.includes("csp") || category.includes("mbr") || category.includes("corporate")) service = "Corporate Services";
          else if (category.includes("audit")) service = "Audit";

          return {
            id: task.id,
            obligationName: task.title || "Untitled",
            dueDate: task.dueDate as string,
            service,
            status,
            actionType,
            relatedServiceId: task.id,
          };
        });

      // Fetch and add payroll submissions
      const payrollData = await fetchPayrollData();
      const payrollItems = payrollData 
        ? transformPayrollSubmissionsToComplianceItems(payrollData, 1000000)
        : [];
      
      const allItems = [...items, ...payrollItems];
      setComplianceItems(allItems);
      
      // Calculate summary counts
      const now = new Date();
      const counts = {
        overdue: allItems.filter(item => item.status === "Overdue").length,
        waitingOnYou: allItems.filter(item => item.status === "Waiting on you").length,
        dueSoon: allItems.filter(item => item.status === "Due soon").length,
        upcoming: allItems.filter(item => {
          const due = new Date(item.dueDate);
          const daysUntilDue = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          return daysUntilDue > 7 && item.status !== "Completed" && item.status !== "Overdue";
        }).length,
      };
      setSummaryCounts(counts);
    } catch (error) {
      console.error("Failed to load compliance items", error);
      setComplianceItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadComplianceItems();
  }, [loadComplianceItems]);

  // Apply filters
  const filteredItems = complianceItems.filter((item) => {
    // Service filter
    if (serviceFilter !== "All" && item.service !== serviceFilter) return false;

    // Status filter
    if (statusFilter !== "All" && item.status !== statusFilter) return false;

    // Summary filter (from clicking summary cards)
    if (summaryFilter) {
      if (summaryFilter === "Upcoming") {
        const due = new Date(item.dueDate);
        const now = new Date();
        const daysUntilDue = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (daysUntilDue <= 7 || item.status === "Completed" || item.status === "Overdue") return false;
      } else if (item.status !== summaryFilter) return false;
    }

    // Period filter
    if (periodFilter !== "All") {
      const due = new Date(item.dueDate);
      const now = new Date();
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const next3Months = new Date(now.getFullYear(), now.getMonth() + 3, 1);
      const thisYear = new Date(now.getFullYear(), 0, 1);
      const nextYear = new Date(now.getFullYear() + 1, 0, 1);

      if (periodFilter === "This month" && (due < thisMonth || due >= next3Months)) return false;
      if (periodFilter === "Next 3 months" && (due < thisMonth || due >= next3Months)) return false;
      if (periodFilter === "This year" && (due < thisYear || due >= nextYear)) return false;
    }

    return true;
  });

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  };

  // Get CTA button
  const getCTAButton = (item: ComplianceItem) => {
    const buttonText = {
      upload: "Upload documents",
      reply: "Reply",
      approve: "Approve",
      view: "View",
      resolve: "Resolve",
    }[item.actionType];

    // Link payroll items to payroll page
    const href = item.service === "Payroll"
      ? `/dashboard/services/payroll`
      : item.actionType === "upload" 
      ? `/dashboard/document-organizer/document-upload`
      : item.actionType === "reply" || item.actionType === "approve"
      ? `/dashboard/messages`
      : `/dashboard/compliance/detail?taskId=${btoa(item.id.toString())}`;

    return (
      <Link href={href}>
        <Button size="sm" variant="default" className="whitespace-nowrap">
          {buttonText}
        </Button>
      </Link>
    );
  };

  // Handle summary card click
  const handleSummaryClick = (filter: ComplianceStatus | "Upcoming") => {
    if (summaryFilter === filter) {
      setSummaryFilter(null);
    } else {
      setSummaryFilter(filter);
    }
  };

  // Handle download calendar (.ics)
  const handleDownloadCalendar = useCallback(() => {
    try {
      // Generate .ics file content
      const icsContent = generateICSFile(complianceItems);
      
      // Create blob and download
      const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `compliance-calendar-${new Date().toISOString().split("T")[0]}.ics`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error("Failed to download calendar", error);
      alert("Failed to download calendar. Please try again.");
    }
  }, [complianceItems]);

  // Generate ICS file content
  const generateICSFile = (items: ComplianceItem[]): string => {
    const now = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    let ics = "BEGIN:VCALENDAR\r\n";
    ics += "VERSION:2.0\r\n";
    ics += "PRODID:-//VACEI//Compliance Calendar//EN\r\n";
    ics += "CALSCALE:GREGORIAN\r\n";
    ics += "METHOD:PUBLISH\r\n";

    items.forEach((item) => {
      const dueDate = new Date(item.dueDate);
      const startDate = dueDate.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
      const endDate = new Date(dueDate.getTime() + 60 * 60 * 1000).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
      
      ics += "BEGIN:VEVENT\r\n";
      ics += `UID:${item.id}@vacei.com\r\n`;
      ics += `DTSTAMP:${now}\r\n`;
      ics += `DTSTART:${startDate}\r\n`;
      ics += `DTEND:${endDate}\r\n`;
      ics += `SUMMARY:${item.obligationName}\r\n`;
      ics += `DESCRIPTION:${item.service} - ${item.status}\r\n`;
      ics += `STATUS:CONFIRMED\r\n`;
      ics += `SEQUENCE:0\r\n`;
      ics += "END:VEVENT\r\n";
    });

    ics += "END:VCALENDAR\r\n";
    return ics;
  };

  return (
    <section className="mx-auto max-w-[1400px] w-full pt-5 space-y-6">
      <PageHeader
        title="Compliance Calendar"
        subtitle="All statutory deadlines and obligations — automatically tracked"
        actions={
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="bg-light text-primary-color-new"
              onClick={() => setShowHelpModal(true)}
            >
              <HelpCircle className="w-4 h-4 mr-2" />
              Help
            </Button>
            <Button
              variant="outline"
              className="bg-light text-primary-color-new"
              onClick={handleDownloadCalendar}
              disabled={complianceItems.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Download (.ics)
            </Button>

            <Link href="/dashboard/compliance/setup">
              <Button
                variant="outline"
                className="bg-light text-primary-color-new"
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                Setup
              </Button>
            </Link>
          </div>
        }
      />

      {/* Summary Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard
          label="Overdue"
          value={summaryCounts.overdue}
          tone="danger"
          onClick={() => handleSummaryClick("Overdue")}
          isActive={summaryFilter === "Overdue"}
        />
        <SummaryCard
          label="Waiting on you"
          value={summaryCounts.waitingOnYou}
          tone="info"
          onClick={() => handleSummaryClick("Waiting on you")}
          isActive={summaryFilter === "Waiting on you"}
        />
        <SummaryCard
          label="Due soon (7 days)"
          value={summaryCounts.dueSoon}
          tone="warning"
          onClick={() => handleSummaryClick("Due soon")}
          isActive={summaryFilter === "Due soon"}
        />
        <SummaryCard
          label="Upcoming"
          value={summaryCounts.upcoming}
          tone="success"
          onClick={() => handleSummaryClick("Upcoming")}
          isActive={summaryFilter === "Upcoming"}
        />
      </div>

      {/* Payroll Service Card */}
      <PayrollServiceCard />

      {/* Main Content */}
      <DashboardCard className="overflow-visible">
        {/* View Toggle & Filters */}
        <div className="px-6 py-4 border-b border-border flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="rounded-lg"
            >
              <List className="w-4 h-4 mr-2" />
              List view
            </Button>
            <Button
              variant={viewMode === "month" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("month")}
              className="rounded-lg"
            >
              <CalendarIcon className="w-4 h-4 mr-2" />
              Month view
            </Button>
          </div>

          <div className="flex flex-wrap gap-3">
            {/* Service Filter */}
            <Dropdown
              className="w-auto min-w-[140px]"
              align="left"
              side="bottom"
              trigger={
                <Button variant="outline" size="sm" className="w-auto min-w-[140px] h-9 justify-between">
                  {serviceFilter}
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              }
              items={[
                { id: "All", label: "All", onClick: () => setServiceFilter("All") },
                { id: "VAT", label: "VAT", onClick: () => setServiceFilter("VAT") },
                { id: "Payroll", label: "Payroll", onClick: () => setServiceFilter("Payroll") },
                { id: "Audit", label: "Audit", onClick: () => setServiceFilter("Audit") },
                { id: "Corporate Services", label: "Corporate Services", onClick: () => setServiceFilter("Corporate Services") },
                { id: "Tax", label: "Tax", onClick: () => setServiceFilter("Tax") },
                { id: "Other", label: "Other", onClick: () => setServiceFilter("Other") },
              ]}
            />

            {/* Period Filter */}
            <Dropdown
              className="w-auto min-w-[140px]"
              align="left"
              side="bottom"
              trigger={
                <Button variant="outline" size="sm" className="w-auto min-w-[140px] h-9 justify-between">
                  {periodFilter}
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              }
              items={[
                { id: "All", label: "All", onClick: () => setPeriodFilter("All") },
                { id: "This month", label: "This month", onClick: () => setPeriodFilter("This month") },
                { id: "Next 3 months", label: "Next 3 months", onClick: () => setPeriodFilter("Next 3 months") },
                { id: "This year", label: "This year", onClick: () => setPeriodFilter("This year") },
              ]}
            />

            {/* Status Filter */}
            <Dropdown
              className="w-auto min-w-[140px]"
              align="left"
              side="bottom"
              trigger={
                <Button variant="outline" size="sm" className="w-auto min-w-[140px] h-9 justify-between">
                  {statusFilter}
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              }
              items={[
                { id: "All", label: "All", onClick: () => setStatusFilter("All") },
                { id: "Waiting on you", label: "Waiting on you", onClick: () => setStatusFilter("Waiting on you") },
                { id: "Due soon", label: "Due soon", onClick: () => setStatusFilter("Due soon") },
                { id: "In progress", label: "In progress", onClick: () => setStatusFilter("In progress") },
                { id: "Completed", label: "Completed", onClick: () => setStatusFilter("Completed") },
                { id: "Overdue", label: "Overdue", onClick: () => setStatusFilter("Overdue") },
              ]}
            />
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6">
          {viewMode === "list" ? (
            <ListContentView items={filteredItems} loading={loading} formatDate={formatDate} getCTAButton={getCTAButton} />
          ) : (
            <MonthContentView items={filteredItems} />
          )}
        </div>
      </DashboardCard>

      {/* Help Modal */}
      {showHelpModal && (
        <HelpModal onClose={() => setShowHelpModal(false)} />
      )}
    </section>
  );
}

// Summary Card Component
function SummaryCard({
  label,
  value,
  tone,
  onClick,
  isActive,
}: {
  label: string;
  value: number;
  tone: "danger" | "warning" | "info" | "success";
  onClick: () => void;
  isActive: boolean;
}) {
  const toneClasses = {
    danger: {
      border: "border-destructive/30",
      bg: "bg-destructive/5",
      text: "text-destructive",
    },
    warning: {
      border: "border-warning/30",
      bg: "bg-warning/5",
      text: "text-warning",
    },
    info: {
      border: "border-info/30",
      bg: "bg-info/5",
      text: "text-info",
    },
    success: {
      border: "border-success/30",
      bg: "bg-success/5",
      text: "text-success",
    },
  };

  const classes = toneClasses[tone];

  return (
    <div
      className={`cursor-pointer transition-all hover:shadow-lg ${classes.border} ${classes.bg} ${
        isActive ? "ring-2 ring-primary" : ""
      } rounded-lg border bg-card shadow-sm`}
      onClick={onClick}
    >
      <div className="p-4">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-2">{label}</p>
        <p className={`text-3xl font-bold ${classes.text} tabular-nums`}>{value}</p>
      </div>
    </div>
  );
}

// List Content View
function ListContentView({
  items,
  loading,
  formatDate,
  getCTAButton,
}: {
  items: ComplianceItem[];
  loading: boolean;
  formatDate: (date: string) => string;
  getCTAButton: (item: ComplianceItem) => React.ReactNode;
}) {
  if (loading) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">Loading compliance items…</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">No compliance items found for the current filters.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <DashboardCard key={item.id} className="p-5 hover:shadow-lg transition-all border-l-4 border-l-transparent hover:border-l-primary group">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-brand-body mb-2 group-hover:text-primary transition-colors">{item.obligationName}</h3>
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <span className="text-muted-foreground">
                  Due: <span className="font-medium text-brand-body">{formatDate(item.dueDate)}</span>
                </span>
                <span className="text-muted-foreground">·</span>
                <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-xs font-medium border border-primary/20">
                  {item.service}
                </span>
                <span className="text-muted-foreground">·</span>
                <StatusBadge status={item.status} />
              </div>
            </div>
            <div className="shrink-0">{getCTAButton(item)}</div>
          </div>
        </DashboardCard>
      ))}
    </div>
  );
}

// Month Content View
function MonthContentView({ items }: { items: ComplianceItem[] }) {
  return (
    <div className="compliance-calendar-wrapper">
      <div className="bg-linear-to-br from-card to-card/50 border border-border rounded-xl shadow-lg p-6 backdrop-blur-sm">
        <div className="mb-4 pb-4 border-b border-border">
          <h3 className="text-lg font-semibold text-brand-body">Calendar View</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Click on any date to view compliance items due on that day
          </p>
        </div>
        <div className="calendar-container">
          <ParentSchedule />
        </div>
      </div>
    </div>
  );
}

// Help Modal Component
function HelpModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-brand-body">Compliance Calendar Help</h2>
          <Button variant="ghost" size="sm" onClick={onClose} className="rounded-lg">
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="p-6 space-y-4 text-sm text-brand-body">
          <div>
            <h3 className="font-semibold mb-2">What is the Compliance Calendar?</h3>
            <p className="text-muted-foreground">
              The Compliance Calendar shows all statutory deadlines and obligations that require your attention. 
              It automatically tracks deadlines from VAT returns, payroll submissions, corporate filings, and audit requirements.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Summary Cards</h3>
            <p className="text-muted-foreground">
              Click on any summary card (Overdue, Waiting on you, Due soon, Upcoming) to filter the list below. 
              Click again to clear the filter.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">List View vs Month View</h3>
            <p className="text-muted-foreground">
              <strong>List View:</strong> See all compliance items in a clean list format with due dates, services, and status.
              <br />
              <strong>Month View:</strong> View deadlines on a calendar. Click on any date to see items due on that day.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Statuses</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li><strong>Waiting on you:</strong> Action required from you (upload, reply, or approve)</li>
              <li><strong>In progress:</strong> We're working on this</li>
              <li><strong>Due soon:</strong> Deadline within 7 days</li>
              <li><strong>Completed:</strong> This item is done</li>
              <li><strong>Overdue:</strong> Past the deadline - needs immediate attention</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Download Calendar</h3>
            <p className="text-muted-foreground">
              Click "Download (.ics)" to export all compliance deadlines to your calendar application (Google Calendar, Outlook, etc.).
            </p>
          </div>
        </div>
        <div className="sticky bottom-0 bg-card border-t border-border px-6 py-4">
          <Button onClick={onClose} className="w-full">
            Got it
          </Button>
        </div>
      </div>
    </div>
  );
}

// Status Badge Component
function StatusBadge({ status }: { status: ComplianceStatus }) {
  const statusClasses = {
    "Waiting on you": "bg-info/10 text-info border-info/30",
    "In progress": "bg-primary/10 text-primary border-primary/30",
    "Due soon": "bg-warning/10 text-warning border-warning/30",
    "Completed": "bg-success/10 text-success border-success/30",
    "Overdue": "bg-destructive/10 text-destructive border-destructive/30",
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg border text-xs font-medium ${statusClasses[status]}`}>
      {status}
    </span>
  );
}
