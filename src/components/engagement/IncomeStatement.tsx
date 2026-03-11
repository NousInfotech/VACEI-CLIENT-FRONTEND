"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FileText, ChevronDown, ChevronsDown, ChevronsUp, Download } from "lucide-react";
import { TableSkeleton } from "../shared/CommonSkeletons";

interface IncomeStatementProps {
  data: any;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Exact partner row order (VACEI_PARTNER_PORTAL IncomeStatement.tsx)
const OPERATING_KEYS = ["Sales and marketing expenses", "Administrative expenses"];
const OTHER_KEYS = [
  "Other operating income",
  "Investment income",
  "Other Gains/Losses",
  "Finance costs",
  "Income tax expense",
];

const IncomeStatement: React.FC<IncomeStatementProps> = ({ data }) => {
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);
  const downloadRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (downloadRef.current && !downloadRef.current.contains(event.target as Node)) {
        setIsDownloadOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!data) return <TableSkeleton rows={12} />;

  const incomeStatement = data.income_statement;
  const prior_year = incomeStatement?.prior_year;
  const current_year = incomeStatement?.current_year;
  const currentYearLabel = current_year?.year ?? "Current Year";
  const priorYearLabel = prior_year?.year ?? "Prior Year";
  const breakdownsCur = current_year?.breakdowns ?? {};
  const breakdownsPrior = prior_year?.breakdowns ?? {};

  const getVal = (yearBreakdowns: Record<string, { value: number }>, key: string) =>
    yearBreakdowns[key]?.value ?? 0;

  // Partner displays Gross Profit = Revenue.value + Cost of sales.value (always show row)
  const grossProfitCur =
    getVal(breakdownsCur, "Revenue") + getVal(breakdownsCur, "Cost of sales");
  const grossProfitPrior =
    getVal(breakdownsPrior, "Revenue") + getVal(breakdownsPrior, "Cost of sales");

  const handleDownloadPDF = () => {
    setIsDownloadOpen(false);
  };

