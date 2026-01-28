/**
 * VAT periods data for VAT service (Overview + VAT Periods tab).
 */

export type VATPeriodStatus =
  | "waiting_on_you"
  | "in_progress"
  | "submitted"
  | "completed";

export type VATServiceStatus =
  | "on_track"
  | "due_soon"
  | "action_required"
  | "overdue";

export interface VATPeriodDocument {
  id: string;
  name: string;
  url?: string;
}

export interface VATPeriod {
  id: string;
  period: string;
  due_date: string;
  filing_status: VATPeriodStatus;
  service_status: VATServiceStatus;
  submitted_at: string | null;
  documents: VATPeriodDocument[];
}

export const VAT_PERIODS_MOCK: VATPeriod[] = [
  {
    id: "vat-q1-2026",
    period: "Q1 2026",
    due_date: "2026-04-30",
    filing_status: "waiting_on_you",
    service_status: "action_required",
    submitted_at: null,
    documents: [],
  },
  {
    id: "vat-q4-2025",
    period: "Q4 2025",
    due_date: "2026-01-31",
    filing_status: "submitted",
    service_status: "on_track",
    submitted_at: "2026-01-20",
    documents: [
      { id: "d1", name: "VAT Return Q4 2025", url: "#" },
      { id: "d2", name: "Payment receipt", url: "#" },
    ],
  },
  {
    id: "vat-q3-2025",
    period: "Q3 2025",
    due_date: "2025-10-31",
    filing_status: "completed",
    service_status: "on_track",
    submitted_at: "2025-10-15",
    documents: [{ id: "d3", name: "VAT Return Q3 2025", url: "#" }],
  },
  {
    id: "vat-q2-2025",
    period: "Q2 2025",
    due_date: "2025-07-31",
    filing_status: "completed",
    service_status: "on_track",
    submitted_at: "2025-07-12",
    documents: [],
  },
];

export function getActiveVATPeriod(
  periods: VATPeriod[],
  currentPeriodId: string | null,
): VATPeriod | undefined {
  if (currentPeriodId) {
    const byId = periods.find((p) => p.id === currentPeriodId);
    if (byId) return byId;
  }
  const nextDue = periods.find(
    (p) =>
      (p.filing_status === "waiting_on_you" ||
        p.filing_status === "in_progress") &&
      !p.submitted_at,
  );
  return nextDue ?? periods[0];
}
