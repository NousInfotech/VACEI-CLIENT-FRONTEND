"use client";

import React from "react";
import { Calendar, ChevronRight, Eye, Info, Clock, Tag } from "lucide-react";
import ShadowCard from "@/components/ui/ShadowCard";
import { Modal } from "@/components/ui/modal";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ComplianceDeadlineCardProps {
  title?: string;
  dueDate?: string;
  description?: string;
  category?: string;
  frequency?: string;
  startDate?: string;
  onViewAll?: () => void;
  isLoading?: boolean;
}

export default function ComplianceDeadlineCard({ 
  title, 
  dueDate, 
  description,
  category,
  frequency,
  startDate,
  onViewAll,
  isLoading = false 
}: ComplianceDeadlineCardProps) {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  
  const displayTitle = title || "No upcoming deadlines";
  const displayDate = dueDate || "N/A";
  const hasDeadline = !!title && !!dueDate;

  if (isLoading) {
    return (
      <ShadowCard className="space-y-6 p-5">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-8 w-32 rounded-lg" />
        </div>
        <ShadowCard className="p-6 bg-white border-none">
          <div className="flex items-center gap-4">
            <Skeleton className="w-12 h-12 rounded-2xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-4 w-1/3" />
            </div>
            <Skeleton className="h-10 w-20 rounded-xl" />
          </div>
        </ShadowCard>
      </ShadowCard>
    );
  }

  return (
    <>
      <ShadowCard className="space-y-6 p-5">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold">Next Compliance Deadline</h2>
            <p className="text-sm text-[#64748B]">Statutory submissions and obligations</p>
          </div>
          <div className={cn(
            "rounded-lg px-3 py-1.5 flex items-center gap-2 border",
            hasDeadline ? "bg-[#FFF8F1] border-[#FFE7D1]" : "bg-gray-50 border-gray-100"
          )}>
            <Calendar size={18} className={hasDeadline ? "text-[#F59E0B]" : "text-gray-400"} />
            <span className={cn(
              "text-sm font-semibold",
              hasDeadline ? "text-[#B45309]" : "text-gray-500"
            )}>
              {hasDeadline ? `Due: ${displayDate}` : "No upcoming"}
            </span>
          </div>
        </div>
        
        <ShadowCard className={cn(
          "p-6 group border-none transition-colors",
          hasDeadline ? "bg-white" : "bg-gray-50/50"
        )}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors shrink-0",
                hasDeadline ? "bg-[#F8FAFC] text-[#64748B]" : "bg-gray-100 text-gray-400"
              )}>
                <Calendar size={24} />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className={cn(
                  "text-lg font-bold tracking-tight truncate",
                  hasDeadline ? "text-[#1A1F2C]" : "text-gray-400"
                )}>
                  {displayTitle}
                </h3>
                {hasDeadline && description && (
                  <p className="text-sm text-[#64748B] line-clamp-1 mt-0.5">{description}</p>
                )}
              </div>
            </div>
            
            {hasDeadline && (
              <Button 
                onClick={() => setIsModalOpen(true)}
                variant="outline"
              >
                <Eye size={16} />
                View
              </Button>
            )}
          </div>
        </ShadowCard>
      </ShadowCard>

      {/* DETAIL MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Compliance Deadline Details"
      >
        <div className="space-y-6">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-brand-primary/5 border border-brand-primary/10">
            <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary shrink-0">
              <Calendar size={20} />
            </div>
            <div>
              <h4 className="font-bold text-[#1A1F2C] text-lg leading-tight">{title}</h4>
              <p className="text-xs font-bold text-brand-primary uppercase tracking-widest mt-0.5">Primary Requirement</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl border border-gray-100 space-y-2 bg-gray-50/30">
            <div className="flex items-center gap-2 text-[#64748B]">
              <Info size={16} />
              <span className="text-xs font-bold uppercase tracking-wider">About this requirement</span>
            </div>
            <p className="text-sm text-[#1A1F2C] leading-relaxed">
              {description || "No detailed description provided for this compliance requirement."}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl border border-gray-100 space-y-2">
              <div className="flex items-center gap-2 text-[#64748B]">
                <Clock size={16} />
                <span className="text-xs font-bold uppercase tracking-wider">Due Date</span>
              </div>
              <p className="font-bold text-[#1A1F2C]">{displayDate}</p>
            </div>
            <div className="p-4 rounded-2xl border border-gray-100 space-y-2">
              <div className="flex items-center gap-2 text-[#64748B]">
                <Tag size={16} />
                <span className="text-xs font-bold uppercase tracking-wider">Category</span>
              </div>
              <p className="font-bold text-[#1A1F2C]">{category || "General"}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl border border-gray-100 space-y-2">
              <div className="flex items-center gap-2 text-[#64748B]">
                <Clock size={16} />
                <span className="text-xs font-bold uppercase tracking-wider">Start Date</span>
              </div>
              <p className="font-bold text-[#1A1F2C]">{startDate ? new Date(startDate).toLocaleDateString() : "N/A"}</p>
            </div>
            <div className="p-4 rounded-2xl border border-gray-100 space-y-2">
              <div className="flex items-center gap-2 text-[#64748B]">
                <Info size={16} />
                <span className="text-xs font-bold uppercase tracking-wider">Frequency</span>
              </div>
              <p className="font-bold text-[#1A1F2C] capitalize">{frequency?.toLowerCase() || "Custom"}</p>
            </div>
          </div>

          <button
            onClick={() => setIsModalOpen(false)}
            className="w-full py-3 rounded-xl bg-[#1A1F2C] text-white font-bold hover:bg-black transition-colors"
          >
            Close Detail
          </button>
        </div>
      </Modal>
    </>
  );
}
