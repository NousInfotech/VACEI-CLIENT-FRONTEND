"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Dropdown from "@/components/Dropdown";
import { ChevronDown } from "lucide-react";

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
  registerNumber:string;
  period: string;
  deadline:string;
  startDate:string;
  documents: File[];
  notes: string;
  requiredDocs: Record<string, boolean>;
};

type RequestBookFormState = {
  accountingMethod?: string;
  monthlyTransactions?: string;
  missingDocuments:string;
  Bnotes:string
};

type RequestVatFormState = {
  VatService?: string;
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
    registerNumber:"",
    period: "",
    deadline:"",
    startDate:"",
    documents: [],
    notes: "",
    requiredDocs: {},
  });

  const [Bform, setBookForm] = useState<RequestBookFormState>({
    accountingMethod:"",
    monthlyTransactions:"",
    missingDocuments:"",
    Bnotes:""
  })

  const [Vform, setVatForm] = useState<RequestVatFormState>({
    VatService:"",
   
  })

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
      registerNumber:"",
      period: "",
      deadline:"",
      startDate:"",
      documents: [],
      notes: "",
      requiredDocs: {},
    });
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const isFormValid =
  form.serviceCode &&
  form.companyName.trim() &&
  form.registerNumber.trim() &&
  form.period.trim() &&
  form.startDate;

const [showSuccess, setShowSuccess] = useState(false);

