"use client"
import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MOCK_COMPANIES } from '@/components/company/mockData'

const Page = () => {
  const router = useRouter()

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedActiveCompany = localStorage.getItem("vacei-active-company")
      const firstCompanyId = MOCK_COMPANIES[0]?._id
      const targetId = storedActiveCompany || firstCompanyId

      if (targetId) {
        router.push(`/dashboard/company/${targetId}`)
      }
    }
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>
  )
}

export default Page