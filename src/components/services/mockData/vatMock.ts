import { ServiceMockData } from "./index";
import { MOCK_TEAM, MOCK_MESSAGES } from "./helpers";

export const vatMock: ServiceMockData = {
  serviceSlug: "vat",
  serviceName: "VAT",
  description: "Preparation and submission of VAT returns.",
  milestones: [
    {
      id: "1",
      title: "Quarterly Data Collection",
      description: "Gathering all sales and purchase invoices for Q1.",
      date: "Jan 10, 2026",
      status: "completed",
    },
    {
      id: "2",
      title: "VAT Review",
      description: "Internal review of VAT input and output reconciliations.",
      date: "Jan 15, 2026",
      status: "in_progress",
    },
    {
      id: "3",
      title: "Preparation for Submission",
      description: "Drafting the VAT return for client approval.",
      date: "Feb 05, 2026",
      status: "pending",
    },
  ],
  documentRequests: [
    {
      _id: "req-vat-1",
      title: "Sales Invoices",
      description: "Please upload all sales invoices for the period Jan-Mar 2026.",
      status: "pending",
      category: "income",
      documents: [{ name: "Sales Invoice Template.pdf" }],
      multipleDocuments: [],
    },
    {
      _id: "req-vat-2",
      title: "Bank Statements",
      description: "Provide bank statements for the VAT period for reconciliation.",
      status: "completed",
      category: "banking",
      documents: [{ name: "Bank_Statement_Jan.pdf", url: "mock-url" }],
      multipleDocuments: [],
    },
  ],
  complianceItems: [
    {
      id: "vat-c-1",
      title: "VAT Return Q1 2026",
      type: "Statutory Filing",
      dueDate: "2026-05-15",
      status: "upcoming",
      authority: "VAT Department",
      description: "Filing for the first quarter of the year.",
    },
    {
      id: "vat-c-2",
      title: "Recapitulative Statement",
      type: "EU Reporting",
      dueDate: "2026-01-15",
      status: "filed",
      authority: "VAT Department",
      description: "EU intra-community trade declaration.",
    },
  ],
  periods: [
    {
      id: "period-1",
      period: "Jan - Mar 2026",
      due_date: "2026-05-15",
      filing_status: "waiting_on_you",
      service_status: "on_track",
      submitted_at: null,
      net_tax: 1540.50,
      total_sales: 12000.00,
      total_purchases: 4500.00,
      documents: []
    },
    {
      id: "period-2",
      period: "Oct - Dec 2025",
      due_date: "2026-02-15",
      filing_status: "submitted",
      service_status: "due_soon",
      submitted_at: "2026-01-20",
      net_tax: 2100.00,
      total_sales: 15000.00,
      total_purchases: 6000.00,
      documents: []
    }
  ],
  team: MOCK_TEAM,
  messages: [
    {
      id: 'v-m-1',
      senderId: 'sarah_j',
      senderName: 'Sarah Jennings',
      senderRole: 'Partner',
      content: "Could you please confirm the intra-community acquisition of services from Italian suppliers?",
      timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
      read: false,
      type: 'message'
    },
    {
      id: 'v-m-2',
      senderId: 'mark_t',
      senderName: 'Mark Thompson',
      senderRole: 'Manager',
      content: "The Recapitulative Statement for Jan has been drafted for your review.",
      timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
      read: true,
      type: 'notification'
    }
  ],
  libraryItems: [
    { id: 'v-l-root', folder_name: 'VAT Archive', type: 'folder', parentId: null, tags: ['tax'], uploaderId: 'user-1', isDeleted: false, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
    { id: 'v-l-2025', folder_name: '2025', type: 'folder', parentId: 'v-l-root', tags: ['tax'], uploaderId: 'user-1', isDeleted: false, createdAt: '2025-01-01T10:00:00Z', updatedAt: '2025-01-01T10:00:00Z' },
    { id: 'v-l-2024', folder_name: '2024', type: 'folder', parentId: 'v-l-root', tags: ['tax'], uploaderId: 'user-1', isDeleted: false, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
    { id: 'v-l-2025-q4', folder_name: 'Q4 2025', type: 'folder', parentId: 'v-l-2025', tags: ['tax'], uploaderId: 'user-1', isDeleted: false, createdAt: '2026-01-20T10:00:00Z', updatedAt: '2026-01-20T10:00:00Z' },
    { id: 'v-l-2025-q3', folder_name: 'Q3 2025', type: 'folder', parentId: 'v-l-2025', tags: ['tax'], uploaderId: 'user-1', isDeleted: false, createdAt: '2025-10-20T10:00:00Z', updatedAt: '2025-10-20T10:00:00Z' },
    { id: 'v-l-f1', file_name: 'VAT_Return_Q4_2025.pdf', type: 'file', file_type: 'PDF', file_size: 1024000, url: '#', folderId: 'v-l-2025-q4', version: 1, tags: ['final'], uploaderId: 'user-1', isDeleted: false, createdAt: '2026-01-20T10:00:00Z' },
    { id: 'v-l-f2', file_name: 'Input_VAT_Summary.xlsx', type: 'file', file_type: 'XLSX', file_size: 2048000, url: '#', folderId: 'v-l-2025-q4', version: 2, tags: ['workings'], uploaderId: 'user-1', isDeleted: false, createdAt: '2026-01-18T10:00:00Z' },
    { id: 'v-l-f3', file_name: 'Sales_Report_Q4.csv', type: 'file', file_type: 'CSV', file_size: 512000, url: '#', folderId: 'v-l-2025-q4', version: 1, tags: ['source'], uploaderId: 'user-1', isDeleted: false, createdAt: '2026-01-15T10:00:00Z' }
  ],
  recentActivity: [
    { action: "Q4 2025 VAT Return submitted", date: "Jan 20" },
    { action: "Input tax records verified", date: "Jan 15" },
    { action: "VAT period Q1 2026 opened", date: "Jan 01" }
  ],
  quickAccessDocs: [
    { name: "VAT Return Q4 2025", date: "Jan 20, 2026", url: "#" },
    { name: "Input VAT Workings", date: "Jan 18, 2026", url: "#" },
    { name: "Recapitulative Statement", date: "Jan 15, 2026", url: "#" }
  ]
};
