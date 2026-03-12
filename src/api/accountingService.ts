/**
 * Client API for accounting/bookkeeping (mirrors partner portal endpoints).
 * Uses NEXT_PUBLIC_VACEI_BACKEND_URL.
 */
const apiUrl =
  process.env.NEXT_PUBLIC_VACEI_BACKEND_URL?.replace(/\/?$/, "/") ||
  "http://localhost:5000/api/v1/";

function getAuthHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("token") || "";
  return { Authorization: `Bearer ${token}` };
}

async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${apiUrl}${path.replace(/^\//, "")}`, {
    method: "GET",
    headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
  });
  if (!res.ok) {
    const err: any = new Error(res.statusText || "Request failed");
    err.response = { status: res.status, data: await res.json().catch(() => ({})) };
    throw err;
  }
  return res.json();
}

async function apiPost(path: string, body?: object): Promise<unknown> {
  const res = await fetch(`${apiUrl}${path.replace(/^\//, "")}`, {
    method: "POST",
    headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err: any = new Error(res.statusText || "Request failed");
    err.response = { status: res.status, data: await res.json().catch(() => ({})) };
    throw err;
  }
  return res.json();
}

async function apiPatch(path: string, body: object): Promise<unknown> {
  const res = await fetch(`${apiUrl}${path.replace(/^\//, "")}`, {
    method: "PATCH",
    headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err: any = new Error(res.statusText || "Request failed");
    err.response = { status: res.status, data: await res.json().catch(() => ({})) };
    throw err;
  }
  return res.json();
}

async function apiDelete(path: string): Promise<unknown> {
  const res = await fetch(`${apiUrl}${path.replace(/^\//, "")}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const err: any = new Error(res.statusText || "Request failed");
    err.response = { status: res.status };
    throw err;
  }
  return res.json().catch(() => ({}));
}

async function apiPostFormData<T>(path: string, formData: FormData): Promise<T> {
  const headers = getAuthHeaders();
  const res = await fetch(`${apiUrl}${path.replace(/^\//, "")}`, {
    method: "POST",
    headers: { ...headers } as Record<string, string>,
    body: formData,
  });
  if (!res.ok) {
    const err: any = new Error(res.statusText || "Request failed");
    err.response = { status: res.status, data: await res.json().catch(() => ({})) };
    throw err;
  }
  return res.json();
}

export const ACCOUNTING_ENDPOINTS = {
  CREATE_CYCLE: "accounting-cycles",
  GET_CYCLE: (id: string) => `accounting-cycles/${id}`,
  UPDATE_STATUS: (id: string) => `accounting-cycles/${id}/status`,
  UPDATE_CYCLE: (id: string) => `accounting-cycles/${id}`,
  GET_BY_ENGAGEMENT_ID: (engagementId: string) =>
    `accounting-cycles/engagement/${engagementId}`,
  QUICKBOOKS_AVAILABLE: (companyId: string) =>
    `companies/${companyId}/accounting/quickbooks/available`,
  TRANSACTIONS_BY_CYCLE: (cycleId: string) =>
    `accounting-cycles/${cycleId}/transactions`,
  TRANSACTION_BY_ID: (cycleId: string, id: string) =>
    `accounting-cycles/${cycleId}/transactions/${id}`,
  CREATE_TRANSACTION: (cycleId: string) =>
    `accounting-cycles/${cycleId}/transactions`,
  UPLOAD_INVOICE: (cycleId: string) =>
    `accounting-cycles/${cycleId}/transactions/upload-invoice`,
  UPDATE_TRANSACTION: (cycleId: string, id: string) =>
    `accounting-cycles/${cycleId}/transactions/${id}`,
  DELETE_TRANSACTION: (cycleId: string, id: string) =>
    `accounting-cycles/${cycleId}/transactions/${id}`,
  CHART_OF_ACCOUNTS: (companyId: string) =>
    `companies/${companyId}/accounting/chart-of-accounts`,
  IMPORT_SYNC_ALL: (companyId: string) =>
    `companies/${companyId}/accounting/import/sync/all`,
  MAP_INVOICE_TO_TRANSACTION: (companyId: string, qbInvoiceId: string) =>
    `companies/${companyId}/accounting/import/invoices/${qbInvoiceId}/map-to-transaction`,
  MAP_BILL_TO_TRANSACTION: (companyId: string, qbBillId: string) =>
    `companies/${companyId}/accounting/import/bills/${qbBillId}/map-to-transaction`,
};

export const QUICKBOOKS_ENDPOINTS = {
  INVOICES: (companyId: string) =>
    `companies/${companyId}/accounting/quickbooks/invoices`,
  CREATE_INVOICE: (companyId: string) =>
    `companies/${companyId}/accounting/quickbooks/invoices`,
  INVOICE_STATS: (companyId: string) =>
    `companies/${companyId}/accounting/quickbooks/invoices/stats`,
  BILLS: (companyId: string) =>
    `companies/${companyId}/accounting/quickbooks/bills`,
  CREATE_BILL: (companyId: string) =>
    `companies/${companyId}/accounting/quickbooks/bills`,
  JOURNAL: (companyId: string) =>
    `companies/${companyId}/accounting/quickbooks/journal`,
  JOURNAL_ITEMS: (companyId: string, id: string) =>
    `companies/${companyId}/accounting/quickbooks/journal/items/${id}`,
  RECURRING_EXPENSES: (companyId: string) =>
    `companies/${companyId}/accounting/quickbooks/recurring-expenses/user-expenses`,
  REPORTS_DASHBOARD: (companyId: string) =>
    `companies/${companyId}/accounting/quickbooks/reports/financial-dashboard-summary`,
  BANK_ACCOUNTS: (companyId: string) =>
    `companies/${companyId}/accounting/quickbooks/accounts/bank`,
  AGING_SYNCED: (companyId: string) =>
    `companies/${companyId}/accounting/quickbooks/aging/synced`,
  SYNC_HISTORY: (companyId: string) =>
    `companies/${companyId}/accounting/quickbooks/sync-history`,
  TAX_ENTITY: (companyId: string) =>
    `companies/${companyId}/accounting/quickbooks/tax-entity`,
  LINK_INVOICE_FILE: (companyId: string, qbInvoiceId: string) =>
    `companies/${companyId}/accounting/quickbooks/invoices/${qbInvoiceId}/link-file`,
};

export const accountingApi = {
  get: apiGet,
  post: apiPost,
  patch: apiPatch,
  delete: apiDelete,
  postFormData: apiPostFormData,
};
