"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import DashboardCard from "@/components/DashboardCard";
import PageHeader from "@/components/shared/PageHeader";
import Dropdown from "@/components/Dropdown";
import { 
  Building2, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Eye, 
  ArrowRight,
  MessageSquare,
  Plus,
  ChevronDown,
  Calendar,
  FileText,
  Users,
  Briefcase,
  Share2,
  TrendingUp,
  Globe,
  UserCheck,
  Shield,
  FileCheck,
  Mail,
  Award,
  Banknote,
  GitBranch,
  Home,
  Settings,
  MapPin
} from "lucide-react";
import PillTabs from "@/components/shared/PillTabs";
import BackButton from "@/components/shared/BackButton";
import { useTabQuery } from "@/hooks/useTabQuery";
import { Suspense } from "react";
import { 
  calculateCSPStatus, 
  formatDate, 
  formatDateShort,
  type CSPService,
  type CSPStatus 
} from "@/lib/cspRenewalUtils";
import { getCSPServices, getCSPService } from "@/lib/cspStorage";

type TabKey = "csp-services" | "mbr" | "documents" | "requests" | "overview";

// CSP Service Types
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

// Services will be loaded from localStorage in the component

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

const getCTAButton = (service: CSPService) => {
  const statusBadge = getStatusBadge(service.status);
  const Icon = statusBadge.icon;

  switch (service.status) {
    case "active":
  return (
        <Button variant="outline" size="sm" className="min-w-[120px]" asChild>
          <Link href={`/dashboard/services/csp-mbr/services/${service.id}`}>
        <Eye className="w-4 h-4 mr-1.5" />
        View details
          </Link>
      </Button>
    );
    case "expiring_soon":
    return (
        <Button variant="default" size="sm" className="min-w-[100px]" asChild>
          <Link href={`/dashboard/services/csp-mbr/services/${service.id}/renew`}>
            <ArrowRight className="w-4 h-4 mr-1.5" />
        Renew
          </Link>
      </Button>
    );
    case "expired":
    return (
        <Button variant="default" size="sm" className="min-w-[120px]" asChild>
          <Link href={`/dashboard/services/csp-mbr/services/${service.id}/renew`}>
            <ArrowRight className="w-4 h-4 mr-1.5" />
        Renew now
          </Link>
        </Button>
      );
    case "not_active":
      return (
        <Button variant="outline" size="sm" className="min-w-[140px]" asChild>
          <Link href={`/dashboard/services/csp-mbr/${service.id}/request`}>
            <Plus className="w-4 h-4 mr-1.5" />
            Request service
          </Link>
      </Button>
    );
  }
};
  
export default function CspMbrWorkspacePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CspMbrContent />
    </Suspense>
  );
}

