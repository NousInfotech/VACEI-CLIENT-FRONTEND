"use client";

import React from "react";
import { ChevronRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Notification } from "@/api/notificationService";
import ShadowCard from "@/components/ui/ShadowCard";

import { Skeleton } from "@/components/ui/skeleton";

interface AlertsNotificationsProps {
  notifications: Notification[];
  isLoading?: boolean;
}

export default function AlertsNotifications({ notifications, isLoading = false }: AlertsNotificationsProps) {
  const router = useRouter();

  if (isLoading) {
    return (
      <ShadowCard className="space-y-4 p-5">
        <div className="flex items-center justify-between">
          <Skeleton className="h-7 w-48 rounded-lg" />
          <Skeleton className="h-8 w-24 rounded-md" />
        </div>

        <div className="h-[250px] overflow-hidden pr-2">
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-2 border border-slate-200 rounded-xl my-2.5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Skeleton className="w-12 h-12 rounded-2xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-40 rounded-md" />
                    <Skeleton className="h-3 w-64 rounded-md" />
                  </div>
                </div>
                <Skeleton className="w-10 h-10 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </ShadowCard>
    );
  }

  return (
    <ShadowCard className="space-y-4 p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Alerts & Notifications</h2>
        <Button 
          variant="ghost" 
          onClick={() => router.push('/global-dashboard/alerts')}
        >
          View All <ChevronRight size={16} />
        </Button>
      </div>

      <div className="h-[250px] overflow-y-auto custom-scrollbar pr-2">
        <div className="divide-y divide-slate-50">
          {notifications.length > 0 ? (
            notifications.map((notif, idx) => (
              <div key={notif.id} className="p-2 border border-slate-200 rounded-xl my-2.5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center">
                    <Clock className="text-slate-400 w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 flex items-center gap-2">
                      {notif.title}
                      <span className="text-slate-400 text-[10px] font-medium flex items-center gap-1">
                        {notif.redirectUrl?.includes('Tesla') ? 'Due May 1, 2028' : ''}
                      </span>
                    </h4>
                    <p className="text-slate-500 text-xs line-clamp-1">{notif.content}</p>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-semibold text-sm border border-slate-200">
                  {idx + 1}
                </div>
              </div>
            ))
          ) : (
            <div className="p-10 text-center text-slate-400 text-sm italic">
              No recent notifications.
            </div>
          )}
        </div>
      </div>
    </ShadowCard>
  );
}
