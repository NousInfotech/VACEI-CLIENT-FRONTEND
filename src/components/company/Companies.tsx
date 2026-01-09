"use client"

import React, { useEffect } from 'react'
import { useCompanies } from './hooks/useCompanies'
import { useRouter } from 'next/navigation'
import { Building2, Hash, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card2'
import EmptyState from '../shared/EmptyState'
import BackButton from '../shared/BackButton'

import { ListSkeleton } from '../shared/CommonSkeletons'

const Companies = () => {
  const { companies, loading, error } = useCompanies()
  const router = useRouter()

  useEffect(() => {
    // If only one company, redirect to that company
    if (!loading && companies.length === 1) {
      router.push(`/dashboard/company/${companies[0]._id}`)
    }
  }, [companies, loading, router])

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <BackButton />
        <ListSkeleton count={6} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <BackButton />
        <EmptyState 
          icon={AlertCircle}
          title="Error Loading Companies"
          description={error}
        />
      </div>
    )
  }

  // If only one company, show loading while redirecting
  if (companies.length === 1) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <BackButton />
        <ListSkeleton count={1} />
      </div>
    )
  }

  if (companies.length === 0) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <BackButton />
        <EmptyState 
          icon={Building2}
          title="No Companies Found"
          description="You don't have any companies associated with your account yet."
        />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <BackButton />
      <div className="flex flex-col space-y-4">
        <h1 className="text-4xl font-medium">Companies</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {companies.map((company) => (
          <Card key={company._id} className="bg-white rounded-0 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-blue-50 rounded-0 text-blue-600">
                    <Building2 size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{company.name}</h3>
                    <div className="flex items-center space-x-2 text-gray-500 mt-1">
                      <Hash size={14} />
                      <span className="font-mono text-sm">{company.registrationNumber}</span>
                    </div>
                  </div>
                </div>
              </div>
              <Button 
                onClick={() => router.push(`/dashboard/company/${company._id}`)}
                className="w-full"
              >
                View Company
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default Companies