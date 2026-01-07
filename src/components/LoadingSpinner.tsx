"use client";

import { Spinner } from "./ui/spinner";

export default function LoadingSpinner({ 
  size = 32, 
  className = "",
  text = "Loading..." 
}: { 
  size?: number; 
  className?: string;
  text?: string;
}) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 p-8 ${className}`}>
      <Spinner size={size} className="text-primary" />
      {text && <p className="text-sm text-muted-foreground">{text}</p>}
    </div>
  );
}
