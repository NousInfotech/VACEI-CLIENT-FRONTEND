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
import { 
  BookOpen, 
  Receipt, 
  Users, 
  FileText, 
  Briefcase, 
  Scale, 
  Building2, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Plus, 
  ArrowRight, 
  Settings,
  Sparkles,
  TrendingUp
} from "lucide-react";

// Service categories
const serviceCategories = [
  {
    id: "core",
    title: "Core Services",
    description: "Essential accounting and compliance services",
    services: [
      {
        slug: "bookkeeping",
        title: "Bookkeeping",
        status: "Waiting docs",
        statusTone: "warning",
        href: "/dashboard/services/bookkeeping",
        icon: Book02Icon,
        description: "Monthly books, reconciliations and reports.",
        color: "blue",
      },
      {
        slug: "vat",
        title: "VAT & Tax",
        status: "Draft",
        statusTone: "info",
        href: "/dashboard/services/vat",
        icon: TaxesIcon,
        description: "VAT periods, submissions and tax review.",
        color: "green",
      },
      {
        slug: "payroll",
        title: "Payroll",
        status: "Done",
        statusTone: "success",
        href: "/dashboard/services/payroll",
        icon: CashbackPoundIcon,
        description: "Payslips history via invoice exports.",
        color: "purple",
      },
    ],
  },
  {
    id: "compliance",
    title: "Compliance & Corporate",
    description: "Regulatory filings and corporate services",
    services: [
      {
        slug: "compliance",
        title: "Compliance & MBR",
        status: "Due soon",
        statusTone: "warning",
        href: "/dashboard/compliance",
        icon: ProfileIcon,
        description: "Calendar of statutory and MBR deadlines.",
        color: "orange",
      },
      {
        slug: "csp-mbr",
        title: "CSP / MBR",
        status: "Open",
        statusTone: "info",
        href: "/dashboard/services/csp-mbr",
        icon: ProfileIcon,
        description: "Corporate profile, filings, MBR forms.",
        color: "teal",
      },
    ],
  },
  {
    id: "workspaces",
    title: "Workspaces",
    description: "Specialized service workspaces",
    services: [
      {
        slug: "audit",
        title: "Audit",
        status: "Open",
        statusTone: "info",
        href: "/dashboard/services/audit",
        icon: ProfileIcon,
        description: "Engagement, PBCs, queries, reports.",
        color: "indigo",
      },
      {
        slug: "legal",
        title: "Legal",
        status: "Open",
        statusTone: "info",
        href: "/dashboard/services/legal",
        icon: ProfileIcon,
        description: "Matters, drafts, approvals, signed docs.",
        color: "red",
      },
      {
        slug: "projects",
        title: "Projects & Transactions",
        status: "Open",
        statusTone: "info",
        href: "/dashboard/services/projects",
        icon: GitPullRequestIcon,
        description: "Projects, milestones, data room.",
        color: "pink",
      },
    ],
  },
  {
    id: "tools",
    title: "Tools & Resources",
    description: "Document management and integrations",
    services: [
      {
        slug: "documents",
        title: "Documents",
        status: "Open",
        statusTone: "info",
        href: "/dashboard/documents",
        icon: DocumentValidationIcon,
        description: "Central document vault and requests.",
        color: "slate",
      },
    ],
  },
] as const;

function StatusBadge({
  tone,
  children,
}: {
  tone: "warning" | "info" | "success" | "muted";
  children: React.ReactNode;
}) {
  const toneClasses: Record<typeof tone, { bg: string; text: string; icon: any }> = {
    warning: {
      bg: "bg-warning/10 border-warning/30",
      text: "text-warning",
      icon: Clock,
    },
    info: {
      bg: "bg-info/10 border-info/30",
      text: "text-info",
      icon: AlertCircle,
    },
    success: {
      bg: "bg-success/10 border-success/30",
      text: "text-success",
      icon: CheckCircle2,
    },
    muted: {
      bg: "bg-muted border-border",
      text: "text-muted-foreground",
      icon: null,
    },
  };
  const classes = toneClasses[tone];
  const Icon = classes.icon;
  
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${classes.bg} ${classes.text} shadow-sm`}>
      {Icon && <Icon className="w-3 h-3" />}
      {children}
    </span>
  );
}

type ServiceType = {
  slug: string;
  title: string;
  status: string;
  statusTone: "warning" | "info" | "success" | "muted";
  href: string;
  icon: any;
  description: string;
  color: string;
};

function ServiceCard({ service }: { service: ServiceType }) {
  const colorVariants: Record<string, { bg: string; iconBg: string; iconColor: string }> = {
    blue: { bg: "bg-blue-500/10", iconBg: "bg-blue-500/20", iconColor: "text-blue-600" },
    green: { bg: "bg-green-500/10", iconBg: "bg-green-500/20", iconColor: "text-green-600" },
    purple: { bg: "bg-purple-500/10", iconBg: "bg-purple-500/20", iconColor: "text-purple-600" },
    orange: { bg: "bg-orange-500/10", iconBg: "bg-orange-500/20", iconColor: "text-orange-600" },
    teal: { bg: "bg-teal-500/10", iconBg: "bg-teal-500/20", iconColor: "text-teal-600" },
    indigo: { bg: "bg-indigo-500/10", iconBg: "bg-indigo-500/20", iconColor: "text-indigo-600" },
    red: { bg: "bg-red-500/10", iconBg: "bg-red-500/20", iconColor: "text-red-600" },
    pink: { bg: "bg-pink-500/10", iconBg: "bg-pink-500/20", iconColor: "text-pink-600" },
    slate: { bg: "bg-slate-500/10", iconBg: "bg-slate-500/20", iconColor: "text-slate-600" },
  };
  
  const colors = colorVariants[service.color] || colorVariants.slate;

  return (
    <Link href={service.href}>
      <article className="group relative flex h-full cursor-pointer flex-col rounded-lg border border-border bg-card p-5 shadow-sm transition-all hover:shadow-lg hover:-translate-y-1 hover:border-primary/30">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3 flex-1">
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${colors.iconBg} border border-border/50 shadow-sm group-hover:scale-110 transition-transform`}>
              <HugeiconsIcon icon={service.icon} className={`h-6 w-6 ${colors.iconColor}`} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-brand-body mb-1 group-hover:text-primary transition-colors">
                {service.title}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {service.description}
              </p>
            </div>
          </div>
          <StatusBadge tone={service.statusTone}>{service.status}</StatusBadge>
        </div>

        <div className="mt-auto pt-4 border-t border-border flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">Open workspace</span>
          <div className="flex items-center gap-1.5 text-primary font-semibold text-xs group-hover:gap-2 transition-all">
            <span>Open</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </article>
    </Link>
  );
}

