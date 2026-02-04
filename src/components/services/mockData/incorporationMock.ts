import { ServiceMockData } from "./index";
import { MOCK_TEAM, MOCK_MESSAGES } from "./helpers";

export const incorporationMock: ServiceMockData = {
  serviceSlug: "incorporation",
  serviceName: "Incorporation",
  description: "Process of legally forming a new corporate entity.",
  milestones: [
    {
      id: "inc-1",
      title: "Name Approval",
      description: "Securing the chosen company name with the registry.",
      date: "Jan 05, 2026",
      status: "completed",
    },
    {
      id: "inc-2",
      title: "Capital Deposit",
      description: "Proof of paid-up share capital from the bank.",
      date: "Jan 18, 2026",
      status: "completed",
    },
    {
      id: "inc-3",
      title: "Certificate Issuance",
      description: "Final registration and issuance of the Certificate of Incorporation.",
      date: "Jan 28, 2026",
      status: "in_progress",
    },
  ],
  documentRequests: [
    {
      _id: "req-inc-1",
      title: "Articles of Association",
      description: "Drafted articles for review and digital signature.",
      status: "completed",
      category: "legal",
      documents: [{ name: "Articles_Draft_v1.pdf", url: "mock-url" }],
      multipleDocuments: [],
    },
  ],
  complianceItems: [
  {
    id: "bp-c-1",
    title: "Draft v1 Review Deadline",
    type: "Internal Review",
    dueDate: "2026-02-15",
    status: "upcoming",
    authority: "VACEI Team",
    description: "Client review and feedback on Draft v1.",
  },
  {
    id: "bp-c-2",
    title: "Final Plan Submission",
    type: "Delivery",
    dueDate: "2026-03-01",
    status: "filed",
    authority: "VACEI Team",
    description: "Final business plan delivery to client.",
  },
  {
    id: "bp-c-3",
    title: "Financial Model Approval",
    type: "Approval",
    dueDate: "2026-02-20",
    status: "filed",
    authority: "Finance Lead",
    description: "Approval of financial projections.",
  },
],

  summaryData: {
    companyName: "TechNova Solutions Ltd",
    registrationNumber: "C102345",
    incorporationDate: "Jan 30, 2026",
  },
  team: MOCK_TEAM,
  messages: [
    {
      id: 'i-m-1',
      senderId: 'mark_t',
      senderName: 'Mark Thompson',
      senderRole: 'Manager',
      content: "Welcome to TechNova! We've successfully reserved your company name. Next step is the capital deposit.",
      timestamp: new Date(Date.now() - 3600000 * 168).toISOString(),
      read: true,
      type: 'message'
    }
  ],
  libraryItems: [
    { id: 'i-l-root', folder_name: 'TechNova Incorporation', type: 'folder', parentId: null, tags: ['incorporation'], uploaderId: 'user-1', isDeleted: false, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
    { id: 'i-l-legal', folder_name: 'Constitutional Docs', type: 'folder', parentId: 'i-l-root', tags: ['incorporation'], uploaderId: 'user-1', isDeleted: false, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
    { id: 'i-l-kyc', folder_name: 'KYC Dossier', type: 'folder', parentId: 'i-l-root', tags: ['incorporation'], uploaderId: 'user-1', isDeleted: false, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
    { id: 'i-l-kyc-director1', folder_name: 'John Smith (Director)', type: 'folder', parentId: 'i-l-kyc', tags: ['incorporation'], uploaderId: 'user-1', isDeleted: false, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
    { id: 'i-l-f1', file_name: 'Certificate_of_Incorporation.pdf', type: 'file', file_type: 'PDF', file_size: 2048000, url: '#', folderId: 'i-l-legal', version: 1, tags: ['official'], uploaderId: 'user-1', isDeleted: false, createdAt: '2024-01-20T10:00:00Z' },
    { id: 'i-l-f2', file_name: 'Certified_Passport_JS.pdf', type: 'file', file_type: 'PDF', file_size: 890000, url: '#', folderId: 'i-l-kyc-director1', version: 1, tags: ['kyc'], uploaderId: 'user-1', isDeleted: false, createdAt: '2024-01-15T10:00:00Z' }
  ],
  incorporationFilings: [
    {
      id: "inc-f-1",
      stage: "Company Name Approval",
      description: "Registrar name clearance",
      status: "Completed",
      serviceStatus: "on_track",
      completedOn: "05 Feb 2026",
      documents: ["Approval Letter"],
    },
    {
      id: "inc-f-2",
      stage: "KYC & Due Diligence",
      description: "Directors & shareholders verification",
      status: "Waiting on you",
      serviceStatus: "action_required",
      completedOn: "—",
      documents: [],
    },
    {
      id: "inc-f-3",
      stage: "Constitutional Documents",
      description: "Memorandum & Articles",
      status: "In progress",
      serviceStatus: "on_track",
      completedOn: "—",
      documents: ["Draft M&A"],
    },
    {
      id: "inc-f-4",
      stage: "Registration Filing",
      description: "Submission to registry",
      status: "Not started",
      serviceStatus: "on_track",
      completedOn: "—",
      documents: [],
    },
    {
      id: "inc-f-5",
      stage: "Certificate of Incorporation",
      description: "Company legally formed",
      status: "Not started",
      serviceStatus: "on_track",
      completedOn: "—",
      documents: [],
    },
  ],
  incorporationProgress: [
    { step: "Name Reservation & Approval", status: "completed" },
    { step: "KYC & Compliance Checks", status: "completed" },
    { step: "Drafting Statues", status: "in_progress" },
    { step: "Registry Submission", status: "pending" }
  ],
  recentActivity: [
    { action: "Company name 'TechNova Solutions' approved", date: "Jan 25" },
    { action: "Shareholder ID verification completed", date: "Jan 20" },
    { action: "Memorandum & Articles draft started", date: "Jan 18" }
  ],
  quickAccessDocs: [
    { name: "Certificate of Incorporation", date: "Jan 30, 2026", url: "#" },
    { name: "Statutory Register Draft", date: "Jan 25, 2026", url: "#" },
    { name: "Memorandum & Articles", date: "Jan 20, 2026", url: "#" }
  ]
};
