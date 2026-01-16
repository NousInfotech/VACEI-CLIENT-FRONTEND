"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import DashboardCard from "@/components/DashboardCard";
import PageHeader from "@/components/shared/PageHeader";
import BackButton from "@/components/shared/BackButton";
import { 
  Share2,
  UserCheck,
  TrendingUp,
  Globe,
  Building2,
  CheckCircle2,
  Clock,
  FileText,
  ArrowRight,
  Plus,
  Eye,
  AlertCircle,
  MessageSquare
} from "lucide-react";

type MBRFilingStatus = "active" | "in_progress" | "completed" | "not_started";

interface MBRFiling {
  id: string;
  type: "share_transfer" | "director_change" | "share_capital" | "cross_border_merger" | "company_name_change";
  name: string;
  description: string;
  icon: any;
  status: MBRFilingStatus;
  submissionDate?: string;
  completionDate?: string;
  reference?: string;
}

const mbrFilingTypes: Omit<MBRFiling, "id" | "status" | "submissionDate" | "completionDate" | "reference">[] = [
  {
    type: "share_transfer",
    name: "Share Transfer",
    description: "Transfer shares between shareholders",
    icon: Share2
  },
  {
    type: "director_change",
    name: "Director Change",
    description: "Appoint or remove directors",
    icon: UserCheck
  },
  {
    type: "share_capital",
    name: "Share Capital Increase/Reduction",
    description: "Modify company share capital",
    icon: TrendingUp
  },
  {
    type: "cross_border_merger",
    name: "Cross-Border Merger",
    description: "Merge with another company",
    icon: Globe
  },
  {
    type: "company_name_change",
    name: "Company Name Change",
    description: "Change your company name",
    icon: Building2
  }
];

const getStatusBadge = (status: MBRFilingStatus) => {
  const badges = {
    active: {
      className: "bg-success/10 text-success border border-success/20",
      label: "Active",
      icon: CheckCircle2
    },
    in_progress: {
      className: "bg-primary/10 text-primary border border-primary/20",
      label: "In Progress",
      icon: Clock
    },
    completed: {
      className: "bg-muted text-muted-foreground border border-border",
      label: "Completed",
      icon: CheckCircle2
    },
    not_started: {
      className: "bg-muted/50 text-muted-foreground border border-border",
      label: "Not Started",
      icon: FileText
    }
  };
  return badges[status];
};

const getCTAButton = (filing: MBRFiling) => {
  const statusBadge = getStatusBadge(filing.status);

  switch (filing.status) {
    case "active":
    case "in_progress":
      return (
        <Button 
          variant="default" 
          size="sm" 
          className="min-w-[140px] whitespace-nowrap !bg-primary !text-white hover:!bg-primary/90 font-semibold shadow-md" 
          asChild
        >
          <Link href={`/dashboard/services/mbr-filing/${filing.type}`}>
            <Eye className="w-4 h-4 mr-1.5" />
            View progress
          </Link>
        </Button>
      );
    case "completed":
      return (
        <Button 
          variant="outline" 
          size="sm" 
          className="min-w-[140px] whitespace-nowrap border-2 hover:border-primary/50 font-semibold" 
          asChild
        >
          <Link href={`/dashboard/services/mbr-filing/${filing.type}`}>
            <Eye className="w-4 h-4 mr-1.5" />
            View details
          </Link>
        </Button>
      );
    case "not_started":
      return (
        <Button 
          variant="default" 
          size="sm" 
          className="min-w-[140px] whitespace-nowrap !bg-primary !text-white hover:!bg-primary/90 font-semibold shadow-md" 
          asChild
        >
          <Link href={`/dashboard/services/mbr-filing/${filing.type}/request`}>
            <Plus className="w-4 h-4 mr-1.5" />
            Start filing
          </Link>
        </Button>
      );
  }
};

