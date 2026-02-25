"use client";

import React from "react";
import EngagementSummary, {
  EngagementAction,
  EngagementStatus,
  WorkflowStatus,
} from "./EngagementSummary";
import { EngagementProvider } from "./hooks/useEngagement";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { getEngagements } from "@/api/auditService";
import { ENGAGEMENT_CONFIG } from "@/config/engagementConfig";
import { useActiveCompany } from "@/context/ActiveCompanyContext";
import { useGlobalDashboard } from "@/context/GlobalDashboardContext";
import { Spinner } from "@/components/ui/spinner";
import Link from "next/link";
import EngagementSelectionCards from "./EngagementSelectionCards";
import { SERVICE_METADATA } from "@/lib/menuData";

interface ServiceEngagementProps {
  serviceSlug: string;
  engagementId?: string;
}

// Mapping from URL slug to Backend Service Type/Category
const SLUG_TO_SERVICE_TYPE: Record<string, string> = {
  'vat': 'VAT',
  'payroll': 'PAYROLL',
  'audit': 'AUDITING', // Updated from 'AUDIT' to 'AUDITING' based on API response
  'bookkeeping': 'ACCOUNTING',
  'tax': 'TAX',
  'cfo': 'CFO',
  'csp-mbr': 'CSP',
  'mbr-filing': 'MBR',
  'incorporation': 'INCORPORATION',
  'advisory': 'ADVISORY',
  'business-plans': 'ADVISORY',
  'legal': 'LEGAL',
  'technology': 'TECHNOLOGY',
  'project-transactions': 'PROJECTS_TRANSACTIONS',
  'grants-incentives': 'GRANTS_AND_INCENTIVES',
  'custom': 'CUSTOM'
};

const serviceData: Record<
  string,
  {
    name: string;
    description: string;
    status: EngagementStatus;
    cycle: string;
    workflowStatus: WorkflowStatus;
    neededFromUser?: string;
    actions: EngagementAction[];

  }
