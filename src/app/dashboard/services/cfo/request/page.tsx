"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { ArrowLeft, Upload, FileText, X } from "lucide-react";
import DashboardCard from "@/components/DashboardCard";
import BackButton from "@/components/shared/BackButton";

export default function RequestCfoService() {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setUploadedFiles([...uploadedFiles, ...files]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (uploadedFiles.length === 0) {
      alert("Please upload at least one file related to this service.");
      return;
    }

    setSubmitting(true);

    const finalData = {
      service: "cfo",
      company_id: "COMPANY_001",
      status: "active",
      uploadedFiles: uploadedFiles.map((f) => ({
        name: f.name,
        size: f.size,
        type: f.type,
      })),
      notes: notes || undefined,
    };

    // Simulate API call
    setTimeout(() => {
      console.log("✅ CFO REQUEST SUBMITTED:", finalData);
      setSubmitting(false);
      setShowSuccess(true);
    }, 1000);
  };

  return (
    <section className="mx-auto max-w-[1000px] w-full pt-5 space-y-6">
      <BackButton />

      {/* Page Header */}
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-brand-body">
            Request CFO Services
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Upload files related to your CFO service request
          </p>
        </div>
      </div>

      {/* Form */}
      <DashboardCard className="p-6">
        <h2 className="text-xl font-semibold text-brand-body mb-6">
          Request Service
        </h2>

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
                  <span className="font-semibold">Click to upload</span> or drag
                  and drop
                </p>
                <p className="text-xs text-muted-foreground">
                  Upload files related to this service
                </p>
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
          <Link href="/dashboard/services/cfo">
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
            {submitting ? "Submitting..." : "Submit Request"}
          </Button>
        </div>
      </DashboardCard>

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg p-6 w-96 text-center">
            <h2 className="text-lg font-bold text-green-600 mb-2">
              Request submitted successfully
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Your CFO service request has been submitted. We will contact you
              shortly.
            </p>
            <button
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              onClick={() => {
                setShowSuccess(false);
                window.location.href = "/dashboard/services/cfo";
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
