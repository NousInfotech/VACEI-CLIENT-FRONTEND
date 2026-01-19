"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Dropdown from "@/components/Dropdown";
import { ChevronDown, Upload, FileText, X } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import DashboardCard from "@/components/DashboardCard";

type ServiceCode =
  | "bookkeeping"
  | "vat"
  | "payroll"
  | "audit"
  | "csp_mbr"
  | "legal"
  | "projects"
  | "technology";

const STORAGE_KEY = "vacei-service-request-draft";

const serviceLabels: Record<ServiceCode, string> = {
  bookkeeping: "Bookkeeping",
  vat: "VAT & Tax",
  payroll: "Payroll",
  audit: "Audit",
  csp_mbr: "CSP / MBR",
  legal: "Legal",
  projects: "Projects / Transactions",
  technology: "Technology"
};

export default function ServiceRequestPage() {
  const [serviceCode, setServiceCode] = useState<ServiceCode | "">("");
  const [documents, setDocuments] = useState<File[]>([]);
  const [notes, setNotes] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Hydrate from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const saved = JSON.parse(raw);
        setServiceCode(saved.serviceCode || "");
        setNotes(saved.notes || "");
      } catch {
        /* ignore */
      }
    }
  }, []);

  // Persist to localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ serviceCode, notes })
    );
  }, [serviceCode, notes]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setDocuments([...documents, ...files]);
  };

  const removeFile = (index: number) => {
    setDocuments(documents.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setServiceCode("");
    setDocuments([]);
    setNotes("");
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const isFormValid = serviceCode && documents.length > 0;

const handleSubmit = (e: React.MouseEvent) => {
  e.preventDefault();

  if (!isFormValid) {
      alert("Please select a service and upload at least one file.");
    return;
  }

    setSubmitting(true);

  const jsonData = {
      serviceCode,
      documents: documents.map((f) => ({
      name: f.name,
      size: f.size,
      type: f.type,
    })),
      notes: notes || undefined,
    };

  console.log("✅ Submitted JSON:", jsonData);

    // Simulate API call
    setTimeout(() => {
      setSubmitting(false);
  setShowSuccess(true);
    }, 1000);
};

  return (
    <section className="mx-auto max-w-[1000px] w-full pt-5 space-y-6">
      <PageHeader
        title="Request a Service"
        subtitle="Select the service, upload related files, and add optional notes. Drafts are saved locally."
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
              disabled={!isFormValid || submitting}
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

        {/* File Upload Section */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-brand-body">
            Upload Files <span className="text-destructive">*</span>
            </label>
          <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary transition-colors bg-muted/20">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-10 h-10 mb-3 text-muted-foreground" />
              <p className="mb-2 text-sm text-muted-foreground">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
      <p className="text-xs text-muted-foreground">
                Upload files related to this service
      </p>
    </div>
      <Input
          type="file"
          multiple
          className="hidden"
              onChange={handleFileUpload}
        />
      </label>

          {documents.length > 0 && (
            <div className="mt-4 space-y-2">
              {documents.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className="text-sm text-brand-body truncate">
                      {file.name}
                    </span>
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
    <div className="space-y-2">
      <label className="text-sm font-semibold text-brand-body">
            Optional Notes
      </label>
          <Textarea
            rows={5}
            placeholder="Add any additional notes or context (optional)..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="shadow-sm"
          />
          <p className="text-xs text-muted-foreground">
            You can add any additional information or context if needed.
          </p>
    </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4 border-t">
          <Button
            onClick={handleSubmit}
            disabled={!isFormValid || submitting}
            className="min-w-[140px]"
          >
            {submitting ? "Submitting..." : "Submit Request"}
          </Button>
    </div>
      </DashboardCard>
  </section>
  );
}
