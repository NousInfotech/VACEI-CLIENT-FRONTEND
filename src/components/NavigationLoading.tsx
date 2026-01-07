"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import LoadingSpinner from "./LoadingSpinner";

export default function NavigationLoading() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [pathname]);

  if (!loading) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-card shadow-lg p-8">
        <LoadingSpinner size={40} text="Loading..." />
      </div>
    </div>
  );
}

