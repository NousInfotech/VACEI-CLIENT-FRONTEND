"use client";

import React from "react";
import { ChevronRight, CheckCircle2, Clock, Calendar, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import ShadowCard from "@/components/ui/ShadowCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface Engagement {
  id: string;
  name: string;
  status: string; // The workflow status (e.g. "Waiting for Information")
  complianceStatus: "OVERDUE" | "DUE_TODAY" | "DUE_SOON" | "ACTION_REQUIRED" | "ACTION_TAKEN" | "COMPLETED" | "ON_TRACK";
  href: string;
}

interface ActiveEngagementsListProps {
  engagements: Engagement[];
  isLoading?: boolean;
}

const COMPLIANCE_STYLES: Record<Engagement["complianceStatus"], { label: string; color: string; bgColor: string; icon: React.ReactNode }> = {
  OVERDUE: { 
    label: "Overdue", 
    color: "text-red-600", 
    bgColor: "bg-red-50", 
    icon: <Clock className="text-red-500" size={24} /> 
  },
  DUE_TODAY: { 
    label: "Due today", 
    color: "text-amber-600", 
    bgColor: "bg-amber-50", 
    icon: <Calendar className="text-amber-500" size={24} /> 
  },
  DUE_SOON: { 
    label: "Due soon", 
    color: "text-yellow-600", 
    bgColor: "bg-yellow-50", 
    icon: <Calendar className="text-yellow-500" size={24} /> 
  },
  ACTION_REQUIRED: { 
    label: "Action required", 
    color: "text-orange-600", 
    bgColor: "bg-orange-50", 
    icon: <AlertCircle className="text-orange-500" size={24} /> 
  },
  ACTION_TAKEN: { 
    label: "Action taken", 
    color: "text-blue-600", 
    bgColor: "bg-blue-50", 
    icon: <CheckCircle2 className="text-blue-500" size={24} /> 
  },
  COMPLETED: { 
    label: "Completed", 
    color: "text-emerald-600", 
    bgColor: "bg-emerald-50", 
    icon: <CheckCircle2 className="text-emerald-500" size={24} /> 
  },
  ON_TRACK: { 
    label: "On track", 
    color: "text-emerald-600", 
    bgColor: "bg-emerald-50", 
    icon: <CheckCircle2 className="text-emerald-500" size={24} /> 
  },
};

export default function ActiveEngagementsList({ engagements, isLoading = false }: ActiveEngagementsListProps) {
  if (isLoading) {
    return (
      <ShadowCard className="h-full flex flex-col p-5">
        <div className="flex items-center justify-between mb-4 shrink-0 px-2">
          <Skeleton className="h-7 w-48" />
        </div>
        <div className="space-y-3 flex-1">
          {[1, 2, 3, 4].map((i) => (
            <ShadowCard key={i} className="p-4 flex items-center justify-between border-none">
              <div className="flex items-center gap-4 flex-1">
                <Skeleton className="w-12 h-12 rounded-2xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
              <Skeleton className="h-8 w-24 rounded-full" />
            </ShadowCard>
          ))}
        </div>
      </ShadowCard>
    );
  }
  return (
    <ShadowCard className="h-full flex flex-col p-5">
      <div className="flex items-center justify-between mb-4 shrink-0 px-2">
        <h2 className="text-xl font-semibold px-2">Active Engagements</h2>
      </div>

      <div className="space-y-3 max-h-[430px] overflow-y-auto px-2 py-1 custom-scrollbar flex-1">
        {engagements.map((engagement) => {
          const style = COMPLIANCE_STYLES[engagement.complianceStatus] || COMPLIANCE_STYLES.ON_TRACK;
          
          return (
            <Link key={engagement.id} href={engagement.href} className="block">
              <ShadowCard 
                className="p-4 flex items-center justify-between group cursor-pointer hover:bg-white/80 hover:shadow-md transition-all duration-300"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0",
                    style.bgColor
                  )}>
                    {style.icon}
                  </div>
                  
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-[#334155]">{engagement.name}</h4>
                    <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mt-0.5">
                      {engagement.status}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-8">
                  <div className="flex items-center gap-3">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap",
                      style.bgColor,
                      style.color
                    )}>
                      {style.label}
                    </span>
                    <ChevronRight size={20} className="text-[#CBD5E1] group-hover:text-[#1A1F2C] transition-colors" />
                  </div>
                </div>
              </ShadowCard>
            </Link>
          );
        })}
      </div>

      {/* <div className="pt-6 mt-6 border-t border-gray-100 shrink-0">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-[#1A1F2C]">AI Suggestions</h3>
            </div>
            <p className="text-[#64748B] text-sm">Here&apos;s what needs your attention:</p>
          </div>
          
          <div className="flex items-center gap-3">
            <Link href="/dashboard/todo-list">
              <Button variant="default">
                View to-do list
              </Button>
            </Link>
            <Link href="/dashboard/compliance">
              <Button variant="outline">
                Open compliance
              </Button>
            </Link>
          </div>
        </div>
      </div> */}
    </ShadowCard>
  );
}
