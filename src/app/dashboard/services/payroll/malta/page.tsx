// ********************************************************************************************************************************
// PAYROLL MALTA PAGE
// ******************************************************************************************************************************** 
"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Upload,
  ChevronDown,
  ChevronUp,
  FileText,
  Download,
  Eye,
  CheckCircle2,
  Clock,
  AlertCircle,
  MessageSquare,
  Receipt,
  ExternalLink,
  Info,
  UserPlus,
  UserMinus,
  TrendingUp,
  Calendar,
  Users,
  FileArchive,
  Filter,
} from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";

// ------------------------------------------------------------------
// DATA TYPES
// ------------------------------------------------------------------

type PayrollStatus = "waiting_on_client" | "in_progress" | "completed";
type DocumentStatus = "uploaded" | "processed" | "submitted" | "available" | "not_due";
type SubmissionStatus = "pending" | "submitted" | "in_progress" | "not_due";
type EmployeeStatus = "Active" | "Inactive";

interface Employee {
  id: string;
  name: string;
  status: EmployeeStatus;
  startDate: string;
  endDate?: string;
}

interface StatutoryForm {
  id: string;
  name: string;
  description: string;
  status: SubmissionStatus;
}

interface PayrollDocument {
  id: string;
  name: string;
  type: "reports" | "payslips" | "fs3" | "fs5" | "fs7" | "confirmations";
  status: DocumentStatus;
  year?: string;
  employee?: string;
}

interface PayrollMessage {
  id: string;
  text: string;
  timestamp: string;
  type: "system" | "user";
}

interface PayrollData {
  service: "payroll";
  company_id: string;
  current_period: string;
  status: PayrollStatus;
  submission_due_date: string;
  employees: Employee[];
  statutoryForms: StatutoryForm[];
  submissions: Array<{
    name: string;
    status: SubmissionStatus;
    due_date?: string;
  }>;
  documents: PayrollDocument[];
  archivedDocuments: PayrollDocument[];
  messages: PayrollMessage[];
  deadlines: Array<{
    name: string;
    date: string;
    type: "monthly" | "annual";
  }>;
}

// ------------------------------------------------------------------
// MOCK DATA (Based on Document Requirements)
// ------------------------------------------------------------------

