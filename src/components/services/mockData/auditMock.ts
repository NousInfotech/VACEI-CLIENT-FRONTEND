import { ServiceMockData } from "./index";
import { MOCK_TEAM, MOCK_MESSAGES } from "./helpers";

export const auditMock: ServiceMockData = {
  serviceSlug: "audit",
  serviceName: "Audit",
  description: "Independent examination of financial statements to ensure accuracy and compliance.",
  milestones: [
  {
    id: "1",
    title: "Pre-Audit Planning",
    description: "Risk assessment, materiality determination, and audit strategy development.",
    date: "Jan 10, 2026",
    status: "completed",
  },
  {
    id: "2",
    title: "Engagement Letter & Scope Confirmation",
    description: "Finalising audit scope, timelines, and engagement terms.",
    date: "Jan 12, 2026",
    status: "completed",
  },
  {
    id: "3",
    title: "Internal Control Understanding",
    description: "Review of internal controls and process walkthroughs.",
    date: "Jan 15, 2026",
    status: "completed",
  },
  {
    id: "4",
    title: "Interim Audit Procedures",
    description: "Preliminary testing of key balances and transactions.",
    date: "Jan 18, 2026",
    status: "completed",
  },
  {
    id: "5",
    title: "Fieldwork",
    description: "Substantive testing and detailed documentation review.",
    date: "Jan 25, 2026",
    status: "in_progress",
  },
  {
    id: "6",
    title: "Audit Queries & Management Responses",
    description: "Raising audit queries and reviewing management responses.",
    date: "Feb 05, 2026",
    status: "pending",
  },
  {
    id: "7",
    title: "Completion & Partner Review",
    description: "Final review of audit files and conclusions.",
    date: "Feb 12, 2026",
    status: "pending",
  },
  {
    id: "8",
    title: "Final Audit Report",
    description: "Issuance of the audit opinion and final audit report.",
    date: "Feb 20, 2026",
    status: "pending",
  },
  ],
documentRequests: [
  {
    _id: "req-aud-1",
    title: "Fixed Asset Register",
    description: "Provide the updated fixed asset register as of year-end.",
    status: "in_progress",
    category: "assets",

    // 🔹 SINGLE DOCUMENT (simple upload)
    documents: [
      {
        name: "Fixed_Asset_Register_2025.xlsx",
        url: "mock-url"
      }
    ],

    // 🔹 MULTIPLE DOCUMENTS (supporting evidence)
    multipleDocuments: [
      {
        name: "Asset Supporting Documents",
        type: "template",
        instruction: "Upload asset purchase and disposal documents",
        multiple: [
          {
            template: {
              url: "https://example.com/templates/asset_purchase_template.pdf",
              instruction: "Upload Required Document"
            },
            label: "Asset Purchase Invoices",
            url: "https://example.com/uploads/asset_invoice_001.pdf",
            uploadedFileName: "asset_invoice_001.pdf",
            uploadedAt: "2026-01-14T10:45:00.000Z",
            status: "uploaded",
            comment: "Invoice verified",
            _id: "aud-asset-doc-1"
          },
          {
            template: {
              url: "https://example.com/templates/asset_disposal_template.pdf",
              instruction: "Upload Required Document"
            },
            label: "Asset Disposal Documents",
            status: "pending",
            comment: "",
            _id: "aud-asset-doc-2",
            uploadedAt: "2026-01-16T09:20:00.000Z"
          }
        ],
        _id: "aud-asset-group-1"
      }
    ]
  },

  {
    _id: "req-aud-2",
    title: "Engagement Letter",
    description: "Signed copy of the audit engagement letter.",
    status: "completed",
    category: "legal",

    // 🔹 SINGLE DOCUMENT ONLY
    documents: [
      {
        name: "Signed_Engagement_Letter.pdf",
        url: "mock-url"
      }
    ],

    multipleDocuments: []
  },

  {
    _id: "req-aud-3",
    title: "Bank Confirmations",
    description: "Bank confirmation letters for all active bank accounts.",
    status: "pending",
    category: "banking",

    // 🔹 SINGLE DOCUMENT (optional summary)
    documents: [
      {
        name: "Bank_Accounts_List.pdf",
        url: "mock-url"
      }
    ],

    // 🔹 MULTIPLE DOCUMENTS (per bank)
    multipleDocuments: [
      {
        name: "Primary Bank Account",
        type: "template",
        instruction: "Upload bank confirmation letter",
        multiple: [
          {
            template: {
              url: "https://example.com/templates/bank_confirmation_template.pdf",
              instruction: "Upload Required Document"
            },
            label: "Confirmation Letter",
            status: "pending",
            comment: "",
            _id: "aud-bank-doc-1",
            uploadedAt: "2026-01-18T12:00:00.000Z"
          }
        ],
        _id: "aud-bank-group-1"
      },
      {
        name: "Secondary Bank Account",
        type: "template",
        instruction: "Upload bank confirmation letter",
        multiple: [
          {
            template: {
              url: "https://example.com/templates/bank_confirmation_template.pdf",
              instruction: "Upload Required Document"
            },
            label: "Confirmation Letter",
            status: "pending",
            comment: "",
            _id: "aud-bank-doc-2",
            uploadedAt: "2026-01-18T12:00:00.000Z"
          }
        ],
        _id: "aud-bank-group-2"
      }
    ]
  },

  {
    _id: "req-aud-4",
    title: "Revenue Contracts",
    description: "Customer contracts supporting revenue recognition.",
    status: "pending",
    category: "revenue",

    // 🔹 SINGLE DOCUMENT (summary)
    documents: [
      {
        name: "Revenue_Contracts_Summary.xlsx",
        url: "mock-url"
      }
    ],

    // 🔹 MULTIPLE DOCUMENTS (individual contracts)
    multipleDocuments: [
      {
        name: "Customer Contracts",
        type: "template",
        instruction: "Upload customer contracts",
        multiple: [
          {
            template: {
              url: "https://example.com/templates/revenue_contract_template.pdf",
              instruction: "Upload Required Document"
            },
            label: "Contract PDF",
            status: "pending",
            comment: "",
            _id: "aud-rev-doc-1",
            uploadedAt: "2026-01-19T11:30:00.000Z"
          }
        ],
        _id: "aud-rev-group-1"
      }
    ]
  }
],
complianceItems: [
  {
    id: "aud-c-1",
    title: "Statutory Audit FY2025",
    type: "Statutory Requirement",
    dueDate: "2026-09-30",
    status: "upcoming",
    authority: "MBR",
    description: "Annual statutory audit filing.",
  },
  {
    id: "aud-c-2",
    title: "Audit Planning Memorandum",
    type: "Audit Documentation",
    dueDate: "2026-01-15",
    status: "filed",
    authority: "Internal",
    description: "Formal documentation of audit scope, risks, and materiality.",
  },
  {
    id: "aud-c-3",
    title: "Internal Control Evaluation",
    type: "Audit Procedure",
    dueDate: "2026-01-20",
    status: "filed",
    authority: "Internal",
    description: "Assessment of internal controls and walkthroughs.",
  },
  {
    id: "aud-c-4",
    title: "Substantive Testing Completion",
    type: "Audit Procedure",
    dueDate: "2026-02-05",
    status: "pending",
    authority: "Internal",
    description: "Completion of substantive audit testing on key balances.",
  },
  {
    id: "aud-c-5",
    title: "Management Representation Letter",
    type: "Statutory Requirement",
    dueDate: "2026-02-15",
    status: "upcoming",
    authority: "MBR",
    description: "Signed management representation letter required for audit completion.",
  },
  {
    id: "aud-c-6",
    title: "Audit Completion & Partner Review",
    type: "Audit Review",
    dueDate: "2026-02-18",
    status: "due_today",
    authority: "Internal",
    description: "Final partner review before issuing audit opinion.",
  },
  {
    id: "aud-c-7",
    title: "Final Audit Report Issuance",
    type: "Statutory Requirement",
    dueDate: "2026-02-20",
    status: "pending",
    authority: "MBR",
    description: "Issuance of signed statutory audit report.",
  },
],

  team: MOCK_TEAM,
  messages: [
    {
      id: 'au-m-1',
      senderId: 'sarah_j',
      senderName: 'Sarah Jennings',
      senderRole: 'Partner',
      content: "The preliminary audit plan for 2025 has been uploaded. Please review the materiality thresholds.",
      timestamp: new Date(Date.now() - 3600000 * 72).toISOString(),
      read: true,
      type: 'message'
    }
  ],
  libraryItems: [
    { id: 'au-l-root', folder_name: 'Audit 2025 Dossier', type: 'folder', parentId: null, tags: ['audit'], uploaderId: 'user-1', isDeleted: false, createdAt: '2025-11-20T10:00:00Z', updatedAt: '2025-11-20T10:00:00Z' },
    { id: 'au-l-planning', folder_name: 'Planning & Risk', type: 'folder', parentId: 'au-l-root', tags: ['audit'], uploaderId: 'user-1', isDeleted: false, createdAt: '2025-12-01T10:00:00Z', updatedAt: '2025-12-01T10:00:00Z' },
    { id: 'au-l-pbc', folder_name: 'PBC (Provided by Client)', type: 'folder', parentId: 'au-l-root', tags: ['audit'], uploaderId: 'user-1', isDeleted: false, createdAt: '2026-01-05T10:00:00Z', updatedAt: '2026-01-05T10:00:00Z' },
    { id: 'au-l-pbc-cash', folder_name: 'Cash & Banking', type: 'folder', parentId: 'au-l-pbc', tags: ['audit'], uploaderId: 'user-1', isDeleted: false, createdAt: '2026-01-05T10:00:00Z', updatedAt: '2026-01-05T10:00:00Z' },
    { id: 'au-l-pbc-fixed', folder_name: 'Fixed Assets', type: 'folder', parentId: 'au-l-pbc', tags: ['audit'], uploaderId: 'user-1', isDeleted: false, createdAt: '2026-01-05T10:00:00Z', updatedAt: '2026-01-05T10:00:00Z' },
    { id: 'au-l-f1', file_name: 'Engagement_Letter_Signed.pdf', type: 'file', file_type: 'PDF', file_size: 1540000, url: '#', folderId: 'au-l-planning', version: 1, tags: ['administrative'], uploaderId: 'user-1', isDeleted: false, createdAt: '2025-11-25T10:00:00Z' },
    { id: 'au-l-f2', file_name: 'Materiality_Assessment.pdf', type: 'file', file_type: 'PDF', file_size: 890000, url: '#', folderId: 'au-l-planning', version: 2, tags: ['planning'], uploaderId: 'user-1', isDeleted: false, createdAt: '2025-12-10T10:00:00Z' },
    { id: 'au-l-f3', file_name: 'Bank_Confirmation_HSBC.pdf', type: 'file', file_type: 'PDF', file_size: 512000, url: '#', folderId: 'au-l-pbc-cash', version: 1, tags: ['external'], uploaderId: 'user-1', isDeleted: false, createdAt: '2026-01-20T10:00:00Z' }
  ],
  auditFilings: [
    {
      id: "aud-f-1",
      engagement: "Statutory Audit",
      financialYear: "FY 2025",
      status: "In progress",
      serviceStatus: "on_track",
      reportDate: "—",
      deliverables: [],
    },
    {
      id: "aud-f-2",
      engagement: "Statutory Audit",
      financialYear: "FY 2024",
      status: "Completed",
      serviceStatus: "on_track",
      reportDate: "30 Sep 2025",
      deliverables: ["Audit Report", "FS"],
    },
    {
      id: "aud-f-3",
      engagement: "Statutory Audit",
      financialYear: "FY 2023",
      status: "Completed",
      serviceStatus: "on_track",
      reportDate: "28 Sep 2024",
      deliverables: ["Audit Report", "FS"],
    },
  ],
  etb: {
    accounts: [
      { code: "1000", name: "Cash", debit: 120000, credit: 0 },
      { code: "1500", name: "Inventory", debit: 45000, credit: 0 },
      { code: "3000", name: "Share Capital", debit: 0, credit: 100000 },
    ],
    totalDebit: 165000,
    totalCredit: 100000,
    isBalanced: false
  },
  adjustments: [
    {
      id: "adj-1",
      description: "To record depreciation for the year",
      date: "2025-12-31",
      status: "draft",
      entries: [
        { accountCode: "5100", accountName: "Depreciation Expense", debit: 5000, credit: 0 },
        { accountCode: "1810", accountName: "Accumulated Depreciation", debit: 0, credit: 5000 }
      ]
    }
  ],
  leadSheets: [
    { id: "ls-1", title: "A - Cash and Cash Equivalents", status: "reviewed" },
    { id: "ls-2", title: "B - Accounts Receivable", status: "in_progress" }
  ],
  auditProgress: [
    { step: "Planning & Risk Assessment", status: "completed" },
    { step: "Internal Controls Review", status: "completed" },
    { step: "Substantive Testing", status: "in_progress" },
    { step: "Reporting & Opinion", status: "pending" }
  ],
  recentActivity: [
    { action: "Cash confirmation received", date: "Jan 27" },
    { action: "Bank reconciliation reviewed", date: "Jan 24" },
    { action: "Materiality levels established", date: "Jan 15" }
  ],
  quickAccessDocs: [
    { name: "Audit Plan 2025", date: "Jan 20, 2026", url: "#" },
    { name: "PBC List - Finance", date: "Jan 15, 2026", url: "#" },
    { name: "Engagement Letter", date: "Jan 10, 2026", url: "#" }
  ]
};
