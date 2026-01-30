"use client"

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { getEngagementById, Engagement } from '@/api/auditService'
import { ENGAGEMENT_CONFIG } from '@/config/engagementConfig'
import { MOCK_ENGAGEMENT_DATA } from '../mockEngagementData'

import { ALL_SERVICE_MOCKS } from '../../services/mockData'

interface EngagementContextType {
  engagement: Engagement | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  serviceSlug?: string
}

const EngagementContext = createContext<EngagementContextType | undefined>(undefined)

interface EngagementProviderProps {
  engagementId: string
  serviceSlug?: string
  children: ReactNode
}

export const EngagementProvider: React.FC<EngagementProviderProps> = ({ engagementId, serviceSlug, children }) => {
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
      if (ENGAGEMENT_CONFIG.USE_MOCK_DATA) {
        // Mock loading delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const mockServiceData = serviceSlug ? ALL_SERVICE_MOCKS[serviceSlug] : null;

        setEngagement({
          ...MOCK_ENGAGEMENT_DATA.engagement,
          _id: engagementId,
          clientId: 'mock-client',
          companyId: 'mock-company',
          ...mockServiceData, // Spread all service-specific data (milestones, filings, periods, etc.)
        } as any);
      } else {
        const data = await getEngagementById(engagementId)
        setEngagement(data)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch engagement')
      setEngagement(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEngagement()
  }, [engagementId, serviceSlug])

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