const initialPayrollData: PayrollData = {
  service: "payroll",
  company_id: "company-malta-001",
  current_period: "2025-07", // July 2025
  status: "waiting_on_client",
  submission_due_date: "2025-08-15",
  employees: [
    { id: "emp-001", name: "John Smith", status: "Active", startDate: "2023-01-01" },
    { id: "emp-002", name: "Maria Borg", status: "Active", startDate: "2024-03-15" },
    { id: "emp-003", name: "Alex Vella", status: "Inactive", startDate: "2022-02-01", endDate: "2025-06-30" },
  ],
  statutoryForms: [
    { id: "fs5", name: "FS5", description: "Monthly payroll submissions", status: "in_progress" },
    { id: "fs3", name: "FS3", description: "Employee annual statements", status: "not_due" },
    { id: "fs7", name: "FS7", description: "Annual payroll reconciliation", status: "not_due" },
  ],
  submissions: [
    { name: "FS5 — Monthly payroll submission", status: "pending", due_date: "2025-08-15" },
    { name: "Social Security Contributions", status: "pending", due_date: "2025-08-10" },
  ],
  documents: [
    { id: "doc-1", name: "Payroll reports", type: "reports", status: "available" },
    { id: "doc-2", name: "Payslips - July 2025", type: "payslips", status: "available" },
    { id: "doc-3", name: "FS3 statements", type: "fs3", status: "not_due" },
    { id: "doc-4", name: "FS5 submission confirmations", type: "fs5", status: "available" },
    { id: "doc-5", name: "FS7 annual reconciliation", type: "fs7", status: "not_due" },
  ],
  archivedDocuments: [
    { id: "arch-1", name: "FS5 - June 2025", type: "fs5", status: "submitted", year: "2025" },
    { id: "arch-2", name: "FS5 - May 2025", type: "fs5", status: "submitted", year: "2025" },
    { id: "arch-3", name: "FS3 - John Smith 2024", type: "fs3", status: "submitted", year: "2024", employee: "John Smith" },
    { id: "arch-4", name: "FS3 - Maria Borg 2024", type: "fs3", status: "submitted", year: "2024", employee: "Maria Borg" },
    { id: "arch-5", name: "FS7 - 2024", type: "fs7", status: "submitted", year: "2024" },
    { id: "arch-6", name: "FS5 - April 2025", type: "fs5", status: "submitted", year: "2025" },
  ],
  messages: [
    { id: "1", text: "New payroll cycle opened for July 2025", timestamp: "2025-07-01T09:00:00Z", type: "system" },
    { id: "2", text: "Payroll changes received", timestamp: "2025-07-05T14:30:00Z", type: "system" },
    { id: "3", text: "Payroll processing in progress", timestamp: "2025-07-10T10:00:00Z", type: "system" },
    { id: "4", text: "Payroll submitted", timestamp: "2025-07-12T16:00:00Z", type: "system" },
    { id: "5", text: "Payslips available", timestamp: "2025-07-12T16:05:00Z", type: "system" },
    { id: "6", text: "FS3 statements generated for 2024", timestamp: "2025-02-10T11:00:00Z", type: "system" },
    { id: "7", text: "All statutory submissions completed for June 2025", timestamp: "2025-06-18T15:00:00Z", type: "system" },
  ],
  deadlines: [
    { name: "Payroll submission (FS5)", date: "2025-08-15", type: "monthly" },
    { name: "Social Security Contributions", date: "2025-08-10", type: "monthly" },
    { name: "FS3 & FS7 (annual)", date: "2026-02-15", type: "annual" },
  ],
};

// ------------------------------------------------------------------
// UI COMPONENTS
// ------------------------------------------------------------------

function StatusBadge({ status }: { status: PayrollStatus }) {
  const statusConfig = {
    waiting_on_client: {
      label: "Waiting on you",
      className: "bg-info/10 text-info border-info/30",
      icon: AlertCircle,
    },
    in_progress: {
      label: "In progress",
      className: "bg-primary/10 text-primary border-primary/30",
      icon: Clock,
    },
    completed: {
      label: "Completed",
      className: "bg-success/10 text-success border-success/30",
      icon: CheckCircle2,
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium ${config.className} shadow-sm`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
}

function SubmissionBadge({ status }: { status: SubmissionStatus | DocumentStatus }) {
  const config: Record<string, { label: string; className: string; icon: any }> = {
    submitted: { label: "Submitted", className: "bg-success/10 text-success border-success/30", icon: CheckCircle2 },
    pending: { label: "Pending", className: "bg-muted text-muted-foreground border-border", icon: null },
    in_progress: { label: "In progress", className: "bg-primary/10 text-primary border-primary/30", icon: Clock },
    not_due: { label: "Not due", className: "bg-muted text-muted-foreground border-border", icon: null },
    available: { label: "Available", className: "bg-success/10 text-success border-success/30", icon: CheckCircle2 },
    uploaded: { label: "Uploaded", className: "bg-info/10 text-info border-info/30", icon: null },
    processed: { label: "Processed", className: "bg-primary/10 text-primary border-primary/30", icon: null },
  };

  const c = config[status] || { label: status, className: "bg-muted text-muted-foreground border-border", icon: null };
  const Icon = c.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium ${c.className} shadow-sm`}>
      {Icon && <Icon className="w-3 h-3" />}
      {c.label}
    </span>
  );
}

