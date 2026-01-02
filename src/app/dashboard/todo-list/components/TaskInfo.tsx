import React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Clock01FreeIcons } from "@hugeicons/core-free-icons";

export enum Priority {
    LOW = "LOW",
    MEDIUM = "MEDIUM",
    HIGH = "HIGH",
}

interface PriorityBadgeProps {
    priority?: Priority | null;
}

const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority }) => {
    if (!priority) return null;

    const colors: Record<Priority, string> = {
        [Priority.HIGH]: "bg-red-500 text-white",
        [Priority.MEDIUM]: "bg-yellow-400 text-black",
        [Priority.LOW]: "bg-green-800 text-white",
    };

    const colorClass = colors[priority] ?? "bg-gray-300 text-black";

    return (
        <span
            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${colorClass}`}
            title={priority}
        >
            {priority}
        </span>
    );
};

interface TaskInfoProps {
    title?: string;  // made optional
    priority?: Priority | null;
    dueDate?: string | Date | null;
    createdAtDate?: string | Date | null;
}

const formatDate = (date?: string | Date | null): string | null => {
    if (!date) return null;
    const d = typeof date === "string" ? new Date(date) : date;
    if (isNaN(d.getTime())) return null;
    return d.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
    }); // e.g., Aug 15, 2025
};

const TaskInfo: React.FC<TaskInfoProps> = ({ title, priority, dueDate, createdAtDate }) => {
    const formattedDueDate = formatDate(dueDate);
    const formattedcreatedAtDate = formatDate(createdAtDate);

    return (
        <div className="text-base font-medium text-dark">
            <div className="flex flex-wrap items-center gap-2">
                {title && <span>{title}</span>}
                {priority && <PriorityBadge priority={priority} />}
            </div>
            {formattedcreatedAtDate && ( 
                <div className="flex flex-wrap items-center gap-2 mt-2">
                    {formattedcreatedAtDate && (
                        <span className="text-xs text-green-700 font-noprmal italic flex gap-1"><HugeiconsIcon icon={Clock01FreeIcons} className="w-4 h-4 text-green-700" /> {formattedcreatedAtDate}</span>
                    )}
                    {formattedDueDate && (
                        <span className="text-xs text-rose-600 italic font-normal flex gap-1"><HugeiconsIcon icon={Clock01FreeIcons} className="w-4 h-4 text-rose-600" /> Due: {formattedDueDate}</span>
                    )}

                </div>
            )}
        </div>
    );
};

export default TaskInfo;
