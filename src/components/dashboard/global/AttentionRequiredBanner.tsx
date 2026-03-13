"use client";

import React from "react";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { TodoItem } from "@/api/todoService";

import { Skeleton } from "@/components/ui/skeleton";

interface AttentionRequiredBannerProps {
  urgentTodo: TodoItem | null;
  isLoading?: boolean;
}

export default function AttentionRequiredBanner({ urgentTodo, isLoading = false }: AttentionRequiredBannerProps) {
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="bg-[#FFF8F2] border border-[#FFE4CC] rounded-[20px] p-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <Skeleton className="w-11 h-11 rounded-xl bg-[#FF9933]/10" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32 bg-[#FF9933]/10" />
            <Skeleton className="h-5 w-64 bg-slate-200" />
          </div>
        </div>
        <Skeleton className="h-11 w-32 rounded-xl bg-slate-800" />
      </div>
    );
  }

  if (!urgentTodo) return null;

  return (
    <div className="bg-[#FFF8F2] border border-[#FFE4CC] rounded-[20px] p-4 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-4">
        <div className="bg-[#FF9933]/10 p-2.5 rounded-xl">
          <AlertTriangle className="text-[#FF9933] w-6 h-6" />
        </div>
        <div>
          <p className="text-[#FF9933] font-bold text-sm uppercase tracking-wider">Attention required</p>
          <h4 className="text-slate-900 font-bold">
            {urgentTodo.service} — <span className="text-slate-500 font-medium">{urgentTodo.title}</span>
          </h4>
        </div>
      </div>
      <Button 
        className="bg-[#1A1F2C] hover:bg-black text-white rounded-xl p-3 font-bold flex items-center gap-2 group transition-all"
        onClick={() => router.push(`/global-dashboard/todos?id=${urgentTodo.id}`)}
      >
        Take Action
        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
      </Button>
    </div>
  );
}
