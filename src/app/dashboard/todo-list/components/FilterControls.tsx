// components/tasks/FilterControls.tsx
import React from "react";
import Dropdown from "@/components/Dropdown";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";


interface Accountant {
  accountant: { id: number; first_name: string; last_name: string; email: string; name: string };
}
interface Status {
  id: number;
  name: string;
}

interface FilterControlsProps {
  searchText: string;
  setSearchText: (text: string) => void;
  assignedToFilterId: number | null;
  setAssignedToFilterId: (id: number | null) => void;
  statusFilterId: number | null;
  setStatusFilterId: (id: number | null) => void;
  accountants: Accountant[];
  statuses: Status[];
  clearFilters: () => void;
}

export default function FilterControls({
  searchText,
  setSearchText,
  assignedToFilterId,
  setAssignedToFilterId,
  statusFilterId,
  setStatusFilterId,
  accountants,
  statuses,
  clearFilters,
}: FilterControlsProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-5">
      <input
        type="text"
        placeholder="Search tasks..."
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        className="w-full border border-border rounded-lg px-3 py-2"
      />

      
      <Dropdown
        className="min-w-[180px]"
        trigger={
          <Button variant="outline" className="min-w-[180px] h-9 justify-between">
            {assignedToFilterId ? accountants.find(acc => acc.accountant.id === assignedToFilterId)?.accountant.name + " (" + accountants.find(acc => acc.accountant.id === assignedToFilterId)?.accountant.email + ")" || "All Accountants" : "All Accountants"}
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        }
        items={[
          { id: "", label: "All Accountants", onClick: () => setAssignedToFilterId(null) },
          ...accountants.map((acc) => ({
            id: acc.accountant.id,
            label: `${acc.accountant.name} (${acc.accountant.email})`,
            onClick: () => setAssignedToFilterId(acc.accountant.id)
          }))
        ]}
      />

      <Dropdown
        className="min-w-[140px]"
        trigger={
          <Button variant="outline" className="min-w-[140px] h-9 justify-between">
            {statusFilterId ? statuses.find(s => s.id === statusFilterId)?.name || "All Statuses" : "All Statuses"}
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        }
        items={[
          { id: "", label: "All Statuses", onClick: () => setStatusFilterId(null) },
          ...statuses.map((status) => ({
            id: status.id,
            label: status.name,
            onClick: () => setStatusFilterId(status.id)
          }))
        ]}
      />

      <button onClick={clearFilters} className="p-2 border rounded-lg bg-brand-muted">
        Clear
      </button>
    </div>
  );
}