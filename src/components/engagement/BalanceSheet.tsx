"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Scale,
  AlertTriangle,
  ChevronDown,
  ChevronsDown,
  ChevronsUp,
  Download,
} from "lucide-react";
import { TableSkeleton } from "../shared/CommonSkeletons";

interface BalanceSheetProps {
  data: any;
}

const formatNumber = (num: number) =>
  new Intl.NumberFormat("en-US").format(num);

const BalanceSheet: React.FC<BalanceSheetProps> = ({ data }) => {
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

  if (!data) return <TableSkeleton rows={15} />;

  const balanceSheet = data.balance_sheet;
  const prior_year = balanceSheet?.prior_year;
  const current_year = balanceSheet?.current_year;
  const isBalanced = current_year?.balanced ?? false;
  const difference = (current_year?.totals?.total_assets?.value ?? 0) - (current_year?.totals?.total_equity_and_liabilities?.value ?? 0);
  const priorDifference = (prior_year?.totals?.total_assets?.value ?? 0) - (prior_year?.totals?.total_equity_and_liabilities?.value ?? 0);

  const handleDownloadPDF = (_detailed?: boolean) => {
    setIsDownloadOpen(false);
    // PDF export could be implemented with jsPDF like partner portal
  };

  return (
    <div className="p-6 space-y-6 h-full flex flex-col">
      {/* Header – match VACEI_PARTNER_PORTAL */}
      <div className="flex justify-between items-start shrink-0">
        <div className="flex gap-3">
          <div className="p-2 bg-gray-100 rounded-lg h-fit">
            <Scale size={24} className="text-gray-900" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Balance Sheet</h2>
            <p className="text-gray-500 mt-1">
              {data?.balance_sheet?.current_year?.year
                ? `As at Dec 31, ${data.balance_sheet.current_year.year}`
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
              className="gap-2 bg-[#0F172A] hover:bg-[#1E293B] text-white border-transparent"
              onClick={() => setIsDownloadOpen((prev) => !prev)}
            >
              <Download size={18} />
              Download PDF
              <ChevronDown size={16} />
            </Button>
            {isDownloadOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 py-3 z-50 animate-in fade-in zoom-in-95 duration-100">
                <button
                  onClick={() => handleDownloadPDF(true)}
                  className="w-full text-left px-4 py-3 text-sm text-[#0F172A] hover:bg-gray-50 flex items-center gap-3 transition-colors"
                >
                  <Scale size={18} className="text-gray-400" />
                  <span>
                    Download Balance Sheet<br />
                    <span className="text-gray-500">(Detailed)</span>
                  </span>
                </button>
                <button
                  onClick={() => handleDownloadPDF(false)}
                  className="w-full text-left px-4 py-3 text-sm text-[#0F172A] hover:bg-gray-50 flex items-center gap-3 transition-colors"
                >
                  <Scale size={18} className="text-gray-400" />
                  <span>Download Balance Sheet</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Error Banner – match VACEI_PARTNER_PORTAL */}
      {balanceSheet && !isBalanced && (
        <div className="bg-red-50 border border-red-100 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="text-red-600 shrink-0 mt-0.5" size={20} />
          <div>
            <h4 className="font-bold text-red-900">Balance Sheet does not balance!</h4>
            <p className="text-sm text-red-700 mt-1">
              The accounting equation (Assets = Liabilities + Equity) is not satisfied. Please review your classifications.
            </p>
          </div>
        </div>
      )}

      {/* Content Table – match partner grid layout */}
      <div className="flex-1 border border-gray-200 rounded-xl overflow-hidden flex flex-col bg-white">
        <div className="grid grid-cols-[1fr_80px_120px_120px] bg-[rgb(253,230,138)] font-bold text-gray-900 text-sm">
          <div className="px-6 py-3">Description</div>
          <div className="px-6 py-3">Notes</div>
          <div className="px-6 py-3 text-right">
            {balanceSheet?.current_year?.year || "Current Year"}
          </div>
          <div className="px-6 py-3 text-right">
            {balanceSheet?.prior_year?.year || "Prior Year"}
          </div>
        </div>

        {!balanceSheet ? (
          <div className="flex-1 bg-white p-6 text-center text-gray-400 text-sm">
            No data available for display yet.
          </div>
        ) : (
        <div className="flex-1 overflow-y-auto">
          {/* ASSETS Section */}
          <div className="bg-gray-200/50 px-6 py-3 font-bold text-xs text-gray-700 uppercase tracking-wider">
            ASSETS
          </div>
          <div className="grid grid-cols-[1fr_80px_120px_120px] px-6 py-2 text-sm text-gray-700">
            <div className="font-medium">Assets</div>
            <div></div>
            <div className="text-right font-bold">
              {formatNumber(current_year?.totals?.assets?.value ?? 0)}
            </div>
            <div className="text-right text-gray-500">
              {formatNumber(prior_year?.totals?.assets?.value ?? 0)}
            </div>
          </div>
          <div className="grid grid-cols-[1fr_80px_120px_120px] bg-[rgb(253,230,138)] px-6 py-3 text-sm font-bold border-y border-yellow-200">
            <div>Total Assets</div>
            <div></div>
            <div className="text-right">
              {formatNumber(current_year?.totals?.total_assets?.value ?? 0)}
            </div>
            <div className="text-right">
              {formatNumber(prior_year?.totals?.total_assets?.value ?? 0)}
            </div>
          </div>

          {/* EQUITY AND LIABILITIES Section */}
          <div className="bg-gray-200/50 px-6 py-3 font-bold text-xs text-gray-700 uppercase tracking-wider mt-4">
            EQUITY AND LIABILITIES
          </div>
          <div className="bg-gray-100/50 px-6 py-2 font-bold text-xs text-gray-600 uppercase tracking-wider">
            LIABILITIES
          </div>
          <div className="grid grid-cols-[1fr_80px_120px_120px] px-6 py-2 text-sm text-gray-700">
            <div className="font-medium">Liabilities</div>
            <div></div>
            <div className="text-right font-bold">
              {formatNumber(current_year?.totals?.liabilities?.value ?? 0)}
            </div>
            <div className="text-right text-gray-500">
              {formatNumber(prior_year?.totals?.liabilities?.value ?? 0)}
            </div>
          </div>
          <div className="bg-gray-100/50 px-6 py-2 font-bold text-xs text-gray-600 uppercase tracking-wider mt-4">
            EQUITY
          </div>
          <div className="grid grid-cols-[1fr_80px_120px_120px] px-6 py-2 text-sm text-gray-700">
            <div className="font-medium">Equity</div>
            <div></div>
            <div className="text-right font-bold">
              {formatNumber(current_year?.totals?.equity?.value ?? 0)}
            </div>
            <div className="text-right text-gray-500">
              {formatNumber(prior_year?.totals?.equity?.value ?? 0)}
            </div>
          </div>
          <div className="grid grid-cols-[1fr_80px_120px_120px] bg-[rgb(253,230,138)]/50 px-6 py-3 text-sm font-bold border-y border-yellow-200">
            <div>Total Equity</div>
            <div></div>
            <div className="text-right">
              {formatNumber(current_year?.totals?.equity?.value ?? 0)}
            </div>
            <div className="text-right">
              {formatNumber(prior_year?.totals?.equity?.value ?? 0)}
            </div>
          </div>
          <div className="grid grid-cols-[1fr_80px_120px_120px] bg-[rgb(253,230,138)] px-6 py-3 text-sm font-bold border-y border-yellow-200 mt-4">
            <div>Total Equity and Liabilities</div>
            <div></div>
            <div className="text-right">
              {formatNumber(current_year?.totals?.total_equity_and_liabilities?.value ?? 0)}
            </div>
            <div className="text-right">
              {formatNumber(prior_year?.totals?.total_equity_and_liabilities?.value ?? 0)}
            </div>
          </div>

          {/* Balance Check Row */}
          <div
            className={`grid grid-cols-[1fr_80px_120px_120px] px-6 py-3 text-sm font-bold border-t-2 ${
              isBalanced ? "bg-green-50 border-green-500 text-green-900" : "bg-red-50 border-red-500 text-gray-900"
            }`}
          >
            <div>Balance Check (Assets = Liabilities + Equity)</div>
            <div></div>
            <div className="text-right">{formatNumber(difference)}</div>
            <div className="text-right">{formatNumber(priorDifference)}</div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
};

export default BalanceSheet;
