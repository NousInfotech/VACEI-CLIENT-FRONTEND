"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import PageHeader from "@/components/shared/PageHeader";
import { Modal, AlertModal } from "@/components/ui/modal";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dropdown } from "@/components/Dropdown";

type FilingFrequency = "Monthly" | "Quarterly";
type DocStatus = "Uploaded" | "Processed" | "Submitted";
type DocType =
  | "Sales invoices"
  | "Purchase invoices"
  | "Import documentation"
  | "EU transaction evidence"
  | "VAT return copy"
  | "Submission confirmation";

type VatMessageType = "in_progress" | "submitted" | "payment_confirmed" | "info_required";

export default function VatMaltaPage() {
  const [filingFrequency, setFilingFrequency] = useState<FilingFrequency>("Quarterly");
  const [status, setStatus] = useState<"Waiting on you" | "In progress" | "Completed">("Waiting on you");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [zipInfoOpen, setZipInfoOpen] = useState(false);
  const [uploadedDocs, setUploadedDocs] = useState<{ name: string; type: DocType; status: DocStatus }[]>([]);
  const [messages, setMessages] = useState<{ id: string; type: VatMessageType; text: string; createdAt: string }[]>([]);
  const [archiveFilters, setArchiveFilters] = useState<{ periodType: "Month" | "Quarter"; year: string; docType: DocType | "All" }>({
    periodType: "Quarter",
    year: "2025",
    docType: "All",
  });
  const netPositionAvailable = true;

  const currentPeriodLabel = useMemo(() => {
    return filingFrequency === "Monthly" ? "June 2025" : "Q2 2025";
  }, [filingFrequency]);

  const nextDeadline = "15 August 2025";

  const defaultDocs: { type: DocType; status: DocStatus }[] = [
    { type: "Sales invoices", status: "Uploaded" },
    { type: "Purchase invoices", status: "Uploaded" },
    { type: "VAT return copy", status: "Processed" },
    { type: "Submission confirmation", status: "Submitted" },
  ];

  const documents = useMemo(() => {
    const base = defaultDocs.map((d) => ({ name: d.type, type: d.type, status: d.status }));
    return [...base, ...uploadedDocs];
  }, [uploadedDocs]);

  const handleConfirmNoChanges = () => {
    setStatus("In progress");
    setConfirmOpen(false);
    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        type: "in_progress",
        text: "VAT return is in progress",
        createdAt: new Date().toISOString(),
      },
    ]);
  };

  const handleUploadFiles = (files: FileList) => {
    const newDocs = Array.from(files).map((file) => ({
      name: file.name,
      type: "Sales invoices" as DocType,
      status: "Uploaded" as DocStatus,
    }));
    setUploadedDocs((prev) => [...prev, ...newDocs]);
    setUploadOpen(false);
  };

  const confirmPaymentAmount = () => {
    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        type: "payment_confirmed",
        text: "Payment amount is confirmed",
        createdAt: new Date().toISOString(),
      },
    ]);
  };

  const triggerInfoRequired = () => {
    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        type: "info_required",
        text: "Additional information is required",
        createdAt: new Date().toISOString(),
      },
    ]);
  };

  const archiveRows = [
    { period: "Q1 2025", type: "VAT returns", file: "VAT_Return_Q1_2025.pdf" },
    { period: "Q1 2025", type: "Submission confirmations", file: "Submission_Confirmation_Q1_2025.pdf" },
    { period: "2024", type: "Supporting schedules", file: "Supporting_Schedules_2024.zip" },
  ];

  return (
    <section className="mx-auto max-w-[1200px] w-full pt-5 space-y-6">
      <PageHeader
        title="VAT — Malta"
        subtitle="VAT returns, submissions, and payments handled for you."
       
        actions={
          <div className="flex gap-2">
            <Link href="/dashboard/services/vat">
              <Button variant="outline" className="bg-light text-primary-color-new">
                Back to VAT & Tax
              </Button>
            </Link>
            <Button
              variant="outline"
              className="bg-light text-primary-color-new"
              onClick={() => setUploadOpen(true)}
            >
              Upload VAT documents
            </Button>
          </div>
        }
      />

      <div className="grid gap-5 md:grid-cols-[1.3fr,1fr]">
        <div className="space-y-5">
          <div className="bg-card border border-primary rounded-card shadow-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-brand-body">Service status</h3>
              <Badge className="bg-warning text-warning-foreground">{status}</Badge>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <div className="text-xs text-muted-foreground">Current period</div>
                <div className="font-semibold text-brand-body">{currentPeriodLabel}</div>
              </div>
              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <div className="text-xs text-muted-foreground">Next deadline</div>
                <div className="font-semibold text-brand-body">{nextDeadline}</div>
              </div>
              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <div className="text-xs text-muted-foreground">Filing frequency</div>
                <div className="font-semibold text-brand-body">{filingFrequency}</div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setFilingFrequency("Monthly")}>Switch to Monthly</Button>
              <Button variant="outline" size="sm" onClick={() => setFilingFrequency("Quarterly")}>Switch to Quarterly</Button>
            </div>
          </div>

          {status === "Waiting on you" && (
            <div className="bg-card border border-border rounded-card shadow-md p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-brand-body">Action required</h3>
                <Badge className="bg-warning text-warning-foreground">Waiting on you</Badge>
              </div>
              <p className="text-sm text-brand-body font-medium">Do you have any VAT information to upload for this period?</p>
              <ul className="text-sm text-muted-foreground list-disc pl-6 space-y-1">
                <li>Sales invoices not yet provided</li>
                <li>Purchase invoices not yet provided</li>
                <li>Adjustments or corrections</li>
                <li>Imports or EU transactions</li>
              </ul>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  className="bg-light text-primary-color-new"
                  onClick={() => setUploadOpen(true)}
                >
                  Upload VAT documents
                </Button>
                <Button variant="outline" onClick={() => setConfirmOpen(true)}>
                  Confirm no changes
                </Button>
              </div>
            </div>
          )}

          <div className="bg-card border border-border rounded-card shadow-md p-6 space-y-4">
            <h3 className="text-base font-semibold text-brand-body">Current VAT period</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <div className="text-xs text-muted-foreground">VAT period</div>
                <div className="font-semibold text-brand-body">{currentPeriodLabel}</div>
              </div>
              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <div className="text-xs text-muted-foreground">Filing frequency</div>
                <div className="font-semibold text-brand-body">{filingFrequency}</div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <div className="text-xs text-muted-foreground">VAT Return</div>
                <div className="font-semibold text-brand-body">Pending</div>
              </div>
              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <div className="text-xs text-muted-foreground">VAT Payment</div>
                <div className="font-semibold text-brand-body">Pending</div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">You do not need to prepare or submit the return — it is handled on your behalf.</p>
          </div>

          <div className="bg-card border border-border rounded-card shadow-md p-6 space-y-4">
            <h3 className="text-base font-semibold text-brand-body">VAT return summary</h3>
            {!netPositionAvailable ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                <div className="rounded-lg border border-border bg-muted/30 p-3">
                  <div className="text-xs text-muted-foreground">Output VAT (Sales)</div>
                  <div className="font-semibold text-brand-body">Calculating</div>
                </div>
                <div className="rounded-lg border border-border bg-muted/30 p-3">
                  <div className="text-xs text-muted-foreground">Input VAT (Purchases)</div>
                  <div className="font-semibold text-brand-body">Calculating</div>
                </div>
                <div className="rounded-lg border border-border bg-muted/30 p-3">
                  <div className="text-xs text-muted-foreground">Net VAT position</div>
                  <div className="font-semibold text-brand-body">Pending</div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                <div className="rounded-lg border border-border bg-muted/30 p-3">
                  <div className="text-xs text-muted-foreground">Net VAT payable</div>
                  <div className="font-semibold text-brand-body">€3,420</div>
                </div>
                <div className="rounded-lg border border-border bg-muted/30 p-3">
                  <div className="text-xs text-muted-foreground">Submission date</div>
                  <div className="font-semibold text-brand-body">10 August 2025</div>
                </div>
                <div className="rounded-lg border border-border bg-muted/30 p-3">
                  <div className="text-xs text-muted-foreground">Status</div>
                  <div className="font-semibold text-brand-body">Submitted</div>
                </div>
              </div>
            )}
            {netPositionAvailable && (
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  className="bg-light text-primary-color-new"
                  onClick={confirmPaymentAmount}
                >
                  Confirm payment amount
                </Button>
                <Button
                  variant="outline"
                  className="border-warning/60 text-warning"
                  onClick={triggerInfoRequired}
                >
                  Flag info required
                </Button>
              </div>
            )}
            <p className="text-xs text-muted-foreground">Detailed calculations remain internal unless requested.</p>
          </div>

          <div className="bg-card border border-border rounded-card shadow-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-brand-body">VAT documents</h3>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((doc, idx) => (
                  <TableRow key={`${doc.name}-${idx}`}>
                    <TableCell className="font-medium text-brand-body">{doc.type}</TableCell>
                    <TableCell>
                      <Badge variant={doc.status === "Submitted" ? "secondary" : "default"}>{doc.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm">View</Button>
                        <Button variant="outline" size="sm">Download</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableCaption>Documents for {currentPeriodLabel}</TableCaption>
            </Table>
          </div>
        </div>

        <div className="space-y-5">
          <div className="bg-card border border-border rounded-card shadow-md p-6 space-y-4">
            <h3 className="text-base font-semibold text-brand-body">VAT returns archive</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground">Period</div>
                <div className="flex gap-2">
                  <Button variant={archiveFilters.periodType === "Month" ? "secondary" : "outline"} size="sm" onClick={() => setArchiveFilters((f) => ({ ...f, periodType: "Month" }))}>Month</Button>
                  <Button variant={archiveFilters.periodType === "Quarter" ? "secondary" : "outline"} size="sm" onClick={() => setArchiveFilters((f) => ({ ...f, periodType: "Quarter" }))}>Quarter</Button>
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground">Year</div>
                <Dropdown
                  className="w-full"
                  align="left"
                  side="bottom"
                  trigger={
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full h-9 justify-between rounded-lg bg-input text-sm font-normal text-brand-body"
                    >
                      {archiveFilters.year}
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                  }
                  items={[
                    { id: "2025", label: "2025", onClick: () => setArchiveFilters((f) => ({ ...f, year: "2025" })) },
                    { id: "2024", label: "2024", onClick: () => setArchiveFilters((f) => ({ ...f, year: "2024" })) },
                    { id: "2023", label: "2023", onClick: () => setArchiveFilters((f) => ({ ...f, year: "2023" })) },
                  ]}
                />
              </div>
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground">Document type</div>
                <Dropdown
                  className="w-full"
                  align="left"
                  side="bottom"
                  trigger={
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full h-9 justify-between rounded-lg bg-input text-sm font-normal text-brand-body"
                    >
                      {archiveFilters.docType === "All" ? "All" : archiveFilters.docType}
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                  }
                  items={[
                    { id: "All", label: "All", onClick: () => setArchiveFilters((f) => ({ ...f, docType: "All" })) },
                    {
                      id: "VAT returns",
                      label: "VAT returns",
                      onClick: () => setArchiveFilters((f) => ({ ...f, docType: "VAT returns" as any })),
                    },
                    {
                      id: "Submission confirmations",
                      label: "Submission confirmations",
                      onClick: () =>
                        setArchiveFilters((f) => ({ ...f, docType: "Submission confirmations" as any })),
                    },
                    {
                      id: "Supporting schedules",
                      label: "Supporting schedules",
                      onClick: () => setArchiveFilters((f) => ({ ...f, docType: "Supporting schedules" as any })),
                    },
                    {
                      id: "Payment confirmations",
                      label: "Payment confirmations",
                      onClick: () => setArchiveFilters((f) => ({ ...f, docType: "Payment confirmations" as any })),
                    },
                  ]}
                />
              </div>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Period</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>File</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {archiveRows
                  .filter((r) => (archiveFilters.docType === "All" ? true : r.type === archiveFilters.docType))
                  .map((row, idx) => (
                    <TableRow key={`${row.file}-${idx}`}>
                      <TableCell className="font-medium text-brand-body">{row.period}</TableCell>
                      <TableCell>{row.type}</TableCell>
                      <TableCell>{row.file}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm">Download</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
            <div className="flex justify-end">
              <Button
                variant="outline"
                className="bg-light text-primary-color-new"
                onClick={() => setZipInfoOpen(true)}
              >
                Download all filtered as ZIP
              </Button>
            </div>
          </div>

          <div className="bg-card border border-border rounded-card shadow-md p-6 space-y-3">
            <h3 className="text-base font-semibold text-brand-body">Key deadlines</h3>
            <div className="grid grid-cols-1 gap-3 text-sm">
              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <div className="text-xs text-muted-foreground">VAT return submission</div>
                <div className="font-semibold text-brand-body">15 August 2025</div>
              </div>
              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <div className="text-xs text-muted-foreground">VAT payment</div>
                <div className="font-semibold text-brand-body">15 August 2025</div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">All deadlines are tracked automatically in the Compliance Calendar.</p>
          </div>

          <div className="bg-card border border-border rounded-card shadow-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-brand-body">VAT messages</h3>
            </div>
            <div className="space-y-2">
              {messages.length === 0 && <p className="text-sm text-muted-foreground">No messages yet.</p>}
              {messages.map((m) => (
                <div key={m.id} className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-3 shadow-sm">
                  <span className="text-sm text-brand-body">{m.text}</span>
                  <span className="text-xs text-muted-foreground">{new Date(m.createdAt).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card border border-border rounded-card shadow-md p-6 space-y-3">
            <h3 className="text-base font-semibold text-brand-body">Fees</h3>
            <div className="flex items-center justify-between">
              <div className="text-sm">
                <div className="font-semibold text-brand-body">Service: VAT compliance service</div>
                <div className="text-muted-foreground">Status: Included in your plan</div>
              </div>
              <Badge variant="secondary">Included</Badge>
            </div>
            <p className="text-xs text-muted-foreground">If extra charges apply, they will be shown before invoicing.</p>
          </div>

          <div className="bg-card border border-border rounded-card shadow-md p-6 space-y-3">
            <h3 className="text-base font-semibold text-brand-body">What you need to remember</h3>
            <ul className="text-sm text-brand-body list-disc pl-6 space-y-1">
              <li>Upload documents only if something is missing</li>
              <li>You can confirm no changes in one click</li>
              <li>VAT returns and payments are handled for you</li>
              <li>All past VAT returns are always available</li>
              <li>Deadlines are monitored automatically</li>
            </ul>
          </div>
        </div>
      </div>

      <Modal isOpen={uploadOpen} onClose={() => setUploadOpen(false)} title="Upload VAT documents">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Add files for this VAT period. Multiple uploads are supported.</p>
          <input
            type="file"
            multiple
            onChange={(e) => {
              const files = e.target.files;
              if (files && files.length > 0) handleUploadFiles(files);
            }}
            className="w-full rounded-lg border border-border bg-input p-2 text-sm"
          />
        </div>
      </Modal>

      <AlertModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Confirm no changes"
        message="We will mark your VAT return as In progress. You can upload documents later if needed."
        type="info"
        onConfirm={handleConfirmNoChanges}
        confirmText="Confirm"
      />

      <AlertModal
        isOpen={zipInfoOpen}
        onClose={() => setZipInfoOpen(false)}
        title="Preparing ZIP"
        message="Your filtered archive will be prepared as a ZIP. Downloads are simulated here."
        type="info"
        confirmText="OK"
      />
    </section>
  );
}
