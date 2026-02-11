"use client";

import { Skeleton } from "@/components/ui/skeleton";

export default function ServiceHistorySkeleton() {
  return (
    <div className="divide-y border rounded-2xl bg-white overflow-hidden animate-pulse">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="p-5 flex items-center justify-between">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-5 w-1/3 rounded-lg" />
            <Skeleton className="h-3 w-1/4 rounded-md" />
          </div>
          <div className="flex items-center gap-4">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}
