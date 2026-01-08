
"use client"
import React, { useState, useMemo } from 'react'
import CompanyDetail from './CompanyDetail'
import Involvements from './Involvements'
import Distribution from './Distribution'
import CompanyHierarchy, { HierarchyTreeNode } from './CompanyHierarchy'
import Kyc from './kyc/KYCSection'
import { LayoutGrid, Users, PieChart, Network, ShieldCheck } from 'lucide-react'
import { MOCK_COMPANY_DATA, MOCK_HIERARCHY_DATA } from './mockData'

const Company = () => {
  const [activeTab, setActiveTab] = useState('detail')
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

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col space-y-4">
        <h1 className="text-4xl font-medium">Company Overview</h1>
        
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl w-fit">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200
                  ${isActive 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}
                `}
              >
                <Icon size={18} />
                <span className="font-medium text-sm">{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        {renderContent()}
      </div>
    </div>
  )
}

export default Company