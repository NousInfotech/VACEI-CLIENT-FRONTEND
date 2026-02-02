"use client"

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react'

interface ActiveCompanyContextType {
  activeCompanyId: string | null
  setActiveCompanyId: (companyId: string) => void
  companies: { id: string; name: string }[]
  setCompanies: (companies: { id: string; name: string }[]) => void
  loading: boolean
}

const ActiveCompanyContext = createContext<ActiveCompanyContextType | undefined>(undefined)

interface ActiveCompanyProviderProps {
  children: ReactNode
}

export const ActiveCompanyProvider: React.FC<ActiveCompanyProviderProps> = ({ children }) => {
  const [activeCompanyId, setActiveCompanyIdState] = useState<string | null>(null)
  const [companies, setCompanies] = useState<{ id: string; name: string }[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  // Initialize from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedActiveCompany = localStorage.getItem('vacei-active-company')
      const storedCompanies = localStorage.getItem('vacei-companies')
      
      if (storedActiveCompany) {
        setActiveCompanyIdState(storedActiveCompany)
      }
      
      if (storedCompanies) {
        try {
          const parsed = JSON.parse(storedCompanies)
          setCompanies(parsed)
        } catch (error) {
          console.error('Failed to parse stored companies:', error)
        }
      }
      
      setLoading(false)
    }
  }, [])

  // Sync activeCompanyId with localStorage when it changes
  const setActiveCompanyId = useCallback((companyId: string) => {
    setActiveCompanyIdState(companyId)
    if (typeof window !== 'undefined') {
      localStorage.setItem('vacei-active-company', companyId)
    }
  }, [])

  // Listen for storage changes (from other tabs/windows or TopHeader)
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'vacei-active-company' && e.newValue) {
        setActiveCompanyIdState(e.newValue)
      }
      if (e.key === 'vacei-companies' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue)
          setCompanies(parsed)
        } catch (error) {
          console.error('Failed to parse companies from storage event:', error)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  return (
    <ActiveCompanyContext.Provider
      value={{
        activeCompanyId,
        setActiveCompanyId,
        companies,
        setCompanies,
        loading,
      }}
    >
      {children}
    </ActiveCompanyContext.Provider>
  )
}

export const useActiveCompany = (): ActiveCompanyContextType => {
  const context = useContext(ActiveCompanyContext)
  if (context === undefined) {
    throw new Error('useActiveCompany must be used within an ActiveCompanyProvider')
  }
  return context
}

