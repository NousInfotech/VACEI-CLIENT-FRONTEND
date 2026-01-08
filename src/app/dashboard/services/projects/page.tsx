"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";

type Project = {
  id: string;
  name: string;
  type: string;
  status: string;
  nextMilestone: string;
};

const MOCK_PROJECTS: Project[] = [
  { id: "p1", name: "Cross‑border merger", type: "Merger", status: "In progress", nextMilestone: "Docs" },
  { id: "p2", name: "Liquidation – OldCo Ltd", type: "Liquidation", status: "Not started", nextMilestone: "Intake" },
];

export default function ProjectsWorkspacePage() {
  const [projectType, setProjectType] = useState("merger");
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>("p1");

  const selectedProject = MOCK_PROJECTS.find((p) => p.id === selectedProjectId) || MOCK_PROJECTS[0];

  return (
    <section className="mx-auto max-w-[1200px] w-full pt-5 space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-brand-body">Projects / Transactions</h1>
          <p className="text-sm text-muted-foreground">
            Create projects, track milestones, tasks, and data room items.
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground">Type</span>
            <Select
              value={projectType}
              onChange={(e) => setProjectType(e.target.value)}
              className="h-8 text-xs w-[170px]"
            >
              <option value="merger">Merger</option>
              <option value="liquidation">Liquidation</option>
              <option value="m&a">M&A</option>
              <option value="advisory">Advisory</option>
            </Select>
          </div>
          <Button className="rounded-lg text-xs px-4 shadow-sm hover:shadow-md transition-shadow">
            Create project
          </Button>
          <Link href="/dashboard/todo-list">
            <Button variant="outline" className="rounded-lg text-xs px-4 shadow-sm hover:shadow-md transition-shadow">
              View project tasks
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-[1.3fr,1fr]">
        <div className="space-y-5">
          <div className="bg-card border border-border rounded-card shadow-md p-6 space-y-4">
            <h3 className="text-base font-semibold text-brand-body">Projects</h3>
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/60 text-muted-foreground">
                  <tr>
                    <th className="px-4 py-2 font-medium">Name</th>
                    <th className="px-4 py-2 font-medium">Type</th>
                    <th className="px-4 py-2 font-medium">Status</th>
                    <th className="px-4 py-2 font-medium">Next milestone</th>
                    <th className="px-4 py-2 font-medium text-right">Open</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_PROJECTS.map((p) => (
                    <tr key={p.id} className="border-t border-border">
                      <td className="px-4 py-2 text-brand-body font-semibold">{p.name}</td>
                      <td className="px-4 py-2">{p.type}</td>
                      <td className="px-4 py-2">{p.status}</td>
                      <td className="px-4 py-2">{p.nextMilestone}</td>
                      <td className="px-4 py-2 text-right">
                        <button
                          type="button"
                          className="text-xs font-medium text-primary hover:underline"
                          onClick={() => setSelectedProjectId(p.id)}
                        >
                          Open
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-card border border-border rounded-card shadow-md p-6 space-y-3">
            <h3 className="text-base font-semibold text-brand-body">Milestones</h3>
            <p className="text-sm text-muted-foreground">
              Milestones for the selected project appear in order from Intake → Docs → Review → Filing → Complete.
            </p>
            <ol className="mt-2 space-y-1 text-xs">
              {["Intake", "Docs", "Review", "Filing", "Complete"].map((label, idx) => (
                <li key={label} className="flex items-center gap-2">
                  <span className="h-5 w-5 rounded-full border border-border flex items-center justify-center text-[10px]">
                    {idx + 1}
                  </span>
                  <span>{label}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="space-y-5">
          <div className="bg-card border border-border rounded-card shadow-md p-6 space-y-3">
            <h3 className="text-base font-semibold text-brand-body">Data room</h3>
            <p className="text-sm text-muted-foreground">
              Use the Documents workspace as the source of truth for files. Once backend linking is available, documents can be
              scoped to this project here.
            </p>
            <Link href="/dashboard/document-organizer/document-listing">
              <Button
                variant="outline"
                size="sm"
                className="mt-2 rounded-lg text-xs shadow-sm hover:shadow-md transition-shadow"
              >
                Open documents
              </Button>
            </Link>
          </div>

          <div className="bg-card border border-border rounded-card shadow-md p-6 space-y-3">
            <h3 className="text-base font-semibold text-brand-body">History</h3>
            <p className="text-sm text-muted-foreground">
              Timeline of key project events (docs received, milestones completed, filings submitted) will be shown here when
              wired to backend activity logs.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

