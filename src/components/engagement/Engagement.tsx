import React, { useMemo } from 'react';
import { MOCK_ENGAGEMENT_DATA } from './mockEngagementData';
import ETBTable from './ETBTable';
import AdjustmentsTab from './AdjustmentsTab';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TableProperties, FileStack, Calculator, BarChart3, PieChart, Scale } from 'lucide-react';
import Reclassification from './Reclassification';
import IncomeStatement from './IncomeStatement';
import BalanceSheet from './BalanceSheet';
import Classification from './Classification';
import { extractETBData } from '@/lib/extractETBData';

const Engagement = () => {
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

  return (
    <div className="p-8 max-w-[1600px] mx-auto min-h-screen bg-white">
      <Tabs defaultValue="etb" className="space-y-8">
        <div className="flex items-center justify-between border-b border-gray-100 pb-1">
          <TabsList className="bg-transparent border-none p-0 h-auto gap-8">
            <TabsTrigger 
              value="etb" 
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-indigo-600 data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none px-0 pb-4 pt-0 text-sm font-bold text-gray-400 flex items-center gap-2 transition-all hover:text-gray-600"
            >
              <TableProperties size={16} />
              ETB
            </TabsTrigger>
            <TabsTrigger 
              value="adjustments" 
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-indigo-600 data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none px-0 pb-4 pt-0 text-sm font-bold text-gray-400 flex items-center gap-2 transition-all hover:text-gray-600"
            >
              <FileStack size={16} />
              Adjustments
            </TabsTrigger>
            <TabsTrigger 
              value="reclassification" 
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-indigo-600 data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none px-0 pb-4 pt-0 text-sm font-bold text-gray-400 flex items-center gap-2 transition-all hover:text-gray-600"
            >
              <Calculator size={16} />
               Reclassification
            </TabsTrigger>
            <TabsTrigger 
              value="income_statement" 
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-indigo-600 data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none px-0 pb-4 pt-0 text-sm font-bold text-gray-400 flex items-center gap-2 transition-all hover:text-gray-600"
            >
              <BarChart3 size={16} />
              Income Statement
            </TabsTrigger>
            <TabsTrigger 
              value="balance_sheet" 
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-indigo-600 data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none px-0 pb-4 pt-0 text-sm font-bold text-gray-400 flex items-center gap-2 transition-all hover:text-gray-600"
            >
              <Scale size={16} />
              Balance Sheet
            </TabsTrigger>
            <TabsTrigger 
              value="classification" 
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-indigo-600 data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none px-0 pb-4 pt-0 text-sm font-bold text-gray-400 flex items-center gap-2 transition-all hover:text-gray-600"
            >
              <PieChart size={16} />
              Classification
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <TabsContent value="etb">
            <ETBTable data={data.etb} />
          </TabsContent>
          <TabsContent value="adjustments">
            <AdjustmentsTab />
          </TabsContent>
          <TabsContent value="reclassification">
            <Reclassification />
          </TabsContent>
          <TabsContent value="income_statement">
            <IncomeStatement data={extractedData} />
          </TabsContent>
          <TabsContent value="balance_sheet">
            <BalanceSheet data={extractedData} />
          </TabsContent>
          <TabsContent value="classification">
            <Classification />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default Engagement;