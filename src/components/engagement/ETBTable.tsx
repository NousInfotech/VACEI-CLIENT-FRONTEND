import React from 'react';
import { ETBRow } from './mockEngagementData';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface ETBTableProps {
  data: ETBRow[];
}

const ETBTable: React.FC<ETBTableProps> = ({ data }) => {
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-GB', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  return (
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
        <Table>
          <TableHeader className="bg-gray-50/50">
            <TableRow>
              <TableHead className="w-[80px] font-bold text-gray-900">Code</TableHead>
              <TableHead className="min-w-[200px] font-bold text-gray-900">Account Name</TableHead>             
              <TableHead className="text-right font-bold text-gray-900">Current Year</TableHead>
              <TableHead className="text-right font-bold text-gray-900">Re-classification</TableHead>
              <TableHead className="text-right font-bold text-gray-900">Adjustments</TableHead>
              <TableHead className="text-right font-bold text-gray-900">Final Balance</TableHead>
               <TableHead className="text-right font-bold text-gray-900">Prior Year</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row) => (
              <TableRow key={row._id} className="hover:bg-gray-50/50 transition-colors">
                <TableCell className="font-mono text-xs text-gray-500">{row.code}</TableCell>
                <TableCell className="font-medium text-gray-900">{row.accountName}</TableCell>
                <TableCell className="text-right font-mono text-sm">
                  {formatNumber(row.currentYear)}
                </TableCell>
                <TableCell className={`text-right font-mono text-sm ${row.adjustments !== 0 ? 'text-indigo-600 font-semibold' : 'text-gray-400'}`}>
                  {formatNumber(row.adjustments)}
                </TableCell>
                <TableCell className={`text-right font-mono text-sm ${row.reclassification !== 0 ? 'text-orange-600 font-semibold' : 'text-gray-400'}`}>
                  {formatNumber(row.reclassification)}
                </TableCell>
                <TableCell className="text-right font-mono text-sm font-bold bg-gray-50/30">
                  {formatNumber(row.finalBalance)}
                </TableCell>
                <TableCell className="text-right font-mono text-sm">
                  {formatNumber(row.priorYear)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ETBTable;
