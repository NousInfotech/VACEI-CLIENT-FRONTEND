"use client";

import { Plus, Phone, TrendingUp, Wallet, LineChart } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import DashboardCard from "@/components/DashboardCard";
import { cfoProjects } from "../cfo/[id]/cfoProjects";
import { useRouter } from "next/navigation";


const mockReports = [
  {
    id: "management-accounts",
    title: "Management accounts",
    status: "Latest",
    statusColor: "text-green-600",
    fileName: "management-accounts.pdf",
    content: "Mock PDF content for Management Accounts",
  },
  {
    id: "cash-flow-forecast",
    title: "Cash flow forecast",
    status: "Updating",
    statusColor: "text-yellow-600",
    fileName: "cash-flow-forecast.xlsx",
    content: "Mock Excel content for Cash Flow Forecast",
  },
  {
    id: "budget-vs-actual",
    title: "Budget vs actual analysis",
    status: "Draft",
    statusColor: "text-gray-500",
    fileName: "budget-vs-actual.pdf",
    content: "Mock PDF content for Budget vs Actual",
  },
  {
    id: "kpi-summary",
    title: "KPI summary",
    status: "Latest",
    statusColor: "text-green-600",
    fileName: "kpi-summary.pdf",
    content: "Mock PDF content for KPI Summary",
  },
];

const handleDownload = (fileName: string, content: string) => {
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;

  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};


