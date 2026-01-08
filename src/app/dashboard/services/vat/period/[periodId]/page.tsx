"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const MOCK_SUMMARY = {
  salesVat: "€—",
  purchaseVat: "€—",
  netVat: "€—",
  status: "In review",
  deadline: "—",
};

const MISSING_ITEMS = [
  "Missing invoice txn #44",
  "Bank statement for last month",
];

const CHECKS = [
  { label: "Basic validations", status: "✅ Passed" },
  { label: "Anomaly checks", status: "⚠ Warnings" },
  { label: "Submission blocking issues", status: "❌ Errors" },
];

export default function VatPeriodDetailPage() {
  const params = useParams<{ periodId: string }>();
  const rawId = params?.periodId ?? "";
  const displayLabel = rawId.replace(/-/g, " ").toUpperCase() || "Q2 2025";

  return (
    <section className="mx-auto max-w-[1200px] w-full pt-5 space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-brand-body">
            VAT period: {displayLabel}
          </h1>
          <p className="text-sm text-muted-foreground">
            Review missing items, automated checks and submission status for this VAT return.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/services/vat">
            <Button variant="outline" className="rounded-lg text-xs px-4 shadow-sm hover:shadow-md transition-shadow">
              Back to VAT overview
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-[1.3fr,1fr]">
        <div className="space-y-5">
          {/* Summary card */}
          <div className="bg-card border border-border rounded-card shadow-md p-6 space-y-3">
            <h3 className="text-base font-semibold text-brand-body">Summary</h3>
            <p className="text-sm text-muted-foreground">
              Sales VAT {MOCK_SUMMARY.salesVat} • Purchase VAT {MOCK_SUMMARY.purchaseVat} • Net {MOCK_SUMMARY.netVat}
            </p>
          </div>

          {/* Missing items / requests */}
          <div className="bg-card border border-border rounded-card shadow-md p-6 space-y-3">
            <h3 className="text-base font-semibold text-brand-body">Missing items / requests</h3>
            <ul className="space-y-2 text-sm">
              {MISSING_ITEMS.map((item) => (
                <li
                  key={item}
                  className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-3 shadow-sm"
                >
                  <span className="text-brand-body font-medium">{item}</span>
                  <Link href="/dashboard/document-organizer/document-upload">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-xs rounded-lg shadow-sm hover:shadow-md transition-shadow"
                    >
                      Upload
                    </Button>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Checks */}
          <div className="bg-card border border-border rounded-card shadow-md p-6 space-y-3">
            <h3 className="text-base font-semibold text-brand-body">Automated checks</h3>
            <ul className="space-y-2 text-sm">
              {CHECKS.map((check) => (
                <li
                  key={check.label}
                  className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-3 shadow-sm"
                >
                  <span className="text-brand-body font-medium">{check.label}</span>
                  <span className="text-xs text-muted-foreground">{check.status}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Submission column */}
        <div className="space-y-5">
          <div className="bg-card border border-border rounded-card shadow-md p-6 space-y-4">
            <h3 className="text-base font-semibold text-brand-body">Submission</h3>
            <p className="text-sm text-muted-foreground">
              Status: {MOCK_SUMMARY.status} • Deadline: {MOCK_SUMMARY.deadline}
            </p>
            <div className="flex flex-col gap-2 text-xs">
              <Button className="rounded-lg text-xs shadow-sm hover:shadow-md transition-shadow">
                Mark as Draft
              </Button>
              <Button variant="outline" className="rounded-lg text-xs shadow-sm hover:shadow-md transition-shadow">
                Send for review
              </Button>
              <Button variant="outline" className="rounded-lg text-xs shadow-sm hover:shadow-md transition-shadow">
                Mark as submitted (attach receipt)
              </Button>
            </div>
          </div>

          <div className="bg-card border border-border rounded-card shadow-md p-6 space-y-3">
            <h3 className="text-base font-semibold text-brand-body">Linked documents</h3>
            <p className="text-sm text-muted-foreground">
              When backend linking is available, VAT invoices and bank statements for this period will be listed here.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}


