// src/components/DoneTasksModal.tsx
import React from "react";
import { Task } from "@/interfaces"; // Assuming Task interface is defined here
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon } from "@hugeicons/core-free-icons";

interface DoneTasksModalProps {
  isOpen: boolean;
  onClose: () => void;
  doneTasks: Task[];
}

export default function DoneTasksModal({
  isOpen,
  onClose,
  doneTasks,
}: DoneTasksModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-border">
          <h2 className="text-xl font-semibold text-gray-800">
            Completed Tasks Checklist
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-brand-body"
            aria-label="Close"
          >
            <HugeiconsIcon icon={Cancel01Icon} className="w-6 h-6" />
          </button>
        </div>
        <div className="p-4 overflow-y-auto flex-1">
          {/* Modified logic: Only show text if doneTasks is empty */}
          {doneTasks.length === 0 && (
            <p className="text-muted-foreground text-center py-8">
              No completed tasks found.
            </p>
          )}
          {/* If doneTasks is NOT empty, this section will render nothing */}
        </div>
        <div className="p-4 border-t border-border flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-brand-primary text-card-foreground rounded-md hover:bg-brand-primary700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}