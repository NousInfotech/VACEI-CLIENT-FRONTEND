import React, { useState, useCallback } from 'react';
import { ETBRow } from './mockEngagementData';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TableProperties, Info, Loader2 } from 'lucide-react';
import EmptyState from '../shared/EmptyState';
import { Modal } from '@/components/ui/modal';
import { getAdjustments, getReclassifications } from '@/api/auditService';
import type { Adjustment, Reclassification } from '@/api/auditService';

interface ETBTableProps {
  data: ETBRow[];
  engagementId?: string | null;
}

const ETBTable: React.FC<ETBTableProps> = ({ data, engagementId }) => {
  const [showAdjustmentDetails, setShowAdjustmentDetails] = useState(false);
  const [selectedRowForAdjustments, setSelectedRowForAdjustments] = useState<ETBRow | null>(null);
  const [adjustmentsForRow, setAdjustmentsForRow] = useState<Adjustment[]>([]);
  const [loadingAdjustments, setLoadingAdjustments] = useState(false);

  const [showReclassificationDetails, setShowReclassificationDetails] = useState(false);
  const [selectedRowForReclassifications, setSelectedRowForReclassifications] = useState<ETBRow | null>(null);
  const [reclassificationsForRow, setReclassificationsForRow] = useState<Reclassification[]>([]);
  const [loadingReclassifications, setLoadingReclassifications] = useState(false);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-GB', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const showAdjustmentDetailsForRow = useCallback(async (row: ETBRow) => {
    setSelectedRowForAdjustments(row);
    setShowAdjustmentDetails(true);
    setAdjustmentsForRow([]);
    setLoadingAdjustments(true);
    try {
      if (!engagementId) {
        setLoadingAdjustments(false);
        return;
      }
      const all = await getAdjustments(engagementId);
      const relevant = all.filter((adj) =>
        adj.entries?.some((e) => e.code === row.code)
      );
      setAdjustmentsForRow(relevant);
    } catch (err) {
      console.error('Error fetching adjustments:', err);
      setAdjustmentsForRow([]);
    } finally {
      setLoadingAdjustments(false);
    }
  }, [engagementId]);

  const showReclassificationDetailsForRow = useCallback(async (row: ETBRow) => {
    setSelectedRowForReclassifications(row);
    setShowReclassificationDetails(true);
    setReclassificationsForRow([]);
    setLoadingReclassifications(true);
    try {
      if (!engagementId) {
        setLoadingReclassifications(false);
        return;
      }
      const all = await getReclassifications(engagementId);
      const relevant = all.filter((rc) =>
        rc.entries?.some((e) => e.code === row.code)
      );
      setReclassificationsForRow(relevant);
    } catch (err) {
      console.error('Error fetching reclassifications:', err);
      setReclassificationsForRow([]);
    } finally {
      setLoadingReclassifications(false);
    }
  }, [engagementId]);

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
                  <div className="flex items-center justify-end gap-2">
                    <span className="tabular-nums">
                      {row.reclassification !== 0 ? formatNumber(row.reclassification) : '-'}
                    </span>
                    {row.reclassification !== 0 && row.reclassification != null && engagementId && (
                      <button
                        type="button"
                        onClick={() => showReclassificationDetailsForRow(row)}
                        className="p-1 hover:bg-blue-100 rounded text-blue-600 transition-colors"
                        title="View reclassification details"
                      >
                        <Info size={14} />
                      </button>
                    )}
                  </div>
                </TableCell>
                <TableCell className={`text-right font-mono text-sm border-r border-gray-200 p-3 ${row.adjustments !== 0 ? "text-gray-700 font-semibold" : "text-gray-400"}`}>
                  <div className="flex items-center justify-end gap-2">
                    <span className="tabular-nums">
                      {row.adjustments !== 0 ? formatNumber(row.adjustments) : '-'}
                    </span>
                    {row.adjustments !== 0 && row.adjustments != null && engagementId && (
                      <button
                        type="button"
                        onClick={() => showAdjustmentDetailsForRow(row)}
                        className="p-1 hover:bg-blue-100 rounded text-blue-600 transition-colors"
                        title="View adjustment details"
                      >
                        <Info size={14} />
                      </button>
                    )}
                  </div>
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

      {/* Adjustment Details Modal – matches VACEI_PARTNER_PORTAL layout */}
      <Modal
        isOpen={showAdjustmentDetails}
        onClose={() => setShowAdjustmentDetails(false)}
        title="Adjustment Details"
        size="xl"
      >
        <div className="space-y-4 max-h-[70vh] overflow-y-auto">
          <p className="text-sm text-gray-600">
            Adjustments affecting{' '}
            <span className="font-semibold text-gray-900">
              {selectedRowForAdjustments?.code} - {selectedRowForAdjustments?.accountName}
            </span>
          </p>
          {loadingAdjustments ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              <span className="ml-2 text-sm text-gray-600">Loading adjustments...</span>
            </div>
          ) : adjustmentsForRow.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Info className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No adjustments found for this row</p>
              <p className="text-xs mt-1">
                The adjustment value may have been set directly or come from a different source.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {adjustmentsForRow.map((adj) => {
                const rowCode = selectedRowForAdjustments?.code ?? '';
                const netImpactOnRow =
                  adj.entries
                    ?.filter((e) => e.code === rowCode)
                    .reduce((sum, line) => sum + (line.dr - line.cr), 0) ?? 0;
                const totalDr = adj.entries?.reduce((s, e) => s + e.dr, 0) ?? 0;
                const totalCr = adj.entries?.reduce((s, e) => s + e.cr, 0) ?? 0;
                return (
                  <div key={adj._id} className="border border-blue-200 rounded-lg p-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">
                          {adj.code ?? adj._id}
                        </span>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            adj.status === 'POSTED'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {adj.status ?? 'DRAFT'}
                        </span>
                        <span className="text-sm text-gray-600">
                          {adj.refs?.[0] ?? 'No description'}
                        </span>
                      </div>
                      <div className="border rounded-lg overflow-hidden">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-3 py-2 text-left border-r border-gray-200">Code</th>
                              <th className="px-3 py-2 text-left border-r border-gray-200">Account</th>
                              <th className="px-3 py-2 text-right border-r border-gray-200">Debit</th>
                              <th className="px-3 py-2 text-right border-r border-gray-200">Credit</th>
                              <th className="px-3 py-2 text-left">Details</th>
                            </tr>
                          </thead>
                          <tbody>
                            {adj.entries?.map((line, idx) => {
                              const isClickedRow = line.code === rowCode;
                              return (
                                <tr
                                  key={idx}
                                  className={`border-t border-gray-100 ${isClickedRow ? 'bg-blue-50 font-semibold' : ''}`}
                                >
                                  <td className="px-3 py-2 border-r border-gray-100 font-mono text-xs">
                                    {line.code ?? '-'}
                                    {isClickedRow && (
                                      <span className="ml-2 px-1 py-0.5 bg-blue-200 rounded text-xs">
                                        This row
                                      </span>
                                    )}
                                  </td>
                                  <td className="px-3 py-2 border-r border-gray-100">{line.accountName ?? '-'}</td>
                                  <td className="px-3 py-2 border-r border-gray-100 text-right">
                                    {line.dr ? formatCurrency(line.dr) : '-'}
                                  </td>
                                  <td className="px-3 py-2 border-r border-gray-100 text-right">
                                    {line.cr ? formatCurrency(line.cr) : '-'}
                                  </td>
                                  <td className="px-3 py-2 text-xs text-gray-600">
                                    {line.reason ?? '-'}
                                  </td>
                                </tr>
                              );
                            })}
                            <tr className="border-t bg-gray-100 font-semibold">
                              <td colSpan={2} className="px-3 py-2 border-r border-gray-200">
                                TOTAL
                              </td>
                              <td className="px-3 py-2 border-r border-gray-200 text-right">
                                {formatCurrency(totalDr)}
                              </td>
                              <td className="px-3 py-2 border-r border-gray-200 text-right">
                                {formatCurrency(totalCr)}
                              </td>
                              <td className="px-3 py-2">
                                <span
                                  className={`px-2 py-1 rounded text-xs ${
                                    totalDr === totalCr
                                      ? 'bg-green-100 text-green-700'
                                      : 'bg-red-100 text-red-700'
                                  }`}
                                >
                                  {totalDr === totalCr ? 'Balanced' : 'Unbalanced'}
                                </span>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      <div className="flex items-center justify-between text-sm bg-blue-50 p-3 rounded border border-blue-200">
                        <span className="font-medium">
                          Net impact on {selectedRowForAdjustments?.accountName}:
                        </span>
                        <span className="font-bold text-lg">{formatCurrency(netImpactOnRow)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Modal>

      {/* Reclassification Details Modal – matches VACEI_PARTNER_PORTAL layout */}
      <Modal
        isOpen={showReclassificationDetails}
        onClose={() => setShowReclassificationDetails(false)}
        title="Reclassification Details"
        size="xl"
      >
        <div className="space-y-4 max-h-[70vh] overflow-y-auto">
          <p className="text-sm text-gray-600">
            Reclassifications affecting{' '}
            <span className="font-semibold text-gray-900">
              {selectedRowForReclassifications?.code} - {selectedRowForReclassifications?.accountName}
            </span>
          </p>
          {loadingReclassifications ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              <span className="ml-2 text-sm text-gray-600">Loading reclassifications...</span>
            </div>
          ) : reclassificationsForRow.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Info className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No reclassifications found for this row</p>
              <p className="text-xs mt-1">
                The reclassification value may have been set directly or come from a different source.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {reclassificationsForRow.map((rc) => {
                const rowCode = selectedRowForReclassifications?.code ?? '';
                const netImpactOnRow =
                  rc.entries
                    ?.filter((e) => e.code === rowCode)
                    .reduce((sum, line) => sum + (line.dr - line.cr), 0) ?? 0;
                const totalDr = rc.entries?.reduce((s, e) => s + e.dr, 0) ?? 0;
                const totalCr = rc.entries?.reduce((s, e) => s + e.cr, 0) ?? 0;
                return (
                  <div key={rc._id} className="border border-blue-200 rounded-lg p-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">
                          {rc.code ?? rc._id}
                        </span>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            rc.status === 'POSTED'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {rc.status ?? 'DRAFT'}
                        </span>
                        <span className="text-sm text-gray-600">
                          {rc.refs?.[0] ?? 'No description'}
                        </span>
                      </div>
                      <div className="border rounded-lg overflow-hidden">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-3 py-2 text-left border-r border-gray-200">Code</th>
                              <th className="px-3 py-2 text-left border-r border-gray-200">Account</th>
                              <th className="px-3 py-2 text-right border-r border-gray-200">Debit</th>
                              <th className="px-3 py-2 text-right border-r border-gray-200">Credit</th>
                              <th className="px-3 py-2 text-left">Details</th>
                            </tr>
                          </thead>
                          <tbody>
                            {rc.entries?.map((line, idx) => {
                              const isClickedRow = line.code === rowCode;
                              return (
                                <tr
                                  key={idx}
                                  className={`border-t border-gray-100 ${isClickedRow ? 'bg-blue-50 font-semibold' : ''}`}
                                >
                                  <td className="px-3 py-2 border-r border-gray-100 font-mono text-xs">
                                    {line.code ?? '-'}
                                    {isClickedRow && (
                                      <span className="ml-2 px-1 py-0.5 bg-blue-200 rounded text-xs">
                                        This row
                                      </span>
                                    )}
                                  </td>
                                  <td className="px-3 py-2 border-r border-gray-100">{line.accountName ?? '-'}</td>
                                  <td className="px-3 py-2 border-r border-gray-100 text-right">
                                    {line.dr ? formatCurrency(line.dr) : '-'}
                                  </td>
                                  <td className="px-3 py-2 border-r border-gray-100 text-right">
                                    {line.cr ? formatCurrency(line.cr) : '-'}
                                  </td>
                                  <td className="px-3 py-2 text-xs text-gray-600">
                                    {line.reason ?? '-'}
                                  </td>
                                </tr>
                              );
                            })}
                            <tr className="border-t bg-gray-100 font-semibold">
                              <td colSpan={2} className="px-3 py-2 border-r border-gray-200">
                                TOTAL
                              </td>
                              <td className="px-3 py-2 border-r border-gray-200 text-right">
                                {formatCurrency(totalDr)}
                              </td>
                              <td className="px-3 py-2 border-r border-gray-200 text-right">
                                {formatCurrency(totalCr)}
                              </td>
                              <td className="px-3 py-2">
                                <span
                                  className={`px-2 py-1 rounded text-xs ${
                                    totalDr === totalCr
                                      ? 'bg-green-100 text-green-700'
                                      : 'bg-red-100 text-red-700'
                                  }`}
                                >
                                  {totalDr === totalCr ? 'Balanced' : 'Unbalanced'}
                                </span>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      <div className="flex items-center justify-between text-sm bg-blue-50 p-3 rounded border border-blue-200">
                        <span className="font-medium">
                          Net impact on {selectedRowForReclassifications?.accountName}:
                        </span>
                        <span className="font-bold text-lg">{formatCurrency(netImpactOnRow)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default ETBTable;
