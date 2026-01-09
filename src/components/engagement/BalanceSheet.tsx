"use client"

import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card2";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { 
  Scale, 
  CheckCircle2, 
  AlertCircle, 
  ArrowUpRight, 
  ArrowDownRight,
  ChevronDown,
  ChevronRight,
  ChevronsDown,
  ChevronsUp,
  FileText,
  Info,
  Download
} from "lucide-react";
import { formatAmount } from '@/lib/utils';
import { TableSkeleton } from '../shared/CommonSkeletons';

interface BalanceSheetProps {
  data: any;
}

const BalanceSheet: React.FC<BalanceSheetProps> = ({ data }) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [retainedEarningsInfoOpen, setRetainedEarningsInfoOpen] = useState(false);

  if (!data || !data.balance_sheet) return <TableSkeleton rows={15} />;

  const clientLoading = false; 
  const client = data.company;
  const engagement = data.engagement;

  const { prior_year, current_year } = data.balance_sheet;
  const currentYearLabel = `31 Dec ${current_year.year}`;
  const priorYearLabel = `31 Dec ${prior_year.year}`;

  const toggleSection = (id: string) => {
    setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const expandAll = () => {
    const all: Record<string, boolean> = {};
    const traverse = (nodes: any[], path: string) => {
      nodes.forEach(n => {
        const id = `${path}-${n.group}`;
        all[id] = true;
        if (n.children) traverse(n.children, id);
      });
    };
    traverse(data.lead_sheets || [], "root");
    setExpandedSections(all);
  };

  const collapseAll = () => setExpandedSections({});

  const formatTotalValue = (val: number) => {
    if (val === 0) return "-";
    return formatAmount(Math.abs(val));
  };

  const formatTableRowValue = (val: number) => {
    if (val === 0) return "-";
    return formatAmount(Math.abs(val));
  };


  const getAccount = (id: string) => data.etb?.find((r: any) => r._id === id);

  const renderComparison = (current: number, prior: number) => {
    if (prior === 0) return null;
    const diff = current - prior;
    const percent = ((Math.abs(diff) / Math.abs(prior)) * 100).toFixed(1);
    const isPositive = diff >= 0;

    return (
      <div className={`flex items-center gap-1 text-xs font-medium ${isPositive ? 'text-green-600' : 'text-rose-600'}`}>
        {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
        {percent}%
      </div>
    );
  };

  const renderRecursive = (node: any, path: string, level: number) => {
    const sectionId = `${path}-${node.group}`;
    const isExpanded = expandedSections[sectionId];
    const hasChildren = node.children && node.children.length > 0;
    const isDirect = node.group === "_direct_";

    if (isDirect && !hasChildren && (!node.rows || node.rows.length === 0)) return null;

    return (
      <React.Fragment key={sectionId}>
        {!isDirect && (
          <TableRow 
            className={`cursor-pointer transition-colors border-t border-gray-200 ${isExpanded ? 'bg-slate-50' : 'hover:bg-slate-50'}`}
            onClick={() => toggleSection(sectionId)}
          >
            <TableCell className="py-4" style={{ paddingLeft: `${level * 1.5 + 2}rem` }}>
              <div className="flex items-center gap-3">
                {hasChildren || (node.rows && node.rows.length > 0) ? (
                  isExpanded ? (
                    <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
                  ) : (
                    <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
                  )
                ) : (
                  <div className="w-4" />
                )}
                <span className={`text-sm ${level === 1 ? 'font-bold text-slate-800 uppercase' : 'font-semibold text-slate-700'}`}>
                  {node.group}
                  {node.group === "Retained earnings" && (
                     <button 
                        onClick={(e) => { e.stopPropagation(); setRetainedEarningsInfoOpen(!retainedEarningsInfoOpen); }}
                        className="ml-2 text-primary hover:text-primary/80"
                     >
                        <Info className="h-3 w-3" />
                     </button>
                  )}
                </span>
              </div>
              {node.group === "Retained earnings" && retainedEarningsInfoOpen && (
                 <div className="mt-2 p-3 bg-blue-50 rounded-lg text-xs text-blue-800 space-y-1 ml-7 mr-4 border border-blue-100 shadow-sm animate-in slide-in-from-top-2 duration-200">
                    <div className="flex justify-between">
                       <span>Prior Year ({priorYearLabel}):</span>
                       <span className="font-bold">€ {data.retained_earnings?.prior_year?.value?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                       <span>Current Year Profit:</span>
                       <span className="font-bold">€ {data.income_statement?.current_year?.net_result?.toLocaleString()}</span>
                    </div>
                    <div className="pt-1 border-t border-blue-200 flex justify-between font-black">
                       <span>Calculated Balance:</span>
                       <span>€ {data.retained_earnings?.current_year?.value?.toLocaleString()}</span>
                    </div>
                 </div>
              )}
            </TableCell>
            <TableCell className="py-4"></TableCell>
            <TableCell className="py-4 text-right font-bold text-slate-900">
              {formatTableRowValue(node.totals?.finalBalance || 0)}
            </TableCell>
            <TableCell className="py-4 text-right font-bold text-slate-500">
              {formatTableRowValue(node.totals?.priorYear || 0)}
            </TableCell>
          </TableRow>
        )}

        {/* Recurse into children */}
        {(isExpanded || isDirect) && node.children?.map((child: any) => 
          renderRecursive(child, sectionId, isDirect ? level : level + 1)
        )}

        {/* Render rows */}
        {(isExpanded || isDirect) && node.rows?.map((rowId: string) => {
          const row = getAccount(rowId);
          if (!row) return null;
          return (
            <TableRow key={rowId} className="hover:bg-amber-50/30 transition-colors border-b border-gray-100">
              <TableCell 
                className="py-3 text-xs text-slate-600"
                style={{ paddingLeft: `${(isDirect ? level : level + 1) * 1.5 + 3}rem` }}
              >
                {row.accountName}
              </TableCell>
              <TableCell className="py-3 text-[10px] font-mono text-slate-400">
                {row.code || ""}
              </TableCell>
              <TableCell className="py-3 text-right text-xs text-slate-800 italic">
                {formatTableRowValue(row.finalBalance || 0)}
              </TableCell>
              <TableCell className="py-3 text-right text-xs text-slate-400">
                {formatTableRowValue(row.priorYear || 0)}
              </TableCell>
            </TableRow>
          );
        })}
      </React.Fragment>
    );
  };

  const calculations = {
    balanceCurrent: current_year.totals.assets.value - (current_year.totals.liabilities.value + current_year.totals.equity.value),
    balancePrior: prior_year.totals.assets.value - (prior_year.totals.liabilities.value + prior_year.totals.equity.value),
  };

  const assetsNode = data.lead_sheets?.find((n: any) => n.group === "Assets");
  const liabilitiesNode = data.lead_sheets?.find((n: any) => n.group === "Liabilities");
  const equityNode = data.lead_sheets?.find((n: any) => n.group === "Equity");

  return (
    <div className="h-full flex flex-col animate-in fade-in duration-500 rounded-xl shadow-sm border border-gray-200 bg-white">
      {/* Header - Aligned with Income Statement */}
      <div className="p-6 border-b bg-linear-to-r from-amber-50 to-yellow-50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Scale className="h-6 w-6 text-amber-600" />
              Balance Sheet
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {client?.name || "Client Name"} • {currentYearLabel}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={expandAll}
              variant="outline"
              size="sm"
              className="text-xs border-amber-200 hover:bg-amber-100"
            >
              <ChevronsDown className="h-3 w-3 mr-1" />
              Expand All
            </Button>
            <Button
              onClick={collapseAll}
              variant="outline"
              size="sm"
              className="text-xs border-amber-200 hover:bg-amber-100"
            >
              <ChevronsUp className="h-3 w-3 mr-1" />
              Collapse All
            </Button>
                   <Button 
                className="bg-amber-600 hover:bg-amber-700 text-white min-w-[140px]"
            >
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6 bg-slate-50/30">
        <div className="space-y-6">
          {/* Status Message */}
          {current_year.balanced ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-full">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-bold text-green-800 text-sm">✓ Balance Sheet is balanced</p>
                <p className="text-xs text-green-700 opacity-90">The accounting equation (Assets = Liabilities + Equity) is satisfied.</p>
              </div>
            </div>
          ) : (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-center gap-3">
              <div className="p-2 bg-rose-100 rounded-full">
                <AlertCircle className="h-5 w-5 text-rose-600" />
              </div>
              <div>
                <p className="font-bold text-rose-800 text-sm">⚠️ Balance Sheet does not balance!</p>
                <p className="text-xs text-rose-700 opacity-90">The accounting equation (Assets = Liabilities + Equity) is not satisfied. Please review your classifications.</p>
              </div>
            </div>
          )}

          <Card className="border-gray-200 shadow-lg overflow-hidden pb-4 bg-card">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-amber-100 sticky top-0 z-10">
                  <tr className="border-b-2 border-amber-200">
                    <th className="text-left p-4 font-bold text-slate-800 uppercase tracking-wider text-xs">Description</th>
                    <th className="text-left p-4 font-bold text-slate-800 uppercase tracking-wider text-xs w-24">Notes</th>
                    <th className="text-right p-4 font-bold text-slate-800 uppercase tracking-wider text-xs w-48">
                      {currentYearLabel} <span className="lowercase font-normal opacity-60 text-[10px]">(€)</span>
                    </th>
                    <th className="text-right p-4 font-bold text-slate-800 uppercase tracking-wider text-xs w-48">
                      {priorYearLabel} <span className="lowercase font-normal opacity-60 text-[10px]">(€)</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {/* Assets */}
                  <tr className="bg-indigo-50/50">
                    <td colSpan={2} className="p-4 font-semibold text-indigo-900 uppercase tracking-widest text-sm">Assets</td>
                    <td className="p-4 text-right font-semibold text-indigo-700">€ {formatTotalValue(current_year.totals.assets.value)}</td>
                    <td className="p-4 text-right font-bold">€ {formatTotalValue(prior_year.totals.assets.value)}</td>
                  </tr>
                  {assetsNode && renderRecursive(assetsNode, "root", 0)}

                  {/* Liabilities & Equity */}
                  <tr className="bg-rose-50/50 border-t-4 border-slate-100">
                    <td colSpan={2} className="p-4 font-semibold text-rose-900 uppercase tracking-widest text-sm">Liabilities & Equity</td>
                    <td className="p-4 text-right font-semibold text-rose-700">€ {formatTotalValue(current_year.totals.liabilities.value + current_year.totals.equity.value)}</td>
                    <td className="p-4 text-right font-bold">€ {formatTotalValue(prior_year.totals.liabilities.value + prior_year.totals.equity.value)}</td>
                  </tr>

                  {liabilitiesNode && renderRecursive(liabilitiesNode, "root", 0)}
                  {equityNode && renderRecursive(equityNode, "root", 0)}

                  {/* Final Balance Verification */}
                  <tr className={`${Math.abs(calculations.balanceCurrent) < 1 ? 'bg-emerald-600' : 'bg-red-100'} text-white`}>
                    <td className="p-5 font-bold text-black text-sm uppercase tracking-widest">Balance Check (Assets = Liabilities + Equity)</td>
                    <td className="p-5"></td>
                    <td className="p-5 text-right font-bold text-black text-2xl">
                      € {formatTotalValue(calculations.balanceCurrent)}
                    </td>
                    <td className="p-5 text-right font-bold text-black text-lg">
                      € {formatTotalValue(calculations.balancePrior)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BalanceSheet;
