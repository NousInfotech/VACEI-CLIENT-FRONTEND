"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Dropdown from "@/components/Dropdown";
import { AlertModal } from "@/components/ui/modal";
import { ChevronDown, CheckCircle2 } from "lucide-react";
import { addCSPService } from "@/lib/cspStorage";

type ServiceCode =
  | "bookkeeping"
  | "vat"
  | "payroll"
  | "audit"
  | "csp_mbr"
  | "legal"
  | "projects";

type RequestFormState = {
  serviceCode: ServiceCode | "";
  companyName: string;
  period: string;
  notes: string;
  requiredDocs: Record<string, boolean>;
};

const STORAGE_KEY = "vacei-service-request-draft";

const serviceLabels: Record<ServiceCode, string> = {
  bookkeeping: "Bookkeeping",
  vat: "VAT & Tax",
  payroll: "Payroll",
  audit: "Audit",
  csp_mbr: "CSP / MBR",
  legal: "Legal",
  projects: "Projects / Transactions",
};

const serviceDocs: Record<ServiceCode, string[]> = {
  bookkeeping: ["Bank statements", "Card statements", "Invoices (sales & purchases)"],
  vat: ["Sales invoices", "Purchase invoices", "VAT registration details"],
  payroll: ["Employee list", "Contracts", "Previous payroll reports"],
  audit: ["Engagement letter", "Trial balance", "Key contracts"],
  csp_mbr: ["Company M&As / register", "Director/Shareholder IDs", "Latest filings"],
  legal: ["Draft agreements", "Supporting correspondence"],
  projects: ["Project brief", "Milestones", "Data room docs"],
};