export default function MBRFilingPage() {
  const [activeCompany, setActiveCompany] = useState<string>("ACME LTD");
  const [companyId, setCompanyId] = useState<string>("");
  const [mbrFilings, setMbrFilings] = useState<MBRFiling[]>([]);
  const [filterStatus, setFilterStatus] = useState<MBRFilingStatus | "all">("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedCompany = localStorage.getItem("vacei-active-company");
      const storedCompanies = localStorage.getItem("vacei-companies");
      if (storedCompany && storedCompanies) {
        try {
          const companies = JSON.parse(storedCompanies);
          const company = companies.find((c: { id: string; name: string }) => c.id === storedCompany);
          if (company) {
            setActiveCompany(company.name);
            setCompanyId(company.id);
            // Load MBR filings for this company
            const filings = getMBRFilings(company.id);
            setMbrFilings(filings);
          }
        } catch (error) {
          console.error("Error loading company data:", error);
        }
      }
      setLoading(false);
    }
  }, []);

  // Refresh filings when page becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && companyId) {
        const filings = getMBRFilings(companyId);
        setMbrFilings(filings);
      }
    };

    const handleFocus = () => {
      if (companyId) {
        const filings = getMBRFilings(companyId);
        setMbrFilings(filings);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [companyId]);

  // Calculate summary counts
  const activeFilings = mbrFilings.filter(f => f.status === "active" || f.status === "in_progress").length;
  const completedFilings = mbrFilings.filter(f => f.status === "completed").length;
  const notStartedFilings = mbrFilings.filter(f => f.status === "not_started").length;

  // Filter filings
  const filteredFilings = filterStatus === "all" 
    ? mbrFilings 
    : filterStatus === "active"
    ? mbrFilings.filter(f => f.status === "active" || f.status === "in_progress")
    : mbrFilings.filter(f => f.status === filterStatus);

  const activeFilingsList = mbrFilings.filter(f => f.status === "active" || f.status === "in_progress");
  const completedFilingsList = mbrFilings.filter(f => f.status === "completed");
  const notStartedFilingsList = mbrFilings.filter(f => f.status === "not_started");

  if (loading) {
    return (
      <section className="mx-auto max-w-[1400px] w-full pt-5">
        <DashboardCard className="p-12 text-center">
          <p className="text-muted-foreground">Loading MBR filings...</p>
        </DashboardCard>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-[1400px] w-full pt-5 space-y-6">
      <BackButton />
      
      {/* Page Header */}
      <PageHeader
        title="MBR Filing"
        subtitle="Malta Business Registry filings and corporate changes — all in one place."
        description="This page shows your active MBR filings, completed submissions, and available filing types for corporate changes."
      />

      {/* Summary Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div 
          onClick={() => setFilterStatus(filterStatus === "active" ? "all" : "active")}
          className={`p-5 rounded-lg border cursor-pointer transition-colors ${
            filterStatus === "active"
              ? "bg-primary/5 border-primary/30" 
              : "bg-card border-border hover:bg-muted/20"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Active filings</span>
            <Clock className="w-5 h-5 text-primary" />
          </div>
          <p className="text-3xl font-bold text-brand-body">{activeFilings}</p>
        </div>
        <div 
          onClick={() => setFilterStatus(filterStatus === "completed" ? "all" : "completed")}
          className={`p-5 rounded-lg border cursor-pointer transition-colors ${
            filterStatus === "completed" 
              ? "bg-success/5 border-success/30" 
              : "bg-card border-border hover:bg-muted/20"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Completed</span>
            <CheckCircle2 className="w-5 h-5 text-success" />
          </div>
          <p className="text-3xl font-bold text-brand-body">{completedFilings}</p>
        </div>
        <div 
          onClick={() => setFilterStatus(filterStatus === "not_started" ? "all" : "not_started")}
          className={`p-5 rounded-lg border cursor-pointer transition-colors ${
            filterStatus === "not_started" 
              ? "bg-muted/30 border-border" 
              : "bg-card border-border hover:bg-muted/20"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Available</span>
            <FileText className="w-5 h-5 text-muted-foreground" />
          </div>
          <p className="text-3xl font-bold text-brand-body">{notStartedFilings}</p>
        </div>
      </div>

      {/* Section A: Active Filings */}
      {filterStatus === "all" && activeFilingsList.length > 0 && (
        <DashboardCard className="p-6">
          <div className="mb-5">
            <h2 className="text-xl font-semibold text-brand-body mb-1">Active Filings</h2>
            <p className="text-sm text-muted-foreground">These MBR filings are currently in progress.</p>
          </div>
          <div className="space-y-3">
            {activeFilingsList.map((filing) => {
              const filingType = mbrFilingTypes.find(t => t.type === filing.type);
              const Icon = filingType?.icon || FileText;
              const statusBadge = getStatusBadge(filing.status);
              const StatusIcon = statusBadge.icon;
              
              return (
                <div key={filing.id} className="flex items-center justify-between p-4 border border-border rounded-lg bg-card hover:bg-muted/20 transition-colors cursor-pointer group">
                  <Link href={`/dashboard/services/mbr-filing/${filing.type}`} className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-brand-body mb-1 group-hover:text-primary transition-colors">{filing.name}</h3>
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md font-medium ${statusBadge.className}`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusBadge.label}
                        </span>
                        {filing.reference && (
                          <span className="text-xs text-muted-foreground">
                            Reference: <span className="font-medium text-brand-body">{filing.reference}</span>
                          </span>
                        )}
                        {filing.submissionDate && (
                          <span className="text-xs text-muted-foreground">
                            Submitted: <span className="font-medium text-brand-body">{new Date(filing.submissionDate).toLocaleDateString()}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                  <div className="shrink-0 ml-4" onClick={(e) => e.stopPropagation()}>
                    {getCTAButton(filing)}
                  </div>
                </div>
              );
            })}
          </div>
        </DashboardCard>
      )}

      {/* Section B: Completed Filings */}
      {filterStatus === "all" && completedFilingsList.length > 0 && (
        <DashboardCard className="p-6">
          <div className="mb-5">
            <h2 className="text-xl font-semibold text-brand-body mb-1">Completed Filings</h2>
            <p className="text-sm text-muted-foreground">These MBR filings have been successfully completed.</p>
          </div>
          <div className="space-y-3">
            {completedFilingsList.map((filing) => {
              const filingType = mbrFilingTypes.find(t => t.type === filing.type);
              const Icon = filingType?.icon || FileText;
              
              return (
                <div key={filing.id} className="flex items-center justify-between p-4 border border-border rounded-lg bg-muted/10 hover:bg-muted/20 transition-colors cursor-pointer group">
                  <Link href={`/dashboard/services/mbr-filing/${filing.type}`} className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center shrink-0 group-hover:bg-success/20 transition-colors">
                      <Icon className="w-5 h-5 text-success" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-brand-body mb-1 group-hover:text-primary transition-colors">{filing.name}</h3>
                      <div className="flex items-center gap-3 flex-wrap">
                        {filing.reference && (
                          <span className="text-xs text-muted-foreground">
                            Reference: <span className="font-medium text-brand-body">{filing.reference}</span>
                          </span>
                        )}
                        {filing.completionDate && (
                          <span className="text-xs text-muted-foreground">
                            Completed: <span className="font-medium text-brand-body">{new Date(filing.completionDate).toLocaleDateString()}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                  <div className="shrink-0 ml-4" onClick={(e) => e.stopPropagation()}>
                    {getCTAButton(filing)}
                  </div>
                </div>
              );
            })}
          </div>
        </DashboardCard>
      )}

      {/* Section C: Available Filing Types */}
      {filterStatus === "all" && notStartedFilingsList.length > 0 && (
        <DashboardCard className="p-6">
          <div className="mb-5">
            <h2 className="text-xl font-semibold text-brand-body mb-1">Available Filing Types</h2>
            <p className="text-sm text-muted-foreground">Start a new MBR filing for your company.</p>
          </div>
          <div className="space-y-3">
            {notStartedFilingsList.map((filing) => {
              const filingType = mbrFilingTypes.find(t => t.type === filing.type);
              const Icon = filingType?.icon || FileText;
              
              return (
                <div key={filing.id} className="flex items-center justify-between p-4 border border-border rounded-lg bg-card hover:bg-muted/20 transition-colors group">
                  <Link href={`/dashboard/services/mbr-filing/${filing.type}/request`} className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-brand-body mb-1 group-hover:text-primary transition-colors">{filing.name}</h3>
                      <p className="text-sm text-muted-foreground">{filing.description}</p>
                    </div>
                  </Link>
                  <div className="shrink-0 ml-4" onClick={(e) => e.stopPropagation()}>
                    {getCTAButton(filing)}
                  </div>
                </div>
              );
            })}
          </div>
        </DashboardCard>
      )}

      {/* Filtered Filings View */}
      {filterStatus !== "all" && filteredFilings.length > 0 && (
        <DashboardCard className="p-6">
          <div className="mb-5">
            <h2 className="text-xl font-semibold text-brand-body mb-1">
              {filterStatus === "active" && "Active Filings"}
              {filterStatus === "completed" && "Completed Filings"}
              {filterStatus === "not_started" && "Available Filing Types"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {filterStatus === "active" && "These MBR filings are currently in progress."}
              {filterStatus === "completed" && "These MBR filings have been successfully completed."}
              {filterStatus === "not_started" && "Start a new MBR filing for your company."}
            </p>
          </div>
          <div className="space-y-3">
            {filteredFilings.map((filing) => {
              const filingType = mbrFilingTypes.find(t => t.type === filing.type);
              const Icon = filingType?.icon || FileText;
              const statusBadge = getStatusBadge(filing.status);
              const StatusIcon = statusBadge.icon;
              
              return (
                <div key={filing.id} className="flex items-center justify-between p-4 border border-border rounded-lg bg-card hover:bg-muted/20 transition-colors cursor-pointer group">
                  <Link href={`/dashboard/services/mbr-filing/${filing.type}`} className="flex items-center gap-4 flex-1 min-w-0">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                      filing.status === "completed" ? "bg-success/10 group-hover:bg-success/20" :
                      filing.status === "active" || filing.status === "in_progress" ? "bg-primary/10 group-hover:bg-primary/20" :
                      "bg-muted/50 group-hover:bg-muted/70"
                    }`}>
                      <Icon className={`w-5 h-5 ${
                        filing.status === "completed" ? "text-success" :
                        filing.status === "active" || filing.status === "in_progress" ? "text-primary" :
                        "text-muted-foreground"
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-brand-body mb-1 group-hover:text-primary transition-colors">{filing.name}</h3>
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md font-medium ${statusBadge.className}`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusBadge.label}
                        </span>
                        {filing.reference && (
                          <span className="text-xs text-muted-foreground">
                            Reference: <span className="font-medium text-brand-body">{filing.reference}</span>
                          </span>
                        )}
                        {filing.submissionDate && (
                          <span className="text-xs text-muted-foreground">
                            Submitted: <span className="font-medium text-brand-body">{new Date(filing.submissionDate).toLocaleDateString()}</span>
                          </span>
                        )}
                        {filing.completionDate && (
                          <span className="text-xs text-muted-foreground">
                            Completed: <span className="font-medium text-brand-body">{new Date(filing.completionDate).toLocaleDateString()}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                  <div className="shrink-0 ml-4" onClick={(e) => e.stopPropagation()}>
                    {getCTAButton(filing)}
                  </div>
                </div>
              );
            })}
          </div>
        </DashboardCard>
      )}

      {/* Section D: All Available Filing Types (if no filings exist) */}
      {mbrFilings.length === 0 && (
        <DashboardCard className="p-6">
          <div className="mb-5">
            <h2 className="text-xl font-semibold text-brand-body mb-1">MBR Filing Types</h2>
            <p className="text-sm text-muted-foreground">Start a new MBR filing for your company.</p>
          </div>
          <div className="space-y-3">
            {mbrFilingTypes.map((filingType) => {
              const Icon = filingType.icon;
              
              return (
                <div
                  key={filingType.type}
                  className="flex items-center justify-between p-4 border border-border rounded-lg bg-card hover:bg-muted/20 transition-colors group"
                >
                  <Link 
                    href={`/dashboard/services/mbr-filing/${filingType.type}/request`}
                    className="flex items-center gap-4 flex-1 min-w-0"
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-brand-body mb-1 group-hover:text-primary transition-colors">{filingType.name}</h3>
                      <p className="text-sm text-muted-foreground">{filingType.description}</p>
                    </div>
                  </Link>
                  <div className="shrink-0 ml-4" onClick={(e) => e.stopPropagation()}>
                    <Button 
                      variant="default" 
                      size="sm" 
                      className="min-w-[140px] whitespace-nowrap !bg-primary !text-white hover:!bg-primary/90 font-semibold shadow-md"
                      asChild
                    >
                      <Link href={`/dashboard/services/mbr-filing/${filingType.type}/request`}>
                        <Plus className="w-4 h-4 mr-1.5" />
                        Start filing
                      </Link>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </DashboardCard>
      )}

      {/* Support Footer */}
      <DashboardCard className="p-6 bg-muted/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              Need help with MBR filings or corporate changes?
            </p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/messages">
              <MessageSquare className="w-4 h-4 mr-2" />
              Message CSP team
            </Link>
          </Button>
        </div>
      </DashboardCard>
    </section>
  );
}

// Helper function to get MBR filings from localStorage
function getMBRFilings(companyId: string): MBRFiling[] {
  if (typeof window === 'undefined') return [];
  
  const storageKey = `vacei-mbr-filings-${companyId}`;
  const stored = localStorage.getItem(storageKey);
  
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (error) {
      console.error("Error parsing MBR filings:", error);
      return [];
    }
  }
  
  // Initialize with all filing types as "not_started"
  const initialFilings: MBRFiling[] = mbrFilingTypes.map((type, index) => ({
    id: `mbr-${type.type}-${Date.now()}-${index}`,
    type: type.type,
    name: type.name,
    description: type.description,
    icon: type.icon,
    status: "not_started"
  }));
  
  localStorage.setItem(storageKey, JSON.stringify(initialFilings));
  return initialFilings;
}

