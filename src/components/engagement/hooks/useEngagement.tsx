"use client"

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { getEngagementById, Engagement } from '@/api/auditService'

interface EngagementContextType {
  engagement: Engagement | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

const EngagementContext = createContext<EngagementContextType | undefined>(undefined)

interface EngagementProviderProps {
  engagementId: string
  children: ReactNode
}

export const EngagementProvider: React.FC<EngagementProviderProps> = ({ engagementId, children }) => {
  const [engagement, setEngagement] = useState<Engagement | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const fetchEngagement = async () => {
    if (!engagementId) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const data = await getEngagementById(engagementId)
      setEngagement(data)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch engagement')
      setEngagement(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEngagement()
  }, [engagementId])

  const refetch = async () => {
    await fetchEngagement()
  }

  return (
    <EngagementContext.Provider value={{ engagement, loading, error, refetch }}>
      {children}
    </EngagementContext.Provider>
  )
}

export const useEngagement = (): EngagementContextType => {
  const context = useContext(EngagementContext)
  if (context === undefined) {
    throw new Error('useEngagement must be used within an EngagementProvider')
  }
  return context
}

