"use client";

import Link from "next/link";
import DashboardCard from "./DashboardCard";
import { cn } from "@/lib/utils";

interface StatCardProps {
    title: string;
    amount: string;
    change: string;
    note: string;
    param1: string;
    param2: string;
    bgColor: string; // still included for flexibility
    iconClass?: string;
    link?: string | null;
    className?: string;
}

export default function StatCard({
    title,
    link,
    amount,
    change,
    note,
    param1,
    param2,
    bgColor,
    iconClass,
    className,
}: StatCardProps) {
    // Convert change string to numeric value for proper comparison
    const changeValue = parseFloat(change.replace(/[^0-9.-]+/g, ""));
    const isPositive = changeValue > 0;

    // Use backend-provided icon OR fallback
    const finalIcon = iconClass || "chart-line";

    const cardContent = (
        <DashboardCard className={cn(
            "p-6 w-full cursor-pointer group hover:-translate-y-1 transition-all duration-500 overflow-hidden relative",
            className
        )}>
            {/* Background Decorative Element */}
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-gray-900/5 rounded-full blur-2xl group-hover:bg-gray-900/10 transition-colors" />
            
            <div className="flex justify-between items-start mb-8 relative z-10">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className="bg-gray-900 text-white rounded-2xl w-12 h-12 flex items-center justify-center shadow-[0_8px_16px_-4px_rgba(0,0,0,0.2)] group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                            <i className={`fr leading-0 fi-rr-${finalIcon} text-xl`} />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-white border-2 border-white shadow-sm flex items-center justify-center">
                            <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", isPositive ? "bg-success" : "bg-destructive")} />
                        </div>
                    </div>
                   
                    <div>
                        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-0.5">
                            {title}
                        </h3>
                        <p className="text-sm font-semibold text-gray-900 line-clamp-1">{note || "Monthly overview"}</p>
                    </div>
                </div>
            </div>

            <div className="space-y-4 relative z-10">
                <div className="flex items-baseline justify-between gap-4">
                    <span className="text-3xl font-bold text-gray-900 tracking-tight">
                        {amount}
                    </span>
                    
                    <div className={cn(
                        "flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors",
                        isPositive ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                    )}>
                        <i className={`fi ${isPositive ? "fi-rr-arrow-trend-up" : "fi-rr-arrow-trend-down"} text-[8px]`} />
                        {change}
                    </div>
                </div>

                {(param1 || param2) && (
                    <div className="pt-4 border-t border-gray-100/50 flex flex-wrap gap-x-4 gap-y-1">
                        {param1 && (
                            <div className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-gray-200" />
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">{param1}</span>
                            </div>
                        )}
                        {param2 && (
                            <div className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-gray-200" />
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">{param2}</span>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </DashboardCard>
    );

    return link ? (
        <Link href={link} className="block no-underline">
            {cardContent}
        </Link>
    ) : (
        <div className="w-full">
            {cardContent}
        </div>
    );
}
