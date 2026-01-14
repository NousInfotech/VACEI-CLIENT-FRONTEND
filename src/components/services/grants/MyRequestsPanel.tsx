"use client";

import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import DashboardCard from "@/components/DashboardCard";
import { cn } from "@/lib/utils";
import { GrantRequest } from "./types";

interface MyRequestsPanelProps {
  requests: GrantRequest[];
}

export default function MyRequestsPanel({ requests }: MyRequestsPanelProps) {
  return (
    <DashboardCard className="p-5 sticky top-8">
      <h3 className="text-lg font-semibold text-brand-body mb-4 flex items-center justify-between">
        My Grant Requests
        <Badge className="bg-primary-color-new text-light border-none text-[10px]">
          {requests.length} Active
        </Badge>
      </h3>
      
      <div className="grid grid-cols-2 gap-2">
        {requests.map(req => (
          <div key={req.id} className="p-3 bg-muted/10 border border-border/40 rounded-xl space-y-2">
            <div className="flex justify-between items-start">
              <h4 className="text-sm font-medium line-clamp-1">{req.grantTitle}</h4>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={cn(
                "text-[9px] uppercase tracking-tighter px-1.5 h-4",
                req.status === "Call booked" ? "bg-blue-500/10 text-blue-600 border-blue-200" : 
                req.status === "Collecting docs" ? "bg-amber-500/10 text-amber-600 border-amber-200" : 
                "bg-muted text-muted-foreground border-border"
              )}>
                {req.status}
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground italic leading-tight">
              Next: {req.nextStep}
            </p>
            {req.ctaLabel && (
              <Button variant="outline" size="sm" className="w-full mt-2 h-8 text-[11px] font-bold rounded-lg border-primary/20 text-primary">
                {req.ctaLabel}
              </Button>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 rounded-xl bg-primary/5 border border-primary/10 space-y-2">
        <h4 className="text-xs font-bold text-primary flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Vacei Recommendation
        </h4>
        <p className="text-[11px] text-brand-body/80 leading-relaxed">
          Based on your profile, you are eligible for the <b>AI Business Transformation Grant</b>.
        </p>
        <Button variant="link" className="p-0 h-auto text-[11px] font-bold text-primary flex items-center gap-1">
          Learn more <ArrowRight className="w-3 h-3" />
        </Button>
      </div>
    </DashboardCard>
  );
}