export default function ServicesHubPage() {
  return (
    <section className="mx-auto max-w-[1400px] w-full pt-5 space-y-8">
      {/* Enhanced Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-primary/10">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-brand-body">
              Services Hub
            </h1>
          </div>
          <p className="text-sm text-muted-foreground max-w-2xl">
            Access all your active workspaces – bookkeeping, VAT, payroll, audit, compliance, and more. 
            Manage your services in one centralized location.
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard/compliance/list">
            <Button variant="outline" className="rounded-lg px-5 py-2.5 text-sm shadow-sm hover:shadow-md transition-all flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Pending Actions
            </Button>
          </Link>
          <Link href="/dashboard/services/request">
            <Button className="rounded-lg px-5 py-2.5 text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Request Service
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg shadow-sm px-4 py-3 hover:shadow-md transition-shadow">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Active Services</p>
          <p className="text-2xl font-bold text-brand-body">8</p>
        </div>
        <div className="bg-card border border-border rounded-lg shadow-sm px-4 py-3 hover:shadow-md transition-shadow">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Pending Actions</p>
          <p className="text-2xl font-bold text-warning">3</p>
        </div>
        <div className="bg-card border border-border rounded-lg shadow-sm px-4 py-3 hover:shadow-md transition-shadow">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Due Soon</p>
          <p className="text-2xl font-bold text-info">2</p>
        </div>
        <div className="bg-card border border-border rounded-lg shadow-sm px-4 py-3 hover:shadow-md transition-shadow">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Completed</p>
          <p className="text-2xl font-bold text-success">5</p>
        </div>
      </div>

      {/* Service Categories */}
      <div className="space-y-8">
        {serviceCategories.map((category) => (
          <div key={category.id} className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-xl font-semibold text-brand-body flex items-center gap-2">
                  {category.title}
                </h2>
                <p className="text-sm text-muted-foreground">{category.description}</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {category.services.map((service) => (
                <ServiceCard key={service.slug} service={service} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Enhanced CTA Section */}
      <div className="bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 border border-primary/20 rounded-lg shadow-md p-6 md:p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-brand-body">
                Need something that's not listed?
              </h3>
            </div>
            <p className="text-sm text-muted-foreground max-w-2xl">
              Use your existing To‑Do / tasks and chat to coordinate custom projects with your accountant. 
              We can help you set up specialized workflows for your unique business needs.
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/dashboard/services/request">
              <Button className="rounded-lg px-6 py-2.5 text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Request New Service
              </Button>
            </Link>
            <Link href="/dashboard/quickbooks-sync">
              <Button variant="outline" className="rounded-lg px-6 py-2.5 text-sm shadow-sm hover:shadow-md transition-all flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Integrations
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Additional Resources */}
      <div className="grid md:grid-cols-2 gap-4">
        <Link href="/dashboard/compliance">
          <div className="bg-card border border-border rounded-lg shadow-sm p-5 hover:shadow-md hover:border-primary/30 transition-all group">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-warning/10 border border-warning/20">
                <AlertCircle className="w-5 h-5 text-warning" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold text-brand-body mb-1 group-hover:text-primary transition-colors">
                  Compliance Calendar
                </h3>
                <p className="text-xs text-muted-foreground mb-3">
                  View all upcoming deadlines and compliance requirements in one place.
                </p>
                <div className="flex items-center gap-1.5 text-primary text-xs font-medium">
                  <span>View Calendar</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </div>
          </div>
        </Link>

        <Link href="/dashboard/messages">
          <div className="bg-card border border-border rounded-lg shadow-sm p-5 hover:shadow-md hover:border-primary/30 transition-all group">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-info/10 border border-info/20">
                <FileText className="w-5 h-5 text-info" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold text-brand-body mb-1 group-hover:text-primary transition-colors">
                  Messages & Support
                </h3>
                <p className="text-xs text-muted-foreground mb-3">
                  Get help from your accountant or coordinate on service requests.
                </p>
                <div className="flex items-center gap-1.5 text-primary text-xs font-medium">
                  <span>Open Messages</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </div>
          </div>
        </Link>
      </div>
    </section>
  );
}
