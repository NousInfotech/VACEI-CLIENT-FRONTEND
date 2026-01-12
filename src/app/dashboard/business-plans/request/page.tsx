"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import DashboardCard from "@/components/DashboardCard";
import { ArrowLeft, ArrowRight, CheckCircle2, Upload, X, FileText } from "lucide-react";

type BusinessPlanPurpose = "bank" | "grant" | "investor" | "internal" | "other";

interface RequestFormData {
  purpose: BusinessPlanPurpose | "";
  business_description: string;
  industry: string;
  target_market: string;
  expected_revenue_range: string;
  has_existing_financials: boolean | null;
  uploaded_files: File[];
}

export default function RequestBusinessPlanPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<RequestFormData>({
    purpose: "",
    business_description: "",
    industry: "",
    target_market: "",
    expected_revenue_range: "",
    has_existing_financials: null,
    uploaded_files: [],
  });

  const [submitting, setSubmitting] = useState(false);

  const purposes: { value: BusinessPlanPurpose; label: string }[] = [
    { value: "bank", label: "Bank financing" },
    { value: "grant", label: "Grant application" },
    { value: "investor", label: "Investor presentation" },
    { value: "internal", label: "Internal planning" },
    { value: "other", label: "Other" },
  ];

  const revenueRanges = [
    "Under €100K",
    "€100K - €500K",
    "€500K - €1M",
    "€1M - €5M",
    "€5M+",
  ];

  const handlePurposeSelect = (purpose: BusinessPlanPurpose) => {
    setFormData({ ...formData, purpose });
  };

  const handleInputChange = (field: keyof RequestFormData, value: string | boolean) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setFormData({
      ...formData,
      uploaded_files: [...formData.uploaded_files, ...files],
    });
  };

  const removeFile = (index: number) => {
    setFormData({
      ...formData,
      uploaded_files: formData.uploaded_files.filter((_, i) => i !== index),
    });
  };

  const canProceedToStep2 = () => {
    return formData.purpose !== "";
  };

  const canProceedToStep3 = () => {
    return (
      formData.business_description.trim() !== "" &&
      formData.industry.trim() !== "" &&
      formData.target_market.trim() !== "" &&
      formData.expected_revenue_range !== "" &&
      formData.has_existing_financials !== null
    );
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      // TODO: Replace with actual API call
      // await submitBusinessPlanRequest(formData);
      
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // Navigate to confirmation
      setStep(4);
    } catch (error) {
      console.error("Failed to submit request", error);
      alert("Failed to submit request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mx-auto max-w-[900px] w-full pt-5 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/business-plans">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-brand-body">Request Business Plan</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Step {step} of 4
          </p>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="flex items-center justify-between">
        {[1, 2, 3, 4].map((stepNum) => (
          <div key={stepNum} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                  step > stepNum
                    ? "bg-success border-success text-white"
                    : step === stepNum
                    ? "bg-primary border-primary text-white"
                    : "bg-card border-border text-muted-foreground"
                }`}
              >
                {step > stepNum ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <span className="font-semibold">{stepNum}</span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                {stepNum === 1 ? "Purpose" : stepNum === 2 ? "Details" : stepNum === 3 ? "Upload" : "Confirm"}
              </p>
            </div>
            {stepNum < 4 && (
              <div
                className={`h-0.5 flex-1 mx-2 ${
                  step > stepNum ? "bg-success" : "bg-border"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <DashboardCard className="p-8">
        {step === 1 && (
          <Step1Purpose
            purposes={purposes}
            selectedPurpose={formData.purpose}
            onSelect={handlePurposeSelect}
            onNext={() => setStep(2)}
            canProceed={canProceedToStep2()}
          />
        )}

        {step === 2 && (
          <Step2BasicInputs
            formData={formData}
            revenueRanges={revenueRanges}
            onChange={handleInputChange}
            onBack={() => setStep(1)}
            onNext={() => setStep(3)}
            canProceed={canProceedToStep3()}
          />
        )}

        {step === 3 && (
          <Step3Upload
            files={formData.uploaded_files}
            onFileUpload={handleFileUpload}
            onRemoveFile={removeFile}
            onBack={() => setStep(2)}
            onSubmit={handleSubmit}
            submitting={submitting}
          />
        )}

        {step === 4 && (
          <Step4Confirmation />
        )}
      </DashboardCard>
    </section>
  );
}

// Step 1: Purpose
function Step1Purpose({
  purposes,
  selectedPurpose,
  onSelect,
  onNext,
  canProceed,
}: {
  purposes: { value: BusinessPlanPurpose; label: string }[];
  selectedPurpose: BusinessPlanPurpose | "";
  onSelect: (purpose: BusinessPlanPurpose) => void;
  onNext: () => void;
  canProceed: boolean;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-brand-body mb-2">
          What is the business plan for?
        </h2>
        <p className="text-muted-foreground">
          Select the primary purpose for your business plan.
        </p>
      </div>

      <div className="space-y-3">
        {purposes.map((purpose) => (
          <button
            key={purpose.value}
            onClick={() => onSelect(purpose.value as BusinessPlanPurpose)}
            className={`w-full p-4 text-left border-2 rounded-lg transition-all ${
              selectedPurpose === purpose.value
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50 hover:bg-muted/30"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedPurpose === purpose.value
                    ? "border-primary"
                    : "border-border"
                }`}
              >
                {selectedPurpose === purpose.value && (
                  <div className="w-3 h-3 rounded-full bg-primary" />
                )}
              </div>
              <span className="font-medium text-brand-body">{purpose.label}</span>
            </div>
          </button>
        ))}
      </div>

      <div className="flex justify-end pt-4 border-t border-border">
        <Button onClick={onNext} disabled={!canProceed} size="lg">
          Continue
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}

// Step 2: Basic Inputs
function Step2BasicInputs({
  formData,
  revenueRanges,
  onChange,
  onBack,
  onNext,
  canProceed,
}: {
  formData: RequestFormData;
  revenueRanges: string[];
  onChange: (field: keyof RequestFormData, value: string | boolean) => void;
  onBack: () => void;
  onNext: () => void;
  canProceed: boolean;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-brand-body mb-2">
          Tell us about your business
        </h2>
        <p className="text-muted-foreground">
          Provide some basic information to help us understand your needs.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-brand-body mb-2">
            Short business description
          </label>
          <textarea
            value={formData.business_description}
            onChange={(e) => onChange("business_description", e.target.value)}
            placeholder="Describe your business in a few sentences..."
            className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            rows={4}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-brand-body mb-2">
            Industry
          </label>
          <input
            type="text"
            value={formData.industry}
            onChange={(e) => onChange("industry", e.target.value)}
            placeholder="e.g., Technology, Retail, Manufacturing"
            className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-brand-body mb-2">
            Target market
          </label>
          <input
            type="text"
            value={formData.target_market}
            onChange={(e) => onChange("target_market", e.target.value)}
            placeholder="e.g., B2B SaaS, Consumer retail, Enterprise"
            className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-brand-body mb-2">
            Expected revenue range
          </label>
          <select
            value={formData.expected_revenue_range}
            onChange={(e) => onChange("expected_revenue_range", e.target.value)}
            className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="">Select revenue range</option>
            {revenueRanges.map((range) => (
              <option key={range} value={range}>
                {range}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-brand-body mb-2">
            Do you have existing financials?
          </label>
          <div className="flex gap-4">
            <button
              onClick={() => onChange("has_existing_financials", true)}
              className={`flex-1 p-4 border-2 rounded-lg transition-all ${
                formData.has_existing_financials === true
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <span className="font-medium text-brand-body">Yes</span>
            </button>
            <button
              onClick={() => onChange("has_existing_financials", false)}
              className={`flex-1 p-4 border-2 rounded-lg transition-all ${
                formData.has_existing_financials === false
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <span className="font-medium text-brand-body">No</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-4 border-t border-border">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button onClick={onNext} disabled={!canProceed} size="lg">
          Continue
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}

// Step 3: Upload
function Step3Upload({
  files,
  onFileUpload,
  onRemoveFile,
  onBack,
  onSubmit,
  submitting,
}: {
  files: File[];
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: (index: number) => void;
  onBack: () => void;
  onSubmit: () => void;
  submitting: boolean;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-brand-body mb-2">
          Upload what you have (optional)
        </h2>
        <p className="text-muted-foreground">
          If you have any existing documents, you can upload them here. This is optional and can be done later.
        </p>
      </div>

      <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
        <input
          type="file"
          id="file-upload"
          multiple
          onChange={onFileUpload}
          className="hidden"
          accept=".pdf,.xlsx,.xls,.doc,.docx"
        />
        <label htmlFor="file-upload" className="cursor-pointer">
          <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="font-medium text-brand-body mb-2">
            Click to upload or drag and drop
          </p>
          <p className="text-sm text-muted-foreground">
            Management accounts, forecasts, pitch decks (PDF, Excel, Word)
          </p>
        </label>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-brand-body">Uploaded files:</p>
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <FileText className="w-5 h-5 text-primary shrink-0" />
                <span className="text-sm text-brand-body truncate">{file.name}</span>
                <span className="text-xs text-muted-foreground shrink-0">
                  ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemoveFile(index)}
                className="shrink-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-between pt-4 border-t border-border">
        <Button variant="outline" onClick={onBack} disabled={submitting}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button onClick={onSubmit} disabled={submitting} size="lg">
          {submitting ? "Submitting..." : "Submit request"}
          {!submitting && <ArrowRight className="w-4 h-4 ml-2" />}
        </Button>
      </div>
    </div>
  );
}

// Step 4: Confirmation
function Step4Confirmation() {
  const router = useRouter();

  return (
    <div className="text-center space-y-6 py-8">
      <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle2 className="w-8 h-8 text-success" />
      </div>
      <div>
        <h2 className="text-2xl font-semibold text-brand-body mb-2">
          Your business plan request has been submitted
        </h2>
        <p className="text-muted-foreground">
          Our team will contact you to confirm scope and timelines.
        </p>
      </div>
      <div className="pt-4">
        <Button onClick={() => router.push("/dashboard/business-plans")} size="lg">
          View Business Plans
        </Button>
      </div>
    </div>
  );
}

