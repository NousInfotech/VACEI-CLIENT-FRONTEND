"use client"

import React from 'react'
import DashboardCard from '@/components/DashboardCard'
import { Calendar, CheckCircle2, Clock, AlertCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface ServiceOverviewSummaryProps {
  currentPeriod: string
  overallStatus: string
  lastUpdateDate: string
  nextStep: string
}

export const ServiceOverviewSummary: React.FC<ServiceOverviewSummaryProps> = ({
  currentPeriod,
  overallStatus,
  lastUpdateDate,
  nextStep
}) => {
  const getStatusColor = (status: string) => {
    const lowerStatus = status.toLowerCase()
    if (lowerStatus.includes('processing') || lowerStatus.includes('in progress')) {
      return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
    }
    if (lowerStatus.includes('awaiting') || lowerStatus.includes('waiting')) {
      return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
    }
    if (lowerStatus.includes('submitted') || lowerStatus.includes('completed')) {
      return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
    }
    return 'bg-gray-500/10 text-gray-500 border-gray-500/20'
  }

  return (
    <DashboardCard className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="space-y-2">
          <p className="text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">Current Period</p>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <p className="text-sm font-medium text-gray-900">{currentPeriod}</p>
          </div>
        </div>
        
        <div className="space-y-2">
          <p className="text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">Overall Status</p>
          <Badge className={getStatusColor(overallStatus) + " rounded-0 border px-2 py-1 text-xs font-semibold uppercase tracking-widest bg-transparent w-fit"}>
            {overallStatus}
          </Badge>
        </div>
        
        <div className="space-y-2">
          <p className="text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">Last Update</p>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <p className="text-sm font-medium text-gray-900">{lastUpdateDate}</p>
          </div>
        </div>
        
        <div className="space-y-2">
          <p className="text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">Next Step</p>
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-gray-400" />
            <p className="text-sm font-medium text-gray-900">{nextStep}</p>
          </div>
        </div>
      </div>
    </DashboardCard>
  )
}
