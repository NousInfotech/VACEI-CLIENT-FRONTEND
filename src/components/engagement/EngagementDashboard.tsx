"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  ClipboardList,
  FileText,
  Upload,
  CheckCircle2,
  ArrowRight,
  Circle,
  MessageSquare,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import DashboardCard from "../DashboardCard";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface EngagementDashboardProps {
  serviceName: string;
  engagementData: any;
  loading: boolean;
  engagementLoading: boolean;
  allPendingItems: any[];
  engagementTodos: any[];
  documentRequests: any[];
  updates: any[];
  milestones: any[];
  milestonesLoading: boolean;
  updatesLoading: boolean;
  displayCycle: string;
  currentStatusFromTodos: { label: string; color: string };
  isAccounting: boolean;
  isMBRFilings: boolean;
  isBankingPayments: boolean;
  isInternationalStructuring: boolean;
  isRegulatedLicenses: boolean;
  isCryptoAssets: boolean;
  isCFO: boolean;
  isCorporate: boolean;
  isPayroll: boolean;
  isAudit: boolean;
  isTax: boolean;
  isIncorporation: boolean;
  isBusinessPlans: boolean;
  isLiquidation: boolean;
  isVAT?: boolean;
  vatActivePeriod?: any;
  stats?: any[];
  setActiveTab: (tab: string) => void;
  router: any;
  formatMilestoneDate: (m: any) => string;
}

const MilestoneIconMini = ({ status }: { status: string }) => {
  switch (status) {
    case "completed":
      return (
        <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white border-2 border-emerald-50">
          <CheckCircle2 className="w-4 h-4" />
        </div>
      );
    case "in_progress":
      return (
        <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white border-2 border-blue-50">
          <Clock className="w-4 h-4" />
        </div>
      );
    default:
      return (
        <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 border border-dashed border-gray-300">
          <Circle className="w-3.5 h-3.5" />
        </div>
      );
  }
};

const normalizeMilestoneStatus = (
  input: unknown
): "completed" | "in_progress" | "pending" | "skipped" => {
  const s = String(input || "").toLowerCase();
  if (["completed", "done", "closed", "finalized", "achieved"].includes(s))
    return "completed";
  if (["in_progress", "in progress", "active", "working"].includes(s))
    return "in_progress";
  if (["skipped", "skip", "cancelled", "cancel"].includes(s)) return "skipped";
  return "pending";
};