function EmployeeStatusBadge({ status }: { status: EmployeeStatus }) {
  return (
    <span className={`inline-flex items-center rounded-lg border px-2 py-0.5 text-xs font-medium shadow-sm ${
      status === "Active" 
        ? "bg-success/10 text-success border-success/30" 
        : "bg-muted text-muted-foreground border-border"
    }`}>
      {status}
    </span>
  );
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function formatPeriod(period: string): string {
  const [year, month] = period.split("-");
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

// ------------------------------------------------------------------
// MAIN COMPONENT
// ------------------------------------------------------------------

export default function PayrollMaltaPage() {
  const [payrollData, setPayrollData] = useState<PayrollData>(initialPayrollData);
  const [isHistoryOpen, setIsHistoryOpen] = useState(true);
  const [isEmployeesOpen, setIsEmployeesOpen] = useState(true);
  const [isArchiveOpen, setIsArchiveOpen] = useState(true);
  const [isSimulating, setIsSimulating] = useState(false);
  const [showUploadHelp, setShowUploadHelp] = useState(true);
  const [archiveFilter, setArchiveFilter] = useState({ type: "all", year: "all", employee: "all" });
  const [isGeneratingFS3, setIsGeneratingFS3] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const needsAction = payrollData.status === "waiting_on_client";
  const currentPeriodFormatted = formatPeriod(payrollData.current_period);
  const submissionDueFormatted = formatDate(payrollData.submission_due_date);

  // Extract unique employees for the filter dropdown
  const uniqueEmployees = [...new Set(payrollData.employees.map((e) => e.name))].sort();

  // ------------------------------------------------------------------
  // HANDLERS
  // ------------------------------------------------------------------

  const handleUpload = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      triggerProcessing("Payroll changes uploaded via file.");
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleConfirmNoChanges = () => {
    triggerProcessing("No changes confirmed - proceeding with payroll processing.");
  };

  const triggerProcessing = (message: string) => {
    setPayrollData((prev) => ({
      ...prev,
      status: "in_progress",
      messages: [
        ...prev.messages,
        { id: Date.now().toString(), text: message, timestamp: new Date().toISOString(), type: "system" },
      ],
    }));
  };

  const handleGenerateFS3 = () => {
    setIsGeneratingFS3(true);
    setTimeout(() => {
      // Add new FS3 docs to archive (Simulation)
      const newDocs = [
        { id: `fs3-gen-1`, name: "FS3 - John Smith 2025", type: "fs3" as const, status: "submitted" as const, year: "2025", employee: "John Smith" },
        { id: `fs3-gen-2`, name: "FS3 - Maria Borg 2025", type: "fs3" as const, status: "submitted" as const, year: "2025", employee: "Maria Borg" },
      ];
      
      setPayrollData((prev) => ({
        ...prev,
        archivedDocuments: [...newDocs, ...prev.archivedDocuments],
        messages: [
          ...prev.messages,
          { id: Date.now().toString(), text: "FS3 statements generated for all employees", timestamp: new Date().toISOString(), type: "system" },
        ],
      }));
      setIsGeneratingFS3(false);
    }, 2000);
  };

  // ------------------------------------------------------------------
  // EFFECTS
  // ------------------------------------------------------------------

  // Simulate the completion of payroll after it hits "in_progress"
  useEffect(() => {
    if (payrollData.status === "in_progress" && !isSimulating) {
      setIsSimulating(true);
      const timer = setTimeout(() => {
        setPayrollData((prev) => ({
          ...prev,
          status: "completed",
          submissions: prev.submissions.map((s) => ({ ...s, status: "submitted" as const })),
          statutoryForms: prev.statutoryForms.map((f) => 
             f.id === 'fs5' ? { ...f, status: 'submitted' as const } : f
          ),
          messages: [
            ...prev.messages,
            { id: Date.now().toString(), text: "Payroll submitted", timestamp: new Date().toISOString(), type: "system" },
            { id: (Date.now() + 1).toString(), text: "Payslips available", timestamp: new Date().toISOString(), type: "system" },
          ],
        }));
        setIsSimulating(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [payrollData.status, isSimulating]);

  // ------------------------------------------------------------------
  // DERIVED STATE
  // ------------------------------------------------------------------

  const filteredArchive = payrollData.archivedDocuments.filter((doc) => {
    if (archiveFilter.type !== "all" && doc.type !== archiveFilter.type) return false;
    if (archiveFilter.year !== "all" && doc.year !== archiveFilter.year) return false;
    if (archiveFilter.employee !== "all" && doc.employee !== archiveFilter.employee) return false;
    return true;
  });

  // ------------------------------------------------------------------
  // RENDER
  // ------------------------------------------------------------------

  return (
    <>
      <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv,.pdf" onChange={handleFileChange} className="hidden" />

      <section className="mx-auto max-w-[1200px] w-full pt-5 space-y-6 pb-10">
        {/* PAGE HEADER */}
        <PageHeader
          title="Payroll — Malta"
          description="Monthly payroll processing and statutory submissions handled for you."
          actions={
            needsAction && (
              <Button variant="outline" onClick={handleUpload} className="bg-light text-primary-color-new">
                <Upload className="w-4 h-4 mr-2" />
                Upload payroll information
              </Button>
            )
          }
        />

        <p className="text-sm text-muted-foreground">
          This page shows the status of your payroll, upcoming deadlines, employee information, and payroll documents. 
          Upload changes if needed — we take care of the rest.
        </p>

        {/* 🧭 SERVICE STATUS */}
        <div className="bg-card border border-border rounded-card shadow-md p-4">
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Status:</span>
              <StatusBadge status={payrollData.status} />
            </div>
            <div>
              <span className="text-muted-foreground">Current period: </span>
              <span className="font-semibold text-brand-body">{currentPeriodFormatted}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Next deadline: </span>
              <span className="font-semibold text-destructive">{submissionDueFormatted}</span>
            </div>
          </div>
        </div>

        {/* ⚠️ ACTION REQUIRED */}
        {needsAction && (
          <div className="bg-card border border-border rounded-card shadow-md p-6 space-y-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-info" />
              <h2 className="text-lg font-semibold text-brand-body">ACTION REQUIRED</h2>
            </div>

            <p className="text-sm text-brand-body">Do you have any payroll changes for {currentPeriodFormatted}?</p>

            {/* Help Section */}
            <div className="p-4 rounded-lg bg-info/5 border border-info/20">
              <button onClick={() => setShowUploadHelp(!showUploadHelp)} className="flex items-center justify-between w-full text-left">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-info" />
                  <span className="text-sm font-medium text-brand-body">Examples of payroll changes</span>
                </div>
                {showUploadHelp ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
              </button>

              {showUploadHelp && (
                <div className="mt-4 space-y-3 pt-4 border-t border-info/20">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-start gap-2">
                      <UserPlus className="w-4 h-4 text-success mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-brand-body">New employees</p>
                        <p className="text-xs text-muted-foreground">Someone joined your company</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <TrendingUp className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-brand-body">Salary changes</p>
                        <p className="text-xs text-muted-foreground">Pay raise or reduction</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <UserMinus className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-brand-body">Employee terminations</p>
                        <p className="text-xs text-muted-foreground">Someone left your company</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Calendar className="w-4 h-4 text-warning mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-brand-body">Leave or unpaid leave</p>
                        <p className="text-xs text-muted-foreground">Time off or unpaid absence</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <p className="text-sm font-medium text-brand-body">What would you like to do?</p>
            <div className="flex flex-wrap gap-3">
              <Button onClick={handleUpload} className="rounded-lg text-xs px-4 shadow-sm hover:shadow-md transition-shadow">
                <Upload className="w-4 h-4 mr-2" />
                Upload payroll changes
              </Button>
              <Button variant="outline" onClick={handleConfirmNoChanges} className="rounded-lg text-xs px-4 shadow-sm hover:shadow-md transition-shadow">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Confirm no changes
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              If there are no changes, simply confirm and we&apos;ll proceed with payroll processing.
            </p>
          </div>
        )}

        {/* 🔁 CURRENT PAYROLL CYCLE */}
        <div className="bg-card border border-border rounded-card shadow-md p-6 space-y-4">
          <h2 className="text-lg font-semibold text-brand-body">🔁 CURRENT PAYROLL CYCLE</h2>
          <p className="text-sm text-brand-body">
            <span className="text-muted-foreground">Payroll period:</span> <span className="font-semibold">{currentPeriodFormatted}</span>
          </p>

          <div className="space-y-2">
            <p className="text-sm font-medium text-brand-body">Statutory submissions (Malta):</p>
            {payrollData.submissions.map((submission, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30">
                <span className="text-sm text-brand-body">• {submission.name}</span>
                <SubmissionBadge status={submission.status} />
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            You don&apos;t need to prepare or submit these — they are handled on your behalf.
          </p>

          {payrollData.status === "in_progress" && (
            <span className="text-xs text-primary animate-pulse">Processing payroll...</span>
          )}
        </div>

        {/* 👥 EMPLOYEES */}
        <div className="bg-card border border-border rounded-card shadow-md p-6 space-y-4">
          <button onClick={() => setIsEmployeesOpen(!isEmployeesOpen)} className="flex items-center justify-between w-full text-left">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold text-brand-body">👥 EMPLOYEES</h2>
            </div>
            {isEmployeesOpen ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
          </button>

          {isEmployeesOpen && (
            <>
              <p className="text-sm text-muted-foreground">A list of all employees currently registered for payroll.</p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 px-3 text-muted-foreground font-medium">Employee</th>
                      <th className="text-left py-2 px-3 text-muted-foreground font-medium">Status</th>
                      <th className="text-left py-2 px-3 text-muted-foreground font-medium">Start Date</th>
                      <th className="text-left py-2 px-3 text-muted-foreground font-medium">End Date</th>
                      <th className="text-left py-2 px-3 text-muted-foreground font-medium">Documents</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payrollData.employees.map((emp) => (
                      <tr key={emp.id} className="border-b border-border/50 hover:bg-muted/30">
                        <td className="py-3 px-3 font-medium text-brand-body">{emp.name}</td>
                        <td className="py-3 px-3"><EmployeeStatusBadge status={emp.status} /></td>
                        <td className="py-3 px-3 text-muted-foreground">{formatDate(emp.startDate)}</td>
                        <td className="py-3 px-3 text-muted-foreground">{emp.endDate ? formatDate(emp.endDate) : "—"}</td>
                        <td className="py-3 px-3">
                          <Button variant="ghost" size="sm" className="text-xs">
                            <Eye className="w-3 h-3 mr-1" />
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-muted-foreground">
                Click View to see employee details and download payslips or FS3 statements (when available).
              </p>
            </>
          )}
        </div>

        {/* 📄 STATUTORY PAYROLL FORMS (MALTA) */}
        <div className="bg-card border border-border rounded-card shadow-md p-6 space-y-4">
          <h2 className="text-lg font-semibold text-brand-body">📄 STATUTORY PAYROLL FORMS (MALTA)</h2>
          <p className="text-sm text-muted-foreground">
            These are payroll filings required by Maltese authorities. They are prepared and submitted by our team.
          </p>
          <div className="space-y-3">
            {payrollData.statutoryForms.map((form) => (
              <div key={form.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30">
                <div>
                  <span className="text-sm font-medium text-brand-body">• {form.name}</span>
                  <span className="text-sm text-muted-foreground"> — {form.description}</span>
                </div>
                <SubmissionBadge status={form.status} />
              </div>
            ))}
          </div>
        </div>

        {/* 📥 FS3 — EMPLOYEE STATEMENTS */}
        <div className="bg-card border border-border rounded-card shadow-md p-6 space-y-4">
          <h2 className="text-lg font-semibold text-brand-body">📥 FS3 — EMPLOYEE STATEMENTS</h2>
          <p className="text-sm text-muted-foreground">
            FS3 statements are generated annually for all employees.
          </p>
          <p className="text-sm text-muted-foreground">
            When the FS3 period is open, you will see the option below:
          </p>
          <Button onClick={handleGenerateFS3} disabled={isGeneratingFS3} className="rounded-lg text-xs px-4 shadow-sm hover:shadow-md transition-shadow">
            {isGeneratingFS3 ? (
              <>
                <Clock className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4 mr-2" />
                Generate FS3 statements for all employees
              </>
            )}
          </Button>
          <div className="p-3 rounded-lg bg-muted/30 border border-border">
            <p className="text-xs text-muted-foreground">
              <strong className="text-brand-body">After generation:</strong>
            </p>
            <ul className="text-xs text-muted-foreground mt-1 space-y-1">
              <li>• Individual FS3s are created per employee</li>
              <li>• Files are available for download (individually or in bulk)</li>
            </ul>
          </div>
        </div>

        {/* 📂 PAYROLL FORMS ARCHIVE */}
        <div className="bg-card border border-border rounded-card shadow-md p-6 space-y-4">
          <button onClick={() => setIsArchiveOpen(!isArchiveOpen)} className="flex items-center justify-between w-full text-left">
            <div className="flex items-center gap-2">
              <FileArchive className="w-5 h-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold text-brand-body">📂 PAYROLL FORMS ARCHIVE</h2>
            </div>
            {isArchiveOpen ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
          </button>

          {isArchiveOpen && (
            <>
              <p className="text-sm text-muted-foreground">Find and download payroll forms from previous periods.</p>

              {/* Filters */}
              <div className="flex flex-wrap gap-3 items-center">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Filter by:</span>
                </div>
                
                {/* Type Filter */}
                <select
                  value={archiveFilter.type}
                  onChange={(e) => setArchiveFilter((prev) => ({ ...prev, type: e.target.value }))}
                  className="text-xs border border-border rounded-lg px-3 py-1.5 bg-background"
                >
                  <option value="all">All form types</option>
                  <option value="fs3">FS3</option>
                  <option value="fs5">FS5</option>
                  <option value="fs7">FS7</option>
                </select>

                {/* Year Filter */}
                <select
                  value={archiveFilter.year}
                  onChange={(e) => setArchiveFilter((prev) => ({ ...prev, year: e.target.value }))}
                  className="text-xs border border-border rounded-lg px-3 py-1.5 bg-background"
                >
                  <option value="all">All years</option>
                  <option value="2025">2025</option>
                  <option value="2024">2024</option>
                </select>

                {/* Employee Filter (Added based on document) */}
                <select
                  value={archiveFilter.employee}
                  onChange={(e) => setArchiveFilter((prev) => ({ ...prev, employee: e.target.value }))}
                  className="text-xs border border-border rounded-lg px-3 py-1.5 bg-background"
                >
                  <option value="all">All employees</option>
                  {uniqueEmployees.map((emp) => (
                    <option key={emp} value={emp}>{emp}</option>
                  ))}
                </select>

                <Button variant="outline" size="sm" className="text-xs">
                  <Download className="w-3 h-3 mr-1" />
                  Download all as ZIP
                </Button>
              </div>

              <div className="space-y-2">
                {filteredArchive.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30">
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-brand-body">{doc.name}</span>
                      {doc.employee && <span className="text-xs text-muted-foreground">({doc.employee})</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" className="text-xs">
                        <Eye className="w-3 h-3 mr-1" />
                        View
                      </Button>
                      <Button variant="ghost" size="sm" className="text-xs">
                        <Download className="w-3 h-3 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
                {filteredArchive.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No documents match your filter criteria.</p>
                )}
              </div>
            </>
          )}
        </div>

        {/* 📁 DELIVERABLES & DOCUMENTS */}
        <div className="bg-card border border-border rounded-card shadow-md p-6 space-y-4">
          <h2 className="text-lg font-semibold text-brand-body">📁 DELIVERABLES & DOCUMENTS</h2>
          <p className="text-sm text-muted-foreground">All payroll-related documents are stored here.</p>
          <div className="space-y-2">
            {payrollData.documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30">
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-brand-body">{doc.name}</span>
                  <SubmissionBadge status={doc.status as SubmissionStatus} />
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="text-xs">
                    <Eye className="w-3 h-3 mr-1" />
                    View
                  </Button>
                  <Button variant="ghost" size="sm" className="text-xs">
                    <Download className="w-3 h-3 mr-1" />
                    Download
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">Each document shows its status and can be viewed or downloaded at any time.</p>
        </div>

        {/* 📅 KEY DEADLINES */}
        <div className="bg-card border border-border rounded-card shadow-md p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-brand-body">📅 KEY DEADLINES</h2>
            <Link href="/dashboard/compliance?service=Payroll">
              <Button variant="outline" size="sm" className="text-xs">
                View in Compliance Calendar
                <ExternalLink className="w-3 h-3 ml-2" />
              </Button>
            </Link>
          </div>
          <p className="text-sm text-muted-foreground">Upcoming payroll deadlines for Malta:</p>
          <div className="space-y-2">
            {payrollData.deadlines.map((deadline, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30">
                <span className="text-sm text-brand-body">• {deadline.name}</span>
                <span className="text-sm font-semibold text-destructive">{formatDate(deadline.date)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 💬 PAYROLL MESSAGES */}
        <div className="bg-card border border-border rounded-card shadow-md p-6 space-y-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold text-brand-body">💬 PAYROLL MESSAGES</h2>
          </div>
          <p className="text-sm text-muted-foreground">All payroll-related communication appears here.</p>
          <div className="p-3 rounded-lg bg-muted/30 border border-border">
            <p className="text-xs text-muted-foreground mb-2"><strong className="text-brand-body">You&apos;ll be notified when:</strong></p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Payroll is processed</li>
              <li>• Payslips are available</li>
              <li>• Statutory submissions are completed</li>
              <li>• FS3 statements are generated</li>
            </ul>
          </div>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {payrollData.messages.map((message) => (
              <div key={message.id} className={`p-3 rounded-lg border ${message.type === "system" ? "bg-muted/30 border-muted" : "bg-primary/5 border-primary/20"}`}>
                <p className="text-sm text-brand-body">{message.text}</p>
                <p className="text-xs text-muted-foreground mt-1">{formatDate(message.timestamp)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 💳 FEES */}
        <div className="bg-card border border-border rounded-card shadow-md p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold text-brand-body">💳 FEES</h2>
          </div>
          <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/30">
            <div>
              <p className="text-sm font-medium text-brand-body">Payroll service — Monthly</p>
              <p className="text-xs text-muted-foreground">Status: Included in your plan</p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium bg-success/10 text-success border-success/30 shadow-sm">
              <CheckCircle2 className="w-3 h-3" />
              Included
            </span>
          </div>
        </div>

        {/* PAYROLL HISTORY */}
        <div className="bg-card border border-border rounded-card shadow-md p-6 space-y-4">
          <button onClick={() => setIsHistoryOpen(!isHistoryOpen)} className="flex items-center justify-between w-full text-left">
            <h2 className="text-lg font-semibold text-brand-body">Previous payroll periods</h2>
            {isHistoryOpen ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
          </button>
          {isHistoryOpen && (
            <div className="space-y-2 pt-2">
              {/* Generating history based on current period going back */}
              {Array.from({ length: 6 }).map((_, i) => {
                const date = new Date(2025, 6 - i, 1); // June, May, April...
                const periodStr = date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
                return (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors">
                    <span className="text-sm font-medium text-brand-body">{periodStr}</span>
                    <StatusBadge status="completed" />
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>
    </>
  );
}