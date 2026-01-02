// components/tasks/FilterControls.tsx
import React from "react";


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
        className="w-full border border-gray-300 rounded-lg px-3 py-2"
      />

      
      <select
        value={assignedToFilterId ?? ""}
        onChange={(e) => setAssignedToFilterId(e.target.value ? Number(e.target.value) : null)}
        className="p-2 border rounded-lg"
      >
        <option value="">All Accountants 1</option>
        {accountants.map((acc) => (
          <option key={acc.accountant.id} value={acc.accountant.id}>
            {acc.accountant.name} ({acc.accountant.email})
          </option>
        ))}
      </select>

      <select
        value={statusFilterId ?? ""}
        onChange={(e) => setStatusFilterId(e.target.value ? Number(e.target.value) : null)}
        className="p-2 border rounded-lg"
      >
        <option value="">All Statuses</option>
        {statuses.map((status) => (
          <option key={status.id} value={status.id}>
            {status.name}
          </option>
        ))}
      </select>

      <button onClick={clearFilters} className="p-2 border rounded-lg bg-gray-100">
        Clear
      </button>
    </div>
  );
}