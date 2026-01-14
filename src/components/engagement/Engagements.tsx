"use client"

import React from 'react'
import { useEngagements } from './hooks/useEngagements'
import { useRouter } from 'next/navigation'
import { AlertCircle, FileText, Calendar, Building2 } from 'lucide-react'
import EmptyState from '../shared/EmptyState'
import BackButton from '../shared/BackButton'
import { Card, CardContent } from '@/components/ui/card2'
import { Button } from '@/components/ui/button'

import { ListSkeleton } from '../shared/CommonSkeletons'
import PageHeader from '../shared/PageHeader'

const Engagements = () => {
  const { engagements, loading, error } = useEngagements()
  const router = useRouter()

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-GB', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
      })
    } catch {
      return dateString
    }
  }

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <BackButton />
        <ListSkeleton count={4} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <BackButton />
        <EmptyState 
          icon={AlertCircle}
          title="Error Loading Engagements"
          description={error}
        />
      </div>
    )
  }

  if (engagements.length === 0) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <BackButton />
        <EmptyState 
          icon={FileText}
          title="No Engagements Found"
          description="You don't have any engagements associated with your account yet."
        />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <BackButton />
      <PageHeader
        title="Engagements"
        subtitle={`Total active engagements: ${engagements.length}`}
        className="mb-8"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {engagements.map((engagement) => (
          <Card key={engagement._id} className="bg-white rounded-0 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4 flex-1">
                  <div className="p-3 bg-indigo-50 rounded-0 text-indigo-600">
                    <FileText size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{engagement.title}</h3>
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center space-x-2 text-gray-500">
                        <Calendar size={14} />
                        <span className="text-sm">Year End: {formatDate(engagement.yearEndDate)}</span>
                      </div>
                      {engagement.companyId && (
                        <div className="flex items-center space-x-2 text-gray-500">
                          <Building2 size={14} />
                          <span className="text-sm">Company ID: {engagement.companyId.slice(0, 8)}...</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <Button 
                onClick={() => router.push(`/dashboard/engagement/${engagement._id}`)}
                className="w-full"
              >
                View Engagement
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default Engagements