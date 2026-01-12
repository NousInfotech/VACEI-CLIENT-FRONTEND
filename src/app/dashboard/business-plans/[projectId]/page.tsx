"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import DashboardCard from "@/components/DashboardCard";
import { 
  ArrowLeft, 
  FileText, 
  Upload, 
  CheckCircle2, 
  Circle, 
  Download, 
  Eye, 
  MessageSquare, 
  Receipt,
  AlertCircle
} from "lucide-react";

// Same interfaces as main page
type BusinessPlanPurpose = "bank" | "grant" | "investor" | "internal" | "other";
type BusinessPlanStatus = "draft" | "in_progress" | "waiting_on_you" | "completed";
type DocumentStatus = "draft" | "under_review" | "final";

interface BusinessPlanProject {
  project_id: string;
  company_id: string;
  project_type: "business_plan";
  purpose: BusinessPlanPurpose;
  status: BusinessPlanStatus;
  forecast_years: number;
  industry?: string;
  target_market?: string;
  expected_revenue_range?: string;
  prepared_by: string;
  expected_delivery?: string;
  documents: BusinessPlanDocument[];
  milestones: BusinessPlanMilestone[];
  invoices: BusinessPlanInvoice[];
  messages: BusinessPlanMessage[];
}

interface BusinessPlanDocument {
  id: string;
  name: string;
  type: string;
  status: DocumentStatus;
  url?: string;
  uploaded_at?: string;
}

interface BusinessPlanMilestone {
  id: string;
  name: string;
  status: "completed" | "active" | "pending";
  completed_at?: string;
}

interface BusinessPlanInvoice {
  id: string;
  amount: string;
  status: "draft" | "issued" | "paid";
  issued_at?: string;
  url?: string;
}

interface BusinessPlanMessage {
  id: string;
  text: string;
  sender: string;
  timestamp: string;
  is_system: boolean;
}

