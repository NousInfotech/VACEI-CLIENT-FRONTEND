"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const REQUIRED_DOCS = [
  "ID of officer",
  "Proof of address",
];

export default function MbrFormDetailPage() {
  const params = useParams<{ code: string }>();
  const code = (params?.code || "a1").toUpperCase();

  return (
    <section className="mx-auto max-w-[1200px] w-full pt-5 space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-brand-body">
            MBR form: {code}
          </h1>
          <p className="text-sm text-muted-foreground">
            Draft, supporting documents and messages for this specific MBR filing.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/services/csp-mbr/mbr-submissions">
            <Button variant="outline" className="rounded-lg text-xs px-4 shadow-sm hover:shadow-md transition-shadow">
              Back to submissions
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-[1.3fr,1fr]">
        <div className="space-y-5">
          {/* Required documents checklist */}
          <div className="bg-card border border-border rounded-card shadow-md p-6 space-y-3">
            <h3 className="text-base font-semibold text-brand-body">Required documents checklist</h3>
            <ul className="space-y-2 text-sm">
              {REQUIRED_DOCS.map((label) => (
                <li
                  key={label}
                  className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-3 shadow-sm"
                >
                  <span className="text-brand-body font-medium">{label}</span>
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

          {/* Messages */}
          <div className="bg-card border border-border rounded-card shadow-md p-6 space-y-3">
            <h3 className="text-base font-semibold text-brand-body">Messages</h3>
            <p className="text-sm text-muted-foreground">
              Conversation with your CSP team about this filing will appear here. Use the Messages workspace for full history.
            </p>
          </div>
        </div>

        {/* Form preview / status */}
        <div className="space-y-5">
          <div className="bg-card border border-border rounded-card shadow-md p-6 space-y-3">
            <h3 className="text-base font-semibold text-brand-body">Status</h3>
            <p className="text-sm text-muted-foreground">
              Draft / Waiting on you / Submitted / Registered.
            </p>
            <div className="flex flex-col gap-2 text-xs mt-2">
              <Button className="rounded-lg text-xs shadow-sm hover:shadow-md transition-shadow">
                Mark as Draft
              </Button>
              <Button variant="outline" className="rounded-lg text-xs shadow-sm hover:shadow-md transition-shadow">
                Send to firm
              </Button>
              <Button variant="outline" className="rounded-lg text-xs shadow-sm hover:shadow-md transition-shadow">
                Mark as submitted (attach receipt)
              </Button>
            </div>
          </div>

          <div className="bg-card border border-border rounded-card shadow-md p-6 space-y-3">
            <h3 className="text-base font-semibold text-brand-body">Form preview / draft PDF</h3>
            <p className="text-sm text-muted-foreground">
              When backend integration is ready, a read‑only preview or generated PDF of the A1/BO/FS form will be shown here.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}


