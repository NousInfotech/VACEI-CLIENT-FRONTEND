// Mock API Service - Replaces all backend API calls
// This file provides mock data that matches the real backend response structure

// Simulate API delay
async function simulateDelay(ms: number = 300) {
  await new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================================================
// USER PROFILE API MOCKS
// ============================================================================

export async function mockGetUserProfile() {
  await simulateDelay(200);
  return {
    email: "user@example.com",
    first_name: "John",
    last_name: "Doe",
    username: "johndoe",
    phone: "+1234567890",
    role: 3, // 1=Admin, 2=Accountant, 3=Client
  };
}

export async function mockUpdateUserProfile(data: any) {
  await simulateDelay(300);
  return {
    ...data,
    message: "Profile updated successfully",
  };
}

// ============================================================================
// ACCOUNT API MOCKS
// ============================================================================

export async function mockGetBankData() {
  await simulateDelay(300);
  return {
    accounts: [
      {
        id: "1",
        name: "Main Business Account",
        accountType: "Bank",
        accountSubType: "Checking",
        currentBalance: 125000.50,
        active: true,
      },
      {
        id: "2",
        name: "Savings Account",
        accountType: "Bank",
        accountSubType: "Savings",
        currentBalance: 50000.00,
        active: true,
      },
      {
        id: "3",
        name: "Business Credit Card",
        accountType: "Credit Card",
        accountSubType: "Credit Card",
        currentBalance: -2500.75,
        active: true,
      },
      {
        id: "4",
        name: "Secondary Credit Card",
        accountType: "Credit Card",
        accountSubType: "Credit Card",
        currentBalance: -1200.00,
        active: true,
      },
    ],
    masterCurrentBalance: 173299.75,
  };
}

export async function mockGetAccounts(params: {
  page?: number;
  limit?: number;
  search?: string;
  accountType?: string;
  accountSubType?: string;
}) {
  await simulateDelay(300);
  const { page = 1, limit = 10, search = "", accountType = "", accountSubType = "" } = params;
  
  let accounts = [
    {
      id: "1",
      name: "Main Business Account",
      accountType: "Bank",
      accountSubType: "Checking",
      currentBalance: 125000.50,
      active: true,
    },
    {
      id: "2",
      name: "Savings Account",
      accountType: "Bank",
      accountSubType: "Savings",
      currentBalance: 50000.00,
      active: true,
    },
    {
      id: "3",
      name: "Business Credit Card",
      accountType: "Credit Card",
      accountSubType: "Credit Card",
      currentBalance: -2500.75,
      active: true,
    },
    {
      id: "4",
      name: "Secondary Credit Card",
      accountType: "Credit Card",
      accountSubType: "Credit Card",
      currentBalance: -1200.00,
      active: true,
    },
    {
      id: "5",
      name: "Investment Account",
      accountType: "Asset",
      accountSubType: "Investment",
      currentBalance: 250000.00,
      active: true,
    },
  ];

  // Apply filters
  if (search) {
    accounts = accounts.filter(acc => 
      acc.name.toLowerCase().includes(search.toLowerCase())
    );
  }
  if (accountType) {
    accounts = accounts.filter(acc => acc.accountType === accountType);
  }
  if (accountSubType) {
    accounts = accounts.filter(acc => acc.accountSubType === accountSubType);
  }

  // Paginate
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginated = accounts.slice(startIndex, endIndex);

  return {
    accounts: paginated,
    totalItems: accounts.length,
  };
}

// ============================================================================
// TRANSACTION API MOCKS
// ============================================================================

export async function mockGetTransactions(params: {
  page?: number;
  limit?: number;
  type?: string;
  intuitAccountId?: string;
}) {
  await simulateDelay(300);
  const { page = 1, limit = 10, type = "all" } = params;

  const allTransactions = [
    {
      id: "1",
      type: "income" as const,
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      description: "Invoice Payment - Client ABC",
      amount: 5000.00,
    },
    {
      id: "2",
      type: "expense" as const,
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      description: "Office Supplies Purchase",
      amount: -250.50,
    },
    {
      id: "3",
      type: "income" as const,
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      description: "Service Fee - Project XYZ",
      amount: 3500.00,
    },
    {
      id: "4",
      type: "expense" as const,
      date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      description: "Software Subscription",
      amount: -99.99,
    },
    {
      id: "5",
      type: "income" as const,
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      description: "Consulting Revenue",
      amount: 7500.00,
    },
  ];

  let filtered = allTransactions;
  if (type !== "all") {
    filtered = allTransactions.filter(t => t.type === type);
  }

  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginated = filtered.slice(startIndex, endIndex);

  return {
    transactions: paginated,
    totalPages: Math.ceil(filtered.length / limit),
  };
}

// ============================================================================
// COMPANY API MOCKS
// ============================================================================

export async function mockGetCompany() {
  await simulateDelay(200);
  return {
    simplifiedProfile: {
      companyName: "Acme Corporation",
      legalName: "Acme Corporation Ltd.",
      email: "contact@acme.com",
      address: "123 Business Street, City, Country",
      startDate: "2020-01-15",
    },
  };
}

// ============================================================================
// TAX API MOCKS
// ============================================================================

export async function mockGetTaxData() {
  await simulateDelay(300);
  return [
    {
      entityType: "TaxAgency",
      jsonData: {
        TaxAgency: [
          { Id: "1", DisplayName: "Internal Revenue Service" },
          { Id: "2", DisplayName: "State Tax Authority" },
          { Id: "3", DisplayName: "Local Tax Office" },
        ],
      },
    },
    {
      entityType: "TaxRate",
      jsonData: {
        TaxRate: [
          { Id: "1", Name: "Standard VAT", RateValue: 20 },
          { Id: "2", Name: "Reduced VAT", RateValue: 10 },
          { Id: "3", Name: "Corporate Tax", RateValue: 25 },
        ],
      },
    },
  ];
}

// ============================================================================
// INVOICE API MOCKS
// ============================================================================

export async function mockGetInvoices(params: {
  page?: number;
  limit?: number;
  customerName?: string;
  fromDate?: string;
  toDate?: string;
  status?: string;
}) {
  await simulateDelay(300);
  const { page = 1, limit = 10 } = params;

  const allInvoices = [
    {
      id: "1",
      docNumber: "INV-2024-001",
      invoiceId: 1,
      txnDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      dueDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
      customerName: "Client ABC",
      totalAmount: 5000.00,
      balance: 0,
      status: "Paid",
      lineItems: [
        { itemName: "Consulting Services", quantity: 10, unitPrice: 500, amount: 5000 },
      ],
    },
    {
      id: "2",
      docNumber: "INV-2024-002",
      invoiceId: 2,
      txnDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      dueDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
      customerName: "Client XYZ",
      totalAmount: 7500.00,
      balance: 7500.00,
      status: "Unpaid",
      lineItems: [
        { itemName: "Project Development", quantity: 1, unitPrice: 7500, amount: 7500 },
      ],
    },
    {
      id: "3",
      docNumber: "INV-2024-003",
      invoiceId: 3,
      txnDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      dueDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString(),
      customerName: "Client DEF",
      totalAmount: 3200.00,
      balance: 3200.00,
      status: "Unpaid",
      lineItems: [
        { itemName: "Support Services", quantity: 8, unitPrice: 400, amount: 3200 },
      ],
    },
  ];

  let filtered = allInvoices;
  if (params.customerName) {
    filtered = filtered.filter(inv => 
      inv.customerName.toLowerCase().includes(params.customerName!.toLowerCase())
    );
  }
  if (params.status) {
    filtered = filtered.filter(inv => inv.status === params.status);
  }
  if (params.fromDate) {
    const from = new Date(params.fromDate);
    filtered = filtered.filter(inv => new Date(inv.txnDate) >= from);
  }
  if (params.toDate) {
    const to = new Date(params.toDate);
    filtered = filtered.filter(inv => new Date(inv.txnDate) <= to);
  }

  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginated = filtered.slice(startIndex, endIndex);

  return {
    invoices: paginated,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(filtered.length / limit),
    },
  };
}

