import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card2";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, FileText, CheckCircle2, History, Paperclip } from "lucide-react";
import { MOCK_ENGAGEMENT_DATA, AdjustmentEntry } from './mockEngagementData';
import { format } from 'date-fns';

const AdjustmentsTab = () => {
  const { adjustments } = MOCK_ENGAGEMENT_DATA;

  const sortedAdjustments = [...(adjustments || [])].sort((a, b) => {
    return a.adjustmentNo.localeCompare(b.adjustmentNo, undefined, { numeric: true, sensitivity: 'base' });
  });

  if (!sortedAdjustments || sortedAdjustments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-500">
        <FileText className="w-12 h-12 mb-4 opacity-20" />
        <p>No adjustments found for this engagement.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-800">Adjusting Journal Entries</h2>
        <Badge variant="outline" className="px-3 py-1 bg-blue-50 text-blue-700 border-blue-200">
          {sortedAdjustments.length} Total Adjustments
        </Badge>
      </div>

      <div className="grid gap-6">
        {sortedAdjustments.map((adj) => (
          <Card key={adj._id} className="overflow-hidden border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-indigo-100 text-indigo-700 font-bold">
                    {adj.adjustmentNo}
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold text-slate-800">
                      {adj.description || `Adjustment ${adj.adjustmentNo}`}
                    </CardTitle>
                    <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {format(new Date(adj.createdAt), "MMM d, yyyy")}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-slate-300" />
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                        {adj.status.charAt(0).toUpperCase() + adj.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-1">Total Impact</div>
                  <div className="text-xl font-bold text-slate-900">
                     € {adj.totalDr.toLocaleString()}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/30 hover:bg-slate-50/30 border-none">
                    <TableHead className="w-[100px] py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider pl-6">Code</TableHead>
                    <TableHead className="py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Account Description</TableHead>
                    <TableHead className="py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Debit (€)</TableHead>
                    <TableHead className="py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right pr-6">Credit (€)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {adj.entries.map((entry: AdjustmentEntry, idx: number) => (
                    <TableRow key={idx} className="border-slate-100 hover:bg-slate-50/50 transition-colors">
                      <TableCell className="font-medium text-slate-700 pl-6 py-3">{entry.code}</TableCell>
                      <TableCell className="text-slate-600 py-3">{entry.accountName}</TableCell>
                      <TableCell className="text-right py-3 text-indigo-600 font-medium">
                        {entry.dr > 0 ? entry.dr.toLocaleString() : '-'}
                      </TableCell>
                      <TableCell className="text-right py-3 text-rose-600 font-medium pr-6">
                        {entry.cr > 0 ? entry.cr.toLocaleString() : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-slate-50/50 border-t-2 border-slate-100 font-bold hover:bg-slate-50/50">
                    <TableCell colSpan={2} className="py-4 text-slate-800 pl-6">Cumulative Balance</TableCell>
                    <TableCell className="text-right py-4 text-indigo-700">€ {adj.totalDr.toLocaleString()}</TableCell>
                    <TableCell className="text-right py-4 text-rose-700 pr-6">€ {adj.totalCr.toLocaleString()}</TableCell>
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


export default AdjustmentsTab;