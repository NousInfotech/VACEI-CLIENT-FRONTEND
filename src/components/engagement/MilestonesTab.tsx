"use client"

import React from 'react'
import { CheckCircle2, Circle, Clock, Flag, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'
import DashboardCard from '../DashboardCard'

interface Milestone {
  id: string
  title: string
  description: string
  date: string
  status: 'completed' | 'in_progress' | 'pending'
}

const milestones: Milestone[] = [
  {
    id: '1',
    title: 'Engagement Kick-off',
    description: 'Initial meeting held and engagement letter signed by both parties.',
    date: 'Jan 10, 2026',
    status: 'completed'
  },
  {
    id: '2',
    title: 'Initial Data Submission',
    description: 'Client has provided the primary set of financial records for review.',
    date: 'Jan 15, 2026',
    status: 'completed'
  },
  {
    id: '3',
    title: 'Preliminary Review',
    description: 'Internal audit team is currently reviewing the submitted records.',
    date: 'Jan 22, 2026',
    status: 'in_progress'
  },
  {
    id: '4',
    title: 'Draft Financial Statements',
    description: 'Preparation of the draft financial statements for client review.',
    date: 'Feb 05, 2026',
    status: 'pending'
  },
  {
    id: '5',
    title: 'Final Audit Report',
    description: 'Issuance of the final audited financial statements and audit opinion.',
    date: 'Feb 15, 2026',
    status: 'pending'
  }
]

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

export const MilestonesTab = () => {
  return (
    <div className="mx-auto py-3">
      <div className="mb-5 text-center">
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Project Milestones</h2>
        <p className="text-gray-500 mt-2 font-medium">Tracking our journey towards completion</p>
      </div>

      <div className="relative">
        {/* Central Vertical Line (Visible only on medium screens and up) */}
        <div className="absolute left-10 md:left-1/2 top-0 bottom-0 w-0.5 bg-gray-200 -translate-x-1/2 z-0" />

        <div className="space-y-12 relative z-10">
          {milestones.map((milestone, index) => {
            const isEven = index % 2 === 0;
            return (
              <div 
                key={milestone.id} 
                className={cn(
                  "flex flex-col md:flex-row items-center w-full",
                  isEven ? "md:flex-row-reverse" : ""
                )}
              >
                {/* Spacer / Content on one side */}
                <div className="hidden md:block w-1/2 px-8" />

                {/* Central Icon */}
                <div className="absolute left-10 md:left-1/2 -translate-x-1/2 flex items-center justify-center">
                  <div className="transition-transform duration-300 hover:scale-110">
                    <MilestoneIcon status={milestone.status} />
                  </div>
                </div>

                {/* Content Card on the other side */}
                <div className={cn(
                  "w-full md:w-1/2 pl-20 md:pl-0 px-4 md:px-8",
                  isEven ? "md:pr-12" : "md:pl-12"
                )}>
                  <DashboardCard 
                    className={cn(
                      "p-6 transition-all duration-300 border-l-4",
                      milestone.status === 'completed' ? "border-l-emerald-500 bg-white shadow-sm" :
                      milestone.status === 'in_progress' ? "border-l-blue-500 bg-blue-50/30 shadow-md ring-1 ring-blue-100" :
                      "border-l-gray-200 bg-white/50 opacity-70 grayscale-[0.5]"
                    )}
                  >
                    <div className="space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <h4 className={cn(
                            "text-xl font-bold tracking-tight",
                            milestone.status === 'pending' ? "text-gray-500" : "text-gray-900"
                          )}>
                            {milestone.title}
                          </h4>
                          {milestone.status === 'in_progress' && (
                            <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-600 text-[10px] font-bold uppercase tracking-wider">
                              Active
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-400">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{milestone.date}</span>
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm font-medium leading-relaxed">
                        {milestone.description}
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