export default function ServiceRequestPage() {
  const [form, setForm] = useState<RequestFormState>({
    serviceCode: "",
    companyName: "",
    period: "",
    notes: "",
    requiredDocs: {},
  });
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // hydrate from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        setForm(JSON.parse(raw));
      } catch {
        /* ignore */
      }
    }
  }, []);

  // persist to localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
  }, [form]);

  const docList = useMemo(() => {
    if (!form.serviceCode) return [];
    return serviceDocs[form.serviceCode];
  }, [form.serviceCode]);

  const toggleDoc = (name: string) => {
    setForm((f) => ({
      ...f,
      requiredDocs: { ...f.requiredDocs, [name]: !f.requiredDocs[name] },
    }));
  };

  const resetForm = () => {
    setForm({
      serviceCode: "",
      companyName: "",
      period: "",
      notes: "",
      requiredDocs: {},
    });
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const handleSubmit = () => {
    if (!form.serviceCode) {
      setErrorMessage("Please select a service.");
      setShowErrorModal(true);
      return;
    }

    if (!form.companyName.trim()) {
      setErrorMessage("Please enter a company name.");
      setShowErrorModal(true);
      return;
    }

    try {
      // Get active company ID
      const activeCompanyId = localStorage.getItem("vacei-active-company");
      if (!activeCompanyId) {
        setErrorMessage("No active company found. Please select a company first.");
        setShowErrorModal(true);
        return;
      }

      // Save service request to localStorage
      const requestKey = `vacei-service-requests-${activeCompanyId}`;
      const existingRequests = JSON.parse(localStorage.getItem(requestKey) || "[]");
      const newRequest = {
        id: `req-${Date.now()}`,
        ...form,
        submittedAt: new Date().toISOString(),
        status: "pending"
      };
      existingRequests.push(newRequest);
      localStorage.setItem(requestKey, JSON.stringify(existingRequests));

      // If it's a CSP service, add it as a new service
      if (form.serviceCode === "csp_mbr") {
        const cspServiceType = form.notes.toLowerCase().includes("registered office") ? "registered_office" :
                               form.notes.toLowerCase().includes("secretary") ? "company_secretary" :
                               form.notes.toLowerCase().includes("director") ? "director_services" :
                               "ubo_maintenance";
        
        const serviceName = form.notes.split("\n")[0] || "CSP Service";
        
        addCSPService({
          company_id: activeCompanyId,
          service_type: cspServiceType,
          service_name: serviceName,
          start_date: "",
          expiry_date: "",
          renewal_cycle: "annual",
          renewal_price: 0,
          auto_renew: false,
          assigned_party: "",
          description: form.notes || "Service requested by client"
        }, activeCompanyId);
      }

      // Clear form
      resetForm();
      
      // Show success modal
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Error submitting request:", error);
      setErrorMessage("Failed to submit request. Please try again.");
      setShowErrorModal(true);
    }
  };

  return (
    <section className="mx-auto max-w-[1200px] w-full pt-5 space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-brand-body">
            Request a Service
          </h1>
          <p className="text-sm text-muted-foreground">
            Select the service, confirm required documents, and share details.
            Drafts are saved locally.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={resetForm} className="rounded-lg text-xs shadow-sm hover:shadow-md transition-shadow">
            Clear draft
          </Button>
          <Button className="rounded-lg text-xs shadow-sm hover:shadow-md transition-shadow text-primary-foreground" onClick={handleSubmit}>
            Submit request
          </Button>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-[2fr,1fr]">
        <div className="bg-card border border-border rounded-card shadow-md p-6 space-y-5">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-brand-body">Service</label>
              <Dropdown
                className="w-full"
                trigger={
                  <Button variant="outline" className="w-full h-9 justify-between">
                    {form.serviceCode ? serviceLabels[form.serviceCode as ServiceCode] || "Select service" : "Select service"}
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                }
                items={[
                  { id: "", label: "Select service", onClick: () => setForm((f) => ({ ...f, serviceCode: "" as ServiceCode, requiredDocs: {} })) },
                  ...Object.entries(serviceLabels).map(([code, label]) => ({
                    id: code,
                    label: label,
                    onClick: () => setForm((f) => ({ ...f, serviceCode: code as ServiceCode, requiredDocs: {} }))
                  }))
                ]}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-brand-body">Company</label>
              <Input
                placeholder="e.g., Acme Ltd"
                value={form.companyName}
                onChange={(e) => setForm((f) => ({ ...f, companyName: e.target.value }))}
                className="shadow-sm"
              />
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-brand-body">Period / Range</label>
              <Input
                placeholder="e.g., Q2 2025 or Mar 2025"
                value={form.period}
                onChange={(e) => setForm((f) => ({ ...f, period: e.target.value }))}
                className="shadow-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-brand-body">Notes</label>
            <Textarea
              rows={5}
              placeholder="Share context, deadlines, or special instructions"
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              className="shadow-sm"
            />
          </div>
        </div>

        <div className="bg-card border border-border rounded-card shadow-md p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-brand-body">Required documents</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Mark items as ready; upload via Documents after submission.
              </p>
            </div>
          </div>

          {form.serviceCode ? (
            <div className="space-y-3 text-sm">
              {docList.map((doc) => (
                <label
                  key={doc}
                  className="flex items-center justify-between gap-2 rounded-lg border border-border bg-muted/30 px-4 py-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                >
                  <span className="text-brand-body font-medium">{doc}</span>
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-border"
                    checked={!!form.requiredDocs[doc]}
                    onChange={() => toggleDoc(doc)}
                  />
                </label>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Select a service to see its required documents.
            </p>
          )}

          <div className="text-xs text-muted-foreground">
            Tip: After submitting, upload the documents in <b>Documents → Upload</b> and tag with
            the same service/period.
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <AlertModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Request Submitted"
        message="Your service request has been submitted successfully. Our team will review it and get back to you soon."
        type="success"
        confirmText="OK"
      />

      {/* Error Modal */}
      <AlertModal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title="Error"
        message={errorMessage}
        type="error"
        confirmText="OK"
      />
    </section>
  );
}


