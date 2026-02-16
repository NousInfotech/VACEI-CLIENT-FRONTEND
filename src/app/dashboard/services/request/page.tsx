"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Dropdown from "@/components/Dropdown";
import { ChevronDown, AlertCircle } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import DashboardCard from "@/components/DashboardCard";
import { useActiveCompany } from "@/context/ActiveCompanyContext";
import { AlertModal } from "@/components/ui/modal";
import { SuccessModal } from "@/components/ui/SuccessModal";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import ServiceRequestForm from "@/components/services/ServiceRequestForm";
import Link from "next/link";

type ServiceCode =
  | "VAT"
  | "ACCOUNTING"
  | "AUDITING"
  | "PAYROLL"
  | "CSP"
  | "LEGAL"
  | "PROJECTS_TRANSACTIONS"
  | "TECHNOLOGY"
  | "GRANTS_AND_INCENTIVES"
  | "INCORPORATION"
  | "CUSTOM";

const serviceLabels: Record<ServiceCode, string> = {
  VAT: "VAT",
  ACCOUNTING: "Accounting",
  AUDITING: "Audit & Annual Accounts",
  PAYROLL: "Payroll",
  CSP: "Corporate & CSP Services",
  LEGAL: "Legal",
  PROJECTS_TRANSACTIONS: "Projects & Transactions",
  TECHNOLOGY: "Technology",
  GRANTS_AND_INCENTIVES: "Grants & Incentives",
  INCORPORATION: "Incorporation",
  CUSTOM: "Custom",
};

