"use client"
import Engagement from '@/components/engagement/Engagement'
import { EngagementProvider } from '@/components/engagement/hooks/useEngagement'
import { useParams } from 'next/navigation'
import React from 'react'

const page = () => {
  const params = useParams<{ engagementId: string }>()
  const engagementId = params?.engagementId as string

  if (!engagementId) {
    return <div>Engagement ID not found</div>
  }

  return (
    <EngagementProvider engagementId={engagementId}>
      <Engagement/>
    </EngagementProvider>
  )
}

export default page