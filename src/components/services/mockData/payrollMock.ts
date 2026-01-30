import { ServiceMockData } from "./index";
import { MOCK_TEAM, MOCK_MESSAGES } from "./helpers";

export const payrollMock: ServiceMockData = {
  serviceSlug: "payroll",
  serviceName: "Payroll",
  description: "Processing salaries, tax deductions, and statutory filings for employees.",
  milestones: [
    {
      id: "pay-1",
      title: "Salaries Processing",
      description: "Calculating net pay and deductions for the current cycle.",
      date: "Jan 25, 2026",
      status: "completed",
    },
    {
      id: "pay-2",
      title: "Payslip Distribution",
      description: "Issuing digital payslips to all active employees.",
      date: "Jan 27, 2026",
      status: "in_progress",
    },
    {
      id: "pay-3",
      title: "Statutory Payments",
      description: "Submitting FS5 and payments for SS and IT.",
      date: "Jan 30, 2026",
      status: "pending",
    },
  ],
  documentRequests: [
    {
      _id: "req-pay-1",
      title: "New Joiner Details",
      description: "Forms for employees who started this month.",
      status: "pending",
      category: "hr",
      documents: [{ name: "New_Employee_Form.pdf" }],
      multipleDocuments: [],
    },
  ],
  complianceItems: [
    {
      id: "pay-c-1",
      title: "FS5 Submission Jan",
      type: "Tax Payment",
      dueDate: "2026-02-15",
      status: "upcoming",
      authority: "Tax Authority",
      description: "Monthly tax and SS contribution filing.",
    },
  ],
  team: MOCK_TEAM,
  messages: [
    {
      id: 'p-m-1',
      senderId: 'mark_t',
      senderName: 'Mark Thompson',
      senderRole: 'Manager',
      content: "January payslips are ready for distribution. Please check the bonus calculations for the sales team.",
      timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
      read: false,
      type: 'message'
    }
  ],
  libraryItems: [
    { id: 'p-l-root', folder_name: 'Payroll Archive', type: 'folder', parentId: null, tags: ['payroll'], uploaderId: 'user-1', isDeleted: false, createdAt: '2025-01-01T10:00:00Z', updatedAt: '2025-01-01T10:00:00Z' },
    { id: 'p-l-payslips', folder_name: 'Monthly Payslips', type: 'folder', parentId: 'p-l-root', tags: ['payroll'], uploaderId: 'user-1', isDeleted: false, createdAt: '2025-01-01T10:00:00Z', updatedAt: '2025-01-01T10:00:00Z' },
    { id: 'p-l-statutory', folder_name: 'Statutory Reports (FSS)', type: 'folder', parentId: 'p-l-root', tags: ['payroll'], uploaderId: 'user-1', isDeleted: false, createdAt: '2025-01-01T10:00:00Z', updatedAt: '2025-01-01T10:00:00Z' },
    { id: 'p-l-f1', file_name: 'Payslips_Jan_2026.zip', type: 'file', file_type: 'ZIP', file_size: 5120000, url: '#', folderId: 'p-l-payslips', version: 1, tags: ['monthly'], uploaderId: 'user-1', isDeleted: false, createdAt: '2026-01-20T10:00:00Z' },
    { id: 'p-l-f2', file_name: 'Payslips_Dec_2025.zip', type: 'file', file_type: 'ZIP', file_size: 4800000, url: '#', folderId: 'p-l-payslips', version: 1, tags: ['monthly'], uploaderId: 'user-1', isDeleted: false, createdAt: '2025-12-20T10:00:00Z' },
    { id: 'p-l-f3', file_name: 'FSS7_Annual_2025.pdf', type: 'file', file_type: 'PDF', file_size: 890000, url: '#', folderId: 'p-l-statutory', version: 1, tags: ['annual'], uploaderId: 'user-1', isDeleted: false, createdAt: '2026-01-15T10:00:00Z' }
  ],
  filings: [
    { id: 'p-f-1', filing_type: 'FSS Submission', reference: 'Dec 2025', status: 'completed', due_date: '2026-01-15', filing_status: 'completed' },
    { id: 'p-f-2', filing_type: 'FSS Submission', reference: 'Nov 2025', status: 'completed', due_date: '2025-12-15', filing_status: 'completed' },
    { id: 'p-f-3', filing_type: 'FSS Submission', reference: 'Oct 2025', status: 'completed', due_date: '2025-11-15', filing_status: 'completed' },
    { id: 'p-f-4', filing_type: 'FSS Submission', reference: 'Sep 2025', status: 'completed', due_date: '2025-10-15', filing_status: 'completed' }
  ],
  payrollOverview: {
    totalEmployees: 12,
    activeThisPeriod: 12,
    pendingChanges: 0,
    recentEmployees: [
      { name: "John Smith", role: "Manager", status: "Active" },
      { name: "Jane Doe", role: "Developer", status: "Active" },
      { name: "Mike Johnson", role: "Designer", status: "Active" }
    ]
  },
  recentActivity: [
    { action: "January payroll processed", date: "Jan 25" },
    { action: "New employee 'Jane Doe' added", date: "Jan 10" },
    { action: "FSS submission for Dec completed", date: "Jan 05" }
  ],
  quickAccessDocs: [
    { name: "Monthly Payslips Jan 2026", date: "Jan 25, 2026", url: "#" },
    { name: "FSS 2025 Annual Summary", date: "Jan 20, 2026", url: "#" },
    { name: "Payroll Variance Report", date: "Jan 18, 2026", url: "#" }
  ]
};
