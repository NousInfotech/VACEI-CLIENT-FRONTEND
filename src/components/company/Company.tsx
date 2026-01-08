
"use client"
import React, { useState, useMemo } from 'react'
import CompanyDetail from './CompanyDetail'
import Involvements from './Involvements'
import Distribution from './Distribution'
import CompanyHierarchy, { HierarchyTreeNode } from './CompanyHierarchy'
import Kyc from './kyc/KYCSection'
import { LayoutGrid, Users, PieChart, Network, ShieldCheck } from 'lucide-react'
import { MOCK_COMPANY_DATA, MOCK_HIERARCHY_DATA } from './mockData'

import PillTabs from '../shared/PillTabs'
import { useTabQuery } from '@/hooks/useTabQuery'
import BackButton from '../shared/BackButton'
import EmptyState from '../shared/EmptyState'
import { AlertCircle } from 'lucide-react'

const Company = () => {
  const [activeTab, setActiveTab] = useTabQuery('detail')
  const data = MOCK_COMPANY_DATA.data

  const hierarchyData = useMemo(() => {
    // Using the user-provided specific hierarchy data
    return MOCK_HIERARCHY_DATA.data as HierarchyTreeNode
  }, [])

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
      case 'involvements': return <Involvements />
      case 'distribution': return <Distribution />
      case 'hierarchy': return <CompanyHierarchy rootData={hierarchyData} />
      case 'kyc': return <Kyc />
      default: return <CompanyDetail />
    }
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