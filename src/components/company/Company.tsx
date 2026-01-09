
"use client"
import React from 'react'
import CompanyDetail from './CompanyDetail'
import Involvements from './Involvements'
import Distribution from './Distribution'
import CompanyHierarchy from './CompanyHierarchy'
import Kyc from './kyc/KYCSection'
import { LayoutGrid, Users, PieChart, Network, ShieldCheck } from 'lucide-react'
import { useCompany } from './hooks/useCompany'

import PillTabs from '../shared/PillTabs'
import { useTabQuery } from '@/hooks/useTabQuery'
import BackButton from '../shared/BackButton'
import EmptyState from '../shared/EmptyState'
import { AlertCircle, Loader2 } from 'lucide-react'
import { Company as CompanyType } from '@/api/auditService'

const Company = () => {
  const [activeTab, setActiveTab] = useTabQuery('detail')
  const { company: data, loading, error } = useCompany()

  const tabs = [
    { id: 'detail', label: 'Company Detail', icon: LayoutGrid },
    { id: 'involvements', label: 'Involvements', icon: Users },
    { id: 'distribution', label: 'Distribution', icon: PieChart },
    { id: 'hierarchy', label: 'Company Hierarchy', icon: Network },
    { id: 'kyc', label: 'KYC', icon: ShieldCheck },
  ]

  const renderContent = () => {
    switch (activeTab) {
      case 'detail': return <CompanyDetail />
      case 'involvements': return <Involvements data={data as CompanyType} />
      case 'distribution': return <Distribution data={data as CompanyType}/>
      case 'hierarchy': return <CompanyHierarchy />
      case 'kyc': return <Kyc />
      default: return <CompanyDetail />
    }
  }

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <BackButton />
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
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
      <div className="p-6 max-w-7xl mx-auto space-y-6">
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
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <BackButton />
      <div className="flex flex-col space-y-4">
        <h1 className="text-4xl font-medium">Company Overview</h1>
        
        <PillTabs 
          tabs={tabs} 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
        />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        {renderContent()}
      </div>
    </div>
  )
}

export default Company