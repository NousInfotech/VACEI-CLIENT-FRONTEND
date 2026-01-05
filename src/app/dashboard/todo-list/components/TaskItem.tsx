// components/tasks/TaskItem.tsx
import React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { AttachmentIcon, MessageUser01Icon, WaveTriangleIcon, Unlink03Icon, Edit03Icon, ViewIcon, Delete02Icon } from "@hugeicons/core-free-icons";

interface Task {
  otherUser: { username: string; email: string };
  id: number;
  title: string;
  description: string;
  assignedToId: number;
  assignedTo: string;
  statusId: number;
  status: string;
  category?: string;
  categoryId?: number;
  createdAt: string;
  createdById: number;
  attachments?: { id: number; fileName: string; filePath: string; uploadedAt: string }[];
}

interface TaskItemProps {
  task: Task;
  currentUserId: number | null;
  onView: (encodedTaskId: string) => void;
  onEdit: (encodedTaskId: string) => void;
  onDelete: (taskId: number) => void;
}

export default function TaskItem({ task, currentUserId, onView, onEdit, onDelete }: TaskItemProps) {
  return (
    <div className="bg-card shadow rounded-lg px-4 py-3 flex justify-between items-center">
      <div>
        <span className="text-base font-medium text-dark block">{task.title}</span>
        <div className="flex flex-wrap gap-3 mt-1.5 text-muted-foreground">
          <span className="text-xs flex gap-2 items-center">
            <HugeiconsIcon icon={MessageUser01Icon} className="w-4 h-4 text-primary" />
            {task.otherUser.username} ({task.otherUser.email})
          </span>
          <span className="text-xs flex gap-2 items-center text-primary">
            <HugeiconsIcon icon={WaveTriangleIcon} className="w-4 h-4" />
            {task.status ?? "No Status"}
          </span>
          {task.category && (
            <span className="text-xs flex gap-2 items-center">
              <HugeiconsIcon icon={Unlink03Icon} className="w-4 h-4 text-primary" />
              {task.category}
            </span>
          )}
          {task.attachments && task.attachments.length > 0 && (
            <span className="text-xs flex gap-2 items-center">
              <HugeiconsIcon icon={AttachmentIcon} className="w-4 h-4 text-primary" />
              {task.attachments.length} Attachment(s)
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-xs text-brand-body/40 font-medium">{new Date(task.createdAt).toLocaleDateString()}</span>
        <div className="flex gap-2">
          <button className="cursor-pointer" onClick={() => onView(btoa(task.id.toString()))}>
            <HugeiconsIcon icon={ViewIcon} className="w-4 h-4 text-primary" />
          </button>
          {task.createdById === currentUserId && (
            <>
              <button className="cursor-pointer" onClick={() => onEdit(btoa(task.id.toString()))}>
                <HugeiconsIcon icon={Edit03Icon} className="w-4 h-4 text-primary" />
              </button>
              <button className="cursor-pointer" onClick={() => onDelete(task.id)}>
                <HugeiconsIcon icon={Delete02Icon} className="w-4 h-4 text-red-500" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}