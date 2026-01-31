"use client"

import { useState, useEffect } from 'react'
import { getDocumentRequestsByEngagementId, DocumentRequest } from '@/api/auditService'
import { ENGAGEMENT_CONFIG } from '@/config/engagementConfig'
import { MOCK_ENGAGEMENT_DATA } from '../mockEngagementData'

interface UseDocumentRequestsReturn {
  documentRequests: DocumentRequest[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export const useDocumentRequests = (engagementId: string | null): UseDocumentRequestsReturn => {
  const [documentRequests, setDocumentRequests] = useState<DocumentRequest[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDocumentRequests = async () => {
    if (!engagementId) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    try {
      if (ENGAGEMENT_CONFIG.USE_MOCK_DATA) {
        // Mock loading delay
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // If we have an engagement object from context, it might already have the specific mock documents
        // However, the hook is usually called with engagementId.
        // For simplicity in mock mode, we'll try to find the service mock if engagementId looks like our mock format
        const serviceSlug = engagementId.startsWith('mock-engagement-') 
          ? engagementId.replace('mock-engagement-', '') 
          : null;
        
        const mockServiceData = serviceSlug ? (require('../../services/mockData').ALL_SERVICE_MOCKS[serviceSlug]) : null;
        
        if (mockServiceData?.documentRequests) {
          setDocumentRequests(mockServiceData.documentRequests);
        } else {
          setDocumentRequests(MOCK_ENGAGEMENT_DATA.documentRequests as any[]);
        }
      } else {
        const data = await getDocumentRequestsByEngagementId(engagementId)
        setDocumentRequests(data)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch document requests')
      setDocumentRequests([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDocumentRequests()
  }, [engagementId])

  const refetch = async () => {
    await fetchDocumentRequests()
  }

  return { documentRequests, loading, error, refetch }
}

