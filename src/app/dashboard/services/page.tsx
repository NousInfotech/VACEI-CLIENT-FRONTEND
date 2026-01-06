"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Book02Icon,
  TaxesIcon,
  CashbackPoundIcon,
  DocumentValidationIcon,
  GitPullRequestIcon,
  ProfileIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

const serviceCards = [
  {
    slug: "bookkeeping",
    title: "Bookkeeping",
    status: "Waiting docs",
    statusTone: "warning",
    href: "/dashboard/financial-statements/profit-loss",
    icon: Book02Icon,
    description: "Monthly books, reconciliations and reports.",
  },
  {
    slug: "vat",
    title: "VAT & Tax",
    status: "Draft",
    statusTone: "info",
    href: "/dashboard/tax",
    icon: TaxesIcon,
    description: "VAT periods, submissions and tax review.",
  },
  {
    slug: "payroll",
    title: "Payroll",
    status: "Done",
    statusTone: "success",
    href: "/dashboard/invoices",
    icon: CashbackPoundIcon,
    description: "Payslips history via invoice exports.",
  },
  {
    slug: "documents",
    title: "Documents",
    status: "Open",
    statusTone: "info",
    href: "/dashboard/documents",
    icon: DocumentValidationIcon,
    description: "Central document vault and requests.",
  },
  {
    slug: "projects",
    title: "Projects",
    status: "None",
    statusTone: "muted",
    href: "/dashboard/todo-list",
    icon: GitPullRequestIcon,
    description: "Use the To‑Do list to coordinate projects.",
  },
  {
    slug: "compliance",
    title: "Compliance & MBR",
    status: "Due soon",
    statusTone: "warning",
    href: "/dashboard/compliance",
    icon: ProfileIcon,
    description: "Calendar of statutory and MBR deadlines.",
  },
  {
    slug: "bk",
    title: "Bookkeeping workspace",
    status: "Open",
    statusTone: "info",
    href: "/dashboard/services/bookkeeping",
    icon: Book02Icon,
    description: "Status, missing items, uploads, summaries.",
  },
  {
    slug: "vat-workspace",
    title: "VAT workspace",
    status: "Open",
    statusTone: "info",
    href: "/dashboard/services/vat",
    icon: TaxesIcon,
    description: "Registrations, periods, submissions, payments.",
  },
  {
    slug: "payroll-workspace",
    title: "Payroll workspace",
    status: "Open",
    statusTone: "info",
    href: "/dashboard/services/payroll",
    icon: CashbackPoundIcon,
    description: "Payslips, run status, requests, history.",
  },
  {
    slug: "audit",
    title: "Audit workspace",
    status: "Open",
    statusTone: "info",
    href: "/dashboard/services/audit",
    icon: ProfileIcon,
    description: "Engagement, PBCs, queries, reports.",
  },
  {
    slug: "csp-mbr",
    title: "CSP / MBR",
    status: "Open",
    statusTone: "info",
    href: "/dashboard/services/csp-mbr",
    icon: ProfileIcon,
    description: "Corporate profile, filings, MBR forms.",
  },
  {
    slug: "legal",
    title: "Legal workspace",
    status: "Open",
    statusTone: "info",
    href: "/dashboard/services/legal",
    icon: ProfileIcon,
    description: "Matters, drafts, approvals, signed docs.",
  },
  {
    slug: "projects-ws",
    title: "Projects / Transactions",
    status: "Open",
    statusTone: "info",
    href: "/dashboard/services/projects",
    icon: GitPullRequestIcon,
    description: "Projects, milestones, data room.",
  },
] as const;

function StatusBadge({
  tone,
  children,
}: {
  tone: "warning" | "info" | "success" | "muted";
  children: React.ReactNode;
}) {
  const base =
    "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium border";
  const toneClasses: Record<typeof tone, string> = {
    warning:
      "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-500/10 dark:text-amber-200 dark:border-amber-500/30",
    info: "bg-sky-50 text-sky-800 border-sky-200 dark:bg-sky-500/10 dark:text-sky-200 dark:border-sky-500/30",
    success:
      "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-200 dark:border-emerald-500/30",
    muted:
      "bg-muted text-muted-foreground border-border/60 dark:bg-muted/60 dark:text-muted-foreground/80",
  };
  return <span className={`${base} ${toneClasses[tone]}`}>{children}</span>;
}

export default function ServicesHubPage() {
  return (
    <section className="mx-auto max-w-[1400px] w-full pt-5 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-brand-body">
            Services
          </h1>
          <p className="text-sm text-muted-foreground">
            All active workspaces for this company – bookkeeping, VAT, payroll,
            audit and more.
          </p>
        </div>
        <Link href="/dashboard/todo-list">
          <Button variant="outline" className="rounded-full px-4 text-sm">
            View pending actions
          </Button>
        </Link>
      </div>

      <div className="bg-card border border-border rounded-[16px] shadow-md p-5 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-base md:text-lg font-medium text-brand-body">
            Service overview
          </h2>
          <div className="flex gap-2">
            <Link href="/dashboard/services/request">
              <Button variant="default" size="sm" className="rounded-full text-xs">
                Request new service
              </Button>
            </Link>
            <Link href="/dashboard/quickbooks-sync">
              <Button variant="ghost" size="sm" className="rounded-full text-xs">
                Manage integrations
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {serviceCards.map((card) => (
            <Link key={card.slug} href={card.href}>
              <article className="group relative flex h-full cursor-pointer flex-col justify-between rounded-[16px] border border-border bg-background/80 p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-md">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <HugeiconsIcon icon={card.icon} className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-brand-body">
                        {card.title}
                      </h3>
                      <p className="text-[11px] text-muted-foreground">
                        {card.description}
                      </p>
                    </div>
                  </div>
                  <StatusBadge tone={card.statusTone}>{card.status}</StatusBadge>
                </div>

                <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Open workspace</span>
                  <span className="flex items-center gap-1 text-primary font-medium">
                    Open
                    <span aria-hidden className="text-[10px]">→</span>
                  </span>
                </div>
              </article>
            </Link>
          ))}
        </div>

        <div className="mt-2 flex items-center justify-between rounded-[14px] border border-dashed border-border bg-muted/40 px-4 py-3">
          <div className="space-y-0.5">
            <p className="text-xs font-medium text-brand-body">
              Need something that is not listed?
            </p>
            <p className="text-[11px] text-muted-foreground">
              Use your existing To‑Do / tasks and chat to coordinate custom
              projects with your accountant.
            </p>
          </div>
          <Link href="/dashboard/todo-list">
            <Button size="sm" className="rounded-full text-xs">
              Request new service
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}


