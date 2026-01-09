"use client"

import { useState, useEffect } from 'react'
import { getEngagements, Engagement } from '@/api/auditService'

interface UseEngagementsReturn {
  engagements: Engagement[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export const useEngagements = (): UseEngagementsReturn => {
  const [engagements, setEngagements] = useState<Engagement[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const fetchEngagements = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getEngagements()
      setEngagements(data)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch engagements')
      setEngagements([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEngagements()
  }, [])

  const refetch = async () => {
    await fetchEngagements()
  }

  return { engagements, loading, error, refetch }
}

