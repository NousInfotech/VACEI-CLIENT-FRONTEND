"use client"

import { useState, useEffect } from 'react'
import { getKycByCompanyId, KYC } from '@/api/auditService'

interface UseKycReturn {
  kyc: KYC[] | null // API returns an array of KYC workflows
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export const useKyc = (companyId: string | null): UseKycReturn => {
  const [kyc, setKyc] = useState<KYC[] | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const fetchKyc = async () => {
    if (!companyId) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const data = await getKycByCompanyId(companyId)
      // API returns an array of KYC workflows
      setKyc(Array.isArray(data) ? data : [data])
    } catch (err: any) {
      setError(err.message || 'Failed to fetch KYC')
      setKyc(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchKyc()
  }, [companyId])

  const refetch = async () => {
    await fetchKyc()
  }

  return { kyc, loading, error, refetch }
}

