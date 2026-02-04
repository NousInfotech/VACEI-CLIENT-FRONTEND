import { ServiceMockData } from "./index";
import { MOCK_TEAM, MOCK_MESSAGES } from "./helpers";

export const internationalStructuringMock: ServiceMockData = {
  serviceSlug: "international-structuring",
  serviceName: "International Structuring",
  description: "Design, implementation, and management of cross-border group structures.",

  /* ================= DASHBOARD SUMMARY ================= */

  currentPeriod: "Structuring Review",
  lastUpdate: "2026-01-28",
  nextStep: "Review proposed group structure",

  actionNeeded: {
    type: "document_request",
    title: "Upload Group Structure",
    description: "Please upload your existing group ownership and structure documentation.",
    ctaLabel: "Upload Documents",
  },

  /* ================= GROUP OVERVIEW ================= */

  summaryData: {
    totalEntities: 6,
    jurisdictions: 4,
    structureStatus: "Implementation",
    description:
      "Group structure spanning EU, UK, and UAE entities with shared treasury and management functions.",
  },

  /* ================= MILESTONES ================= */

  milestones: [
    {
      id: "is-m-1",
      title: "Initial Structuring Review",
      description: "Assessment of current structure and objectives.",
      date: "Jan 05, 2026",
      status: "completed",
    },
    {
      id: "is-m-2",
      title: "Structure Design & Proposal",
      description: "Development of optimal group structure.",
      date: "Jan 10, 2026",
      status: "completed",
    },
    {
      id: "is-m-3",
      title: "Jurisdiction & Entity Planning",
      description: "Selection of jurisdictions and entity types.",
      date: "Jan 15, 2026",
      status: "in_progress",
    },
    {
      id: "is-m-4",
      title: "Entity Incorporations",
      description: "Incorporation of new group entities.",
      date: "Jan 25, 2026",
      status: "pending",
    },
    {
      id: "is-m-5",
      title: "Banking & Payment Setup",
      description: "Opening operational and treasury accounts.",
      date: "Feb 05, 2026",
      status: "pending",
    },
    {
      id: "is-m-6",
      title: "Tax & Compliance Alignment",
      description: "Group tax structuring and compliance setup.",
      date: "Feb 12, 2026",
      status: "pending",
    },
    {
      id: "is-m-7",
      title: "Group Operational Setup",
      description: "Implementation of intercompany processes.",
      date: "Feb 18, 2026",
      status: "pending",
    },
    {
      id: "is-m-8",
      title: "Ongoing Management Activation",
      description: "Transition to long-term management phase.",
      date: "Feb 25, 2026",
      status: "pending",
    },
  ],

  /* ================= DOCUMENT REQUESTS ================= */

  documentRequests: [
    {
      _id: "is-doc-1",
      title: "Group Ownership Details",
      description: "Upload existing group ownership and structure documents.",
      status: "pending",
      category: "structure",
      documents: [],
      multipleDocuments: [],
    },
    {
      _id: "is-doc-2",
      title: "Shareholder & Director Information",
      description: "Provide identification and background information.",
      status: "in_progress",
      category: "legal",
      documents: [],
      multipleDocuments: [],
    },
    {
      _id: "is-doc-3",
      title: "Business Activity Description",
      description: "Outline core business activities for each entity.",
      status: "submitted",
      category: "operations",
      documents: [],
      multipleDocuments: [],
    },
  ],

  /* ================= COMPLIANCE ================= */

  complianceItems: [
    {
      id: "is-c-1",
      title: "Malta Company Annual Return",
      type: "Statutory Filing",
      dueDate: "2026-03-31",
      status: "upcoming",
      authority: "MBR",
      description: "Annual statutory filing for Malta entity.",
    },
    {
      id: "is-c-2",
      title: "UAE License Renewal",
      type: "Regulatory",
      dueDate: "2026-04-15",
      status: "upcoming",
      authority: "DMCC",
      description: "Annual renewal of UAE trade license.",
    },
  ],

  /* ================= TEAM & MESSAGES ================= */

  team: MOCK_TEAM,
  messages: MOCK_MESSAGES,

  /* ================= LIBRARY ================= */

  libraryItems: [
    {
      id: "is-lib-root",
      folder_name: "International Structure",
      type: "folder",
      parentId: null,
      tags: ["structure"],
      uploaderId: "user-1",
      isDeleted: false,
      createdAt: "2026-01-01T10:00:00Z",
      updatedAt: "2026-01-01T10:00:00Z",
    },
    {
      id: "is-lib-f1",
      file_name: "Group_Structure_Diagram.pdf",
      type: "file",
      file_type: "PDF",
      file_size: 920000,
      url: "#",
      folderId: "is-lib-root",
      version: 1,
      tags: ["diagram"],
      uploaderId: "user-1",
      isDeleted: false,
      createdAt: "2026-01-10T10:00:00Z",
    },
  ],

  /* ================= FILINGS ================= */

  accountingFilings: [
    {
      id: "is-f-1",
      period: "Malta Ltd Incorporation",
      frequency: "One-off",
      periodStatus: "Completed",
      serviceStatus: "on_track",
      completedOn: "20 Jan 2026",
      deliverables: ["Certificate", "Articles"],
    },
    {
      id: "is-f-2",
      period: "UAE Branch Registration",
      frequency: "One-off",
      periodStatus: "In Progress",
      serviceStatus: "on_track",
      completedOn: "—",
      deliverables: [],
    },
  ],

  /* ================= ACTIVITY ================= */

  recentActivity: [
    { action: "Malta entity incorporated", date: "Jan 22" },
    { action: "Structure proposal approved", date: "Jan 18" },
    { action: "Bank mandate submitted", date: "Jan 14" },
  ],

  /* ================= QUICK DOCS ================= */

  quickAccessDocs: [
    { name: "Group Structure Diagram", date: "Jan 20, 2026", url: "#" },
    { name: "Incorporation Pack - Malta", date: "Jan 15, 2026", url: "#" },
    { name: "Banking Confirmation", date: "Jan 12, 2026", url: "#" },
  ],

  internationalStructuringFilings: [
  {
    id: "is-f-1",
    entity: "Holding Ltd",
    country: "Malta",
    filing: "Annual Return (MBR)",
    period: "FY2024",
    dueDate: "30 Sep 2025",
    status: "due_soon",
    responsibility: "VACEI",
    action: "view",
  },
  {
    id: "is-f-2",
    entity: "Holding Ltd",
    country: "Malta",
    filing: "Financial Statements",
    period: "FY2024",
    dueDate: "31 Dec 2025",
    status: "in_progress",
    responsibility: "VACEI",
    action: "view",
  },
  {
    id: "is-f-3",
    entity: "OpCo GmbH",
    country: "Germany",
    filing: "Annual Accounts",
    period: "FY2024",
    dueDate: "15 Aug 2025",
    status: "waiting_on_advisor",
    responsibility: "External Accountant",
    action: "upload",
  },
  {
    id: "is-f-4",
    entity: "OpCo GmbH",
    country: "Germany",
    filing: "Corporate Tax Return",
    period: "FY2024",
    dueDate: "31 Jul 2025",
    status: "submitted",
    responsibility: "External Accountant",
    action: "view",
  },
  {
    id: "is-f-5",
    entity: "OpCo SARL",
    country: "France",
    filing: "VAT Return",
    period: "Q2 2025",
    dueDate: "21 Aug 2025",
    status: "due_soon",
    responsibility: "VACEI",
    action: "view",
  },
  {
    id: "is-f-6",
    entity: "Group",
    country: "Multi-country",
    filing: "Substance Review",
    period: "Annual",
    dueDate: "30 Nov 2025",
    status: "on_track",
    responsibility: "VACEI",
    action: "view",
  },
  {
    id: "is-f-7",
    entity: "Group",
    country: "Multi-country",
    filing: "Structure Review",
    period: "Event-based",
    dueDate: "—",
    status: "on_track",
    responsibility: "VACEI",
    action: "view",
  },
],


};

