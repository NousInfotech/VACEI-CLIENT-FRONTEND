"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Dropdown from "@/components/Dropdown";
import { ChevronDown, Building2, Users, FileText, CheckCircle2, AlertCircle, Clock, FileCheck, Upload, Plus, Eye, Download, ArrowRight, Briefcase, UserCheck, Share2, Calendar, Filter } from "lucide-react";
import PillTabs from "@/components/shared/PillTabs";
import BackButton from "@/components/shared/BackButton";
import { useTabQuery } from "@/hooks/useTabQuery";
import { Suspense } from "react";

type TabKey = "overview" | "active-services" | "mbr" | "documents" | "requests";
type SubTabKey = "company" | "people";

// MBR Forms data
const mbrFormsData = [
  { code: "A1", name: "Annual Return", dueDate: "30/09", status: "Due" },
  { code: "BO1", name: "Initial UBO Declaration", dueDate: "30/06", status: "Done" },
  { code: "BO2", name: "Change in UBO Details", dueDate: "-", status: "Waiting" },
  { code: "FS", name: "Financial Statements Filing", dueDate: "-", status: "Draft" },
  { code: "R", name: "Share Transfer", dueDate: "-", status: "None" },
  { code: "B2", name: "Change Registered Office", dueDate: "-", status: "None" },
  { code: "K", name: "Director / Secretary Change", dueDate: "-", status: "None" },
];

// Mock data
const directors = [
  { name: "John Smith", role: "Director", status: "Active", expiryDate: "15/12/2026" },
  { name: "Maria Borg", role: "Secretary", status: "Active", expiryDate: "30/06/2027" },
];

const shareholders = [
  { name: "JS Holdings Ltd", shares: "500", percentage: "50%", status: "Active", expiryDate: "15/12/2026" },
  { name: "Maria Borg", shares: "500", percentage: "50%", status: "Active", expiryDate: "30/06/2027" },
];

const corporateDocuments = [
  { fileName: "MOA.pdf", category: "MOA", linkedTo: "Incorporation", action: "View" },
  { fileName: "Share_Register.xlsx", category: "Register", linkedTo: "Shares", action: "Download" },
  { fileName: "A1_2024_Receipt.pdf", category: "MBR Receipt", linkedTo: "A1 2024", action: "View" },
];

const cspRequests = [
  { type: "Share Transfer", status: "In progress", action: "Open" },
  { type: "Change Director", status: "Completed", action: "View" },
  { type: "Registered Office Change", status: "Pending", action: "Open" },
];

export default function CspMbrWorkspacePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CspMbrContent />
    </Suspense>
  );
}

