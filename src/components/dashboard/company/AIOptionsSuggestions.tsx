"use client";

import React from "react";
import { AlertTriangle, ArrowRight, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import ShadowCard from "@/components/ui/ShadowCard";
import Lottie from "lottie-react";
import animaBot from "@/lib/AnimaBot.json";
import { Skeleton } from "@/components/ui/skeleton";

interface Suggestion {
  id: string;
  text: string;
}

interface AIOptionsSuggestionsProps {
  isLoading?: boolean;
}

export default function AIOptionsSuggestions({ isLoading = false }: AIOptionsSuggestionsProps) {
  if (isLoading) {
    return (
      <ShadowCard className="h-full flex flex-col p-5">
        <div className="bg-primary-color rounded-[20px] p-8 text-white relative overflow-hidden flex flex-col flex-1">
          <div className="flex items-center gap-4 mb-6">
            <Skeleton className="w-14 h-14 rounded-2xl bg-white/10" />
            <div className="space-y-2">
              <Skeleton className="h-7 w-32 bg-white/10" />
              <Skeleton className="h-4 w-48 bg-white/10" />
            </div>
          </div>
          <div className="space-y-4 pt-2 flex-1">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-4 w-4 bg-white/10 shrink-0 mt-1" />
                <Skeleton className="h-4 w-full bg-white/10" />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3 pt-4 mt-8">
            <Skeleton className="h-10 rounded-xl bg-white/10" />
            <Skeleton className="h-10 rounded-xl bg-white/10" />
          </div>
        </div>
      </ShadowCard>
    );
  }
  const suggestions: Suggestion[] = [
    { id: "1", text: "Annual return due today" },
    { id: "2", text: "Missing passport copy for KYC review" },
    { id: "3", text: "VAT filing due in 3 days" },
    { id: "4", text: "Audit engagement letter awaiting upload" },
  ];

  return (
    <ShadowCard className="h-full flex flex-col p-5">
      <div className="bg-primary-color rounded-[20px] p-8 text-white relative overflow-hidden flex flex-col flex-1">
        {/* Robotic Icon */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center border border-white/5 backdrop-blur-xl overflow-hidden">
             <Lottie animationData={animaBot} loop={true} className="w-14 h-14" />
          </div>
          <div>
            <h3 className="text-2xl font-bold">AI Suggestions</h3>
            <p className="text-white/60 text-sm">Here&apos;s what needs your attention:</p>
          </div>
        </div>

        <div className="space-y-5 flex-1 mt-2">
          {suggestions.map((suggestion) => (
            <div key={suggestion.id} className="flex items-start gap-4 group cursor-pointer hover:translate-x-1 transition-transform">
              <div className="mt-1 bg-white/5 rounded-full p-1 border border-white/5 group-hover:bg-amber-500/20 group-hover:border-amber-500/30 transition-colors">
                <AlertTriangle size={14} className="text-amber-500" />
              </div>
              <p className="text-sm font-medium text-white/90 leading-relaxed uppercase tracking-wide">
                {suggestion.text}
              </p>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3 mt-8">
            <div className="grid grid-cols-2 gap-3">
                <Button className="bg-[#3B82F6]/20 text-xs hover:bg-[#3B82F6]/30 text-white border border-[#3B82F6]/30 rounded-xl p-3 font-bold backdrop-blur-xl transition-all">
                    View to-do list
                </Button>
                <Button className="bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl p-3 text-xs font-bold backdrop-blur-xl transition-all">
                    Open compliance
                </Button>
            </div>
        </div>
      </div>
    </ShadowCard>
  );
}
