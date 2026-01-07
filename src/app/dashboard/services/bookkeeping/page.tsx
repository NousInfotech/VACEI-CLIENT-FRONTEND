"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function BookkeepingWorkspacePage() {
  return (
    <section className="mx-auto max-w-[1200px] w-full pt-5 space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-brand-body">Bookkeeping</h1>
          <p className="text-sm text-muted-foreground">
            Overview of status, missing items, uploads, and monthly summaries.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/document-organizer/document-upload">
            <Button className="rounded-lg text-xs px-4 shadow-sm hover:shadow-md transition-shadow">Upload documents</Button>
          </Link>
          <Link href="/dashboard/todo-list">
            <Button variant="outline" className="rounded-lg text-xs px-4 shadow-sm hover:shadow-md transition-shadow">
              View requests
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-[1.3fr,1fr]">
        <div className="space-y-5">
          <div className="bg-card border border-border rounded-card shadow-md p-6 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Status</p>
                <h3 className="text-lg font-semibold text-brand-body">In Progress</h3>
                <p className="text-sm text-muted-foreground">Last completed: —</p>
              </div>
              <Button variant="outline" size="sm" className="rounded-lg text-xs shadow-sm hover:shadow-md transition-shadow">
                Download report (PDF)
              </Button>
            </div>
          </div>

          <div className="bg-card border border-border rounded-card shadow-md p-6 space-y-3">
            <h3 className="text-base font-semibold text-brand-body">Missing items</h3>
            <ul className="space-y-2 text-sm">
              {["Bank statements (latest period)", "Card statements", "Unlinked invoices"].map((item) => (
                <li
                  key={item}
                  className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-3 shadow-sm"
                >
                  <span className="text-brand-body font-medium">{item}</span>
                  <Link href="/dashboard/document-organizer/document-upload">
                    <Button size="sm" variant="ghost" className="text-xs rounded-lg shadow-sm hover:shadow-md transition-shadow">Upload</Button>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-card border border-border rounded-card shadow-md p-6 space-y-3">
            <h3 className="text-base font-semibold text-brand-body">Requests / tasks</h3>
            <p className="text-sm text-muted-foreground">
              This section can list To-Do tasks filtered for bookkeeping. Link to To-Do list for now.
            </p>
            <Link href="/dashboard/todo-list">
              <Button variant="outline" size="sm" className="rounded-lg text-xs shadow-sm hover:shadow-md transition-shadow">Open To-Do</Button>
            </Link>
          </div>
        </div>

        <div className="space-y-5">
          <div className="bg-card border border-border rounded-card shadow-md p-6 space-y-4">
            <h3 className="text-base font-semibold text-brand-body">Monthly summaries</h3>
            <div className="grid grid-cols-4 gap-3 text-sm">
              {["Jan", "Feb", "Mar", "Apr", "May", "Jun"].map((m) => (
                <div key={m} className="rounded-lg border border-border bg-muted/30 px-3 py-3 text-center shadow-sm">
                  <div className="font-semibold text-brand-body">{m}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">—</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card border border-border rounded-card shadow-md p-6 space-y-3">
            <h3 className="text-base font-semibold text-brand-body">Insights (read-only)</h3>
            <p className="text-sm text-muted-foreground">
              Bank activity, income/expense summaries, category breakdowns, linked/unlinked documents.
              Add data wiring when backend is available.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}


