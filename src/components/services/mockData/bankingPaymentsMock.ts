import { ServiceMockData } from "./index";
import { MOCK_TEAM, MOCK_MESSAGES } from "./helpers";

export const bankingPaymentsMock: ServiceMockData = {
  serviceSlug: "banking-payments",
  serviceName: "Banking & Payments",
  description: "Manage bank documents, approvals, and payment workflows.",
  milestones: [
    {
      id: "bp-m-1",
      title: "Monthly statement collection",
      description: "Collecting and reconciling all bank statements for the period.",
      date: "Feb 05, 2026",
      status: "completed",
    },
    {
      id: "bp-m-2",
      title: "Payment execution run",
      description: "Processing and executing approved payment instructions.",
      date: "Feb 15, 2026",
      status: "in_progress",
    },
    {
      id: "bp-m-3",
      title: "Confirmations filed",
      description: "Filing all payment confirmations and bank receipts.",
      date: "Feb 28, 2026",
      status: "pending",
    },
  ],
  documentRequests: [
    {
      _id: "req-bp-1",
      title: "Upload bank statements for previous month",
      description: "Please provide PDF statements for all active accounts for Jan 2026.",
      status: "completed",
      category: "banking",
      documents: [{ name: "HSBC_Statement_Jan.pdf", url: "#" }],
      multipleDocuments: [],
    },
    {
      _id: "req-bp-2",
      title: "Upload proof of payment",
      description: "Please upload the proof of payment for the recent transaction.",
      status: "pending",
      category: "banking",
      documents: [{ name: "Mandate_Template.pdf", url: "#" }],
      multipleDocuments: [],
    },
    {
      _id: "req-bp-3",
      title: "Upload signed bank mandate",
      description: "New signatory added. Please upload the signed mandate for authorization.",
      status: "pending",
      category: "compliance",
      documents: [{ name: "Mandate_Template.pdf", url: "#" }],
      multipleDocuments: [],
    },
        {
      _id: "req-bp-2",
      title: "Upload bank confirmation letter",
      description: "Please upload the bank confirmation letter for the recent transaction.",
      status: "pending",
      category: "banking",
      documents: [{ name: "Mandate_Template.pdf", url: "#" }],
      multipleDocuments: [],
    },
    {
      _id: "req-bp-3",
      title: "Upload source of funds documents",
      description: "Compliance requirement for the recent high-value incoming transfer.",
      status: "pending",
      category: "compliance",
      documents: [{ name: "Mandate_Template.pdf", url: "#" }],
      multipleDocuments: [],
    },
  ],
  complianceItems: [
    {
      id: "bp-c-1",
      title: "Statement due (monthly)",
      type: "Banking",
      dueDate: "2026-02-10",
      status: "filed",
      authority: "VACEI Banking",
      description: "Submission of monthly bank statements for reconciliation.",
    },
    {
      id: "bp-c-2",
      title: "Scheduled payment date",
      type: "Payments",
      dueDate: "2026-01-30",
      status: "due_today",
      authority: "VACEI Payments",
      description: "Execution of scheduled bulk supplier payments.",
    },
    {
      id: "bp-c-3",
      title: "Loan repayment date",
      type: "Credit",
      dueDate: "2026-02-15",
      status: "upcoming",
      authority: "HSBC Business",
      description: "Monthly installment for terms loan #9822.",
    },
  ],
  bankAccounts: [
    { id: "ba-1", institution: "HSBC UK", currency: "GBP", status: "Active", accountNo: "**** 9822" },
    { id: "ba-2", institution: "Bank of America", currency: "USD", status: "Active", accountNo: "**** 1150" },
    { id: "ba-3", institution: "Wise Business", currency: "EUR", status: "Active", accountNo: "**** 4432" },
  ],
  payments: [
    { id: "p-1", beneficiary: "Azure Cloud Services", amount: "£1,240.50", date: "30 Jan 2026", status: "Pending Approval" },
    { id: "p-2", beneficiary: "Tech Staffing Ltd", amount: "£18,500.00", date: "30 Jan 2026", status: "Pending Approval" },
    { id: "p-3", beneficiary: "Office Rent - City Quay", amount: "£5,000.00", date: "01 Feb 2026", status: "Scheduled" },
    { id: "p-4", beneficiary: "Global Logistics Inc", amount: "£2,150.00", date: "28 Jan 2026", status: "Executed" },
    { id: "p-5", beneficiary: "Marketing Force", amount: "£3,200.00", date: "25 Jan 2026", status: "Failed" },
  ],
  bankingPaymentsFilings: [
    {
      id: "bp-f-1",
      title: "HSBC Monthly Statement",
      period: "Jan 2026",
      status: "Completed",
      updatedDate: "05 Feb 2026",
      category: "Bank Statements",
      documents: ["Statement_Jan_2026.pdf"],
    },
    {
      id: "bp-f-2",
      title: "Bulk Supplier Run",
      period: "15 Jan 2026",
      status: "Completed",
      updatedDate: "16 Jan 2026",
      category: "Payment Confirmations",
      documents: ["Confirmation_Batch_77.pdf"],
    },
    {
      id: "bp-f-3",
      title: "General Banking Mandate",
      period: "N/A",
      status: "Active",
      updatedDate: "10 Jan 2026",
      category: "Mandates & Bank Forms",
      documents: ["Mandate_2026_Final.pdf"],
    },
    {
      id: "bp-f-4",
      title: "Investment Round SOF",
      period: "FY25 Q4",
      status: "Pending",
      updatedDate: "20 Jan 2026",
      category: "Source of Funds",
      documents: ["Investment_Agreement.pdf", "Bank_Confirmation.pdf"],
    },
  ],
  team: MOCK_TEAM,
  messages: MOCK_MESSAGES,
  libraryItems: [
    { id: 'bp-l-root', folder_name: 'Banking & Payments', type: 'folder', parentId: null, tags: ['banking'], uploaderId: 'user-1', isDeleted: false, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
    { id: 'bp-l-statements', folder_name: 'Statements', type: 'folder', parentId: 'bp-l-root', tags: ['banking'], uploaderId: 'user-1', isDeleted: false, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
    { id: 'bp-l-confirmations', folder_name: 'Confirmations', type: 'folder', parentId: 'bp-l-root', tags: ['banking'], uploaderId: 'user-1', isDeleted: false, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
    { id: 'bp-l-f1', file_name: 'HSBC_Statement_Jan.pdf', type: 'file', file_type: 'PDF', file_size: 1024000, url: '#', folderId: 'bp-l-statements', version: 1, tags: ['monthly'], uploaderId: 'user-1', isDeleted: false, createdAt: '2026-02-05T10:00:00Z' }
  ],
  recentActivity: [
    { action: "Payment to Tech Staffing initiated", date: "Jan 30" },
    { action: "HSBC Statement Jan uploaded", date: "Jan 28" },
    { action: "Mandate signature requested", date: "Jan 25" },
    { action: "Payment to marketing force failed", date: "Jan 25" }
  ],
  quickAccessDocs: [
    { name: "Latest HSBC Statement", date: "Jan 30, 2026", url: "#" },
    { name: "Wise Confirmation Receipt", date: "Jan 28, 2026", url: "#" },
    { name: "Approved Mandate v2", date: "Jan 20, 2026", url: "#" }
  ],
  // New dashboard fields
  currentPeriod: "January 2026",
  lastUpdate: "2 hours ago",
  nextStep: "Approve supplier payments",
  actionNeeded: {
    type: "payment_approval", // options: payment_approval, document_request, signature_request
    title: "Supplier Payment Pending",
    description: "Multi-currency batch for Azure & Staffing needs your approval.",
    ctaLabel: "APPROVE PAYMENTS",
    count: 2
  }
};
