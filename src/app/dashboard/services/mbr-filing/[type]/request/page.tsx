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
  CheckCircle2,
  X
} from "lucide-react";

type MBRFilingType = "share_transfer" | "director_change" | "share_capital" | "cross_border_merger" | "company_name_change";

interface FilingTypeInfo {
  type: MBRFilingType;
  name: string;
  icon: any;
  description: string;
}

const filingTypeConfigs: Record<MBRFilingType, FilingTypeInfo> = {
  share_transfer: {
    type: "share_transfer",
    name: "Share Transfer",
    icon: Share2,
    description: "Transfer shares between shareholders",
  },
  director_change: {
    type: "director_change",
    name: "Director Change",
    icon: UserCheck,
    description: "Appoint or remove directors",
  },
  share_capital: {
    type: "share_capital",
    name: "Share Capital Increase/Reduction",
    icon: TrendingUp,
    description: "Modify company share capital",
  },
  cross_border_merger: {
    type: "cross_border_merger",
    name: "Cross-Border Merger",
    icon: Globe,
    description: "Merge with another company",
  },
  company_name_change: {
    type: "company_name_change",
    name: "Company Name Change",
    icon: Building2,
    description: "Change your company name",
  }
};

export default function MBRFilingRequestPage() {
  const router = useRouter();
  const params = useParams();
  const filingType = params?.type as MBRFilingType;
  
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [notes, setNotes] = useState("");
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
        uploadedFiles: uploadedFiles.map(f => f.name),
        notes: notes,
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

