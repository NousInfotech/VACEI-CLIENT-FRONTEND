'use client';

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Status = 'pending' | 'in_progress' | 'completed' | 'failed';

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const variants: Record<Status, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    pending: { label: 'Pending', variant: 'outline' },
    in_progress: { label: 'In Progress', variant: 'secondary' },
    completed: { label: 'Completed', variant: 'default' },
    failed: { label: 'Failed', variant: 'destructive' },
  };

  const config = variants[status];

  return (
    <Badge variant={config.variant} className={cn(className)}>
      {config.label}
    </Badge>
  );
}

