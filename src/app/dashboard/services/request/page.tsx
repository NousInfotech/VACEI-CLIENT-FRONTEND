"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";

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
    alert("This is a UI-only intake form. Wire to backend when ready.");
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
              <Select
                value={form.serviceCode}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    serviceCode: e.target.value as ServiceCode,
                    requiredDocs: {},
                  }))
                }
                className="w-full"
              >
                <option value="">Select service</option>
                {Object.entries(serviceLabels).map(([code, label]) => (
                  <option key={code} value={code}>
                    {label}
                  </option>
                ))}
              </Select>
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
    </section>
  );
}


