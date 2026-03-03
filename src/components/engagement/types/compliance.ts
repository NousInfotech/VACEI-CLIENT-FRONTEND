export type ComplianceStatus = 'filed' | 'upcoming' | 'due_today' | 'overdue'

export interface ComplianceItem {
  id: string
  complianceId: string
  engagementId: string
  title: string
  type: string
  dueDate: string
  status: ComplianceStatus
  authority: string
  description: string
  cta: string
  apiStatus: string
  serviceCategory: string
  /** When false, "Mark as done" is hidden (e.g. from Compliance Calendar API which has no status update) */
  canMarkDone?: boolean
}
