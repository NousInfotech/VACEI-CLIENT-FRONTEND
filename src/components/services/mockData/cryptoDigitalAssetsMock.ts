import { ServiceMockData } from "./index";
import { MOCK_TEAM, MOCK_MESSAGES } from "./helpers";

export const cryptoDigitalAssetsMock: ServiceMockData = {
  serviceSlug: "crypto-digital-assets",
  serviceName: "Crypto & Digital Assets",
  description: "Coordination of structuring, compliance, and banking for crypto-related activity.",

  /* ================= DASHBOARD SUMMARY ================= */

  currentPeriod: "Initial Crypto Review",
  lastUpdate: "2026-01-26",
  nextStep: "Upload wallet overview and exchange statements",

  actionNeeded: {
    type: "document_request",
    title: "Upload Wallet Documentation",
    description: "Provide wallet addresses and exchange account statements.",
    ctaLabel: "Upload Documents",
  },

  /* ================= CRYPTO OVERVIEW ================= */

  summaryData: {
    exposureType: "Business",
    activityType: "Trading & Holding",
    structuringStatus: "Under Review",
    description:
      "Business trading and holding digital assets across multiple centralized and self-custody wallets.",
  },

  /* ================= MILESTONES ================= */

  milestones: [
    {
      id: "cr-m-1",
      title: "Initial Crypto Review",
      description: "Assessment of crypto exposure and risks.",
      date: "Jan 05, 2026",
      status: "completed",
    },
    {
      id: "cr-m-2",
      title: "Activity & Risk Assessment",
      description: "Evaluation of transaction patterns.",
      date: "Jan 10, 2026",
      status: "completed",
    },
    {
      id: "cr-m-3",
      title: "Structuring & Positioning Design",
      description: "Design of compliant crypto structure.",
      date: "Jan 15, 2026",
      status: "in_progress",
    },
    {
      id: "cr-m-4",
      title: "Client Review & Confirmation",
      description: "Client approval of proposed structure.",
      date: "Jan 20, 2026",
      status: "pending",
    },
    {
      id: "cr-m-5",
      title: "Banking & Cash-Out Preparation",
      description: "Preparation for fiat conversion.",
      date: "Jan 30, 2026",
      status: "pending",
    },
    {
      id: "cr-m-6",
      title: "Compliance & Reporting Alignment",
      description: "Regulatory and tax alignment.",
      date: "Feb 05, 2026",
      status: "pending",
    },
    {
      id: "cr-m-7",
      title: "Ongoing Coordination Activation",
      description: "Long-term management setup.",
      date: "Feb 12, 2026",
      status: "pending",
    },
  ],

  /* ================= DOCUMENT REQUESTS ================= */

  documentRequests: [
    {
      _id: "cr-doc-1",
      title: "Wallet Address List",
      description: "Provide all active wallet addresses.",
      status: "in_progress",
      category: "wallets",
      documents: [],
      multipleDocuments: [],
    },
    {
      _id: "cr-doc-2",
      title: "Exchange Statements",
      description: "Upload trading history from exchanges.",
      status: "pending",
      category: "trading",
      documents: [],
      multipleDocuments: [],
    },
    {
      _id: "cr-doc-3",
      title: "Transaction Summary",
      description: "Provide yearly transaction summary.",
      status: "submitted",
      category: "reporting",
      documents: [],
      multipleDocuments: [],
    },
  ],

  /* ================= COMPLIANCE ================= */

  complianceItems: [
    {
      id: "cr-c-1",
      title: "Crypto Tax Reporting",
      type: "Tax Compliance",
      dueDate: "2026-06-30",
      status: "upcoming",
      authority: "Tax Authority",
      description: "Annual crypto activity reporting.",
    },
    {
      id: "cr-c-2",
      title: "Bank Review Checkpoint",
      type: "Banking Review",
      dueDate: "2026-02-20",
      status: "pending",
      authority: "Primary Bank",
      description: "Bank compliance review of crypto exposure.",
    },
  ],

  /* ================= TEAM & MESSAGES ================= */

  team: MOCK_TEAM,
  messages: MOCK_MESSAGES,

  /* ================= LIBRARY ================= */

  libraryItems: [
    {
      id: "cr-lib-root",
      folder_name: "Crypto Documentation",
      type: "folder",
      parentId: null,
      tags: ["crypto"],
      uploaderId: "user-1",
      isDeleted: false,
      createdAt: "2026-01-01T09:00:00Z",
      updatedAt: "2026-01-01T09:00:00Z",
    },
    {
      id: "cr-lib-f1",
      file_name: "Crypto_Structuring_Summary.pdf",
      type: "file",
      file_type: "PDF",
      file_size: 780000,
      url: "#",
      folderId: "cr-lib-root",
      version: 1,
      tags: ["structuring"],
      uploaderId: "user-1",
      isDeleted: false,
      createdAt: "2026-01-12T10:00:00Z",
    },
  ],

  /* ================= FILINGS ================= */

  accountingFilings: [
    {
      id: "cr-f-1",
      period: "Crypto Structuring Summary",
      frequency: "One-off",
      periodStatus: "Completed",
      serviceStatus: "on_track",
      completedOn: "18 Jan 2026",
      deliverables: ["Summary Report"],
    },
    {
      id: "cr-f-2",
      period: "Banking Documentation Submission",
      frequency: "One-off",
      periodStatus: "In Progress",
      serviceStatus: "on_track",
      completedOn: "—",
      deliverables: [],
    },
  ],

  /* ================= ACTIVITY ================= */

  recentActivity: [
    { action: "Wallet list uploaded", date: "Jan 24" },
    { action: "Risk assessment completed", date: "Jan 19" },
    { action: "Structuring review started", date: "Jan 15" },
  ],

  /* ================= QUICK DOCS ================= */

  quickAccessDocs: [
    { name: "Structuring Summary", date: "Jan 18, 2026", url: "#" },
    { name: "Banking Explanation", date: "Jan 14, 2026", url: "#" },
    { name: "Compliance Notes", date: "Jan 10, 2026", url: "#" },
  ],
};
