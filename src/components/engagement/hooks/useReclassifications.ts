"use client"

import { useState, useEffect } from 'react'
import { getReclassifications, Reclassification } from '@/api/auditService'
import { ENGAGEMENT_CONFIG } from '@/config/engagementConfig'
import { MOCK_ENGAGEMENT_DATA } from '../mockEngagementData'

interface UseReclassificationsReturn {
  reclassifications: Reclassification[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export const useReclassifications = (etbId: string | null): UseReclassificationsReturn => {
  const [reclassifications, setReclassifications] = useState<Reclassification[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const fetchReclassifications = async () => {
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
        setReclassifications(MOCK_ENGAGEMENT_DATA.reclassifications as any[]);
      } else {
        const data = await getReclassifications(etbId)
        setReclassifications(data)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch reclassifications')
      setReclassifications([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReclassifications()
  }, [etbId])

  const refetch = async () => {
    await fetchReclassifications()
  }

  return { reclassifications, loading, error, refetch }
}