export async function mockGetInvoiceStats(params: {
  customerName?: string;
  fromDate?: string;
  toDate?: string;
}) {
  await simulateDelay(200);
  return {
    success: true,
    stats: {
      paidCount: 1,
      paidTotal: 5000.00,
      unpaidCount: 2,
      unpaidTotal: 10700.00,
    },
  };
}

export async function mockRecordPayment(data: any) {
  await simulateDelay(300);
  return {
    success: true,
    message: "Payment recorded successfully",
    payment: {
      id: `pay-${Date.now()}`,
      ...data,
    },
  };
}

// ============================================================================
// JOURNAL API MOCKS
// ============================================================================

export async function mockGetJournal(params: {
  page?: number;
  limit?: number;
  privateNote?: string;
  fromDate?: string;
  toDate?: string;
}) {
  await simulateDelay(300);
  const { page = 1, limit = 10 } = params;

  const allEntries = [
    {
      id: "1",
      txnDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      privateNote: "Monthly Revenue Entry",
    },
    {
      id: "2",
      txnDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      privateNote: "Expense Adjustment",
    },
    {
      id: "3",
      txnDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      privateNote: "Bank Reconciliation",
    },
  ];

  let filtered = allEntries;
  if (params.privateNote) {
    filtered = filtered.filter(entry => 
      entry.privateNote.toLowerCase().includes(params.privateNote!.toLowerCase())
    );
  }
  if (params.fromDate) {
    const from = new Date(params.fromDate);
    filtered = filtered.filter(entry => new Date(entry.txnDate) >= from);
  }
  if (params.toDate) {
    const to = new Date(params.toDate);
    filtered = filtered.filter(entry => new Date(entry.txnDate) <= to);
  }

  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginated = filtered.slice(startIndex, endIndex);

  return {
    journalEntries: paginated,
    totalDebit: 150000.00,
    totalCredit: 150000.00,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(filtered.length / limit),
    },
  };
}

