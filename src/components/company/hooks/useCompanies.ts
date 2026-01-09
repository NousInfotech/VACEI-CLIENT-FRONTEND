"use client"

import { useState, useEffect } from 'react'
import { getCompanies, Company } from '@/api/auditService'

interface UseCompaniesReturn {
  companies: Pick<Company, '_id' | 'name' | 'registrationNumber'>[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export const useCompanies = (): UseCompaniesReturn => {
  const [companies, setCompanies] = useState<Pick<Company, '_id' | 'name' | 'registrationNumber'>[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCompanies = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getCompanies()
      setCompanies(data)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch companies')
      setCompanies([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCompanies()
  }, [])

  const refetch = async () => {
    await fetchCompanies()
  }

  return { companies, loading, error, refetch }
}

