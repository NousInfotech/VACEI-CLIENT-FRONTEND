"use client"
import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card2";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Loader2, 
  ChevronsDown, 
  ChevronsUp, 
  ChevronDown, 
  ChevronRight,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Download
} from "lucide-react";
import { formatAmount } from '@/lib/utils';

interface IncomeStatementProps {
  data: any;
}

const GROUPING_ORDER = [
  "Revenue",
  "Cost of sales",
  "Other operating income",
  "Sales and marketing expenses",
  "Administrative expenses",
  "Investment income",
  "Investment losses",
  "Finance costs",
  "Share of profit of subsidiary",
  "PBT Expenses",
  "Income tax expense"
];

const IncomeStatement: React.FC<IncomeStatementProps> = ({ data }) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const clientLoading = false; // Mocking loading state
  const client = data.company;
  const engagement = data.engagement;

  const { prior_year, current_year } = data.income_statement;
  const currentYearLabel = `FY${current_year.year}`;
  const priorYearLabel = `FY${prior_year.year}`;

  const groupedData = useMemo(() => {
    const result: Record<string, Record<string, any[]>> = {};
    if (!data.etb) return result;

    data.etb.forEach((row: any) => {
      const parts = row.classification?.split(" > ") || [];
      if (parts[0] === "Equity" && parts[1] === "Current Year Profits & Losses") {
        const g3 = parts[2];
        const g4 = parts[3] || "_direct_";
        if (!result[g3]) result[g3] = {};
        if (!result[g3][g4]) result[g3][g4] = [];
        result[g3][g4].push(row);
      }
    });
    return result;
  }, [data.etb]);

  const calculations = useMemo(() => {
    const getV = (yearObj: any, g3: string) => yearObj.breakdowns[g3]?.value || 0;

    const revC = getV(current_year, "Revenue");
    const cosC = getV(current_year, "Cost of sales");
    const revP = getV(prior_year, "Revenue");
    const cosP = getV(prior_year, "Cost of sales");

    const grossProfitCurrent = revC - cosC;
    const grossProfitPrior = revP - cosP;

    const opExpC = (getV(current_year, "Sales and marketing expenses") + 
                   getV(current_year, "Administrative expenses") - 
                   getV(current_year, "Other operating income"));
    const opExpP = (getV(prior_year, "Sales and marketing expenses") + 
                   getV(prior_year, "Administrative expenses") - 
                   getV(prior_year, "Other operating income"));

    const operatingProfitCurrent = grossProfitCurrent - opExpC;
    const operatingProfitPrior = grossProfitPrior - opExpP;

    const otherC = (getV(current_year, "Investment income") - 
                    getV(current_year, "Investment losses") - 
                    getV(current_year, "Finance costs") + 
                    getV(current_year, "Share of profit of subsidiary") - 
                    getV(current_year, "PBT Expenses"));
    const otherP = (getV(prior_year, "Investment income") - 
                    getV(prior_year, "Investment losses") - 
                    getV(prior_year, "Finance costs") + 
                    getV(prior_year, "Share of profit of subsidiary") - 
                    getV(prior_year, "PBT Expenses"));

    const netProfitBeforeTaxCurrent = operatingProfitCurrent + otherC;
    const netProfitBeforeTaxPrior = operatingProfitPrior + otherP;

    const taxC = getV(current_year, "Income tax expense");
    const taxP = getV(prior_year, "Income tax expense");

    const netProfitAfterTaxCurrent = netProfitBeforeTaxCurrent - taxC;
    const netProfitAfterTaxPrior = netProfitBeforeTaxPrior - taxP;

    return {
      grossProfitCurrent,
      grossProfitPrior,
      operatingProfitCurrent,
      operatingProfitPrior,
      netProfitBeforeTaxCurrent,
      netProfitBeforeTaxPrior,
      netProfitAfterTaxCurrent,
      netProfitAfterTaxPrior,
      getValue: (g3: string, period: "current" | "prior") => {
        return getV(period === "current" ? current_year : prior_year, g3);
      },
      getGroup4Total: (g3: string, g4: string, period: "current" | "prior") => {
        const rows = groupedData[g3]?.[g4] || [];
        return rows.reduce((acc, row) => acc + (period === "current" ? (row.finalBalance || 0) : (row.priorYear || 0)), 0);
      }
    };
  }, [current_year, prior_year, groupedData]);

  const toggleSection = (id: string) => {
    setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const expandAll = () => {
    const all: Record<string, boolean> = {};
    GROUPING_ORDER.forEach(g3 => {
      all[g3] = true;
      if (groupedData[g3]) {
        Object.keys(groupedData[g3]).forEach(g4 => {
          all[`${g3}-${g4}`] = true;
        });
      }
    });
    setExpandedSections(all);
  };

  const collapseAll = () => setExpandedSections({});

  const formatTableRowValue = (val: number, grouping3: string) => {
    if (val === 0) return "-";
    return formatAmount(Math.abs(val));
  };

  const formatTotalValue = (val: number) => {
    return formatAmount(Math.abs(val));
  };


  return (
    <div className="h-full flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b bg-linear-to-r from-amber-50 to-yellow-50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FileText className="h-6 w-6 text-amber-600" />
              Income Statement
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {clientLoading ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Loading client...
                </span>
              ) : (
                <>
                  {client?.name || engagement?.title || "Client Name"} • For the year ended{" "}
                  {currentYearLabel}
                </>
              )}
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
        <Card className="border-gray-200 shadow-lg overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-amber-100 sticky top-0 z-10">
                  <tr className="border-b-2 border-amber-200">
                    <th className="text-left p-4 font-bold text-slate-800 uppercase tracking-wider text-xs">Description</th>
                    <th className="text-left p-4 font-bold text-slate-800 uppercase tracking-wider text-xs w-24">Notes</th>
                    <th className="text-right p-4 font-bold text-slate-800 uppercase tracking-wider text-xs w-40">
                      {currentYearLabel} <span className="lowercase font-normal opacity-60 text-[10px]">(€)</span>
                    </th>
                    <th className="text-right p-4 font-bold text-slate-800 uppercase tracking-wider text-xs w-40">
                      {priorYearLabel} <span className="lowercase font-normal opacity-60 text-[10px]">(€)</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const operatingSections = ["Sales and marketing expenses", "Administrative expenses", "Other operating income"];
                    const lastOperatingSection = operatingSections.slice().reverse().find(section => groupedData[section] && Object.keys(groupedData[section]).length > 0);
                    
                    const netProfitSections = ["Investment income", "Investment losses", "Finance costs", "Share of profit of subsidiary", "PBT Expenses"];
                    const lastNetProfitSection = netProfitSections.slice().reverse().find(section => groupedData[section] && Object.keys(groupedData[section]).length > 0);

                    return GROUPING_ORDER.map((grouping3, idx) => {
                      const group4Map = groupedData[grouping3];
                      if (!group4Map || Object.keys(group4Map).length === 0) return null;

                      const currentValue = calculations.getValue(grouping3, "current");
                      const priorValue = calculations.getValue(grouping3, "prior");

                      const showOperatingProfit = grouping3 === lastOperatingSection;
                      const showNetProfitBeforeTax = grouping3 === lastNetProfitSection;

                      const isGroup3Expanded = expandedSections[grouping3];

                      return (
                        <React.Fragment key={grouping3}>
                          {/* Grouping3 Header with Toggle */}
                          <tr 
                            className={`border-t border-slate-200 cursor-pointer transition-colors ${isGroup3Expanded ? 'bg-slate-50' : 'hover:bg-slate-50'}`}
                            onClick={() => toggleSection(grouping3)}
                          >
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                {isGroup3Expanded ? (
                                  <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
                                ) : (
                                  <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
                                )}
                                <span className="font-bold text-slate-800 uppercase tracking-tight">{grouping3}</span>
                              </div>
                            </td>
                            <td className="p-4"></td>
                            <td className="p-4 text-right font-bold text-slate-900">
                              {formatTableRowValue(currentValue, grouping3)}
                            </td>
                            <td className="p-4 text-right font-bold text-slate-500">
                              {formatTableRowValue(priorValue, grouping3)}
                            </td>
                          </tr>

                          {/* Group4 level and rows */}
                          {isGroup3Expanded && Object.entries(group4Map).map(([group4, rows]) => {
                            const hasGroup4 = group4 !== "_direct_";
                            const group4Key = `${grouping3}-${group4}`;
                            const isGroup4Expanded = expandedSections[group4Key];

                            return (
                              <React.Fragment key={group4}>
                                {/* Group4 Header */}
                                {hasGroup4 && (
                                  <tr 
                                    className="bg-slate-50/50 border-t border-slate-100 cursor-pointer hover:bg-slate-100/50"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleSection(group4Key);
                                    }}
                                  >
                                    <td className="p-3 pl-12">
                                      <div className="flex items-center gap-2">
                                        {isGroup4Expanded ? (
                                          <ChevronDown className="h-3 w-3 shrink-0 text-slate-300" />
                                        ) : (
                                          <ChevronRight className="h-3 w-3 shrink-0 text-slate-300" />
                                        )}
                                        <span className="font-semibold text-slate-700 text-sm">{group4}</span>
                                      </div>
                                    </td>
                                    <td className="p-3"></td>
                                    <td className="p-3 text-right text-sm font-semibold text-slate-800">
                                      {formatTableRowValue(
                                        calculations.getGroup4Total(grouping3, group4, "current"),
                                        grouping3
                                      )}
                                    </td>
                                    <td className="p-3 text-right text-sm font-semibold text-slate-400">
                                      {formatTableRowValue(
                                        calculations.getGroup4Total(grouping3, group4, "prior"),
                                        grouping3
                                      )}
                                    </td>
                                  </tr>
                                )}

                                {/* Detail Rows */}
                                {(!hasGroup4 || isGroup4Expanded) && rows.map((row) => (
                                  <tr
                                    key={row._id}
                                    className="border-b border-slate-50 hover:bg-indigo-50/30 transition-colors"
                                  >
                                    <td className={`p-3 ${hasGroup4 ? 'pl-20' : 'pl-16'} text-xs text-slate-600`}>
                                      {row.accountName}
                                    </td>
                                    <td className="p-3 text-[10px] font-mono text-slate-400">
                                      {row.code || ""}
                                    </td>
                                    <td className="p-3 text-right text-xs text-slate-800 italic">
                                      {formatTableRowValue(row.finalBalance || 0, grouping3)}
                                    </td>
                                    <td className="p-3 text-right text-xs text-slate-400">
                                      {formatTableRowValue(row.priorYear || 0, grouping3)}
                                    </td>
                                  </tr>
                                ))}
                              </React.Fragment>
                            );
                          })}

                          {/* Subtotals */}
                          {grouping3 === "Cost of sales" && (
                            <tr className="bg-amber-50/50 border-t border-b-2 border-amber-200 shadow-inner">
                              <td className="p-4 font-bold text-amber-900 uppercase tracking-wider text-xs">Gross Profit</td>
                              <td className="p-4"></td>
                              <td className="p-4 text-right font-semibold text-amber-700 text-lg">
                                {formatTotalValue(calculations.grossProfitCurrent)}
                              </td>
                              <td className="p-4 text-right font-bold">
                                {formatTotalValue(calculations.grossProfitPrior)}
                              </td>
                            </tr>
                          )}

                          {showOperatingProfit && (
                            <tr className="bg-indigo-50/50 border-t border-b-2 border-indigo-200">
                              <td className="p-4 font-bold text-indigo-900 uppercase tracking-wider text-xs">Operating Profit</td>
                              <td className="p-4"></td>
                              <td className="p-4 text-right font-semibold text-indigo-700 text-lg">
                                {formatTotalValue(calculations.operatingProfitCurrent)}
                              </td>
                              <td className="p-4 text-right font-bold">
                                {formatTotalValue(calculations.operatingProfitPrior)}
                              </td>
                            </tr>
                          )}

                          {showNetProfitBeforeTax && (
                            <tr className="bg-purple-50/50 border-t border-b-2 border-purple-200">
                              <td className="p-4 font-bold text-purple-900 uppercase tracking-wider text-xs">Net Profit Before Tax</td>
                              <td className="p-4"></td>
                              <td className="p-4 text-right font-semibold text-purple-700 text-lg">
                                {formatTotalValue(calculations.netProfitBeforeTaxCurrent)}
                              </td>
                              <td className="p-4 text-right font-bold">
                                {formatTotalValue(calculations.netProfitBeforeTaxPrior)}
                              </td>
                            </tr>
                          )}

                          {grouping3 === "Income tax expense" && (
                            <tr className="bg-emerald-50 border-t-4 border-emerald-500 shadow-xl">
                              <td className="p-5 font-black text-emerald-900 uppercase tracking-widest text-sm">Net Profit for the Year</td>
                              <td className="p-5"></td>
                              <td className="p-5 text-right font-semibold text-emerald-700 text-2xl">
                                € {formatTotalValue(calculations.netProfitAfterTaxCurrent)}
                              </td>
                              <td className="p-5 text-right font-bold text-lg">
                                € {formatTotalValue(calculations.netProfitAfterTaxPrior)}
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    });
                  })()}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div> 
  );
};

export default IncomeStatement;
