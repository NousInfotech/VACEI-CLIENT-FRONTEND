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
  CreditCard,
  Info,
  UserPlus,
  UserMinus,
  TrendingUp,
  Calendar,
} from "lucide-react";

// ------------------------------------------------------------------
// PART 7 — DATA MODEL (MINIMUM) & EXTENSIONS
// ------------------------------------------------------------------
// Strict adherence to JSON keys, extended for Billing (Part 6) and Integration (Part 3)

type PayrollStatus = "waiting_on_client" | "in_progress" | "completed";
type DocumentStatus = "uploaded" | "processed" | "submitted";
type SubmissionStatus = "pending" | "submitted";
type BillingStatus = "paid" | "unpaid" | "overdue";

interface PayrollData {
  service: "payroll"; // Literal string per requirements
  company_id: string;
  current_period: string; // Format "YYYY-MM"
  status: PayrollStatus;
  submission_due_date: string; // ISO Date string
  documents: Array<{
    id: string;
    name: string;
    type: "inputs" | "reports" | "payslips" | "confirmations";
    status: DocumentStatus;
    url?: string;
  }>;
  history: Array<{
    period: string;
    status: PayrollStatus;
  }>;
  // Part 3: Stores obligations for Compliance Calendar
  submissions: Array<{
    name: string;
    status: SubmissionStatus;
    due_date?: string; 
  }>;
  messages: Array<{
    id: string;
    text: string;
    timestamp: string;
    type: "system" | "user";
  }>;
  // Part 6: Billing Logic Implementation
  billing: {
    status: BillingStatus;
    model: "monthly" | "per_employee";
    amount: number;
  };
  // Part 6: Invoice details
  invoices?: Array<{
    id: string;
    invoice_number: string;
    amount: number;
    status: BillingStatus;
    due_date: string;
    issue_date: string;
    period: string;
  }>;
}

// ------------------------------------------------------------------
// MOCK DATA & CONFIGURATION
// ------------------------------------------------------------------

// Initial state reflecting PART 4 - User Flow Step 1 & 2
const initialPayrollData: PayrollData = {
  service: "payroll",
  company_id: "company-123",
  current_period: "2025-07",
  status: "waiting_on_client", // Step 2: Client sees Upload
  submission_due_date: "2025-08-15", // Part 3: 15th of following month
  documents: [
    { id: "1", name: "Payroll inputs", type: "inputs", status: "uploaded" },
    { id: "2", name: "Payroll reports", type: "reports", status: "uploaded" },
    { id: "3", name: "Payslips", type: "payslips", status: "uploaded" },
    {
      id: "4",
      name: "Submission confirmations",
      type: "confirmations",
      status: "uploaded",
    },
  ],
  history: [
    { period: "2025-06", status: "completed" },
    { period: "2025-05", status: "completed" },
    { period: "2025-04", status: "completed" },
    { period: "2025-03", status: "completed" },
    { period: "2025-02", status: "completed" },
    { period: "2025-01", status: "completed" },
    { period: "2024-12", status: "completed" },
    { period: "2024-11", status: "completed" },
  ],
  // Part 3: These feed the Compliance Calendar
  submissions: [
    { name: "Payroll Submission (FS5)", status: "pending", due_date: "2025-08-15" },
    { name: "Social Security Contributions", status: "pending", due_date: "2025-08-10" },
  ],
  messages: [
    {
      id: "1",
      text: "New payroll cycle opened for July 2025",
      timestamp: new Date("2025-07-01").toISOString(),
      type: "system",
    },
    {
      id: "2",
      text: "Payroll changes received",
      timestamp: new Date("2025-07-05").toISOString(),
      type: "system",
    },
    {
      id: "3",
      text: "Payroll processing in progress",
      timestamp: new Date("2025-07-10").toISOString(),
      type: "system",
    },
    {
      id: "4",
      text: "Payroll submitted",
      timestamp: new Date("2025-07-12").toISOString(),
      type: "system",
    },
    {
      id: "5",
      text: "Payslips available",
      timestamp: new Date("2025-07-12").toISOString(),
      type: "system",
    },
    {
      id: "6",
      text: "All statutory submissions completed for June 2025",
      timestamp: new Date("2025-06-18").toISOString(),
      type: "system",
    },
    {
      id: "7",
      text: "June 2025 payroll cycle completed",
      timestamp: new Date("2025-06-15").toISOString(),
      type: "system",
    },
  ],
  // Part 6: Billing is automatic, does not block access
  billing: {
    status: "unpaid", 
    model: "monthly",
    amount: 150.00,
  },
  // Part 6: Mock invoice data
  invoices: [
    {
      id: "inv-payroll-2025-07",
      invoice_number: "INV-2025-07-001",
      amount: 150.00,
      status: "unpaid",
      due_date: "2025-08-05",
      issue_date: "2025-07-31",
      period: "2025-07",
    },
  ],
};

