"use client"

import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Calendar, CheckCircle2, Clock, AlertCircle, List, Calendar as CalendarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import ComplianceMonthView from "./ComplianceMonthView";
import PillTabs from '../shared/PillTabs'
import { Skeleton } from '@/components/ui/skeleton'
import { useEngagement } from './hooks/useEngagement'
import { useCompliances } from './hooks/useCompliances'
import { updateComplianceStatus, type EngagementCompliance } from '@/api/auditService'
import { Button } from '@/components/ui/button'

export type ComplianceStatus = 'filed' | 'upcoming' | 'due_today' | 'overdue'

interface ComplianceItem {
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

function mapApiToComplianceItem(c: EngagementCompliance & { _fromComplianceCalendar?: boolean }): ComplianceItem {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const deadline = new Date(c.deadline)
  deadline.setHours(0, 0, 0, 0)
  const isToday = today.getTime() === deadline.getTime()
  const isPast = deadline.getTime() < today.getTime()

  let status: ComplianceStatus = 'upcoming'
  if (c.status === 'COMPLETED' || c.status === 'ACTION_TAKEN') status = 'filed'
  else if (c.status === 'OVERDUE' || isPast) status = 'overdue'
  else if (isToday) status = 'due_today'
  else status = 'upcoming'

  const authority = c.customServiceCycle?.title || c.service || 'Internal'
  const canMarkDone = c._fromComplianceCalendar === true ? false : true
  return {
    id: c.id,
    complianceId: c.id,
    engagementId: c.engagementId,
    title: c.title,
    type: c.type || c.service,
    dueDate: c.deadline,
    status,
    authority,
    description: c.description || '',
    cta: c.cta || 'Mark as done',
    apiStatus: c.status,
    serviceCategory: c.service || '',
    canMarkDone,
  }
}

const statusConfig: Record<ComplianceStatus, { label: string; color: string; icon: any; tone: "success" | "info" | "warning" | "danger" }> = {
  filed: {
    label: 'Completed',
    color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    icon: CheckCircle2,
    tone: 'success'
  },
  upcoming: {
    label: 'Upcoming',
    color: 'bg-blue-50 text-blue-600 border-blue-100',
    icon: Clock,
    tone: 'info'
  },
  due_today: {
    label: 'Due Today',
    color: 'bg-orange-50 text-orange-600 border-orange-100',
    icon: AlertCircle,
    tone: 'warning'
  },
  overdue: {
    label: 'Overdue',
    color: 'bg-red-50 text-red-600 border-red-100',
    icon: AlertCircle,
    tone: 'danger'
  },
}

// Summary Card Component
function SummaryCard({
  label,
  value,
  tone,
  onClick,
  isActive,
}: {
  label: string;
  value: number;
  tone: "danger" | "warning" | "info" | "success";
  onClick: () => void;
  isActive: boolean;
}) {
  const toneClasses = {
    danger: {
      border: "border-red-500/30",
      bg: "bg-red-50/50",
      text: "text-red-500",
    },
    warning: {
      border: "border-orange-500/30",
      bg: "bg-orange-50/50",
      text: "text-orange-500",
    },
    info: {
      border: "border-blue-500/30",
      bg: "bg-blue-50/50",
      text: "text-blue-500",
    },
    success: {
      border: "border-emerald-500/30",
      bg: "bg-emerald-50/50",
      text: "text-emerald-500",
    },
  };

  const classes = toneClasses[tone];

  return (
    <div
      className={cn(
        "cursor-pointer transition-all rounded-0 border p-4",
        classes.border,
        classes.bg,
        isActive ? "ring-2 ring-primary" : "bg-white"
      )}
      onClick={onClick}
    >
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{label}</p>
      <p className={cn("text-2xl font-bold tabular-nums", classes.text)}>{value}</p>
    </div>
  );
}

interface ComplianceCalendarTabProps {
  serviceName: string;
  refreshKey?: number;
}

const ComplianceCalendarTab: React.FC<ComplianceCalendarTabProps> = ({ serviceName, refreshKey }) => {
  const [viewMode, setViewMode] = React.useState<'list' | 'month'>('list')
  const [activeFilter, setActiveFilter] = React.useState<ComplianceStatus | 'all'>('all')
  const { engagement } = useEngagement()
  const engagementId =
    ((engagement as any)?._id as string | undefined) ||
    ((engagement as any)?.id as string | undefined) ||
    null
  const companyId = (engagement as any)?.companyId ?? (engagement as any)?.company?.id ?? null;
  const { compliances, loading, error, refetch } = useCompliances(engagementId, companyId)
  const [updatingId, setUpdatingId] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (refreshKey !== undefined) {
      refetch();
    }
  }, [refreshKey, refetch]);

  const SERVICE_CATEGORY_MAP: Record<string, string> = {
    "Accounting & Bookkeeping": "ACCOUNTING",
    "Accounting": "ACCOUNTING",
    "Statutory Audit": "AUDITING",
    "Audit": "AUDITING",
    "VAT": "VAT",
    "Tax": "TAX",
    "Payroll": "PAYROLL",
    "Corporate Services": "CSP",
    "CFO Services": "CFO",
    "MBR Filings": "MBR",
    "MBR Filing": "MBR",
    "Filings": "MBR",
    "MBR": "MBR",
    "Incorporation": "INCORPORATION",
    "Business Plans": "CUSTOM",
    "Liquidation": "CUSTOM",
    "Legal": "LEGAL",
    "Technology": "TECHNOLOGY"
  };

  const allItems: ComplianceItem[] = React.useMemo(() => {
    let mapped = compliances.map(mapApiToComplianceItem)
    const expectedCategory = SERVICE_CATEGORY_MAP[serviceName]
    if (expectedCategory) {
      mapped = mapped.filter((c: ComplianceItem) => {
        if (expectedCategory === 'CUSTOM') return true;
        const incomingService = String(c.serviceCategory || '').toUpperCase();
        return incomingService === expectedCategory.toUpperCase();
      })
    }
    return mapped
  }, [compliances, serviceName])

  const filteredItems = activeFilter === 'all'
    ? allItems
    : allItems.filter((item: ComplianceItem) => item.status === activeFilter)

  const canMarkActionTaken = (item: ComplianceItem) =>
    item.canMarkDone !== false &&
    ['ACTION_REQUIRED', 'OVERDUE', 'PENDING', 'IN_PROGRESS'].includes(item.apiStatus)

  const handleMarkActionTaken = async (item: ComplianceItem) => {
    if (!engagementId || !canMarkActionTaken(item)) return
    setUpdatingId(item.complianceId)
    try {
      await updateComplianceStatus(item.engagementId, item.complianceId, { status: 'ACTION_TAKEN' })
      await refetch()
    } catch (e) {
      console.error('Failed to update compliance status:', e)
    } finally {
      setUpdatingId(null)
    }
  }

  const counts = {
    overdue: allItems.filter((i: ComplianceItem) => i.status === 'overdue').length,
    due_today: allItems.filter((i: ComplianceItem) => i.status === 'due_today').length,
    upcoming: allItems.filter((i: ComplianceItem) => i.status === 'upcoming').length,
    filed: allItems.filter((i: ComplianceItem) => i.status === 'filed').length,
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-0" />
          ))}
        </div>
        <div className="space-y-4">
          <Skeleton className="h-8 w-64 rounded-0" />
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-0" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-20 space-y-3">
        <p className="text-sm text-red-500 font-medium">Failed to load compliance calendar.</p>
        <p className="text-xs text-muted-foreground">
          {error.includes("Route not found") || error.includes("not found")
            ? "This feature is not yet available. Please check back later."
            : error}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Summary Cards Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard
          label="Overdue"
          value={counts.overdue}
          tone="danger"
          onClick={() => setActiveFilter(activeFilter === 'overdue' ? 'all' : 'overdue')}
          isActive={activeFilter === 'overdue'}
        />
        <SummaryCard
          label="Due Today"
          value={counts.due_today}
          tone="warning"
          onClick={() => setActiveFilter(activeFilter === 'due_today' ? 'all' : 'due_today')}
          isActive={activeFilter === 'due_today'}
        />
        <SummaryCard
          label="Upcoming"
          value={counts.upcoming}
          tone="info"
          onClick={() => setActiveFilter(activeFilter === 'upcoming' ? 'all' : 'upcoming')}
          isActive={activeFilter === 'upcoming'}
        />
        <SummaryCard
          label="Completed"
          value={counts.filed}
          tone="success"
          onClick={() => setActiveFilter(activeFilter === 'filed' ? 'all' : 'filed')}
          isActive={activeFilter === 'filed'}
        />
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-gray-900 tracking-tight">
              {viewMode === 'list' ? 'Compliance Deadlines' : 'Compliance Calendar'}
            </h3>
            <p className="text-sm text-gray-500">
              {viewMode === 'list'
                ? 'Track and manage your statutory obligations.'
                : 'Interactive timeline of your filing deadlines.'}
            </p>
          </div>
          {/* View Toggle */}
          <div className="w-fit">
            <PillTabs
              tabs={[
                { id: 'list', label: 'List view', icon: List },
                { id: 'month', label: 'Month view', icon: CalendarIcon }
              ]}
              activeTab={viewMode}
              onTabChange={(id) => setViewMode(id as 'list' | 'month')}
              className="bg-gray-50 border border-gray-100"
            />
          </div>
        </div>

        {viewMode === 'list' ? (
          <div className="grid gap-4">
            {filteredItems.length === 0 ? (
              <div className="text-center py-20 border border-dashed border-gray-200 bg-gray-50/30">
                <p className="text-sm text-gray-400 font-medium tracking-wide bg-white px-4 py-2 border border-gray-100 inline-block">
                  No items found for the current filter.
                </p>
              </div>
            ) : (
              filteredItems.map((item: ComplianceItem) => {
                const config = statusConfig[item.status] || statusConfig.upcoming
                const StatusIcon = config.icon || Clock

                return (
                  <div
                    key={item.id}
                    className="group bg-white border border-gray-100 p-6 flex flex-col md:flex-row md:items-center gap-6 relative overflow-hidden"
                  >
                    <div className={cn(
                      "absolute left-0 top-0 bottom-0 w-1",
                      item.status === 'filed' && "bg-emerald-500",
                      item.status === 'upcoming' && "bg-blue-500",
                      item.status === 'due_today' && "bg-orange-500",
                      item.status === 'overdue' && "bg-red-500"
                    )} />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge className={cn("rounded-0 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest border", config.color)}>
                          <StatusIcon className="w-3 h-3 mr-1.5" />
                          {config.label}
                        </Badge>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{item.type}</span>
                      </div>

                      <h4 className="text-lg font-bold text-gray-900 group-hover:text-primary transition-colors tracking-tight mb-1">
                        {item.title}
                      </h4>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          <span>Due: <span className="text-gray-900 font-semibold">{new Date(item.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span></span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                          <span>Authority: <span className="text-gray-900 font-semibold">{item.authority}</span></span>
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center md:justify-end gap-3 mt-4 md:mt-0">
                      {canMarkActionTaken(item) ? (
                        <Button
                          size="sm"
                          onClick={() => handleMarkActionTaken(item)}
                          disabled={updatingId === item.complianceId}
                        >
                          {updatingId === item.complianceId ? 'Updating...' : item.cta}
                        </Button>
                      ) : (
                        <Badge variant="outline" className="text-xs font-medium text-gray-500 border-gray-200">
                          {item.apiStatus === 'ACTION_TAKEN' ? 'Action taken' : 'Completed'}
                        </Badge>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        ) : (
          <div className="bg-white border border-gray-100 p-6 overflow-hidden">
            <ComplianceMonthView items={allItems} />
          </div>
        )}
      </div>
    </div>
  )
}

export default ComplianceCalendarTab
