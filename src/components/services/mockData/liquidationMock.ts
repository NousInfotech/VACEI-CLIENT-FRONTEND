import { ServiceMockData } from "./index";
import { MOCK_TEAM, MOCK_MESSAGES } from "./helpers";

export const liquidationMock: ServiceMockData = {
  serviceSlug: "liquidation",
  serviceName: "Liquidation",
  description: "Formal process of closing a company and distributing its assets.",
  milestones: [
    {
      id: "liq-1",
      title: "Liquidator Appointment",
      description: "Formal resolution to dissolve and appoint a liquidator.",
      date: "Jan 10, 2026",
      status: "completed",
    },
    {
      id: "liq-2",
      title: "Notice to Creditors",
      description: "Public notice of dissolution and creditor claim period.",
      date: "Jan 25, 2026",
      status: "in_progress",
    },
    {
      id: "liq-3",
      title: "Final Distribution",
      description: "Settling liabilities and distributing remaining assets to shareholders.",
      date: "Mar 15, 2026",
      status: "pending",
    },
  ],
  documentRequests: [
    {
      _id: "req-liq-1",
      title: "Statement of Affairs",
      description: "Detailed list of assets and liabilities at the start of liquidation.",
      status: "pending",
      category: "finance",
      documents: [{ name: "Statement_Form.pdf" }],
      multipleDocuments: [],
    },
  ],
  complianceItems: [
    {
      id: "liq-c-1",
      title: "Final Tax Clearance",
      type: "Tax Compliance",
      dueDate: "2026-06-30",
      status: "upcoming",
      authority: "Tax Authority",
      description: "Obtaining clearance before final dissolution.",
    },
  ],
  team: MOCK_TEAM,
  messages: [
    {
      id: 'l-m-1',
      senderId: 'sarah_j',
      senderName: 'Sarah Jennings',
      senderRole: 'Partner',
      content: "The first meeting of creditors has been scheduled. I've uploaded the draft Statement of Affairs for your review.",
      timestamp: new Date(Date.now() - 3600000 * 48).toISOString(),
      read: false,
      type: 'message'
    }
  ],
  libraryItems: [
    { id: 'l-l-root', folder_name: 'Liquidation Records', type: 'folder', parentId: null, tags: ['liquidation'], uploaderId: 'user-1', isDeleted: false, createdAt: '2024-01-20T10:00:00Z', updatedAt: '2024-01-20T10:00:00Z' },
    { id: 'l-l-legal', folder_name: 'Statutory Filings', type: 'folder', parentId: 'l-l-root', tags: ['liquidation'], uploaderId: 'user-1', isDeleted: false, createdAt: '2024-01-20T10:00:00Z', updatedAt: '2024-01-20T10:00:00Z' },
    { id: 'l-l-creditors', folder_name: 'Creditor Management', type: 'folder', parentId: 'l-l-root', tags: ['liquidation'], uploaderId: 'user-1', isDeleted: false, createdAt: '2024-01-20T10:00:00Z', updatedAt: '2024-01-20T10:00:00Z' },
    { id: 'l-l-f1', file_name: 'Statement_of_Affairs.pdf', type: 'file', file_type: 'PDF', file_size: 2048000, url: '#', folderId: 'l-l-legal', version: 1, tags: ['official'], uploaderId: 'user-1', isDeleted: false, createdAt: '2026-01-15T10:00:00Z' },
    { id: 'l-l-f2', file_name: 'Creditor_Claims_Schedule_Q4.xlsx', type: 'file', file_type: 'XLSX', file_size: 450000, url: '#', folderId: 'l-l-creditors', version: 2, tags: ['internal'], uploaderId: 'user-1', isDeleted: false, createdAt: '2026-01-20T10:00:00Z' }
  ],
  liquidationFilings: [
    {
      id: "liq-f-1",
      stageFiling: "Shareholder Resolution",
      description: "Approval to liquidate",
      status: "Completed",
      serviceStatus: "on_track",
      completedOn: "10 Feb 2026",
      documents: ["Resolution"],
    },
    {
      id: "liq-f-2",
      stageFiling: "Appointment of Liquidator",
      description: "Formal appointment",
      status: "Completed",
      serviceStatus: "on_track",
      completedOn: "12 Feb 2026",
      documents: ["Appointment Notice"],
    },
    {
      id: "liq-f-3",
      stageFiling: "Statutory Notices",
      description: "Registry & gazette notices",
      status: "In progress",
      serviceStatus: "on_track",
      completedOn: "—",
      documents: [],
    },
    {
      id: "liq-f-4",
      stageFiling: "Final Accounts",
      description: "Closing financial statements",
      status: "Waiting on you",
      serviceStatus: "action_required",
      completedOn: "—",
      documents: [],
    },
    {
      id: "liq-f-5",
      stageFiling: "Dissolution Filing",
      description: "Company struck off",
      status: "Not started",
      serviceStatus: "on_track",
      completedOn: "—",
      documents: [],
    },
  ],
  liquidationProcess: [
    { step: "Liquidator Appointment", status: "completed" },
    { step: "Creditor Notification", status: "in_progress" },
    { step: "Asset Realization", status: "pending" },
    { step: "Final Distribution", status: "pending" }
  ],
  recentActivity: [
    { action: "Liquidator bond secured", date: "Jan 20" },
    { action: "Notice to creditors published", date: "Jan 15" },
    { action: "First meeting of creditors", date: "Jan 10" }
  ],
  quickAccessDocs: [
    { name: "Liquidator Appointment Form", date: "Jan 20, 2026", url: "#" },
    { name: "Statement of Affairs", date: "Jan 15, 2026", url: "#" },
    { name: "Creditor Correspondence", date: "Jan 10, 2026", url: "#" }
  ]
};
