"use client"

import React from 'react'
import DashboardCard from '@/components/DashboardCard'
import { Clock } from 'lucide-react'

interface ActivityItem {
  id: string
  action: string
  date: string
}

interface RecentActivityFeedProps {
  activities: ActivityItem[]
  maxItems?: number
}

export const RecentActivityFeed: React.FC<RecentActivityFeedProps> = ({
  activities,
  maxItems = 5
}) => {
  const displayActivities = activities.slice(0, maxItems)

  if (displayActivities.length === 0) {
    return (
      <DashboardCard className="p-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-1 h-6 bg-gray-900 rounded-full" />
            <h3 className="text-lg font-medium tracking-tight">Recent Activity</h3>
          </div>
          <p className="text-sm text-gray-500">No recent activity to display.</p>
        </div>
      </DashboardCard>
    )
  }

  return (
    <DashboardCard className="p-6">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-1 h-6 bg-gray-900 rounded-full" />
          <h3 className="text-lg font-medium tracking-tight">Recent Activity</h3>
        </div>
        
        <div className="space-y-3">
          {displayActivities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 bg-gray-50/30 hover:bg-gray-50/50 transition-colors">
              <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Clock className="w-3 h-3 text-gray-400" />
                  <p className="text-xs text-gray-500">{activity.date}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardCard>
  )
}
