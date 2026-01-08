"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";

type GlobalUploadDrawerProps = {
  open: boolean;
  onClose: () => void;
};

type UploadStep = "form" | "success";

type SummaryCounts = {
  invoices: number;
  bank: number;
  receipts: number;
};

export function GlobalUploadDrawer({ open, onClose }: GlobalUploadDrawerProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [service, setService] = useState<string>("auto");
  const [period, setPeriod] = useState<string>("auto");
  const [tag, setTag] = useState<string>("auto");
  const [mode, setMode] = useState<"bundle" | "split">("bundle");
  const [step, setStep] = useState<UploadStep>("form");
  const [summary, setSummary] = useState<SummaryCounts>({ invoices: 0, bank: 0, receipts: 0 });

  if (!open) return null;

  const classifyFiles = (list: File[]): SummaryCounts => {
    let invoices = 0;
    let bank = 0;
    let receipts = 0;

    list.forEach((file) => {
      const name = file.name.toLowerCase();
      if (name.includes("inv") || name.includes("invoice")) invoices += 1;
      else if (name.includes("bank")) bank += 1;
      else receipts += 1;
    });

    return { invoices, bank, receipts };
  };

  const handleFiles = (selected: FileList | null) => {
    if (!selected) return;
    const list = Array.from(selected);
    setFiles(list);
    setSummary(classifyFiles(list));
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    handleFiles(e.dataTransfer.files);
  };

  const handleUpload = () => {
    if (!files.length) return;
    setStep("success");
  };

  const handleClose = () => {
    setFiles([]);
    setSummary({ invoices: 0, bank: 0, receipts: 0 });
    setService("auto");
    setPeriod("auto");
    setTag("auto");
    setMode("bundle");
    setStep("form");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40">
      <div className="w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/40">
          <h2 className="text-sm font-semibold text-brand-body">Upload</h2>
          <button
            type="button"
            className="text-xs font-medium text-muted-foreground hover:text-foreground"
            onClick={handleClose}
          >
            Close
          </button>
        </div>

        {step === "form" && (
          <div className="px-6 py-5 space-y-5">
            <div
              className="border border-dashed border-border rounded-xl bg-muted/40 px-6 py-10 flex flex-col items-center justify-center text-center cursor-pointer hover:border-ring hover:bg-muted transition-colors"
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onDrop={handleDrop}
            >
              <p className="text-sm font-medium text-brand-body mb-1">Drag &amp; drop files here</p>
              <p className="text-xs text-muted-foreground mb-3">PDF, images, spreadsheets up to 25MB each.</p>
              <label className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold cursor-pointer hover:bg-primary/90">
                Choose files
                <input
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(e) => handleFiles(e.target.files)}
                />
              </label>

              {files.length > 0 && (
                <p className="mt-4 text-xs text-muted-foreground">
                  {files.length} document{files.length > 1 ? "s" : ""} selected
                </p>
              )}
            </div>

            {files.length > 0 && (
              <div className="rounded-xl border border-border bg-card px-4 py-3 text-xs text-muted-foreground space-y-1">
                <p className="font-medium text-brand-body">
                  Detected: {summary.invoices} invoices • {summary.bank} bank statement
                  {summary.bank !== 1 ? "s" : ""} • {summary.receipts} receipt
                  {summary.receipts !== 1 ? "s" : ""}.
                </p>
                <p>Suggested: Bookkeeping ({summary.invoices + summary.receipts}), VAT ({summary.invoices}).</p>
              </div>
            )}

            <div className="space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Optional (advanced)
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="space-y-1">
                  <p className="text-[11px] font-medium text-muted-foreground">Service</p>
                  <Select
                    className="h-9 text-xs"
                    value={service}
                    onChange={(e) => setService(e.target.value)}
                  >
                    <option value="auto">Auto</option>
                    <option value="bookkeeping">Bookkeeping</option>
                    <option value="vat">VAT &amp; Tax</option>
                    <option value="payroll">Payroll</option>
                    <option value="audit">Audit</option>
                    <option value="csp">CSP / MBR</option>
                    <option value="legal">Legal</option>
                    <option value="projects">Projects</option>
                  </Select>
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] font-medium text-muted-foreground">Period</p>
                  <Select
                    className="h-9 text-xs"
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                  >
                    <option value="auto">Auto</option>
                    <option value="q1">Q1</option>
                    <option value="q2">Q2</option>
                    <option value="q3">Q3</option>
                    <option value="q4">Q4</option>
                  </Select>
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] font-medium text-muted-foreground">Tag</p>
                  <Select
                    className="h-9 text-xs"
                    value={tag}
                    onChange={(e) => setTag(e.target.value)}
                  >
                    <option value="auto">Auto</option>
                    <option value="invoices">Invoices</option>
                    <option value="bank">Bank</option>
                    <option value="payroll">Payroll</option>
                  </Select>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs">
                <div className="flex items-center gap-3">
                  <label className="inline-flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      name="upload-mode"
                      value="bundle"
                      checked={mode === "bundle"}
                      onChange={() => setMode("bundle")}
                    />
                    <span>Upload as: Bundle</span>
                  </label>
                  <label className="inline-flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      name="upload-mode"
                      value="split"
                      checked={mode === "split"}
                      onChange={() => setMode("split")}
                    />
                    <span>Split by type automatically</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pt-2">
              <div className="text-[11px] text-muted-foreground">
                You can always refine service, period and tags later from the Documents workspace.
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  className="text-xs rounded-lg"
                  disabled={!files.length}
                  onClick={handleUpload}
                >
                  Upload + Add Notes
                </Button>
                <Button
                  className="text-xs rounded-lg"
                  disabled={!files.length}
                  onClick={handleUpload}
                >
                  Upload &amp; Done
                </Button>
              </div>
            </div>
          </div>
        )}

        {step === "success" && (
          <div className="px-6 py-6 space-y-4">
            <h3 className="text-lg font-semibold text-brand-body">Upload Complete ✅</h3>
            <p className="text-sm text-muted-foreground">
              {files.length} document{files.length > 1 ? "s" : ""} received.
            </p>
            <div className="rounded-xl border border-border bg-muted/40 px-4 py-3 text-xs text-muted-foreground space-y-1">
              <p>
                Sorted into: Bookkeeping ({summary.invoices + summary.receipts}), VAT ({summary.invoices}).
              </p>
              <p>Next: Your provider will review within 24–48h.</p>
            </div>
            <div className="rounded-xl border border-border bg-card px-4 py-3 text-xs text-muted-foreground space-y-2">
              <p className="font-medium text-brand-body">
                Still missing: VAT Q2 → 1 invoice.
                <button
                  type="button"
                  className="ml-2 text-primary font-semibold hover:underline"
                  onClick={handleClose}
                >
                  Upload now
                </button>
              </p>
            </div>
            <div className="flex justify-end pt-2">
              <Button className="text-xs rounded-lg" onClick={handleClose}>
                Done
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


