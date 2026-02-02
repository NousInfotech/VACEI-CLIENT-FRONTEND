import { ServiceMockData } from "./index";

export const regulatedLicensesMock: ServiceMockData = {
  serviceSlug: "regulated-licenses",
  serviceName: "Regulated Licenses",
  description: "Management of regulatory license applications, renewals, and ongoing compliance.",
  currentPeriod: "February 2026",
  lastUpdate: "Today",
  nextStep: "Upload AML policy draft for MFSA application",
  milestones: [
    {
      id: "rl-m-1",
      title: "License Scoping & Eligibility",
      description: "Confirming the applicable license type, regulator requirements, and feasibility.",
      date: "Jan 15, 2026",
      status: "completed",
    },
    {
      id: "rl-m-2",
      title: "Information & KYC Collection",
      description: "Collecting required corporate, ownership, and key person documentation.",
      date: "Jan 30, 2026",
      status: "completed",
    },
    {
      id: "rl-m-3",
      title: "Business Model Review",
      description: "Reviewing the business activities, operational flows, and risk profile.",
      date: "Feb 10, 2026",
      status: "completed",
    },
    {
      id: "rl-m-4",
      title: "Governance & Key Persons Setup",
      description: "Confirming directors, compliance roles, and fit-and-proper documentation.",
      date: "Feb 28, 2026",
      status: "in_progress",
    },
    {
      id: "rl-m-5",
      title: "Policies & Procedures Preparation",
      description: "Preparing required regulatory policies and internal controls.",
      date: "Mar 15, 2026",
      status: "pending",
    },
    {
      id: "rl-m-6",
      title: "Financial Pack Preparation",
      description: "Preparing financial information, projections, and supporting evidence.",
      date: "Mar 30, 2026",
      status: "pending",
    },
    {
      id: "rl-m-7",
      title: "Application Pack Drafting",
      description: "Compiling regulator forms and the complete submission pack.",
      date: "Apr 15, 2026",
      status: "pending",
    },
    {
      id: "rl-m-8",
      title: "Client Review & Confirmation",
      description: "Client review and confirmation of application content and details.",
      date: "Apr 30, 2026",
      status: "pending",
    },
    {
      id: "rl-m-9",
      title: "Submission to Regulator",
      description: "Submitting the application to the relevant authority.",
      date: "May 15, 2026",
      status: "pending",
    },
    {
      id: "rl-m-10",
      title: "Regulator Queries Handling",
      description: "Responding to regulator questions and clarification requests.",
      date: "Jun 15, 2026",
      status: "pending",
    },
    {
      id: "rl-m-11",
      title: "License Decision",
      description: "Receiving and recording the regulator’s decision.",
      date: "Jul 15, 2026",
      status: "pending",
    },
    {
      id: "rl-m-12",
      title: "Ongoing Compliance Setup",
      description: "Setting up reporting, renewals, and future compliance obligations.",
      date: "Aug 15, 2026",
      status: "pending",
    },
  ],
  licenseCases: [
    {
      id: "case-001",
      licenseType: "Crypto Asset Service Provider (CASP)",
      regulator: "MFSA",
      caseType: "New Application",
      status: "Governance Review",
      targetDate: "May 15, 2026",
    },
    {
      id: "case-002",
      licenseType: "Payment Service Provider (PSP)",
      regulator: "Central Bank",
      caseType: "Renewal",
      status: "Documents Pending",
      targetDate: "Mar 10, 2026",
    }
  ],
  regulatedLicensesFilings: [
    {
      id: "filing-001",
      title: "Phase 1 Application Pack",
      type: "Application",
      regulator: "MFSA",
      submissionDate: "2026-01-20",
      status: "Submitted",
      documents: ["Form_A.pdf", "Business_Plan_v1.pdf"],
    },
    {
      id: "filing-002",
      title: "KYC Dossier - Directors",
      type: "Compliance",
      regulator: "MFSA",
      submissionDate: "2026-02-05",
      status: "In Review",
      documents: ["Director_KYC_Pack.zip"],
      queryRounds: 1
    }
  ],
  documentRequests: [
    {
      _id: "req-rl-1",
      title: "Proof of Sovereign Funds",
      description: "Please provide bank statements or audit reports showing source of initial capital.",
      status: "pending",
      category: "Financial",
      documents: [],
      multipleDocuments: [],
      caseId: "case-001",
    }
  ],
  complianceItems: [
    {
      id: "rl-c-1",
      title: "Annual Regulatory Fee",
      type: "Fee",
      dueDate: "2026-03-31",
      status: "upcoming",
      authority: "MFSA",
      description: "Payment of annual supervision fee for license category.",
    },
    {
      id: "rl-c-2",
      title: "QUARTERLY STATISTICAL RETURN",
      type: "Reporting",
      dueDate: "2026-04-15",
      status: "upcoming",
      authority: "Central Bank",
      description: "Submission of quarterly transaction volume and risk metrics.",
    }
  ],
  messages: [],
  recentActivity: [
    { action: "Document 'AML_Policy_Draft.docx' uploaded", date: "2 hours ago" },
    { action: "Case 'case-001' status updated to 'Governance Review'", date: "Yesterday" },
    { action: "Regulator query received for 'case-001'", date: "2 days ago" },
  ],
  quickAccessDocs: [
    { name: "AML_Policy_Draft.docx", title: "AML Policy Draft", date: "Feb 15, 2026" },
    { name: "MFSA_Application_Form.pdf", title: "MFSA Application Form", date: "Feb 10, 2026" },
    { name: "Fit_Proper_Declaration.pdf", title: "Fit & Proper Declaration", date: "Feb 05, 2026" },
  ],
  actionNeeded: {
    type: "document_request",
    title: "Upload AML policy draft",
    description: "The regulator requires the draft AML policy for the CASP application.",
    ctaLabel: "UPLOAD DOCUMENTS",
  }
};
