"use client"

import React from 'react'
import { useParams } from 'next/navigation'
import Company from '@/components/company/Company'
import { CompanyProvider } from '@/components/company/hooks/useCompany'

export default function CompanyDetailPage() {
    const params = useParams()
    const companyId = params.id as string

    if (!companyId) return null

    return (
        <CompanyProvider companyId={companyId}>
            <Company />
        </CompanyProvider>
    )
}
