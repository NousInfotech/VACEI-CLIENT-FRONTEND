"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import ParentSchedule from "@/app/dashboard/schedule/page";

export default function ComplianceCalendarPage() {
  return (
    <section className="mx-auto max-w-[1400px] w-full pt-5 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-brand-body">
            Compliance calendar
          </h1>
          <p className="text-sm text-muted-foreground">
            Central view of upcoming deadlines, meetings and actions.
          </p>
        </div>
        <Link href="/dashboard/todo-list">
          <Button variant="outline" className="rounded-full px-4 text-sm">
            Open compliance task list
          </Button>
        </Link>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiTile label="Overdue" value="–" tone="danger" />
        <KpiTile label="Due soon (7d)" value="–" tone="warning" />
        <KpiTile label="Waiting on you" value="–" tone="info" />
        <KpiTile label="Done" value="–" tone="success" />
      </div>

      {/* Calendar wrapper – reuse existing schedule calendar for now */}
      <div className="bg-card border border-border rounded-[16px] shadow-md p-4 md:p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base md:text-lg font-medium text-brand-body">
            Calendar view
          </h2>
          <div className="flex gap-2 text-xs">
            <span className="inline-flex items-center gap-1 text-muted-foreground">
              <span className="inline-block h-2 w-2 rounded-full bg-amber-500" />
              Due soon
            </span>
            <span className="inline-flex items-center gap-1 text-muted-foreground">
              <span className="inline-block h-2 w-2 rounded-full bg-red-500" />
              Waiting on you
            </span>
            <span className="inline-flex items-center gap-1 text-muted-foreground">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
              Done
            </span>
          </div>
        </div>

        {/* ParentSchedule already renders the react-big-calendar based on meetings/tasks.
            Wrapping it here lets us keep the existing logic while giving clients a
            dedicated compliance calendar route. */}
        <ParentSchedule />
      </div>
    </section>
  );
}

function KpiTile({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "danger" | "warning" | "info" | "success";
}) {
  const toneClasses: Record<typeof tone, string> = {
    danger: "border-red-200 bg-red-50 text-red-800",
    warning: "border-amber-200 bg-amber-50 text-amber-800",
    info: "border-sky-200 bg-sky-50 text-sky-800",
    success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  };
  return (
    <div
      className={`rounded-[14px] border px-4 py-3 text-xs shadow-sm ${toneClasses[tone]}`}
    >
      <p className="font-medium">{label}</p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
    </div>
  );
}


