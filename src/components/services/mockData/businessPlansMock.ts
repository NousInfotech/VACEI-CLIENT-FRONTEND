import { ServiceMockData } from "./index";
import { MOCK_TEAM, MOCK_MESSAGES } from "./helpers";

export const businessPlansMock: ServiceMockData = {
  serviceSlug: "business-plans",
  serviceName: "Business Plans",
  description: "Development of professional business plans and financial projections.",
  milestones: [
    {
      id: "bp-1",
      title: "Market Analysis",
      description: "Researching industry trends, competitors, and target demographics.",
      date: "Jan 12, 2026",
      status: "completed",
    },
    {
      id: "bp-2",
      title: "Financial Projections",
      description: "Developing 3-5 year forecasts for revenue, expenses, and cash flow.",
      date: "Jan 25, 2026",
      status: "in_progress",
    },
  ],
  documentRequests: [
    {
      _id: "req-bp-1",
      title: "Historical Financials",
      description: "Please provide financial statements for the last 2 years if applicable.",
      status: "pending",
      category: "finance",
      documents: [{ name: "Financial_History_Guide.pdf" }],
      multipleDocuments: [],
    },
  ],
  complianceItems: [],
  team: MOCK_TEAM,
  messages: [
    {
      id: 'bp-m-1',
      senderId: 'sarah_j',
      senderName: 'Sarah Jennings',
      senderRole: 'Partner',
      content: "I've added the competitive analysis section to your business plan. It highlights your strength in the APAC region.",
      timestamp: new Date(Date.now() - 3600000 * 120).toISOString(),
      read: true,
      type: 'message'
    }
  ],
  libraryItems: [
    { id: 'bp-l-root', folder_name: 'Strategic Planning', type: 'folder', parentId: null, tags: ['business'], uploaderId: 'user-1', isDeleted: false, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
    { id: 'bp-l-research', folder_name: 'Market Research', type: 'folder', parentId: 'bp-l-root', tags: ['business'], uploaderId: 'user-1', isDeleted: false, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
    { id: 'bp-l-drafts', folder_name: 'Document Drafts', type: 'folder', parentId: 'bp-l-root', tags: ['business'], uploaderId: 'user-1', isDeleted: false, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
    { id: 'bp-l-f1', file_name: 'Market_Landscape_v1.pdf', type: 'file', file_type: 'PDF', file_size: 4500000, url: '#', folderId: 'bp-l-research', version: 1, tags: ['research'], uploaderId: 'user-1', isDeleted: false, createdAt: '2024-01-15T10:00:00Z' },
    { id: 'bp-l-f2', file_name: 'Business_Plan_v2.0_Final.docx', type: 'file', file_type: 'DOCX', file_size: 3072000, url: '#', folderId: 'bp-l-drafts', version: 5, tags: ['final'], uploaderId: 'user-1', isDeleted: false, createdAt: '2026-01-20T10:00:00Z' },
    { id: 'bp-l-f3', file_name: 'Business_Plan_v1.5_Archive.docx', type: 'file', file_type: 'DOCX', file_size: 2800000, url: '#', folderId: 'bp-l-drafts', version: 2, tags: ['archive'], uploaderId: 'user-1', isDeleted: false, createdAt: '2025-11-10T10:00:00Z' }
  ],
  filings: [
    { id: 'bp-f-1', filing_type: 'Draft Review', reference: 'V2.0', status: 'completed', due_date: '2026-01-20', filing_status: 'completed' },
    { id: 'bp-f-2', filing_type: 'Draft Review', reference: 'V1.5', status: 'completed', due_date: '2025-11-05', filing_status: 'completed' }
  ],
  businessPlanMilestones: [
    { label: "Market Research", status: "Completed" },
    { label: "Financial Projections", status: "In progress" },
    { label: "Executive Summary", status: "Pending" },
    { label: "Final Review", status: "Pending" }
  ],
  recentActivity: [
    { action: "Competitor analysis completed", date: "Jan 22" },
    { action: "Revenue model draft created", date: "Jan 18" },
    { action: "Initial consultation held", date: "Jan 10" }
  ],
  quickAccessDocs: [
    { name: "Market Analysis Report", date: "Jan 22, 2026", url: "#" },
    { name: "Financial Model v2.0", date: "Jan 18, 2026", url: "#" },
    { name: "Exec Summary Draft", date: "Jan 15, 2026", url: "#" }
  ]
};
