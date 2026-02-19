import { useState, useEffect, useCallback } from 'react'
import { getKycByCompanyId, KycCycle } from '@/api/auditService'

interface UseKycReturn {
  kyc: KycCycle[] | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export const useKyc = (companyId: string | null): UseKycReturn => {
  const [kyc, setKyc] = useState<KycCycle[] | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const fetchKyc = useCallback(async () => {
    if (!companyId) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const data = await getKycByCompanyId(companyId)
      setKyc(data)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch KYC')
      setKyc(null)
    } finally {
      setLoading(false)
    }
  }, [companyId])

  useEffect(() => {
    fetchKyc()
  }, [fetchKyc])

  const refetch = async () => {
    await fetchKyc()
  }

  return { kyc, loading, error, refetch }
}

