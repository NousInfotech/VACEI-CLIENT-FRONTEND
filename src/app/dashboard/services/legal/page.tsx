"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/shared/PageHeader";

export default function LegalWorkspacePage() {
  return (
    <section className="mx-auto max-w-[1200px] w-full pt-5 space-y-6">
      <PageHeader
        title="Legal"
        subtitle="Legal requests, matters, drafts, approvals, and signed documents."
        actions={
          <div className="flex gap-2">
            <Link href="/dashboard/document-organizer/document-upload">
              <Button className="rounded-lg text-xs px-4 shadow-sm hover:shadow-md transition-shadow">Upload contracts</Button>
            </Link>
            <Link href="/dashboard/messages">
              <Button className="rounded-lg text-xs px-4 shadow-sm hover:shadow-md transition-shadow text-primary-color-new bg-light">
                Legal messages
              </Button>
            </Link>
          </div>
        }
      />

      <div className="grid gap-5 md:grid-cols-[1.3fr,1fr]">
        <div className="space-y-5">
          <div className="bg-card border border-border rounded-card shadow-md p-6 space-y-3">
            <h3 className="text-base font-semibold text-brand-body">Legal matters</h3>
            <p className="text-sm text-muted-foreground">Track matters and drafts here (UI-only).</p>
            <Button variant="outline" size="sm" className="rounded-lg text-xs shadow-sm hover:shadow-md transition-shadow">Add matter</Button>
          </div>

          <div className="bg-card border border-border rounded-card shadow-md p-6 space-y-3">
            <h3 className="text-base font-semibold text-brand-body">Drafts & approvals</h3>
            <p className="text-sm text-muted-foreground">
              Version comparison and approvals can be wired when backend is ready.
            </p>
          </div>
        </div>

        <div className="space-y-5">
          <div className="bg-card border border-border rounded-card shadow-md p-6 space-y-3">
            <h3 className="text-base font-semibold text-brand-body">Final signed documents</h3>
            <p className="text-sm text-muted-foreground">Store final PDFs and related messages.</p>
          </div>

          <div className="bg-card border border-border rounded-card shadow-md p-6 space-y-3">
            <h3 className="text-base font-semibold text-brand-body">History</h3>
            <p className="text-sm text-muted-foreground">History of changes and approvals will appear here.</p>
          </div>
        </div>
      </div>
    </section>
  );
}


