"use client"

import { useState, useEffect } from 'react'
import { getAdjustments, Adjustment } from '@/api/auditService'
import { ENGAGEMENT_CONFIG } from '@/config/engagementConfig'
import { MOCK_ENGAGEMENT_DATA } from '../mockEngagementData'

interface UseAdjustmentsReturn {
  adjustments: Adjustment[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export const useAdjustments = (etbId: string | null): UseAdjustmentsReturn => {
  const [adjustments, setAdjustments] = useState<Adjustment[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAdjustments = async () => {
    if (!etbId) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    try {
      if (ENGAGEMENT_CONFIG.USE_MOCK_DATA) {
        // Mock loading delay
        await new Promise(resolve => setTimeout(resolve, 500));
        setAdjustments(MOCK_ENGAGEMENT_DATA.adjustments as any[]);
      } else {
        const data = await getAdjustments(etbId)
        setAdjustments(data)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch adjustments')
      setAdjustments([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAdjustments()
  }, [etbId])

  const refetch = async () => {
    await fetchAdjustments()
  }

  return { adjustments, loading, error, refetch }
}