const EngagementDashboard: React.FC<EngagementDashboardProps> = ({
  serviceName,
  engagementData,
  loading,
  engagementLoading,
  allPendingItems,
  engagementTodos,
  documentRequests,
  updates,
  milestones,
  milestonesLoading,
  updatesLoading,
  displayCycle,
  currentStatusFromTodos,
  isAccounting,
  isMBRFilings,
  isBankingPayments,
  isInternationalStructuring,
  isRegulatedLicenses,
  isCryptoAssets,
  isCFO,
  isCorporate,
  isPayroll,
  isAudit,
  isTax,
  isIncorporation,
  isBusinessPlans,
  isLiquidation,
  isVAT,
  vatActivePeriod,
  stats,
  setActiveTab,
  router,
  formatMilestoneDate,
}) => {
  const topDoc = allPendingItems?.[0];

  const handleAction = (item: any) => {
    const itemId = item.id || item._id;
    const isTodo = !documentRequests.some(
      (r: any) => (r.id || r._id) === itemId
    );

    setActiveTab("workFlow");
    if (!isTodo) {
      const params = new URLSearchParams(window.location.search);
      params.set("scrollTo", itemId);
      router.push(`?${params.toString()}`, { scroll: false });
    }
  };


  return (
    <div className="space-y-6">
      {/* Top Stats Bar - Unified for all non-MBR services */}
      <DashboardCard className="p-0 overflow-hidden border-none shadow-sm bg-white">
        <div className="grid grid-cols-1 md:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-gray-100">
          <div className="p-6 space-y-2">
            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">
              Current Period
            </p>
            <div className="flex items-center gap-2 font-semibold">
              <Calendar className="w-4 h-4 text-gray-400" />
                {displayCycle}
            </div>
          </div>
          <div className="p-6 space-y-2 text-center md:text-left">
            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">
              Overall Status
            </p>
            {engagementLoading ? (
              <Skeleton className="h-6 w-24 rounded-full mx-auto md:mx-0" />
            ) : (
              <Badge
                className={cn(
                  "uppercase tracking-tighter rounded-full px-4 text-[15px] font-semibold border",
                  (isBankingPayments ? "ON TRACK" : currentStatusFromTodos.label.toUpperCase()) === "OVERDUE"
                    ? "bg-red-50 text-red-500 border-red-100"
                    : (isBankingPayments ? "ON TRACK" : currentStatusFromTodos.label.toUpperCase()) === "ON TRACK"
                    ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                    : "bg-blue-50 text-blue-600 border-blue-100"
                )}
              >
                {currentStatusFromTodos.label.toUpperCase()}
              </Badge>
            )}
          </div>
          <div className="p-6 space-y-2 text-center md:text-left">
            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">
              Current Cycle Status
            </p>
            <div className="space-y-3">
              <Badge className="bg-blue-50 text-blue-600 border-blue-100 uppercase tracking-tighter rounded-full px-4 text-[15px] font-semibold">
                IN PROGRESS
              </Badge>
              <div className="w-full h-1 bg-blue-100 rounded-full overflow-hidden">
                <div className="w-[65%] h-full bg-blue-500 rounded-full" />
              </div>
            </div>
          </div>
          <div className="p-6 space-y-2 text-center md:text-left">
            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">
              Last Update
            </p>
            <div className="flex items-center justify-center md:justify-start gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-bold text-slate-900">
                {updates && updates.length > 0
                  ? formatMilestoneDate(updates[0])
                  : "Just now"}
              </span>
            </div>
          </div>
          <div className="p-6 space-y-2 text-center md:text-left">
            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">
              Next Step
            </p>
            <div className="flex items-center justify-center md:justify-start gap-2">
              <div className="w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100">
                <div className="w-2 h-2 bg-blue-400 rounded-full shadow-[0_0_8px_rgba(96,165,250,0.6)]" />
              </div>
              <span className="text-sm font-bold text-slate-900 truncate max-w-[100px]">
                {(() => {
                  if (isBankingPayments || isRegulatedLicenses) return engagementData?.nextStep || "N/A";
                  const nextMilestone = milestones?.find(m => {
                    const s = normalizeMilestoneStatus(m.status);
                    return s === 'pending' || s === 'in_progress';
                  });
                  return nextMilestone ? (nextMilestone.title || nextMilestone.label) : "Step-3";
                })()}
              </span>
            </div>
          </div>
        </div>
      </DashboardCard>

      <div className="grid grid-cols-2 gap-6">
        {/* Left Side: Cycle Overview */}
        <DashboardCard className="p-8 space-y-8 bg-white border-none shadow-sm h-full flex flex-col">
          <div className="space-y-6 flex-1">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-8 bg-[#2563EB] rounded-full" />
              <h3 className="text-xl font-bold text-[#1e293b]">Cycle Overview</h3>
            </div>

            <div className="space-y-2 bg-[#F8FAFC]/50 p-6 rounded-2xl border border-[#F1F5F9] relative overflow-hidden group">
              <p className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-widest">
                Current Cycle/Period
              </p>
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold tracking-tight">
                  {displayCycle}
                </h4>
                <Badge
                  className={cn(
                    "uppercase tracking-tighter rounded-full px-4 py-1 text-[11px] font-semibold border-none",
                    (isBankingPayments ? "ON TRACK" : currentStatusFromTodos.label.toUpperCase()) === "OVERDUE"
                      ? "bg-[#FEF2F2] text-[#EF4444]"
                      : "bg-[#EFF6FF] text-[#3B82F6]"
                  )}
                >
                  {isBankingPayments ? "ON TRACK" : currentStatusFromTodos.label.toUpperCase()}
                </Badge>
              </div>
            </div>

            {isAccounting ? (
              /* Accounting Specific Metrics Grid - Matches Image */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { 
                    title: "Total Revenue", 
                    value: stats?.[0]?.value || "€0.00", 
                    change: stats?.[0]?.change || "0%", 
                    type: stats?.[0]?.changeType || "neutral",
                    bg: "bg-[#F8FAFC]",
                    border: "border-[#F1F5F9]"
                  },
                  { 
                    title: "Total Expenses", 
                    value: stats?.[1]?.value || "€0.00", 
                    change: stats?.[1]?.change || "0%", 
                    type: stats?.[1]?.changeType || "neutral",
                    bg: "bg-[#F8FAFC]",
                    border: "border-[#F1F5F9]"
                  },
                  { 
                    title: "Net Profit", 
                    value: stats?.[2]?.value || "€0.00", 
                    change: stats?.[2]?.change || "0%", 
                    type: stats?.[2]?.changeType || "success",
                    bg: "bg-[#F0FDF4]",
                    border: "border-[#DCFCE7]"
                  },
                  { 
                    title: "Pending Entries", 
                    value: String(allPendingItems?.length || 0), 
                    status: "Needs attention",
                    bg: "bg-[#FCF8FF]",
                    border: "border-[#F3E8FF]"
                  }
                ].map((stat, i) => (
                  <div key={i} className={cn("p-5 rounded-2xl border transition-all hover:shadow-md", stat.bg, stat.border)}>
                    <div className="flex items-center gap-2 mb-2">
                      {stat.title === "Net Profit" && <RefreshCw size={14} className="text-[#10B981]" />}
                      <p className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wide">
                        {stat.title}
                      </p>
                    </div>
                    <p className="text-xl font-semibold mb-2">{stat.value}</p>
                    {stat.change ? (
                      <div className={cn(
                        "flex items-center gap-1 text-[11px] font-semibold",
                        stat.type === "increase" || stat.type === "success" ? "text-[#10B981]" : "text-[#EF4444]"
                      )}>
                        {stat.type === "increase" || stat.type === "success" ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        <span>{stat.change} vs last period</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-[11px] font-bold text-[#F59E0B]">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#F59E0B] shadow-[0_0_8px_rgba(245,158,11,0.4)]" />
                        <span>{stat.status}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </DashboardCard>

        {/* Right Side: Action Required */}
        <DashboardCard className="p-8 space-y-6 bg-white border-none shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 bg-red-600 rounded-full" />
            <h3 className="text-xl font-bold text-slate-900">Action Required</h3>
          </div>

          {!topDoc ? (
            <div className="flex items-center gap-4 text-emerald-600 bg-emerald-50/50 p-6 rounded-2xl border border-emerald-100/50">
              <CheckCircle2 className="w-6 h-6 shrink-0" />
              <p className="font-semibold text-sm leading-tight">
                Everything is up to date. Nothing required from you right now.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-red-50/30 border border-red-100/30 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4">
                   <Badge className="bg-red-50 text-red-500 border-red-100 uppercase tracking-tighter rounded-full px-4 text-[10px] font-bold">
                    OVERDUE
                  </Badge>
                </div>
                <div className="space-y-2">
                  <h4 className="text-lg font-bold text-slate-900">
                    Follow up: {topDoc.title || topDoc.name}
                  </h4>
                  <p className="text-sm text-slate-600 font-medium">
                    {topDoc.description || "Review and update compliance for current cycle"}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button
                  className="h-11 px-8 rounded-xl font-bold bg-[#0f172a] text-white hover:bg-black text-[10px] uppercase tracking-widest gap-3 shadow-lg shadow-primary/10"
                  onClick={() => handleAction(topDoc)}
                >
                  <Upload className="w-4 h-4" />
                  Open Task
                </Button>
                {allPendingItems.length > 1 && (
                  <Button
                    variant="outline"
                    className="h-11 px-8 rounded-xl font-bold border-gray-200 text-slate-600 hover:bg-gray-50 text-[10px] uppercase tracking-widest"
                    onClick={() => setActiveTab("workFlow")}
                  >
                    View All ({allPendingItems.length})
                  </Button>
                )}
              </div>
            </div>
          )}
        </DashboardCard>
      </div>

      {/* Bottom Section: Milestones & Updates */}
      <div className="flex flex-col gap-6">
        <DashboardCard className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 bg-gray-900 rounded-full" />
            <h3 className="text-lg font-bold tracking-tight">Milestones</h3>
          </div>
          {milestonesLoading ? (
            <div className="pl-4">
              <Skeleton className="h-32 w-full" />
            </div>
          ) : milestones && milestones.length > 0 ? (
            <div className="relative pl-4 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
              <div className="absolute left-[27px] top-2 bottom-2 w-0.5 bg-gray-100 -translate-x-1/2" />
              <div className="space-y-6">
                {milestones.slice(0, 5).map((m: any, idx: number) => {
                  const status = normalizeMilestoneStatus(m.status);
                  return (
                    <div key={idx} className="flex gap-6 relative group">
                      <div className="relative z-10 pt-1">
                        <MilestoneIconMini status={status} />
                      </div>
                      <div className={cn(
                        "flex-1 p-4 rounded-xl transition-all duration-300 border-l-4",
                        status === 'completed' ? "border-l-emerald-500 bg-white shadow-sm" :
                        status === 'in_progress' ? "border-l-blue-500 bg-blue-50/30 shadow-md ring-1 ring-blue-100" :
                        "border-l-gray-300 bg-white shadow-sm"
                      )}>
                        <div className="flex items-center justify-between gap-4 mb-1">
                          <p className="text-sm font-bold text-slate-900 line-clamp-1">{m.title || m.label}</p>
                          <div className="flex items-center gap-2 shrink-0">
                            <Badge 
                              className={cn(
                                "uppercase tracking-widest px-2 py-0.5 text-[9px] font-semibold border-none shadow-none",
                                status === 'completed' ? "bg-emerald-50 text-emerald-600" :
                                status === 'in_progress' ? "bg-blue-50 text-blue-600" :
                                "bg-gray-100 text-gray-500"
                              )}
                            >
                              {status.replace('_', ' ')}
                            </Badge>
                            <span className="text-[10px] font-semibold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">
                              {formatMilestoneDate(m)}
                            </span>
                          </div>
                        </div>
                        {m.description && (
                          <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                            {m.description}
                          </p>
                        )}                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 px-4 text-center bg-gray-50/50 rounded-2xl border border-dashed border-gray-200 mx-2">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100 mb-3 text-gray-400">
                <ClipboardList className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-700">No milestones yet</h4>
              <p className="text-xs text-gray-500 mt-1 max-w-[200px]">Milestones will appear here once the engagement progresses.</p>
            </div>
          )}
        </DashboardCard>

        <DashboardCard className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 bg-gray-900 rounded-full" />
              <h3 className="text-lg font-bold tracking-tight">Updates</h3>
            </div>
            {updates && updates.length > 0 && (
              <Button variant="ghost" size="sm" className="text-xs font-bold text-blue-600 hover:text-blue-800 uppercase tracking-widest p-0 h-auto" onClick={() => setActiveTab("messages")}>
                View All
              </Button>
            )}
          </div>
          <div className="space-y-3 overflow-y-auto max-h-[400px]">
            {updatesLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-24 w-full rounded-xl" />
                <Skeleton className="h-24 w-full rounded-xl" />
              </div>
            ) : (updates || []).slice(0, 5).map((item: any, idx: number) => (
              <div key={idx} className="p-4 bg-white border border-gray-100 rounded-xl border-l-4 border-l-primary/30 shadow-sm">
                <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold mb-2">
                  <Clock className="w-3" />
                  <span>{new Date(item.createdAt || item.updatedAt || item.date).toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
                {item.title && <h4 className="text-sm font-bold text-slate-900 mb-1">{item.title}</h4>}
                <p className="text-sm text-gray-600 line-clamp-2">{item.message || item.action}</p>
              </div>
            ))}
            {(!updates || updates.length === 0) && !updatesLoading && (
              <div className="flex flex-col items-center justify-center py-8 px-4 text-center bg-gray-50/50 rounded-2xl border border-dashed border-gray-200 mt-2">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100 mb-3 text-blue-400">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-700">No updates yet</h4>
                <p className="text-xs text-gray-500 mt-1 max-w-[200px]">Updates related to this engagement will appear here.</p>
              </div>
            )}
          </div>
        </DashboardCard>
      </div>
    </div>
  );
};

export default EngagementDashboard;
