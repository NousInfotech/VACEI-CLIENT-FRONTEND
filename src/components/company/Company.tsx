
"use client"
import React from 'react'
import CompanyDetail from './CompanyDetail'
import Involvements from './Involvements'
import Distribution from './Distribution'
import CompanyHierarchy from './CompanyHierarchy'
import Kyc from './kyc/KYCSection'
import IncorporationSection from './incorporation/IncorporationSection'
import { LayoutGrid, Users, PieChart, Network, ShieldCheck, ClipboardList, CheckCircle2, Clock } from 'lucide-react'
import { useCompany } from './hooks/useCompany'

import PillTabs from '../shared/PillTabs'
import { useTabQuery } from '@/hooks/useTabQuery'
import { useSearchParams } from 'next/navigation'
import BackButton from '../shared/BackButton'
import EmptyState from '../shared/EmptyState'
import { AlertCircle } from 'lucide-react'
import { Company as CompanyType } from '@/api/auditService'
import { DetailsSkeleton } from '../shared/CommonSkeletons'
import PageHeader from '../shared/PageHeader'

const Company = () => {
  const [activeTab, setActiveTab] = useTabQuery('incorporation')
  const { company: data, loading, error } = useCompany()
  const searchParams = useSearchParams()
  const highlight = searchParams.get('highlight')
  const highlightedTabId = highlight === 'incorporation'
    ? 'incorporation'
    : highlight === 'kyc'
      ? 'kyc'
      : undefined

  const incorporationVerified = !!data?.incorporationStatus
  const kycVerified = !!data?.kycStatus

  const tabs = [
    { id: 'detail', label: 'Company Detail', icon: LayoutGrid },
    { id: 'involvements', label: 'Involvements', icon: Users },
    { id: 'distribution', label: 'Distribution', icon: PieChart },
    { id: 'hierarchy', label: 'Company Hierarchy', icon: Network },
    { id: 'incorporation', label: 'Incorporation KYC', icon: ClipboardList },
    // KYC tab only visible once incorporation is verified
    ...(incorporationVerified ? [{ id: 'kyc', label: 'KYC', icon: ShieldCheck }] : []),
  ]

  const renderContent = () => {
    switch (activeTab) {
      case 'detail': return <CompanyDetail />
      case 'involvements': return <Involvements data={data as CompanyType} />
      case 'distribution': return <Distribution data={data as CompanyType}/>
      case 'hierarchy': return <CompanyHierarchy />
      case 'incorporation': return <IncorporationSection />
      case 'kyc':
        // Guard: only render KYC section if incorporation is done
        return incorporationVerified ? <Kyc /> : <IncorporationSection />
      default: return <IncorporationSection />
    }
  }

  if (loading) {
    return (
      <div className="p-4 max-w-7xl mx-auto space-y-6">
        <BackButton />
        <DetailsSkeleton />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 max-w-7xl mx-auto space-y-6">
        <BackButton />
        <EmptyState 
          icon={AlertCircle}
          title="Error Loading Company"
          description={error}
        />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="p-4 max-w-7xl mx-auto space-y-6">
        <BackButton />
        <EmptyState 
          icon={AlertCircle}
          title="No Company Data"
          description="We couldn't find any detailed information for this company. It may have been removed or not yet fully onboarded."
        />
      </div>
    );
  }

  return (
    <div className="p-4 max-w-7xl mx-auto space-y-6">
      {/* <BackButton /> */}
      <PageHeader
        title={data?.name || "Company Overview"}
        description="Detailed company profile, including distribution, hierarchy, and KYC status."
        className="mb-6"
      />

      {/* Status Banners */}
      {/* <div className="flex flex-wrap gap-3">
        {incorporationVerified ? (
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold px-4 py-2 rounded-xl">
            <CheckCircle2 className="h-4 w-4" />
            Incorporation KYC Verified
          </div>
        ) : (
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-sm font-semibold px-4 py-2 rounded-xl">
            <Clock className="h-4 w-4" />
            Incorporation Pending — Please complete the Incorporation KYC documents below
          </div>
        )}
      </div> */}
      
      <PillTabs 
        tabs={tabs} 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        highlightedTabId={highlightedTabId}
      />

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        {renderContent()}
      </div>
    </div>
  )
}

export default Company