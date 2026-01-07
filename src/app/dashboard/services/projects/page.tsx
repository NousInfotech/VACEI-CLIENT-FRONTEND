"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ProjectsWorkspacePage() {
  return (
    <section className="mx-auto max-w-[1200px] w-full pt-5 space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-brand-body">Projects / Transactions</h1>
          <p className="text-sm text-muted-foreground">
            Create projects, track milestones, tasks, and data room items.
          </p>
        </div>
        <div className="flex gap-2">
          <Button className="rounded-lg text-xs px-4 shadow-sm hover:shadow-md transition-shadow">Create project</Button>
          <Link href="/dashboard/todo-list">
            <Button variant="outline" className="rounded-lg text-xs px-4 shadow-sm hover:shadow-md transition-shadow">
              View project tasks
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-[1.3fr,1fr]">
        <div className="space-y-5">
          <div className="bg-card border border-border rounded-card shadow-md p-6 space-y-3">
            <h3 className="text-base font-semibold text-brand-body">Projects</h3>
            <p className="text-sm text-muted-foreground">List of projects will appear here (UI-only).</p>
          </div>

          <div className="bg-card border border-border rounded-card shadow-md p-6 space-y-3">
            <h3 className="text-base font-semibold text-brand-body">Milestones</h3>
            <p className="text-sm text-muted-foreground">Add milestones and track progress when backend is ready.</p>
          </div>
        </div>

        <div className="space-y-5">
          <div className="bg-card border border-border rounded-card shadow-md p-6 space-y-3">
            <h3 className="text-base font-semibold text-brand-body">Data room</h3>
            <p className="text-sm text-muted-foreground">Use Documents to store and share files; link them here later.</p>
          </div>

          <div className="bg-card border border-border rounded-card shadow-md p-6 space-y-3">
            <h3 className="text-base font-semibold text-brand-body">History</h3>
            <p className="text-sm text-muted-foreground">Timeline of project events will appear here.</p>
          </div>
        </div>
      </div>
    </section>
  );
}


