"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

const mbrForms = [
  "M1",
  "M2",
  "M3",
  "M4",
  "M5",
  "K",
  "K1",
  "K2",
  "R",
  "R1",
  "R2",
  "R3",
  "B2",
  "B3",
  "B4",
  "B5",
  "A1",
  "FS",
  "FSX",
  "BO1",
  "BO2",
  "BO3",
];

export default function CspMbrWorkspacePage() {
  return (
    <section className="mx-auto max-w-[1200px] w-full pt-5 space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-brand-body">CSP & MBR</h1>
          <p className="text-sm text-muted-foreground">
            Company profile, corporate filings, and Malta Business Registry submissions.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/document-organizer/document-upload">
            <Button className="rounded-full text-xs px-4">Upload corporate docs</Button>
          </Link>
          <Link href="/dashboard/todo-list">
            <Button variant="outline" className="rounded-full text-xs px-4">
              View requests
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-[1.3fr,1fr]">
        <div className="space-y-5">
          <div className="bg-card border border-border rounded-[16px] shadow-md p-5 space-y-3">
            <h3 className="text-base font-semibold text-brand-body">MBR overview</h3>
            <p className="text-sm text-muted-foreground">
              Status: — | Last filed: — | Upcoming deadlines: — | Penalties: —.
            </p>
          </div>

          <div className="bg-card border border-border rounded-[16px] shadow-md p-5 space-y-3">
            <h3 className="text-base font-semibold text-brand-body">Upcoming deadlines</h3>
            <ul className="space-y-2 text-sm">
              {["Annual Return A1", "Financial Statements", "UBO confirmation"].map((d) => (
                <li
                  key={d}
                  className="flex items-center justify-between rounded-lg border border-border/70 bg-muted/40 px-3 py-2"
                >
                  <span>{d}</span>
                  <Button size="sm" variant="ghost" className="text-xs rounded-full">View</Button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="space-y-5">
          <div className="bg-card border border-border rounded-[16px] shadow-md p-5 space-y-3">
            <h3 className="text-base font-semibold text-brand-body">MBR forms (UI-only)</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {mbrForms.map((code) => (
                <div
                  key={code}
                  className="rounded-lg border border-border/60 bg-muted/30 px-3 py-2 flex items-center justify-between"
                >
                  <span className="font-semibold text-brand-body">{code}</span>
                  <Button variant="ghost" size="sm" className="text-[11px] rounded-full">
                    Open
                  </Button>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground">
              Draft → Waiting → Submitted → Registered. Upload supporting docs and store receipts when backend is ready.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}


