"use client"

import { useState, useEffect } from 'react'
import { getReclassifications, Reclassification } from '@/api/auditService'

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
      const data = await getReclassifications(etbId)
      setReclassifications(data)
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

