"use client";

import * as React from 'react';
const { useState, useMemo, Suspense } = React;
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeft, 
  CheckCircle2, 
  ShieldCheck,
  FileText,
  ExternalLink,
  Upload,
  X
} from "lucide-react";
import { cn, createSlug } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import DashboardCard from "@/components/DashboardCard";
import PageHeader from "@/components/shared/PageHeader";
import BackButton from "@/components/shared/BackButton";

// Data & Types
import { MOCK_GRANTS } from "@/components/services/grants/data";
import { Grant } from "@/components/services/grants/types";

function GrantDetailsContent() {
  const router = useRouter();
  const params = useParams();
  const grantId = params.id as string;

  const grant = useMemo(() => 
    MOCK_GRANTS.find(g => createSlug(g.title) === grantId) || MOCK_GRANTS[0], 
  [grantId]);

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
      alert("Please upload at least one file related to this grant application.");
      return;
    }

    setSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      const requestData = {
        grantId: grant.id,
        grantTitle: grant.title,
        uploadedFiles: uploadedFiles.map((f) => ({
          name: f.name,
          size: f.size,
          type: f.type,
        })),
        notes: notes || undefined,
      };

      console.log("✅ Grant Request Submitted:", requestData);
      setSubmitting(false);
      setShowSuccess(true);
    }, 1000);
  };

  // Success Screen
  if (showSuccess) {
    return (
      <section className="mx-auto max-w-[1400px] w-full pt-10 px-4 md:px-6">
        <div className="mx-auto py-12 text-center space-y-6 animate-in zoom-in-95 duration-500">
          <div className="w-20 h-20 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto shadow-lg shadow-green-100">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-brand-body">Request Sent!</h3>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed">
              We've received your request for the <b>{grant.title}</b>. One of our specialists will review your submission and contact you shortly.
            </p>
          </div>
          
          <div className="p-5 rounded-2xl bg-muted/30 border border-border/40 text-left space-y-3 max-w-sm mx-auto">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white border border-border flex items-center justify-center shadow-sm">
                <ShieldCheck className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-xs font-bold text-brand-body">Request Submitted</p>
                <p className="text-[10px] text-muted-foreground">
                  {uploadedFiles.length} file{uploadedFiles.length !== 1 ? 's' : ''} uploaded
                </p>
              </div>
            </div>
          </div>

          <Button 
            className="w-full max-w-xs rounded-xl h-12 font-bold bg-primary-color-new text-white" 
            onClick={() => router.push('/dashboard/services/grants-incentives')}
          >
            Go to my requests
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-[1400px] w-full pt-5 px-4 md:px-6 space-y-6 pb-20">
      <BackButton />

      <div className="mx-auto space-y-6 max-w-5xl">
        {/* Grant Details Section */}
        <DashboardCard className="p-6">
          <PageHeader 
            title={grant.title}
            badge={
              <div className="flex flex-wrap gap-2 pt-1">
                <Badge variant="secondary" className="text-[10px] bg-light text-primary-color-new font-bold">{grant.provider}</Badge>
                <Badge variant="secondary" className="text-[10px] bg-light text-primary-color-new font-bold uppercase">{grant.category}</Badge>
              </div>
            }
            animate={false}
            className="p-6 mb-6"
          />

          <div className="grid grid-cols-2 gap-4 mb-6">
            <DashboardCard className="p-3">
              <span className="text-[10px] text-muted-foreground font-bold uppercase block mb-1">Target Funding</span>
              <span className="text-sm font-medium">{grant.fundingAmount}</span>
            </DashboardCard>
            <DashboardCard className="p-3">
              <span className="text-[10px] text-muted-foreground font-bold uppercase block mb-1">Deadline</span>
              <span className="text-sm font-medium">{grant.deadline}</span>
            </DashboardCard>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-bold text-brand-body mb-3 flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center bg-primary-color-new text-[10px] text-white font-bold">1</div>
                  Eligibility Snapshot
                </h4>
                <ul className="space-y-2 pl-2">
                  {grant.eligibility.map((item, i) => (
                    <li key={i} className="text-sm text-brand-body/80 flex items-start gap-2.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary/30 mt-1.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-bold text-brand-body mb-3 flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center bg-primary-color-new text-[10px] text-white font-bold">2</div>
                  What you'll need
                </h4>
                <ul className="space-y-2 pl-2">
                  {grant.documentsNeeded.map((doc, i) => (
                    <li key={i} className="text-sm text-brand-body/80 flex items-start gap-2.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary/30 mt-1.5 shrink-0" />
                      {doc}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-bold text-brand-body mb-3 flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center bg-primary-color-new text-[10px] text-white font-bold">3</div>
                  Estimated Timeline
                </h4>
                <ul className="pl-2">
                  <li className="text-sm text-brand-body/80 flex items-start gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary/30 mt-1.5 shrink-0" />
                    {grant.timeline} approval process
                  </li>
                </ul>
              </div>

              <div className="p-5 rounded-2xl bg-primary/5 border border-primary/10 space-y-3">
                <h4 className="text-sm font-bold text-primary flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  Expert Guidance
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Our specialists will guide you through the entire application process, from document preparation to submission.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <Button variant="outline" className="flex-1 rounded-xl h-11 font-bold flex items-center justify-center gap-2 border-primary/10 text-primary" asChild>
              <a href={grant.sourceLink} target="_blank" rel="noopener noreferrer">
                {"Source: grants.mt "}
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </Button>
          </div>
        </DashboardCard>

        {/* Request Form Section */}
        <DashboardCard className="p-6">
          <h2 className="text-xl font-semibold text-brand-body mb-6">Request Support</h2>
          
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
                  <p className="text-xs text-muted-foreground">
                    Upload files related to this grant application
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
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard/services/grants-incentives')}
              className="rounded-xl h-11 font-bold"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={handleSubmit}
              disabled={uploadedFiles.length === 0 || submitting}
              className="rounded-xl h-11 font-bold bg-primary-color-new text-white min-w-[140px]"
            >
              {submitting ? "Submitting..." : "Submit Request"}
            </Button>
          </div>
        </DashboardCard>
      </div>
    </section>
  );
}

export default function GrantDetailsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[400px]">Loading details...</div>}>
      <GrantDetailsContent />
    </Suspense>
  );
}