// ------------------------------------------------------------------
// UI COMPONENTS (Badges & Helpers)
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
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium ${config.className} shadow-sm`}
    >
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
}

function SubmissionBadge({ status }: { status: SubmissionStatus }) {
  if (status === "submitted") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium bg-success/10 text-success border-success/30 shadow-sm">
        <CheckCircle2 className="w-3 h-3" />
        Submitted
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium bg-muted text-muted-foreground border-border shadow-sm">
      Pending
    </span>
  );
}

function DocumentStatusBadge({ status }: { status: DocumentStatus }) {
  const statusConfig = {
    uploaded: {
      label: "Uploaded",
      className: "bg-info/10 text-info border-info/30",
    },
    processed: {
      label: "Processed",
      className: "bg-primary/10 text-primary border-primary/30",
    },
    submitted: {
      label: "Submitted",
      className: "bg-success/10 text-success border-success/30",
    },
  };

  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center rounded-lg border px-2 py-0.5 text-xs font-medium ${config.className} shadow-sm`}
    >
      {config.label}
    </span>
  );
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatPeriod(period: string): string {
  const [year, month] = period.split("-");
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

// ------------------------------------------------------------------
// MAIN COMPONENT
// ------------------------------------------------------------------
import PageHeader from "@/components/shared/PageHeader";

export default function PayrollWorkspacePage() {
  const [payrollData, setPayrollData] = useState<PayrollData>(initialPayrollData);
  const [isHistoryOpen, setIsHistoryOpen] = useState(true);
  const [isSimulating, setIsSimulating] = useState(false);
  const [showUploadHelp, setShowUploadHelp] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const billingSectionRef = useRef<HTMLDivElement>(null);

  const needsAction = payrollData.status === "waiting_on_client";
  const currentPeriodFormatted = formatPeriod(payrollData.current_period);
  const submissionDueFormatted = formatDate(payrollData.submission_due_date);

  // Scroll to billing section
  const scrollToBilling = () => {
    billingSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // PART 4: USER FLOW SIMULATION (Backend Logic)
  // Simulates steps 4, 5, and 6 automatically after upload
  useEffect(() => {
    if (payrollData.status === "in_progress" && !isSimulating) {
      setIsSimulating(true);
      
      // Simulate 3-second processing time
      const timer = setTimeout(() => {
        setPayrollData((prev) => {
          const submittedMessage = {
            id: Date.now().toString(),
            text: "Payroll submitted",
            timestamp: new Date().toISOString(),
            type: "system" as const,
          };
          
          const payslipsMessage = {
            id: (Date.now() + 1).toString(),
            text: "Payslips available",
            timestamp: new Date().toISOString(),
            type: "system" as const,
          };

          // Step 6: Status -> Completed, Submissions Submitted
          return {
            ...prev,
            status: "completed",
            submissions: prev.submissions.map(s => ({ ...s, status: "submitted" as const })),
            documents: prev.documents.map(d => {
              if (d.name === "Payslips") return { ...d, status: "processed" as const };
              if (d.name === "Payroll reports") return { ...d, status: "processed" as const };
              if (d.type === "confirmations") return { ...d, status: "submitted" as const };
              return d;
            }),
            messages: [...prev.messages, submittedMessage, payslipsMessage],
          };
        });
        setIsSimulating(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [payrollData.status, isSimulating]);

  // Handler: Trigger file input dialog
  const handleUpload = () => {
    // Part 5: "Clients upload one thing only"
    // Part 4: Step 3: Client uploads changes
    fileInputRef.current?.click();
  };

  // Handler: Process selected file (Part 5: What Client Uploads)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Part 5: "Clients upload one thing only" - single file upload
      // Part 4: Step 3: Client uploads changes
      const newMessage = {
        id: Date.now().toString(),
        text: "Payroll changes received",
        timestamp: new Date().toISOString(),
        type: "system" as const,
      };

      setPayrollData((prev) => ({
        ...prev,
        // Step 4: Payroll marked In progress
        status: "in_progress",
        messages: [...prev.messages, newMessage],
      }));

      // Reset file input to allow re-uploading the same file
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <>
      {/* Hidden file input for payroll upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls,.csv,.pdf"
        onChange={handleFileChange}
        className="hidden"
      />
      
      <section className="mx-auto max-w-[1200px] w-full pt-5 space-y-6 pb-10">
        
        {/* 1️⃣ PAGE HEADER */}
        <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between bg-primary-color-new p-7 rounded-3xl text-light shadow-xl shadow-primary/10">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-light">
              Payroll
            </h1>
            <p className="text-sm text-light">
              Monthly payroll processing and statutory submissions handled for
              you.
            </p>
          </div>
          
          {/* Part 6: Billing Logic - Implemented as Header Indicator */}
          {/* Policy: Payroll does not block access if invoice unpaid */}
          <div className="flex flex-col items-end gap-2">
            <button
              onClick={scrollToBilling}
              className="flex items-center gap-2 text-xs px-3 py-1 rounded-full border bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
            >
              <Receipt className="w-3 h-3 text-light" />
              <span className="text-light">Invoice: </span>
              <span className={`font-medium ${payrollData.billing.status === 'unpaid' ? 'text-warning' : payrollData.billing.status === 'overdue' ? 'text-destructive' : 'text-success'}`}>
                {payrollData.billing.status.charAt(0).toUpperCase() + payrollData.billing.status.slice(1)}
              </span>
            </button>
            
            {/* Right-side CTA (conditional) */}
            {needsAction && (
              <Button 
                onClick={handleUpload}
                className="rounded-lg text-xs px-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload payroll information
              </Button>
            )}
          </div>
        </div>

        {/* Intro */}
        <p className="text-sm text-muted-foreground">
          This page shows the status of your payroll, upcoming deadlines, and
          any information we may need from you. Upload what&apos;s requested and
          we&apos;ll take care of the rest.
        </p>

        {/* 2️⃣ PAYROLL STATUS SUMMARY (TOP) */}
        <div className="bg-card border border-border rounded-card shadow-md p-4">
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Current payroll: </span>
              <span className="font-semibold text-brand-body">
                {currentPeriodFormatted}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Status: </span>
              <StatusBadge status={payrollData.status} />
            </div>
            <div>
              <span className="text-muted-foreground">Next deadline: </span>
              <span className="font-semibold text-destructive">
                {submissionDueFormatted}
              </span>
            </div>
          </div>
        </div>

        {/* 3️⃣ ACTION REQUIRED (ONLY IF NEEDED) */}
        {needsAction && (
          <div className="bg-card border border-border rounded-card shadow-md p-6 space-y-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-info" />
              <h2 className="text-lg font-semibold text-brand-body">
                ACTION REQUIRED
              </h2>
            </div>
            
            <div className="space-y-3">
              <p className="text-sm text-brand-body">
                Upload payroll changes for {currentPeriodFormatted} if you have any updates to report.
              </p>
              
              {/* What to Upload - Help Section */}
              <div className="p-4 rounded-lg bg-info/5 border border-info/20">
                <button
                  onClick={() => setShowUploadHelp(!showUploadHelp)}
                  className="flex items-center justify-between w-full text-left"
                >
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-info" />
                    <span className="text-sm font-medium text-brand-body">
                      What are payroll changes?
                    </span>
                  </div>
                  {showUploadHelp ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>
                
                {showUploadHelp && (
                  <div className="mt-4 space-y-3 pt-4 border-t border-info/20">
                    <p className="text-xs text-muted-foreground mb-3">
                      Upload a file (Excel, CSV, or PDF) containing any of the following changes for this payroll period:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="flex items-start gap-2">
                        <UserPlus className="w-4 h-4 text-success mt-0.5 shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-brand-body">New employee</p>
                          <p className="text-xs text-muted-foreground">Someone joined your company</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <UserMinus className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-brand-body">Termination</p>
                          <p className="text-xs text-muted-foreground">Someone left your company</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <TrendingUp className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-brand-body">Salary change</p>
                          <p className="text-xs text-muted-foreground">Pay raise or reduction</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Calendar className="w-4 h-4 text-warning mt-0.5 shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-brand-body">Leave / Unpaid leave</p>
                          <p className="text-xs text-muted-foreground">Time off or unpaid absence</p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 p-3 rounded bg-muted/50 border border-border">
                      <p className="text-xs text-muted-foreground">
                        <strong className="text-brand-body">No changes?</strong> You don&apos;t need to upload anything. 
                        We&apos;ll use the previous month&apos;s data.
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              <Button 
                onClick={handleUpload}
                className="w-full sm:w-auto rounded-lg text-xs px-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload payroll changes
              </Button>
            </div>
          </div>
        )}

        {/* 4️⃣ CURRENT PAYROLL CYCLE (MAIN SECTION) */}
        <div className="bg-card border border-border rounded-card shadow-md p-6 space-y-4">
          <h2 className="text-lg font-semibold text-brand-body">
            CURRENT PAYROLL CYCLE
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Month</p>
              <p className="text-sm font-semibold text-brand-body">
                {currentPeriodFormatted}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">
                Submission due
              </p>
              <p className="text-sm font-semibold text-destructive">
                {submissionDueFormatted}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Status</p>
              <StatusBadge status={payrollData.status} />
            </div>
          </div>
          <div className="pt-2">
            {/* CTA Logic: Waiting on you → Upload, In progress/Completed → View */}
            {payrollData.status === "waiting_on_client" ? (
              <Button 
                onClick={handleUpload}
                className="rounded-lg text-xs px-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload
              </Button>
            ) : (
              <Button
                variant="outline"
                className="rounded-lg text-xs px-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <Eye className="w-4 h-4 mr-2" />
                View
              </Button>
            )}
            {/* Visual indicator for User Flow Simulation */}
            {payrollData.status === "in_progress" && (
               <span className="ml-4 text-xs text-primary animate-pulse">Processing payroll...</span>
            )}
          </div>
        </div>

        {/* 5️⃣ STATUTORY SUBMISSIONS (READ-ONLY) */}
        <div className="bg-card border border-border rounded-card shadow-md p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-brand-body">
              STATUTORY SUBMISSIONS
            </h2>
            <Link href="/dashboard/compliance?service=Payroll">
              <Button variant="outline" size="sm" className="text-xs">
                View in Compliance Calendar
                <ExternalLink className="w-3 h-3 ml-2" />
              </Button>
            </Link>
          </div>
        }
      />

        {/* 7️⃣ PAYROLL HISTORY (COLLAPSED) */}
        <div className="bg-card border border-border rounded-card shadow-md p-6 space-y-4">
          <button
            onClick={() => setIsHistoryOpen(!isHistoryOpen)}
            className="flex items-center justify-between w-full text-left"
          >
            <h2 className="text-lg font-semibold text-brand-body">
              Previous payroll periods
            </h2>
            {isHistoryOpen ? (
              <ChevronUp className="w-5 h-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            )}
          </button>
          {isHistoryOpen && (
            <div className="space-y-2 pt-2">
              {payrollData.history.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
                >
                  <span className="text-sm font-medium text-brand-body">
                    {formatPeriod(item.period)}
                  </span>
                  <StatusBadge status={item.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 8️⃣ MESSAGES */}
        <div className="bg-card border border-border rounded-card shadow-md p-6 space-y-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold text-brand-body">
              PAYROLL MESSAGES
            </h2>
          </div>
          <div className="space-y-3">
            {payrollData.messages.map((message) => (
              <div
                key={message.id}
                className={`p-3 rounded-lg border ${
                  message.type === "system" 
                    ? "bg-muted/30 border-muted" 
                    : "bg-primary/5 border-primary/20"
                }`}
              >
                <p className="text-sm text-brand-body">{message.text}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDate(message.timestamp)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 9️⃣ BILLING & INVOICES (PART 6) */}
        <div ref={billingSectionRef} className="bg-card border border-border rounded-card shadow-md p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold text-brand-body">
                BILLING & INVOICES
              </h2>
            </div>
            <Link href="/dashboard/invoices">
              <Button variant="outline" size="sm" className="text-xs">
                View all invoices
                <ExternalLink className="w-3 h-3 ml-2" />
              </Button>
            </Link>
          </div>

          {/* Billing Model Information */}
          <div className="p-4 rounded-lg bg-muted/30 border border-border">
            <p className="text-sm font-medium text-brand-body mb-2">Billing Model</p>
            <p className="text-sm text-muted-foreground">
              {payrollData.billing.model === "monthly" 
                ? "Monthly payroll fee: Fixed monthly charge for payroll processing"
                : "Per-employee fee: Charged based on the number of employees processed"}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Billing is automatic and appears in your invoices. Unpaid invoices do not block access to payroll services.
            </p>
          </div>

          {/* Current Invoice */}
          {payrollData.invoices && payrollData.invoices.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-brand-body">Current Invoice</p>
              {payrollData.invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/30"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-semibold text-brand-body">
                        {invoice.invoice_number}
                      </span>
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${
                          invoice.status === "paid"
                            ? "bg-success/10 text-success border border-success/30"
                            : invoice.status === "overdue"
                            ? "bg-destructive/10 text-destructive border border-destructive/30"
                            : "bg-warning/10 text-warning border border-warning/30"
                        }`}
                      >
                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                      <span>
                        Amount: <span className="font-semibold text-brand-body">€{invoice.amount.toFixed(2)}</span>
                      </span>
                      <span>
                        Period: <span className="font-medium text-brand-body">{formatPeriod(invoice.period)}</span>
                      </span>
                      <span>
                        Due: <span className="font-medium text-destructive">{formatDate(invoice.due_date)}</span>
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Link href="/dashboard/invoices">
                      <Button variant="outline" size="sm" className="text-xs">
                        <Eye className="w-3 h-3 mr-1" />
                        View
                      </Button>
                    </Link>
                    {invoice.status !== "paid" && (
                      <Link href="/dashboard/invoices">
                        <Button size="sm" className="text-xs">
                          <CreditCard className="w-3 h-3 mr-1" />
                          Pay
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Information about invoices */}
          <div className="pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground">
              All payroll invoices are available in your{" "}
              <Link href="/dashboard/invoices" className="text-primary hover:underline font-medium">
                invoices page
              </Link>
              . You can view, download, and pay invoices there.
            </p>
          </div>
        </div>
      </section>
    );
  }
