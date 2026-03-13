"use client"

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { fetchKycDetails, uploadKycDocument, clearKycDocument, type KycDetails } from '@/api/kycService'

interface KycContextType {
  details: KycDetails | null
  loading: boolean
  error: string | null
  expired: boolean
  token: string
  refreshKyc: () => Promise<void>
  uploadDocument: (reqId: string, docId: string, file: File) => Promise<{ success: boolean; message: string }>
  clearDocument: (reqId: string, docId: string) => Promise<{ success: boolean; message: string }>
  setDetails: React.Dispatch<React.SetStateAction<KycDetails | null>>
}

const KycContext = createContext<KycContextType | undefined>(undefined)

export const KycProvider: React.FC<{ token: string; children: React.ReactNode }> = ({ token, children }) => {
  const [details, setDetails] = useState<KycDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expired, setExpired] = useState(false)

  const load = useCallback(async () => {
    if (!token) {
      setError('No KYC token found in URL.')
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    const result = await fetchKycDetails(token)
    if (result.ok) {
      setDetails(result.data)
      setExpired(false)
    } else {
      setExpired(result.expired)
      setError(result.message)
    }
    setLoading(false)
  }, [token])

  const refreshKyc = useCallback(async () => {
    if (!token) return
    const result = await fetchKycDetails(token)
    if (result.ok) {
      setDetails(result.data)
      setExpired(false)
    } else {
      setExpired(result.expired)
      setError(result.message)
    }
  }, [token])

  const uploadDocument = async (reqId: string, docId: string, file: File) => {
    const res = await uploadKycDocument(docId, reqId, token, [file])
    if (res.success) {
      await refreshKyc()
    }
    return res
  }

  const clearDocument = async (reqId: string, docId: string) => {
    const res = await clearKycDocument(docId, reqId, token)
    if (res.success) {
      await refreshKyc()
    }
    return res
  }

  useEffect(() => {
    load()
  }, [load])

  return (
    <KycContext.Provider value={{
      details,
      loading,
      error,
      expired,
      token,
      refreshKyc,
      uploadDocument,
      clearDocument,
      setDetails
    }}>
      {children}
    </KycContext.Provider>
  )
}

export const useKyc = () => {
  const context = useContext(KycContext)
  if (context === undefined) {
    throw new Error('useKyc must be used within a KycProvider')
  }
  return context
}
