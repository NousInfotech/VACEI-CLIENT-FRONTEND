"use client";

import React from 'react';
import { Clock, Building2, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DashboardCard from "@/components/DashboardCard";
import { Grant } from "./types";
import { useRouter } from 'next/navigation';
import { createSlug } from '@/lib/utils';

interface GrantCardProps {
  grant: Grant;
}

export default function GrantCard({ grant }: GrantCardProps) {
  const router = useRouter();

  const handleNavigate = (step?: number) => {
    const url = `/dashboard/services/grants-incentives/${createSlug(grant.title)}${step ? `?step=${step}` : ''}`;
    router.push(url);
  };

  return (
    <DashboardCard className="group p-5 hover:border-primary/40 transition-all duration-300 overflow-hidden">
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-start mb-3">
          <Badge variant="outline" className="bg-primary-color-new text-light border-none text-[10px] font-bold uppercase tracking-wider px-2 hover:bg-primary-color-new/90">
            {grant.category}
          </Badge>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/20 px-2 py-0.5 rounded-full">
            <Clock className="w-3 h-3" />
            {grant.deadline === "Ongoing" ? "Ongoing" : `Until ${grant.deadline}`}
          </div>
        </div>

        <h3 className="text-lg font-semibold text-brand-body group-hover:text-primary transition-colors leading-tight">
          {grant.title}
        </h3>
        <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
          <Building2 className="w-3.5 h-3.5" />
          {grant.provider}
        </p>

        <p className="text-sm text-brand-body/70 mt-3 line-clamp-2">
          {grant.summary}
        </p>

        <div className="mt-4 flex items-center gap-4 py-3 border-t border-border/40">
          <div className="flex flex-col">
            <span className="text-[10px] text-muted-foreground font-medium uppercase">Funding</span>
            <span className="text-sm font-bold text-brand-body flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5" />
              {grant.fundingAmount || "Varies"}
            </span>
          </div>
        </div>

        <div className="mt-auto grid grid-cols-2 gap-2 pt-2">
          <Button variant="outline" className='border-gray-300' onClick={() => handleNavigate()}>
            View details
          </Button>
          <Button onClick={() => handleNavigate(2)}>
            Request support
          </Button>
        </div>
      </div>
    </DashboardCard>
  );
}
