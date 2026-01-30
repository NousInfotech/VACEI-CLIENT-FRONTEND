"use client"

import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Calendar, CheckCircle2, Clock, AlertCircle, ExternalLink, FileText, List, Calendar as CalendarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import ParentSchedule from "@/app/dashboard/schedule/page";
import PillTabs from '../shared/PillTabs';
import { Button } from '../ui/button'

export type ComplianceStatus = 'filed' | 'upcoming' | 'due_today' | 'overdue'

interface ComplianceItem {
  id: string
  title: string
  type: string
  dueDate: string
  status: ComplianceStatus
  authority: string
  description: string
}

const statusConfig: Record<ComplianceStatus, { label: string; color: string; icon: any; tone: "success" | "info" | "warning" | "danger" }> = {
  filed: { 
    label: 'Filed', 
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
        "cursor-pointer transition-all hover:shadow-md rounded-0 border p-4",
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

const MOCK_COMPLIANCE_DATA: Record<string, ComplianceItem[]> = {
  // ... (keeping existing mock data)
  'Accounting & Bookkeeping': [
    {
      id: 'acc-1',
      title: 'Monthly Management Accounts',
      type: 'Financial Reporting',
      dueDate: '2026-02-15',
      status: 'upcoming',
      authority: 'Internal/Bank',
      description: 'Monthly preparation of P&L and Balance Sheet for internal review and bank compliance.'
    },
    {
      id: 'acc-2',
      title: 'Annual Return (Form 1)',
      type: 'Statutory Filing',
      dueDate: '2026-01-20',
      status: 'filed',
      authority: 'MBR',
      description: 'Submission of company annual return including current shareholder and director details.'
    },
    {
      id: 'acc-3',
      title: 'Financial Statements 2025',
      type: 'Statutory Audit',
      dueDate: '2026-09-30',
      status: 'upcoming',
      authority: 'MBR / Tax Authority',
      description: 'Audit and submission of the full set of financial statements for the previous fiscal year.'
    }
  ],
  'Audit': [
    {
      id: 'aud-1',
      title: 'Statutory Audit 2025',
      type: 'Audit Engagement',
      dueDate: '2026-09-30',
      status: 'upcoming',
      authority: 'Regulated Markets',
      description: 'Independent examination of financial records to ensure compliance and accuracy.'
    },
    {
      id: 'aud-2',
      title: 'Tax Computation Approval',
      type: 'Tax Compliance',
      dueDate: '2026-03-31',
      status: 'upcoming',
      authority: 'Commissioner por Revenue',
      description: 'Review and sign-off on the tax computations based on audited figures.'
    }
  ],
  VAT: [
    {
      id: 'vat-1',
      title: 'VAT Return Q4 2025',
      type: 'Quarterly Filing',
      dueDate: '2026-02-15',
      status: 'due_today',
      authority: 'VAT Department',
      description: 'Quarterly submission of VAT input and output totals for the period ending Dec 2025.'
    },
    {
      id: 'vat-2',
      title: 'Recapitulative Statement',
      type: 'EU Reporting',
      dueDate: '2026-01-15',
      status: 'filed',
      authority: 'VAT Department',
      description: 'Declaration of intra-community supplies and acquisitions for the month of December.'
    }
  ],
  Tax: [
    {
      id: 'tax-1',
      title: 'Corporate Tax Return 2025',
      type: 'Annual Filing',
      dueDate: '2026-09-30',
      status: 'upcoming',
      authority: 'Commissioner for Revenue',
      description: 'Annual corporate tax return and computation for FY 2025.'
    }
  ],
  'Corporate Services (CSP)': [
    {
      id: 'csp-1',
      title: 'Beneficial Ownership Register',
      type: 'Statutory Update',
      dueDate: '2026-01-31',
      status: 'upcoming',
      authority: 'MBR',
      description: 'Annual verification and update of the Register of Beneficial Owners.'
    },
    {
      id: 'csp-2',
      title: 'Resolution for Dividend',
      type: 'Corporate Governance',
      dueDate: '2026-02-28',
      status: 'upcoming',
      authority: 'Internal',
      description: 'Drafting and filing of shareholder resolutions for the approved dividend distribution.'
    }
  ],
  'Payroll': [
    {
      id: 'pay-1',
      title: 'FS5 Submission - January',
      type: 'Monthly Tax',
      dueDate: '2026-02-28',
      status: 'upcoming',
      authority: 'Commissioner for Revenue',
      description: 'Monthly submission of social security and tax contributions for employees.'
    },
    {
      id: 'pay-2',
      title: 'FS7 Annual Summary',
      type: 'Annual Reconciliation',
      dueDate: '2026-01-31',
      status: 'due_today',
      authority: 'Commissioner for Revenue',
      description: 'Annual reconciliation of all monthly FS5 submissions for the 2025 calendar year.'
    }
  ]
}

interface ComplianceCalendarTabProps {
  serviceName: string
}

import { useEngagement } from './hooks/useEngagement'

const ComplianceCalendarTab: React.FC<ComplianceCalendarTabProps> = ({ serviceName }) => {
  const [viewMode, setViewMode] = React.useState<'list' | 'month'>('list')
  const [activeFilter, setActiveFilter] = React.useState<ComplianceStatus | 'all'>('all')
  const { engagement } = useEngagement()
  
  // Use engagement context data if available (comes from service-specific mocks), otherwise fallback to local MOCK_COMPLIANCE_DATA
  const allItems = (engagement as any)?.complianceItems || MOCK_COMPLIANCE_DATA[serviceName] || []
  
  const filteredItems = activeFilter === 'all' 
    ? allItems 
    : allItems.filter((item: ComplianceItem) => item.status === activeFilter)

  const counts = {
    overdue: allItems.filter((i: ComplianceItem) => i.status === 'overdue').length,
    due_today: allItems.filter((i: ComplianceItem) => i.status === 'due_today').length,
    upcoming: allItems.filter((i: ComplianceItem) => i.status === 'upcoming').length,
    filed: allItems.filter((i: ComplianceItem) => i.status === 'filed').length,
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
          label="Filed"
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
                    className="group bg-white border border-gray-100 p-6 flex flex-col md:flex-row md:items-center gap-6 hover:shadow-lg hover:border-primary/20 transition-all duration-300 relative overflow-hidden"
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
                      <Button>
                        Action Required
                      </Button>
                      <button className="h-10 w-10 border border-gray-200 flex items-center justify-center text-gray-400 hover:text-primary hover:border-primary/30 transition-all">
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        ) : (
          <div className="bg-white border border-gray-100 p-6 overflow-hidden">
            <ParentSchedule />
          </div>
        )}
      </div>
    </div>
  )
}

export default ComplianceCalendarTab
