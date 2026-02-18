"use client"

import { useEffect, useState } from "react"
import { ENGAGEMENT_CONFIG } from "@/config/engagementConfig"
import { EngagementMilestone, getEngagementMilestones } from "@/api/auditService"

export function useMilestones(engagementId: string | null) {
  const [milestones, setMilestones] = useState<EngagementMilestone[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!engagementId) {
      setLoading(false)
      setMilestones([])
      return
    }

    // No mock fallback for this tab (read-only API only)
    if (ENGAGEMENT_CONFIG.USE_MOCK_DATA) {
      setLoading(false)
      setMilestones([])
      return
    }

    const controller = new AbortController()
    const signal = controller.signal

    const run = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await getEngagementMilestones(engagementId, signal)
        if (signal.aborted) return
        setMilestones(Array.isArray(data) ? data : [])
      } catch (e: any) {
        if (e?.name === "AbortError") return
        setError(e?.message || "Failed to fetch milestones")
        setMilestones([])
      } finally {
        if (!signal.aborted) setLoading(false)
      }
    }

    run()
    return () => controller.abort()
  }, [engagementId])

  return { milestones, loading, error }
}

