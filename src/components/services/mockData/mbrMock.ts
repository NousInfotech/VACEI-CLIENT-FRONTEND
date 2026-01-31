import { ServiceMockData } from "./index";
import { MOCK_TEAM, MOCK_MESSAGES } from "./helpers";

export const mbrMock: ServiceMockData = {
  serviceSlug: "mbr-filing",
  serviceName: "Filings",
  description: "Preparation and submission of statutory filings with the Malta Business Registry.",
  milestones: [
    {
      id: "mbr-1",
      title: "Annual Return Prep",
      description: "Compiling data for the Form 1 Annual Return.",
      date: "Jan 12, 2026",
      status: "completed",
    },
    {
      id: "mbr-2",
      title: "Client Approval",
      description: "Review and signing of the filing documents.",
      date: "Jan 20, 2026",
      status: "in_progress",
    },
    {
      id: "mbr-3",
      title: "MBR Submission",
      description: "Final electronic filing with the registry.",
      date: "Jan 30, 2026",
      status: "pending",
    },
  ],
  documentRequests: [
    {
      _id: "req-mbr-1",
      title: "Shareholder Confirmations",
      description: "Confirm no changes to the shareholding structure.",
      status: "pending",
      category: "registry",
      documents: [{ name: "Confirmation_Sheet.pdf" }],
      multipleDocuments: [],
    },
  ],
  complianceItems: [
    {
      id: "mbr-c-1",
      title: "Annual Return 2026",
      type: "Statutory Filing",
      dueDate: "2026-01-31",
      status: "due_today",
      authority: "MBR",
      description: "Obligatory annual company return.",
    },
  ],
  filings: [
    {
      id: "filing-1",
      filing_type: "Annual Return",
      reference: "2026",
      due_date: "2026-05-14",
      filing_status: "waiting_on_you",
      service_status: "Action required",
      submitted_at: null,
      documents: []
    },
    {
      id: "filing-2",
      filing_type: "Annual Return",
      reference: "2025",
      due_date: "2025-05-15",
      filing_status: "submitted",
      service_status: "On track",
      submitted_at: "2025-05-13",
      documents: ["Receipt", "PDF"]
    },
    {
      id: "filing-3",
      filing_type: "BO Update",
      reference: "Change in UBO",
      due_date: "2025-02-20",
      filing_status: "completed",
      service_status: "On track",
      submitted_at: "2025-02-18",
      documents: ["Receipt"]
    },
    {
      id: "filing-4",
      filing_type: "Change Notice",
      reference: "Director Change",
      due_date: "2024-10-01",
      filing_status: "completed",
      service_status: "On track",
      submitted_at: "2024-09-30",
      documents: ["Receipt"]
    }
  ],
  team: MOCK_TEAM,
  messages: [
    {
      id: 'm-m-1',
      senderId: 'sarah_j',
      senderName: 'Sarah Jennings',
      senderRole: 'Partner',
      content: "The Annual Return for TechNova is due soon. Please review the shareholder register.",
      timestamp: new Date(Date.now() - 3600000 * 48).toISOString(),
      read: false,
      type: 'message'
    }
  ],
  libraryItems: [
    { id: 'm-l-root', folder_name: 'Corporate Filings', type: 'folder', parentId: null, tags: ['legal'], uploaderId: 'user-1', isDeleted: false, createdAt: '2023-01-20T10:00:00Z', updatedAt: '2023-01-20T10:00:00Z' },
    { id: 'm-l-annual', folder_name: 'Annual Returns', type: 'folder', parentId: 'm-l-root', tags: ['legal'], uploaderId: 'user-1', isDeleted: false, createdAt: '2023-01-20T10:00:00Z', updatedAt: '2023-01-20T10:00:00Z' },
    { id: 'm-l-bo', folder_name: 'Beneficial Ownership', type: 'folder', parentId: 'm-l-root', tags: ['legal'], uploaderId: 'user-1', isDeleted: false, createdAt: '2023-01-20T10:00:00Z', updatedAt: '2023-01-20T10:00:00Z' },
    { id: 'm-l-f1', file_name: 'Annual_Return_2025.pdf', type: 'file', file_type: 'PDF', file_size: 1540000, url: '#', folderId: 'm-l-annual', version: 1, tags: ['official'], uploaderId: 'user-1', isDeleted: false, createdAt: '2026-01-20T10:00:00Z' },
    { id: 'm-l-f2', file_name: 'Annual_Return_2024.pdf', type: 'file', file_type: 'PDF', file_size: 1480000, url: '#', folderId: 'm-l-annual', version: 1, tags: ['official'], uploaderId: 'user-1', isDeleted: false, createdAt: '2025-01-18T10:00:00Z' },
    { id: 'm-l-f3', file_name: 'BO_Declaration_v1.pdf', type: 'file', file_type: 'PDF', file_size: 512000, url: '#', folderId: 'm-l-bo', version: 1, tags: ['kyc'], uploaderId: 'user-1', isDeleted: false, createdAt: '2023-05-10T10:00:00Z' }
  ],
  recentActivity: [
    { action: "Annual Return 2025 submitted", date: "Jan 20" },
    { action: "BO Update processed", date: "Jan 10" },
    { action: "Director change notice drafted", date: "Jan 05" }
  ],
  quickAccessDocs: [
    { name: "Annual Return 2025", date: "Jan 20, 2026", url: "#" },
    { name: "BO Register Update", date: "Jan 10, 2026", url: "#" },
    { name: "Memorandum & Articles", date: "Jan 01, 2026", url: "#" }
  ]
};
