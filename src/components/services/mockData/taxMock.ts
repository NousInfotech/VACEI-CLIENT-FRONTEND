import { ServiceMockData } from "./index";
import { MOCK_TEAM, MOCK_MESSAGES } from "./helpers";

export const taxMock: ServiceMockData = {
  serviceSlug: "tax",
  serviceName: "Tax",
  description: "Corporate and personal tax compliance and advisory.",
  milestones: [
    {
      id: "tax-1",
      title: "Tax computation",
      description: "Calculating the tax liability based on audited accounts.",
      date: "Jan 15, 2026",
      status: "completed",
    },
    {
      id: "tax-2",
      title: "Return Prep",
      description: "Drafting the corporate tax return documents.",
      date: "Jan 30, 2026",
      status: "in_progress",
    },
  ],
  documentRequests: [
    {
      _id: "req-tax-1",
      title: "Dividend Vouchers",
      description: "Copy of vouchers for dividends paid in the fiscal year.",
      status: "pending",
      category: "finance",
      documents: [{ name: "Voucher_Template.pdf" }],
      multipleDocuments: [],
    },
  ],
  complianceItems: [
    {
      id: "tax-c-1",
      title: "Tax Return FY2025",
      type: "Income Tax",
      dueDate: "2026-09-30",
      status: "upcoming",
      authority: "Tax Authority",
      description: "Annual corporate income tax return.",
    },
  ],
  team: MOCK_TEAM,
  messages: [
    {
      id: 't-m-1',
      senderId: 'sarah_j',
      senderName: 'Sarah Jennings',
      senderRole: 'Partner',
      content: "The corporate tax computation for the previous fiscal year is ready for your sign-off.",
      timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
      read: false,
      type: 'message'
    }
  ],
  libraryItems: [
    { id: 't-l-root', folder_name: 'Tax Records', type: 'folder', parentId: null, tags: ['tax'], uploaderId: 'user-1', isDeleted: false, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
    { id: 't-l-corp', folder_name: 'Corporate Tax', type: 'folder', parentId: 't-l-root', tags: ['tax'], uploaderId: 'user-1', isDeleted: false, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
    { id: 't-l-personal', folder_name: 'Personal Tax', type: 'folder', parentId: 't-l-root', tags: ['tax'], uploaderId: 'user-1', isDeleted: false, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
    { id: 't-l-div', folder_name: 'Dividend Vouchers', type: 'folder', parentId: 't-l-root', tags: ['tax'], uploaderId: 'user-1', isDeleted: false, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
    { id: 't-l-f1', file_name: 'Tax_Computation_2024.pdf', type: 'file', file_type: 'PDF', file_size: 1540000, url: '#', folderId: 't-l-corp', version: 1, tags: ['final'], uploaderId: 'user-1', isDeleted: false, createdAt: '2024-01-20T10:00:00Z' },
    { id: 't-l-f2', file_name: 'Dividend_Voucher_Jan_2025.pdf', type: 'file', file_type: 'PDF', file_size: 210000, url: '#', folderId: 't-l-div', version: 1, tags: ['official'], uploaderId: 'user-1', isDeleted: false, createdAt: '2025-01-15T10:00:00Z' }
  ],
  taxFilings: [
    {
      id: "tax-f-1",
      taxType: "Corporate Income Tax",
      periodYear: "FY 2025",
      dueDate: "31 Mar 2026",
      filingStatus: "In progress",
      serviceStatus: "on_track",
      filedOn: "—",
      documents: [],
    },
    {
      id: "tax-f-2",
      taxType: "Corporate Income Tax",
      periodYear: "FY 2024",
      dueDate: "31 Mar 2025",
      filingStatus: "Filed",
      serviceStatus: "on_track",
      filedOn: "28 Mar 2025",
      documents: ["Return", "Receipt"],
    },
    {
      id: "tax-f-3",
      taxType: "Provisional Tax",
      periodYear: "YA 2026",
      dueDate: "30 Jun 2026",
      filingStatus: "Waiting on you",
      serviceStatus: "action_required",
      filedOn: "—",
      documents: [],
    },
    {
      id: "tax-f-4",
      taxType: "Personal Income Tax",
      periodYear: "2025",
      dueDate: "30 Jun 2026",
      filingStatus: "Filed",
      serviceStatus: "on_track",
      filedOn: "20 Jun 2026",
      documents: ["Return", "Receipt"],
    },
    {
      id: "tax-f-5",
      taxType: "Withholding Tax",
      periodYear: "Q4 2025",
      dueDate: "15 Jan 2026",
      filingStatus: "Filed",
      serviceStatus: "on_track",
      filedOn: "13 Jan 2026",
      documents: ["Return", "Receipt"],
    },
  ],
  recentActivity: [
    { action: "Corporate tax estimate updated", date: "Jan 22" },
    { action: "Deferred tax assets reviewed", date: "Jan 15" },
    { action: "Tax planning session held", date: "Jan 10" }
  ],
  quickAccessDocs: [
    { name: "Tax Return 2024 Final", date: "Jan 22, 2026", url: "#" },
    { name: "Tax Computation Workings", date: "Jan 15, 2026", url: "#" },
    { name: "Tax Clearance Cert 2025", date: "Jan 10, 2026", url: "#" }
  ]
};
