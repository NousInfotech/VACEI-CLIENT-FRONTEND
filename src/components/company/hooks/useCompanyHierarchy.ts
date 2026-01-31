"use client"

import { useState, useEffect } from 'react'
import { HierarchyData, getCompanyHierarchy } from '@/api/auditService'
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
    // For shareholders, totalShares is a number (sum of all shares)
    // For companies, totalShares can be an array (share classes breakdown)
    const totalShares = Array.isArray(node.totalShares) 
      ? node.totalShares 
      : (typeof node.totalShares === 'number' ? node.totalShares : 0);

    return {
      id: node.id,
      name: node.name,
      type: node.type,
      address: node.address || '',
      nationality: node.nationality,
      totalShares: totalShares,
      sharesData: node.sharesData || [],
      roles: node.roles || [],
      children: node.children ? node.children.map(transformNode) : undefined,
      shareholders: node.shareholders ? node.shareholders.map(transformNode) : undefined,
    }
  }

  // For the root company, totalShares is an array of share classes
  return {
    id: apiData.id,
    name: apiData.name,
    type: apiData.type || 'company',
    address: apiData.address || '',
    totalShares: Array.isArray(apiData.totalShares) ? apiData.totalShares : [],
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
      // Fetch hierarchy data from backend API
      const response = await getCompanyHierarchy(companyId)
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

