"use client";

import React from "react";
import { AlertCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface AttentionBannerProps {
  title?: string;
  subtitle?: string;
  onAction?: () => void;
  isLoading?: boolean;
}

export default function AttentionBanner({ title, subtitle, onAction, isLoading = false }: AttentionBannerProps) {
  if (isLoading) {
    return <Skeleton className="h-20 w-full rounded-[20px] bg-gray-100" />;
  }
  return (
    <div className="bg-[#FFF8F1] border border-[#FFE7D1] rounded-[20px] p-5 flex items-center justify-between shadow-xs">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#F59E0B]">
          <AlertCircle size={24} />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-[#B45309] uppercase tracking-wider">Attention required</h4>
          <p className="text-[#1A1F2C] font-semibold mt-1">
            {title} — <span className="text-[#64748B] font-normal">{subtitle}</span>
          </p>
        </div>
      </div>
      <Button 
        className="bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-xl px-6 py-2.5 h-auto font-bold flex items-center gap-2"
        onClick={onAction}
      >
        Take Action <ArrowRight size={18} />
      </Button>
    </div>
  );
}
