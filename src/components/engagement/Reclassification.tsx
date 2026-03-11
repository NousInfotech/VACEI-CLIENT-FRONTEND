"use client";
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card2";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText } from "lucide-react";
import { useReclassifications } from './hooks/useReclassifications';
import { useEngagement } from './hooks/useEngagement';
import { formatAmount } from '@/lib/utils';
import { TableSkeleton } from "../shared/CommonSkeletons";

const Reclassification = () => {
  const { engagement } = useEngagement();
  const engagementId = engagement?.id ?? engagement?._id ?? null;
  const { reclassifications, loading, error } = useReclassifications(engagementId);

  if (loading) {
    return <TableSkeleton rows={8} />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <FileText className="w-12 h-12 mb-4 opacity-20" />
        <p>{error}</p>
      </div>
    );
  }

  // Transform API reclassifications to match the expected format (use backend code when present)
  const transformedReclassifications = reclassifications.map((rc, index) => ({
    _id: rc._id,
    reclassificationNo: rc.code || `RC${String(index + 1).padStart(3, '0')}`,
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
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <FileText className="w-12 h-12 mb-4 opacity-20" />
        <p>No reclassifications found for this engagement.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Reclassifications</h2>
          <p className="text-gray-500 mt-1">Manage audit reclassifications for this engagement</p>
        </div>
        <Badge variant="outline" className="px-3 py-1 bg-gray-100 text-gray-600 border-gray-200">
          {sortedReclassifications.length} Total Reclassifications
        </Badge>
      </div>

      <div className="grid gap-6">
        {sortedReclassifications.map((rc) => (
          <Card key={rc._id} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm overflow-hidden">
            <CardHeader className="bg-gray-50/50 border-b border-gray-200 py-4 px-0">
              <div className="flex justify-between items-start gap-6">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium">
                    {rc.reclassificationNo}
                  </span>
                  <span className={`px-3 py-1 rounded-lg text-xs font-bold ${(rc.status || "").toUpperCase() === "POSTED" ? "bg-gray-900 text-white" : "bg-yellow-100 text-yellow-800"}`}>
                    {rc.status?.charAt(0).toUpperCase() + rc.status?.slice(1) || "Draft"}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Total</div>
                  <div className="text-xl font-bold text-gray-900">{formatAmount(rc.totalDr)}</div>
                </div>
              </div>
              <p className="text-gray-500 text-sm mt-2">{rc.description || `Reclassification ${rc.reclassificationNo}`}</p>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-hidden rounded-lg border border-gray-100">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/50 border-b border-gray-200">
                      <TableHead className="w-16 px-4 py-3 text-left font-medium text-gray-500 border-r border-gray-200">Code</TableHead>
                      <TableHead className="px-4 py-3 text-left font-medium text-gray-500 border-r border-gray-200">Account</TableHead>
                      <TableHead className="w-32 px-4 py-3 text-right font-medium text-gray-500 border-r border-gray-200">DR</TableHead>
                      <TableHead className="w-32 px-4 py-3 text-right font-medium text-gray-500">CR</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-gray-50">
                    {(rc.entries || []).map((entry: any, idx: number) => (
                      <TableRow key={idx} className="border-b border-gray-100">
                        <TableCell className="px-4 py-3 text-gray-900 font-mono text-sm border-r border-gray-200">{entry.code || entry.rowId || "-"}</TableCell>
                        <TableCell className="px-4 py-3 text-gray-900 border-r border-gray-200">{entry.accountName || "-"}</TableCell>
                        <TableCell className="px-4 py-3 text-right text-gray-900 font-medium border-r border-gray-200">
                          {entry.dr > 0 ? formatAmount(entry.dr) : "-"}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-right text-gray-900 font-medium">
                          {entry.cr > 0 ? formatAmount(entry.cr) : "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-gray-50/50 font-bold border-t border-gray-200">
                      <TableCell colSpan={2} className="px-4 py-3 text-gray-900 border-r border-gray-200">Total</TableCell>
                      <TableCell className="px-4 py-3 text-right text-gray-900 border-r border-gray-200">{formatAmount(rc.totalDr)}</TableCell>
                      <TableCell className="px-4 py-3 text-right text-gray-900">{formatAmount(rc.totalCr)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Reclassification;