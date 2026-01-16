"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import DashboardCard from "@/components/DashboardCard";
import BackButton from "@/components/shared/BackButton";
import { 
  ArrowLeft, 
  CheckCircle2,
  Clock,
  FileText,
  Share2,
  UserCheck,
  TrendingUp,
  Globe,
  Building2,
  Download,
  Eye,
  MessageSquare
} from "lucide-react";

type MBRFilingType = "share_transfer" | "director_change" | "share_capital" | "cross_border_merger" | "company_name_change";
type MBRFilingStatus = "active" | "in_progress" | "completed" | "not_started";

interface MBRFiling {
  id: string;
  type: MBRFilingType;
  name: string;
  description: string;
  icon: any;
  status: MBRFilingStatus;
  submissionDate?: string;
  completionDate?: string;
  reference?: string;
  formData?: Record<string, string>;
  uploadedFiles?: string[];
}

const filingTypeIcons: Record<MBRFilingType, any> = {
  share_transfer: Share2,
  director_change: UserCheck,
  share_capital: TrendingUp,
  cross_border_merger: Globe,
  company_name_change: Building2
};

const filingTypeNames: Record<MBRFilingType, string> = {
  share_transfer: "Share Transfer",
  director_change: "Director Change",
  share_capital: "Share Capital Increase/Reduction",
  cross_border_merger: "Cross-Border Merger",
  company_name_change: "Company Name Change"
};

export default function MBRFilingDetailPage() {
  const router = useRouter();
  const params = useParams();
  const filingType = params?.type as MBRFilingType;
  
  const [filing, setFiling] = useState<MBRFiling | null>(null);
  const [loading, setLoading] = useState(true);
  const [companyId, setCompanyId] = useState<string>("");

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedCompany = localStorage.getItem("vacei-active-company");
      if (storedCompany) {
        setCompanyId(storedCompany);
        loadFiling(storedCompany);
      }
    }
  }, [filingType]);

  const loadFiling = (companyId: string) => {
    const storageKey = `vacei-mbr-filings-${companyId}`;
    const stored = localStorage.getItem(storageKey);
    
    if (stored) {
      try {
        const filings: MBRFiling[] = JSON.parse(stored);
        const foundFiling = filings.find(f => f.type === filingType);
        
        if (foundFiling) {
          setFiling(foundFiling);
        } else {
          // If no filing found, create a placeholder
          const Icon = filingTypeIcons[filingType] || FileText;
          setFiling({
            id: `mbr-${filingType}-placeholder`,
            type: filingType,
            name: filingTypeNames[filingType],
            description: "",
            icon: Icon,
            status: "not_started"
          });
        }
      } catch (error) {
        console.error("Error loading filing:", error);
      }
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <section className="mx-auto max-w-[1000px] w-full pt-5">
        <DashboardCard className="p-12 text-center">
          <p className="text-muted-foreground">Loading filing details...</p>
        </DashboardCard>
      </section>
    );
  }

  if (!filing) {
    return (
      <section className="mx-auto max-w-[1000px] w-full pt-5 space-y-6">
        <BackButton />
        <DashboardCard className="p-12 text-center">
          <p className="text-muted-foreground mb-4">No filing found for this type.</p>
          <Link href={`/dashboard/services/mbr-filing/${filingType}/request`}>
            <Button variant="default">
              Start New Filing
            </Button>
          </Link>
        </DashboardCard>
      </section>
    );
  }

  const Icon = filingTypeIcons[filing.type] || FileText;
  const statusBadge = getStatusBadge(filing.status);
  const StatusIcon = statusBadge.icon;

  return (
    <section className="mx-auto max-w-[1000px] w-full pt-5 space-y-6">
      <BackButton />
      
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-brand-body">{filing.name}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {filing.reference && `Reference: ${filing.reference}`}
          </p>
        </div>
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium text-sm ${statusBadge.className}`}>
          <StatusIcon className="w-4 h-4" />
          {statusBadge.label}
        </span>
      </div>

      {/* Status Card */}
      {filing.status !== "not_started" && (
        <DashboardCard className="p-6 border-l-4 border-l-primary bg-gradient-to-r from-primary/5 to-transparent">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-brand-body mb-2">Filing Status</h2>
              <div className="space-y-1">
                {filing.submissionDate && (
                  <p className="text-sm text-muted-foreground">
                    Submitted: <span className="font-medium text-brand-body">
                      {new Date(filing.submissionDate).toLocaleDateString()}
                    </span>
                  </p>
                )}
                {filing.completionDate && (
                  <p className="text-sm text-muted-foreground">
                    Completed: <span className="font-medium text-brand-body">
                      {new Date(filing.completionDate).toLocaleDateString()}
                    </span>
                  </p>
                )}
              </div>
            </div>
            {filing.status === "in_progress" && (
              <Clock className="w-8 h-8 text-primary" />
            )}
            {filing.status === "completed" && (
              <CheckCircle2 className="w-8 h-8 text-success" />
            )}
          </div>
        </DashboardCard>
      )}

      {/* Filing Details */}
      {filing.formData && Object.keys(filing.formData).length > 0 && (
        <DashboardCard className="p-6">
          <h2 className="text-lg font-semibold text-brand-body mb-5">Filing Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(filing.formData).map(([key, value]) => (
              <div key={key}>
                <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                  {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </label>
                <p className="text-sm text-brand-body font-medium">{value || "—"}</p>
              </div>
            ))}
          </div>
        </DashboardCard>
      )}

      {/* Documents Section */}
      {filing.uploadedFiles && filing.uploadedFiles.length > 0 && (
        <DashboardCard className="p-6">
          <h2 className="text-lg font-semibold text-brand-body mb-5">Supporting Documents</h2>
          <div className="space-y-2">
            {filing.uploadedFiles.map((fileName, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-brand-body">{fileName}</span>
                </div>
                <Button variant="ghost" size="sm">
                  <Download className="w-4 h-4 mr-1.5" />
                  Download
                </Button>
              </div>
            ))}
          </div>
        </DashboardCard>
      )}

      {/* Actions */}
      <DashboardCard className="p-6">
        <h2 className="text-lg font-semibold text-brand-body mb-5">Actions</h2>
        <div className="flex flex-wrap gap-3">
          {filing.status === "not_started" && (
            <Link href={`/dashboard/services/mbr-filing/${filing.type}/request`}>
              <Button variant="default" className="min-w-[140px]">
                Start Filing
              </Button>
            </Link>
          )}
          <Link href="/dashboard/services/request">
            <Button variant="outline" className="min-w-[160px]">
              <MessageSquare className="w-4 h-4 mr-2" />
              Request Change
            </Button>
          </Link>
          <Link href="/dashboard/messages">
            <Button variant="outline" className="min-w-[160px]">
              <MessageSquare className="w-4 h-4 mr-2" />
              Message Team
            </Button>
          </Link>
        </div>
      </DashboardCard>
    </section>
  );
}

function getStatusBadge(status: MBRFilingStatus) {
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
}

