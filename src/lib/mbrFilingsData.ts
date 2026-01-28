/**
 * MBR Filings data model and mock data.
 * Used by MBR Filings service (Overview + Filings tab).
 */

export type MBRFilingStatus =
  | "waiting_on_you"
  | "in_progress"
  | "submitted"
  | "completed";

export type MBRServiceStatus =
  | "on_track"
  | "due_soon"
  | "action_required"
  | "overdue";

export interface MBRFilingDocument {
  id: string;
  name: string;
  url?: string;
  type?: string;
}

export interface MBRFiling {
  id: string;
  filing_type: string;
  reference_period: string;
  due_date: string;
  filing_status: MBRFilingStatus;
  service_status: MBRServiceStatus;
  submitted_at: string | null;
  documents: MBRFilingDocument[];
}

export const MBR_FILINGS_MOCK: MBRFiling[] = [
  {
    id: "mbr-ar-2026",
    filing_type: "Annual Return",
    reference_period: "2026",
    due_date: "2026-06-30",
    filing_status: "waiting_on_you",
    service_status: "action_required",
    submitted_at: null,
    documents: [],
  },
  {
    id: "mbr-ar-2025",
    filing_type: "Annual Return",
    reference_period: "2025",
    due_date: "2025-12-31",
    filing_status: "submitted",
    service_status: "on_track",
    submitted_at: "2025-12-20",
    documents: [
      { id: "d1", name: "Annual Return 2025", type: "return", url: "#" },
      { id: "d2", name: "Receipt AR 2025", type: "receipt", url: "#" },
    ],
  },
  {
    id: "mbr-bo-2025",
    filing_type: "BO Update",
    reference_period: "2025",
    due_date: "2025-11-15",
    filing_status: "completed",
    service_status: "on_track",
    submitted_at: "2025-11-10",
    documents: [
      { id: "d3", name: "BO Declaration", type: "declaration", url: "#" },
    ],
  },
  {
    id: "mbr-cn-2025",
    filing_type: "Change Notice",
    reference_period: "Q4 2025",
    due_date: "2025-10-01",
    filing_status: "in_progress",
    service_status: "due_soon",
    submitted_at: null,
    documents: [],
  },
];

/** Get the "active" filing: next due or one marked current, or first in list */
export function getActiveMBRFiling(
  filings: MBRFiling[],
  currentFilingId: string | null
): MBRFiling | undefined {
  if (currentFilingId) {
    const byId = filings.find((f) => f.id === currentFilingId);
    if (byId) return byId;
  }
  const nextDue = filings.find(
    (f) =>
      (f.filing_status === "waiting_on_you" || f.filing_status === "in_progress") &&
      !f.submitted_at
  );
  return nextDue ?? filings[0];
}

/** Derive service status for header pill from filings */
export function getMBRServiceStatusFromFilings(
  filings: MBRFiling[]
): "on_track" | "due_soon" | "action_required" | "overdue" {
  const now = new Date();
  const hasOverdue = filings.some(
    (f) =>
      !f.submitted_at &&
      f.due_date &&
      new Date(f.due_date) < now &&
      (f.filing_status === "waiting_on_you" || f.filing_status === "in_progress")
  );
  if (hasOverdue) return "overdue";
  const hasWaiting = filings.some((f) => f.filing_status === "waiting_on_you");
  if (hasWaiting) return "action_required";
  const hasDueSoon = filings.some(
    (f) =>
      !f.submitted_at &&
      f.due_date &&
      new Date(f.due_date) >= now &&
      new Date(f.due_date) <= new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
  );
  if (hasDueSoon) return "due_soon";
  return "on_track";
}