> = {
  bookkeeping: {
    name: "Accounting & Bookkeeping",
    description:
      "Ongoing maintenance of financial records, including ledger management and reporting.",
    status: "on_track",
    cycle: "January 2026",
    workflowStatus: "in_progress",
    neededFromUser: "Please upload bank statements for the previous month.",
    actions: [{ type: "upload", label: "Upload Statements" }],
  },
  vat: {
    name: "VAT",
    description: "Preparation and submission of VAT returns.",
    status: "due_soon",
    cycle: "Q1 2026",
    workflowStatus: "waiting",
    neededFromUser:
      "Review and confirm your VAT return for the period, or upload supporting documents.",
    actions: [
      { type: "upload", label: "Upload documents" },
      { type: "confirm", label: "Confirm no changes" },
      { type: "schedule", label: "Schedule a call" },
    ],
  },
  tax: {
    name: "Tax",
    description: "Corporate and personal tax compliance and advisory.",
    status: "on_track",
    cycle: "Corporate Tax 2026",
    workflowStatus: "in_progress",
    neededFromUser:
      "We are preparing your tax filings. Upload any requested documents if needed.",
    actions: [
      { type: "upload", label: "Upload documents" },
      { type: "confirm", label: "Confirm details" },
      { type: "schedule", label: "Schedule a call" },
    ],
  },
  payroll: {
    name: "Payroll",
    description:
      "Processing salaries, tax deductions, and statutory filings for employees.",
    status: "on_track",
    cycle: "January 2026",
    workflowStatus: "submitted",
    actions: [{ type: "schedule", label: "Change Payroll Details" }],
  },
  cfo: {
    name: "CFO Services",
    description:
      "Strategic financial advisory, budgeting, and performance analysis.",
    status: "on_track",
    cycle: "Project: Budgeting 2026",
    workflowStatus: "in_progress",
    neededFromUser:
      "Please provide the sales forecast for the upcoming quarter.",
    actions: [{ type: "schedule", label: "Strategy Meeting" }],
  },
  audit: {
    name: "Statutory Audit",
    description:
      "Independent examination of financial statements to ensure accuracy and compliance.",
    status: "action_required",
    cycle: "FY 2025",
    workflowStatus: "waiting",
    neededFromUser: "Missing documents: Management Representation Letter.",
    actions: [
      { type: "upload", label: "Upload Letter" },
      { type: "schedule", label: "Pre-Audit Call" },
    ],
  },
  "csp-mbr": {
    name: "Corporate Services",
    description:
      "Support with company secretarial, registry filings, and corporate governance.",
    status: "on_track",
    cycle: "Annual Return 2025",
    workflowStatus: "completed",
    actions: [],
  },

  "mbr-filing": {
    name: "Filings",
    description:
      "Preparation and submission of statutory filings with the Malta Business Registry.",
    status: "action_required",
    cycle: "Annual Return 2026",
    workflowStatus: "waiting",
    neededFromUser:
      "Confirm company details and approve directors/shareholders list.",
    actions: [
      { type: "confirm", label: "Confirm details" },
      { type: "upload", label: "Upload documents" },
      { type: "schedule", label: "Schedule call" },
    ],
  },
  incorporation: {
    name: "Incorporation",
    description: "Process of legally forming a new corporate entity.",
    status: "on_track",
    cycle: "New Incorporation",
    workflowStatus: "submitted",
    neededFromUser: "Waiting for registry approval. No actions needed.",
    actions: [],
  },
  "business-plans": {
    name: "Business Plans",
    description:
      "Strategic planning, financial modelling and business plans.",
    status: "action_required",
    cycle: "Project: Strategic Plan",
    workflowStatus: "waiting",
    neededFromUser: "Please review the draft plan and provide feedback.",
    actions: [{ type: "schedule", label: "Review Session" }],
  },
  liquidation: {
    name: "Liquidation",
    description:
      "Formal process of closing a company and distributing its assets.",
    status: "on_track",
    cycle: "Liquidation Process",
    workflowStatus: "in_progress",
    actions: [{ type: "schedule", label: "Consult Liquidator" }],
  },
  "banking-payments": {
    name: "Banking & Payments",
    description: "Manage bank accounts, payments, and corporate banking workflows.",
    status: "on_track",
    cycle: "January 2026",
    workflowStatus: "in_progress",
    actions: [
      { type: "upload", label: "Upload Statement" },
      { type: "confirm", label: "Approve Payment" }
    ],
  },
  "regulated-licenses": {
    name: "Regulated Licenses",
    description: "Management of regulatory license applications, renewals, and ongoing compliance.",
    status: "on_track",
    cycle: "February 2026",
    workflowStatus: "in_progress",
    neededFromUser: "Please upload the AML policy draft for the MFSA application.",
    actions: [
      { type: "upload", label: "Upload AML Policy" },
      { type: "confirm", label: "Confirm Details" }
    ],
  },
  "international-structuring": {
    name: "International Structuring",
    description:
      "Design, implementation, and management of cross-border group structures.",
    status: "action_required",
    cycle: "Structuring Review",
    workflowStatus: "waiting",

    neededFromUser: "Please upload your existing group structure and ownership details.",

    actions: [
      { type: "upload", label: "Upload Documents" },
      { type: "confirm", label: "Review Proposal" },
    ],
  },
  "crypto-digital-assets": {
    name: "Crypto & Digital Assets",
    description:
      "Coordination of structuring, banking, compliance, and reporting for crypto exposure.",
    status: "action_required",
    cycle: "Initial Crypto Review",
    workflowStatus: "waiting",

    neededFromUser:
      "Upload wallet addresses and exchange statements for review.",

    actions: [
      { type: "upload", label: "Upload Documents" },
      { type: "confirm", label: "Review Structure" },
    ],
  },
  "project-transactions": {
    name: "Projects Transactions",
    description: "Capital projects, transactions, and data room management.",
    status: "on_track",
    cycle: "Project 2026",
    workflowStatus: "in_progress",
    actions: [{ type: "schedule", label: "Project Meeting" }],
  },
  "technology": {
    name: "Technology",
    description: "Technology infrastructure, software solutions and support.",
    status: "on_track",
    cycle: "IT Support 2026",
    workflowStatus: "in_progress",
    actions: [{ type: "schedule", label: "Technical Support" }],
  },
  "grants-incentives": {
    name: "Grants and Incentives",
    description: "Government grants, tax incentives and funding support.",
    status: "on_track",
    cycle: "Grant Cycle 2026",
    workflowStatus: "in_progress",
    actions: [{ type: "schedule", label: "Grant Consultation" }],
  },
};


