"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Dropdown from "@/components/Dropdown";
import { ChevronDown } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";

type ServiceCode =
  | "bookkeeping"
  | "vat"
  | "payroll"
  | "audit"
  | "csp_mbr"
  | "legal"
  | "projects"
  | "technology"

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
 VatService: string,
  otherVatService: string,
  correctionPeriod: string,
  reviewReason: string,
  reviewOtherReason: string,
  registrationDate: string,
  vatNumber:string,
  country:string,
  additionalNotes: string,
};

type RequestPayrollState = {
  payrollService:string,
  otherService:string,
  employeeCount:string,
  correctionPeriod:string,
  startMonth:string,
  country: string,
  payrollStatus: string,
  additionalNotes:string,
}

type RequestAuditState = {
  auditType: string,
  financialYear: string,
  auditDeadline: string,
  firstAudit: string,
  auditPurpose: string,
  otherPurpose: string,
  additionalNotes: string,
}

type RequestLegalState = {
  requestType: string;               
  otherRequest: string;
  transferPercentage: string;
  urgent: string;
  shareNotes:string,
  contractType: string;
  contractNotes: string;
  companyChanges: Record<string, boolean>;
  otherCompanyChange: string;
  complianceIssue: string;
  additionalDetails: string;
};

type RequestProjectState = {
  description: string;          
  deadline: string;             
  additionalContext: string; 
  documents: File[];            
};

type RequestMSlState = {
  requestType: string;
  otherRequest: string;
  incorporationCountry: string;
  timeline: "ASAP" | "Flexible" | "";
  formationNotes: string;
  directorChanges: Record<string, boolean>;
  directorNotes: string;
  shareholderChanges: Record<string, boolean>;
  shareholderNotes: string;
  transferPercentage: string;
  urgent: "Yes" | "No" | "";
  transferNotes: string;
  registeredOfficeType: string;
  liquidationType: string;
  additionalDetails: string;
};

type RequestTechState = {
  techType: "AI" | "Web Development" | "";
  dueDate:string
  additionalDetails:string
}


const STORAGE_KEY = "vacei-service-request-draft";

const serviceLabels: Record<ServiceCode, string> = {
  bookkeeping: "Bookkeeping",
  vat: "VAT & Tax",
  payroll: "Payroll",
  audit: "Audit",
  csp_mbr: "CSP / MBR",
  legal: "Legal",
  projects: "Projects / Transactions",
  technology : "Technology"
};

const serviceDocs: Record<ServiceCode, string[]> = {
  bookkeeping: ["Bank statements", "Card statements", "Invoices (sales & purchases)"],
  vat: ["Sales invoices", "Purchase invoices", "VAT registration details"],
  payroll: ["Employee list", "Contracts", "Previous payroll reports"],
  audit: ["Engagement letter", "Trial balance", "Key contracts"],
  csp_mbr: ["Company M&As / register", "Director/Shareholder IDs", "Latest filings"],
  legal: ["Draft agreements", "Supporting correspondence"],
  projects: ["Project brief", "Milestones", "Data room docs"],
  technology: ["Milestones", "Contracts"],
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
  VatService: "",
  otherVatService: "",
  correctionPeriod: "",
  reviewReason: "",
  reviewOtherReason: "",
  registrationDate: "",
  vatNumber: "Auto-filled",
  country: "Auto-filled",
  additionalNotes: "",
});

  const [Pform, setPayrollForm] = useState<RequestPayrollState>({
  payrollService: "",
  otherService: "",
  employeeCount: "",
  correctionPeriod: "",
  startMonth: "",
  country: "Auto-filled",
  payrollStatus: "Not set up",
  additionalNotes: "",
});

const [Aform, setAuditForm] = useState<RequestAuditState>({
  auditType: "",
  financialYear: "",
  auditDeadline: "",
  firstAudit: "",
  auditPurpose: "",
  otherPurpose: "",
  additionalNotes: "",
});

