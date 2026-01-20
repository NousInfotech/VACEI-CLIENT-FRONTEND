"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import DashboardCard from "@/components/DashboardCard";
import BackButton from "@/components/shared/BackButton";
import PageHeader from "@/components/shared/PageHeader";
import { AlertModal } from "@/components/ui/modal";
import { 
  ArrowLeft, 
  ArrowRight, 
  Upload, 
  FileText,
  X,
  Building2,
  UserCheck,
  Share2,
  FileCheck,
  Shield,
  Briefcase,
  Mail,
  Award,
  Banknote,
  GitBranch,
  Globe,
  Users,
  Home,
  MapPin
} from "lucide-react";
import { getCSPService } from "@/lib/cspStorage";
import type { CSPService } from "@/lib/cspRenewalUtils";

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

export default function CSPServiceRequestPage() {
  const router = useRouter();
  const params = useParams();
  const serviceId = params?.serviceId as string;
  
  const [service, setService] = useState<CSPService | null>(null);
  const [companyId, setCompanyId] = useState<string>("");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertModalContent, setAlertModalContent] = useState({
    title: "",
    message: "",
    type: "success" as "success" | "error" | "info"
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedCompany = localStorage.getItem("vacei-active-company");
      if (storedCompany) {
        setCompanyId(storedCompany);
        const serviceData = getCSPService(serviceId, storedCompany);
        if (serviceData) {
          setService(serviceData);
        } else {
          // Service not found, redirect back
          router.push("/dashboard/services/csp-mbr");
        }
      }
    }
  }, [serviceId, router]);

  if (!service) {
    return (
      <section className="mx-auto max-w-[1000px] w-full pt-5">
        <DashboardCard className="p-12 text-center">
          <p className="text-muted-foreground">Loading service...</p>
        </DashboardCard>
      </section>
    );
  }

  const Icon = getServiceIcon(service.service_type as CSPServiceType);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setUploadedFiles([...uploadedFiles, ...files]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (uploadedFiles.length === 0) {
      setShowAlertModal(true);
      setAlertModalContent({
        title: "Validation Error",
        message: "Please upload at least one file related to this service.",
        type: "error"
      });
      return;
    }

    setSubmitting(true);
    try {
      // Create service request record
      const requestId = `csp-request-${serviceId}-${Date.now()}`;
      const newRequest = {
        id: requestId,
        serviceId: serviceId,
        serviceName: service.service_name,
        serviceType: service.service_type,
        status: "pending" as const,
        submissionDate: new Date().toISOString(),
        uploadedFiles: uploadedFiles.map(f => f.name),
        notes: notes,
        reference: `CSP-${serviceId.toUpperCase().slice(0, 3)}-${Date.now().toString().slice(-6)}`
      };

      // Save to localStorage
      const storageKey = `vacei-csp-requests-${companyId}`;
      const existingRequests = JSON.parse(localStorage.getItem(storageKey) || "[]");
      existingRequests.push(newRequest);
      localStorage.setItem(storageKey, JSON.stringify(existingRequests));

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setShowAlertModal(true);
      setAlertModalContent({
        title: "Service Request Submitted",
        message: `Your ${service.service_name} request has been submitted successfully. Reference: ${newRequest.reference}`,
        type: "success"
      });
    } catch (error) {
      console.error("Error submitting service request:", error);
      setSubmitting(false);
      setShowAlertModal(true);
      setAlertModalContent({
        title: "Submission Failed",
        message: "Failed to submit service request. Please try again.",
        type: "error"
      });
    }
  };

  return (
    <section className="mx-auto max-w-[1000px] w-full pt-5 space-y-6">
      <BackButton />
      
      {/* Page Header */}
      <PageHeader
        title={service.service_name}
        description={service.description || `Request ${service.service_name} service`}
        icon={Icon}
      />

      {/* Form */}
      <DashboardCard className="p-6">
        <h2 className="text-xl font-semibold text-brand-body mb-6">Request Service</h2>
        
        <div className="space-y-6">
          {/* File Upload Section */}
          <div>
            <label className="block text-sm font-medium text-brand-body mb-2">
              Upload Files <span className="text-destructive">*</span>
            </label>
            <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary transition-colors bg-muted/20">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-10 h-10 mb-3 text-muted-foreground" />
                <p className="mb-2 text-sm text-muted-foreground">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-muted-foreground">Upload files related to this service</p>
              </div>
              <Input
                type="file"
                onChange={handleFileUpload}
                className="hidden"
                multiple
              />
            </label>
            {uploadedFiles.length > 0 && (
              <div className="mt-4 space-y-2">
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                      <span className="text-sm text-brand-body truncate">{file.name}</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        ({(file.size / 1024).toFixed(2)} KB)
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Optional Notes */}
          <div>
            <label className="block text-sm font-medium text-brand-body mb-2">
              Optional Notes
            </label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional notes or context (optional)..."
              className="min-h-[120px]"
            />
            <p className="text-xs text-muted-foreground mt-2">
              You can add any additional information or context if needed.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t">
          <Link href="/dashboard/services/csp-mbr">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </Link>
          <Button
            variant="default"
            size="sm"
            onClick={handleSubmit}
            disabled={uploadedFiles.length === 0 || submitting}
            className="min-w-[140px]"
          >
            {submitting ? (
              "Submitting..."
            ) : (
              <>
                Submit Request
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </DashboardCard>

      {/* Alert Modal */}
      {showAlertModal && (
        <AlertModal
          isOpen={showAlertModal}
          onClose={() => {
            setShowAlertModal(false);
            if (alertModalContent.type === "success") {
              router.push("/dashboard/services/csp-mbr");
            }
          }}
          title={alertModalContent.title}
          message={alertModalContent.message}
          type={alertModalContent.type}
        />
      )}
    </section>
  );
}

