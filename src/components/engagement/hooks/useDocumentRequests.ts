"use client"

import { useState, useEffect } from 'react'
import { getDocumentRequests, type DocumentRequest } from '@/api/documentRequestService'
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
        
        const raw = mockServiceData?.documentRequests ?? MOCK_ENGAGEMENT_DATA.documentRequests
        setDocumentRequests((Array.isArray(raw) ? raw : [raw]) as DocumentRequest[])
      } else {
        const data = await getDocumentRequests(engagementId)
        const normalized = (data ?? []).map((dr) => {
          const docs = dr.documents ?? dr.requestedDocuments ?? []
          const byId = new Map<string, any>()
          function collectById(obj: any) {
            const id = obj.id ?? obj._id
            if (id) byId.set(id, obj)
            ;(obj.children ?? []).forEach(collectById)
          }
          docs.forEach(collectById)
          function getUrl(obj: any): string | undefined {
            return obj?.file?.url ?? obj?.file_url ?? obj?.templateFile?.url ?? obj?.url
          }
          function merge(d: any): any {
            const id = d.id ?? d._id
            const full = byId.get(id) ?? d
            const url = getUrl(full) ?? getUrl(d)
            const name = d.name ?? d.documentName
            const children = d.children?.map((c: any) => {
              const cid = c.id ?? c._id
              const cfull = byId.get(cid) ?? c
              const curl = getUrl(cfull) ?? getUrl(c)
              return {
                ...c,
                id: cid,
                _id: cid,
                label: c.documentName ?? c.label ?? c.name,
                url: curl,
                uploadedFileName: cfull?.file?.file_name ?? c?.file?.file_name,
              }
            })
            return { ...d, id, _id: id, name, url, uploadedFileName: full?.file?.file_name ?? full?.file_name ?? d?.file?.file_name, children }
          }
          const merged = docs.map(merge)
          const singleDocs = merged.filter((d: any) => d.count !== 'MULTIPLE')
          const multipleGroups = merged.filter((d: any) => d.count === 'MULTIPLE').map((d: any) => ({
            ...d,
            _id: d.id,
            multiple: d.children ?? [],
          }))
          return { ...dr, _id: dr.id ?? dr._id, documents: singleDocs, multipleDocuments: multipleGroups }
        })
        setDocumentRequests(normalized)
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

