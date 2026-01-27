"use client"

import React, { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Upload, CheckCircle2, Phone, Calendar, LayoutDashboard, Library, MessageSquare, ClipboardList, Flag, History } from 'lucide-react'
import { cn } from '@/lib/utils'
import DashboardCard from '../DashboardCard'
import PillTabs from '../shared/PillTabs'
import ServiceMessages from './ServiceMessages'
import { LibraryExplorer } from '../library/LibraryExplorer'
import DocumentRequestsTab from './DocumentRequestsTab'
import MilestonesTab from './MilestonesTab'
import ComplianceCalendarTab from './ComplianceCalendarTab'
import StatCard from "@/components/StatCard";
import CashFlowChart from "@/components/CashFlowChart";
import PLSummaryChart from "@/components/PLSummaryChart";
import { fetchDashboardSummary, ProcessedDashboardStat } from "@/api/financialReportsApi";
import { HugeiconsIcon } from '@hugeicons/react';
import { Alert02Icon } from "@hugeicons/core-free-icons";
import { useSearchParams } from 'next/navigation';

export type EngagementStatus = 'on_track' | 'due_soon' | 'action_required' | 'overdue'
export type WorkflowStatus = 'waiting' | 'in_progress' | 'submitted' | 'completed'

export interface EngagementAction {
  type: 'upload' | 'confirm' | 'schedule'
  label: string
  onClick?: () => void
}

interface EngagementSummaryProps {
  serviceName: string
  description: string
  status: EngagementStatus
  cycle: string
  workflowStatus: WorkflowStatus
  neededFromUser?: string
  actions?: EngagementAction[]
  messages?: any[]
  className?: string
}

const statusConfig: Record<EngagementStatus, { label: string; color: string }> = {
  on_track: { 
    label: 'On track', 
    color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  },
  due_soon: { 
    label: 'Due soon', 
    color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  },
  action_required: { 
    label: 'Action required', 
    color: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  },
  overdue: { 
    label: 'Overdue', 
    color: 'bg-red-500/10 text-red-500 border-red-500/20',
  },
}

const workflowStatusConfig: Record<WorkflowStatus, { label: string; color: string }> = {
  waiting: { label: 'Waiting on you', color: 'text-orange-500 border-orange-500/20' },
  in_progress: { label: 'In progress', color: 'text-blue-500 border-blue-500/20' },
  submitted: { label: 'Submitted', color: 'text-purple-500 border-purple-500/20' },
  completed: { label: 'Completed', color: 'text-green-500 border-green-500/20' },
}

