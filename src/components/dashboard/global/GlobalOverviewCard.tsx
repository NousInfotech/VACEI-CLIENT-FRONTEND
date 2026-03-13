"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface GlobalOverviewCardProps {
  title: string;
  bgImage: string;
  children: React.ReactNode;
  buttonLabel: string;
  onClick: () => void;
  isLoading?: boolean;
}

export default function GlobalOverviewCard({ 
  title, 
  bgImage, 
  children, 
  buttonLabel, 
  onClick,
  isLoading = false,
}: GlobalOverviewCardProps) {
  if (isLoading) {
    return (
      <div className="relative overflow-hidden rounded-[15px] h-full border border-slate-100 shadow-sm bg-white p-8 flex flex-col gap-4">
        <Skeleton className="h-7 w-3/4 rounded-lg" />
        <div className="grow space-y-3 mt-2">
          <Skeleton className="h-4 w-full rounded-md" />
          <Skeleton className="h-4 w-2/3 rounded-md" />
          <div className="mt-4 space-y-2">
             <Skeleton className="h-3 w-1/4 rounded-md" />
             <Skeleton className="h-5 w-1/2 rounded-md" />
          </div>
        </div>
        <div className="mt-4">
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative group overflow-hidden rounded-[15px] h-full border border-white/20 shadow-xl transition-all duration-500">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <Image 
          src={bgImage} 
          alt={title} 
          fill 
          className="object-cover"
          priority
          quality={100}
          unoptimized
        />
      </div>
      <div className="absolute inset-0 bg-black/20" />

      {/* Content Layer */}
      <div className="relative h-full w-full p-8 flex flex-col z-10">
        <h3 className="text-xl font-bold text-white mb-4 tracking-tight drop-shadow-md">
          {title}
        </h3>
        <div className="grow space-y-3">
          {children}
        </div>
        <div className="mt-4">
          <Button 
            className="bg-white/10 hover:bg-white text-white hover:text-[#1A1F2C] border border-white/20 rounded-xl px-5 transition-all text-sm font-bold backdrop-blur-md"
            onClick={onClick}
          >
            {buttonLabel} <ArrowRight size={14} className="ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
