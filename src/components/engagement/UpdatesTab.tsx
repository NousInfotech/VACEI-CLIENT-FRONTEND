"use client"

import React from "react"
import { MessageSquare, Clock } from "lucide-react"
import { ShadowCard } from "@/components/ui/ShadowCard"
import { Skeleton } from "@/components/ui/skeleton"
import { useEngagement } from "./hooks/useEngagement"
import { useEngagementUpdates } from "./hooks/useEngagementUpdates"

function formatTs(ts: string) {
  const d = new Date(ts)
  if (Number.isNaN(d.getTime())) return ts
  return d.toLocaleString(undefined, { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

export default function UpdatesTab() {
  const { engagement } = useEngagement()
  const engagementId =
    ((engagement as any)?._id as string | undefined) ||
    ((engagement as any)?.id as string | undefined) ||
    null
  const { updates, loading, error } = useEngagementUpdates(engagementId)

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48 rounded-lg" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-sm text-red-500 font-medium">Failed to load updates.</p>
      </div>
    )
  }

  if (!updates.length) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Engagement Updates</h2>
        </div>
        <ShadowCard className="p-12 text-center">
          <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No updates yet</h3>
          <p className="text-gray-500 mt-2">Post an update to keep the team informed.</p>
        </ShadowCard>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Engagement Updates</h2>
      </div>

      <div className="space-y-4">
        {updates.map((u) => {
          return (
            <ShadowCard key={u.id} className="p-4 border-l-4 border-l-primary/30 group transition-all duration-300 hover:shadow-md">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <Clock className="h-3 w-3" />
                      <span className="font-medium">{formatTs(u.createdAt || u.updatedAt)}</span>
                    </div>
                  </div>
                  {u.title && (
                    <h4 className="text-base font-bold text-slate-900 mt-1">{u.title}</h4>
                  )}
                  <p className="text-gray-600 mt-1.5 whitespace-pre-wrap text-[14px] leading-relaxed">{u.message}</p>
                </div>
              </div>
            </ShadowCard>
          )
        })}
      </div>
    </div>
  )
}

