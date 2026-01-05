// TaskHeader.tsx
import React from "react";
import TaskInfo, { Priority } from "./TaskInfo";

export default function TaskHeader({ task }: { task: any }) {
  return (
    <div>
      {/* Title and TaskInfo side by side */}
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-semibold">{task.title}</h2>
        <TaskInfo
          priority={task.priority as Priority | null}
        />
      </div>
        <TaskInfo
          dueDate={task.dueDate}
        />

      {/* Description below */}
      <p className="text-brand-body">{task.description}</p>
    </div>
  );
}
