"use client"

import React from "react"
import DashboardCard from "../DashboardCard"
import { Skeleton } from "@/components/ui/skeleton"
import { useEngagement } from "./hooks/useEngagement"
import { useEngagementUpdates } from "./hooks/useEngagementUpdates"

function formatTs(ts: string) {
  const d = new Date(ts)
  if (Number.isNaN(d.getTime())) return ts
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
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
      <DashboardCard className="p-6 rounded-0 space-y-4">
        <Skeleton className="h-6 w-48 rounded-0" />
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="p-4 border border-border rounded-0 space-y-2">
            <Skeleton className="h-4 w-56 rounded-0" />
            <Skeleton className="h-3 w-full rounded-0" />
            <Skeleton className="h-3 w-3/4 rounded-0" />
          </div>
        ))}
      </DashboardCard>
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
      <div className="text-center py-20">
        <p className="text-gray-400">No updates for this service yet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <DashboardCard className="p-6 rounded-0">
        <div className="space-y-1">
          <h3 className="text-lg font-medium tracking-tight">Updates</h3>
          <p className="text-sm text-muted-foreground">
            Read-only timeline of engagement updates.
          </p>
        </div>
      </DashboardCard>

      <div className="space-y-3">
        {updates.map((u) => {
          const creator =
            u.creator ? `${u.creator.firstName || ""} ${u.creator.lastName || ""}`.trim() : ""
          return (
            <DashboardCard key={u.id} className="p-6 rounded-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="space-y-1">
                  {u.title ? (
                    <p className="text-sm font-semibold text-gray-900">{u.title}</p>
                  ) : (
                    <p className="text-sm font-semibold text-gray-900">Update</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {creator ? `By ${creator}` : "By service team"} · {formatTs(u.createdAt || u.updatedAt)}
                  </p>
                </div>
              </div>
              <p className="mt-3 text-sm text-gray-700 whitespace-pre-wrap">{u.message}</p>
            </DashboardCard>
          )
        })}
      </div>
    </div>
  )
}

