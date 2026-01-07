"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LegalWorkspacePage() {
  return (
    <section className="mx-auto max-w-[1200px] w-full pt-5 space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-brand-body">Legal</h1>
          <p className="text-sm text-muted-foreground">
            Legal requests, matters, drafts, approvals, and signed documents.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/document-organizer/document-upload">
            <Button className="rounded-lg text-xs px-4 shadow-sm hover:shadow-md transition-shadow">Upload contracts</Button>
          </Link>
          <Link href="/dashboard/messages">
            <Button variant="outline" className="rounded-lg text-xs px-4 shadow-sm hover:shadow-md transition-shadow">
              Legal messages
            </Button>
          </Link>
        </div>
      </div>

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


