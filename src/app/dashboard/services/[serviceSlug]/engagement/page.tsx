"use client"

import ServiceEngagement from '@/components/engagement/ServiceEngagement'
import { useParams } from 'next/navigation'
import React from 'react'

const EngagementPage = () => {
  const params = useParams<{ serviceSlug: string }>()
  const serviceSlug = params?.serviceSlug || ""

  return <ServiceEngagement serviceSlug={serviceSlug} />
}

export default EngagementPage
