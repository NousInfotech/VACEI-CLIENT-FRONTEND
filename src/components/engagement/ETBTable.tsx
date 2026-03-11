import React from 'react';
import { ETBRow } from './mockEngagementData';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TableProperties } from 'lucide-react';
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
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Aggregate Summary – match VACEI_PARTNER_PORTAL ExtendedTB */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Current Year", value: totals.currentYear },
          { label: "Prior Year", value: totals.priorYear },
          { label: "Adjustments", value: totals.adjustments },
          { label: "Final Balance", value: totals.finalBalance },
        ].map((item) => (
          <div
            key={item.label}
            className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm"
          >
            <p className="text-sm font-medium text-gray-500 mb-1">{item.label}</p>
            <p className="text-2xl font-bold text-gray-900">{formatNumber(item.value)}</p>
          </div>
        ))}
      </div>

      <div className="w-full max-w-full rounded-xl border border-gray-200 bg-white shadow-sm overflow-x-auto overflow-y-visible">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50/50">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Extended Trial Balance</h3>
            <p className="text-sm text-gray-500 mt-0.5">Summary of all account balances and adjustments</p>
          </div>
          <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-200 px-3 py-1 font-medium">
            {data.length} Accounts
          </Badge>
        </div>
        <Table className="border-collapse w-full min-w-[700px]">
          <TableHeader>
            <TableRow className="bg-gray-50/50 border-b border-gray-200">
              <TableHead className="w-[80px] font-semibold text-gray-600 border-r border-gray-200 p-3">Code</TableHead>
              <TableHead className="min-w-[200px] font-semibold text-gray-600 border-r border-gray-200 p-3">Account Name</TableHead>
              <TableHead className="text-right font-semibold text-gray-600 border-r border-gray-200 p-3">Current Year</TableHead>
              <TableHead className="text-right font-semibold text-gray-600 border-r border-gray-200 p-3">Re-classification</TableHead>
              <TableHead className="text-right font-semibold text-gray-600 border-r border-gray-200 p-3">Adjustments</TableHead>
              <TableHead className="text-right font-semibold text-gray-600 border-r border-gray-200 p-3">Final Balance</TableHead>
              <TableHead className="text-right font-semibold text-gray-600 p-3">Prior Year</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-100">
            {data.map((row) => (
              <TableRow key={row._id} className="hover:bg-gray-50/80 transition-colors border-b border-gray-200">
                <TableCell className="font-mono text-xs text-gray-500 border-r border-gray-200 p-3">{row.code}</TableCell>
                <TableCell className="font-medium text-gray-900 border-r border-gray-200 p-3">{row.accountName}</TableCell>
                <TableCell className="text-right font-mono text-sm border-r border-gray-200 p-3">
                  {formatNumber(row.currentYear)}
                </TableCell>
                <TableCell className={`text-right font-mono text-sm border-r border-gray-200 p-3 ${row.reclassification !== 0 ? "text-gray-700 font-semibold" : "text-gray-400"}`}>
                  {formatNumber(row.reclassification)}
                </TableCell>
                <TableCell className={`text-right font-mono text-sm border-r border-gray-200 p-3 ${row.adjustments !== 0 ? "text-gray-700 font-semibold" : "text-gray-400"}`}>
                  {formatNumber(row.adjustments)}
                </TableCell>
                <TableCell className="text-right font-mono text-sm font-bold bg-gray-50/10 border-r border-gray-200 p-3">
                  {formatNumber(row.finalBalance)}
                </TableCell>
                <TableCell className="text-right font-mono text-sm p-3">
                  {formatNumber(row.priorYear)}
                </TableCell>
              </TableRow>
            ))}
            <TableRow className="bg-gray-50/50 border-t border-gray-200 font-bold">
              <TableCell colSpan={2} className="pl-4 border-r border-gray-200 p-3 text-gray-900">Total</TableCell>
              <TableCell className="text-right border-r border-gray-200 p-3">{formatNumber(totals.currentYear)}</TableCell>
              <TableCell className="text-right border-r border-gray-200 p-3">{formatNumber(totals.reclassification)}</TableCell>
              <TableCell className="text-right border-r border-gray-200 p-3">{formatNumber(totals.adjustments)}</TableCell>
              <TableCell className="text-right border-r border-gray-200 p-3">{formatNumber(totals.finalBalance)}</TableCell>
              <TableCell className="text-right p-3">{formatNumber(totals.priorYear)}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ETBTable;
