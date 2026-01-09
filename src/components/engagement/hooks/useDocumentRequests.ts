"use client"

import { useState, useEffect } from 'react'
import { getDocumentRequestsByEngagementId, DocumentRequest } from '@/api/auditService'

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
      const data = await getDocumentRequestsByEngagementId(engagementId)
      setDocumentRequests(data)
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

