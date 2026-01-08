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
          <p className="text-sm text-muted-foreground mt-1">
            Central view of upcoming deadlines, meetings and actions.
          </p>
        </div>
        <Link href="/dashboard/todo-list">
          <Button variant="outline" className="rounded-lg px-4 text-sm shadow-sm hover:shadow-md transition-shadow">
            Open compliance task list
          </Button>
        </Link>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <KpiTile label="Overdue" value="–" tone="danger" />
        <KpiTile label="Due soon (7d)" value="–" tone="warning" />
        <KpiTile label="Waiting on you" value="–" tone="info" />
        <KpiTile label="Done" value="–" tone="success" />
      </div>

      {/* Calendar wrapper – reuse existing schedule calendar for now */}
      <div className="bg-card border border-border rounded-card shadow-md p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-lg font-semibold text-brand-body">
            Calendar view
          </h2>
          <div className="flex flex-wrap gap-3 text-xs">
            <span className="inline-flex items-center gap-2 text-brand-body">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-warning border border-warning/30" />
              <span className="text-muted-foreground">Due soon</span>
            </span>
            <span className="inline-flex items-center gap-2 text-brand-body">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-destructive border border-destructive/30" />
              <span className="text-muted-foreground">Waiting on you</span>
            </span>
            <span className="inline-flex items-center gap-2 text-brand-body">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-success border border-success/30" />
              <span className="text-muted-foreground">Done</span>
            </span>
          </div>
        </div>

        {/* ParentSchedule already renders the react-big-calendar based on meetings/tasks.
            Wrapping it here lets us keep the existing logic while giving clients a
            dedicated compliance calendar route. */}
        <div className="compliance-calendar-wrapper">
          <ParentSchedule />
        </div>
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
  const toneBorders: Record<typeof tone, string> = {
    danger: "border-destructive/30",
    warning: "border-warning/30",
    info: "border-info/30",
    success: "border-success/30",
  };
  const toneText: Record<typeof tone, string> = {
    danger: "text-destructive",
    warning: "text-warning",
    info: "text-info",
    success: "text-success",
  };
  return (
    <div
      className={`rounded-lg border ${toneBorders[tone]} bg-card px-4 py-3.5 shadow-sm`}
    >
      <p className="text-xs font-medium text-muted-foreground mb-1">{label}</p>
      <p className={`text-lg font-semibold ${toneText[tone]}`}>{value}</p>
    </div>
  );
}