export default function CFOServicesPage() {
  const cfoActive = true;
  const router = useRouter();
  return (
    <section className="mx-auto max-w-[1200px] w-full space-y-8 pt-5">
    {/* Header Card */}
      <div className="relative rounded-xl bg-gray-900 p-6 md:p-8 shadow-md flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        
        {/* Title + Subtitle */}
        <div className="space-y-2 max-w-2xl">
          <h1 className="text-2xl md:text-3xl font-semibold text-white">
            CFO Services
          </h1>
          <p className="text-sm md:text-base text-gray-300 leading-relaxed">
            Financial insights, planning, and guidance to help you grow your business.
          </p>
           <p className="text-sm text-gray-300 leading-relaxed">
          This page gives you visibility over your financial performance, forecasts,
          and strategic decisions. Our CFO team supports you with insights — not just numbers.
        </p>
        </div>
        {/* Action Buttons */}
        <div className="flex gap-2 md:mt-0 mt-4">
         <Button
  asChild
  className="bg-gray-800 hover:bg-gray-700 text-white text-xs px-4 py-2 flex items-center gap-2 rounded-lg shadow-sm">
      <Link href="/dashboard/services/cfo/request">
        <Plus className="h-4 w-4" />
        Request CFO Support
      </Link>
    </Button>
          <Link href="/dashboard/book-cfo-call">
            <Button
              className="bg-gray-800 hover:bg-gray-700 text-white text-xs px-4 py-2 flex items-center gap-2 rounded-lg shadow-sm"
            >
              <Phone className="h-4 w-4" />
              Book CFO Call
            </Button>
          </Link>
        </div>
      </div>
 <DashboardCard className="p-4 md:p-4">

  {/* Header */}
  <div className="flex items-start justify-between mb-3">
    <div>
      <h2 className="text-lg md:text-xl font-semibold text-gray-900">
        CFO Status Summary
      </h2>
      <p className="text-sm leading-relaxed">
        Simple, reassuring summary
      </p>
    </div>
<Link href="/dashboard/services/cfo/request">
    <Button
      className="bg-gray-800 hover:bg-gray-700 text-white text-xs px-4 py-2 flex items-center gap-2 rounded-lg shadow-sm"
    >
      <Plus className="h-4 w-4" />
      Request CFO Support
    </Button>
    </Link>
  </div>

  {/* Status Grid */}
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    
    {/* CFO Support Status */}
    <div className="rounded-xl border border-gray-200 p-4 bg-white">
      <div className="text-sm text-gray-500">CFO Support</div>
      <div className="text-base md:text-lg font-semibold text-green-600 mt-1">
        Active
      </div>
    </div>

    {/* Reporting Frequency */}
    <div className="rounded-xl border border-gray-200 p-4 bg-white">
      <div className="text-sm text-gray-500">Reporting frequency</div>
      <div className="text-base md:text-lg font-semibold text-gray-900 mt-1">
        Monthly
      </div>
    </div>

    {/* Next Review Date */}
    <div className="rounded-xl border border-gray-200 p-4 bg-white">
      <div className="text-sm text-gray-500">Next review</div>
      <div className="text-base md:text-lg font-semibold text-gray-900 mt-1">
        20 August 2025
      </div>
    </div>

  </div>
</DashboardCard>
<DashboardCard className="p-4 md:p-6">
  <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-4">
    Insight
  </h2>

  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

    {/* Financial Snapshot */}
    <div className="rounded-xl border border-gray-200 p-4 bg-white space-y-2">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <TrendingUp className="h-4 w-4" />
        <span>Financial snapshot</span>
      </div>

      <p className="text-sm text-gray-700">
        Revenue: €420,000
      </p>
      <p className="text-sm text-gray-700">
        Net result: €68,000
      </p>
      <p className="text-sm text-green-600">
        Cash status: Good
      </p>
    </div>

    {/* Cash Flow */}
    <div className="rounded-xl border border-gray-200 p-4 bg-white space-y-2">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Wallet className="h-4 w-4" />
        <span>Cash flow</span>
      </div>

      <p className="text-sm text-gray-700">
        Runway: 12 months
      </p>
      <p className="text-sm text-gray-700">
        Next pressure point: October
      </p>
      <p className="text-sm text-gray-600">
        No immediate concerns
      </p>
    </div>

    {/* Forecast */}
    <div className="rounded-xl border border-gray-200 p-4 bg-white space-y-2">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <LineChart className="h-4 w-4" />
        <span>Forecast</span>
      </div>

      <p className="text-sm text-gray-700">
        On track with plan: No
      </p>
      <p className="text-sm text-gray-600">
        Next review: May
      </p>
    </div>

  </div>
</DashboardCard>
<DashboardCard className="p-4 md:p-6">
  <h2 className="text-lg font-semibold text-gray-900 mb-4">
    RECOMMENDED ACTIONS
  </h2>
  <div className="space-y-3">
    {/* Item 1 */}
    <div className="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3 bg-white">
      <span className="text-sm text-gray-800">
        Review pricing strategy
      </span>
              <Button size="sm" variant="ghost" className="text-xs rounded-lg shadow-sm hover:shadow-md transition-shadow">view</Button>
    </div>

    {/* Item 2 */}
    <div className="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3 bg-white">
      <span className="text-sm text-gray-800">
        Prepare cash flow forecast for Q4
      </span>
              <Button size="sm" variant="ghost" className="text-xs rounded-lg shadow-sm hover:shadow-md transition-shadow">view</Button>
    </div>

    {/* Item 3 */}
    <div className="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3 bg-white">
      <span className="text-sm text-gray-800">
       Discuss hiring plan impact
      </span>
       <Button
              className="bg-gray-800 hover:bg-gray-700 text-white text-xs px-4 py-2 flex items-center gap-2 rounded-lg shadow-sm"
            >
              <Phone className="h-4 w-4" />
              Book CFO Call
            </Button>
    </div>
  </div>
</DashboardCard>
<DashboardCard className="p-4 md:p-6">
  <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">
    Reports & Deliverables
  </h2>
  <p className="text-sm text-muted-foreground mb-4">
    CFO deliverables prepared for review.
  </p>

  <div className="space-y-3">
    {mockReports.map((report) => (
      <div
        key={report.id}
        className="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3 bg-white"
      >
        <div>
          <p className="text-sm font-medium text-gray-900">
            {report.title}
          </p>
          <p className={`text-xs ${report.statusColor}`}>
            Status: {report.status}
          </p>
        </div>

        <div className="flex gap-3 text-sm">
          <Button
            size="sm"
            variant="ghost"
            className="text-xs rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            View
          </Button>

          <Button
            size="sm"
            variant="ghost"
            className="text-xs rounded-lg shadow-sm hover:shadow-md transition-shadow"
            onClick={() =>
              handleDownload(report.fileName, report.content)
            }
          >
            Download
          </Button>
        </div>
      </div>
    ))}
  </div>
</DashboardCard>

<DashboardCard className="p-4 md:p-6">

  {/* Header Row */}
  <div className="flex items-start justify-between mb-4">
    <div>
      <h2 className="text-lg md:text-xl font-semibold text-gray-900">
        Business Planning & Forecasting
      </h2>
      <p className="text-sm text-muted-foreground">
        Forward-looking plans used to support key business decisions.
      </p>
    </div>

    <div className="flex gap-2">
      <Link href="dashboard/business-plans/bp-001">
      <Button
        variant="outline"
        className="rounded-lg text-xs px-4 shadow-sm hover:shadow-md transition-shadow"
      >
        View requests
      </Button>
      </Link>
    <Link href="/dashboard/business-plans/request">
      <Button className="bg-gray-800 hover:bg-gray-700 text-white text-xs px-4 py-2 flex items-center gap-2 rounded-lg shadow-sm">
        <Plus className="h-4 w-4" />
        Request update
      </Button>
      </Link>
    </div>
  </div>

  {/* Planning Items */}
  <div className="space-y-3">

    {/* Annual Budget */}
    <div className="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3 bg-white">
      <p className="text-sm font-medium text-gray-900">
        Annual budget
      </p>
      <Link
        href="/dashboard/business-plans"
        className="text-xs text-brand-primary hover:underline"
      >
        View
      </Link>
    </div>

    {/* 3–5 Year Forecast */}
    <div className="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3 bg-white">
      <p className="text-sm font-medium text-gray-900">
        3–5 year forecast
      </p>
      <Link
        href="/planning/forecast"
        className="text-xs text-brand-primary hover:underline"
      >
        View
      </Link>
    </div>

    {/* Scenario Analysis */}
    <div className="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3 bg-white">
      <p className="text-sm font-medium text-gray-900">
        Scenario analysis
      </p>
      <Link
        href="/planning/scenario-analysis"
        className="text-xs text-brand-primary hover:underline"
      >
        View
      </Link>
    </div>
  </div>
</DashboardCard>
<DashboardCard className="p-4 md:p-6">
  <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">
    CFO Projects
  </h2>

  <p className="text-sm text-muted-foreground mb-4">
    Project-based financial work currently in scope.
  </p>

  <div className="space-y-3">
    {cfoProjects.map((project) => (
      <div
        key={project.id}
        onClick={() =>
          router.push(`/dashboard/services/cfo/${project.id}`)
        }
        className="cursor-pointer rounded-xl border border-gray-200 px-4 py-3 bg-white hover:bg-gray-50 transition"
      >
        <div className="flex justify-between items-start">
          <p className="text-sm font-medium text-gray-900">
            {project.title}
          </p>

          <span className="text-xs rounded-full bg-gray-100 px-2 py-1">
            {project.status}
          </span>
        </div>

        <p className="text-xs text-muted-foreground mt-1">
          Due: {project.dueDate}
        </p>
      </div>
    ))}
  </div>
</DashboardCard>
<DashboardCard className="p-4 md:p-6">
  
  {/* Header Row */}
  <div className="flex items-start justify-between mb-2">
    <div>
      <h2 className="text-lg md:text-xl font-semibold text-gray-900">
        Communication
      </h2>
      <p className="text-sm text-muted-foreground">
        Updates and messages related to CFO activity.
      </p>
    </div>

    <Button
      className="bg-gray-800 hover:bg-gray-700 text-white text-xs px-4 py-2 rounded-lg shadow-sm"
    >
      View full thread
    </Button>
  </div>

  {/* CFO Thread */}
  <div className="rounded-xl border border-gray-200 bg-white">
    <div className="px-4 py-3 border-b border-gray-200">
      <p className="text-sm font-medium text-gray-900">
        CFO messages
      </p>
    </div>

    <div className="space-y-3 px-4 py-3 text-sm">
      <div className="flex items-start gap-3">
        <span className="mt-1 h-2 w-2 rounded-full bg-green-500" />
        <p className="text-gray-700">
          Management accounts uploaded
        </p>
      </div>

      <div className="flex items-start gap-3">
        <span className="mt-1 h-2 w-2 rounded-full bg-green-500" />
        <p className="text-gray-700">
          Forecast updated
        </p>
      </div>

      <div className="flex items-start gap-3">
        <span className="mt-1 h-2 w-2 rounded-full bg-green-500" />
        <p className="text-gray-700">
          Review completed
        </p>
      </div>
    </div>
  </div>
</DashboardCard>
    </section>
  );
}
