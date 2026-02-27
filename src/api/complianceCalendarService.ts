/**
 * Compliance Calendar API – client role implementation.
 * Base path: /compliance-calendar
 * CLIENT: list (GLOBAL + own companies), get by id, create GLOBAL only, update/delete own entries.
 */

const backendUrl =
  process.env.NEXT_PUBLIC_VACEI_BACKEND_URL?.replace(/\/?$/, "/") || "http://localhost:5000/api/v1/";

function getAuthHeaders(): Record<string, string> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse<T = unknown>(res: Response): Promise<T> {
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: "Something went wrong" }));
    const msg = (errorData as { message?: string }).message || res.statusText;
    throw new Error(msg);
  }
  const contentType = res.headers.get("content-type");
  if (contentType?.includes("application/json")) return res.json() as Promise<T>;
  return {} as T;
}

// ---------------------------------------------------------------------------
// Types (aligned with API docs)
// ---------------------------------------------------------------------------

export type CalendarType = "GLOBAL" | "COMPANY";
export type Frequency = "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY" | "CUSTOM";
export type CustomFrequencyUnit = "DAYS" | "WEEK" | "MONTH" | "YEAR";
export type ServiceCategory =
  | "ACCOUNTING"
  | "AUDITING"
  | "VAT"
  | "CFO"
  | "CSP"
  | "LEGAL"
  | "PAYROLL"
  | "PROJECTS_TRANSACTIONS"
  | "TECHNOLOGY"
  | "GRANTS_AND_INCENTIVES"
  | "INCORPORATION"
  | "MBR"
  | "TAX"
  | "CUSTOM";

export interface ComplianceCalendarCompany {
  id: string;
  name: string;
}

export interface ComplianceCalendarCustomServiceCycle {
  id: string;
  title: string;
}

export interface ComplianceCalendarCreatedBy {
  id: string;
  user?: { id: string; firstName: string; lastName: string };
}

export interface ComplianceCalendarEntry {
  id: string;
  type: CalendarType;
  companyId: string | null;
  title: string;
  description: string | null;
  startDate: string;
  dueDate: string;
  frequency: Frequency;
  customFrequencyPeriodUnit: CustomFrequencyUnit | null;
  customFrequencyPeriodValue: number | null;
  serviceCategory: ServiceCategory;
  customServiceCycleId: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  company?: ComplianceCalendarCompany | null;
  customServiceCycle?: ComplianceCalendarCustomServiceCycle | null;
  createdBy?: ComplianceCalendarCreatedBy | null;
}

export interface ListParams {
  type?: CalendarType;
  companyId?: string;
}

export interface CreatePayload {
  type: CalendarType;
  companyId?: string | null;
  title: string;
  description?: string | null;
  startDate: string;
  dueDate: string;
  frequency: Frequency;
  customFrequencyPeriodUnit?: CustomFrequencyUnit | null;
  customFrequencyPeriodValue?: number | null;
  serviceCategory: ServiceCategory;
  customServiceCycleId?: string | null;
}

export interface UpdatePayload {
  type?: CalendarType;
  companyId?: string | null;
  title?: string;
  description?: string | null;
  startDate?: string;
  dueDate?: string;
  frequency?: Frequency;
  customFrequencyPeriodUnit?: CustomFrequencyUnit | null;
  customFrequencyPeriodValue?: number | null;
  serviceCategory?: ServiceCategory;
  customServiceCycleId?: string | null;
}

interface ApiSuccess<T> {
  success: true;
  data?: T;
  message?: string;
  meta?: Record<string, unknown>;
}

interface ApiError {
  success: false;
  message: string;
  details?: unknown;
}

// ---------------------------------------------------------------------------
// API calls
// ---------------------------------------------------------------------------

const basePath = "compliance-calendar";

/**
 * List compliance calendars.
 * CLIENT: sees GLOBAL + COMPANY entries for companies they own.
 * Query: type (GLOBAL | COMPANY), companyId (UUID, optional).
 */
