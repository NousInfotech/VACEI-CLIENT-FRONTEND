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
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            Completed Tasks Checklist
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close"
          >
            <HugeiconsIcon icon={Cancel01Icon} className="w-6 h-6" />
          </button>
        </div>
        <div className="p-4 overflow-y-auto flex-1">
          {/* Modified logic: Only show text if doneTasks is empty */}
          {doneTasks.length === 0 && (
            <p className="text-gray-600 text-center py-8">
              No completed tasks found.
            </p>
          )}
          {/* If doneTasks is NOT empty, this section will render nothing */}
        </div>
        <div className="p-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}