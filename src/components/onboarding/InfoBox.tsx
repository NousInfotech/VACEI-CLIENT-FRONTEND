'use client';

import { Card } from "@/components/ui/card2";
import { cn } from "@/lib/utils";

interface InfoBoxProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'info';
  className?: string;
}

export function InfoBox({ children, variant = 'default', className }: InfoBoxProps) {
  const variantStyles = {
    default: 'bg-muted border-border',
    success: 'bg-green-50 border-green-200 text-green-900',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-900',
    info: 'bg-blue-50 border-blue-200 text-blue-900',
  };

  return (
    <Card className={cn("p-4 border", variantStyles[variant], className)}>
      <p className="text-sm">{children}</p>
    </Card>
  );
}

