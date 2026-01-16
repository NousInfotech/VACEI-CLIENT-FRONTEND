"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import DashboardCard from "@/components/DashboardCard";
import BackButton from "@/components/shared/BackButton";
import { AlertModal } from "@/components/ui/modal";
import { 
  ArrowLeft, 
  ArrowRight, 
  Upload, 
  FileText,
  Share2,
  UserCheck,
  TrendingUp,
  Globe,
  Building2,
  CheckCircle2
} from "lucide-react";

type MBRFilingType = "share_transfer" | "director_change" | "share_capital" | "cross_border_merger" | "company_name_change";

interface FilingTypeInfo {
  type: MBRFilingType;
  name: string;
  icon: any;
  description: string;
  fields: {
    label: string;
    name: string;
    type: "text" | "textarea" | "date" | "number" | "file";
    required?: boolean;
    placeholder?: string;
  }[];
}

const filingTypeConfigs: Record<MBRFilingType, FilingTypeInfo> = {
  share_transfer: {
    type: "share_transfer",
    name: "Share Transfer",
    icon: Share2,
    description: "Transfer shares between shareholders",
    fields: [
      { label: "Transferor Name", name: "transferor_name", type: "text", required: true, placeholder: "Enter transferor name" },
      { label: "Transferee Name", name: "transferee_name", type: "text", required: true, placeholder: "Enter transferee name" },
      { label: "Number of Shares", name: "share_count", type: "number", required: true, placeholder: "Enter number of shares" },
      { label: "Share Class", name: "share_class", type: "text", required: true, placeholder: "e.g., Ordinary Shares" },
      { label: "Transfer Date", name: "transfer_date", type: "date", required: true },
      { label: "Consideration Amount", name: "consideration", type: "number", placeholder: "Enter consideration amount (if any)" },
      { label: "Additional Notes", name: "notes", type: "textarea", placeholder: "Any additional information..." },
    ]
  },
  director_change: {
    type: "director_change",
    name: "Director Change",
    icon: UserCheck,
    description: "Appoint or remove directors",
    fields: [
      { label: "Change Type", name: "change_type", type: "text", required: true, placeholder: "Appoint or Remove" },
      { label: "Director Full Name", name: "director_name", type: "text", required: true, placeholder: "Enter director full name" },
      { label: "Director ID Number", name: "director_id", type: "text", required: true, placeholder: "Enter ID/Passport number" },
      { label: "Effective Date", name: "effective_date", type: "date", required: true },
      { label: "Reason", name: "reason", type: "textarea", placeholder: "Reason for change..." },
      { label: "Additional Notes", name: "notes", type: "textarea", placeholder: "Any additional information..." },
    ]
  },
  share_capital: {
    type: "share_capital",
    name: "Share Capital Increase/Reduction",
    icon: TrendingUp,
    description: "Modify company share capital",
    fields: [
      { label: "Change Type", name: "change_type", type: "text", required: true, placeholder: "Increase or Reduction" },
      { label: "Current Share Capital", name: "current_capital", type: "number", required: true, placeholder: "Enter current share capital" },
      { label: "New Share Capital", name: "new_capital", type: "number", required: true, placeholder: "Enter new share capital" },
      { label: "Effective Date", name: "effective_date", type: "date", required: true },
      { label: "Reason", name: "reason", type: "textarea", placeholder: "Reason for capital change..." },
      { label: "Additional Notes", name: "notes", type: "textarea", placeholder: "Any additional information..." },
    ]
  },
  cross_border_merger: {
    type: "cross_border_merger",
    name: "Cross-Border Merger",
    icon: Globe,
    description: "Merge with another company",
    fields: [
      { label: "Merging Company Name", name: "merging_company", type: "text", required: true, placeholder: "Enter merging company name" },
      { label: "Merging Company Jurisdiction", name: "merging_jurisdiction", type: "text", required: true, placeholder: "Enter jurisdiction" },
      { label: "Merger Effective Date", name: "effective_date", type: "date", required: true },
      { label: "Merger Description", name: "description", type: "textarea", required: true, placeholder: "Describe the merger..." },
      { label: "Additional Notes", name: "notes", type: "textarea", placeholder: "Any additional information..." },
    ]
  },
  company_name_change: {
    type: "company_name_change",
    name: "Company Name Change",
    icon: Building2,
    description: "Change your company name",
    fields: [
      { label: "Current Company Name", name: "current_name", type: "text", required: true, placeholder: "Enter current company name" },
      { label: "New Company Name", name: "new_name", type: "text", required: true, placeholder: "Enter new company name" },
      { label: "Effective Date", name: "effective_date", type: "date", required: true },
      { label: "Reason", name: "reason", type: "textarea", placeholder: "Reason for name change..." },
      { label: "Additional Notes", name: "notes", type: "textarea", placeholder: "Any additional information..." },
    ]
  }
};

