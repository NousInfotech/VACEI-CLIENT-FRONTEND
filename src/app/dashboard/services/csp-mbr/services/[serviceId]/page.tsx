"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import DashboardCard from "@/components/DashboardCard";
import { 
  ArrowLeft,
  Eye,
  Download,
  MessageSquare,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  FileText,
  Building2,
  Users,
  UserCheck,
  Share2,
  Shield,
  FileCheck,
  Mail,
  Award,
  Banknote,
  Briefcase,
  RefreshCw,
  GitBranch,
  Home,
  Settings,
  MapPin,
  Globe
} from "lucide-react";
import { 
  formatDate,
  calculateCSPStatus,
  type CSPService 
} from "@/lib/cspRenewalUtils";
import { getCSPService } from "@/lib/cspStorage";

type CSPServiceType = 
  | "registered_office"
  | "company_secretary"
  | "director_services"
  | "nominee_director"
  | "nominee_shareholder"
  | "statutory_registers"
  | "ubo_maintenance"
  | "mbr_filings"
  | "documentation_maintenance"
  | "substance_support"
  | "compliance_oversight"
  | "director_declarations"
  | "mail_handling"
  | "certified_copies"
  | "bank_liaison"
  | "malta_company_formation"
  | "malta_branch_establishment"
  | "company_redomiciliation"
  | "directorship_company_secretarial"
  | "malta_back_office"
  | "family_office_services"
  | "dubai_company_registration";

type CSPStatus = "active" | "expiring_soon" | "expired" | "not_active";

interface CSPServiceDetail extends CSPService {
  documents: Array<{
    id: string;
    name: string;
    type: string;
    uploaded_at: string;
    url?: string;
  }>;
  history: Array<{
    id: string;
    action: string;
    date: string;
    description: string;
  }>;
}

const getServiceIcon = (serviceType: CSPServiceType) => {
  const iconMap: Record<CSPServiceType, any> = {
    registered_office: Building2,
    company_secretary: FileText,
    director_services: Users,
    nominee_director: UserCheck,
    nominee_shareholder: Share2,
    statutory_registers: FileCheck,
    ubo_maintenance: Shield,
    mbr_filings: FileCheck,
    documentation_maintenance: FileText,
    substance_support: Briefcase,
    compliance_oversight: Shield,
    director_declarations: UserCheck,
    mail_handling: Mail,
    certified_copies: Award,
    bank_liaison: Banknote,
    malta_company_formation: Building2,
    malta_branch_establishment: GitBranch,
    company_redomiciliation: Globe,
    directorship_company_secretarial: Users,
    malta_back_office: Briefcase,
    family_office_services: Home,
    dubai_company_registration: MapPin
  };
  return iconMap[serviceType] || Building2;
};

const getStatusBadge = (status: CSPStatus) => {
  const badges = {
    active: {
      className: "bg-success/10 text-success border border-success/20",
      label: "Active",
      icon: CheckCircle2
    },
    expiring_soon: {
      className: "bg-warning/10 text-warning border border-warning/20",
      label: "Expiring soon",
      icon: AlertCircle
    },
    expired: {
      className: "bg-destructive/10 text-destructive border border-destructive/20",
      label: "Expired",
      icon: AlertCircle
    },
    not_active: {
      className: "bg-muted text-muted-foreground border border-border",
      label: "Not active",
      icon: Clock
    }
  };
  return badges[status];
};

