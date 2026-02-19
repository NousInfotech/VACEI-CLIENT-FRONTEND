"use client"

import { useState, useEffect, useCallback } from 'react'
import { getEngagements, Engagement } from '@/api/auditService'
import { useActiveCompany } from '@/context/ActiveCompanyContext'
import { ENGAGEMENT_CONFIG } from '@/config/engagementConfig'

interface UseEngagementsReturn {
  engagements: Engagement[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

// Mock engagements list data
const MOCK_ENGAGEMENTS: Engagement[] = [
  {
    _id: "68f62e91da7e334a6f9b79e3",
    id: "68f62e91da7e334a6f9b79e3",
    title: "Audit Engagement 2024",
    yearEndDate: "2024-12-31",
    clientId: "8f868596-e644-4a41-bd48-7e0038e945d3",
    companyId: "f07f00bc-7f71-4485-87f0-de233f9d8c6e",
    organizationId: "a1b2c3d4-e5f6-4789-a0b1-c2d3e4f5a6b7",
    serviceType: "Audit",
    serviceCategory: "Assurance"
  },
  {
    _id: "68f62e91da7e334a6f9b79e4",
    id: "68f62e91da7e334a6f9b79e4",
    title: "Audit Engagement 2023",
    yearEndDate: "2023-12-31",
    clientId: "8f868596-e644-4a41-bd48-7e0038e945d3",
    companyId: "f07f00bc-7f71-4485-87f0-de233f9d8c6e",
    organizationId: "a1b2c3d4-e5f6-4789-a0b1-c2d3e4f5a6b7",
    serviceType: "Audit",
    serviceCategory: "Assurance"
  },
  {
    _id: "68f62e91da7e334a6f9b79e5",
    id: "68f62e91da7e334a6f9b79e5",
    title: "Tax Compliance 2024 Q4",
    yearEndDate: "2024-12-31",
    clientId: "8f868596-e644-4a41-bd48-7e0038e945d3",
    companyId: "f07f00bc-7f71-4485-87f0-de233f9d8c6e",
    organizationId: "b2c3d4e5-f6a7-4890-b1c2-d3e4f5a6b7c8",
    serviceType: "Tax",
    serviceCategory: "Compliance"
  },
  {
    _id: "68f62e91da7e334a6f9b79e6",
    id: "68f62e91da7e334a6f9b79e6",
    title: "Payroll Processing 2024",
    yearEndDate: "2024-12-31",
    clientId: "8f868596-e644-4a41-bd48-7e0038e945d3",
    companyId: "f07f00bc-7f71-4485-87f0-de233f9d8c6e",
    organizationId: "c3d4e5f6-a7b8-4901-c2d3-e4f5a6b7c8d9",
    serviceType: "Payroll",
    serviceCategory: "Advisory"
  }
]

export const useEngagements = (): UseEngagementsReturn => {
  const [engagements, setEngagements] = useState<Engagement[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const { activeCompanyId } = useActiveCompany()

  const fetchEngagements = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      if (ENGAGEMENT_CONFIG.USE_MOCK_DATA) {
        // Mock loading delay
        await new Promise(resolve => setTimeout(resolve, 500));
        setEngagements(MOCK_ENGAGEMENTS)
      } else {
        const data = await getEngagements(activeCompanyId || undefined)
        setEngagements(data)
      }
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

