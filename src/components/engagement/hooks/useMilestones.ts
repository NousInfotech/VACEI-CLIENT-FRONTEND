"use client"

import { useEffect, useState, useCallback } from "react"
import { ENGAGEMENT_CONFIG } from "@/config/engagementConfig"
import { EngagementMilestone, getEngagementMilestones, updateEngagementMilestoneStatus, updateEngagementMilestone, deleteEngagementMilestone } from "@/api/auditService"

export function useMilestones(engagementId: string | null) {
  const [milestones, setMilestones] = useState<EngagementMilestone[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadMilestones = useCallback(async (signal?: AbortSignal) => {
    if (!engagementId || ENGAGEMENT_CONFIG.USE_MOCK_DATA) {
      setLoading(false)
      setMilestones([])
      return
    }

    setLoading(true)
    setError(null)
    try {
      const data = await getEngagementMilestones(engagementId, signal)
      if (signal?.aborted) return
      setMilestones(Array.isArray(data) ? data : [])
    } catch (e: any) {
      if (e?.name === "AbortError") return
      setError(e?.message || "Failed to fetch milestones")
      setMilestones([])
    } finally {
      if (!signal?.aborted) setLoading(false)
    }
  }, [engagementId])

  useEffect(() => {
    const controller = new AbortController()
    loadMilestones(controller.signal)
    return () => controller.abort()
  }, [loadMilestones])

  const updateStatus = async (milestoneId: string, status: "PENDING" | "ACHIEVED" | "CANCELLED") => {
    if (!engagementId) return;
    setLoading(true);
    try {
      await updateEngagementMilestoneStatus(engagementId, milestoneId, status);
      await loadMilestones();
    } catch (err: any) {
      console.error("Failed to update status", err);
    } finally {
      setLoading(false);
    }
  };

  const updateMilestone = async (milestoneId: string, data: { title?: string; description?: string | null }) => {
    if (!engagementId) return;
    setLoading(true);
    try {
      await updateEngagementMilestone(engagementId, milestoneId, data);
      await loadMilestones();
    } catch (err: any) {
      console.error("Failed to update milestone", err);
    } finally {
      setLoading(false);
    }
  };

  const deleteMilestone = async (milestoneId: string) => {
    if (!engagementId) return;
    setLoading(true);
    try {
      await deleteEngagementMilestone(engagementId, milestoneId);
      await loadMilestones();
    } catch (err: any) {
      console.error("Failed to delete milestone", err);
    } finally {
      setLoading(false);
    }
  };

  return { milestones, loading, error, updateStatus, updateMilestone, deleteMilestone, reload: loadMilestones }
}