export async function mockGetJournalItems(params: {
  parentId: string;
  page?: number;
  limit?: number;
  accountName?: string;
  description?: string;
  postingType?: string;
  amount?: string;
}) {
  await simulateDelay(300);
  const { page = 1, limit = 10 } = params;

  const allLines = [
    {
      id: "1",
      accountName: "Accounts Receivable",
      description: "Invoice payment received",
      postingType: "Debit" as const,
      amount: 5000.00,
    },
    {
      id: "2",
      accountName: "Revenue",
      description: "Service revenue",
      postingType: "Credit" as const,
      amount: 5000.00,
    },
    {
      id: "3",
      accountName: "Office Supplies",
      description: "Purchase of office materials",
      postingType: "Debit" as const,
      amount: 250.50,
    },
    {
      id: "4",
      accountName: "Cash",
      description: "Payment for supplies",
      postingType: "Credit" as const,
      amount: 250.50,
    },
  ];

  let filtered = allLines;
  if (params.accountName) {
    filtered = filtered.filter(line => 
      line.accountName.toLowerCase().includes(params.accountName!.toLowerCase())
    );
  }
  if (params.description) {
    filtered = filtered.filter(line => 
      line.description.toLowerCase().includes(params.description!.toLowerCase())
    );
  }
  if (params.postingType) {
    filtered = filtered.filter(line => line.postingType === params.postingType);
  }

  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginated = filtered.slice(startIndex, endIndex);

  const totalDebit = filtered
    .filter(line => line.postingType === "Debit")
    .reduce((sum, line) => sum + line.amount, 0);
  const totalCredit = filtered
    .filter(line => line.postingType === "Credit")
    .reduce((sum, line) => sum + line.amount, 0);

  return {
    journalLines: paginated,
    totalDebit,
    totalCredit,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(filtered.length / limit),
    },
  };
}

// ============================================================================
// DOCUMENT API MOCKS
// ============================================================================