const ServiceEngagement = ({ serviceSlug, engagementId: propEngagementId }: ServiceEngagementProps) => {
  const searchParams = useSearchParams();
  const urlEngagementId = searchParams.get('engagementId');
  const router = useRouter();
  const pathname = usePathname();
  const { activeCompanyId } = useActiveCompany();

  const data = serviceData[serviceSlug] || {
    name: "Service Engagement",
    description: "Engagement overview for our corporate services.",
    status: "on_track" as EngagementStatus,
    cycle: "Ongoing",
    workflowStatus: "in_progress" as WorkflowStatus,
    actions: [],
  };

  const [matchingEngagements, setMatchingEngagements] = useState<any[]>([]);
  const [activeEngagementId, setActiveEngagementId] = useState<string | null>(null);
  const [engagementLoading, setEngagementLoading] = useState(false);
  const [engagementNotFound, setEngagementNotFound] = useState(false);
  const { sidebarData, loading: sidebarLoading } = useGlobalDashboard();
  const hasFetchedRef = useRef(false);

  const finalEngagementId = propEngagementId || urlEngagementId || activeEngagementId;

  useEffect(() => {
    if (propEngagementId || urlEngagementId || ENGAGEMENT_CONFIG.USE_MOCK_DATA || !activeCompanyId || sidebarLoading) {
      if (sidebarLoading) setEngagementLoading(true);
      else setEngagementLoading(false);
      return;
    }

    const findMatchingEngagements = () => {
      setEngagementLoading(true);
      setEngagementNotFound(false);

      // Find metadata key for this slug
      const metadataKey = Object.keys(SERVICE_METADATA).find(key => 
        SERVICE_METADATA[key].href.endsWith(`/${serviceSlug}`)
      );

      if (!metadataKey) {
        setEngagementNotFound(true);
        setEngagementLoading(false);
        return;
      }

      const metadata = SERVICE_METADATA[metadataKey];
      
      // Find matching item in sidebarData
      const sidebarItem = sidebarData.find(s => {
        const normalizedItem = s.serviceName.toUpperCase().replace(/[^A-Z0-9]+/g, "_").replace(/^_+|_+$/g, "");
        const normalizedKey = metadataKey.replace(/[^A-Z0-9]+/g, "_");
        const normalizedLabel = metadata.label.toUpperCase().replace(/[^A-Z0-9]+/g, "_").replace(/^_+|_+$/g, "");

        return normalizedItem === normalizedKey || normalizedItem === normalizedLabel;
      });

      if (!sidebarItem || !sidebarItem.activeEngagements || sidebarItem.activeEngagements.length === 0) {
        setEngagementNotFound(true);
        setEngagementLoading(false);
        return;
      }

      setMatchingEngagements(sidebarItem.activeEngagements);

      if (sidebarItem.activeEngagements.length === 1) {
        const matchId = sidebarItem.activeEngagements[0].id;
        setActiveEngagementId(matchId);
        // Replace current URL with the specific engagement URL
        // Structure: /dashboard/services/[slug]/[id]
        const targetUrl = `/dashboard/services/${serviceSlug}/${matchId}`;
        if (pathname !== targetUrl) {
          router.replace(targetUrl);
        }
      } else if (sidebarItem.activeEngagements.length > 1 && !pathname.includes('/engagements')) {
        // Redirection to list page if multiple and not already there
        router.replace(`/dashboard/services/${serviceSlug}/engagements`);
      }
      
      setEngagementLoading(false);
    };

    findMatchingEngagements();
  }, [propEngagementId, urlEngagementId, serviceSlug, activeCompanyId, sidebarData, sidebarLoading, router, pathname]);

  const engagementIdToUse = finalEngagementId || (ENGAGEMENT_CONFIG.USE_MOCK_DATA ? `mock-engagement-${serviceSlug}` : "");

  // Loading: fetching engagements to find matching one
  if (engagementLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 p-8">
        <Spinner size={40} className="text-primary" />
        <p className="text-sm text-muted-foreground">Loading engagement...</p>
      </div>
    );
  }

  // No engagement found - show request service CTA
  if (engagementNotFound && !engagementIdToUse) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-6 p-8 max-w-lg mx-auto text-center">
        <div className="rounded-full bg-muted p-4 text-muted-foreground">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="12" y1="18" x2="12" y2="12" />
            <line x1="9" y1="15" x2="15" y2="15" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold">No active engagement for {data.name}</h2>
        <p className="text-sm text-muted-foreground">
          You don&apos;t have an active engagement for this service yet. Request the service to get started.
        </p>
        <Link
          href="/dashboard/services/request"
          className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Request service
        </Link>
      </div>
    );
  }

  if (!engagementIdToUse) {
    if (matchingEngagements.length > 1) {
      return (
        <div className="w-full">
          <EngagementSelectionCards 
            engagements={matchingEngagements} 
            serviceSlug={serviceSlug}
            serviceName={data.name}
          />
        </div>
      );
    }
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 p-8">
        <Spinner size={40} className="text-primary" />
        <p className="text-sm text-muted-foreground">Loading engagement...</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <EngagementProvider engagementId={engagementIdToUse} serviceSlug={serviceSlug}>
        <EngagementSummary
          serviceName={data.name}
          serviceSlug={serviceSlug}
          description={data.description}
          status={data.status}
          cycle={data.cycle}
          workflowStatus={data.workflowStatus}
          neededFromUser={data.neededFromUser}
          actions={data.actions}
        />
      </EngagementProvider>
    </div>
  );
};

export default ServiceEngagement;