export default function CSPServiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const serviceId = params.serviceId as string;
  const [service, setService] = useState<CSPServiceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [companyId, setCompanyId] = useState<string>("");

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedCompany = localStorage.getItem("vacei-active-company");
      if (storedCompany) {
        setCompanyId(storedCompany);
      }
    }
  }, []);

  useEffect(() => {
    if (companyId) {
      loadServiceDetail();
    }
  }, [serviceId, companyId]);

  const loadServiceDetail = async () => {
    if (!companyId) return;
    
    setLoading(true);
    try {
      // Load from localStorage
      const cspService = getCSPService(serviceId, companyId);
      
      if (!cspService) {
        setService(null);
        setLoading(false);
        return;
      }

      // Mock documents and history (these would come from API in production)
      const mockService: CSPServiceDetail = {
        ...cspService,
        documents: [
          {
            id: "doc-1",
            name: `${cspService.service_name} Appointment`,
            type: "Appointment",
            uploaded_at: cspService.start_date || new Date().toISOString().split('T')[0],
            url: `/documents/csp/${serviceId}/appointment.pdf`
          },
          {
            id: "doc-2",
            name: `${cspService.service_name} Resolution`,
            type: "Resolution",
            uploaded_at: cspService.start_date || new Date().toISOString().split('T')[0],
            url: `/documents/csp/${serviceId}/resolution.pdf`
          }
        ],
        history: [
          {
            id: "hist-1",
            action: "Service activated",
            date: cspService.start_date || new Date().toISOString().split('T')[0],
            description: `${cspService.service_name} service started`
          },
          ...(cspService.last_renewed_at ? [{
            id: "hist-2",
            action: "Service renewed",
            date: cspService.last_renewed_at,
            description: `${cspService.service_name} renewed`
          }] : [])
        ]
      };
      
      setService(mockService);
    } catch (error) {
      console.error("Failed to load service detail", error);
      setService(null);
    } finally {
      setLoading(false);
    }
  };

  // Use formatDate from utilities

  if (loading) {
    return (
      <section className="mx-auto max-w-[1400px] w-full pt-5">
        <DashboardCard className="p-12 text-center">
          <p className="text-muted-foreground">Loading service details...</p>
        </DashboardCard>
      </section>
    );
  }

  if (!service) {
    return (
      <section className="mx-auto max-w-[1400px] w-full pt-5">
        <DashboardCard className="p-12 text-center">
          <p className="text-muted-foreground mb-4">Service not found.</p>
          <Link href="/dashboard/services/csp-mbr">
            <Button variant="outline">Back to CSP Services</Button>
          </Link>
        </DashboardCard>
      </section>
    );
  }

  const Icon = getServiceIcon(service.service_type as CSPServiceType);
  const statusBadge = getStatusBadge(service.status);
  const StatusIcon = statusBadge.icon;

  return (
    <section className="mx-auto max-w-[1400px] w-full pt-5 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/services/csp-mbr">
          <Button variant="ghost" size="sm" className="min-w-[100px]">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-brand-body">{service.service_name}</h1>
            <span className={`inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full font-medium ${statusBadge.className}`}>
              <StatusIcon className="w-3 h-3" />
              {statusBadge.label}
            </span>
          </div>
        </div>
      </div>

      {/* Service Description */}
      <DashboardCard className="p-6">
        <h2 className="text-lg font-semibold text-brand-body mb-3">Service Description</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">{service.description}</p>
      </DashboardCard>

      {/* Service Details */}
      <DashboardCard className="p-6">
        <h2 className="text-lg font-semibold text-brand-body mb-5">Service Details</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5">Appointment / Assignment</p>
            <p className="font-semibold text-brand-body">{service.assigned_party}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5">Start Date</p>
            <p className="font-semibold text-brand-body">{formatDate(service.start_date)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5">Expiry / Renewal Date</p>
            <p className="font-semibold text-brand-body">{formatDate(service.expiry_date)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5">Auto-Renew</p>
            <p className="font-semibold text-brand-body">
              {service.auto_renew ? (
                <span className="text-success">Enabled</span>
              ) : (
                <span className="text-muted-foreground">Disabled</span>
              )}
            </p>
          </div>
        </div>
      </DashboardCard>

      {/* Documents */}
      {service.documents.length > 0 && (
        <DashboardCard className="p-6">
          <h2 className="text-lg font-semibold text-brand-body mb-5">Documents</h2>
          <div className="space-y-3">
            {service.documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-4 border border-border rounded-lg bg-card hover:bg-muted/20 transition-colors">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-brand-body truncate">{doc.name}</p>
                    <div className="flex items-center gap-2.5 mt-1.5">
                      <span className="text-xs px-2.5 py-1 rounded-md bg-muted text-muted-foreground border border-border">
                        {doc.type}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(doc.uploaded_at)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {doc.url && (
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
                  )}
                </div>
              </div>
            ))}
          </div>
        </DashboardCard>
      )}

      {/* History */}
      {service.history.length > 0 && (
        <DashboardCard className="p-6">
          <h2 className="text-lg font-semibold text-brand-body mb-5">History</h2>
          <div className="space-y-4">
            {service.history.map((item) => (
              <div key={item.id} className="flex items-start gap-4 pb-4 border-b border-border last:border-0 last:pb-0">
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Calendar className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-brand-body mb-1">{item.action}</p>
                  <p className="text-xs text-muted-foreground mb-1.5">{item.description}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(item.date)}</p>
                </div>
              </div>
            ))}
          </div>
        </DashboardCard>
      )}

      {/* Actions */}
      <DashboardCard className="p-6">
        <h2 className="text-lg font-semibold text-brand-body mb-5">Actions</h2>
        <div className="flex flex-wrap gap-3">
          {(service.status === "expiring_soon" || service.status === "expired") && (
            <Link href={`/dashboard/services/csp-mbr/services/${service.id}/renew`}>
              <Button variant="default" className="min-w-[140px]">
                <RefreshCw className="w-4 h-4 mr-2" />
                Renew service
              </Button>
            </Link>
          )}
          <Link href="/dashboard/services/request">
            <Button variant="outline" className="min-w-[160px]">
              <MessageSquare className="w-4 h-4 mr-2" />
              Request change
            </Button>
          </Link>
          <Link href="/dashboard/messages">
            <Button variant="outline" className="min-w-[160px]">
              <MessageSquare className="w-4 h-4 mr-2" />
              Message CSP team
            </Button>
          </Link>
        </div>
      </DashboardCard>
    </section>
  );
}

