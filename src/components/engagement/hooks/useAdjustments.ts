"use client"

import { useState, useEffect } from 'react'
import { getAdjustments, Adjustment } from '@/api/auditService'

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
      const data = await getAdjustments(etbId)
      setAdjustments(data)
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

