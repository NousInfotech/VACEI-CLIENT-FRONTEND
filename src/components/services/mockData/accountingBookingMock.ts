import { ServiceMockData } from "./index";
import { MOCK_TEAM, MOCK_MESSAGES } from "./helpers";

export const accountingBookingMock: ServiceMockData = {
  serviceSlug: "bookkeeping",
  serviceName: "Accounting & Bookkeeping",
  description: "Ongoing maintenance of financial records, including ledger management and reporting.",
milestones: [
  {
    id: "1",
    title: "Initial Setup",
    description: "Setting up the chart of accounts and linking bank feeds.",
    date: "Jan 05, 2026",
    status: "completed",
  },
  {
    id: "2",
    title: "Opening Balance Review",
    description: "Review and confirm opening balances from prior period.",
    date: "Jan 08, 2026",
    status: "completed",
  },
  {
    id: "3",
    title: "Sales & Income Recording",
    description: "Recording all sales invoices and income transactions.",
    date: "Jan 15, 2026",
    status: "completed",
  },
  {
    id: "4",
    title: "Purchase & Expense Recording",
    description: "Processing supplier invoices and operating expenses.",
    date: "Jan 20, 2026",
    status: "completed",
  },
  {
    id: "5",
    title: "Monthly Bookkeeping",
    description: "Processing transactions for the current month.",
    date: "Jan 30, 2026",
    status: "in_progress",
  },
  {
    id: "6",
    title: "Bank & Payment Reconciliation",
    description: "Reconciling bank accounts and payment providers.",
    date: "Feb 02, 2026",
    status: "pending",
  },
  {
    id: "7",
    title: "Trial Balance Preparation",
    description: "Preparing and reviewing the trial balance.",
    date: "Feb 05, 2026",
    status: "pending",
  },
  {
    id: "8",
    title: "Management Reports",
    description: "Generating P&L and Balance Sheet for review.",
    date: "Feb 10, 2026",
    status: "pending",
  },
  {
    id: "9",
    title: "Month-End Close",
    description: "Final review and closure of accounting period.",
    date: "Feb 12, 2026",
    status: "pending",
  },
],
documentRequests: [
  {
    _id: "req-acc-1",
    title: "Expense Receipts",
    description: "Upload all office and operational expense receipts for January.",
    status: "in_progress",
    category: "expenses",
    documents: [
      { name: "Receipt_Guidelines.pdf" }
    ],
    multipleDocuments: [
      {
        name: "Office Expenses",
        type: "template",
        instruction: "Upload expense receipts",
        multiple: [
          {
            template: {
              url: "https://example.com/templates/expense_receipt_template.pdf",
              instruction: "Upload Required Document",
            },
            label: "Travel Expenses",
            url: "https://example.com/uploads/flight_receipt_jan.jpg",
            uploadedFileName: "flight_receipt_jan.jpg",
            uploadedAt: "2026-01-12T09:30:00.000Z",
            status: "uploaded",
            comment: "",
            _id: "exp-doc-1",
          },
          {
            template: {
              url: "https://example.com/templates/expense_receipt_template.pdf",
              instruction: "Upload Required Document",
            },
            label: "Meals & Entertainment",
            status: "pending",
            comment: "",
            _id: "exp-doc-2",
            uploadedAt: "2026-01-12T09:30:00.000Z",
          },
        ],
        _id: "exp-group-1",
      },
    ],
  },

  {
    _id: "req-acc-2",
    title: "Supplier Invoices",
    description: "Upload all invoices received from suppliers for January.",
    status: "completed",
    category: "purchases",
    documents: [
      { name: "Supplier_A_Invoice.pdf", url: "mock-url" }
    ],
    multipleDocuments: [
      {
        name: "Supplier A",
        type: "template",
        instruction: "Upload supplier invoice",
        multiple: [
          {
            template: {
              url: "https://example.com/templates/supplier_invoice_template.pdf",
              instruction: "Upload Required Document",
            },
            label: "Invoice Copy",
            url: "https://example.com/uploads/supplier_a_invoice_jan.pdf",
            uploadedFileName: "supplier_a_invoice_jan.pdf",
            uploadedAt: "2026-01-10T11:15:00.000Z",
            status: "uploaded",
            comment: "Invoice verified and recorded",
            _id: "sup-doc-1",
          },
        ],
        _id: "sup-group-1",
      },
    ],
  },

  {
    _id: "req-acc-3",
    title: "Bank Statements",
    description: "Upload January bank statements for all business accounts.",
    status: "pending",
    category: "banking",
    documents: [ { name: "Sales_Invoice_Jan.pdf", url: "mock-url" }],
    multipleDocuments: [
      {
        name: "Main Business Account",
        type: "template",
        instruction: "Upload bank statement",
        multiple: [
          {
            template: {
              url: "https://example.com/templates/bank_statement_template.pdf",
              instruction: "Upload Required Document",
            },
            label: "Statement PDF",
            status: "pending",
            comment: "",
            _id: "bank-doc-1",
            uploadedAt: "2026-01-06T12:56:54.431Z",
          },
        ],
        _id: "bank-group-1",
      },
      {
        name: "Wise Account",
        type: "template",
        instruction: "Upload Wise statement",
        multiple: [
          {
            template: {
              url: "https://example.com/templates/bank_statement_template.pdf",
              instruction: "Upload Required Document",
            },
            label: "Statement PDF",
            status: "pending",
            comment: "",
            _id: "bank-doc-2",
            uploadedAt: "2026-01-06T12:56:54.431Z",
          },
        ],
        _id: "bank-group-2",
      },
    ],
  },

  {
    _id: "req-acc-4",
    title: "Sales Invoices",
    description: "Upload issued sales invoices for January.",
    status: "completed",
    category: "sales",
    documents: [
      { name: "Sales_Invoice_Jan.pdf", url: "mock-url" }
    ],
    multipleDocuments: [
      {
        name: "Customer Invoices",
        type: "template",
        instruction: "Upload sales invoice",
        multiple: [
          {
            template: {
              url: "https://example.com/templates/sales_invoice_template.pdf",
              instruction: "Upload Required Document",
            },
            label: "Invoice PDF",
            url: "https://example.com/uploads/sales_invoice_001.pdf",
            uploadedFileName: "sales_invoice_001.pdf",
            uploadedAt: "2026-01-08T14:20:00.000Z",
            status: "uploaded",
            comment: "",
            _id: "sales-doc-1",
          },
        ],
        _id: "sales-group-1",
      },
    ],
  },
],
complianceItems: [
  {
    id: "acc-c-1",
    title: "Monthly P&L",
    type: "Reporting",
    dueDate: "2026-02-15",
    status: "upcoming",
    authority: "Internal",
    description: "Financial performance report for stakeholders.",
  },
  {
    id: "acc-c-2",
    title: "Balance Sheet",
    type: "Reporting",
    dueDate: "2026-02-15",
    status: "upcoming",
    authority: "Internal",
    description: "Statement of financial position as at month end.",
  },
  {
    id: "acc-c-3",
    title: "Trial Balance Review",
    type: "Accounting Control",
    dueDate: "2026-02-12",
    status: "upcoming",
    authority: "Internal",
    description: "Review of ledger balances to ensure debits and credits match.",
  },
  {
    id: "acc-c-4",
    title: "Bank Reconciliation Review",
    type: "Accounting Control",
    dueDate: "2026-02-10",
    status: "upcoming",
    authority: "Internal",
    description: "Verification of bank and payment provider reconciliations.",
  },
  {
    id: "acc-c-5",
    title: "Expense Classification Check",
    type: "Internal Review",
    dueDate: "2026-02-08",
    status: "upcoming",
    authority: "Internal",
    description: "Confirmation that expenses are recorded under correct accounts.",
  },
  {
    id: "acc-c-6",
    title: "Accounts Payable Review",
    type: "Accounting Control",
    dueDate: "2026-02-09",
    status: "upcoming",
    authority: "Internal",
    description: "Review of outstanding supplier balances and due invoices.",
  },
],
team: MOCK_TEAM,
messages: [
  {
    id: "ab-m-1",
    senderId: "sarah_j",
    senderName: "Sarah Jennings",
    senderRole: "Partner",
    content:
      "I've uploaded the January bank reconciliation report. There's a small discrepancy in the petty cash account.",
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
    read: false,
    type: "message",
  },
  {
    id: "ab-m-2",
    senderId: "accountant_1",
    senderName: "Senior Accountant",
    senderRole: "Accountant",
    content:
      "Thanks. We’re reviewing the reconciliation now and will update once the discrepancy is resolved.",
    timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
    read: true,
    type: "message",
  },
  {
    id: "ab-m-3",
    senderId: "client_user",
    senderName: "Client",
    senderRole: "Client",
    content:
      "Noted. The petty cash difference might be due to a missing taxi receipt — I’ll upload it shortly.",
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    read: true,
    type: "message",
  },
  {
    id: "ab-m-4",
    senderId: "accountant_1",
    senderName: "Senior Accountant",
    senderRole: "Accountant",
    content:
      "Receipt received. We’ll adjust the entry and finalise the bank reconciliation.",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    read: false,
    type: "message",
  },
  {
    id: "ab-m-5",
    senderId: "sarah_j",
    senderName: "Sarah Jennings",
    senderRole: "Partner",
    content:
      "Great, thanks. We’ll proceed with the trial balance review once reconciliation is complete.",
    timestamp: new Date().toISOString(),
    read: false,
    type: "message",
  },
],

libraryItems: [
    { id: 'ab-l-root', folder_name: 'Financial Records', type: 'folder', parentId: null, tags: ['accounts'], uploaderId: 'user-1', isDeleted: false, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
    { id: 'ab-l-2025', folder_name: '2025 Financials', type: 'folder', parentId: 'ab-l-root', tags: ['accounts'], uploaderId: 'user-1', isDeleted: false, createdAt: '2025-01-01T10:00:00Z', updatedAt: '2025-01-01T10:00:00Z' },
    { id: 'ab-l-recon', folder_name: 'Monthly Reconciliations', type: 'folder', parentId: 'ab-l-2025', tags: ['accounts'], uploaderId: 'user-1', isDeleted: false, createdAt: '2025-01-01T10:00:00Z', updatedAt: '2025-01-01T10:00:00Z' },
    { id: 'ab-l-recon-jan', folder_name: 'January', type: 'folder', parentId: 'ab-l-recon', tags: ['accounts'], uploaderId: 'user-1', isDeleted: false, createdAt: '2026-01-20T10:00:00Z', updatedAt: '2026-01-20T10:00:00Z' },
    { id: 'ab-l-f1', file_name: 'Bank_Statement_Jan_2026.pdf', type: 'file', file_type: 'PDF', file_size: 1024000, url: '#', folderId: 'ab-l-recon-jan', version: 1, tags: ['source'], uploaderId: 'user-1', isDeleted: false, createdAt: '2026-01-15T10:00:00Z' },
    { id: 'ab-l-f2', file_name: 'Fixed_Assets_Register_2025.xlsx', type: 'file', file_type: 'XLSX', file_size: 4500000, url: '#', folderId: 'ab-l-2025', version: 3, tags: ['audit'], uploaderId: 'user-1', isDeleted: false, createdAt: '2026-01-05T10:00:00Z' }
],
filings: [
  {
    id: "ab-f-1",
    filing_type: "VAT Return",
    reference: "Q4 2025",
    status: "completed",
    due_date: "2026-01-15",
    filing_status: "completed",
  },
  {
    id: "ab-f-2",
    filing_type: "Management Accounts",
    reference: "Dec 2025",
    status: "completed",
    due_date: "2026-01-20",
    filing_status: "completed",
  },
  {
    id: "ab-f-3",
    filing_type: "VAT Return",
    reference: "Jan 2026",
    status: "in_progress",
    due_date: "2026-02-15",
    filing_status: "draft",
  },
  {
    id: "ab-f-4",
    filing_type: "Management Accounts",
    reference: "Jan 2026",
    status: "upcoming",
    due_date: "2026-02-18",
    filing_status: "draft",
  },
  {
    id: "ab-f-5",
    filing_type: "Trial Balance",
    reference: "Jan 2026",
    status: "completed",
    due_date: "2026-02-05",
    filing_status: "completed",
  },
  {
    id: "ab-f-6",
    filing_type: "Balance Sheet",
    reference: "Jan 2026",
    status: "upcoming",
    due_date: "2026-02-18",
    filing_status: "draft",
  },
],

etb: {
accounts: [
{ code: "1000", name: "Cash at Bank - EUR", debit: 50000, credit: 0 },
{ code: "1010", name: "Petty Cash", debit: 500, credit: 0 },
{ code: "1200", name: "Accounts Receivable - Domestic", debit: 15000, credit: 0 },
{ code: "1210", name: "Accounts Receivable - Export", debit: 8000, credit: 0 },
{ code: "1400", name: "Prepayments", debit: 2500, credit: 0 },
{ code: "1500", name: "Inventory - Raw Materials", debit: 12000, credit: 0 },
{ code: "2000", name: "Accounts Payable", debit: 0, credit: 8000 },
{ code: "2100", name: "Accrued Expenses", debit: 0, credit: 3500 },
{ code: "2200", name: "VAT Payable", debit: 0, credit: 12450 },
{ code: "2300", name: "Social Security Payable", debit: 0, credit: 2100 },
{ code: "3000", name: "Share Capital", debit: 0, credit: 10000 },
{ code: "3100", name: "Retained Earnings", debit: 0, credit: 45000 },
{ code: "4000", name: "Sales Revenue - Goods", debit: 0, credit: 65000 },
{ code: "4100", name: "Sales Revenue - Services", debit: 0, credit: 25000 },
{ code: "5000", name: "Cost of Sales", debit: 30000, credit: 0 },
{ code: "6000", name: "Salaries and Wages", debit: 22000, credit: 0 },
{ code: "6100", name: "Rent & Utilities", debit: 4500, credit: 0 },
{ code: "6200", name: "Marketing & Advertising", debit: 3200, credit: 0 },
{ code: "6300", name: "Professional Fees", debit: 1500, credit: 0 },
{ code: "6400", name: "Insurance", debit: 800, credit: 0 },
{ code: "6500", name: "Office Supplies", debit: 450, credit: 0 },
],
totalDebit: 149450,
totalCredit: 149450,
isBalanced: true
},
financialStatements: {
revenue: 65000,
expenses: 40000,
grossProfit: 35000,
netIncome: 25000,
assets: 65000,
liabilities: 8000,
equity: 57000
},
dashboardStats: [
{ title: "Revenue YTD", amount: "125,400", trend: "+12%", color: "emerald" },
{ title: "Net Profit", amount: "42,100", trend: "+8%", color: "blue" },
{ title: "Operating Expenses", amount: "68,300", trend: "-5%", color: "orange" }
],
recentActivity: [
{ action: "Bank reconciliation completed", date: "Jan 28" },
{ action: "Sales invoices processed", date: "Jan 25" },
{ action: "Monthly management reports generated", date: "Jan 20" }
],
quickAccessDocs: [
{ name: "Balance Sheet Dec 2025", date: "Jan 20, 2026", url: "#" },
{ name: "P&L Statement FY2025", date: "Jan 18, 2026", url: "#" },
{ name: "Bank Recon Report Jan", date: "Jan 25, 2026", url: "#" },
{ name: "Chart of Accounts", date: "Jan 01, 2026", url: "#" }
]
};
