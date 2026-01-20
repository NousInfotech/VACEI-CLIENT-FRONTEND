"use client"

import React, { useMemo } from 'react';
import ETBTable from './ETBTable';
import AdjustmentsTab from './AdjustmentsTab';
import { TableProperties, FileStack, Calculator, BarChart3, PieChart, Scale, FolderOpen } from 'lucide-react';
import { DetailsSkeleton } from '../shared/CommonSkeletons';
import Reclassification from './Reclassification';
import IncomeStatement from './IncomeStatement';
import BalanceSheet from './BalanceSheet';
import Classification from './Classification';
import DocumentRequestsTab from './DocumentRequestsTab';
import { extractETBData } from '@/lib/extractETBData';
import { ETBRow } from './mockEngagementData';
import { useEngagement } from './hooks/useEngagement';
import { useEtb } from './hooks/useEtb';

import PillTabs from '../shared/PillTabs';
import { useTabQuery } from '@/hooks/useTabQuery';
import BackButton from '../shared/BackButton';
import EmptyState from '../shared/EmptyState';
import { AlertCircle } from 'lucide-react';
import { PageHeader } from '../shared/PageHeader';

import EngagementSummary from './EngagementSummary';

const Engagement = () => {
  const [activeTab, setActiveTab] = useTabQuery('etb');
  const { engagement, loading: engagementLoading, error: engagementError } = useEngagement();
  const { etb, loading: etbLoading, error: etbError } = useEtb(engagement?._id || null);
  
  // Transform ETB rows to match ETBRow interface (reclassifications -> reclassification)
  const transformedEtbRows = useMemo((): ETBRow[] => {
    if (!etb?.rows) return [];
    return etb.rows.map(row => ({
      _id: row._id || row.rowId || '',
      code: row.code || '',
      accountName: row.accountName || '',
      currentYear: row.currentYear ?? 0,
      priorYear: row.priorYear ?? 0,
      adjustments: row.adjustments ?? 0,
      reclassification: row.reclassifications ?? 0,
      finalBalance: row.finalBalance ?? 0,
      classification: row.classification || '',
    }));
  }, [etb]);

  const extractedData = useMemo(() => {
    if (!engagement || !etb) return null;
    
    // Extract year from yearEndDate (e.g., "2024-12-31" -> 2024)
    const year = new Date(engagement.yearEndDate).getFullYear() || 2024;
    const base = extractETBData(transformedEtbRows, year);
    return {
      ...base,
      engagement: engagement,
    };
  }, [engagement, transformedEtbRows]);

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
      case 'etb': return <ETBTable data={transformedEtbRows} />;
      case 'adjustments': return <AdjustmentsTab />;
      case 'reclassification': return <Reclassification />;
      case 'income_statement': return extractedData ? <IncomeStatement data={extractedData} /> : null;
      case 'balance_sheet': return extractedData ? <BalanceSheet data={extractedData} /> : null;
      case 'classification': return extractedData ? <Classification data={extractedData} /> : null;
      case 'requests': return <DocumentRequestsTab />;
      default: return <ETBTable data={transformedEtbRows} />;
    }
  };

  if (engagementLoading || etbLoading) {
    return (
      <div className="p-8 max-w-[1600px] mx-auto min-h-screen bg-white space-y-8">
        <BackButton />
        <DetailsSkeleton />
      </div>
    );
  }

  if (engagementError || etbError) {
    return (
      <div className="p-8 max-w-[1600px] mx-auto min-h-screen bg-white space-y-8">
        <BackButton />
        <EmptyState 
          icon={AlertCircle}
          title="Error Loading Engagement"
          description={engagementError || etbError || 'Failed to load engagement data'}
        />
      </div>
    );
  }

  if (!engagement) {
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

  // Derive summary data
  const cycle = engagement.yearEndDate ? new Date(engagement.yearEndDate).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }) : 'FY 2024';
  
  return (
    <div className="p-8 max-w-[1600px] mx-auto min-h-screen bg-white space-y-10">
      <div className="flex flex-col gap-2">
        <BackButton />
      </div>

      <EngagementSummary 
        serviceName={engagement.title || "Audit Engagement"}
        description="Statutory audit engagement for the current financial period ensuring compliance with local regulations and international standards."
        status="on_track"
        cycle={cycle}
        workflowStatus="in_progress"
        neededFromUser="Please upload the signed management representation letter and bank confirmations."
        actions={[
          { type: 'upload', label: 'Upload Documents' },
          { type: 'schedule', label: 'Schedule a call' }
        ]}
      />
      
      <div className="space-y-6">
        <PillTabs 
          tabs={tabs} 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
        />

        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Engagement;