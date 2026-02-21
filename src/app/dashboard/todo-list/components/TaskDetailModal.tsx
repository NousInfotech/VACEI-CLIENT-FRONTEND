import React, { useState } from "react";
import { TodoItem, updateTodo, updateTodoStatus } from "@/api/todoService";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon, SentIcon } from "@hugeicons/core-free-icons";

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  task: TodoItem | null;
}

export default function TaskDetailModal({ isOpen, onClose, onSuccess, task }: TaskDetailModalProps) {
  const [reply, setReply] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !task) return null;

  const statusColor: Record<string, string> = {
    ACTION_REQUIRED: "bg-amber-50 text-amber-700 border-amber-200",
    ACTION_TAKEN: "bg-green-50 text-green-700 border-green-200",
    COMPLETED: "bg-blue-50 text-blue-700 border-blue-200",
  };

  const st = (task.status || "ACTION_REQUIRED").toUpperCase();
  const colorClass = statusColor[st] || "bg-gray-50 text-gray-700 border-gray-200";

  const statusLabelMap: Record<string, string> = {
    ACTION_REQUIRED: 'Action Required',
    ACTION_TAKEN: 'Action Taken',
    COMPLETED: 'Completed',
  };
  const statusLabel = statusLabelMap[st] || st;

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const isCustomTask = task.type === "CUSTOM";
  const canReply = isCustomTask && st === "ACTION_REQUIRED";

  const handleSubmit = async () => {
    if (!reply.trim()) return;
    setIsSubmitting(true);
    try {
      // 1. Update the comment
      await updateTodo(task.id, { customerComment: reply });
      // 2. Change status to ACTION_TAKEN
      await updateTodoStatus(task.id, "ACTION_TAKEN");
      
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Failed to submit reply:", error);
      alert("Failed to submit reply. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-card rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 bg-gray-900 rounded-full" />
            <h2 className="text-lg font-semibold text-gray-900">Task Details</h2>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-gray-900 transition-colors"
            aria-label="Close"
          >
            <HugeiconsIcon icon={Cancel01Icon} className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {/* Title */}
          <div>
            <p className="text-xs uppercase font-medium text-muted-foreground tracking-widest mb-1">Title</p>
            <p className="text-base font-semibold text-gray-900">{task.title}</p>
          </div>

          {/* Description */}
          {task.description && (
            <div>
              <p className="text-xs uppercase font-medium text-muted-foreground tracking-widest mb-1">Description</p>
              <p className="text-sm text-gray-700 leading-relaxed">{task.description}</p>
            </div>
          )}

          {/* Row: Status + Service */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs uppercase font-medium text-muted-foreground tracking-widest mb-1">Status</p>
              <span className={`text-xs font-semibold border px-2.5 py-1 rounded-xl ${colorClass}`}>
                {statusLabel}
              </span>
            </div>
            <div>
              <p className="text-xs uppercase font-medium text-muted-foreground tracking-widest mb-1">Service</p>
              <p className="text-sm text-gray-700">{task.service || "—"}</p>
            </div>
          </div>

          {/* Row: Deadline + Type */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs uppercase font-medium text-muted-foreground tracking-widest mb-1">Deadline</p>
              <p className="text-sm font-medium text-rose-600">{formatDate(task.deadline)}</p>
            </div>
            <div>
              <p className="text-xs uppercase font-medium text-muted-foreground tracking-widest mb-1">Type</p>
              <span className="text-xs font-medium text-gray-600 bg-gray-100 border border-gray-200 px-2.5 py-1 rounded-lg">
                Custom
              </span>
            </div>
          </div>

          {/* Created At */}
          <div>
            <p className="text-xs uppercase font-medium text-muted-foreground tracking-widest mb-1">Created</p>
            <p className="text-sm text-gray-600">{formatDate(task.createdAt)}</p>
          </div>

          {/* Existing Reply */}
          {task.customerComment && (
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
              <p className="text-xs uppercase font-medium text-muted-foreground tracking-widest mb-2">Your Previous Reply</p>
              <p className="text-sm text-gray-700 italic">"{task.customerComment}"</p>
            </div>
          )}

          {/* Reply Interface */}
          {canReply && (
            <div className="pt-2 border-t border-dashed border-border">
              <label htmlFor="reply" className="block text-xs uppercase font-medium text-muted-foreground tracking-widest mb-2">
                Your Reply
              </label>
              <textarea
                id="reply"
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Type your response here..."
                className="w-full min-h-[100px] p-3 text-sm border border-border rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all resize-none"
                disabled={isSubmitting}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          {canReply && (
            <button
              onClick={handleSubmit}
              disabled={!reply.trim() || isSubmitting}
              className="px-5 py-2 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <HugeiconsIcon icon={SentIcon} className="w-4 h-4" />
              )}
              Submit Reply
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
