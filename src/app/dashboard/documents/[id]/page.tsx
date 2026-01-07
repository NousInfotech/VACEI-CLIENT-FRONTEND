"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function DocumentDetailPage() {
  const params = useParams<{ id: string }>();
  const docId = decodeURIComponent((params?.id as string) || "");

  // UI-only placeholder data; replace with real fetch when backend endpoint is ready.
  const doc = useMemo(
    () => ({
      title: `Document ${docId}`,
      service: "Unassigned",
      period: "—",
      status: "Uploaded",
      size: "—",
      type: "—",
      uploadedAt: "—",
      uploadedBy: "You",
      tags: ["General"],
      versions: [
        { label: "v1 (current)", date: "—", by: "You" },
        { label: "v0", date: "—", by: "You" },
      ],
      linked: ["Bookkeeping", "VAT"],
      auditTrail: [
        { action: "Uploaded", by: "You", at: "—" },
        { action: "Tagged", by: "You", at: "—" },
      ],
    }),
    [docId]
  );

  return (
    <section className="mx-auto max-w-[1200px] w-full pt-5 space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-brand-body">
            {doc.title}
          </h1>
          <p className="text-sm text-muted-foreground">
            Document detail, versions, and linked services.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/document-organizer/document-upload">
            <Button variant="outline" className="rounded-lg text-xs px-4 shadow-sm hover:shadow-md transition-shadow">
              Upload new version
            </Button>
          </Link>
          <Button className="rounded-lg text-xs px-4 shadow-sm hover:shadow-md transition-shadow" variant="default">
            Download
          </Button>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-[2fr,1fr]">
        {/* Left column */}
        <div className="space-y-5">
          <div className="bg-card border border-border rounded-card shadow-md p-6">
            <div className="grid gap-3 md:grid-cols-2 text-sm">
              <Field label="Status" value={doc.status} />
              <Field label="Service" value={doc.service} />
              <Field label="Period" value={doc.period} />
              <Field label="Type" value={doc.type} />
              <Field label="Size" value={doc.size} />
              <Field label="Uploaded" value={`${doc.uploadedAt} by ${doc.uploadedBy}`} />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {doc.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-lg bg-muted border border-border px-2.5 py-1 text-xs font-medium text-brand-body"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-card border border-border rounded-card shadow-md p-6 space-y-3">
            <h3 className="text-base font-semibold text-brand-body">Preview</h3>
            <div className="h-[260px] rounded-lg border border-dashed border-border bg-muted/30 flex items-center justify-center text-sm text-muted-foreground shadow-sm">
              Preview placeholder (wire to file URL when available)
            </div>
          </div>

          <div className="bg-card border border-border rounded-card shadow-md p-6 space-y-3">
            <h3 className="text-base font-semibold text-brand-body">Comments (UI-only)</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>No comments yet. Add comments when backend endpoint is available.</p>
            </div>
          </div>

          <div className="bg-card border border-border rounded-card shadow-md p-6 space-y-3">
            <h3 className="text-base font-semibold text-brand-body">Audit trail (UI-only)</h3>
            <ul className="space-y-2 text-sm">
              {doc.auditTrail.map((item, idx) => (
                <li key={idx} className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2 shadow-sm">
                  <span className="text-brand-body font-medium">{item.action}</span>
                  <span className="text-xs text-muted-foreground">
                    {item.by} · {item.at}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          <div className="bg-card border border-border rounded-card shadow-md p-6 space-y-3">
            <h3 className="text-base font-semibold text-brand-body">Versions</h3>
            <ul className="space-y-2 text-sm">
              {doc.versions.map((v) => (
                <li
                  key={v.label}
                  className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-3 shadow-sm"
                >
                  <div>
                    <div className="font-semibold text-brand-body">{v.label}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {v.date} · {v.by}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="text-xs rounded-lg shadow-sm hover:shadow-md transition-shadow">
                    Download
                  </Button>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-card border border-border rounded-card shadow-md p-6 space-y-3">
            <h3 className="text-base font-semibold text-brand-body">Linked items (UI-only)</h3>
            <div className="flex flex-wrap gap-2 text-xs">
              {doc.linked.map((l) => (
                <span key={l} className="rounded-lg bg-muted border border-border px-2.5 py-1 font-medium text-brand-body">
                  {l}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-sm font-medium text-brand-body">{value}</p>
    </div>
  );
}


