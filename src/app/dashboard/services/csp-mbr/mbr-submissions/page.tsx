"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import Dropdown from "@/components/Dropdown";
import { ChevronDown } from "lucide-react";

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
              <Dropdown
                className="w-[150px]"
                trigger={
                  <Button variant="outline" size="sm" className="h-8 w-[150px] justify-between text-xs">
                    All
                    <ChevronDown className="h-3 w-3 opacity-50" />
                  </Button>
                }
                items={[
                  { id: "all", label: "All", onClick: () => {} },
                  { id: "annual", label: "Annual return", onClick: () => {} },
                  { id: "ubo", label: "UBO forms", onClick: () => {} },
                  { id: "change", label: "Changes", onClick: () => {} }
                ]}
              />
            </div>
            <div className="space-y-1">
              <p className="text-[11px] font-medium text-muted-foreground">Status</p>
              <Dropdown
                className="w-[150px]"
                trigger={
                  <Button variant="outline" size="sm" className="h-8 w-[150px] justify-between text-xs">
                    All
                    <ChevronDown className="h-3 w-3 opacity-50" />
                  </Button>
                }
                items={[
                  { id: "all", label: "All", onClick: () => {} },
                  { id: "pending", label: "Pending", onClick: () => {} },
                  { id: "waiting", label: "Waiting on you", onClick: () => {} },
                  { id: "done", label: "Done", onClick: () => {} }
                ]}
              />
            </div>
            <div className="space-y-1">
              <p className="text-[11px] font-medium text-muted-foreground">Year</p>
              <Dropdown
                className="w-[110px]"
                trigger={
                  <Button variant="outline" size="sm" className="h-8 w-[110px] justify-between text-xs">
                    2025
                    <ChevronDown className="h-3 w-3 opacity-50" />
                  </Button>
                }
                items={[
                  { id: "2025", label: "2025", onClick: () => {} },
                  { id: "2024", label: "2024", onClick: () => {} },
                  { id: "2023", label: "2023", onClick: () => {} }
                ]}
              />
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


