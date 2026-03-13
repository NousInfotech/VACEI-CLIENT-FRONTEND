"use client";

import React from "react";
import { MessageSquare, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Lottie from "lottie-react";
import botAnimation from "@/lib/AnimaBot.json";

import { Skeleton } from "@/components/ui/skeleton";

interface AIAssistantProps {
  isLoading?: boolean;
}

export default function AIAssistant({ isLoading = false }: AIAssistantProps) {
  if (isLoading) {
    return (
      <div className="bg-primary-color-new rounded-[20px] p-8 text-white h-fit relative overflow-hidden">
        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="w-14 h-14 rounded-2xl bg-white/10 border border-white/10" />
            <div className="space-y-2">
              <Skeleton className="h-7 w-32 bg-white/10" />
              <Skeleton className="h-3 w-48 bg-white/10" />
            </div>
          </div>

          <div className="space-y-4 pt-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-4 w-4 bg-white/10 shrink-0 mt-1" />
                <Skeleton className="h-4 w-full bg-white/10" />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3 pt-4">
            <Skeleton className="h-10 rounded-xl bg-white/10" />
            <Skeleton className="h-10 rounded-xl bg-white/10" />
          </div>

          <Skeleton className="w-full h-12 rounded-2xl bg-white/10" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-primary-color-new rounded-[20px] p-8 text-white h-fit relative overflow-hidden group">
      <div className="relative z-10 space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-xl border border-white/10">
            <div className="relative w-10 h-10">
              <Lottie animationData={botAnimation} loop={true} />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold tracking-tight">AI Assistant</h3>
            <p className="text-white/40 text-[10px] font-medium uppercase tracking-widest mt-1">Latest summary based on recent updates</p>
          </div>
        </div>

        <div className="space-y-4 pt-2">
          <div className="flex gap-3">
            <ChevronRight size={16} className="text-amber-400 shrink-0 mt-1" />
            <p className="text-sm text-white/80 font-medium">Your annual return is due today.</p>
          </div>
          <div className="flex gap-3">
            <ChevronRight size={16} className="text-amber-400 shrink-0 mt-1" />
            <p className="text-sm text-white/80 font-medium">We're still waiting on the passport copy needed for KYC review.</p>
          </div>
          <div className="flex gap-3">
            <ChevronRight size={16} className="text-amber-400 shrink-0 mt-1" />
            <p className="text-sm text-white/80 font-medium">The VAT filing is due in 3 days.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-4">
          <Button className="bg-sky-500/20 hover:bg-sky-500/30 text-white border border-sky-500/30 rounded-xl p-2 text-sm font-medium backdrop-blur-xl transition-all">
            View to-do list
          </Button>
          <Button className="bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl p-2 text-sm font-medium backdrop-blur-xl transition-all">
            Open compliance
          </Button>
        </div>

        <Button className="w-full bg-linear-to-r from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 text-white rounded-2xl p-2 font-bold shadow-lg transition-all border border-white/5">
          Ask AI
        </Button>
      </div>
    </div>
  );
}
