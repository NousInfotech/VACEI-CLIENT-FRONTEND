"use client"

import { useState, useEffect } from 'react'
import { getEtb, ExtendedTrialBalance } from '@/api/auditService'

interface UseEtbReturn {
  etb: ExtendedTrialBalance | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export const useEtb = (engagementId: string | null): UseEtbReturn => {
  const [etb, setEtb] = useState<ExtendedTrialBalance | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const fetchEtb = async () => {
    if (!engagementId) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const data = await getEtb(engagementId)
      setEtb(data)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch Extended Trial Balance')
      setEtb(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEtb()
  }, [engagementId])

  const refetch = async () => {
    await fetchEtb()
  }

  return { etb, loading, error, refetch }
}

