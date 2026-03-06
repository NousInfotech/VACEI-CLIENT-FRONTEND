"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { FilingItem, getFilings } from "@/api/filingService"

export function useFilings(engagementId: string | null) {
    const [filings, setFilings] = useState<FilingItem[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const run = useCallback(async () => {
        if (!engagementId) {
            setLoading(false)
            setFilings([])
            return
        }

        setLoading(true)
        setError(null)
        try {
            const data = await getFilings(engagementId)
            setFilings(Array.isArray(data) ? data : [])
        } catch (e: any) {
            setError(e?.message || "Failed to fetch filings")
            setFilings([])
        } finally {
            setLoading(false)
        }
    }, [engagementId])

    useEffect(() => {
        run()
    }, [run])

    const refetch = useCallback(async () => {
        await run()
    }, [run])

    const sorted = useMemo(() => {
        return [...filings].sort((a, b) => {
            const ta = new Date(a.createdAt || a.updatedAt).getTime()
            const tb = new Date(b.createdAt || b.updatedAt).getTime()
            return tb - ta
        })
    }, [filings])

    return { filings: sorted, loading, error, refetch }
}