function CspMbrContent() {
  const [activeTab, setActiveTab] = useTabQuery("csp-services", "type");
  const [filterStatus, setFilterStatus] = useState<CSPStatus | "all">("all");
  const [activeCompany, setActiveCompany] = useState<string>("ACME LTD");
  const [companyId, setCompanyId] = useState<string>("");
  const [cspServices, setCspServices] = useState<CSPService[]>([]);
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
            // Load CSP services for this company
            const services = getCSPServices(company.id);
            setCspServices(services);
          }
        } catch (error) {
          console.error("Error loading company data:", error);
        }
      }
      setLoading(false);
    }
  }, []);

  // Recalculate services when component updates (for status changes)
  useEffect(() => {
    if (companyId) {
      const services = getCSPServices(companyId);
      setCspServices(services);
    }
  }, [companyId]);

  // Refresh services when page becomes visible or regains focus (e.g., returning from renewal)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && companyId) {
        const services = getCSPServices(companyId);
        setCspServices(services);
      }
    };

    const handleFocus = () => {
      if (companyId) {
        const services = getCSPServices(companyId);
        setCspServices(services);
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
  const activeServices = cspServices.filter(s => s.status === "active").length;
  const expiringSoon = cspServices.filter(s => s.status === "expiring_soon").length;
  const notActive = cspServices.filter(s => s.status === "not_active" || s.status === "expired").length;

  // Filter services
  const filteredServices = filterStatus === "all" 
    ? cspServices 
    : cspServices.filter(s => s.status === filterStatus);

  const activeServicesList = cspServices.filter(s => s.status === "active");
  const expiringSoonList = cspServices.filter(s => s.status === "expiring_soon");
  const recommendedServices = cspServices.filter(s => s.status === "not_active");

  // Use formatDate from utilities

  if (loading) {
    return (
      <section className="mx-auto max-w-[1400px] w-full pt-5">
        <DashboardCard className="p-12 text-center">
          <p className="text-muted-foreground">Loading CSP services...</p>
        </DashboardCard>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-[1400px] w-full pt-5 space-y-6">
      <BackButton />
      
      {/* Page Header */}
      <PageHeader
        title="Corporate Services (CSP)"
        subtitle="Your company's statutory appointments, governance services, and corporate maintenance — all in one place."
        description="This page shows which corporate services are currently in place for your company, when they expire, and which additional services may be required to remain compliant under Maltese company law."
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
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Active services</span>
            <CheckCircle2 className="w-5 h-5 text-success" />
          </div>
          <p className="text-3xl font-bold text-brand-body">{activeServices}</p>
      </div>
        <div 
          onClick={() => setFilterStatus(filterStatus === "expiring_soon" ? "all" : "expiring_soon")}
          className={`p-5 rounded-lg border cursor-pointer transition-colors ${
            filterStatus === "expiring_soon" 
              ? "bg-warning/5 border-warning/30" 
              : "bg-card border-border hover:bg-muted/20"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Expiring soon</span>
            <AlertCircle className="w-5 h-5 text-warning" />
              </div>
          <p className="text-3xl font-bold text-brand-body">{expiringSoon}</p>
            </div>
        <div 
          onClick={() => setFilterStatus(filterStatus === "not_active" ? "all" : "not_active")}
          className={`p-5 rounded-lg border cursor-pointer transition-colors ${
            filterStatus === "not_active" 
              ? "bg-muted/30 border-border" 
              : "bg-card border-border hover:bg-muted/20"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Not active</span>
            <Clock className="w-5 h-5 text-muted-foreground" />
              </div>
          <p className="text-3xl font-bold text-brand-body">{notActive}</p>
            </div>
          </div>

      {/* Section A: Active CSP Services */}
      {filterStatus === "all" && activeServicesList.length > 0 && (
      <DashboardCard className="p-6">
        <div className="mb-5">
            <h2 className="text-xl font-semibold text-brand-body mb-1">Active Services</h2>
          <p className="text-sm text-muted-foreground">These services are currently in place for your company.</p>
              </div>
        <div className="space-y-3">
            {activeServicesList.map((service) => {
              const Icon = getServiceIcon(service.service_type as CSPServiceType);
              const statusBadge = getStatusBadge(service.status);
              const StatusIcon = statusBadge.icon;
              
              return (
              <div key={service.id} className="flex items-center justify-between p-4 border border-border rounded-lg bg-card hover:bg-muted/20 transition-colors">
                  <Link href={`/dashboard/services/csp-mbr/services/${service.id}`} className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-brand-body mb-1 hover:text-primary transition-colors">{service.service_name}</h3>
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md font-medium ${statusBadge.className}`}>
                          <StatusIcon className="w-3 h-3" />
                          Status: {statusBadge.label}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Expiry: <span className="font-medium text-brand-body">{formatDate(service.expiry_date)}</span>
                        </span>
            </div>
                </div>
                  </Link>
                  <div className="shrink-0 ml-4" onClick={(e) => e.stopPropagation()}>
                    {getCTAButton(service)}
                </div>
                </div>
              );
            })}
            </div>
      </DashboardCard>
      )}

      {/* Section B: Expiring Soon */}
      {filterStatus === "all" && expiringSoonList.length > 0 && (
        <DashboardCard className="p-6 border-l-4 border-l-warning bg-gradient-to-r from-warning/5 to-transparent">
          <div className="mb-5">
            <h2 className="text-xl font-semibold text-brand-body mb-1">Expiring Soon</h2>
            <p className="text-sm text-muted-foreground">These services will require renewal shortly.</p>
          </div>
          <div className="space-y-3">
            {expiringSoonList.map((service) => {
              const Icon = getServiceIcon(service.service_type as CSPServiceType);
              
              return (
                <div key={service.id} className="flex items-center justify-between p-4 bg-warning/5 rounded-lg border border-warning/20">
                  <Link href={`/dashboard/services/csp-mbr/services/${service.id}`} className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-warning" />
                    </div>
                <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-brand-body mb-1 hover:text-primary transition-colors">{service.service_name}</h3>
                      <span className="text-xs text-muted-foreground">
                        Expiry: <span className="font-medium text-brand-body">{formatDate(service.expiry_date)}</span>
                      </span>
              </div>
                  </Link>
                  <div className="shrink-0 ml-4" onClick={(e) => e.stopPropagation()}>
                    {getCTAButton(service)}
            </div>
                </div>
              );
            })}
          </div>
        </DashboardCard>
      )}

      {/* Filtered Services View */}
      {filterStatus !== "all" && filteredServices.length > 0 && (
        <DashboardCard className="p-6">
          <div className="mb-5">
            <h2 className="text-xl font-semibold text-brand-body mb-1">
              {filterStatus === "active" && "Active Services"}
              {filterStatus === "expiring_soon" && "Expiring Soon"}
              {filterStatus === "not_active" && "Not Active Services"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {filterStatus === "active" && "These services are currently in place for your company."}
              {filterStatus === "expiring_soon" && "These services will require renewal shortly."}
              {filterStatus === "not_active" && "Services that are not currently active."}
            </p>
          </div>
          <div className="space-y-3">
            {filteredServices.map((service) => {
              const Icon = getServiceIcon(service.service_type as CSPServiceType);
              const statusBadge = getStatusBadge(service.status);
              const StatusIcon = statusBadge.icon;
              
              return (
                <div key={service.id} className="flex items-center justify-between p-4 border border-border rounded-lg bg-card hover:bg-muted/20 transition-colors">
                  <Link href={`/dashboard/services/csp-mbr/services/${service.id}`} className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-brand-body mb-1 hover:text-primary transition-colors">{service.service_name}</h3>
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md font-medium ${statusBadge.className}`}>
                          <StatusIcon className="w-3 h-3" />
                          Status: {statusBadge.label}
                        </span>
                        {service.expiry_date && (
                          <span className="text-xs text-muted-foreground">
                            Expiry: <span className="font-medium text-brand-body">{formatDate(service.expiry_date)}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                  <div className="shrink-0 ml-4" onClick={(e) => e.stopPropagation()}>
                    {getCTAButton(service)}
                  </div>
                </div>
              );
            })}
          </div>
        </DashboardCard>
      )}

      {/* Section C: Recommended / Missing Services */}
      {filterStatus === "all" && recommendedServices.length > 0 && (
        <DashboardCard className="p-6">
          <div className="mb-5">
            <h2 className="text-xl font-semibold text-brand-body mb-1">Recommended for Your Company</h2>
            <p className="text-sm text-muted-foreground">Based on your company profile and Maltese compliance requirements. These are not warnings — just visibility.</p>
          </div>
          <div className="space-y-3">
            {recommendedServices.map((service) => {
              const Icon = getServiceIcon(service.service_type as CSPServiceType);
              
              return (
              <div key={service.id} className="flex items-center justify-between p-4 border border-border rounded-lg bg-card hover:bg-muted/20 transition-colors">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-brand-body mb-1">{service.service_name}</h3>
                      <p className="text-xs text-muted-foreground">{service.description}</p>
                    </div>
                  </div>
                  <div className="shrink-0 ml-4">
                    {getCTAButton(service)}
                </div>
                </div>
              );
            })}
            </div>
        </DashboardCard>
      )}

      {/* Section D: Support */}
      {filterStatus === "all" && (
        <DashboardCard className="p-6 bg-muted/20">
        <div className="flex items-center justify-between">
                  <div>
            <p className="text-sm text-muted-foreground mb-1">Need help with corporate services or changes?</p>
          </div>
          <Link href="/dashboard/messages">
            <Button variant="outline" className="min-w-[180px]">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Message CSP team
                        </Button>
                      </Link>
              </div>
      </DashboardCard>
      )}

      {/* Legacy Tabs (Hidden by default, can be accessed via URL) */}
      {activeTab !== "csp-services" && (
        <>
          <PillTabs
            tabs={[
              { id: "csp-services", label: "CSP Services", icon: Building2 },
              { id: "mbr", label: "MBR Submissions", icon: FileCheck },
              { id: "documents", label: "Documents", icon: FileText },
              { id: "requests", label: "Requests", icon: Clock },
              { id: "overview", label: "Overview", icon: Briefcase },
            ]}
            activeTab={activeTab}
            onTabChange={(id) => setActiveTab(id as TabKey)}
          />
          
          {/* Legacy tab content can be added here if needed */}
        </>
      )}
    </section>
  );
}
