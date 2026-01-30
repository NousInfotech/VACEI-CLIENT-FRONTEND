import { ServiceMockData } from "./index";
import { MOCK_TEAM, MOCK_MESSAGES } from "./helpers";

export const auditMock: ServiceMockData = {
  serviceSlug: "audit",
  serviceName: "Statutory Audit",
  description: "Independent examination of financial statements to ensure accuracy and compliance.",
  milestones: [
  {
    id: "1",
    title: "Pre-Audit Planning",
    description: "Risk assessment, materiality determination, and audit strategy development.",
    date: "Jan 10, 2026",
    status: "completed",
  },
  {
    id: "2",
    title: "Engagement Letter & Scope Confirmation",
    description: "Finalising audit scope, timelines, and engagement terms.",
    date: "Jan 12, 2026",
    status: "completed",
  },
  {
    id: "3",
    title: "Internal Control Understanding",
    description: "Review of internal controls and process walkthroughs.",
    date: "Jan 15, 2026",
    status: "completed",
  },
  {
    id: "4",
    title: "Interim Audit Procedures",
    description: "Preliminary testing of key balances and transactions.",
    date: "Jan 18, 2026",
    status: "completed",
  },
  {
    id: "5",
    title: "Fieldwork",
    description: "Substantive testing and detailed documentation review.",
    date: "Jan 25, 2026",
    status: "in_progress",
  },
  {
    id: "6",
    title: "Audit Queries & Management Responses",
    description: "Raising audit queries and reviewing management responses.",
    date: "Feb 05, 2026",
    status: "pending",
  },
  {
    id: "7",
    title: "Completion & Partner Review",
    description: "Final review of audit files and conclusions.",
    date: "Feb 12, 2026",
    status: "pending",
  },
  {
    id: "8",
    title: "Final Audit Report",
    description: "Issuance of the audit opinion and final audit report.",
    date: "Feb 20, 2026",
    status: "pending",
  },
  ],
  documentRequests: [
    {
      _id: "req-aud-1",
      title: "Fixed Asset Register",
      description: "Provide the updated fixed asset register as of year-end.",
      status: "pending",
      category: "assets",
      documents: [{ name: "Asset_Register_Template.xlsx" }],
      multipleDocuments: [],
    },
    {
      _id: "req-aud-2",
      title: "Engagement Letter",
      description: "Signed copy of the audit engagement letter.",
      status: "completed",
      category: "legal",
      documents: [{ name: "Signed_Engagement_Letter.pdf", url: "mock-url" }],
      multipleDocuments: [],
    },
  ],
  complianceItems: [
    {
      id: "aud-c-1",
      title: "Statutory Audit FY2025",
      type: "Statutory Requirement",
      dueDate: "2026-09-30",
      status: "upcoming",
      authority: "MBR",
      description: "Annual statutory audit filing.",
    },
  ],
  team: MOCK_TEAM,
  messages: [
    {
      id: 'au-m-1',
      senderId: 'sarah_j',
      senderName: 'Sarah Jennings',
      senderRole: 'Partner',
      content: "The preliminary audit plan for 2025 has been uploaded. Please review the materiality thresholds.",
      timestamp: new Date(Date.now() - 3600000 * 72).toISOString(),
      read: true,
      type: 'message'
    }
  ],
  libraryItems: [
    { id: 'au-l-root', folder_name: 'Audit 2025 Dossier', type: 'folder', parentId: null, tags: ['audit'], uploaderId: 'user-1', isDeleted: false, createdAt: '2025-11-20T10:00:00Z', updatedAt: '2025-11-20T10:00:00Z' },
    { id: 'au-l-planning', folder_name: 'Planning & Risk', type: 'folder', parentId: 'au-l-root', tags: ['audit'], uploaderId: 'user-1', isDeleted: false, createdAt: '2025-12-01T10:00:00Z', updatedAt: '2025-12-01T10:00:00Z' },
    { id: 'au-l-pbc', folder_name: 'PBC (Provided by Client)', type: 'folder', parentId: 'au-l-root', tags: ['audit'], uploaderId: 'user-1', isDeleted: false, createdAt: '2026-01-05T10:00:00Z', updatedAt: '2026-01-05T10:00:00Z' },
    { id: 'au-l-pbc-cash', folder_name: 'Cash & Banking', type: 'folder', parentId: 'au-l-pbc', tags: ['audit'], uploaderId: 'user-1', isDeleted: false, createdAt: '2026-01-05T10:00:00Z', updatedAt: '2026-01-05T10:00:00Z' },
    { id: 'au-l-pbc-fixed', folder_name: 'Fixed Assets', type: 'folder', parentId: 'au-l-pbc', tags: ['audit'], uploaderId: 'user-1', isDeleted: false, createdAt: '2026-01-05T10:00:00Z', updatedAt: '2026-01-05T10:00:00Z' },
    { id: 'au-l-f1', file_name: 'Engagement_Letter_Signed.pdf', type: 'file', file_type: 'PDF', file_size: 1540000, url: '#', folderId: 'au-l-planning', version: 1, tags: ['administrative'], uploaderId: 'user-1', isDeleted: false, createdAt: '2025-11-25T10:00:00Z' },
    { id: 'au-l-f2', file_name: 'Materiality_Assessment.pdf', type: 'file', file_type: 'PDF', file_size: 890000, url: '#', folderId: 'au-l-planning', version: 2, tags: ['planning'], uploaderId: 'user-1', isDeleted: false, createdAt: '2025-12-10T10:00:00Z' },
    { id: 'au-l-f3', file_name: 'Bank_Confirmation_HSBC.pdf', type: 'file', file_type: 'PDF', file_size: 512000, url: '#', folderId: 'au-l-pbc-cash', version: 1, tags: ['external'], uploaderId: 'user-1', isDeleted: false, createdAt: '2026-01-20T10:00:00Z' }
  ],
  filings: [
    { id: 'au-f-1', filing_type: 'Audit Plan', reference: 'FY 2025', status: 'completed', due_date: '2026-01-10', filing_status: 'completed' }
  ],
  etb: {
    accounts: [
      { code: "1000", name: "Cash", debit: 120000, credit: 0 },
      { code: "1500", name: "Inventory", debit: 45000, credit: 0 },
      { code: "3000", name: "Share Capital", debit: 0, credit: 100000 },
    ],
    totalDebit: 165000,
    totalCredit: 100000,
    isBalanced: false
  },
  adjustments: [
    {
      id: "adj-1",
      description: "To record depreciation for the year",
      date: "2025-12-31",
      status: "draft",
      entries: [
        { accountCode: "5100", accountName: "Depreciation Expense", debit: 5000, credit: 0 },
        { accountCode: "1810", accountName: "Accumulated Depreciation", debit: 0, credit: 5000 }
      ]
    }
  ],
  leadSheets: [
    { id: "ls-1", title: "A - Cash and Cash Equivalents", status: "reviewed" },
    { id: "ls-2", title: "B - Accounts Receivable", status: "in_progress" }
  ],
  auditProgress: [
    { step: "Planning & Risk Assessment", status: "completed" },
    { step: "Internal Controls Review", status: "completed" },
    { step: "Substantive Testing", status: "in_progress" },
    { step: "Reporting & Opinion", status: "pending" }
  ],
  recentActivity: [
    { action: "Cash confirmation received", date: "Jan 27" },
    { action: "Bank reconciliation reviewed", date: "Jan 24" },
    { action: "Materiality levels established", date: "Jan 15" }
  ],
  quickAccessDocs: [
    { name: "Audit Plan 2025", date: "Jan 20, 2026", url: "#" },
    { name: "PBC List - Finance", date: "Jan 15, 2026", url: "#" },
    { name: "Engagement Letter", date: "Jan 10, 2026", url: "#" }
  ]
};