export default function BusinessPlanDetailPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const [project, setProject] = useState<BusinessPlanProject | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProject();
  }, [projectId]);

  const loadProject = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // const project = await fetchBusinessPlanProject(projectId);
      
      // Mock data - same as main page
      const mockProject: BusinessPlanProject = {
        project_id: projectId,
        company_id: "company-001",
        project_type: "business_plan",
        purpose: "bank",
        status: "waiting_on_you",
        forecast_years: 3,
        industry: "Technology",
        target_market: "B2B SaaS",
        expected_revenue_range: "€500K - €1M",
        prepared_by: "VACEI Advisory",
        expected_delivery: "3–4 weeks",
        documents: [
          {
            id: "doc-1",
            name: "Information questionnaire",
            type: "questionnaire",
            status: "final",
            uploaded_at: "2025-01-15",
          },
          {
            id: "doc-2",
            name: "Financial projections (Excel)",
            type: "excel",
            status: "under_review",
            uploaded_at: "2025-01-20",
          },
          {
            id: "doc-3",
            name: "Draft business plan (PDF)",
            type: "pdf",
            status: "draft",
            uploaded_at: "2025-01-22",
          },
        ],
        milestones: [
          { id: "m1", name: "Scope defined", status: "completed", completed_at: "2025-01-10" },
          { id: "m2", name: "Financial data collected", status: "completed", completed_at: "2025-01-15" },
          { id: "m3", name: "Draft preparation", status: "active" },
          { id: "m4", name: "Review & revisions", status: "pending" },
          { id: "m5", name: "Final delivery", status: "pending" },
        ],
        invoices: [
          {
            id: "inv-1",
            amount: "€2,500.00",
            status: "issued",
            issued_at: "2025-01-15",
            url: "/dashboard/invoices/1",
          },
        ],
        messages: [
          {
            id: "msg-1",
            text: "Draft uploaded",
            sender: "System",
            timestamp: "2025-01-22T10:00:00Z",
            is_system: true,
          },
          {
            id: "msg-2",
            text: "Please review the draft and provide feedback by Friday.",
            sender: "Sarah (Advisory)",
            timestamp: "2025-01-22T10:05:00Z",
            is_system: false,
          },
        ],
      };
      
      setProject(mockProject);
    } catch (error) {
      console.error("Failed to load business plan project", error);
    } finally {
      setLoading(false);
    }
  };

  const getPurposeLabel = (purpose: BusinessPlanPurpose): string => {
    const labels = {
      bank: "Bank financing",
      grant: "Grant application",
      investor: "Investor presentation",
      internal: "Internal planning",
      other: "Other",
    };
    return labels[purpose];
  };

  const getStatusLabel = (status: BusinessPlanStatus): string => {
    const labels = {
      draft: "Draft",
      in_progress: "In progress",
      waiting_on_you: "Waiting on you",
      completed: "Completed",
    };
    return labels[status];
  };

  const getDocumentStatusLabel = (status: DocumentStatus): string => {
    const labels = {
      draft: "Draft",
      under_review: "Under review",
      final: "Final",
    };
    return labels[status];
  };

  const requiredActions = [
    { id: "1", text: "Upload latest management accounts", action: "Upload", href: "/dashboard/document-organizer/document-upload" },
    { id: "2", text: "Confirm business assumptions", action: "Approve", href: "/dashboard/business-plans/approve" },
  ];

  if (loading) {
    return (
      <section className="mx-auto max-w-[1400px] w-full pt-5">
        <DashboardCard className="p-12 text-center">
          <p className="text-muted-foreground">Loading business plan project...</p>
        </DashboardCard>
      </section>
    );
  }

  if (!project) {
    return (
      <section className="mx-auto max-w-[1400px] w-full pt-5">
        <DashboardCard className="p-12 text-center">
          <p className="text-muted-foreground">Business plan project not found.</p>
          <Link href="/dashboard/business-plans" className="mt-4 inline-block">
            <Button variant="outline">Back to Business Plans</Button>
          </Link>
        </DashboardCard>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-[1400px] w-full pt-5 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/business-plans">
          <Button variant="ghost" size="sm" className="min-w-[100px]">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-brand-body">
            BUSINESS PLAN — {getPurposeLabel(project.purpose).toUpperCase()}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Project ID: {project.project_id}
          </p>
        </div>
        <Link href="/dashboard/document-organizer/document-upload">
          <Button variant="outline" className="min-w-[160px]">
            <Upload className="w-4 h-4 mr-2" />
            Upload information
          </Button>
        </Link>
      </div>

      {/* Project Status */}
      <DashboardCard className="p-6">
        <h3 className="text-lg font-semibold text-brand-body mb-5">STATUS</h3>
        <div className="space-y-5">
          {project.milestones.map((milestone) => (
            <div key={milestone.id} className="flex items-start gap-4 pb-4 border-b border-border last:border-0 last:pb-0">
              <div className="shrink-0 mt-0.5">
                {milestone.status === "completed" ? (
                  <div className="w-7 h-7 rounded-full bg-success/10 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-success" />
                  </div>
                ) : milestone.status === "active" ? (
                  <div className="w-7 h-7 rounded-full border-2 border-primary bg-primary/5 flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-primary"></div>
                  </div>
                ) : (
                  <div className="w-7 h-7 rounded-full border-2 border-border flex items-center justify-center">
                    <Circle className="w-4 h-4 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <p className={`font-semibold text-base ${
                  milestone.status === "completed" 
                    ? "text-success" 
                    : milestone.status === "active"
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}>
                  {milestone.name}
                </p>
                {milestone.completed_at && (
                  <p className="text-xs text-muted-foreground mt-1.5">
                    Completed {new Date(milestone.completed_at).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </DashboardCard>

      {/* Required Actions */}
      {project.status === "waiting_on_you" && requiredActions.length > 0 && (
        <DashboardCard className="p-6 border-l-4 border-l-warning bg-gradient-to-r from-warning/5 to-transparent">
          <div className="flex items-center gap-2.5 mb-5">
            <AlertCircle className="w-5 h-5 text-warning" />
            <h3 className="text-lg font-semibold text-brand-body">ACTION REQUIRED</h3>
          </div>
          <div className="space-y-3">
            {requiredActions.map((action) => (
              <div key={action.id} className="flex items-center justify-between p-4 bg-warning/5 rounded-lg border border-warning/20">
                <p className="font-medium text-brand-body">{action.text}</p>
                <Link href={action.href}>
                  <Button size="sm" variant="default" className="min-w-[100px]">
                    {action.action}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </DashboardCard>
      )}

      {/* Key Details */}
      <DashboardCard className="p-6">
        <h3 className="text-lg font-semibold text-brand-body mb-5">BUSINESS PLAN DETAILS</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5">Purpose</p>
            <p className="font-semibold text-brand-body">{getPurposeLabel(project.purpose)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5">Industry</p>
            <p className="font-semibold text-brand-body">{project.industry || "—"}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5">Forecast period</p>
            <p className="font-semibold text-brand-body">{project.forecast_years} years</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5">Prepared by</p>
            <p className="font-semibold text-brand-body">{project.prepared_by}</p>
          </div>
        </div>
      </DashboardCard>

      {/* Documents */}
      <DashboardCard className="p-6">
        <h3 className="text-lg font-semibold text-brand-body mb-5">BUSINESS PLAN DOCUMENTS</h3>
        <div className="space-y-3">
          {project.documents.map((doc) => (
            <div key={doc.id} className="flex items-center justify-between p-4 border border-border rounded-lg bg-card hover:bg-muted/20 transition-colors">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-brand-body truncate">{doc.name}</p>
                  <div className="flex items-center gap-2.5 mt-1.5">
                    <span className={`text-xs px-2.5 py-1 rounded-md font-medium ${
                      doc.status === "final"
                        ? "bg-success/10 text-success border border-success/20"
                        : doc.status === "under_review"
                        ? "bg-warning/10 text-warning border border-warning/20"
                        : "bg-muted text-muted-foreground border border-border"
                    }`}>
                      {getDocumentStatusLabel(doc.status)}
                    </span>
                    {doc.uploaded_at && (
                      <span className="text-xs text-muted-foreground">
                        {new Date(doc.uploaded_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {doc.url ? (
                  <>
                    <Link href={doc.url} target="_blank">
                      <Button size="sm" variant="outline" className="min-w-[80px]">
                        <Eye className="w-4 h-4 mr-1.5" />
                        View
                      </Button>
                    </Link>
                    <Link href={doc.url} download>
                      <Button size="sm" variant="outline" className="min-w-[100px]">
                        <Download className="w-4 h-4 mr-1.5" />
                        Download
                      </Button>
                    </Link>
                  </>
                ) : (
                  <span className="text-xs text-muted-foreground px-3 py-1.5">Coming soon</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </DashboardCard>

      {/* Communication */}
      <DashboardCard className="p-6">
        <h3 className="text-lg font-semibold text-brand-body mb-5">BUSINESS PLAN MESSAGES</h3>
        <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
          {project.messages.map((msg) => (
            <div key={msg.id} className={`p-4 rounded-lg ${
              msg.is_system 
                ? "bg-muted/30 border border-border" 
                : "bg-card border border-border"
            }`}>
              <div className="flex items-start justify-between mb-2">
                <p className={`font-semibold text-sm ${
                  msg.is_system ? "text-muted-foreground" : "text-brand-body"
                }`}>
                  {msg.sender}
                </p>
                <span className="text-xs text-muted-foreground">
                  {new Date(msg.timestamp).toLocaleString()}
                </span>
              </div>
              <p className={`text-sm leading-relaxed ${
                msg.is_system ? "text-muted-foreground italic" : "text-brand-body"
              }`}>
                {msg.text}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-5 pt-4 border-t border-border">
          <Link href="/dashboard/messages">
            <Button variant="outline" className="w-full">
              <MessageSquare className="w-4 h-4 mr-2" />
              Open full conversation
            </Button>
          </Link>
        </div>
      </DashboardCard>

      {/* Fees & Billing */}
      <DashboardCard className="p-6">
        <h3 className="text-lg font-semibold text-brand-body mb-5">FEES</h3>
        {project.invoices.map((invoice) => (
          <div key={invoice.id} className="flex items-center justify-between p-5 border border-border rounded-lg bg-card">
            <div>
              <p className="font-semibold text-brand-body mb-3">Business Plan Preparation</p>
              <div className="flex items-center gap-3">
                <span className={`text-xs px-2.5 py-1 rounded-md font-medium ${
                  invoice.status === "paid"
                    ? "bg-success/10 text-success border border-success/20"
                    : invoice.status === "issued"
                    ? "bg-warning/10 text-warning border border-warning/20"
                    : "bg-muted text-muted-foreground border border-border"
                }`}>
                  {invoice.status === "paid" ? "Paid" : invoice.status === "issued" ? "Invoice issued" : "Draft"}
                </span>
                <span className="text-base font-bold text-brand-body">{invoice.amount}</span>
                {invoice.issued_at && (
                  <span className="text-xs text-muted-foreground">
                    Issued {new Date(invoice.issued_at).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
            {invoice.url && (
              <Link href={invoice.url}>
                <Button size="sm" variant="outline" className="min-w-[130px]">
                  <Receipt className="w-4 h-4 mr-2" />
                  View invoice
                </Button>
              </Link>
            )}
          </div>
        ))}
      </DashboardCard>
    </section>
  );
}