export default function ServiceRequestPage() {
  const router = useRouter();
  const { activeCompanyId, companies } = useActiveCompany();
  const [serviceCode, setServiceCode] = useState<ServiceCode | "">("");
  const [pendingServiceCode, setPendingServiceCode] = useState<ServiceCode | "">("");
  const [isFormDirty, setIsFormDirty] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [onSuccessModal, setOnSuccessModal] = useState(false);
  const [modalConfig, setModalConfig] = useState<{
    title: string;
    message: string;
    buttonText: string;
    onAction?: () => void;
  }>({
    title: "Request Submitted!",
    message: "Your service request has been submitted successfully.",
    buttonText: "View History",
  });

  const [customTemplates, setCustomTemplates] = useState<any[]>([]);
  const [customServiceId, setCustomServiceId] = useState<string | "">("");

  // Load custom templates
  useState(() => {
    import("@/api/serviceRequestTemplateService").then(({ getActiveCustomTemplates }) => {
      getActiveCustomTemplates().then(res => {
        setCustomTemplates(res.data || []);
      });
    });
  });

  const activeCompanyName = companies.find(c => c.id === activeCompanyId)?.name;

  const handleServiceChange = (code: ServiceCode | "CUSTOM" | "") => {
    if (isFormDirty) {
      setPendingServiceCode(code as any);
      setShowConfirmModal(true);
    } else {
      setServiceCode(code as any);
      if (code !== "CUSTOM") {
        setCustomServiceId("");
      }
    }
  };

  const confirmServiceChange = () => {
    setServiceCode(pendingServiceCode);
    setShowConfirmModal(false);
    setIsFormDirty(false);
  };

  const handleClearDraft = () => {
    if (isFormDirty) {
      setPendingServiceCode("");
      setShowConfirmModal(true);
    } else {
      setServiceCode("");
    }
  };

  const handleSuccess = () => {
    setModalConfig({
      title: "Request Submitted!",
      message: "Your service request has been submitted successfully. You can track its progress in the Service Request History section.",
      buttonText: "View History",
      onAction: () => {
        setOnSuccessModal(false);
        router.push("/dashboard/services/history");
      }
    });
    setOnSuccessModal(true);
  };

  const handleDraftSave = () => {
    setModalConfig({
      title: "Draft Saved!",
      message: "Your progress has been saved successfully. You can return to this draft anytime.",
      buttonText: "Continue Editing",
      onAction: () => setOnSuccessModal(false)
    });
    setOnSuccessModal(true);
  };

  return (
    <section className="mx-auto w-full p-5 space-y-6">
      <PageHeader
        title="Request a Service"
        subtitle="Select the service and complete the form."
        activeCompany={activeCompanyName}
        actions={
          <div className="flex gap-2">
            <Link href="/dashboard/services/history">
              <Button
                variant="outline"
                className="bg-light text-primary-color-new"
              >
                View Services Request
              </Button>
            </Link>
            <Button
              variant="outline"
              className="bg-light text-primary-color-new"
              onClick={handleClearDraft}
            >
              Clear draft
            </Button>
          </div>
        }
      />

      <DashboardCard className="p-6 space-y-6">
        {/* Service Selection */}
        <div className="space-y-2">
          <label className="text-sm font-semibold">
            Service <span className="text-destructive">*</span>
          </label>

          <Dropdown
            className="w-full"
            fullWidth
            searchable
            searchPlaceholder="Search services..."
            trigger={
              <Button 
                variant="outline" 
                className="w-full h-11 px-4 justify-between border-gray-200 bg-gray-50/50 hover:bg-white hover:border-primary/40 focus:ring-2 focus:ring-primary/5 rounded-xl transition-all"
              >
                <div className="flex items-center gap-2">
                  <span className={serviceCode ? "text-gray-900 font-semibold" : "text-gray-400 font-medium"}>
                    {serviceCode ? serviceLabels[serviceCode as ServiceCode] : "Select a service to get started"}
                  </span>
                </div>
                <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-300 ${serviceCode ? "opacity-100" : "opacity-50"}`} />
              </Button>
            }
            items={Object.entries(serviceLabels).map(([code, label]) => ({
              id: code,
              label,
              onClick: () => handleServiceChange(code as any),
            }))}
          />
        </div>

        {/* Custom Service Sub-Selection */}
        {serviceCode === "CUSTOM" && (
          <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
            <label className="text-sm font-semibold">
              Custom Service Type <span className="text-destructive">*</span>
            </label>
            <Dropdown
              className="w-full"
              fullWidth
              searchable
              searchPlaceholder="Search custom services..."
              trigger={
                <Button 
                  variant="outline" 
                  className="w-full h-11 px-4 justify-between border-gray-200 bg-gray-50/50 hover:bg-white hover:border-primary/40 focus:ring-2 focus:ring-primary/5 rounded-xl transition-all"
                >
                  <div className="flex items-center gap-2">
                    <span className={customServiceId ? "text-gray-900 font-semibold" : "text-gray-400 font-medium"}>
                      {customServiceId 
                        ? customTemplates.find(t => t.customServiceCycleId === customServiceId)?.customServiceCycle?.title 
                        : "Select specific custom service"}
                    </span>
                  </div>
                  <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-300 ${customServiceId ? "opacity-100" : "opacity-50"}`} />
                </Button>
              }
              items={customTemplates.map((t) => ({
                id: t.customServiceCycleId,
                label: t.customServiceCycle?.title || "Untitled Custom Service",
                onClick: () => setCustomServiceId(t.customServiceCycleId),
              }))}
            />
          </div>
        )}

        {/* ✅ ONE Dynamic Form */}
        {(serviceCode && (serviceCode !== "CUSTOM" || customServiceId)) ? (
          <div className="border-t pt-6">
            <ServiceRequestForm
              service={serviceCode}
              customServiceId={customServiceId || undefined}
              companyId={activeCompanyId}
              onDirtyChange={setIsFormDirty}
              onSuccess={handleSuccess}
              onDraftSave={handleDraftSave}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
             <div className="p-4 bg-primary/5 rounded-full text-primary/30">
               <AlertCircle className="w-12 h-12" />
             </div>
             <div className="max-w-[300px]">
               <h3 className="text-lg font-semibold text-gray-900">No Service Selected</h3>
               <p className="text-sm text-muted-foreground mt-1">
                 Please pick a service from the dropdown above to start your request.
               </p>
             </div>
          </div>
        )}
      </DashboardCard>

      {/* Confirmation Modal for unsaved changes */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={confirmServiceChange}
        title="Unsaved Changes"
        message="You have unsaved changes in your form. Are you sure you want to discard them and switch services?"
        confirmText="Discard and Continue"
        cancelText="Stay Here"
      />

      {/* Success Modal */}
      <SuccessModal
        isOpen={onSuccessModal}
        onClose={() => setOnSuccessModal(false)}
        title={modalConfig.title}
        message={modalConfig.message}
        buttonText={modalConfig.buttonText}
        onAction={modalConfig.onAction}
      />
    </section>
  );
}
