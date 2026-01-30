import { ServiceMockData } from "./index";
import { MOCK_TEAM, MOCK_MESSAGES } from "./helpers";

export const cfoMock: ServiceMockData = {
  serviceSlug: "cfo",
  serviceName: "CFO Services",
  description: "Strategic financial advisory, budgeting, and performance analysis.",
  milestones: [
    {
      id: "cfo-1",
      title: "Strategic Review",
      description: "Annual overview of financial health and growth strategies.",
      date: "Jan 08, 2026",
      status: "completed",
    },
    {
      id: "cfo-2",
      title: "Budget Optimization",
      description: "Identifying cost-saving opportunities and resource reallocation.",
      date: "Jan 28, 2026",
      status: "in_progress",
    },
    {
      id: "cfo-3",
      title: "Investment Roadmap",
      description: "Planning for capital raises or significant asset acquisitions.",
      date: "Feb 15, 2026",
      status: "pending",
    },
  ],
  documentRequests: [
    {
      _id: "req-cfo-1",
      title: "Current Debt Profile",
      description: "Details of all outstanding loans and credit facilities.",
      status: "pending",
      category: "liability",
      documents: [{ name: "Debt_Schedule_Example.xlsx" }],
      multipleDocuments: [],
    },
  ],
  complianceItems: [
    {
      id: "cfo-c-1",
      title: "Board Reporting Deck",
      type: "Meeting Prep",
      dueDate: "2026-02-10",
      status: "upcoming",
      authority: "Board of Directors",
      description: "Financial performance summary for the board meeting.",
    },
  ],
  team: MOCK_TEAM,
  messages: [
    {
      id: 'cfo-m-1',
      senderId: 'sarah_j',
      senderName: 'Sarah Jennings',
      senderRole: 'Partner',
      content: "I've updated the cash flow forecast for Q1. We should discuss the hiring plan impact on your runway.",
      timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
      read: false,
      type: 'message'
    }
  ],
  libraryItems: [
    { id: 'cfo-l-root', folder_name: 'Strategic Finance', type: 'folder', parentId: null, tags: ['cfo'], uploaderId: 'user-1', isDeleted: false, createdAt: '2025-01-01T10:00:00Z', updatedAt: '2025-01-01T10:00:00Z' },
    { id: 'cfo-l-boards', folder_name: 'Board Reporting', type: 'folder', parentId: 'cfo-l-root', tags: ['cfo'], uploaderId: 'user-1', isDeleted: false, createdAt: '2025-01-01T10:00:00Z', updatedAt: '2025-01-01T10:00:00Z' },
    { id: 'cfo-l-investor', folder_name: 'Investor Relations', type: 'folder', parentId: 'cfo-l-root', tags: ['cfo'], uploaderId: 'user-1', isDeleted: false, createdAt: '2025-01-01T10:00:00Z', updatedAt: '2025-01-01T10:00:00Z' },
    { id: 'cfo-l-f1', file_name: 'Board_Deck_Q4_2025.pdf', type: 'file', file_type: 'PDF', file_size: 5120000, url: '#', folderId: 'cfo-l-boards', version: 1, tags: ['board'], uploaderId: 'user-1', isDeleted: false, createdAt: '2026-01-15T10:00:00Z' },
    { id: 'cfo-l-f2', file_name: 'Investor_Update_Jan_2026.pdf', type: 'file', file_type: 'PDF', file_size: 2048000, url: '#', folderId: 'cfo-l-investor', version: 1, tags: ['investor'], uploaderId: 'user-1', isDeleted: false, createdAt: '2026-01-20T10:00:00Z' }
  ],
  filings: [
    { id: 'cfo-f-1', filing_type: 'Board Pack', reference: 'Q4 Review', status: 'completed', due_date: '2026-01-15', filing_status: 'completed' },
    { id: 'cfo-f-2', filing_type: 'Cash Forecast', reference: 'Jan 2026', status: 'completed', due_date: '2026-01-05', filing_status: 'completed' }
  ],
  cfoEngagementsList: [
    { name: "Cash Flow Management", start: "Jan 01, 2026", status: "In progress", end: "Ongoing" },
    { name: "Budget Review Q1", start: "Jan 15, 2026", status: "Waiting on you", end: "Feb 15, 2026" }
  ],
  cfoFilings: [
    {
      service: "Management Accounts",
      frequency: "Monthly",
      currentPeriod: "April 2026",
      status: "In progress",
      nextDeliverable: "May 2026 accounts",
      service_status: "On track",
      documents: ["View"],
      open: true
    },
    {
      service: "Cashflow Forecast",
      frequency: "Monthly",
      currentPeriod: "April 2026",
      status: "Completed",
      nextDeliverable: "May 2026 update",
      service_status: "On track",
      documents: ["View"],
      open: true
    },
    {
      service: "Budget vs Actual",
      frequency: "Quarterly",
      currentPeriod: "Q2 2026",
      status: "Waiting on you",
      nextDeliverable: "Q2 review",
      service_status: "Action required",
      documents: ["View"],
      open: true
    },
    {
      service: "Board Reporting",
      frequency: "Quarterly",
      currentPeriod: "Q2 2026",
      status: "Scheduled",
      nextDeliverable: "Board pack",
      service_status: "Due soon",
      documents: ["View"],
      open: true
    }
  ],
  recentActivity: [
    { action: "Weekly cash flow report shared", date: "Jan 26" },
    { action: "Cost optimization strategy proposed", date: "Jan 20" },
    { action: "Board meeting prep completed", date: "Jan 18" }
  ],
  quickAccessDocs: [
    { name: "Cash Flow Forecast Q1", date: "Jan 25, 2026", url: "#" },
    { name: "Board Deck Q4 Review", date: "Jan 15, 2026", url: "#" },
    { name: "Investor Runway Report", date: "Jan 10, 2026", url: "#" }
  ],
  summaryData: {
    cashOnHand: 250000,
    burnRate: 15000,
    runwayMonths: 16
  }
};
