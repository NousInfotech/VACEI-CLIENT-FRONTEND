"use client"
import React from 'react'
import { useParams } from "next/navigation"
import Company from "@/components/company/Company"
import { CompanyProvider } from "@/components/company/hooks/useCompany"

const Page = () => {
  const params = useParams<{ companyId: string }>()
  const companyId = params?.companyId as string

  if (!companyId) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <CompanyProvider companyId={companyId}>
      <Company defaultTab="detail" />
    </CompanyProvider>
  )
}

export default Page