export const EngagementSummary: React.FC<EngagementSummaryProps> = ({
  serviceName,
  description,
  status,
  cycle,
  workflowStatus,
  neededFromUser,
  actions = [],
  messages = [],
  className
}) => {
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = React.useState('dashboard')
  const [stats, setStats] = useState<ProcessedDashboardStat[]>([]);
  const [loading, setLoading] = useState(false);
  
  const statusInfo = statusConfig[status] || statusConfig.on_track
  const workflowInfo = workflowStatusConfig[workflowStatus] || workflowStatusConfig.in_progress

  // Handle deep-linking from query params
  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab) {
      setActiveTab(tab)
    }
  }, [searchParams])

  useEffect(() => {
    const loadDashboardData = async () => {
      // Only fetch stats for Accounting & Bookkeeping
      if (serviceName !== 'Accounting & Bookkeeping') return;
      
      setLoading(true);
      try {
        const fetchedStats = await fetchDashboardSummary();
        const filteredStats = fetchedStats.stats.filter(
          (stat: { title: string; }) => stat.title !== "Revenue YTD" && stat.title !== "Net income YTD"
        );
        setStats(filteredStats);
      } catch (error) {
        console.error("Failed to load dashboard summary:", error);
        setStats([]);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, [serviceName]);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'document_requests', label: 'Document Requests', icon: ClipboardList },
    { id: 'milestones', label: 'Milestones', icon: Flag },
    { id: 'library', label: 'Library', icon: Library },
    { id: 'compliance_calendar', label: 'Compliance Calendar', icon: Calendar },
    // { id: 'service_history', label: 'Service History', icon: History },
    { id: 'messages', label: 'Message', icon: MessageSquare },
  ]

  return (
    <div className={cn("space-y-6", className)}>
      {/* Service Header */}
      <DashboardCard className="p-8 bg-[#0f1729] border-white/10 overflow-hidden relative rounded-0">
        {/* Subtle Decorative Gradient */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-4">
              <h2 className="text-3xl font-medium text-white tracking-tight">{serviceName}</h2>
              <Badge className={cn("rounded-0 border px-3 py-1 text-xs font-bold uppercase tracking-widest bg-transparent", statusInfo.color)}>
                {statusInfo.label}
              </Badge>
            </div>
            <p className="text-white/60 text-sm max-w-2xl leading-relaxed">{description}</p>
          </div>
        </div>
      </DashboardCard>

      <PillTabs 
        tabs={tabs} 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />

      {activeTab === 'dashboard' && (
        <div className="space-y-8">
          {/* Compliance & Action Box */}
          <DashboardCard className="grid grid-cols-1 md:grid-cols-2 rounded-0 overflow-hidden p-0">
            {/* Left Side: Status Info */}
            <div className="p-8 border-r border-gray-100/50 flex flex-col justify-center space-y-6">
              <div className="space-y-2">
                <p className="text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">Current cycle/period</p>
                <div className="flex items-center gap-3 text-gray-900">
                  <div className="w-10 h-10 rounded-0 bg-primary/5 flex items-center justify-center border border-primary/10">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-lg font-medium">{cycle}</span>
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">Current status</p>
                <Badge className={cn("rounded-0 border px-3 py-1 text-xs font-semibold uppercase tracking-widest bg-transparent w-fit block", workflowInfo.color)}>
                  {workflowInfo.label}
                </Badge>
              </div>
            </div>

            {/* Right Side: Action Info */}
            <div className="p-8 bg-gray-50/30 flex flex-col justify-between">
              <div className="space-y-3">
                <p className="text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">What we need from you</p>
                {neededFromUser ? (
                  <div className="flex gap-3">
                    <div className="w-1.5 h-auto bg-primary/20 rounded-full" />
                    <p className="text-gray-900 font-medium leading-tight text-lg">{neededFromUser}</p>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 text-emerald-600 bg-emerald-50 p-4 border border-emerald-100/50">
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                    <p className="font-medium">Nothing required from you right now.</p>
                  </div>
                )}
              </div>

              {actions.length > 0 && (
                <div className="flex flex-wrap gap-3 mt-8">
                  {actions.map((action, index) => (
                    <Button 
                      key={index}
                      variant={action.type === 'upload' ? 'default' : 'outline'}
                      className={cn(
                        "h-12 px-6 rounded-0 font-medium uppercase tracking-widest text-xs gap-3 transition-all",
                        action.type === 'upload' 
                          ? "bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20" 
                          : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                      )}
                      onClick={action.onClick}
                    >
                      {action.type === 'upload' && <Upload className="w-4 h-4" />}
                      {action.type === 'confirm' && <CheckCircle2 className="w-4 h-4" />}
                      {action.type === 'schedule' && <Phone className="w-4 h-4" />}
                      {action.label}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </DashboardCard>

          {/* Financial Statistics Section - Only for Accounting & Bookkeeping */}
          {serviceName === 'Accounting & Bookkeeping' && (
            <div className="space-y-8">
              {/* Financial Statistics */}
              <DashboardCard className="px-5 py-6">
                <div className="space-y-6">
                  <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-3">
                      <div className="w-1 h-6 bg-gray-900 rounded-full" />
                      <h3 className="text-xl font-medium tracking-tight">Financial Statistics</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                      <p className="text-[10px] font-medium uppercase tracking-[0.2em]">Real-time Updates</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    {loading ? (
                      Array(3).fill(null).map((_, idx) => (
                        <DashboardCard key={idx} hover={false} className="h-48 bg-white/50 animate-pulse border-white/30" />
                      ))
                    ) : stats.length > 0 ? (
                      stats.map((stat) => <StatCard key={stat.title} {...stat} />)
                    ) : (
                      <DashboardCard hover={false} className="col-span-full bg-white/40 border border-dashed border-gray-200 py-16 flex flex-col items-center justify-center text-center relative overflow-hidden backdrop-blur-sm">
                        <div className="absolute inset-0 pointer-events-none" />
                        <div className="relative z-10">
                          <div className="w-20 h-20 rounded-3xl bg-white shadow-xl flex items-center justify-center mb-6 mx-auto transform -rotate-6">
                            <HugeiconsIcon icon={Alert02Icon} className="w-10 h-10 text-gray-300" />
                          </div>
                          <h4 className="text-xl font-bold text-gray-900 mb-2">Awaiting Analytic Data</h4>
                          <p className="text-sm text-gray-500 max-w-sm mx-auto font-medium leading-relaxed">
                            Your financial insights are currently being synchronized.
                          </p>
                        </div>
                      </DashboardCard>
                    )}
                  </div>
                </div>
              </DashboardCard>

              {/* Charts */}
              <div className="flex flex-col gap-4">
                <CashFlowChart />
                <PLSummaryChart />
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'library' && (
        <LibraryExplorer />
      )}

      {activeTab === 'document_requests' && (
        <DocumentRequestsTab />
      )}

      {activeTab === 'milestones' && (
        <MilestonesTab />
      )}

      {activeTab === 'compliance_calendar' && (
        <ComplianceCalendarTab serviceName={serviceName} />
      )}

      {activeTab === 'service_history' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-gray-900">Engagement History</h3>
              <p className="text-sm text-gray-500">Chronological record of all significant updates and interactions.</p>
            </div>
          </div>
          <div className="border border-gray-100 bg-white">
            <div className="divide-y divide-gray-50">
              {[
                { date: '2026-01-25', action: 'VAT Return Filed', user: 'Sarah Jones', status: 'Success' },
                { date: '2026-01-22', action: 'Document Request Completed', user: 'Client (You)', status: 'Success' },
                { date: '2026-01-18', action: 'Period Review Started', user: 'Sarah Jones', status: 'In Progress' },
                { date: '2026-01-15', action: 'System Audit Check', user: 'VACEI System', status: 'Automated' },
              ].map((log, i) => (
                <div key={i} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="text-xs font-bold text-gray-400 w-24">{log.date}</div>
                    <div>
                      <div className="text-sm font-bold text-gray-900">{log.action}</div>
                      <div className="text-[10px] text-gray-500 font-medium">By {log.user}</div>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-widest border-gray-100 text-gray-400">
                    {log.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'messages' && (
        <ServiceMessages serviceName={serviceName} messages={messages} />
      )}
    </div>
  )
}

export default EngagementSummary
