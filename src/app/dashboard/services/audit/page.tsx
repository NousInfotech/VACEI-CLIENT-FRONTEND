"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AuditWorkspacePage() {
  return (
    <section className="mx-auto max-w-[1200px] w-full pt-5 space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-brand-body">Audit</h1>
          <p className="text-sm text-muted-foreground">
            Engagement overview, document requests, audit queries, and reports.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/document-organizer/document-upload">
            <Button className="rounded-lg text-xs px-4 shadow-sm hover:shadow-md transition-shadow">Upload PBC docs</Button>
          </Link>
          <Link href="/dashboard/todo-list">
            <Button variant="outline" className="rounded-lg text-xs px-4 shadow-sm hover:shadow-md transition-shadow">
              View audit tasks
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-[1.3fr,1fr]">
        <div className="space-y-5">
          <div className="bg-card border border-border rounded-card shadow-md p-6 space-y-3">
            <h3 className="text-base font-semibold text-brand-body">Engagement overview</h3>
            <p className="text-sm text-muted-foreground">Status: — | Year-end: — | Phase: —</p>
          </div>

          <div className="bg-card border border-border rounded-card shadow-md p-6 space-y-3">
            <h3 className="text-base font-semibold text-brand-body">Document requests</h3>
            <p className="text-sm text-muted-foreground">
              Track PBCs via To-Do list; replace with audit-specific requests when backend is ready.
            </p>
            <Link href="/dashboard/todo-list">
              <Button variant="outline" size="sm" className="rounded-lg text-xs shadow-sm hover:shadow-md transition-shadow">Open To-Do</Button>
            </Link>
          </div>
        </div>

        <div className="space-y-5">
          <div className="bg-card border border-border rounded-card shadow-md p-6 space-y-3">
            <h3 className="text-base font-semibold text-brand-body">Audit queries</h3>
            <p className="text-sm text-muted-foreground">Use Messages to respond to audit questions.</p>
            <Link href="/dashboard/messages">
              <Button variant="ghost" size="sm" className="rounded-lg text-xs shadow-sm hover:shadow-md transition-shadow">Go to Messages</Button>
            </Link>
          </div>

          <div className="bg-card border border-border rounded-card shadow-md p-6 space-y-3">
            <h3 className="text-base font-semibold text-brand-body">Reports & archive</h3>
            <p className="text-sm text-muted-foreground">Draft/final reports and archive will surface here.</p>
          </div>
        </div>
      </div>
    </section>
  );
}