export async function listComplianceCalendars(
  params?: ListParams
): Promise<ComplianceCalendarEntry[]> {
  const url = new URL(`${backendUrl}${basePath}`);
  if (params?.type) url.searchParams.set("type", params.type);
  if (params?.companyId) url.searchParams.set("companyId", params.companyId);

  const res = await fetch(url.toString(), {
    method: "GET",
    headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
    credentials: "include",
  });

  const result = await handleResponse<ApiSuccess<ComplianceCalendarEntry[]>>(res);
  if (!result.success || !Array.isArray(result.data)) return [];
  return result.data;
}

/**
 * Get one compliance calendar by ID.
 * CLIENT: allowed for GLOBAL or COMPANY entries for companies they own.
 */
export async function getComplianceCalendarById(id: string): Promise<ComplianceCalendarEntry> {
  const res = await fetch(`${backendUrl}${basePath}/${encodeURIComponent(id)}`, {
    method: "GET",
    headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
    credentials: "include",
  });

  const result = await handleResponse<ApiSuccess<ComplianceCalendarEntry>>(res);
  if (!result.success || !result.data) throw new Error("Compliance calendar not found");
  return result.data;
}

/**
 * Create compliance calendar.
 * CLIENT: can create GLOBAL only (companyId null). COMPANY creation returns 400/403.
 */
export async function createComplianceCalendar(
  payload: CreatePayload
): Promise<ComplianceCalendarEntry> {
  const body: Record<string, unknown> = {
    type: payload.type,
    title: payload.title,
    description: payload.description ?? null,
    startDate: payload.startDate,
    dueDate: payload.dueDate,
    frequency: payload.frequency,
    serviceCategory: payload.serviceCategory,
  };
  if (payload.type === "COMPANY" && payload.companyId) body.companyId = payload.companyId;
  else if (payload.type === "GLOBAL") body.companyId = null;
  if (payload.frequency === "CUSTOM") {
    body.customFrequencyPeriodUnit = payload.customFrequencyPeriodUnit ?? null;
    body.customFrequencyPeriodValue = payload.customFrequencyPeriodValue ?? null;
  } else {
    body.customFrequencyPeriodUnit = null;
    body.customFrequencyPeriodValue = null;
  }
  if (payload.serviceCategory === "CUSTOM" && payload.customServiceCycleId)
    body.customServiceCycleId = payload.customServiceCycleId;
  else body.customServiceCycleId = null;

  const res = await fetch(`${backendUrl}${basePath}`, {
    method: "POST",
    headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });

  const result = await handleResponse<ApiSuccess<ComplianceCalendarEntry> | ApiError>(res);
  if (!result.success && "message" in result) throw new Error(result.message);
  const success = result as ApiSuccess<ComplianceCalendarEntry>;
  if (!success.data) throw new Error("Create failed");
  return success.data;
}

/**
 * Update compliance calendar (partial).
 * CLIENT: only the creator can update (API returns 403 otherwise).
 */
export async function updateComplianceCalendar(
  id: string,
  payload: UpdatePayload
): Promise<ComplianceCalendarEntry> {
  const res = await fetch(`${backendUrl}${basePath}/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  const result = await handleResponse<ApiSuccess<ComplianceCalendarEntry> | ApiError>(res);
  if (!result.success && "message" in result) throw new Error(result.message);
  const success = result as ApiSuccess<ComplianceCalendarEntry>;
  if (!success.data) throw new Error("Update failed");
  return success.data;
}

/**
 * Delete compliance calendar.
 * CLIENT: only the creator can delete (API returns 403 otherwise).
 */
export async function deleteComplianceCalendar(id: string): Promise<void> {
  const res = await fetch(`${backendUrl}${basePath}/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: { ...getAuthHeaders() },
    credentials: "include",
  });

  const result = await handleResponse<ApiSuccess<void> | ApiError>(res);
  if (!result.success && "message" in result) throw new Error(result.message);
}