function CspMbrContent() {
  const [activeTab, setActiveTab] = useTabQuery("overview", "type");
  const [activeSubTab, setActiveSubTab] = useTabQuery("company", "sub");
  const [activeCompany, setActiveCompany] = useState<string>("ACME LTD");
  const [mbrFilterType, setMbrFilterType] = useState<string>("all");
  const [mbrFilterStatus, setMbrFilterStatus] = useState<string>("all");
  const [mbrFilterYear, setMbrFilterYear] = useState<string>("all");

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedCompany = localStorage.getItem("vacei-active-company");
      const storedCompanies = localStorage.getItem("vacei-companies");
      if (storedCompany && storedCompanies) {
        try {
          const companies = JSON.parse(storedCompanies);
          const company = companies.find((c: { id: string; name: string }) => c.id === storedCompany);
          if (company) setActiveCompany(company.name);
        } catch {}
      }
    }
  }, []);

  const filteredMbrForms = mbrFormsData.filter(form => {
    if (mbrFilterType !== "all" && form.code !== mbrFilterType) return false;
    if (mbrFilterStatus !== "all" && form.status.toLowerCase() !== mbrFilterStatus.toLowerCase()) return false;
    return true;
  });

  return (
    <section className="mx-auto max-w-[1400px] w-full pt-5 space-y-6">
      <BackButton />
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl md:text-4xl font-bold text-brand-body flex items-center gap-3">
            <Building2 className="w-8 h-8 text-primary" />
            CSP & Corporate
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage company profile, corporate filings, and Malta Business Registry submissions.
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard/document-organizer/document-upload">
            <Button className="rounded-lg text-sm px-5 py-2.5 shadow-md hover:shadow-lg transition-all flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Upload Documents
            </Button>
          </Link>
          <Link href="/dashboard/services/request">
            <Button variant="outline" className="rounded-lg text-sm px-5 py-2.5 shadow-sm hover:shadow-md transition-all flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Request Service
            </Button>
          </Link>
        </div>
      </div>

      {/* Enhanced Tabs */}
      <PillTabs
        tabs={[
          { id: "overview", label: "Overview", icon: Briefcase },
          { id: "active-services", label: "CSP active services", icon: Building2 },
          { id: "mbr", label: "MBR Submissions", icon: FileCheck },
          { id: "documents", label: "Documents", icon: FileText },
          { id: "requests", label: "Requests", icon: Clock },
        ]}
        activeTab={activeTab}
        onTabChange={(id) => setActiveTab(id as TabKey)}
      />

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* CSP & Corporate Info - Enhanced */}
          <div className="bg-card border border-border rounded-lg shadow-md px-6 py-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 rounded-lg bg-primary/10">
                <Building2 className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-brand-body">CSP & Corporate</h3>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Company</p>
                <p className="text-base font-semibold text-brand-body">{activeCompany}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Jurisdiction</p>
                <p className="text-base font-semibold text-brand-body">Malta</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">CSP Provider</p>
                <p className="text-base font-semibold text-brand-body">Firm Name</p>
              </div>
            </div>
          </div>

          {/* Company Status Card - Enhanced */}
          <div className="bg-card border border-border rounded-lg shadow-md px-6 py-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 rounded-lg bg-success/10">
                <CheckCircle2 className="w-5 h-5 text-success" />
              </div>
              <h3 className="text-lg font-semibold text-brand-body">Company Status</h3>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Status</p>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-success"></div>
                  <span className="text-base font-semibold text-success">Active</span>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Registered Office</p>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  <span className="text-base font-semibold text-brand-body">Verified</span>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Directors</p>
                <p className="text-base font-semibold text-brand-body">2</p>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Shareholders</p>
                <p className="text-base font-semibold text-brand-body">3</p>
              </div>
              <div className="md:col-span-2 lg:col-span-3 space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Next Filing</p>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-warning" />
                  <span className="text-base font-semibold text-brand-body">Annual Return (A1) - Due </span>
                  <span className="text-base font-bold text-warning">30/09/2025</span>
                </div>
              </div>
            </div>
          </div>

          {/* Compliance Snapshot - Enhanced */}
          <div className="bg-card border border-border rounded-lg shadow-md px-6 py-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 rounded-lg bg-info/10">
                <FileCheck className="w-5 h-5 text-info" />
              </div>
              <h3 className="text-lg font-semibold text-brand-body">Compliance Snapshot</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="rounded-lg border border-border bg-muted/20 p-4 hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-success shadow-sm"></div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Up to date</p>
                </div>
                <p className="text-2xl font-bold text-brand-body">4</p>
              </div>
              <div className="rounded-lg border border-border bg-muted/20 p-4 hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-warning shadow-sm"></div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Due soon</p>
                </div>
                <p className="text-2xl font-bold text-brand-body">1</p>
              </div>
              <div className="rounded-lg border border-border bg-muted/20 p-4 hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-destructive shadow-sm"></div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Overdue</p>
                </div>
                <p className="text-2xl font-bold text-brand-body">0</p>
              </div>
              <div className="rounded-lg border border-border bg-muted/20 p-4 hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-info shadow-sm"></div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Waiting on you</p>
                </div>
                <p className="text-2xl font-bold text-brand-body">1</p>
              </div>
            </div>
          </div>

          {/* Quick Actions - Enhanced */}
          <div className="bg-card border border-border rounded-lg shadow-md px-6 py-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 rounded-lg bg-primary/10">
                <ArrowRight className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-brand-body">Quick Actions</h3>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <Link href="/dashboard/services/request">
                <Button variant="outline" className="w-full h-auto py-4 rounded-lg shadow-sm hover:shadow-md transition-all flex flex-col items-start gap-2 group">
                  <div className="flex items-center gap-2 w-full">
                    <Plus className="w-4 h-4 text-primary" />
                    <span className="font-semibold text-brand-body">Request CSP Service</span>
                  </div>
                  <p className="text-xs text-muted-foreground text-left">Initiate a new corporate service request</p>
                </Button>
              </Link>
              <Link href="/dashboard/document-organizer/document-upload">
                <Button variant="outline" className="w-full h-auto py-4 rounded-lg shadow-sm hover:shadow-md transition-all flex flex-col items-start gap-2 group">
                  <div className="flex items-center gap-2 w-full">
                    <Upload className="w-4 h-4 text-primary" />
                    <span className="font-semibold text-brand-body">Upload Corporate Document</span>
                  </div>
                  <p className="text-xs text-muted-foreground text-left">Upload corporate documents and filings</p>
                </Button>
              </Link>
              <Link href="/dashboard/services/csp-mbr/mbr-submissions">
                <Button variant="outline" className="w-full h-auto py-4 rounded-lg shadow-sm hover:shadow-md transition-all flex flex-col items-start gap-2 group">
                  <div className="flex items-center gap-2 w-full">
                    <FileCheck className="w-4 h-4 text-primary" />
                    <span className="font-semibold text-brand-body">View MBR</span>
                  </div>
                  <p className="text-xs text-muted-foreground text-left">Access MBR submissions and forms</p>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {activeTab === "active-services" && (
        <div className="space-y-6">
          {/* Sub-tabs for Company and People */}
          <div className="flex justify-center">
            <PillTabs
              tabs={[
                { id: "company", label: "Company" },
                { id: "people", label: "People" },
              ]}
              activeTab={activeSubTab}
              onTabChange={(id) => setActiveSubTab(id as SubTabKey)}
              className="bg-muted/30 border border-border"
            />
          </div>

          {activeSubTab === "company" && (
            <div className="bg-card border border-border rounded-lg shadow-md px-6 py-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 rounded-lg bg-primary/10">
                  <Building2 className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-brand-body">Company Profile</h3>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  { label: "Company Name", value: activeCompany },
                  { label: "Jurisdiction", value: "Malta" },
                  { label: "Registration Number", value: "C 12345" },
                  { label: "CSP Provider", value: "Firm Name" },
                ].map((item, idx) => (
                  <div key={idx} className="space-y-2 p-4 rounded-lg border border-border bg-muted/20 hover:bg-muted/30 transition-colors">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{item.label}</p>
                    <p className="text-base font-semibold text-brand-body">{item.value}</p>
                  </div>
                ))}
                <div className="md:col-span-2 space-y-2 p-4 rounded-lg border border-border bg-muted/20 hover:bg-muted/30 transition-colors">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Registered Office</p>
                  <p className="text-base font-semibold text-brand-body">123 Main Street, Valletta, Malta</p>
                </div>
                <div className="md:col-span-2 space-y-2 p-4 rounded-lg border border-border bg-muted/20 hover:bg-muted/30 transition-colors">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide text-center">Expiry Date</p>
                  <p className="text-base font-semibold text-brand-body text-center">31/12/2026</p>
                </div>
              </div>
            </div>
          )}

          {activeSubTab === "people" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {/* Directors / Secretary - Enhanced */}
              <div className="bg-card border border-border rounded-lg shadow-md px-6 py-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-primary/10">
                      <UserCheck className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-brand-body">Directors / Secretary</h3>
                  </div>
                  <Link href="/dashboard/services/request">
                    <Button variant="outline" size="sm" className="rounded-lg text-xs px-4 shadow-sm hover:shadow-md transition-all flex items-center gap-2">
                      <Plus className="w-3 h-3" />
                      Request Change
                    </Button>
                  </Link>
                </div>
                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="w-full">
                    <thead className="bg-muted/60 border-b border-border">
                      <tr>
                        <th className="px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide text-left">Name</th>
                        <th className="px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide text-left">Role</th>
                        <th className="px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide text-center">Status</th>
                        <th className="px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide text-center">Expiry Date</th>
                        <th className="px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {directors.map((director, idx) => (
                        <tr key={idx} className="border-b border-border hover:bg-muted/30 transition-colors">
                          <td className="px-5 py-4 text-left">
                            <p className="font-semibold text-brand-body">{director.name}</p>
                          </td>
                          <td className="px-5 py-4 text-left">
                            <p className="text-sm text-brand-body">{director.role}</p>
                          </td>
                          <td className="px-5 py-4 text-center">
                            <span className="inline-flex items-center gap-1.5 text-xs rounded-full bg-success/20 text-success px-3 py-1.5 font-medium">
                              <CheckCircle2 className="w-3 h-3" />
                              {director.status}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-center">
                            <p className="text-sm text-brand-body font-medium">{director.expiryDate}</p>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <Button variant="ghost" size="sm" className="text-xs rounded-lg shadow-sm hover:shadow-md transition-all flex items-center gap-1.5 ml-auto">
                              <Eye className="w-3 h-3" />
                              View
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Shareholders - Enhanced */}
              <div className="bg-card border border-border rounded-lg shadow-md px-6 py-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-primary/10">
                      <Share2 className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-brand-body">Shareholders</h3>
                  </div>
                  <Link href="/dashboard/services/request">
                    <Button variant="outline" size="sm" className="rounded-lg text-xs px-4 shadow-sm hover:shadow-md transition-all flex items-center gap-2">
                      <Plus className="w-3 h-3" />
                      Request Transfer
                    </Button>
                  </Link>
                </div>
                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="w-full">
                    <thead className="bg-muted/60 border-b border-border">
                      <tr>
                        <th className="px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide text-left">Name</th>
                        <th className="px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide text-center">Shares</th>
                        <th className="px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide text-center">%</th>
                        <th className="px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide text-center">Status</th>
                        <th className="px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide text-center">Expiry Date</th>
                        <th className="px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {shareholders.map((shareholder, idx) => (
                        <tr key={idx} className="border-b border-border hover:bg-muted/30 transition-colors">
                          <td className="px-5 py-4 text-left">
                            <p className="font-semibold text-brand-body">{shareholder.name}</p>
                          </td>
                          <td className="px-5 py-4 text-center">
                            <p className="text-sm text-brand-body font-medium">{shareholder.shares}</p>
                          </td>
                          <td className="px-5 py-4 text-center">
                            <p className="text-sm text-brand-body font-medium">{shareholder.percentage}</p>
                          </td>
                          <td className="px-5 py-4 text-center">
                            <span className="inline-flex items-center gap-1.5 text-xs rounded-full bg-success/20 text-success px-3 py-1.5 font-medium">
                              <CheckCircle2 className="w-3 h-3" />
                              {shareholder.status}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-center">
                            <p className="text-sm text-brand-body font-medium">{shareholder.expiryDate}</p>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <Button variant="ghost" size="sm" className="text-xs rounded-lg shadow-sm hover:shadow-md transition-all flex items-center gap-1.5 ml-auto">
                              <Eye className="w-3 h-3" />
                              View
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "mbr" && (
        <div className="bg-card border border-border rounded-lg shadow-md px-6 py-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-lg bg-primary/10">
              <FileCheck className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-brand-body">MBR Submissions</h3>
          </div>
          
          {/* Enhanced Filters */}
          <div className="flex flex-wrap items-center gap-3 mb-6 p-4 rounded-lg border border-border bg-muted/20">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Dropdown
              className="w-auto min-w-[140px]"
              trigger={
                <Button variant="outline" size="sm" className="w-auto min-w-[140px] h-9 justify-between">
                  {mbrFilterType === "all" ? "All Types" : mbrFilterType}
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              }
              items={[
                { id: "all", label: "All Types", onClick: () => setMbrFilterType("all") },
                ...mbrFormsData.map(f => ({
                  id: f.code,
                  label: f.code,
                  onClick: () => setMbrFilterType(f.code)
                }))
              ]}
            />
            <Dropdown
              className="w-auto min-w-[140px]"
              trigger={
                <Button variant="outline" size="sm" className="w-auto min-w-[140px] h-9 justify-between">
                  {mbrFilterStatus === "all" ? "All Statuses" : mbrFilterStatus.charAt(0).toUpperCase() + mbrFilterStatus.slice(1)}
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              }
              items={[
                { id: "all", label: "All Statuses", onClick: () => setMbrFilterStatus("all") },
                { id: "due", label: "Due", onClick: () => setMbrFilterStatus("due") },
                { id: "done", label: "Done", onClick: () => setMbrFilterStatus("done") },
                { id: "waiting", label: "Waiting", onClick: () => setMbrFilterStatus("waiting") },
                { id: "draft", label: "Draft", onClick: () => setMbrFilterStatus("draft") },
                { id: "none", label: "None", onClick: () => setMbrFilterStatus("none") }
              ]}
            />
            <Dropdown
              className="w-auto min-w-[140px]"
              trigger={
                <Button variant="outline" size="sm" className="w-auto min-w-[140px] h-9 justify-between">
                  {mbrFilterYear === "all" ? "All Years" : mbrFilterYear}
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              }
              items={[
                { id: "all", label: "All Years", onClick: () => setMbrFilterYear("all") },
                { id: "2025", label: "2025", onClick: () => setMbrFilterYear("2025") },
                { id: "2024", label: "2024", onClick: () => setMbrFilterYear("2024") }
              ]}
            />
          </div>

          {/* Enhanced Table */}
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full">
              <thead className="bg-muted/60 border-b border-border">
                <tr>
                  <th className="px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide text-left">Form</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide text-left">Description</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide text-center">Due Date</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide text-center">Status</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredMbrForms.map((form) => (
                  <tr key={form.code} className="border-b border-border hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-4 text-left">
                      <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary font-bold text-sm">
                        {form.code}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-left">
                      <p className="font-semibold text-brand-body">{form.name}</p>
                    </td>
                    <td className="px-5 py-4 text-center">
                      {form.dueDate !== "-" ? (
                        <div className="flex items-center justify-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-warning" />
                          <span className="text-sm font-medium text-warning">{form.dueDate}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className={`inline-flex items-center gap-1.5 text-xs rounded-full px-3 py-1.5 font-medium ${
                        form.status === "Done" ? "bg-success/20 text-success" :
                        form.status === "Due" ? "bg-warning/20 text-warning" :
                        form.status === "Waiting" ? "bg-info/20 text-info" :
                        form.status === "Draft" ? "bg-muted text-muted-foreground" :
                        "bg-muted text-muted-foreground"
                      }`}>
                        {form.status === "Done" && <CheckCircle2 className="w-3 h-3" />}
                        {form.status === "Due" && <AlertCircle className="w-3 h-3" />}
                        {form.status === "Waiting" && <Clock className="w-3 h-3" />}
                        {form.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link href={`/dashboard/services/csp-mbr/mbr-submissions/${form.code.toLowerCase()}`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs rounded-lg shadow-sm hover:shadow-md transition-all flex items-center gap-1.5 ml-auto"
                        >
                          {form.status === "None" ? (
                            <>
                              <Plus className="w-3 h-3" />
                              Start
                            </>
                          ) : form.status === "Done" ? (
                            <>
                              <Eye className="w-3 h-3" />
                              View
                            </>
                          ) : (
                            <>
                              <ArrowRight className="w-3 h-3" />
                              Open
                            </>
                          )}
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "documents" && (
        <div className="bg-card border border-border rounded-lg shadow-md px-6 py-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-lg bg-primary/10">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-brand-body">Corporate Documents</h3>
          </div>
          
          {/* Enhanced Categories */}
          <div className="flex flex-wrap gap-2 mb-6">
            {["MOA/M&A", "Registers", "Resolutions", "MBR Receipts"].map((cat) => (
              <span key={cat} className="inline-flex items-center gap-1.5 text-xs rounded-lg border border-border bg-muted/30 px-3 py-1.5 text-brand-body font-medium hover:bg-muted/50 transition-colors cursor-pointer">
                {cat}
              </span>
            ))}
          </div>

          {/* Enhanced Table */}
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full">
              <thead className="bg-muted/60 border-b border-border">
                <tr>
                  <th className="px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide text-left">File Name</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide text-left">Category</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide text-left">Linked To</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {corporateDocuments.map((doc, idx) => (
                  <tr key={idx} className="border-b border-border hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-4 text-left">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-primary" />
                        <p className="font-semibold text-brand-body">{doc.fileName}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-left">
                      <span className="text-xs rounded-lg border border-border bg-muted/30 px-2.5 py-1 text-brand-body">
                        {doc.category}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-left">
                      <p className="text-sm text-brand-body">{doc.linkedTo}</p>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs rounded-lg shadow-sm hover:shadow-md transition-all flex items-center gap-1.5 ml-auto"
                      >
                        {doc.action === "Download" ? (
                          <>
                            <Download className="w-3 h-3" />
                            Download
                          </>
                        ) : (
                          <>
                            <Eye className="w-3 h-3" />
                            View
                          </>
                        )}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "requests" && (
        <div className="bg-card border border-border rounded-lg shadow-md px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-primary/10">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-brand-body">CSP Requests</h3>
            </div>
            <Link href="/dashboard/services/request">
              <Button variant="outline" className="rounded-lg text-sm px-5 py-2.5 shadow-sm hover:shadow-md transition-all flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Request CSP Service
              </Button>
            </Link>
          </div>

          {/* Enhanced Table */}
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full">
              <thead className="bg-muted/60 border-b border-border">
                <tr>
                  <th className="px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide text-left">Request Type</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide text-center">Status</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {cspRequests.map((request, idx) => (
                  <tr key={idx} className="border-b border-border hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-4 text-left">
                      <p className="font-semibold text-brand-body">{request.type}</p>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className={`inline-flex items-center gap-1.5 text-xs rounded-full px-3 py-1.5 font-medium ${
                        request.status === "Completed" ? "bg-success/20 text-success" :
                        request.status === "In progress" ? "bg-info/20 text-info" :
                        "bg-warning/20 text-warning"
                      }`}>
                        {request.status === "Completed" && <CheckCircle2 className="w-3 h-3" />}
                        {request.status === "In progress" && <Clock className="w-3 h-3" />}
                        {request.status === "Pending" && <AlertCircle className="w-3 h-3" />}
                        {request.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs rounded-lg shadow-sm hover:shadow-md transition-all flex items-center gap-1.5 ml-auto"
                      >
                        {request.action === "View" ? (
                          <>
                            <Eye className="w-3 h-3" />
                            View
                          </>
                        ) : (
                          <>
                            <ArrowRight className="w-3 h-3" />
                            Open
                          </>
                        )}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
