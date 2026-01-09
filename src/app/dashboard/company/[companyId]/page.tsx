"use client"

import Company from "@/components/company/Company"
import { CompanyProvider } from "@/components/company/hooks/useCompany"
import { useParams } from "next/navigation"

const page = () => {
  const params = useParams<{ companyId: string }>()
  const companyId = params?.companyId as string

  if (!companyId) {
    return <div>Company ID not found</div>
  }

  return (
    <CompanyProvider companyId={companyId}>
      <Company />
    </CompanyProvider>
  )
}

export default page