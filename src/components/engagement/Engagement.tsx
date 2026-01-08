import React, { useMemo, useState } from 'react';
import { MOCK_ENGAGEMENT_DATA } from './mockEngagementData';
import ETBTable from './ETBTable';
import AdjustmentsTab from './AdjustmentsTab';
import { TableProperties, FileStack, Calculator, BarChart3, PieChart, Scale, FolderOpen } from 'lucide-react';
import Reclassification from './Reclassification';
import IncomeStatement from './IncomeStatement';
import BalanceSheet from './BalanceSheet';
import Classification from './Classification';
import DocumentRequestsTab from './DocumentRequestsTab';
import { extractETBData } from '@/lib/extractETBData';

import PillTabs from '../shared/PillTabs';
import { useTabQuery } from '@/hooks/useTabQuery';
import BackButton from '../shared/BackButton';
import EmptyState from '../shared/EmptyState';
import { AlertCircle } from 'lucide-react';

const Engagement = () => {
  const [activeTab, setActiveTab] = useTabQuery('etb');
  const data = MOCK_ENGAGEMENT_DATA;
  
  const extractedData = useMemo(() => {
    // Extract year from yearEndDate (e.g., "2024-12-31" -> 2024)
    const year = new Date(data.engagement.yearEndDate).getFullYear() || 2024;
    const base = extractETBData(data.etb, year);
    return {
      ...base,
      company: data.company,
      engagement: data.engagement,
    };
  }, [data]);

  const tabs = [
    { id: 'etb', label: 'ETB', icon: TableProperties },
    { id: 'adjustments', label: 'Adjustments', icon: FileStack },
    { id: 'reclassification', label: 'Reclassification', icon: Calculator },
    { id: 'income_statement', label: 'Income Statement', icon: BarChart3 },
    { id: 'balance_sheet', label: 'Balance Sheet', icon: Scale },
    { id: 'classification', label: 'Classification', icon: PieChart },
    { id: 'requests', label: 'Document Requests', icon: FolderOpen },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'etb': return <ETBTable data={data.etb} />;
      case 'adjustments': return <AdjustmentsTab />;
      case 'reclassification': return <Reclassification />;
      case 'income_statement': return <IncomeStatement data={extractedData} />;
      case 'balance_sheet': return <BalanceSheet data={extractedData} />;
      case 'classification': return <Classification data={extractedData} />;
      case 'requests': return <DocumentRequestsTab />;
      default: return <ETBTable data={data.etb} />;
    }
  };

  if (!data) {
    return (
      <div className="p-8 max-w-[1600px] mx-auto min-h-screen bg-white space-y-8">
        <BackButton />
        <EmptyState 
          icon={AlertCircle}
          title="No Engagement Data"
          description="We couldn't find any audit engagement data for this client. Please ensure the engagement is properly set up in the system."
        />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-[1600px] mx-auto min-h-screen bg-white space-y-8">
      <BackButton />
      <div className="flex flex-col space-y-6">
        <h1 className="text-4xl font-medium">{data.engagement.title}</h1>
        
        <PillTabs 
          tabs={tabs} 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
        />
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {renderContent()}
      </div>
    </div>
  );
};

export default Engagement;