const handleSubmit = (e: React.MouseEvent) => {
  e.preventDefault();

  if (!isFormValid) {
    alert("Please fill all required fields before submitting.");
    return;
  }

  const jsonData = {
    ...form,
    requiredDocs: Object.keys(form.requiredDocs).filter(
      (k) => form.requiredDocs[k]
    ),
    documents: form.documents.map((f) => ({
      name: f.name,
      size: f.size,
      type: f.type,
    })),

    bookkeeping:
      form.serviceCode === "bookkeeping"
        ? {
            accountingMethod: Bform.accountingMethod,
            missingDocuments: Bform.missingDocuments,
            notes: Bform.Bnotes,
          }
        : null,

    vat:
      form.serviceCode === "vat"
      ? {
        VatService:Vform.VatService
      }
      :null
  };

  

  console.log("✅ Submitted JSON:", jsonData);
  setShowSuccess(true);
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
          <Button className="rounded-lg text-xs shadow-sm hover:shadow-md transition-shadow text-primary-foreground" onClick={handleSubmit} disabled={!isFormValid}>
            Submit request
          </Button>
        </div>
      </div>
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
              <label className="text-sm font-semibold text-brand-body">Company Name</label>
              <Input
                placeholder="e.g., Acme Ltd"
                value={form.companyName}
                onChange={(e) => setForm((f) => ({ ...f, companyName: e.target.value }))}
                className="shadow-sm"
              />
            </div>
          </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-brand-body space-y-">Company registration number</label>
              <Input
                placeholder="e.g., ACME-001002019-PVT"
                value={form.registerNumber}
                onChange={(e) => setForm((f) => ({ ...f, registerNumber: e.target.value }))}
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
          </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-brand-body">Are there any statutory or regulatory deadlines ?</label>
              <Input
                placeholder="e.g.,  May 2025"
                value={form.deadline}
                onChange={(e) => setForm((f) => ({ ...f, deadline: e.target.value }))}
                className="shadow-sm"
              />
          </div>
    <div className="space-y-2">
  <label className="text-sm font-semibold text-brand-body">When do you need this service to start?</label>
  <div className="flex flex-wrap gap-8">
    {[
      "Immediately",
      "Within 1 month",
      "Within 3 months",
      "Not sure",
    ].map((option) => (
      <label
        key={option}
        className="flex items-center gap-2 text-sm cursor-pointer"
      >
        <input
          type="radio"
          name="startDate"
          value={option}
          checked={form.startDate === option}
          onChange={(e) =>
            setForm((prev) => ({
              ...prev,
              startDate: e.target.value,
            }))
            }
            className="h-4 w-4 accent-green-600"
          />
          {option}
        </label>
      ))}
    </div>
  </div>
 <div className="space-y-3">
  <label className="text-sm font-semibold text-brand-body">
    Upload relevant documents
  </label>

  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:border-green-600 transition">
    <span className="text-sm text-gray-500">
      Click or drag documents to upload
    </span>

    <input
      type="file"
      multiple
      className="hidden"
      onChange={(e) =>
        setForm((prev) => ({
          ...prev,
          documents: Array.from(e.target.files || []),
        }))
      }
    />
  </label>

  {form.documents.length > 0 && (
    <ul className="flex flex text-xs text-gray-600">
      {form.documents.map((file, i) => (
        <li key={i}>📎 {file.name}</li>
      ))}
    </ul>
  )}
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

{/* Bookkeping */}
  {form.serviceCode === "bookkeeping" && (
  <div className="bg-card rounded-card shadow-md p-6 space-y-5">
    <h3 className="text-base font-semibold text-brand-body">
      Bookkeeping Details
    </h3>

    {/* What do you need */}
    <div className="space-y-2">
      <label className="text-sm font-semibold text-brand-body">
        What do you need?
      </label>

      <div className="flex flex-wrap gap-8">
        {[
          "Start Bookkeeping",
          "Catch-up / backlog",
          "Review / Correction",
          "Monthly extension",
          "Others",
        ].map((option) => (
          <label key={option} className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="bkType"
              value={option}
              checked={Bform.accountingMethod === option}
              onChange={(e) =>
                setBookForm((prev) => ({
                  ...prev,
                  accountingMethod: e.target.value,
                }))
              }
              className="h-4 w-4 accent-green-600"
            />
            {option}
          </label>
        ))}
      </div>
    </div>

    {/* Missing documents */}
    <div className="space-y-2">
      <label className="text-sm font-semibold text-brand-body">
        Do you have missing documents?
      </label>

      <div className="flex flex-wrap gap-8">
        {["Yes", "No", "Not sure"].map((option) => (
          <label key={option} className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="missingDocs"
              value={option}
              checked={Bform.missingDocuments === option}
              onChange={(e) =>
                setBookForm((prev) => ({
                  ...prev,
                  missingDocuments: e.target.value,
                }))
              }
              className="h-4 w-4 accent-green-600"
            />
            {option}
          </label>
        ))}
      </div>
    </div>

    {/* Bookkeeping Notes */}
    <div className="space-y-2">
      <label className="text-sm font-semibold text-brand-body">
        Additional bookkeeping details
      </label>
      <Textarea
        rows={4}
        value={Bform.Bnotes}
        onChange={(e) =>
          setBookForm((prev) => ({
            ...prev,
            Bnotes: e.target.value,
          }))
        }
        placeholder="Any special instructions or context"
      />
    </div>
  </div>
)}
{/* VAT */}
  {form.serviceCode === "vat" && (
  <div className="bg-card rounded-card shadow-md p-6 space-y-5">
    <h3 className="text-base font-semibold text-brand-body">
      VAT & TAX Details
    </h3>

    {/* What do you need */}
    <div className="space-y-2">
      <label className="text-sm font-semibold text-brand-body">
        Type of VAT service
      </label>
      <div className="flex flex-wrap gap-8">
        {[
          "VAT Return",
          "VAT Review",
          "VAT Correction",
          "VAT Registration",
          "VAT Deregistration",
          "Others",
        ].map((option) => (
          <label key={option} className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="bkType"
              value={option}
              checked={Vform.VatService === option}
              onChange={(e) =>
                setVatForm((prev) => ({
                  ...prev,
                  VatService: e.target.value
                  ,
                }))
              }
              className="h-4 w-4 accent-green-600"
            />
            {option}
          </label>
        ))}
      </div>
    </div>
  </div>
)}
    </section>
  );
}


