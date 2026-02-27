"use client";

import React from "react";
import Link from "next/link";
import DashboardCard from "@/components/DashboardCard";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  activeCompany?: string;
  badge?: React.ReactNode;
  badgeHref?: string;
  riskLevel?: {
    level: string;
    color: string;
  };
  actions?: React.ReactNode;
  className?: string;
  variant?: "dark" | "light";
  animate?: boolean;
  todoStats?: {
    completed: number;
    total: number;
    healthStatus: 'Action Required' | 'Healthy';
  };
  todoStatsHref?: string;
}

export const PageHeader = ({
  title,
  subtitle,
  description,
  icon: Icon,
  activeCompany,
  badge,
  badgeHref,
  riskLevel,
  actions,
  className,
  variant = "dark",
  animate = true,
  todoStats,
  todoStatsHref,
}: PageHeaderProps) => {
  const hasStatusBar = !!(activeCompany || badge || riskLevel || todoStats);
  const isLight = variant === "light";

  return (
    <DashboardCard 
      animate={animate} 
      className={cn(
        "p-8 border-white/10",
        isLight ? "bg-white border-slate-200 shadow-sm" : "bg-[#0f1729]",
        className
      )}
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            {Icon && (
              <div className={cn(
                "w-12 h-12 rounded-lg flex items-center justify-center border shrink-0 shadow-sm",
                isLight ? "bg-slate-50 border-slate-100" : "bg-white/15 border-white/30"
              )}>
                <Icon className={cn("w-6 h-6", isLight ? "text-primary-color-new" : "text-white")} />
              </div>
            )}
            <div className="space-y-1">
              <h1 className={cn("text-3xl font-semibold tracking-tight", isLight ? "text-slate-900" : "text-white")}>
                {title}
              </h1>
              {subtitle && <p className={isLight ? "text-slate-500 font-medium" : "text-white/60 font-medium"}>{subtitle}</p>}
              {description && (
                <p className={cn("text-sm max-w-2xl pt-2 leading-relaxed", isLight ? "text-slate-500" : "text-white/50")}>
                  {description}
                </p>
              )}
            </div>
          </div>
          
          {hasStatusBar && (
            <div className="flex flex-wrap items-center gap-4">
              {activeCompany && (
                <div className={cn(
                  "border rounded-xl px-4 py-2 flex items-center gap-3 shadow-sm",
                  isLight ? "bg-slate-50 border-slate-200" : "bg-white/5 border-white/10"
                )}>
                  <span className={cn("text-xs font-medium uppercase tracking-widest", isLight ? "text-slate-400" : "text-white/80")}>Company</span>
                  <div className={cn("h-4 w-px", isLight ? "bg-slate-200" : "bg-white/10")} />
                  <span className={cn("text-sm font-bold", isLight ? "text-slate-900" : "text-white")}>{activeCompany}</span>
                </div>
              )}
              
              {badge && (
                badgeHref ? (
                  <Link href={badgeHref} className="cursor-pointer hover:opacity-80 transition-opacity">
                    {badge}
                  </Link>
                ) : (
                  <div className="flex items-center">
                    {badge}
                  </div>
                )
              )}

              {riskLevel && (
                <Link 
                  href="/dashboard/compliance" 
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-xl border font-bold text-xs uppercase tracking-widest shadow-sm cursor-pointer hover:opacity-80 transition-opacity",
                    isLight ? "bg-slate-50 border-slate-200 text-slate-900" : "bg-white/5 border-white/10 text-white"
                  )}
                >
                  <span className={cn(
                    "w-2 h-2 rounded-full",
                    riskLevel.level === "High" ? "bg-destructive" : 
                    riskLevel.level === "Medium" ? "bg-warning" : "bg-success"
                  )}></span>
                  Overall Risk Level: <span className={cn(
                    riskLevel.level === "High" ? "text-red-300" : 
                    riskLevel.level === "Medium" ? "text-yellow-300" : "text-green-300"
                  )}>{riskLevel.level}</span>
                </Link>
              )}

              {todoStats && (
                todoStatsHref ? (
                  <Link href={todoStatsHref} className="cursor-pointer hover:opacity-80 transition-opacity">
                    <TodoStatsContent todoStats={todoStats} isLight={isLight} />
                  </Link>
                ) : (
                  <TodoStatsContent todoStats={todoStats} isLight={isLight} />
                )
              )}
            </div>
          )}
        </div>

        {actions && (
          <div className="flex items-center gap-4">
            {actions}
          </div>
        )}
      </div>
    </DashboardCard>
  );
};

const TodoStatsContent = ({ todoStats, isLight }: { todoStats: NonNullable<PageHeaderProps["todoStats"]>, isLight: boolean }) => {
  const isHealthy = todoStats.healthStatus === "Healthy";
  
  return (
    <div className={cn(
      "flex items-center gap-2 px-3 py-1.5 rounded-full border shadow-sm transition-all",
      isHealthy 
        ? (isLight ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400")
        : (isLight ? "bg-amber-50 border-amber-200 text-amber-700" : "bg-amber-500/10 border-amber-500/20 text-amber-400")
    )}>
      <div className={cn(
        "h-2 w-2 rounded-full",
        isHealthy ? "bg-emerald-500" : "bg-amber-500 animate-pulse"
      )} />
      <span className="text-[11px] font-bold uppercase tracking-wider">
        {todoStats.healthStatus}
      </span>
    </div>
  );
};

export default PageHeader;
