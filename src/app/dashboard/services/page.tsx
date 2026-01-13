"use client";
import { useState } from "react";
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
  TrendingUp, AlertTriangle,
  Clock3,
  CheckCheck,
} from "lucide-react";

import DashboardCard from "@/components/DashboardCard";
import PageHeader from "@/components/shared/PageHeader";

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

 const stats = [
    {
      label: "Active Services",
      value: "9",
      color: "text-green-600",
      bg: "bg-green-100",
      icon: CheckCircle2,
      active: true,
      status: "Active",
      cta: "View services",
      services: ["Bookkeeping", "VAT & Tax", "Payroll"], // Demo services
    },
    {
      label: "Pending Actions",
      value: "3",
      color: "text-orange-600",
      bg: "bg-orange-100",
      icon: AlertTriangle,
      active: false,
    },
    {
      label: "Due Soon",
      value: "2",
      color: "text-blue-600",
      bg: "bg-blue-100",
      icon: Clock3,
      active: false,
    },
    {
      label: "Completed",
      value: "5",
      color: "text-purple-600",
      bg: "bg-purple-100",
      icon: CheckCheck,
      active: false,
    },
  ];


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
          <StatusBadge tone={service.statusTone}>
  <span className={service.status === "Open" ? "text-green-600" : ""}>
    {service.status}
  </span>
</StatusBadge>
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

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState<string[]>([]);

   const openModal = (services: string[]) => {
    setModalData(services);
    setIsModalOpen(true);
  };

  return (
    <section className="mx-auto max-w-[1400px] w-full pt-5 space-y-8">
      {/* Enhanced Header */}
      <PageHeader 
        title="Services Hub"
        subtitle="Access all your active workspaces – bookkeeping, VAT, payroll, audit, compliance, and more."
        description="Manage your services in one centralized location with real-time status tracking."
        actions={
          <div className="flex flex-wrap gap-3">
            <Link href="/dashboard/compliance/list">
              <Button>
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
        }
      />

{/* Status cards */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;

          return (
            <DashboardCard
              key={i}
              className="px-6 py-5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              {/* Icon + Heading */}
              <div className="mb-3 flex items-center gap-2">
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${stat.bg}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>

                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
                  {stat.label}
                </p>
              </div>

              {/* Value */}
              <p className={`text-3xl font-bold tracking-tight mb-2`}>{stat.value}</p>

              {/* Active Service Rule */}
              {stat.active && (
                <div className="flex items-center justify-between">
                  {/* Status */}
                  <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                    {stat.status}
                  </span>

                  {/* CTA */}
                  <button
                    className="text-xs font-semibold text-green-700 hover:underline cursor-pointer"
                    onClick={() => openModal(stat.services!)}
                  >
                    {stat.cta}
                  </button>
                </div>
              )}
            </DashboardCard>
          );
        })}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg w-96 p-6 relative">
            <h2 className="text-xl font-bold mb-4">Active Services</h2>
            <ul className="mb-4">
              {modalData.map((service, index) => (
                <li key={index} className="border-b py-2">
                  {service}
                </li>
              ))}
            </ul>
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
              onClick={() => setIsModalOpen(false)}
            >
              ✕
            </button>
            <button
              className="mt-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              onClick={() => setIsModalOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    
    
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
                <TrendingUp className="w-5 h-5" />
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
              <Button className="h-12 rounded-xl px-8 py-2.5 text-sm font-bold uppercase tracking-widest transition-all active:scale-95 text-primary-color-new bg-light">
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
