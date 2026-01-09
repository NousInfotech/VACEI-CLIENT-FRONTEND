"use client"

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { getCompanyById, Company } from '@/api/auditService'

interface CompanyContextType {
  company: Company | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined)

interface CompanyProviderProps {
  companyId: string
  children: ReactNode
}

export const CompanyProvider: React.FC<CompanyProviderProps> = ({ companyId, children }) => {
  const [company, setCompany] = useState<Company | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCompany = async () => {
    if (!companyId) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const data = await getCompanyById(companyId)
      setCompany(data)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch company')
      setCompany(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCompany()
  }, [companyId])

  const refetch = async () => {
    await fetchCompany()
  }

  return (
    <CompanyContext.Provider value={{ company, loading, error, refetch }}>
      {children}
    </CompanyContext.Provider>
  )
}

export const useCompany = (): CompanyContextType => {
  const context = useContext(CompanyContext)
  if (context === undefined) {
    throw new Error('useCompany must be used within a CompanyProvider')
  }
  return context
}

