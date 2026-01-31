'use client';

import { Card } from "@/components/ui/card2";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Person } from "@/interfaces";
import { cn } from "@/lib/utils";

interface PersonCardProps {
  person: Person;
  index: number;
  showOwnership?: boolean;
  onChange: (index: number, field: keyof Person, value: string | number) => void;
  onRemove?: (index: number) => void;
  canRemove?: boolean;
}

export function PersonCard({
  person,
  index,
  showOwnership = false,
  onChange,
  onRemove,
  canRemove = false,
}: PersonCardProps) {
  return (
    <Card className="p-4 space-y-3">
      <div className="flex justify-between items-start">
        <h4 className="text-sm font-medium">Person {index + 1}</h4>
        {canRemove && onRemove && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onRemove(index)}
            className="text-destructive hover:text-destructive"
          >
            Remove
          </Button>
        )}
      </div>
      <div className="space-y-3">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Full name</label>
          <Input
            value={person.fullName}
            onChange={(e) => onChange(index, 'fullName', e.target.value)}
            placeholder="Enter full name"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Email</label>
          <Input
            type="email"
            value={person.email}
            onChange={(e) => onChange(index, 'email', e.target.value)}
            placeholder="email@example.com"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Address *</label>
          <Input
            value={person.address || ''}
            onChange={(e) => onChange(index, 'address', e.target.value)}
            placeholder="Enter address"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Nationality *</label>
          <Input
            value={person.nationality || ''}
            onChange={(e) => onChange(index, 'nationality', e.target.value)}
            placeholder="e.g., Maltese, British"
          />
        </div>
        {showOwnership && (
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Ownership %</label>
            <Input
              type="number"
              min="0"
              max="100"
              value={person.ownershipPercent || ''}
              onChange={(e) => onChange(index, 'ownershipPercent', parseFloat(e.target.value) || 0)}
              placeholder="0"
            />
          </div>
        )}
      </div>
    </Card>
  );
}

