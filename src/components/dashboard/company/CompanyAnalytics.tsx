"use client";

import React from "react";
import ShadowCard from "@/components/ui/ShadowCard";
import { CheckCircle2, FileText, Calendar, ArrowRight, ShieldCheck } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface AnalyticsCardProps {
  title: string;
  subtitle: string;
  count: number;
  status?: string;
  icon?: any;
  imageSrc?: string;
  iconBg: string;
  iconColor: string;
  trend?: "up" | "down" | "neutral";
  chartColor: string;
}

const AnalyticsCard = ({ title, subtitle, count, status, icon: Icon, imageSrc, iconBg, iconColor, trend, chartColor }: AnalyticsCardProps) => (
  <ShadowCard className="p-5 flex items-center justify-between group cursor-pointer hover:shadow-xl transition-all duration-300 h-full border-none">
    <div className="flex items-center gap-5">
      <div className={cn(
        "w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110",
        !imageSrc && iconBg
      )}>
        {imageSrc ? (
          <Image src={imageSrc} alt={title} width={40} height={40} className="object-contain" />
        ) : (
          Icon && <Icon className={iconColor} size={28} />
        )}
      </div>
      <div>
        <div className="flex items-baseline gap-2">
          <p className="text-2xl font-bold text-[#1A1F2C]">{count}</p>
          <p className="text-sm font-medium text-[#64748B]">{title}</p>
        </div>
        <p className="text-xs font-medium text-[#94A3B8] mt-1 flex items-center gap-2">
          {status && <span className={cn("inline-block w-2 h-2 rounded-full", iconBg.replace('bg-', 'bg-').replace('50', '500'))} />}
          {status || subtitle}
        </p>
      </div>
    </div>
    
    <div className="flex flex-col items-end gap-2">
       {/* Professional Sparkline/Donut Chart */}
       {(title === "Workspace" || title === "Compliance") ? (
         <div className="relative w-16 h-16 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 64 64">
                <defs>
                   <linearGradient id={`${title}Gradient`} x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor={chartColor} stopOpacity="0.8" />
                      <stop offset="100%" stopColor={chartColor} />
                   </linearGradient>
                </defs>
                <circle cx="32" cy="32" r="26" stroke="#F1F5F9" strokeWidth="6" fill="transparent" />
                <circle 
                  cx="32" 
                  cy="32" 
                  r="26" 
                  stroke={`url(#${title}Gradient)`} 
                  strokeWidth="6" 
                  strokeDasharray="163.36" 
                  strokeDashoffset={163.36 - (163.36 * (title === "Compliance" ? count : (count / 20)) / 100)} 
                  fill="transparent" 
                  strokeLinecap="round" 
                  className="drop-shadow-[0_0_8px_rgba(59,130,246,0.3)]"
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[10px] font-bold text-[#1A1F2C] leading-none">
                  {title === "Compliance" ? `${count}%` : count}
                </span>
            </div>
         </div>
       ) : (
         <div className="w-24 h-12 flex items-end relative">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 100 40" preserveAspectRatio="none">
                <defs>
                    <linearGradient id={`area-${title}`} x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor={chartColor} stopOpacity="0.2" />
                        <stop offset="100%" stopColor={chartColor} stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id={`line-${title}`} x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor={chartColor} stopOpacity="0.6" />
                        <stop offset="100%" stopColor={chartColor} />
                    </linearGradient>
                </defs>
                {/* Area Fill */}
                <path 
                    d={title === "Drafts" ? "M0,35 Q25,15 50,30 T100,20 L100,40 L0,40 Z" : "M0,25 Q25,35 50,20 T100,10 L100,40 L0,40 Z"} 
                    fill={`url(#area-${title})`}
                />
                {/* Sparkline */}
                <path 
                    d={title === "Drafts" ? "M0,35 Q25,15 50,30 T100,20" : "M0,25 Q25,35 50,20 T100,10"} 
                    stroke={`url(#line-${title})`} 
                    strokeWidth="3.5" 
                    fill="none"
                    strokeLinecap="round"
                    className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)]"
                />
            </svg>
         </div>
       )}
    </div>
  </ShadowCard>
);

const AnalyticsSkeleton = () => (
  <ShadowCard className="p-5 flex items-center justify-between h-full border-none">
    <div className="flex items-center gap-5">
      <Skeleton className="w-14 h-14 rounded-2xl bg-gray-100" />
      <div className="space-y-2">
        <Skeleton className="h-8 w-12" />
        <Skeleton className="h-4 w-20" />
      </div>
    </div>
    <Skeleton className="w-20 h-8" />
  </ShadowCard>
);

interface CompanyAnalyticsProps {
  isLoading?: boolean;
}

export default function CompanyAnalytics({ isLoading = false }: CompanyAnalyticsProps) {
  if (isLoading) {
    return (
      <ShadowCard className="space-y-4 h-full flex flex-col p-5">
        <Skeleton className="h-7 w-32 mb-4" />
        <div className="grid grid-rows-4 gap-4 flex-1">
          <AnalyticsSkeleton />
          <AnalyticsSkeleton />
          <AnalyticsSkeleton />
          <AnalyticsSkeleton />
        </div>
      </ShadowCard>
    );
  }
  return (
    <ShadowCard className="space-y-4 h-full flex flex-col p-5">
      <div className="flex items-center justify-between shrink-0">
        <h2 className="text-xl font-semibold">Analytics</h2>
        <span className="text-[10px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border border-emerald-100">Live Updates</span>
      </div>
      <div className="grid gap-4 flex-1">
        <AnalyticsCard 
          title="Workspace" 
          subtitle="Active"
          count={12}
          imageSrc="/logo/icons/right-arrow.png"
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
          chartColor="#3B82F6"
        />
        <AnalyticsCard 
          title="Drafts" 
          subtitle="Pending Approval"
          count={6}
          imageSrc="/logo/icons/check.png"
          iconBg="bg-[#ECFDF5]"
          iconColor="text-[#10B981]"
          chartColor="#10B981"
        />
        <AnalyticsCard 
          title="Deadlines" 
          subtitle="Upcoming"
          count={8}
          imageSrc="/logo/icons/cancel.png"
          iconBg="bg-[#FFF8F1]"
          iconColor="text-[#F59E0B]"
          chartColor="#F59E0B"
        />
        <AnalyticsCard 
          title="Compliance" 
          subtitle="Overall Score"
          count={92}
          icon={ShieldCheck}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
          chartColor="#10B981"
        />
      </div>
    </ShadowCard>
  );
}
