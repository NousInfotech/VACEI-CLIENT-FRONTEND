"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import DashboardCard from "@/components/DashboardCard";
import { 
  ArrowLeft,
  CheckCircle2,
  Calendar,
  RefreshCw,
  Building2,
  FileText,
  Users,
  UserCheck,
  Share2,
  Shield,
  FileCheck,
  Mail,
  Award,
  Banknote,
  Briefcase,
  GitBranch,
  Home,
  Settings,
  MapPin,
  Globe
} from "lucide-react";
import { 
  calculateNextRenewalPeriod, 
  formatDate, 
  formatDateShort,
  type CSPService 
} from "@/lib/cspRenewalUtils";
import { getCSPService, renewCSPService } from "@/lib/cspStorage";
import { AlertModal } from "@/components/ui/modal";

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

export default function CSPRenewalPage() {
  const params = useParams();
  const router = useRouter();
  const serviceId = params.serviceId as string;
  const [service, setService] = useState<CSPService | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [nextPeriod, setNextPeriod] = useState<{ start_date: string; expiry_date: string } | null>(null);
  const [companyId, setCompanyId] = useState<string>("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

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
      loadService();
    }
  }, [serviceId, companyId]);

  const loadService = async () => {
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
      
      setService(cspService);
      
      // Calculate next renewal period
      if (cspService.expiry_date && cspService.renewal_cycle) {
        const period = calculateNextRenewalPeriod(cspService.expiry_date, cspService.renewal_cycle);
        setNextPeriod(period);
      }
    } catch (error) {
      console.error("Failed to load service", error);
      setService(null);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmRenewal = async () => {
    if (!service || !nextPeriod || !companyId) return;
    
    setProcessing(true);
    try {
      // Renew the service in localStorage
      const renewedService = renewCSPService(
        serviceId,
        nextPeriod.start_date,
        nextPeriod.expiry_date,
        companyId
      );

      if (!renewedService) {
        throw new Error("Failed to renew service");
      }

      // Show success modal
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Failed to process renewal", error);
      setProcessing(false);
      setErrorMessage("Failed to process renewal. Please try again.");
      setShowErrorModal(true);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    // Redirect back to CSP page
    router.push("/dashboard/services/csp-mbr");
  };

  const calculateVAT = (price: number) => {
    // Assuming 18% VAT (Malta standard rate)
    return price * 0.18;
  };

  const calculateTotal = (price: number) => {
    return price + calculateVAT(price);
  };

  if (loading) {
    return (
      <section className="mx-auto max-w-[1400px] w-full pt-5">
        <DashboardCard className="p-12 text-center">
          <p className="text-muted-foreground">Loading renewal details...</p>
        </DashboardCard>
      </section>
    );
  }

  if (!service || !nextPeriod) {
    return (
      <section className="mx-auto max-w-[1400px] w-full pt-5">
        <DashboardCard className="p-12 text-center">
          <p className="text-muted-foreground mb-4">Service not found or cannot be renewed.</p>
          <Link href="/dashboard/services/csp-mbr">
            <Button variant="outline">Back to CSP Services</Button>
          </Link>
        </DashboardCard>
      </section>
    );
  }

  const Icon = getServiceIcon(service.service_type as CSPServiceType);
  const vatAmount = calculateVAT(service.renewal_price);
  const totalAmount = calculateTotal(service.renewal_price);

  return (
    <section className="mx-auto max-w-[1400px] w-full pt-5 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/services/csp-mbr/services/${service.id}`}>
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
            <h1 className="text-3xl font-bold text-brand-body">Renew {service.service_name}</h1>
          </div>
        </div>
      </div>

      {/* Step 1: Confirmation */}
      <DashboardCard className="p-6">
        <div className="mb-5">
          <h2 className="text-xl font-semibold text-brand-body mb-1">Renewal Confirmation</h2>
          <p className="text-sm text-muted-foreground">Review the renewal details and confirm to proceed.</p>
        </div>

        <div className="space-y-6">
          {/* Service Details */}
          <div className="p-5 border border-border rounded-lg bg-card">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-brand-body">{service.service_name}</h3>
                <p className="text-xs text-muted-foreground">{service.description}</p>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-border">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5">Renewal Period</p>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <p className="font-semibold text-brand-body">
                    {formatDateShort(nextPeriod.start_date)} – {formatDateShort(nextPeriod.expiry_date)}
                  </p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5">Renewal Cycle</p>
                <p className="font-semibold text-brand-body capitalize">{service.renewal_cycle}</p>
              </div>
            </div>
          </div>

          {/* Fee Breakdown */}
          <div className="p-5 border border-border rounded-lg bg-card">
            <h3 className="font-semibold text-brand-body mb-4">Fee Breakdown</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Service Fee</span>
                <span className="font-semibold text-brand-body">
                  €{service.renewal_price.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">VAT (18%)</span>
                <span className="font-semibold text-brand-body">
                  €{vatAmount.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="pt-3 border-t border-border flex items-center justify-between">
                <span className="font-semibold text-brand-body">Total</span>
                <span className="text-xl font-bold text-brand-body">
                  €{totalAmount.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Info Note */}
          <div className="p-4 bg-info/5 border border-info/20 rounded-lg">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-info shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-brand-body mb-1">What happens next?</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  After confirmation, you'll be redirected to the invoice page to complete payment. Once payment is received, 
                  your service will be automatically renewed and the expiry date will be updated.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-4">
            <Link href={`/dashboard/services/csp-mbr/services/${service.id}`} className="flex-1">
              <Button variant="outline" className="w-full" disabled={processing}>
                Cancel
              </Button>
            </Link>
            <Button 
              variant="default" 
              className="flex-1 min-w-[200px]" 
              onClick={handleConfirmRenewal}
              disabled={processing}
            >
              {processing ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Confirm & proceed
                </>
              )}
            </Button>
          </div>
        </div>
      </DashboardCard>

      {/* Success Modal */}
      <AlertModal
        isOpen={showSuccessModal}
        onClose={handleSuccessClose}
        title="Service Renewed Successfully"
        message={`${service.service_name} has been renewed successfully. The service is now active until ${formatDateShort(nextPeriod.expiry_date)}.`}
        type="success"
        confirmText="View Services"
        onConfirm={handleSuccessClose}
      />

      {/* Error Modal */}
      <AlertModal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title="Renewal Failed"
        message={errorMessage}
        type="error"
        confirmText="OK"
      />
    </section>
  );
}