  return (
    <div className="p-6 space-y-6 h-full flex flex-col">
      {/* Header – match VACEI_PARTNER_PORTAL */}
      <div className="flex justify-between items-start shrink-0">
        <div className="flex gap-3">
          <div className="p-2 bg-gray-100 rounded-lg h-fit">
            <FileText size={24} className="text-gray-900" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Income Statement</h2>
            <p className="text-gray-500 mt-1">
              {incomeStatement?.current_year?.year
                ? `For the year ended ${incomeStatement.current_year.year}`
                : "Loading..."}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="ghost" className="gap-2 text-gray-600">
            <ChevronsDown size={18} />
            Expand All
          </Button>
          <Button variant="ghost" className="gap-2 text-gray-600">
            <ChevronsUp size={18} />
            Collapse All
          </Button>
          <div className="relative" ref={downloadRef}>
            <Button
              className="gap-2 bg-[#D97706] hover:bg-[#B45309] text-white border-transparent"
              onClick={() => setIsDownloadOpen((prev) => !prev)}
            >
              <Download size={18} />
              Download PDF
              <ChevronDown size={16} />
            </Button>
            {isDownloadOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                <button
                  onClick={handleDownloadPDF}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <FileText size={16} className="text-gray-400" />
                  Download Income Statement (Detailed)
                </button>
                <button
                  onClick={handleDownloadPDF}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <FileText size={16} className="text-gray-400" />
                  Download Income Statement
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content Table – match partner grid layout */}
      <div className="flex-1 border border-gray-200 rounded-xl overflow-hidden flex flex-col bg-white">
        <div className="grid grid-cols-[1fr_80px_120px_120px] bg-[rgb(253,230,138)] font-bold text-gray-900 text-sm">
          <div className="px-6 py-3">Description</div>
          <div className="px-6 py-3">Notes</div>
          <div className="px-6 py-3 text-right">{String(currentYearLabel)}</div>
          <div className="px-6 py-3 text-right">{String(priorYearLabel)}</div>
        </div>

        {!incomeStatement ? (
          <div className="flex-1 bg-white p-6 text-center text-gray-400 text-sm">
            No data available for display yet.
          </div>
        ) : (
        <div className="flex-1 overflow-y-auto">
          {/* Revenue – always show to mirror partner layout */}
          <div className="grid grid-cols-[1fr_80px_120px_120px] px-6 py-2 text-sm border-b border-gray-100">
            <div className="text-gray-900 font-medium">Revenue</div>
            <div></div>
            <div className="text-right text-gray-900">
              {formatCurrency(getVal(breakdownsCur, "Revenue"))}
            </div>
            <div className="text-right text-gray-500">
              {formatCurrency(getVal(breakdownsPrior, "Revenue"))}
            </div>
          </div>

          {/* Cost of sales – always show */}
          <div className="grid grid-cols-[1fr_80px_120px_120px] px-6 py-2 text-sm border-b border-gray-100">
            <div className="text-gray-900 font-medium">Cost of sales</div>
            <div></div>
            <div className="text-right text-gray-900">
              {formatCurrency(getVal(breakdownsCur, "Cost of sales"))}
            </div>
            <div className="text-right text-gray-500">
              {formatCurrency(getVal(breakdownsPrior, "Cost of sales"))}
            </div>
          </div>

          {/* Gross Profit – partner: border-b-2 border-gray-300 bg-gray-50 (gray, not yellow) */}
          <div className="grid grid-cols-[1fr_80px_120px_120px] px-6 py-3 text-sm font-bold border-b-2 border-gray-300 bg-gray-50">
            <div className="text-gray-900">Gross Profit</div>
            <div></div>
            <div className="text-right text-gray-900">{formatCurrency(grossProfitCur)}</div>
            <div className="text-right text-gray-500">{formatCurrency(grossProfitPrior)}</div>
          </div>

          {/* Operating Expenses – always show all rows */}
          {OPERATING_KEYS.map((key) => (
            <div
              key={key}
              className="grid grid-cols-[1fr_80px_120px_120px] px-6 py-2 text-sm border-b border-gray-100"
            >
              <div className="text-gray-700">{key}</div>
              <div></div>
              <div className="text-right text-gray-900">
                {formatCurrency(getVal(breakdownsCur, key))}
              </div>
              <div className="text-right text-gray-500">
                {formatCurrency(getVal(breakdownsPrior, key))}
              </div>
            </div>
          ))}

          {/* Other items – always show all rows */}
          {OTHER_KEYS.map((key) => (
            <div
              key={key}
              className="grid grid-cols-[1fr_80px_120px_120px] px-6 py-2 text-sm border-b border-gray-100"
            >
              <div className="text-gray-700">{key}</div>
              <div></div>
              <div className="text-right text-gray-900">
                {formatCurrency(getVal(breakdownsCur, key))}
              </div>
              <div className="text-right text-gray-500">
                {formatCurrency(getVal(breakdownsPrior, key))}
              </div>
            </div>
          ))}

          {/* Net Result */}
          <div className="grid grid-cols-[1fr_80px_120px_120px] px-6 py-4 text-sm font-bold border-t-2 border-gray-300 bg-[rgb(253,230,138)]">
            <div className="text-gray-900">
              {current_year?.resultType === "net_profit" ? "Net Profit" : "Net Loss"}
            </div>
            <div></div>
            <div
              className={`text-right ${
                current_year?.resultType === "net_profit" ? "text-green-700" : "text-red-700"
              }`}
            >
              {formatCurrency(Math.abs(current_year?.net_result ?? 0))}
            </div>
            <div
              className={`text-right ${
                prior_year?.resultType === "net_profit" ? "text-green-700" : "text-red-700"
              }`}
            >
              {formatCurrency(Math.abs(prior_year?.net_result ?? 0))}
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
};

export default IncomeStatement;