const [Lform, setLegalForm] = useState<RequestLegalState>({
  requestType: "",
  otherRequest: "",
  transferPercentage: "",
  urgent: "",
  shareNotes: "",
  contractType: "",
  contractNotes: "",  companyChanges: {} as Record<string, boolean>,
  otherCompanyChange: "",
  complianceIssue: "",
  additionalDetails: "",
});

const [Pjform, setProjectForm] = useState<RequestProjectState>({
  description: "",
  deadline: "",
  additionalContext: "",
  documents: [],
});

const [Cform, setMslForm] = useState<RequestMSlState>({
  requestType: "",
  otherRequest: "",
  incorporationCountry: "",
  timeline: "",
  formationNotes: "",
  directorChanges: {},
  directorNotes: "",
  shareholderChanges: {},
  shareholderNotes: "",
  transferPercentage: "",
  urgent: "",
  transferNotes: "",
  registeredOfficeType: "",
  liquidationType: "",
  additionalDetails: "",
});

const [TechForm, setTechForm] = useState<RequestTechState>({
  techType:"",
  dueDate:"",
  additionalDetails:""
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
       ...Vform
      }
      :null,

    payroll:
      form.serviceCode === "payroll"
      ?{
        ...Pform
      }
      :null,

     audit:
     form.serviceCode === "audit"
     ?{
      ...Aform
     }
     :null,
     legal:
      form.serviceCode === "legal"
      ?{
        ...Lform
      }
      :null,
       serviceDetails:
    form.serviceCode === "projects"
      ? {
          description: Pjform.description,
          deadline: Pjform.deadline,
          additionalContext: Pjform.additionalContext,
          documents: Pjform.documents.map((f) => ({
            name: f.name,
            size: f.size,
            type: f.type,
          })),
        }
      : undefined,
       corporateDetails:
    form.serviceCode === "csp_mbr" ? Cform : undefined,
  };
  console.log("✅ Submitted JSON:", jsonData);
  setShowSuccess(true);
};

  return (
    <section className="mx-auto max-w-[1200px] w-full pt-5 space-y-6">
      <PageHeader
        title="Request a Service"
        subtitle="Select the service, confirm required documents, and share details. Drafts are saved locally."
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
              disabled={!isFormValid}
            >
              Submit request
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
  <div className="bg-card rounded-card shadow-md p-6 space-y-6">
    <h3 className="text-base font-semibold text-brand-body">
      VAT & TAX Details
    </h3>
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
          "Other",
        ].map((option) => (
          <label key={option} className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="vatService"
              value={option}
              checked={Vform.VatService === option}
              onChange={(e) =>
                setVatForm((prev) => ({
                  ...prev,
                  VatService: e.target.value,
                  otherVatService: "",
                }))
              }
              className="h-4 w-4 accent-green-600"
            />
            {option}
          </label>
        ))}
      </div>
    </div>

    {/* If Other */}
    {Vform.VatService === "Other" && (
      <div className="space-y-2">
        <label className="text-sm font-semibold text-brand-body">
          Please specify
        </label>
        <Input
          placeholder="Describe VAT service"
          value={Vform.otherVatService}
          onChange={(e) =>
            setVatForm((prev) => ({
              ...prev,
              otherVatService: e.target.value,
            }))
          }
        />
      </div>
    )}

    {/* If VAT Correction */}
    {Vform.VatService === "VAT Correction" && (
      <div className="space-y-2">
        <label className="text-sm font-semibold text-brand-body">
          Which period needs correction?
        </label>
        <Input
          type="month"
          value={Vform.correctionPeriod}
          onChange={(e) =>
            setVatForm((prev) => ({
              ...prev,
              correctionPeriod: e.target.value,
            }))
          }
        />
      </div>
    )}

    {/* If VAT Review */}
    {Vform.VatService === "VAT Review" && (
      <>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-brand-body">
            Reason for review
          </label>

          <div className="flex flex-wrap gap-8">
            {[
              "Cross-border transactions",
              "Unusual amounts",
              "Audit preparation",
              "Other",
            ].map((reason) => (
              <label key={reason} className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="reviewReason"
                  value={reason}
                  checked={Vform.reviewReason === reason}
                  onChange={(e) =>
                    setVatForm((prev) => ({
                      ...prev,
                      reviewReason: e.target.value,
                      reviewOtherReason: "",
                    }))
                  }
                  className="h-4 w-4 accent-green-600"
                />
                {reason}
              </label>
            ))}
          </div>
        </div>

        {Vform.reviewReason === "Other" && (
          <div className="space-y-2">
            <label className="text-sm font-semibold text-brand-body">
              Please specify
            </label>
            <Input
              placeholder="Specify review reason"
              value={Vform.reviewOtherReason}
              onChange={(e) =>
                setVatForm((prev) => ({
                  ...prev,
                  reviewOtherReason: e.target.value,
                }))
              }
            />
          </div>
        )}
      </>
    )}

    {/* If VAT Registration */}
    {Vform.VatService === "VAT Registration" && (
      <div className="space-y-2">
        <label className="text-sm font-semibold text-brand-body">
          Effective date (optional)
        </label>
        <Input
          type="date"
          value={Vform.registrationDate}
          onChange={(e) =>
            setVatForm((prev) => ({
              ...prev,
              registrationDate: e.target.value,
            }))
          }
        />
      </div>
    )}

    {/* Auto-filled */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="text-sm font-semibold text-brand-body">
          VAT number
        </label>
        <Input value={Vform.vatNumber} disabled />
      </div>

      <div>
        <label className="text-sm font-semibold text-brand-body">
          Country / Jurisdiction
        </label>
        <Input value={Vform.country} disabled />
      </div>
    </div>

    {/* Additional notes */}
    <div className="space-y-2">
      <label className="text-sm font-semibold text-brand-body">
        Additional VAT / tax details
      </label>
      <Textarea
        rows={4}
        placeholder="Describe issue, transaction volume, or background"
        value={Vform.additionalNotes}
        onChange={(e) =>
          setVatForm((prev) => ({
            ...prev,
            additionalNotes: e.target.value,
          }))
        }
      />
      <p className="text-xs text-muted-foreground">
        You may describe the issue, transaction volume, or any relevant background.
      </p>
    </div>
  </div>
)}
{form.serviceCode === "payroll" && (
  <div className="bg-card rounded-card shadow-md p-6 space-y-6">
    <h3 className="text-base font-semibold text-brand-body">
      Payroll Details
    </h3>

    {/* What do you need */}
    <div className="space-y-2">
      <label className="text-sm font-semibold text-brand-body">
        What do you need?
      </label>

      <div className="flex flex-wrap gap-8">
        {[
          "Start payroll",
          "Add or remove employees",
          "Payroll review",
          "Payroll correction",
          "Other",
        ].map((option) => (
          <label key={option} className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="payrollService"
              value={option}
              checked={Pform.payrollService === option}
              onChange={(e) =>
                setPayrollForm((prev) => ({
                  ...prev,
                  payrollService: e.target.value,
                  otherService: "",
                  employeeCount: "",
                  correctionPeriod: "",
                  startMonth: "",
                }))
              }
              className="h-4 w-4 accent-green-600"
            />
            {option}
          </label>
        ))}
      </div>
    </div>

    {/* If Other */}
    {Pform.payrollService === "Other" && (
      <div className="space-y-2">
        <label className="text-sm font-semibold text-brand-body">
          Please specify
        </label>
        <Input
          placeholder="Describe payroll request"
          value={Pform.otherService}
          onChange={(e) =>
            setPayrollForm((prev) => ({
              ...prev,
              otherService: e.target.value,
            }))
          }
        />
      </div>
    )}

    {Pform.payrollService === "Add or remove employees" && (
      <>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-brand-body">
            Number of employees affected
          </label>
          <Input
            type="number"
            placeholder="e.g. 3"
            value={Pform.employeeCount}
            onChange={(e) =>
              setPayrollForm((prev) => ({
                ...prev,
                employeeCount: e.target.value,
              }))
            }
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-brand-body">
            Optional clarification
          </label>
          <Textarea
            rows={3}
            placeholder="Add details if needed"
            value={Pform.additionalNotes}
            onChange={(e) =>
              setPayrollForm((prev) => ({
                ...prev,
                additionalNotes: e.target.value,
              }))
            }
          />
        </div>
      </>
    )}

    {/* If Payroll correction */}
    {Pform.payrollService === "Payroll correction" && (
      <div className="space-y-2">
        <label className="text-sm font-semibold text-brand-body">
          Which payroll period needs correction?
        </label>
        <Input
          type="month"
          value={Pform.correctionPeriod}
          onChange={(e) =>
            setPayrollForm((prev) => ({
              ...prev,
              correctionPeriod: e.target.value,
            }))
          }
        />
      </div>
    )}

    {Pform.payrollService === "Start payroll" && (
      <div className="space-y-2">
        <label className="text-sm font-semibold text-brand-body">
          Expected start month
        </label>
        <Input
          type="month"
          value={Pform.startMonth}
          onChange={(e) =>
            setPayrollForm((prev) => ({
              ...prev,
              startMonth: e.target.value,
            }))
          }
        />
      </div>
    )}

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="text-sm font-semibold text-brand-body">
          Country / jurisdiction
        </label>
        <Input value={Pform.country} disabled />
      </div>

      <div>
        <label className="text-sm font-semibold text-brand-body">
          Existing payroll status
        </label>
        <Input value={Pform.payrollStatus} disabled />
      </div>
    </div>

    {/* Additional details */}
    <div className="space-y-2">
      <label className="text-sm font-semibold text-brand-body">
        Additional details related to payroll
      </label>
      <Textarea
        rows={4}
        placeholder="Include pay frequency, benefits, allowances, or known issues"
        value={Pform.additionalNotes}
        onChange={(e) =>
          setPayrollForm((prev) => ({
            ...prev,
            additionalNotes: e.target.value,
          }))
        }
      />
      <p className="text-xs text-muted-foreground">
        You may include information about pay frequency, special allowances,
        benefits, or known payroll issues.
      </p>
    </div>
  </div>
)}

