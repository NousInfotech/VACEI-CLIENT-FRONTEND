"use client"

import { useState, useEffect, useCallback } from 'react'
import { getEngagements, Engagement } from '@/api/auditService'
import { useActiveCompany } from '@/context/ActiveCompanyContext'

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
  const { activeCompanyId } = useActiveCompany()

  const fetchEngagements = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getEngagements(activeCompanyId || undefined)
      setEngagements(data)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch engagements')
      setEngagements([])
    } finally {
      setLoading(false)
    }
  }, [activeCompanyId])

  useEffect(() => {
    fetchEngagements()
  }, [fetchEngagements])

  return { engagements, loading, error, refetch: fetchEngagements }
}

