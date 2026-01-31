import { ServiceMockData } from "./index";
import { MOCK_TEAM, MOCK_MESSAGES } from "./helpers";

export const corporateMock: ServiceMockData = {
  serviceSlug: "csp-mbr",
  serviceName: "Corporate Services",
  description: "Support with company secretarial, registry filings, and corporate governance.",
  milestones: [
    {
      id: "corp-1",
      title: "Annual General Meeting",
      description: "Drafting resolutions and minutes for the obligatory AGM.",
      date: "Jan 15, 2026",
      status: "completed",
    },
    {
      id: "corp-2",
      title: "Registry Updates",
      description: "Notifying MBR of changes in directors or shareholders.",
      date: "Jan 22, 2026",
      status: "in_progress",
    },
  ],
  documentRequests: [
    {
      _id: "req-corp-1",
      title: "Director Passports",
      description: "Certified copies of passports for new board members.",
      status: "pending",
      category: "kyc",
      documents: [{ name: "Certification_Requirements.pdf" }],
      multipleDocuments: [],
    },
  ],
  complianceItems: [
    {
      id: "corp-c-1",
      title: "Beneficial Ownership Filing",
      type: "Registry Filing",
      dueDate: "2026-01-31",
      status: "due_today",
      authority: "MBR",
      description: "Ensuring the BO register is up to date.",
    },
  ],
  team: MOCK_TEAM,
  messages: [
    {
      id: 'cs-m-1',
      senderId: 'mark_t',
      senderName: 'Mark Thompson',
      senderRole: 'Manager',
      content: "The board minutes for the January session are ready for signature. Please also review the updated share register.",
      timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
      read: false,
      type: 'message'
    }
  ],
  libraryItems: [
    { id: 'cs-l-root', folder_name: 'Corporate Records', type: 'folder', parentId: null, tags: ['corporate'], uploaderId: 'user-1', isDeleted: false, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
    { id: 'cs-l-minutes', folder_name: 'Board & AGM Minutes', type: 'folder', parentId: 'cs-l-root', tags: ['corporate'], uploaderId: 'user-1', isDeleted: false, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
    { id: 'cs-l-registers', folder_name: 'Statutory Registers', type: 'folder', parentId: 'cs-l-root', tags: ['corporate'], uploaderId: 'user-1', isDeleted: false, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
    { id: 'cs-l-f1', file_name: 'Board_Minutes_Jan_2026.pdf', type: 'file', file_type: 'PDF', file_size: 512000, url: '#', folderId: 'cs-l-minutes', version: 1, tags: ['official'], uploaderId: 'user-1', isDeleted: false, createdAt: '2026-01-15T10:00:00Z' },
    { id: 'cs-l-f2', file_name: 'Register_of_Members.xlsx', type: 'file', file_type: 'XLSX', file_size: 256000, url: '#', folderId: 'cs-l-registers', version: 3, tags: ['statutory'], uploaderId: 'user-1', isDeleted: false, createdAt: '2026-01-05T10:00:00Z' }
  ],
  filings: [
    { id: 'cs-f-1', filing_type: 'Change of Address', reference: 'FORM-12', status: 'completed', due_date: '2026-01-15', filing_status: 'completed' },
    { id: 'cs-f-2', filing_type: 'Annual Return', reference: '2025', status: 'completed', due_date: '2026-01-31', filing_status: 'completed' },
    { id: 'cs-f-3', filing_type: 'Director Appointment', reference: 'FORM-10', status: 'completed', due_date: '2025-05-20', filing_status: 'completed' }
  ],
  corporateServicesStatus: [
    { 
      type: "Director", 
      holder: "John Smith", 
      status: "Active", 
      startDate: "2024-01-01",
      expiry: "2026-12-31",
      service_status: "On track",
      documents: ["View"],
      open: true
    },
    { 
      type: "Company Secretary", 
      holder: "CSP Provider", 
      status: "Active", 
      startDate: "2024-01-01",
      expiry: "2026-12-31",
      service_status: "On track",
      documents: ["View"],
      open: true
    },
    { 
      type: "Registered Office", 
      holder: "CSP Provider", 
      status: "Active", 
      startDate: "2024-01-01",
      expiry: "2026-12-31",
      service_status: "Due soon",
      documents: ["View"],
      open: true
    },
    { 
      type: "Shareholder Register", 
      holder: "—", 
      status: "Active", 
      startDate: null,
      expiry: null,
      service_status: "On track",
      documents: ["View"],
      open: true
    },
    { 
      type: "Beneficial Owner Register", 
      holder: "—", 
      status: "Action required", 
      startDate: null,
      expiry: null,
      service_status: "Action required",
      documents: ["View"],
      open: true
    }
  ],
  recentActivity: [
    { action: "Board meeting minutes drafted", date: "Jan 15" },
    { action: "Annual General Meeting held", date: "Jan 10" },
    { action: "Register of members updated", date: "Jan 05" }
  ],
  quickAccessDocs: [
    { name: "Board Minutes Jan 2026", date: "Jan 15, 2026", url: "#" },
    { name: "Share Register Update", date: "Jan 01, 2026", url: "#" },
    { name: "Articles of Association", date: "Dec 15, 2025", url: "#" }
  ]
};
