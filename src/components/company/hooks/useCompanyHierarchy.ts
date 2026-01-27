"use client"

import { useState, useEffect } from 'react'
import { HierarchyData } from '@/api/auditService'
import { HierarchyTreeNode } from '../CompanyHierarchy'

interface UseCompanyHierarchyReturn {
  hierarchyData: HierarchyTreeNode | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

// Transform API response to match HierarchyTreeNode format
const transformHierarchyData = (apiData: HierarchyData): HierarchyTreeNode => {
  const transformNode = (node: any): HierarchyTreeNode => {
    return {
      id: node.id,
      name: node.name,
      type: node.type,
      address: node.address || '',
      nationality: node.nationality,
      totalShares: typeof node.totalShares === 'number' ? node.totalShares : 0,
      sharesData: node.sharesData || [],
      roles: node.roles || [],
      children: node.children ? node.children.map(transformNode) : undefined,
      shareholders: node.shareholders ? node.shareholders.map(transformNode) : undefined,
    }
  }

  return {
    id: apiData.id,
    name: apiData.name,
    type: apiData.type,
    address: apiData.address || '',
    totalShares: apiData.totalShares, // This is an array of ShareDataItem
    shareholders: apiData.shareholders ? apiData.shareholders.map(transformNode) : undefined,
    children: apiData.shareholders ? apiData.shareholders.map(transformNode) : undefined,
  }
}

export const useCompanyHierarchy = (companyId: string | null): UseCompanyHierarchyReturn => {
  const [hierarchyData, setHierarchyData] = useState<HierarchyTreeNode | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const fetchHierarchy = async () => {
    if (!companyId) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const { MOCK_HIERARCHY_DATA, MOCK_HIERARCHY_DATA_OPAL } = await import('../mockData')
      const mockData = companyId === '69429ddc9c2f087b6331078f' ? MOCK_HIERARCHY_DATA_OPAL : MOCK_HIERARCHY_DATA
      const response = mockData.data as any
      if (response) {
        const transformed = transformHierarchyData(response)
        setHierarchyData(transformed)
      } else {
        setError('Failed to fetch hierarchy data')
        setHierarchyData(null)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch company hierarchy')
      setHierarchyData(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHierarchy()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId])

  const refetch = async () => {
    await fetchHierarchy()
  }

  return { hierarchyData, loading, error, refetch }
}

