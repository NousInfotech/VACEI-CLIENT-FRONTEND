import { useState, useEffect, useCallback } from 'react'
import { getIncorporationByCompanyId, IncorporationCycle } from '@/api/auditService'

interface UseIncorporationReturn {
  incorporation: IncorporationCycle | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export const useIncorporation = (companyId: string | null): UseIncorporationReturn => {
  const [incorporation, setIncorporation] = useState<IncorporationCycle | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const fetchIncorporation = useCallback(async () => {
    if (!companyId) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const data = await getIncorporationByCompanyId(companyId)
      setIncorporation(data)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch Incorporation data')
      setIncorporation(null)
    } finally {
      setLoading(false)
    }
  }, [companyId])

  useEffect(() => {
    fetchIncorporation()
  }, [fetchIncorporation])

  const refetch = async () => {
    await fetchIncorporation()
  }

  return { incorporation, loading, error, refetch }
}
