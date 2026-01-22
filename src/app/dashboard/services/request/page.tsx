"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Dropdown from "@/components/Dropdown";
import { ChevronDown, Upload, FileText, X } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import DashboardCard from "@/components/DashboardCard";
import { Input } from "@/components/ui/input";

// Form components
import BookkeepingRequestFormInline from "@/components/bookkeeping/BookkeepingRequestFormInline";
import type { BookkeepingFormData } from "@/components/bookkeeping/BookkeepingRequestForm";
import AuditRequestForm, {
  type AuditFormData,
} from "@/components/audit/AuditRequestForm";
import AdvisoryComplianceRequestForm, {
  type AdvisoryComplianceFormData,
} from "@/components/advisory/AdvisoryComplianceRequestForm";
import CSPRequestForm, { type CSPFormData } from "@/components/csp/CSPRequestForm";
import CompanyStructureRequestForm, {
  type CompanyStructureFormData,
} from "@/components/company-structure/CompanyStructureRequestForm";
import LiquidationRequestForm, {
  type LiquidationFormData,
} from "@/components/liquidation/LiquidationRequestForm";
import OneOffProjectRequestForm, {
  type OneOffProjectFormData,
} from "@/components/one-off/OneOffProjectRequestForm";

// Import VAT and Payroll inline forms
import VATRequestFormInline, {
  type VATFormData,
} from "@/components/services/forms/VATRequestFormInline";
import PayrollRequestFormInline, {
  type PayrollFormData,
} from "@/components/services/forms/PayrollRequestFormInline";

type ServiceCode =
  | "bookkeeping"
  | "vat"
  | "payroll"
  | "audit"
  | "csp"
  | "company_structure"
  | "liquidation"
  | "advisory"
  | "one_off";

const STORAGE_KEY = "vacei-service-request-draft";

const serviceLabels: Record<ServiceCode, string> = {
  bookkeeping: "Bookkeeping",
  vat: "VAT & Tax",
  payroll: "Payroll",
  audit: "Audit & Annual Accounts",
  csp: "Corporate and CSP Services",
  company_structure: "Company Structure & Corporate Changes",
  liquidation: "Liquidation & Wind-down",
  advisory: "Advisory & Compliance — Special Matters",
  one_off: "One-off / Special Project",
};

