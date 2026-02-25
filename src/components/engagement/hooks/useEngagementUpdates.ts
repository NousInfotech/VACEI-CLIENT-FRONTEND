"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { ENGAGEMENT_CONFIG } from "@/config/engagementConfig"
import { EngagementUpdate, getEngagementUpdates } from "@/api/auditService"

export function useEngagementUpdates(engagementId: string | null) {
  const [updates, setUpdates] = useState<EngagementUpdate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const run = useCallback(async (signal?: AbortSignal) => {
    if (!engagementId) {
      setLoading(false)
      setUpdates([])
      return
    }

    // No mock fallback for this tab (read-only API only)
    if (ENGAGEMENT_CONFIG.USE_MOCK_DATA) {
      setLoading(false)
      setUpdates([])
      return
    }

    setLoading(true)
    setError(null)
    try {
      const data = await getEngagementUpdates(engagementId, signal)
      if (signal?.aborted) return
      setUpdates(Array.isArray(data) ? data : [])
    } catch (e: any) {
      if (e?.name === "AbortError") return
      setError(e?.message || "Failed to fetch updates")
      setUpdates([])
    } finally {
      if (!signal?.aborted) setLoading(false)
    }
  }, [engagementId])

  useEffect(() => {
    const controller = new AbortController()
    run(controller.signal)
    return () => controller.abort()
  }, [run])

  const refetch = useCallback(async () => {
    await run()
  }, [run])

  const sorted = useMemo(() => {
    return [...updates].sort((a, b) => {
      const ta = new Date(a.createdAt || a.updatedAt).getTime()
      const tb = new Date(b.createdAt || b.updatedAt).getTime()
      return tb - ta
    })
  }, [updates])

  return { updates: sorted, loading, error, refetch }
}

