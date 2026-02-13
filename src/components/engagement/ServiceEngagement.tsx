"use client";

import React from "react";
import EngagementSummary, {
  EngagementAction,
  EngagementStatus,
  WorkflowStatus,
} from "./EngagementSummary";
import BackButton from "../shared/BackButton";
import { EngagementProvider } from "./hooks/useEngagement";

interface ServiceEngagementProps {
  serviceSlug: string;
}

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
  "grants-incentives": {
    name: "Grants & Incentives",
    description:
      "Exploration and application for government and institutional grants.",
    status: "due_soon",
    cycle: "Grant: R&D Tax Credit",
    workflowStatus: "waiting",
    neededFromUser:
      "Upload project technical reports for the grant application.",
    actions: [{ type: "upload", label: "Upload Reports" }],
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
      "Development of professional business plans and financial projections.",
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
};

const ServiceEngagement: React.FC<ServiceEngagementProps> = ({
  serviceSlug,
}) => {
  const data = serviceData[serviceSlug] || {
    name: "Service Engagement",
    description: "Engagement overview for our corporate services.",
    status: "on_track" as EngagementStatus,
    cycle: "Ongoing",
    workflowStatus: "in_progress" as WorkflowStatus,
    actions: [],
  };

  // Generate a stable mock ID for the provider if no real ID is available
  const mockId = `mock-engagement-${serviceSlug}`;

  return (
    <div className="p-8 max-w-[1600px] mx-auto min-h-screen bg-white">
      <EngagementProvider engagementId={mockId} serviceSlug={serviceSlug}>
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
