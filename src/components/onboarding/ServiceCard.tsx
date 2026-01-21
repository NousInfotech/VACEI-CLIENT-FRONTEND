'use client';

import { Card } from "@/components/ui/card2";
import { cn } from "@/lib/utils";

interface ServiceCardProps {
  id: string;
  name: string;
  description: string;
  selected: boolean;
  onToggle: (id: string) => void;
}

export function ServiceCard({ id, name, description, selected, onToggle }: ServiceCardProps) {
  return (
    <Card
      className={cn(
        "p-4 cursor-pointer transition-all hover:shadow-md",
        selected && "ring-2 ring-primary border-primary"
      )}
      onClick={() => onToggle(id)}
    >
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onToggle(id)}
          className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary"
          onClick={(e) => e.stopPropagation()}
        />
        <div className="flex-1">
          <h3 className="font-semibold text-sm mb-1">{name}</h3>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
    </Card>
  );
}

