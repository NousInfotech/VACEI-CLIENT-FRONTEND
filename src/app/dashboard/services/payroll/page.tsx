"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/shared/PageHeader";

export default function PayrollWorkspacePage() {
  return (
    <section className="mx-auto max-w-[1200px] w-full pt-5 space-y-6">
      <PageHeader
        title="Payroll"
        subtitle="Payslips, run status, history, and payroll requests."
        actions={
          <div className="flex gap-2">
            <Link href="/dashboard/document-organizer/document-upload">
              <Button className="rounded-lg text-xs px-4 shadow-sm hover:shadow-md transition-shadow">Upload payroll docs</Button>
            </Link>
            <Link href="/dashboard/todo-list">
              <Button className="rounded-lg text-xs px-4 shadow-sm hover:shadow-md transition-shadow text-primary-color-new bg-light">
                View requests
              </Button>
            </Link>
          </div>
        }
      />

      <div className="grid gap-5 md:grid-cols-[1.3fr,1fr]">
        <div className="space-y-5">
          <div className="bg-card border border-border rounded-card shadow-md p-6 space-y-3">
            <h3 className="text-base font-semibold text-brand-body">Payslips</h3>
            <ul className="space-y-2 text-sm">
              {["Jan 2025", "Feb 2025", "Mar 2025"].map((m) => (
                <li
                  key={m}
                  className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-3 shadow-sm"
                >
                  <span className="text-brand-body font-medium">{m}</span>
                  <Button size="sm" variant="ghost" className="text-xs rounded-lg shadow-sm hover:shadow-md transition-shadow">Download</Button>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-card border border-border rounded-card shadow-md p-6 space-y-3">
            <h3 className="text-base font-semibold text-brand-body">Payroll run status</h3>
            <p className="text-sm text-muted-foreground">Next run: — | Status: —</p>
          </div>
        </div>

        <div className="space-y-5">
          <div className="bg-card border border-border rounded-card shadow-md p-6 space-y-3">
            <h3 className="text-base font-semibold text-brand-body">Payroll history</h3>
            <p className="text-sm text-muted-foreground">Previous runs and requests will appear here.</p>
          </div>

          <div className="bg-card border border-border rounded-card shadow-md p-6 space-y-3">
            <h3 className="text-base font-semibold text-brand-body">Payroll requests</h3>
            <p className="text-sm text-muted-foreground">
              Use To-Do list to track client requests related to payroll.
            </p>
            <Link href="/dashboard/todo-list">
              <Button variant="outline" size="sm" className="rounded-lg text-xs shadow-sm hover:shadow-md transition-shadow">Open To-Do</Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}


