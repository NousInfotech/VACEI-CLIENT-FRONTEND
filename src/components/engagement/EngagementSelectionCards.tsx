"use client";

import React from "react";
import Link from "next/link";
import { FileText, Calendar, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import PageHeader from "@/components/shared/PageHeader";
import DashboardCard from "@/components/DashboardCard";

interface Engagement {
  id: string;
  _id?: string;
  name?: string;
  title?: string;
  status: string;
  updatedAt?: string;
  createdAt?: string;
  yearEndDate?: string;
}

interface EngagementSelectionCardsProps {
  engagements: Engagement[];
  serviceSlug: string;
  serviceName: string;
}

const EngagementSelectionCards = ({
  engagements,
  serviceSlug,
  serviceName,
}: EngagementSelectionCardsProps) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  const isId = (str?: string) => {
    if (!str) return false;
    // Simple check for ObjectId (24 chars) or UUID (36 chars)
    return /^[0-9a-fA-F]{24}$/.test(str) || /^[0-9a-fA-F-]{36}$/.test(str);
  };

  return (
    <div className="w-full space-y-6">
      <PageHeader
        title={serviceName}
        subtitle={`Multiple active engagements found for ${serviceName}`}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {engagements.map((engagement) => {
          const id = engagement.id || engagement._id;
          
          // Robust title logic: 
          // 1. Prioritize name (the exact engagement name like "Egg-Farm-Ltd-Audit-2024")
          // 2. Use title as fallback
          // 3. If both look like IDs or are missing, fallback to Service + Year
          const rawTitle = engagement.name || engagement.title;
          const displayTitle = (rawTitle && !isId(rawTitle)) 
            ? rawTitle 
            : (engagement.yearEndDate 
                ? `${serviceName} - ${new Date(engagement.yearEndDate).getFullYear()}` 
                : `${serviceName} Engagement`);

          return (
            <Link 
              key={id} 
              href={`/dashboard/services/${serviceSlug}/engagements/${id}`}
              className="block group h-full"
            >
              <DashboardCard className="h-full p-0 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-slate-200">
                <div className="p-6 space-y-6">
                  <div className="flex items-start justify-between">
                    <div className="p-3 bg-primary/5 rounded-xl text-primary transition-colors duration-300">
                      <FileText size={24} />
                    </div>
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider",
                        engagement.status === "ACTIVE" ? "text-emerald-600 border-emerald-100 bg-emerald-50" : 
                        engagement.status === "ASSIGNED" ? "text-blue-600 border-blue-100 bg-blue-50" :
                        "text-gray-500 border-gray-100 bg-gray-50"
                      )}
                    >
                      {engagement.status}
                    </Badge>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary transition-colors line-clamp-2">
                      {displayTitle}
                    </h3>
                    
                    <div className="flex items-center gap-2 text-slate-500">
                      <Calendar size={14} className="shrink-0" />
                      <span className="text-xs font-semibold">
                        Last Update: {formatDate(engagement.updatedAt || engagement.createdAt)}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-sm font-bold text-primary">
                    <span>Open Engagement</span>
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </DashboardCard>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default EngagementSelectionCards;
