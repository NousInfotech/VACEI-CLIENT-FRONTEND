"use client"

import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Upload, CheckCircle2, Phone, Calendar, LayoutDashboard, Library, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'
import DashboardCard from '../DashboardCard'
import PillTabs from '../shared/PillTabs'
import ServiceMessages from './ServiceMessages'
import { LibraryExplorer } from '../library/LibraryExplorer'

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
  const [activeTab, setActiveTab] = React.useState('dashboard')
  const statusInfo = statusConfig[status] || statusConfig.on_track
  const workflowInfo = workflowStatusConfig[workflowStatus] || workflowStatusConfig.in_progress

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'library', label: 'Library', icon: Library },
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
              <Badge className={cn("rounded-0 border px-3 py-1 text-xs font-medium uppercase tracking-widest bg-transparent", statusInfo.color)}>
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
        /* Compliance & Action Box */
        <div className="grid grid-cols-1 md:grid-cols-2 bg-white border border-gray-100 rounded-0 overflow-hidden shadow-sm">
          {/* Left Side: Status Info */}
          <div className="p-8 border-r border-gray-50 flex flex-col justify-center space-y-6">
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
              <Badge className={cn("rounded-0 border px-3 py-1 text-xs font-medium uppercase tracking-widest bg-transparent w-fit block", workflowInfo.color)}>
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
        </div>
      )}

      {activeTab === 'library' && (
        <LibraryExplorer />
      )}

      {activeTab === 'messages' && (
        <ServiceMessages serviceName={serviceName} messages={messages} />
      )}
    </div>
  )
}

export default EngagementSummary
