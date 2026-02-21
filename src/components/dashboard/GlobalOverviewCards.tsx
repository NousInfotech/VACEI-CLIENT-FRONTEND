"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Building2, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  FileText, 
  MessageSquare, 
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGlobalDashboard } from "@/context/GlobalDashboardContext";

export default function GlobalOverviewCards() {
  const router = useRouter();
  const { 
    companies, 
    loading, 
    complianceState, 
    hasMessages, 
    pendingDocs 
  } = useGlobalDashboard();

  const CardWrapper = ({ children, bgImage, title, button }: { children: React.ReactNode, bgImage: string, title: string, button: React.ReactNode }) => (
    <div className="relative group overflow-hidden rounded-4xl h-[280px] border border-white/20 shadow-2xl transition-all duration-500">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${bgImage})` }}
      />
      <div className="absolute inset-0 bg-black/20" />
      
      {/* Content Layer */}
      <div className="relative h-full w-full p-8 flex flex-col">
        <h3 className="text-2xl font-bold text-white mb-4 tracking-tight drop-shadow-md">
          {title}
        </h3>
        <div className="grow space-y-3">
          {children}
        </div>
        <div className="mt-4">
          {button}
        </div>
      </div>
    </div>
  );

  const getComplianceContent = () => {
    let statusBadge = (
      <div className="flex items-center gap-3 text-emerald-400 font-semibold bg-emerald-950/30 w-fit px-4 py-1.5 rounded-full border border-emerald-500/30">
        <CheckCircle2 size={18} />
        <span>All companies fully compliant.</span>
      </div>
    );
    let description = "No immediate actions required.";
    let deadlineLabel = "Next deadline";
    let deadlineValue = "Tesla Ltd – VAT Return – 18 Feb";
    let buttonLabel = "View Deadlines";

    if (complianceState === "overdue") {
      const overdueCompany = companies.find(c => c.overdueCount > 0) || { name: "Tesla Ltd" };
      statusBadge = (
        <div className="flex items-center gap-3 text-red-400 font-semibold bg-red-950/30 w-fit px-4 py-1.5 rounded-full border border-red-500/30">
          <AlertCircle size={18} />
          <span>1 filing is overdue.</span>
        </div>
      );
      description = "Immediate action is required.";
      deadlineLabel = "Company: " + overdueCompany.name;
      deadlineValue = "Filing: VAT Return";
      buttonLabel = "Resolve Now";
    } else if (complianceState === "due") {
      statusBadge = (
        <div className="flex items-center gap-3 text-amber-400 font-semibold bg-amber-950/30 w-fit px-4 py-1.5 rounded-full border border-amber-500/30">
          <AlertTriangle size={18} />
          <span>2 deadlines coming up this month.</span>
        </div>
      );
      description = "Please review upcoming filings.";
      deadlineLabel = "Next deadline";
      deadlineValue = "Gozo Ventures Ltd – Annual Return – 12 Feb";
      buttonLabel = "Review Deadlines";
    }

    return {
      content: (
        <>
          {statusBadge}
          <p className="text-white/90 text-sm mt-2">{description}</p>
          <div className="flex flex-col gap-0.5 mt-2">
            <span className="text-white/60 text-[10px] uppercase tracking-widest font-bold">{deadlineLabel}</span>
            <span className="text-white font-medium truncate">{deadlineValue}</span>
          </div>
        </>
      ),
      button: (
        <Button 
          variant="outline" 
          className="bg-white/10 border-none text-white hover:bg-white hover:text-black rounded-xl backdrop-blur-xl group/btn transition-all duration-300"
          onClick={() => router.push('/global-dashboard/companies')}
        >
          {buttonLabel}
          <ArrowRight size={16} className="ml-2 group-hover/btn:translate-x-1 transition-transform" />
        </Button>
      )
    };
  };

  const getCompaniesContent = () => {
    const hasAttention = companies.some(c => c.overdueCount > 0 || c.dueSoonCount > 0);
    return {
      content: (
        <>
          <div className="flex items-center gap-3 text-blue-300 font-semibold">
            <Building2 size={24} className="text-white/70" />
            <span className="text-xl">{companies.length} Active Companies</span>
          </div>
          <p className="text-white/80 text-sm leading-relaxed mt-2">
            {hasAttention 
              ? "One company requires your attention. Please review pending items."
              : "All your companies are in good standing managed efficiently."}
          </p>
        </>
      ),
      button: (
        <Button 
          variant="outline" 
          className="bg-white/10 border-none text-white hover:bg-white hover:text-black rounded-xl backdrop-blur-xl group/btn transition-all duration-300"
          onClick={() => router.push('/global-dashboard/companies')}
        >
          {hasAttention ? "View Companies" : "Manage Companies"}
          <ArrowRight size={16} className="ml-2 group-hover/btn:translate-x-1 transition-transform" />
        </Button>
      )
    };
  };

  const getDocumentsContent = () => {
    return {
      content: (
        <>
          <div className="flex items-center gap-3 text-white/90 font-semibold">
            <FileText size={24} className="text-white/70" />
            <span className="text-xl">{pendingDocs > 0 ? `${pendingDocs} Document Requests` : "All Up to Date"}</span>
          </div>
          <p className="text-white/80 text-sm leading-relaxed mt-2">
            {pendingDocs > 0 
              ? "Documents have been requested. Please review and submit via dashboard."
              : "All required documents and certificates are currently up to date."}
          </p>
        </>
      ),
      button: (
        <Button 
          variant="outline" 
          className="bg-white/10 border-none text-white hover:bg-white hover:text-black rounded-xl backdrop-blur-xl group/btn transition-all duration-300"
          onClick={() => router.push('/global-dashboard/companies')}
        >
          {pendingDocs > 0 ? "View Requests" : "View Documents"}
          <ArrowRight size={16} className="ml-2 group-hover/btn:translate-x-1 transition-transform" />
        </Button>
      )
    };
  };

  const getSupportContent = () => {
    return {
      content: (
        <>
          <div className="flex items-center gap-3 text-white/90 font-semibold">
            <MessageSquare size={24} className="text-white/70" />
            <span className="text-xl">{hasMessages ? "New Message" : "Support Center"}</span>
          </div>
          <p className="text-white/80 text-sm leading-relaxed mt-2">
            {hasMessages 
              ? "You have 1 new message from your advisor regarding your filings."
              : "Need assistance? Our dedicated support team is here to help you."}
          </p>
        </>
      ),
      button: (
        <Button 
          variant="outline" 
          className="bg-white/10 border-none text-white hover:bg-white hover:text-black rounded-xl backdrop-blur-xl group/btn transition-all duration-300"
          onClick={() => router.push('/global-dashboard/support')}
        >
          {hasMessages ? "Open Messages" : "Contact Support"}
          <ArrowRight size={16} className="ml-2 group-hover/btn:translate-x-1 transition-transform" />
        </Button>
      )
    };
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-[280px] rounded-4xl bg-gray-200 animate-pulse" />
        ))}
      </div>
    );
  }

  const compliance = getComplianceContent();
  const companiesData = getCompaniesContent();
  const docs = getDocumentsContent();
  const support = getSupportContent();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <CardWrapper 
        title="Compliance Status" 
        bgImage="/global-dashboard/compliance-status.png"
        button={compliance.button}
      >
        {compliance.content}
      </CardWrapper>

      <CardWrapper 
        title="My Companies" 
        bgImage="/global-dashboard/companies.png"
        button={companiesData.button}
      >
        {companiesData.content}
      </CardWrapper>

      <CardWrapper 
        title="Documents" 
        bgImage="/global-dashboard/document-requests.png"
        button={docs.button}
      >
        {docs.content}
      </CardWrapper>

      <CardWrapper 
        title="Support" 
        bgImage="/global-dashboard/supports.png"
        button={support.button}
      >
        {support.content}
      </CardWrapper>
    </div>
  );
}
