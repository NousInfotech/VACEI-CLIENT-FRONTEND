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
import DashboardCard from "@/components/DashboardCard";

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
      <DashboardCard className="group relative flex h-full cursor-pointer flex-col p-5 transition-all hover:-translate-y-1 hover:border-primary/30">
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
      </DashboardCard>
    </Link>
  );
}

export default function ServicesHubPage() {
  return (
    <section className="mx-auto max-w-[1400px] w-full pt-5 space-y-8">
      {/* Enhanced Header */}
      <DashboardCard className="p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shadow-inner">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-brand-body tracking-tight">
                Services Hub
              </h1>
            </div>
            <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
              Access all your active workspaces – bookkeeping, VAT, payroll, audit, compliance, and more. 
              Manage your services in one centralized location with real-time status tracking.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/dashboard/compliance/list">
              <Button variant="outline" className="h-11 rounded-xl px-5 py-2.5 text-sm shadow-sm hover:shadow-md transition-all flex items-center gap-2 border-gray-200">
                <AlertCircle className="w-4 h-4" />
                Pending Actions
              </Button>
            </Link>
            <Link href="/dashboard/services/request">
              <Button className="h-11 rounded-xl px-5 py-2.5 text-sm shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Request Service
              </Button>
            </Link>
          </div>
        </div>
      </DashboardCard>

      {/* Quick Stats Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Active Services", value: "8", color: "text-brand-body" },
          { label: "Pending Actions", value: "3", color: "text-warning" },
          { label: "Due Soon", value: "2", color: "text-info" },
          { label: "Completed", value: "5", color: "text-success" },
        ].map((stat, i) => (
          <DashboardCard key={i} className="px-6 py-5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-2">{stat.label}</p>
            <p className={`text-3xl font-bold ${stat.color} tracking-tight`}>{stat.value}</p>
          </DashboardCard>
        ))}
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
      <DashboardCard className="p-8 md:p-10 relative overflow-hidden group">
        <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-transparent opacity-50 transition-opacity group-hover:opacity-100" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-1">
              <div className="p-2 rounded-xl bg-primary shadow-lg shadow-primary/20">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-brand-body tracking-tight">
                Need something that's not listed?
              </h3>
            </div>
            <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed font-medium">
              Use your existing To‑Do / tasks and chat to coordinate custom projects with your accountant. 
              We can help you set up specialized workflows for your unique business needs.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-4 shrink-0">
            <Link href="/dashboard/services/request">
              <Button className="h-12 rounded-xl px-8 py-2.5 text-sm font-bold uppercase tracking-widest shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-95">
                <Plus className="w-4 h-4 mr-2" />
                Request Service
              </Button>
            </Link>
            <Link href="/dashboard/quickbooks-sync">
              <Button variant="outline" className="h-12 rounded-xl px-8 py-2.5 text-sm font-bold uppercase tracking-widest border-gray-200 hover:bg-gray-50 transition-all active:scale-95">
                <Settings className="w-4 h-4 mr-2" />
                Integrations
              </Button>
            </Link>
          </div>
        </div>
      </DashboardCard>

      {/* Additional Resources */}
      <div className="grid md:grid-cols-2 gap-6 pb-8">
        {[
          {
            href: "/dashboard/compliance",
            icon: AlertCircle,
            iconBg: "bg-warning/10 border-warning/20",
            iconColor: "text-warning",
            title: "Compliance Calendar",
            description: "View all upcoming deadlines and compliance requirements in one place.",
            linkText: "View Calendar",
          },
          {
            href: "/dashboard/messages",
            icon: FileText,
            iconBg: "bg-info/10 border-info/20",
            iconColor: "text-info",
            title: "Messages & Support",
            description: "Get help from your accountant or coordinate on service requests.",
            linkText: "Open Messages",
          },
        ].map((resource, i) => (
          <Link key={i} href={resource.href}>
            <DashboardCard className="p-6 hover:shadow-xl hover:border-primary/30 transition-all group h-full">
              <div className="flex items-start gap-5">
                <div className={`p-4 rounded-2xl ${resource.iconBg} border shrink-0 transition-transform group-hover:scale-110`}>
                  <resource.icon className={`w-6 h-6 ${resource.iconColor}`} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-brand-body mb-1 group-hover:text-primary transition-colors tracking-tight">
                    {resource.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed font-medium">
                    {resource.description}
                  </p>
                  <div className="flex items-center gap-1.5 text-primary text-xs font-bold uppercase tracking-widest">
                    <span>{resource.linkText}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </DashboardCard>
          </Link>
        ))}
      </div>
    </section>
  );
}
