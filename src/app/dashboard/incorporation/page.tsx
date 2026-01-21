"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Building2, 
  Users, 
  PieChart, 
  Settings2, 
  ArrowLeft,
  ChevronDown,
  Upload,
  X,
  FileText,
  CheckCircle2
} from "lucide-react";
import DashboardCard from "@/components/DashboardCard";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Dropdown from "@/components/Dropdown";

export default function IncorporationPage() {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState({
    people: false,
    shares: false,
    csp: false
  });

  const [openForm, setOpenForm] = useState<'people' | 'shares' | 'csp' | null>(null);

  const [formData, setFormData] = useState({
    name1: "",
    name2: "",
    type: "Private Limited (Ltd)",
    regNumber: "",
    activity: "",
    startDate: "",
  });

  const [files, setFiles] = useState<File[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (openForm) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [openForm]);

  const toggleSection = (section: keyof typeof isExpanded) => {
    setIsExpanded(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles(prev => [...prev, ...droppedFiles]);
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...selectedFiles]);
    }
  };

  return (
    <>
    <section className="mx-auto max-w-[1400px] w-full pt-5 px-4 md:px-6 space-y-6 pb-20">
      <div className="flex items-center">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-brand-body transition-colors group"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted/50 group-hover:bg-muted transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </div>
          <span className="font-medium">Back</span>
        </button>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-primary-color-new p-7 rounded-3xl text-light shadow-xl shadow-primary/10">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Company Incorporation
          </h1>
          <p className="mt-1 opacity-90">
            Start your company with guided assistance.
          </p>
        </div>
      </div>

      <div className="mx-auto space-y-6">
        {/* COMPANY BASICS FORM */}
        <DashboardCard className="p-8 space-y-8">
          <div>
            <h2 className="text-xl font-bold text-brand-body flex items-center gap-2 mb-6">
              <Building2 className="w-5 h-5 text-primary" />
              COMPANY BASICS
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Proposed company name (1st choice)</label>
                <Input 
                  placeholder="e.g. My Awesome Startup Ltd" 
                  className="h-11 rounded-xl"
                  value={formData.name1}
                  onChange={(e) => setFormData({...formData, name1: e.target.value})}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Alternative name (2nd choice)</label>
                <Input 
                  placeholder="e.g. Awesome Tech Ltd" 
                  className="h-11 rounded-xl"
                  value={formData.name2}
                  onChange={(e) => setFormData({...formData, name2: e.target.value})}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Company type</label>
                <Dropdown 
                  trigger={
                    <Button variant="outline" className="w-full h-11 justify-between rounded-xl">
                      {formData.type} <ChevronDown className="w-4 h-4 opacity-50" />
                    </Button>
                  }
                  className="w-full"
                  items={[
                    { id: "ltd", label: "Private Limited (Ltd)", onClick: () => setFormData({...formData, type: "Private Limited (Ltd)"}) },
                    { id: "plc", label: "Public Limited (Plc)", onClick: () => setFormData({...formData, type: "Public Limited (Plc)"}) },
                  ]}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Company register number</label>
                <Input 
                  placeholder="e.g. C 12345" 
                  className="h-11 rounded-xl"
                  value={formData.regNumber}
                  onChange={(e) => setFormData({...formData, regNumber: e.target.value})}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Business category</label>
                <Dropdown 
                  trigger={
                    <Button variant="outline" className="h-11 w-full justify-between rounded-xl">
                      {formData.activity || "Select category"} <ChevronDown className="w-4 h-4 opacity-50" />
                    </Button>
                  }
                  className="w-full"
                  items={[
                    { id: "it", label: "IT & Software", onClick: () => setFormData({...formData, activity: "IT & Software"}) },
                    { id: "finance", label: "Finance & Fintech", onClick: () => setFormData({...formData, activity: "Finance & Fintech"}) },
                    { id: "trading", label: "Trading & Commerce", onClick: () => setFormData({...formData, activity: "Trading & Commerce"}) },
                    { id: "other", label: "Other", onClick: () => setFormData({...formData, activity: "Other"}) },
                  ]}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Describe specific business activity</label>
                <Input 
                  placeholder="Describe specific business activity..." 
                  className="h-11 rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Expected start date (optional)</label>
                <Input 
                  type="date" 
                  className="h-11 rounded-xl"
                  value={formData.startDate}
                  onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="border-t pt-8 space-y-4">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4">REQUIRED INFORMATION DETAILS</h3>
            
            {/* PEOPLE & ROLES Collapsible */}
            <div className="rounded-2xl border border-gray-200 overflow-hidden">
              <button 
                onClick={() => toggleSection('people')}
                className="w-full flex items-center justify-between p-4 bg-gray-50/50 hover:bg-gray-100/50 transition-colors"
                type="button"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Users className="w-4 h-4 text-primary" />
                  </div>
                  <p className="text-sm font-bold text-brand-body">PEOPLE & ROLES</p>
                </div>
                <ChevronDown className={cn("w-5 h-5 text-muted-foreground transition-transform duration-300", isExpanded.people && "rotate-180")} />
              </button>
              
              {isExpanded.people && (
                <div className="p-6 bg-white space-y-4 animate-in slide-in-from-top-4 duration-300">
                  <div className="space-y-3">
                    <p className="text-sm text-brand-body font-semibold">For each person (Director/Shareholder), the following details are required:</p>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-8 text-sm text-brand-body/80 ml-4 list-disc">
                      <li>Full name</li>
                      <li>Email address</li>
                      <li>Nationality</li>
                      <li>Role (Director, Shareholder, or both)</li>
                      <li>Percentage ownership (for Shareholders)</li>
                    </ul>
                    <div className="p-4 rounded-xl bg-amber-50 border border-amber-100 mt-4">
                      <p className="text-xs font-bold text-amber-900 uppercase tracking-tighter mb-1">Mandatory Rules:</p>
                      <ul className="text-xs text-amber-800 space-y-1">
                        <li>• At least one (1) Director must be appointed.</li>
                        <li>• At least one (1) Shareholder must be appointed.</li>
                      </ul>
                    </div>
                    <div className="pt-4 border-t">
                      <Button 
                        onClick={() => setOpenForm('people')}
                        className="w-full md:w-auto bg-primary-color-new text-white hover:bg-primary-color-new/90 h-11 px-6 rounded-xl font-semibold"
                      >
                        Fill People & Roles Form
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* SHARES & OWNERSHIP Collapsible */}
            <div className="rounded-2xl border border-gray-200 overflow-hidden">
              <button 
                onClick={() => toggleSection('shares')}
                className="w-full flex items-center justify-between p-4 bg-gray-50/50 hover:bg-gray-100/50 transition-colors"
                type="button"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <PieChart className="w-4 h-4 text-primary" />
                  </div>
                  <p className="text-sm font-bold text-brand-body">SHARES & OWNERSHIP</p>
                </div>
                <ChevronDown className={cn("w-5 h-5 text-muted-foreground transition-transform duration-300", isExpanded.shares && "rotate-180")} />
              </button>

              {isExpanded.shares && (
                <div className="p-6 bg-white space-y-4 animate-in slide-in-from-top-4 duration-300">
                  <div className="space-y-3">
                    <p className="text-sm text-brand-body font-semibold">The following share capital details are required:</p>
                    <ul className="space-y-2 text-sm text-brand-body/80 ml-4 list-disc">
                      <li>Total Share Capital Amount</li>
                      <li>Total Number of Shares</li>
                      <li>Detailed Allocation Table (Distribution among Shareholders)</li>
                    </ul>
                    <div className="pt-4 border-t">
                      <Button 
                        onClick={() => setOpenForm('shares')}
                        className="w-full md:w-auto bg-primary-color-new text-white hover:bg-primary-color-new/90 h-11 px-6 rounded-xl font-semibold"
                      >
                        Fill Shares & Ownership Form
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* CSP SERVICES Collapsible */}
            <div className="rounded-2xl border border-gray-200 overflow-hidden">
              <button 
                onClick={() => toggleSection('csp')}
                className="w-full flex items-center justify-between p-4 bg-gray-50/50 hover:bg-gray-100/50 transition-colors"
                type="button"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Settings2 className="w-4 h-4 text-primary" />
                  </div>
                  <p className="text-sm font-bold text-brand-body">CSP SERVICES</p>
                </div>
                <ChevronDown className={cn("w-5 h-5 text-muted-foreground transition-transform duration-300", isExpanded.csp && "rotate-180")} />
              </button>

              {isExpanded.csp && (
                <div className="p-6 bg-white animate-in slide-in-from-top-4 duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold text-primary uppercase tracking-widest border-b pb-2">REQUIRED SERVICES</h4>
                      <ul className="space-y-2">
                        {["Registered Office", "Company Secretary"].map((s, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm text-brand-body font-medium">
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest border-b pb-2">OPTIONAL SERVICES</h4>
                      <ul className="space-y-1.5 text-xs text-brand-body/70 ml-2">
                        <li>• Director Services</li>
                        <li>• Nominee Director</li>
                        <li>• Nominee Shareholder</li>
                        <li>• Statutory Registers Maintenance</li>
                        <li>• Beneficial Ownership (UBO) Maintenance</li>
                        <li>• Registered Office Mail Handling</li>
                        <li>• Certified Copies & Apostille coordination</li>
                        <li>• Bank Liaison support (CSP-level)</li>
                      </ul>
                    </div>
                  </div>
                  <div className="pt-6 mt-6 border-t">
                    <Button 
                      onClick={() => setOpenForm('csp')}
                      className="w-full md:w-auto bg-primary-color-new text-white hover:bg-primary-color-new/90 h-11 px-6 rounded-xl font-semibold"
                    >
                      Fill CSP Services Form
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* UPLOAD SECTION */}
          <div className="border-t pt-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-brand-body flex items-center gap-2">
                  <Upload className="w-5 h-5 text-primary" />
                  IDENTITY DOCUMENTS & EVIDENCE
                </h3>
                <p className="text-xs text-muted-foreground mt-1">Please upload Passport / ID copies for all identified persons above.</p>
              </div>
            </div>

            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className={cn(
                "group/drop relative w-full border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-500 cursor-pointer overflow-hidden",
                "border-gray-200 bg-blue-50/30 hover:bg-white hover:border-gray-900 hover:shadow-2xl hover:shadow-gray-200/50"
              )}
              onClick={() => inputRef.current?.click()}
            >
              <input
                ref={inputRef}
                type="file"
                multiple
                onChange={onFileInputChange}
                className="hidden"
                accept=".pdf,image/jpeg,image/png"
              />

              <div className="relative z-10 flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-white shadow-xl shadow-gray-200/50 flex items-center justify-center mb-6 group-hover/drop:scale-110 group-hover/drop:rotate-6 transition-all duration-500">
                  <Upload className="w-8 h-8 text-gray-900" />
                </div>
                <div className="space-y-2">
                  <p className="text-lg font-bold text-gray-900">
                    Drag & drop files here
                  </p>
                  <p className="text-sm text-gray-500">
                    or click to upload
                  </p>
                  <p className="text-xs text-gray-400">
                    You can upload multiple files. We’ll organise them for you.
                  </p>
                </div>
              </div>
            </div>

            {files.length > 0 && (
              <div className="rounded-2xl border border-gray-100 bg-white p-4 space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-gray-900">
                    Selected files ({files.length})
                  </p>
                  <button
                    type="button"
                    onClick={() => setFiles([])}
                    className="text-xs font-medium text-gray-600 hover:text-gray-900 underline underline-offset-4"
                  >
                    Clear all
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {files.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100 group">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center border border-gray-100 shrink-0">
                          <FileText className="w-4 h-4 text-primary" />
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-xs font-bold text-gray-900 truncate">{file.name}</p>
                          <p className="text-[10px] text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setFiles(files.filter((_, i) => i !== idx));
                        }}
                        className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 border-t">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-50 border border-amber-100 max-w-lg">
              <FileText className="w-5 h-5 text-amber-500 shrink-0" />
              <p className="text-[11px] text-amber-700 leading-relaxed font-medium">
                By submitting, you are initiating a request for incorporation. A dedicated CSP specialist will contact you to collect the detailed information listed above.
              </p>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <Button variant="ghost" className="h-12 px-8 rounded-xl font-bold border-gray-200 border">Save Draft</Button>
              <Button className="h-12 px-12 rounded-xl font-bold bg-primary-color-new text-white hover:bg-primary-color-new/90 flex-1 md:flex-none">
                Submit Incorporation
              </Button>
            </div>
          </div>
        </DashboardCard>
      </div>

      {/* People & Roles Form Modal */}
      <div className={cn(
        "fixed inset-0 z-50 flex items-center justify-center",
        openForm === 'people' ? "flex" : "hidden"
      )}>
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpenForm(null)}></div>
        <div className="relative z-50 w-full max-w-2xl mx-4 bg-card border border-border rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-card">
            <h2 className="text-xl font-semibold text-brand-body">People & Roles Form</h2>
            <button onClick={() => setOpenForm(null)} className="text-muted-foreground hover:text-brand-body transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              <p className="text-sm text-muted-foreground">
                Fill in the details for each Director and Shareholder.
              </p>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-brand-body">Full Name</label>
                  <Input placeholder="Enter full name" className="h-11" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-brand-body">Email Address</label>
                  <Input type="email" placeholder="Enter email address" className="h-11" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-brand-body">Nationality</label>
                  <Input placeholder="Enter nationality" className="h-11" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-brand-body">Role</label>
                  <Dropdown
                    trigger={
                      <Button variant="outline" className="w-full h-11 justify-between">
                        Select role <ChevronDown className="w-4 h-4 opacity-50" />
                      </Button>
                    }
                    items={[
                      { id: "director", label: "Director", onClick: () => {} },
                      { id: "shareholder", label: "Shareholder", onClick: () => {} },
                      { id: "both", label: "Both", onClick: () => {} },
                    ]}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-brand-body">Percentage Ownership (for Shareholders)</label>
                  <Input type="number" placeholder="Enter percentage" className="h-11" />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={() => setOpenForm(null)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={() => setOpenForm(null)} className="flex-1 bg-primary-color-new text-white">
                  Save & Add Another
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Shares & Ownership Form Modal */}
      <div className={cn(
        "fixed inset-0 z-50 flex items-center justify-center",
        openForm === 'shares' ? "flex" : "hidden"
      )}>
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpenForm(null)}></div>
        <div className="relative z-50 w-full max-w-2xl mx-4 bg-card border border-border rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-card">
            <h2 className="text-xl font-semibold text-brand-body">Shares & Ownership Form</h2>
            <button onClick={() => setOpenForm(null)} className="text-muted-foreground hover:text-brand-body transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              <p className="text-sm text-muted-foreground">
                Enter the share capital details for the company.
              </p>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-brand-body">Total Share Capital Amount</label>
                  <Input type="number" placeholder="Enter amount" className="h-11" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-brand-body">Total Number of Shares</label>
                  <Input type="number" placeholder="Enter number of shares" className="h-11" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-brand-body">Share Allocation Details</label>
                  <textarea 
                    placeholder="Enter detailed allocation table (Distribution among Shareholders)"
                    className="w-full min-h-[120px] px-3 py-2 border border-border rounded-lg resize-none"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={() => setOpenForm(null)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={() => setOpenForm(null)} className="flex-1 bg-primary-color-new text-white">
                  Save
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CSP Services Form Modal */}
      <div className={cn(
        "fixed inset-0 z-50 flex items-center justify-center",
        openForm === 'csp' ? "flex" : "hidden"
      )}>
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpenForm(null)}></div>
        <div className="relative z-50 w-full max-w-2xl mx-4 bg-card border border-border rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-card">
            <h2 className="text-xl font-semibold text-brand-body">CSP Services Form</h2>
            <button onClick={() => setOpenForm(null)} className="text-muted-foreground hover:text-brand-body transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              <p className="text-sm text-muted-foreground">
                Select the CSP services you require for your company.
              </p>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-brand-body mb-3">Required Services</h4>
                  <div className="space-y-2">
                    {["Registered Office", "Company Secretary"].map((service) => (
                      <div key={service} className="flex items-center gap-2 p-3 rounded-lg bg-green-50 border border-green-100">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span className="text-sm font-medium text-brand-body">{service}</span>
                        <span className="ml-auto text-xs text-muted-foreground">Required</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-brand-body mb-3">Optional Services</h4>
                  <div className="space-y-2">
                    {[
                      "Director Services",
                      "Nominee Director",
                      "Nominee Shareholder",
                      "Statutory Registers Maintenance",
                      "Beneficial Ownership (UBO) Maintenance",
                      "Registered Office Mail Handling",
                      "Certified Copies & Apostille coordination",
                      "Bank Liaison support (CSP-level)"
                    ].map((service) => (
                      <label key={service} className="flex items-center gap-2 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer">
                        <input type="checkbox" className="w-4 h-4 rounded" />
                        <span className="text-sm text-brand-body">{service}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={() => setOpenForm(null)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={() => setOpenForm(null)} className="flex-1 bg-primary-color-new text-white">
                  Save
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    </>
  );
}