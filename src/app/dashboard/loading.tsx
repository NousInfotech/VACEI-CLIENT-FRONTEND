"use client";

import LoadingSpinner from "@/components/LoadingSpinner";

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="bg-card border border-border rounded-card shadow-md p-8">
        <LoadingSpinner size={40} text="Loading..." />
      </div>
    </div>
  );
}