export default function MBRFilingRequestPage() {
  const router = useRouter();
  const params = useParams();
  const filingType = params?.type as MBRFilingType;
  
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertModalContent, setAlertModalContent] = useState({
    title: "",
    message: "",
    type: "success" as "success" | "error" | "info"
  });

  const filingConfig = filingType ? filingTypeConfigs[filingType] : null;
  const Icon = filingConfig?.icon || FileText;

  useEffect(() => {
    if (!filingType || !filingTypeConfigs[filingType]) {
      router.push("/dashboard/services/mbr-filing");
    }
  }, [filingType, router]);

  if (!filingConfig) {
    return null;
  }

  const handleInputChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setUploadedFiles([...uploadedFiles, ...files]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
  };

  const isFormValid = () => {
    return filingConfig.fields
      .filter(f => f.required)
      .every(f => formData[f.name] && formData[f.name].trim() !== "");
  };

  const handleSubmit = async () => {
    if (!isFormValid()) {
      setShowAlertModal(true);
      setAlertModalContent({
        title: "Validation Error",
        message: "Please fill in all required fields.",
        type: "error"
      });
      return;
    }

    setSubmitting(true);
    try {
      // Get company ID
      const companyId = localStorage.getItem("vacei-active-company") || "";
      
      // Create filing record
      const filingId = `mbr-${filingType}-${Date.now()}`;
      const newFiling = {
        id: filingId,
        type: filingType,
        name: filingConfig.name,
        description: filingConfig.description,
        icon: filingConfig.icon,
        status: "in_progress" as const,
        submissionDate: new Date().toISOString(),
        formData: formData,
        uploadedFiles: uploadedFiles.map(f => f.name),
        reference: `MBR-${filingType.toUpperCase().slice(0, 3)}-${Date.now().toString().slice(-6)}`
      };

      // Save to localStorage
      const storageKey = `vacei-mbr-filings-${companyId}`;
      const existingFilings = JSON.parse(localStorage.getItem(storageKey) || "[]");
      const updatedFilings = existingFilings.map((f: any) => 
        f.type === filingType ? newFiling : f
      );
      localStorage.setItem(storageKey, JSON.stringify(updatedFilings));

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setShowAlertModal(true);
      setAlertModalContent({
        title: "Filing Submitted",
        message: `Your ${filingConfig.name} request has been submitted successfully. Reference: ${newFiling.reference}`,
        type: "success"
      });
    } catch (error) {
      console.error("Error submitting filing:", error);
      setSubmitting(false);
      setShowAlertModal(true);
      setAlertModalContent({
        title: "Submission Failed",
        message: "Failed to submit filing. Please try again.",
        type: "error"
      });
    }
  };

  return (
    <section className="mx-auto max-w-[1000px] w-full pt-5 space-y-6">
      <BackButton />
      
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-brand-body">{filingConfig.name}</h1>
          <p className="text-sm text-muted-foreground mt-1">{filingConfig.description}</p>
        </div>
      </div>

      {/* Form */}
      <DashboardCard className="p-6">
        <h2 className="text-xl font-semibold text-brand-body mb-6">Filing Details</h2>
        
        <div className="space-y-5">
          {filingConfig.fields.map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-medium text-brand-body mb-2">
                {field.label}
                {field.required && <span className="text-destructive ml-1">*</span>}
              </label>
              {field.type === "textarea" ? (
                <Textarea
                  value={formData[field.name] || ""}
                  onChange={(e) => handleInputChange(field.name, e.target.value)}
                  placeholder={field.placeholder}
                  className="min-h-[100px]"
                  required={field.required}
                />
              ) : field.type === "file" ? (
                <Input
                  type="file"
                  onChange={handleFileUpload}
                  className="cursor-pointer"
                  multiple
                />
              ) : (
                <Input
                  type={field.type}
                  value={formData[field.name] || ""}
                  onChange={(e) => handleInputChange(field.name, e.target.value)}
                  placeholder={field.placeholder}
                  required={field.required}
                />
              )}
            </div>
          ))}

          {/* File Upload Section */}
          <div>
            <label className="block text-sm font-medium text-brand-body mb-2">
              Supporting Documents (Optional)
            </label>
            <Input
              type="file"
              onChange={handleFileUpload}
              className="cursor-pointer mb-3"
              multiple
            />
            {uploadedFiles.length > 0 && (
              <div className="space-y-2">
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-brand-body">{file.name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      className="text-destructive hover:text-destructive"
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t">
          <Link href="/dashboard/services/mbr-filing">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </Link>
          <Button
            variant="default"
            size="sm"
            onClick={handleSubmit}
            disabled={!isFormValid() || submitting}
            className="min-w-[140px]"
          >
            {submitting ? (
              "Submitting..."
            ) : (
              <>
                Submit Filing
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
              router.push("/dashboard/services/mbr-filing");
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