export async function mockGetDocument(docId: string) {
  await simulateDelay(200);
  return {
    data: [
      {
        id: docId,
        document_title: "Sample Document",
        year: "2024",
        month: "3",
        files: [
          {
            id: "file-1",
            fileName: "document.pdf",
            fileUrl: "/uploads/document.pdf",
            fileType: "pdf",
          },
        ],
        categories: [{ id: 1, name: "Financial" }],
        subCategories: [{ id: 1, name: "Invoice" }],
        tags: [{ id: 1, name: "important" }],
        notes: "Sample document notes",
      },
    ],
  };
}

// ============================================================================
// COMMENT API MOCKS
// ============================================================================

export async function mockGetComments(params: {
  fileId?: string;
  since?: string;
}) {
  await simulateDelay(200);
  const comments = [
    {
      id: 1,
      message: "This document looks good. Please proceed with filing.",
      document: null,
      canDelete: 1,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      createdBy: "John Doe",
    },
    {
      id: 2,
      message: "I need to review this section more carefully.",
      document: null,
      canDelete: 1,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      createdBy: "Jane Smith",
    },
  ];

  if (params.since) {
    const sinceDate = new Date(params.since);
    return comments.filter(c => new Date(c.createdAt) > sinceDate);
  }

  return comments;
}

export async function mockCreateComment(data: any) {
  await simulateDelay(200);
  return {
    id: Date.now(),
    ...data,
    createdAt: new Date().toISOString(),
    createdBy: "Current User",
    canDelete: 1,
  };
}

export async function mockUpdateComment(commentId: number, data: any) {
  await simulateDelay(200);
  return {
    id: commentId,
    ...data,
    message: data.text,
  };
}

export async function mockDeleteComment(commentId: number) {
  await simulateDelay(200);
  return { success: true };
}

// ============================================================================
// COMPLIANCE API MOCKS
// ============================================================================

export async function mockSaveComplianceSettings(data: any) {
  await simulateDelay(300);
  return {
    success: true,
    message: "Compliance settings saved successfully",
  };
}

// ============================================================================
// QUICKBOOKS API MOCKS
// ============================================================================

export async function mockCheckQuickbooksAuth() {
  await simulateDelay(300);
  return {
    success: true,
    data: {
      isValid: true,
      intuitAccount: {
        accessToken: "mock-access-token",
        realmId: "mock-realm-id",
        updatedAt: new Date().toISOString(),
      },
    },
  };
}

export async function mockSyncQuickbooksData(endpoint: string) {
  await simulateDelay(500);
  return {
    success: true,
    data: {
      message: `Successfully synced ${endpoint}`,
    },
  };
}

// ============================================================================
// SEARCH API MOCKS
// ============================================================================

export async function mockSearch(query: string, page: number = 1, limit: number = 10) {
  await simulateDelay(300);
  
  const mockResults = [
    {
      id: "task-1",
      title: "Review Financial Statements",
      description: "Task related to financial review",
      type: "Task",
      link: "/dashboard/tasks/1",
      category: "Financial",
      status: "In Progress",
      createdBy: "John Doe",
    },
    {
      id: "doc-1",
      title: "Q4 Financial Report",
      description: "Quarterly financial document",
      type: "Document",
      link: "/dashboard/documents/1",
      category: "Financial",
      uploadedBy: "Jane Smith",
      status: "Active",
      year: "2024",
    },
    {
      id: "meeting-1",
      title: "Monthly Review Meeting",
      description: "Scheduled meeting for monthly review",
      type: "Meeting",
      link: "/dashboard/meetings/1",
      category: "General",
      client: "Client ABC",
      accountant: "John Doe",
      startTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  // Filter by query
  const filtered = query
    ? mockResults.filter(result => 
        result.title.toLowerCase().includes(query.toLowerCase()) ||
        result.description.toLowerCase().includes(query.toLowerCase())
      )
    : mockResults;

  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginated = filtered.slice(startIndex, endIndex);

  return {
    success: true,
    data: paginated,
    totalCount: filtered.length,
  };
}

