"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";

const ROWS = [
  { code: "A1", name: "Annual Return", status: "Pending" },
  { code: "BO1", name: "Initial UBO Declaration", status: "Done" },
  { code: "BO2", name: "Change in UBO Details", status: "Waiting" },
  { code: "FS", name: "Financial Statements Filing", status: "Draft" },
  { code: "R", name: "Share Transfer", status: "Pending" },
  { code: "B2", name: "Change of Registered Office", status: "Pending" },
  { code: "K", name: "Director/Secretary Change", status: "Pending" },
];

export default function MbrSubmissionsListPage() {
  return (
    <section className="mx-auto max-w-[1200px] w-full pt-5 space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-brand-body">MBR submissions</h1>
          <p className="text-sm text-muted-foreground">
            Track all Malta Business Registry forms with statuses and quick actions.
          </p>
        </div>
        <Link href="/dashboard/services/csp-mbr">
          <Button variant="outline" className="rounded-lg text-xs px-4 shadow-sm hover:shadow-md transition-shadow">
            Back to CSP &amp; MBR
          </Button>
        </Link>
      </div>

      <div className="bg-card border border-border rounded-card shadow-md p-6 space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-3 text-xs">
            <div className="space-y-1">
              <p className="text-[11px] font-medium text-muted-foreground">Type</p>
              <Select className="h-8 text-xs w-[150px]" defaultValue="all">
                <option value="all">All</option>
                <option value="annual">Annual return</option>
                <option value="ubo">UBO forms</option>
                <option value="change">Changes</option>
              </Select>
            </div>
            <div className="space-y-1">
              <p className="text-[11px] font-medium text-muted-foreground">Status</p>
              <Select className="h-8 text-xs w-[150px]" defaultValue="all">
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="waiting">Waiting on you</option>
                <option value="done">Done</option>
              </Select>
            </div>
            <div className="space-y-1">
              <p className="text-[11px] font-medium text-muted-foreground">Year</p>
              <Select className="h-8 text-xs w-[110px]" defaultValue="2025">
                <option value="2025">2025</option>
                <option value="2024">2024</option>
                <option value="2023">2023</option>
              </Select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/60 text-muted-foreground">
              <tr>
                <th className="px-4 py-2 font-medium">Form</th>
                <th className="px-4 py-2 font-medium">Name</th>
                <th className="px-4 py-2 font-medium">Due</th>
                <th className="px-4 py-2 font-medium">Status</th>
                <th className="px-4 py-2 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => (
                <tr key={row.code} className="border-t border-border text-[11px]">
                  <td className="px-4 py-2 font-semibold text-brand-body">{row.code}</td>
                  <td className="px-4 py-2">{row.name}</td>
                  <td className="px-4 py-2">—</td>
                  <td className="px-4 py-2">{row.status}</td>
                  <td className="px-4 py-2 text-right">
                    <Link href={`/dashboard/services/csp-mbr/mbr-submissions/${row.code.toLowerCase()}`}>
                      <Button size="sm" className="h-7 rounded-lg text-[11px] px-3 shadow-sm hover:shadow-md transition-shadow">
                        {row.status === "Pending" ? "Start" : row.status === "Done" ? "View" : "Open"}
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}


