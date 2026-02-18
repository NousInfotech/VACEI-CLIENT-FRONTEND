"use client"

import React from 'react'
import { CheckCircle2, Circle, Clock, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'
import DashboardCard from '../DashboardCard'
import { Skeleton } from "@/components/ui/skeleton"
import { useMilestones } from "@/components/engagement/hooks/useMilestones"

const MilestoneIcon = ({ status }: { status: Milestone['status'] }) => {
  switch (status) {
    case 'completed':
      return (
        <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-200 ring-4 ring-emerald-50">
          <CheckCircle2 className="w-6 h-6" />
        </div>
      )
    case 'in_progress':
      return (
        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white shadow-lg shadow-blue-200 ring-4 ring-blue-50">
          <Clock className="w-6 h-6 animate-pulse" />
        </div>
      )
    default:
      return (
        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-300">
          <Circle className="w-5 h-5" />
        </div>
      )
  }
}

import { useEngagement } from './hooks/useEngagement'

type Milestone = {
  id?: string
  _id?: string
  title?: string
  description?: string
  date?: string
  timestamp?: string
  status?: string
}

function normalizeMilestoneStatus(input: unknown): 'completed' | 'in_progress' | 'pending' {
  const s = String(input || '').toLowerCase()
  if (['completed', 'done', 'closed', 'finalized'].includes(s)) return 'completed'
  if (['in_progress', 'in progress', 'active', 'working'].includes(s)) return 'in_progress'
  return 'pending'
}

function formatMilestoneDate(m: any): string {
  const raw = m?.date || m?.timestamp || m?.createdAt || m?.updatedAt
  if (!raw) return ''
  const d = new Date(raw)
  if (Number.isNaN(d.getTime())) return String(raw)
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

export const MilestonesTab = () => {
  const { engagement } = useEngagement()
  const engagementId =
    ((engagement as any)?._id as string | undefined) ||
    ((engagement as any)?.id as string | undefined) ||
    null
  const { milestones: displayMilestones, loading, error } = useMilestones(engagementId)

  if (loading) {
    return (
      <div className="mx-auto py-6">
        <div className="mb-5 text-center">
          <Skeleton className="h-9 w-64 mx-auto rounded-0" />
          <Skeleton className="h-4 w-72 mx-auto mt-3 rounded-0" />
        </div>
        <div className="space-y-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center w-full relative">
              <div className="absolute left-10 -translate-x-1/2">
                <Skeleton className="h-10 w-10 rounded-full" />
              </div>
              <div className="w-full pl-20 pr-4 md:pr-8">
                <DashboardCard className="p-6 rounded-0">
                  <Skeleton className="h-5 w-56 rounded-0" />
                  <Skeleton className="h-4 w-full mt-3 rounded-0" />
                  <Skeleton className="h-4 w-3/4 mt-2 rounded-0" />
                </DashboardCard>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-sm text-red-500 font-medium">Failed to load milestones.</p>
      </div>
    )
  }

  if (displayMilestones.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400">No milestones defined for this service.</p>
      </div>
    )
  }

  return (
    <div className="mx-auto py-3">
      <div className="mb-5 text-center">
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Project Milestones</h2>
        <p className="text-gray-500 mt-2 font-medium">Tracking our journey towards completion</p>
      </div>

      <div className="relative">
        {/* Vertical Line on the left */}
        <div className="absolute left-10 top-0 bottom-0 w-0.5 bg-gray-200 -translate-x-1/2 z-0" />

        <div className="space-y-12 relative z-10">
          {displayMilestones.map((milestone: any, index: number) => {
            const status = normalizeMilestoneStatus(milestone?.status)
            return (
              <div 
                key={milestone.id || milestone._id || index} 
                className="flex items-center w-full relative"
              >
                {/* Left aligned Icon */}
                <div className="absolute left-10 -translate-x-1/2 flex items-center justify-center">
                  <div className="transition-transform duration-300 hover:scale-110">
                    <MilestoneIcon status={status} />
                  </div>
                </div>

                {/* Content Card on the right side */}
                <div className="w-full pl-20 pr-4 md:pr-8">
                  <DashboardCard 
                    className={cn(
                      "p-6 transition-all duration-300 border-l-4",
                      status === 'completed' ? "border-l-emerald-500 bg-white shadow-sm" :
                      status === 'in_progress' ? "border-l-blue-500 bg-blue-50/30 shadow-md ring-1 ring-blue-100" :
                      "border-l-gray-200 bg-white/50 opacity-70 grayscale-[0.5]"
                    )}
                  >
                    <div className="space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <h4 className={cn(
                            "text-xl font-bold tracking-tight",
                            status === 'pending' ? "text-gray-500" : "text-gray-900"
                          )}>
                            {milestone.title || "Milestone"}
                          </h4>
                          {status === 'in_progress' && (
                            <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-600 text-[10px] font-bold uppercase tracking-wider">
                              Active
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-400">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{formatMilestoneDate(milestone)}</span>
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm font-medium leading-relaxed">
                        {milestone.description || ""}
                      </p>
                    </div>
                  </DashboardCard>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-12 p-8 bg-[#0f1729] rounded-2xl text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[60px] rounded-full" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <h3 className="text-2xl font-bold">Ready for the next step?</h3>
            <p className="text-white/60 font-medium">Complete your pending tasks to stay on schedule.</p>
          </div>
          <button className="px-8 py-3 bg-white text-[#0f1729] font-bold rounded-xl hover:bg-white/90 transition-colors shadow-xl">
            View Tasks
          </button>
        </div>
      </div>
    </div>
  )
}

export default MilestonesTab
