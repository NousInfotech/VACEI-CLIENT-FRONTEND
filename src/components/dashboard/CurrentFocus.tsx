"use client";

import React from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle, ArrowRight, Info } from 'lucide-react';
import DashboardCard from '@/components/DashboardCard';
import { cn } from '@/lib/utils';

export type FocusStatus = 'overdue' | 'waiting_on_you' | 'due_soon' | 'handled';
export type ActionType = 'confirm' | 'upload' | 'view';

export interface FocusItem {
  serviceName: string;
  taskDescription: string;
  dueDate?: string | Date;
  status: FocusStatus;
  primaryActionType: ActionType;
  primaryActionLink: string;
  secondaryActionLink?: string;
  primaryActionLabel?: string;
}

interface CurrentFocusProps {
  item: FocusItem | null;
  className?: string;
}

export const CurrentFocus: React.FC<CurrentFocusProps> = ({ item, className }) => {
  if (!item || item.status === 'handled') {
    return (
      <DashboardCard className={cn("overflow-hidden bg-white/50 border border-gray-100", className)}>
        <div className="p-8 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
              <CheckCircle className="h-6 w-6 text-emerald-500" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-gray-900 tracking-tight">You're all set</h3>
              <p className="text-gray-600 font-medium">
                We're currently handling all active services for you.
              </p>
            </div>
          </div>
          {/* Subtle decoration */}
          <div className="hidden md:block opacity-5">
            <CheckCircle size={80} />
          </div>
        </div>
      </DashboardCard>
    );
  }

  const isOverdue = item.status === 'overdue';
  const statusLabel = isOverdue ? "Overdue" : "Waiting on you";
  
  const getPrimaryButtonLabel = (type: ActionType) => {
    switch (type) {
      case 'confirm': return 'Confirm no changes';
      case 'upload': return 'Upload documents';
      default: return 'Take Action';
    }
  };

  return (
    <DashboardCard className={cn("overflow-hidden border-none shadow-xl", className)}>
      <div className="relative p-8 flex flex-col md:flex-row md:items-center justify-between gap-8">
        {/* Priority background accent */}
        <div className={cn(
          "absolute inset-0 opacity-[0.03] pointer-events-none",
          isOverdue ? "bg-red-600" : "bg-primary-900"
        )} />

        <div className="relative z-10 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <Badge 
              variant="secondary" 
              className={cn(
                "uppercase tracking-widest text-[10px] font-bold px-3 py-1",
                isOverdue ? "bg-red-100 text-red-600 border-red-200" : "bg-amber-100 text-amber-700 border-amber-200"
              )}
            >
              <span className="mr-1.5 flex h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
              {statusLabel}
            </Badge>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-gray-900 tracking-tight">Your attention is needed</h3>
            <p className="text-lg text-gray-700 font-medium leading-snug">
              <span className="text-gray-900 font-bold">{item.serviceName}</span> — {item.taskDescription}
            </p>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <Link href={item.primaryActionLink}>
            <Button 
              size="lg" 
              className={cn(
                "font-bold px-8 shadow-lg hover:bg-primary-900 transition-all",
                isOverdue ? "bg-red-600 hover:bg-red-700 text-white" : "bg-gray-900 hover:bg-black text-white"
              )}
            >
              {item.primaryActionLabel || getPrimaryButtonLabel(item.primaryActionType)}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          {item.secondaryActionLink && (
            <Link href={item.secondaryActionLink!}>
              <Button size="lg">
                View details
              </Button>
            </Link>
          )}
        </div>
      </div>
    </DashboardCard>
  );
};

export default CurrentFocus;
