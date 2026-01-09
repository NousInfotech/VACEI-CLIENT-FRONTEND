"use client";
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card2";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, FileText, CheckCircle2 } from "lucide-react";
import { useReclassifications } from './hooks/useReclassifications';
import { useEtb } from './hooks/useEtb';
import { useEngagement } from './hooks/useEngagement';
import { format } from 'date-fns';
import { formatAmount } from '@/lib/utils';
import { TableSkeleton } from "../shared/CommonSkeletons";

const Reclassification = () => {
  const { engagement } = useEngagement();
  const { reclassifications, loading, error } = useReclassifications(engagement?._id || null);
  const { etb } = useEtb(engagement?._id || null);

  if (loading) {
    return <TableSkeleton rows={8} />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-500">
        <FileText className="w-12 h-12 mb-4 opacity-20" />
        <p>{error}</p>
      </div>
    );
  }

  // Transform API reclassifications to match the expected format
  const transformedReclassifications = reclassifications.map((rc, index) => ({
    _id: rc._id,
    reclassificationNo: `RC${String(index + 1).padStart(3, '0')}`, // Generate reclassification number if not provided
    description: rc.refs?.join(', ') || `Reclassification ${index + 1}`,
    createdAt: new Date().toISOString(), // Use current date if not provided
    status: rc.status || 'active',
    totalDr: rc.dr || 0,
    totalCr: rc.cr || 0,
    entries: rc.entries || [], // API should provide entries
  }));

  const sortedReclassifications = [...(transformedReclassifications || [])].sort((a, b) => {
    return a.reclassificationNo.localeCompare(b.reclassificationNo, undefined, { numeric: true, sensitivity: 'base' });
  });

  if (!sortedReclassifications || sortedReclassifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-500">
        <FileText className="w-12 h-12 mb-4 opacity-20" />
        <p>No reclassifications found for this engagement.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-800">Reclassification Entries</h2>
        <Badge variant="outline" className="px-3 py-1 bg-orange-50 text-orange-700 border-orange-200">
          {sortedReclassifications.length} Total Reclassifications
        </Badge>
      </div>

      <div className="grid gap-6">
        {sortedReclassifications.map((rc) => (
          <Card key={rc._id} className="overflow-hidden border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="bg-slate-50/50 border-b border-gray-300 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-orange-100 text-orange-700 font-bold">
                    {rc.reclassificationNo}
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold text-slate-800">
                      {rc.description || `Reclassification ${rc.reclassificationNo}`}
                    </CardTitle>
                    <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {rc.createdAt ? format(new Date(rc.createdAt), "MMM d, yyyy") : 'N/A'}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-slate-300" />
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                        {rc.status.charAt(0).toUpperCase() + rc.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-1">Total</div>
                  <div className="text-xl font-bold text-slate-900">
                     {formatAmount(rc.totalDr)}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-gray-300">
                    <TableHead className="w-[100px] py-3 text-md font-bold uppercase tracking-wider pl-6 border-r border-gray-300">Code</TableHead>
                    <TableHead className="py-3 text-md font-bold uppercase tracking-wider border-r border-gray-300">Account</TableHead>
                    <TableHead className="py-3 text-md font-bold uppercase tracking-wider text-right border-r border-gray-300">Debit</TableHead>
                    <TableHead className="py-3 text-md font-bold uppercase tracking-wider text-right pr-6">Credit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(rc.entries || []).map((entry: any, idx: number) => (
                    <TableRow key={idx} className="border-gray-300 hover:bg-slate-50/50 transition-colors">
                      <TableCell className="font-medium text-slate-700 pl-6 py-3 border-r border-gray-300">{entry.code || entry.rowId || '-'}</TableCell>
                      <TableCell className="text-slate-600 py-3 border-r border-gray-300">{entry.accountName || '-'}</TableCell>
                      <TableCell className="text-right py-3 text-indigo-600 font-medium border-r border-gray-300">
                        {entry.dr > 0 ? formatAmount(entry.dr) : '-'}
                      </TableCell>
                      <TableCell className="text-right py-3 text-rose-600 font-medium pr-6">
                        {entry.cr > 0 ? formatAmount(entry.cr) : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-slate-50/50 border-t-2 border-slate-100 font-bold hover:bg-slate-50/50">
                    <TableCell colSpan={2} className="py-4 text-slate-800 pl-6 border-r border-gray-300">Cumulative Balance</TableCell>
                    <TableCell className="text-right py-4 text-indigo-700 border-r border-gray-300">{formatAmount(rc.totalDr)}</TableCell>
                    <TableCell className="text-right py-4 text-rose-700 pr-6">{formatAmount(rc.totalCr)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Reclassification;