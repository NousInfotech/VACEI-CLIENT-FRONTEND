"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import AlertMessage from "../../../../components/AlertMessage";
import { HugeiconsIcon } from "@hugeicons/react";
import { Edit03Icon, Delete02Icon, } from "@hugeicons/core-free-icons";
import { Select } from "@/components/ui/select";

type CommentSectionProps = {
  fileId: string;
  files: {
    fileName: ReactNode;
    id: string;
    name: string;
  }[];
};

type Comment = {
  id: number;
  message: string;
  document: any;
  canDelete: number;
  createdAt: string;
  createdBy: string;
};

const CommentSection: React.FC<CommentSectionProps> = ({ fileId, files }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [newCommentTarget, setNewCommentTarget] = useState<string>(fileId);
  const [selectedTarget, setSelectedTarget] = useState<string>(fileId);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState<
    { message: string; variant?: "success" | "danger" | "warning" | "info" } | null
  >(null);

  const [latestCommentTimestamp, setLatestCommentTimestamp] = useState<string | null>(null);
  const latestTimestampRef = useRef<string | null>(null);

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "";

  const fetchComments = async (targetId: string, silent = false) => {
    if (!silent) setLoading(true);
    try {
      const token = localStorage.getItem("token") || "";
      let queryParam = targetId !== "0" ? `?fileId=${targetId}` : "";

      const sinceTimestamp = silent ? latestTimestampRef.current : latestCommentTimestamp;
      if (sinceTimestamp) {
        queryParam += queryParam
          ? `&since=${encodeURIComponent(sinceTimestamp)}`
          : `?since=${encodeURIComponent(sinceTimestamp)}`;
      }

      const res = await fetch(`${backendUrl}comments${queryParam}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to fetch comments");

      const data: Comment[] = await res.json();

      if (silent) {
        if (data && data.length > 0) {
          setComments((prev) => {
            const existingIds = new Set(prev.map((c) => c.id));
            const filteredNew = data.filter((c) => !existingIds.has(c.id));
            return [...prev, ...filteredNew];
          });

          const maxTimestamp = data.reduce(
            (max, c) => (c.createdAt > max ? c.createdAt : max),
            latestTimestampRef.current || ""
          );
          setLatestCommentTimestamp(maxTimestamp);
          latestTimestampRef.current = maxTimestamp;
        }
      } else {
        setComments(data || []);
        if (data.length > 0) {
          const maxTimestamp = data.reduce((max, c) => (c.createdAt > max ? c.createdAt : max), "");
          setLatestCommentTimestamp(maxTimestamp);
          latestTimestampRef.current = maxTimestamp;
        } else {
          setLatestCommentTimestamp(null);
          latestTimestampRef.current = null;
        }
      }
    } catch (err) {
      console.error("Error fetching comments", err);
      //setAlert({ message: "Failed to load comments.", variant: "danger" });
    } finally {
      if (!silent) setLoading(false);
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    setLatestCommentTimestamp(null);
    latestTimestampRef.current = null;
    fetchComments(selectedTarget);
    const interval = setInterval(() => {
      fetchComments(selectedTarget, true);
    }, 5000);
    return () => clearInterval(interval);
  }, [selectedTarget]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    setSubmitting(true);
    const token = localStorage.getItem("token") || "";

    try {
      const bodyPayload =
        newCommentTarget === "0"
          ? { text: newComment }
          : { fileId: newCommentTarget, text: newComment };

      const res = await fetch(`${backendUrl}comments/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bodyPayload),
      });

      if (!res.ok) {
        setAlert({ message: "Failed to add comment.", variant: "danger" });
        setSubmitting(false);
        return;
      }

      if (selectedTarget === newCommentTarget) {
        await fetchComments(selectedTarget, true);
      }

      setNewComment("");
      setAlert({ message: "Comment added successfully!", variant: "success" });
    } catch (err) {
      console.error("Error adding comment", err);
      setAlert({ message: "Failed to add comment.", variant: "danger" });
    } finally {
      setSubmitting(false);
    }
  };

  const startEditing = (id: number, message: string) => {
    setEditingId(id);
    setEditingText(message);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingText("");
  };

  const saveEdit = async (id: number) => {
    if (!editingText.trim()) {
      setAlert({ message: "Comment cannot be empty.", variant: "warning" });
      return;
    }
    setSubmitting(true);
    const token = localStorage.getItem("token") || "";

    try {
      const res = await fetch(`${backendUrl}comments/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: editingText }),
      });

      if (!res.ok) {
        setAlert({ message: "Failed to update comment.", variant: "danger" });
        setSubmitting(false);
        return;
      }

      setComments((prev) =>
        prev.map((c) => (c.id === id ? { ...c, message: editingText } : c))
      );
      setEditingId(null);
      setEditingText("");
      setAlert({ message: "Comment updated successfully!", variant: "success" });
    } catch (err) {
      console.error("Error updating comment", err);
      setAlert({ message: "Failed to update comment.", variant: "danger" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    const confirmed = confirm("Are you sure you want to delete this comment?");
    if (!confirmed) return;

    setSubmitting(true);
    const token = localStorage.getItem("token") || "";

    try {
      const res = await fetch(`${backendUrl}comments/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to delete comment");

      await fetchComments(selectedTarget, true);
      setAlert({ message: "Comment deleted.", variant: "info" });
    } catch (err) {
      console.error("Error deleting comment", err);
      setAlert({ message: "Failed to delete comment.", variant: "danger" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!submitting && newComment.trim()) {
        handleAddComment();
      }
    }
  };

  return (
    <div className="mt-6 pt-4  bg-gradient-to-tr from-white to-gray-50 rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-2xl text-brand-body tracking-wide">Comments</h3>
        <Select
          value={selectedTarget}
          onChange={(e) => {
            setSelectedTarget(e.target.value);
            setNewCommentTarget(e.target.value);
          }}
          className="text-sm min-w-[180px]"
          aria-label="Select file to comment on"
        >
          {files.map((file) => (
            <option key={file.id} value={file.id}>
              {file.fileName}
            </option>
          ))}
          <option value="0">Whole Document</option>
        </Select>
      </div>

      {alert && (
        <AlertMessage
          message={alert.message}
          variant={alert.variant}
          onClose={() => setAlert(null)}
        />
      )}

      {initialLoading ? (
        <p className="text-center text-muted-foreground italic">Loading comments...</p>
      ) : (
        <div className="space-y-5 max-h-96 overflow-y-auto pr-3 scrollbar-thin scrollbar-thumb-blue-400 scrollbar-track-gray-200">
          {comments.length === 0 ? (
            <p className="text-center text-muted-foreground italic select-none">No comments yet.</p>
          ) : (
            comments.map((comment) => (
              <div
                key={comment.id}
                className="flex items-start space-x-4 bg-card rounded-xl p-4 shadow-md hover:shadow-md transition duration-300"
              >
                <div
                  className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-400 text-card-foreground rounded-full font-semibold text-lg select-none"
                  title={comment.createdBy}
                >
                  {comment.createdBy?.charAt(0).toUpperCase() || "U"}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-brand-body text-base truncate" title={comment.createdBy}>
                      {comment.createdBy || "Unknown"}
                    </span>
                    <span className="text-xs text-muted-foreground select-none" title={new Date(comment.createdAt).toLocaleString()}>
                      {new Date(comment.createdAt).toLocaleString(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </span>
                  </div>

                  {editingId === comment.id ? (
                    <>
                      <textarea
                        className="w-full border border-border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        rows={3}
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        disabled={submitting}
                        aria-label="Edit comment"
                      />
                      <div className="mt-3 flex space-x-2 justify-end"> {/* Reduced space-x, added justify-end */}
                        <button
                          onClick={cancelEditing}
                          disabled={submitting}
                          className="px-3 py-1.5 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400
               disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => saveEdit(comment.id)}
                          disabled={submitting || !editingText.trim()}
                          className="px-3 py-1.5 bg-brand-primary text-card-foreground rounded-md hover:bg-brand-primary700
               disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition"
                        >
                          Save
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-gray-800 text-sm whitespace-pre-wrap break-words">{comment.message}</p>
                      {comment.canDelete ? (
                        <div className="mt-3 flex space-x-4 text-sm select-none">
                          <button
                            onClick={() => startEditing(comment.id, comment.message)}
                            className="text-brand-primary hover:text-brand-primary800 focus:outline-none focus:ring-0 rounded-full p-1 -ml-1 transition duration-200"
                            title="Edit comment"
                          >
                            <HugeiconsIcon icon={Edit03Icon} className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(comment.id)}
                            className="text-red-600 hover:text-red-800 focus:outline-none focus:ring-0 rounded-full p-1 transition duration-200"
                            title="Delete comment"
                          >
                            <HugeiconsIcon icon={Delete02Icon} className="w-5 h-5" />
                          </button>
                        </div>
                      ) : null}
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <div className="mt-8 bg-card p-5 rounded-xl shadow-md border border-border">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full border border-border rounded-lg p-4 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition"
          rows={4}
          placeholder="Write a comment..."
          disabled={submitting}
          aria-label="Write a comment"
        />
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleAddComment}
            disabled={!newComment.trim() || submitting}
            className={`px-6 py-3 rounded-lg text-card-foreground font-semibold text-sm transition ${!newComment.trim() || submitting
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-brand-primary hover:bg-brand-primary700"
              }`}
          >
            Comment
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommentSection;
