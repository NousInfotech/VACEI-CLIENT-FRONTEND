import React from 'react';
import { ETBRow } from './mockEngagementData';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PieChart, AlertCircle, TableProperties } from 'lucide-react';
import EmptyState from '../shared/EmptyState';

interface ETBTableProps {
  data: ETBRow[];
}

const ETBTable: React.FC<ETBTableProps> = ({ data }) => {
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-GB', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const totals = React.useMemo(() => {
    return data.reduce((acc, row) => ({
      currentYear: acc.currentYear + (row.currentYear || 0),
      reclassification: acc.reclassification + (row.reclassification || 0),
      adjustments: acc.adjustments + (row.adjustments || 0),
      finalBalance: acc.finalBalance + (row.finalBalance || 0),
      priorYear: acc.priorYear + (row.priorYear || 0),
    }), { currentYear: 0, reclassification: 0, adjustments: 0, finalBalance: 0, priorYear: 0 });
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <EmptyState 
        icon={TableProperties}
        title="No ETB Data Available"
        description="We couldn't find any Extended Trial Balance data for this engagement. Please upload the trial balance file to generate the ETB."
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Aggregate Summary Ribbon matching Classification.tsx */}
      <div className="bg-gray-50/50 border border-gray-200 rounded-2xl p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-10 w-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center shadow-sm">
            <PieChart className="h-5 w-5 text-gray-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
              Extended Trial Balance Summary
            </h2>
          </div>
        </div>
        
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Current Year', value: totals.currentYear },
            { label: 'Prior Year', value: totals.priorYear },
            { label: 'Adjustments', value: totals.adjustments },
            { label: 'Final Balance', value: totals.finalBalance }
          ].map((item) => (
            <div 
              key={item.label} 
              className="bg-white p-4 border border-gray-200 rounded-xl shadow-sm transition-all duration-300"
            >
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                {item.label}
              </p>
              <span className="text-2xl font-medium tracking-tight">
                {formatNumber(item.value)}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
          <div>
          <h3 className="text-xl font-bold text-gray-900">Extended Trial Balance</h3>
          <p className="text-sm text-gray-500 mt-0.5">Summary of all account balances and adjustments</p>
        </div>
        <Badge variant="outline" className="bg-white text-indigo-700 border-indigo-100 px-3 py-1 font-medium">
          {data.length} Accounts
        </Badge>
      </div>
      
      <div className="overflow-x-auto">
        <Table className="border-collapse">
          <TableHeader className="bg-gray-50/50">
            <TableRow className="border-b border-t border-gray-300">
              <TableHead className="w-[80px] font-bold text-gray-900 border-r border-gray-300 p-3">Code</TableHead>
              <TableHead className="min-w-[200px] font-bold text-gray-900 border-r border-gray-300 p-3">Account Name</TableHead>             
              <TableHead className="text-right font-bold text-gray-900 border-r border-gray-300 p-3">Current Year</TableHead>
              <TableHead className="text-right font-bold text-gray-900 border-r border-gray-300 p-3">Re-classification</TableHead>
              <TableHead className="text-right font-bold text-gray-900 border-r border-gray-300 p-3">Adjustments</TableHead>
              <TableHead className="text-right font-bold text-gray-900 border-r border-gray-300 p-3">Final Balance</TableHead>
              <TableHead className="text-right font-bold text-gray-900 last:border-r-0 p-3">Prior Year</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row) => (
              <TableRow key={row._id} className="hover:bg-gray-50/50 transition-colors border-b border-gray-200 last:border-b-0">
                <TableCell className="font-mono text-xs text-gray-500 border-r border-gray-200 p-3">{row.code}</TableCell>
                <TableCell className="font-medium text-gray-900 border-r border-gray-200 p-3">{row.accountName}</TableCell>
                <TableCell className="text-right font-mono text-sm border-r border-gray-200 p-3">
                  {formatNumber(row.currentYear)}
                </TableCell>
                <TableCell className={`text-right font-mono text-sm border-r border-gray-200 p-3 ${row.reclassification !== 0 ? 'text-orange-600 font-semibold' : 'text-gray-400'}`}>
                  {formatNumber(row.reclassification)}
                </TableCell>
                <TableCell className={`text-right font-mono text-sm border-r border-gray-200 p-3 ${row.adjustments !== 0 ? 'text-indigo-600 font-semibold' : 'text-gray-400'}`}>
                  {formatNumber(row.adjustments)}
                </TableCell>
                <TableCell className="text-right font-mono text-sm font-bold bg-gray-50/10 border-r border-gray-200 p-3">
                  {formatNumber(row.finalBalance)}
                </TableCell>
                <TableCell className="text-right font-mono text-sm last:border-r-0 p-3">
                  {formatNumber(row.priorYear)}
                </TableCell>
              </TableRow>
            ))}
            {/* Total Row matching Classification.tsx style */}
            <TableRow className="bg-slate-50 border-t-2 border-black h-12">
              <TableCell colSpan={2} className="pl-4 border-r border-gray-300">
                <span className="font-medium text-xl">Total</span>
              </TableCell>
              <TableCell className="text-right border-r border-gray-300 font-bold p-3">{formatNumber(totals.currentYear)}</TableCell>
              <TableCell className="text-right border-r border-gray-300 p-3">{formatNumber(totals.reclassification)}</TableCell>
              <TableCell className="text-right border-r border-gray-300 p-3">{formatNumber(totals.adjustments)}</TableCell>
              <TableCell className="text-right border-r border-gray-300 font-bold p-3">{formatNumber(totals.finalBalance)}</TableCell>
              <TableCell className="text-right last:border-r-0 font-bold p-3">{formatNumber(totals.priorYear)}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  </div>
  );
};

export default ETBTable;