export default function ServiceRequestPage() {
  const [serviceCode, setServiceCode] = useState<ServiceCode | "">("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form data states for each service type
  const [bookkeepingData, setBookkeepingData] = useState<BookkeepingFormData>({
    whatDoYouNeed: "",
    uploadedFiles: [],
  });
  const [vatData, setVatData] = useState<VATFormData>({
    typeOfVATService: "",
    uploadedFiles: [],
  });
  const [payrollData, setPayrollData] = useState<PayrollFormData>({
    whatDoYouNeed: "",
    uploadedFiles: [],
  });
  const [auditData, setAuditData] = useState<AuditFormData>({
    typeOfAuditService: "",
    uploadedFiles: [],
  });
  const [cspData, setCspData] = useState<CSPFormData>({
    whatDoYouNeed: "",
    uploadedFiles: [],
  });
  const [companyStructureData, setCompanyStructureData] =
    useState<CompanyStructureFormData>({
      whatDoYouNeed: "",
      uploadedFiles: [],
    });
  const [liquidationData, setLiquidationData] = useState<LiquidationFormData>({
    whatDoYouNeed: "",
    uploadedFiles: [],
  });
  const [advisoryData, setAdvisoryData] = useState<AdvisoryComplianceFormData>({
    whatDoYouNeed: "",
    uploadedFiles: [],
  });
  const [oneOffData, setOneOffData] = useState<OneOffProjectFormData>({
    briefDescription: "",
    uploadedFiles: [],
  });

  // Hydrate from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const saved = JSON.parse(raw);
        setServiceCode(saved.serviceCode || "");
        if (saved.formData) {
          switch (saved.serviceCode) {
            case "bookkeeping":
              setBookkeepingData(saved.formData);
              break;
            case "vat":
              setVatData(saved.formData);
              break;
            case "payroll":
              setPayrollData(saved.formData);
              break;
            case "audit":
              setAuditData(saved.formData);
              break;
            case "csp":
              setCspData(saved.formData);
              break;
            case "company_structure":
              setCompanyStructureData(saved.formData);
              break;
            case "liquidation":
              setLiquidationData(saved.formData);
              break;
            case "advisory":
              setAdvisoryData(saved.formData);
              break;
            case "one_off":
              setOneOffData(saved.formData);
              break;
          }
        }
      } catch {
        /* ignore */
      }
    }
  }, []);

  // Persist to localStorage
  useEffect(() => {
    if (typeof window === "undefined" || !serviceCode) return;
    let formData: any = {};
    switch (serviceCode) {
      case "bookkeeping":
        formData = bookkeepingData;
        break;
      case "vat":
        formData = vatData;
        break;
      case "payroll":
        formData = payrollData;
        break;
      case "audit":
        formData = auditData;
        break;
      case "csp":
        formData = cspData;
        break;
      case "company_structure":
        formData = companyStructureData;
        break;
      case "liquidation":
        formData = liquidationData;
        break;
      case "advisory":
        formData = advisoryData;
        break;
      case "one_off":
        formData = oneOffData;
        break;
    }
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ serviceCode, formData })
    );
  }, [
    serviceCode,
    bookkeepingData,
    vatData,
    payrollData,
    auditData,
    cspData,
    companyStructureData,
    liquidationData,
    advisoryData,
    oneOffData,
  ]);

  const resetForm = () => {
    setServiceCode("");
    setBookkeepingData({ whatDoYouNeed: "", uploadedFiles: [] });
    setVatData({ typeOfVATService: "", uploadedFiles: [] });
    setPayrollData({ whatDoYouNeed: "", uploadedFiles: [] });
    setAuditData({ typeOfAuditService: "", uploadedFiles: [] });
    setCspData({ whatDoYouNeed: "", uploadedFiles: [] });
    setCompanyStructureData({ whatDoYouNeed: "", uploadedFiles: [] });
    setLiquidationData({ whatDoYouNeed: "", uploadedFiles: [] });
    setAdvisoryData({ whatDoYouNeed: "", uploadedFiles: [] });
    setOneOffData({ briefDescription: "", uploadedFiles: [] });
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const getCurrentFormData = () => {
    switch (serviceCode) {
      case "bookkeeping":
        return bookkeepingData;
      case "vat":
        return vatData;
      case "payroll":
        return payrollData;
      case "audit":
        return auditData;
      case "csp":
        return cspData;
      case "company_structure":
        return companyStructureData;
      case "liquidation":
        return liquidationData;
      case "advisory":
        return advisoryData;
      case "one_off":
        return oneOffData;
      default:
        return null;
    }
  };

  const isFormValid = () => {
    if (!serviceCode) return false;
    const formData = getCurrentFormData();
    if (!formData) return false;

    // Check if files are uploaded
    if (!formData.uploadedFiles || formData.uploadedFiles.length === 0) {
      return false;
    }

    // Service-specific validation
    switch (serviceCode) {
      case "bookkeeping":
        return !!(formData as BookkeepingFormData).whatDoYouNeed;
      case "vat":
        return !!(formData as VATFormData).typeOfVATService;
      case "payroll":
        return !!(formData as PayrollFormData).whatDoYouNeed;
      case "audit":
        return !!(formData as AuditFormData).typeOfAuditService;
      case "csp":
        return !!(formData as CSPFormData).whatDoYouNeed;
      case "company_structure":
        return !!(formData as CompanyStructureFormData).whatDoYouNeed;
      case "liquidation":
        return !!(formData as LiquidationFormData).whatDoYouNeed;
      case "advisory":
        return !!(formData as AdvisoryComplianceFormData).whatDoYouNeed;
      case "one_off":
        return !!(formData as OneOffProjectFormData).briefDescription.trim();
      default:
        return false;
    }
  };

  const handleSubmit = (e: React.MouseEvent) => {
    e.preventDefault();

    if (!isFormValid()) {
      alert("Please complete all required fields and upload at least one file.");
      return;
    }

    setSubmitting(true);

    const formData = getCurrentFormData();
    const jsonData = {
      serviceCode,
      formData,
      documents: formData?.uploadedFiles.map((f: File) => ({
        name: f.name,
        size: f.size,
        type: f.type,
      })),
    };

    console.log("✅ Submitted JSON:", jsonData);

    // Simulate API call
    setTimeout(() => {
      setSubmitting(false);
      setShowSuccess(true);
      resetForm();
    }, 1000);
  };

  const renderServiceForm = () => {
    if (!serviceCode) {
      return (
        <div className="text-center py-12 text-muted-foreground">
          Please select a service to see the request form.
        </div>
      );
    }

    switch (serviceCode) {
      case "bookkeeping":
        return (
          <BookkeepingRequestFormInline
            formData={bookkeepingData}
            onChange={setBookkeepingData}
          />
        );
      case "vat":
        return (
          <VATRequestFormInline
            formData={vatData}
            onChange={setVatData}
            onFileChange={(files) => setVatData({ ...vatData, uploadedFiles: files })}
          />
        );
      case "payroll":
        return (
          <PayrollRequestFormInline
            formData={payrollData}
            onChange={setPayrollData}
            onFileChange={(files) => setPayrollData({ ...payrollData, uploadedFiles: files })}
          />
        );
      case "audit":
        return (
          <AuditRequestForm formData={auditData} onChange={setAuditData} />
        );
      case "csp":
        return <CSPRequestForm formData={cspData} onChange={setCspData} />;
      case "company_structure":
        return (
          <CompanyStructureRequestForm
            formData={companyStructureData}
            onChange={setCompanyStructureData}
          />
        );
      case "liquidation":
        return (
          <LiquidationRequestForm
            formData={liquidationData}
            onChange={setLiquidationData}
          />
        );
      case "advisory":
        return (
          <AdvisoryComplianceRequestForm
            formData={advisoryData}
            onChange={setAdvisoryData}
          />
        );
      case "one_off":
        return (
          <OneOffProjectRequestForm
            formData={oneOffData}
            onChange={setOneOffData}
          />
        );
      default:
        return null;
    }
  };

  return (
    <section className="mx-auto max-w-[1000px] w-full pt-5 space-y-6">
      <PageHeader
        title="Request a Service"
        subtitle="Select the service and complete the form. Drafts are saved locally."
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="bg-light text-primary-color-new"
              onClick={resetForm}
            >
              Clear draft
            </Button>
            <Button
              variant="outline"
              className="bg-light text-primary-color-new"
              onClick={handleSubmit}
              disabled={!isFormValid() || submitting}
            >
              {submitting ? "Submitting..." : "Submit request"}
            </Button>
          </div>
        }
      />

      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg p-6 w-96 text-center">
            <h2 className="text-lg font-bold text-green-600 mb-2">
              Request submitted successfully
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Your request has been submitted. We will contact you shortly.
            </p>
            <button
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              onClick={() => setShowSuccess(false)}
            >
              OK
            </button>
          </div>
        </div>
      )}

      <DashboardCard className="p-6 space-y-6">
        {/* Service Selection */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-brand-body">
            Service <span className="text-destructive">*</span>
          </label>
          <Dropdown
            className="w-full"
            trigger={
              <Button variant="outline" className="w-full h-9 justify-between">
                {serviceCode
                  ? serviceLabels[serviceCode as ServiceCode] || "Select service"
                  : "Select service"}
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            }
            items={[
              {
                id: "",
                label: "Select service",
                onClick: () => setServiceCode("" as ServiceCode),
              },
              ...Object.entries(serviceLabels).map(([code, label]) => ({
                id: code,
                label: label,
                onClick: () => setServiceCode(code as ServiceCode),
              })),
            ]}
          />
        </div>

        {/* Dynamic Service Form */}
        {serviceCode && (
          <div className="border-t pt-6">{renderServiceForm()}</div>
        )}

        {/* Submit Button */}
        {serviceCode && (
          <div className="flex justify-end pt-4 border-t">
            <Button
              onClick={handleSubmit}
              disabled={!isFormValid() || submitting}
              className="min-w-[140px]"
            >
              {submitting ? "Submitting..." : "Submit Request"}
            </Button>
          </div>
        )}
      </DashboardCard>
    </section>
  );
}