{form.serviceCode === "audit" && (
  <div className="bg-card rounded-card shadow-md p-6 space-y-6">
    <h3 className="text-base font-semibold text-brand-body">
      Audit & Annual Accounts Details
    </h3>

    {/* Type of audit service */}
    <div className="space-y-2">
      <label className="text-sm font-semibold text-brand-body">
        Type of audit service
      </label>

      <div className="flex flex-wrap gap-8">
        {[
          "Statutory audit of annual accounts",
          "Audit-ready financial statements",
        ].map((option) => (
          <label key={option} className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="auditType"
              value={option}
              checked={Aform.auditType === option}
              onChange={(e) =>
                setAuditForm((prev) => ({
                  ...prev,
                  auditType: e.target.value,
                  financialYear: "",
                  auditDeadline: "",
                  firstAudit: "",
                  auditPurpose: "",
                  otherPurpose: "",
                }))
              }
              className="h-4 w-4 accent-green-600"
            />
            {option}
          </label>
        ))}
      </div>
    </div>

    {/* If Statutory audit */}
    {Aform.auditType === "Statutory audit of annual accounts" && (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-brand-body">
              Financial year
            </label>
            <Input
              type="number"
              placeholder="e.g. 2024"
              value={Aform.financialYear}
              onChange={(e) =>
                setAuditForm((prev) => ({
                  ...prev,
                  financialYear: e.target.value,
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-brand-body">
              Audit deadline (if known)
            </label>
            <Input
              type="date"
              value={Aform.auditDeadline}
              onChange={(e) =>
                setAuditForm((prev) => ({
                  ...prev,
                  auditDeadline: e.target.value,
                }))
              }
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-brand-body">
            Is this the first statutory audit for this entity?
          </label>
          <div className="flex gap-8">
            {["Yes", "No", "Not sure"].map((option) => (
              <label key={option} className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="firstAudit"
                  value={option}
                  checked={Aform.firstAudit === option}
                  onChange={(e) =>
                    setAuditForm((prev) => ({
                      ...prev,
                      firstAudit: e.target.value,
                    }))
                  }
                  className="h-4 w-4 accent-green-600"
                />
                {option}
              </label>
            ))}
          </div>
        </div>
      </>
    )}

    {Aform.auditType === "Audit-ready financial statements" && (
      <>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-brand-body">
            Purpose of the audit-ready financial statements
          </label>

          <div className="flex flex-wrap gap-8">
            {[
              "Statutory audit",
              "Bank or investor requirement",
              "Regulatory submission",
              "Other",
            ].map((option) => (
              <label key={option} className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="auditPurpose"
                  value={option}
                  checked={Aform.auditPurpose === option}
                  onChange={(e) =>
                    setAuditForm((prev) => ({
                      ...prev,
                      auditPurpose: e.target.value,
                      otherPurpose: "",
                    }))
                  }
                  className="h-4 w-4 accent-green-600"
                />
                {option}
              </label>
            ))}
          </div>
        </div>
        {Aform.auditPurpose === "Other" && (
          <div className="space-y-2">
            <label className="text-sm font-semibold text-brand-body">
              Please specify
            </label>
            <Input
              placeholder="Specify purpose"
              value={Aform.otherPurpose}
              onChange={(e) =>
                setAuditForm((prev) => ({
                  ...prev,
                  otherPurpose: e.target.value,
                }))
              }
            />
          </div>
        )}
      </>
    )}
    <div className="space-y-2">
      <label className="text-sm font-semibold text-brand-body">
        Additional details related to the annual accounts or financial statements
      </label>
      <Textarea
        rows={4}
        placeholder="Describe reporting framework, group structure, or known issues"
        value={Aform.additionalNotes}
        onChange={(e) =>
          setAuditForm((prev) => ({
            ...prev,
            additionalNotes: e.target.value,
          }))
        }
      />
      <p className="text-xs text-muted-foreground">
        You may mention reporting framework, group structure, or known issues from
        prior years.
      </p>
    </div>
  </div>
)}
{form.serviceCode === "legal" && (
  <div className="bg-card rounded-card shadow-md p-6 space-y-6">
    <div className="space-y-1">
      <h3 className="text-base font-semibold text-brand-body">
        Legal & Financial Compliance Details
      </h3>
      <p className="text-xs text-muted-foreground">
        Request legal and compliance-related support connected to corporate,
        financial, and regulatory matters. This does not cover litigation or
        personal legal advice.
      </p>
    </div>

    {/* Type of request */}
    <div className="space-y-2">
      <label className="text-sm font-semibold text-brand-body">
        Type of request
      </label>

      <div className="flex flex-wrap gap-8">
        {[
          "Contract review",
          "Share transfer",
          "Company changes",
          "Legal & Financial Compliance Advice",
          "Other",
        ].map((option) => (
          <label key={option} className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="legalType"
              value={option}
              checked={Lform.requestType === option}
              onChange={(e) =>
                setLegalForm((prev) => ({
                  ...prev,
                  requestType: e.target.value,
                  otherRequest: "",
                  companyChanges: {},
                }))
              }
              className="h-4 w-4 accent-green-600"
            />
            {option}
          </label>
        ))}
      </div>
    </div>
    {Lform.requestType === "Other" && (
      <div className="space-y-2">
        <label className="text-sm font-semibold text-brand-body">
          Please specify
        </label>
        <Input
          placeholder="Describe your request"
          value={Lform.otherRequest}
          onChange={(e) =>
            setLegalForm((prev) => ({
              ...prev,
              otherRequest: e.target.value,
            }))
          }
        />
      </div>
    )}
    {Lform.requestType === "Share transfer" && (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-brand-body">
              Estimated percentage being transferred
            </label>
            <Input
              type="number"
              placeholder="e.g. 25"
              value={Lform.transferPercentage}
              onChange={(e) =>
                setLegalForm((prev) => ({
                  ...prev,
                  transferPercentage: e.target.value,
                }))
              }
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-brand-body">
              Is this urgent?
            </label>
            <div className="flex gap-8">
              {["Yes", "No"].map((opt) => (
                <label key={opt} className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="urgent"
                    value={opt}
                    checked={Lform.urgent === opt}
                    onChange={(e) =>
                      setLegalForm((prev) => ({
                        ...prev,
                        urgent: e.target.value,
                      }))
                    }
                    className="h-4 w-4 accent-green-600"
                  />
                  {opt}
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-brand-body">
            Optional clarification
          </label>
          <Textarea
            rows={3}
            placeholder="Any additional context for the share transfer"
            value={Lform.shareNotes}
            onChange={(e) =>
              setLegalForm((prev) => ({
                ...prev,
                shareNotes: e.target.value,
              }))
            }
          />
        </div>
      </>
    )}

    {/* Contract review */}
    {Lform.requestType === "Contract review" && (
      <>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-brand-body">
            Type of contract
          </label>
          <Input
            placeholder="e.g. Shareholders agreement, Service contract"
            value={Lform.contractType}
            onChange={(e) =>
              setLegalForm((prev) => ({
                ...prev,
                contractType: e.target.value,
              }))
            }
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-brand-body">
            Optional clarification
          </label>
          <Textarea
            rows={3}
            placeholder="Any specific clauses or concerns"
            value={Lform.contractNotes}
            onChange={(e) =>
              setLegalForm((prev) => ({
                ...prev,
                contractNotes: e.target.value,
              }))
            }
          />
        </div>
      </>
    )}
    {Lform.requestType === "Company changes" && (
      <>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-brand-body">
            Type of change
          </label>

          <div className="space-y-3">
            {[
              "Director change",
              "Shareholder change",
              "Registered details update",
              "Other",
            ].map((change) => (
              <label
                key={change}
                className="flex items-center justify-between gap-2 rounded-lg border px-4 py-3 text-sm cursor-pointer"
              >
                <span>{change}</span>
                <input
                  type="checkbox"
                  checked={!!Lform.companyChanges[change]}
                  onChange={() =>
                    setLegalForm((prev) => ({
                      ...prev,
                      companyChanges: {
                        ...prev.companyChanges,
                        [change]: !prev.companyChanges[change],
                      },
                    }))
                  }
                  className="h-4 w-4"
                />
              </label>
            ))}
          </div>
        </div>
        {Lform.companyChanges["Other"] && (
          <div className="space-y-2">
            <label className="text-sm font-semibold text-brand-body">
              Please specify
            </label>
            <Input
              placeholder="Describe the company change"
              value={Lform.otherCompanyChange}
              onChange={(e) =>
                setLegalForm((prev) => ({
                  ...prev,
                  otherCompanyChange: e.target.value,
                }))
              }
            />
          </div>
        )}
      </>
    )}
    {Lform.requestType === "Legal & Financial Compliance Advice" && (
      <div className="space-y-2">
        <label className="text-sm font-semibold text-brand-body">
          Brief description of the issue
        </label>
        <Textarea
          rows={4}
          placeholder="Describe regulatory, corporate, or financial compliance matters"
          value={Lform.complianceIssue}
          onChange={(e) =>
            setLegalForm((prev) => ({
              ...prev,
              complianceIssue: e.target.value,
            }))
          }
        />
        <p className="text-xs text-muted-foreground">
          This may include regulatory, corporate, or financial compliance
          matters.
        </p>
      </div>
    )}
    <div className="space-y-2">
      <label className="text-sm font-semibold text-brand-body">
        Additional details
      </label>
      <Textarea
        rows={4}
        placeholder="Any further information"
        value={Lform.additionalDetails}
        onChange={(e) =>
          setLegalForm((prev) => ({
            ...prev,
            additionalDetails: e.target.value,
          }))
        }
      />
    </div>
  </div>
)}

{form.serviceCode === "projects" && (
  <div className="bg-card rounded-card shadow-md p-6 space-y-5">
    <h3 className="text-base font-semibold text-brand-body">
      One-off / Special Project Details
    </h3>
    <div className="space-y-2">
      <label className="text-sm font-semibold text-brand-body">
        Briefly describe what you need *
      </label>
      <Textarea
        rows={4}
        placeholder="Describe the nature of the request, your objective, and any background"
        value={Pjform.description}
        onChange={(e) =>
          setProjectForm((prev) => ({
            ...prev,
            description: e.target.value,
          }))
        }
      />
      <p className="text-xs text-muted-foreground">
        Please describe what you are trying to achieve and any relevant background.
      </p>
    </div>

    {/* Deadline (Optional) */}
    <div className="space-y-2">
      <label className="text-sm font-semibold text-brand-body">
        Is there a deadline?
      </label>
      <Input
        type="date"
        value={Pjform.deadline}
        onChange={(e) =>
          setProjectForm((prev) => ({
            ...prev,
            deadline: e.target.value,
          }))
        }
      />
    </div>

    {/* Additional context */}
    <div className="space-y-2">
      <label className="text-sm font-semibold text-brand-body">
        Any additional context or constraints?
      </label>
      <Textarea
        rows={3}
        placeholder="Optional details, constraints, dependencies, or expectations"
        value={Pjform.additionalContext}
        onChange={(e) =>
          setProjectForm((prev) => ({
            ...prev,
            additionalContext: e.target.value,
          }))
        }
      />
    </div>
    <div className="space-y-3">
      <label className="text-sm font-semibold text-brand-body">
        Upload supporting documents (optional)
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
            setProjectForm((prev) => ({
              ...prev,
              documents: Array.from(e.target.files || []),
            }))
          }
        />
      </label>
      {Pjform.documents.length > 0 && (
        <ul className="text-xs text-gray-600 space-y-1">
          {Pjform.documents.map((file, i) => (
            <li key={i}>📎 {file.name}</li>
          ))}
        </ul>
      )}
    </div>
  </div>
)}
{form.serviceCode === "csp_mbr" && (
  <div className="bg-card rounded-card shadow-md p-6 space-y-6">
    <h3 className="text-base font-semibold text-brand-body">
      Corporate Services Details
    </h3>

    {/* What do you need */}
    <div className="space-y-2">
      <label className="text-sm font-semibold text-brand-body">
        What do you need?
      </label>

      <div className="flex flex-wrap gap-8">
        {[
          "Company formation",
          "Director change",
          "Shareholder change",
          "Registered office",
          "Liquidation",
          "Share transfer support",
          "Other",
        ].map((option) => (
          <label key={option} className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="corpRequest"
              value={option}
              checked={Cform.requestType === option}
              onChange={(e) =>
                setMslForm((prev) => ({
                  ...prev,
                  requestType: e.target.value,
                }))
              }
              className="h-4 w-4 accent-green-600"
            />
            {option}
          </label>
        ))}
      </div>
    </div>

    {/* Other */}
    {Cform.requestType === "Other" && (
      <Input
        placeholder="Please specify"
        value={Cform.otherRequest}
        onChange={(e) =>
          setMslForm((p) => ({ ...p, otherRequest: e.target.value }))
        }
      />
    )}

    {/* Company formation */}
    {Cform.requestType === "Company formation" && (
      <div className="space-y-3">
         <label className="text-sm font-semibold text-brand-body">
        Country
      </label>
        <Input
          placeholder="Country of incorporation"
          value={Cform.incorporationCountry}
          onChange={(e) =>
            setMslForm((p) => ({
              ...p,
              incorporationCountry: e.target.value,
            }))
          }
        />
  <div className="space-y-2">
  <label className="text-sm font-semibold text-brand-body">
    Estimated timeline
  </label>

  <div className="flex gap-8">
    {["ASAP", "Flexible"].map((opt) => (
      <label
        key={opt}
        className="flex items-center gap-2 text-sm cursor-pointer"
      >
        <input
          type="radio"
          name="timeline"
          value={opt}
          checked={Cform.timeline === opt}
          onChange={(e) =>
            setMslForm((p) => ({
              ...p,
              timeline: e.target.value as "ASAP" | "Flexible",
            }))
          }
          className="h-4 w-4 accent-green-600"
        />
        {opt}
      </label>
    ))}
  </div>
</div>
      </div>
    )}

    {/* Director change */}
    {Cform.requestType === "Director change" && (
      <div className="space-y-3">
         <label className="text-sm font-semibold text-brand-body">
        Reason for Change
      </label>
        {["Appointment", "Resignation", "Both"].map((opt) => (
          <label key={opt} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={!!Cform.directorChanges[opt]}
              onChange={() =>
                setMslForm((p) => ({
                  ...p,
                  directorChanges: {
                    ...p.directorChanges,
                    [opt]: !p.directorChanges[opt],
                  },
                }))
              }
            />
            {opt}
          </label>
        ))}

      </div>
    )}
    {Cform.requestType === "Share transfer support" && (
      <div className="space-y-3">
         <label className="text-sm font-semibold text-brand-body">
        How much estimate transferred
      </label>
        <Input
          type="number"
          placeholder="Estimated % being transferred"
          value={Cform.transferPercentage}
          onChange={(e) =>
            setMslForm((p) => ({
              ...p,
              transferPercentage: e.target.value,
            }))
          }
        />
        <div className="space-y-2">
  {/* Question label */}
  <label className="text-sm font-semibold text-brand-body">
    Is this urgent?
  </label>

  {/* Options */}
  <div className="flex gap-8">
    {["Yes", "No"].map((opt) => (
      <label
        key={opt}
        className="flex items-center gap-2 text-sm cursor-pointer"
      >
        <input
          type="radio"
          name="urgent"
          value={opt}
          checked={Cform.urgent === opt}
          onChange={(e) =>
            setMslForm((p) => ({
              ...p,
              urgent: e.target.value as "Yes" | "No",
            }))
          }
          className="h-4 w-4 accent-green-600"
        />
        {opt}
      </label>
    ))}
  </div>
</div>
      </div>
    )}
     <label className="text-sm font-semibold text-brand-body">
        Additional Details
      </label>
    <Textarea
      placeholder="Additional details related to the corporate request"
      value={Cform.additionalDetails}
      onChange={(e) =>
        setMslForm((p) => ({
          ...p,
          additionalDetails: e.target.value,
        }))
      }
    />
  </div>
)}
  {form.serviceCode === "technology" && (
  <div className="bg-card rounded-card shadow-md p-6 space-y-6">
    <h3 className="text-base font-semibold text-brand-body">
      Technology Request Details
    </h3>

    {/* Technology */}
    <div className="space-y-2">
      <label className="text-sm font-semibold text-brand-body">
        Tech type
      </label>

      <div className="flex gap-8">
        {["AI", "Web Development"].map((tech) => (
          <label key={tech} className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="technology"
              value={tech}
              checked={TechForm.techType === tech}
              onChange={(e) =>
                setTechForm((p) => ({
                  ...p,
                  techType: e.target.value as "AI" | "Web Development",
                }))
              }
              className="h-4 w-4 accent-green-600"
            />
            {tech}
          </label>
        ))}
      </div>
    </div>
    <div className="space-y-2">
      <label className="text-sm font-semibold text-brand-body">
        Due date
      </label>
      <Input
        type="date"
        value={TechForm.dueDate}
        onChange={(e) =>
          setTechForm((p) => ({
            ...p,
            dueDate: e.target.value,
          }))
        }
      />
    </div>

    {/* Details */}
    <div className="space-y-2">
      <label className="text-sm font-semibold text-brand-body">
        Details
      </label>
      <Textarea
        placeholder="Describe the technology requirement in detail"
        value={TechForm.additionalDetails}
        onChange={(e) =>
          setTechForm((p) => ({
            ...p,
            details: e.target.value,
          }))
        }
      />
    </div>
  </div>
)}
  </section>
  );
}


