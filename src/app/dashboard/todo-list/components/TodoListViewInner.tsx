// File: components/TodoListViewInner.tsx

"use client";
import type { RefObject } from "react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, useRef, useCallback } from "react";
import {
  fetchTaskById,
  fetchTaskComments,
  createTaskComment,
  fetchTaskStatuses,
  updateTaskStatus,
} from "@/api/taskService";
import TaskHeader from "./TaskHeader";
import TaskMeta from "./TaskMeta";
import TaskAttachments from "./TaskAttachments";
import CommentsSection from "./CommentsSection";
import CommentInput from "./CommentInput";
import { mapComments, mergeComments } from "./commentUtils";

export default function TodoListViewInner() {
  const backendUrl = process.env.NEXT_PUBLIC_UPLOAD_PATH || "";
  const [messageError, setMessageError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const taskIdParam = searchParams.get("taskId");
  const [task, setTask] = useState<any | null>(null);
  const [statuses, setStatuses] = useState<any[]>([]);
  const [selectedStatusId, setSelectedStatusId] = useState<number | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<any[]>([]);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const decodedTaskIdRef = useRef<number | null>(null);
  const isResolved = task?.status === "Resolved";

  // New ref to store the latest messages array without putting it in useEffect dependencies
  const messagesRef = useRef<any[]>(messages);
  useEffect(() => {
    messagesRef.current = messages; // Keep messagesRef always updated with the latest messages state
  }, [messages]);


  useEffect(() => {
    if (taskIdParam) {
      try {
        const id = parseInt(atob(taskIdParam));
        if (!isNaN(id)) {
          decodedTaskIdRef.current = id;
        }
      } catch (err) {
        console.error("Failed to decode taskId:", err);
      }
    }

    const userIdEncoded = localStorage.getItem("user_id");
    if (userIdEncoded) {
      try {
        const userId = parseInt(atob(userIdEncoded));
        if (!isNaN(userId)) {
          setCurrentUserId(userId);
        }
      } catch (err) {
        console.error("Failed to decode user_id:", err);
      }
    }
  }, [taskIdParam]);

  useEffect(() => {
    if (decodedTaskIdRef.current === null || currentUserId === null) return;

    const loadInitialData = async () => {
      setLoading(true);
      try {
        const [taskData, statusOptions, initialComments] = await Promise.all([
          fetchTaskById(decodedTaskIdRef.current!),
          fetchTaskStatuses(),
          fetchTaskComments(decodedTaskIdRef.current!, undefined, undefined, 30),
        ]);

        setTask(taskData);
        setStatuses(statusOptions);
        setMessages(mapComments(initialComments, currentUserId!));
        setSelectedStatusId(taskData.statusId);
        if (initialComments.length < 30) setHasMore(false);
      } catch (err) {
        console.error("Failed to load task or comments:", err);
      } finally {
        setLoading(false);
      }
    };

    const pollNewComments = async () => {
      try {
        // Use messagesRef.current to get the latest messages without putting 'messages' in deps
        const latestCommentDate = messagesRef.current[messagesRef.current.length - 1]?.createdAt;
        const newComments = await fetchTaskComments(
          decodedTaskIdRef.current!,
          latestCommentDate
        );
        if (newComments.length > 0) {
          setMessages((prev) =>
            mergeComments(prev, mapComments(newComments, currentUserId!))
          );
        }
      } catch (err) {
        console.error("Polling failed:", err);
      }
    };

    loadInitialData();
    // Set up polling ONLY when decodedTaskIdRef.current or currentUserId changes
    if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
    pollingIntervalRef.current = setInterval(pollNewComments, 5000);

    return () => {
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
    };
    // IMPORTANT: Remove `messages` from this dependency array
  }, [decodedTaskIdRef.current, currentUserId]); // Polling interval only resets when task or user changes


  const loadOlderMessages = useCallback(async () => {
    if (
      !hasMore ||
      loadingOlder ||
      decodedTaskIdRef.current === null ||
      currentUserId === null
    )
      return;
    setLoadingOlder(true);
    try {
      const oldestDate = messages[0]?.createdAt;
      const older = await fetchTaskComments(
        decodedTaskIdRef.current,
        undefined,
        oldestDate,
        30
      );
      setMessages((prev) =>
        mergeComments(mapComments(older, currentUserId), prev)
      );
      if (older.length < 30) setHasMore(false);
    } catch (err) {
      console.error("Loading older messages failed:", err);
    } finally {
      setLoadingOlder(false);
    }
  }, [hasMore, loadingOlder, messages, currentUserId]);

  const handleSendMessage = async (attachments: File[]) => {
    const text = messageInputRef.current?.value.trim();


    if (!task || currentUserId === null || isResolved) return;

    const formData = new FormData();
    formData.append("taskId", String(task.id));
    formData.append("comment", text || "");
    formData.append("commentedById", String(currentUserId));


    attachments.forEach((file) => {
      formData.append("attachments", file);
    });

    try {
      const newComment = await createTaskComment(formData);

      setMessages((prev) =>
          mergeComments(prev, mapComments([newComment], currentUserId!))
      );
      if (messageInputRef.current) messageInputRef.current.value = "";
      setMessageError(null);
    } catch (err) {
      console.error("Send failed:", err);
      setMessageError("Failed to send comment. Ensure the server supports file uploads.");
    }
  };

  const handleStatusUpdate = async () => {
    if (!task || selectedStatusId === null) return;
    try {
      await updateTaskStatus(task.id, selectedStatusId);
      const updated = await fetchTaskById(task.id);
      setTask(updated);
    } catch (err) {
      console.error("Status update failed:", err);
    }
  };

  if (loading)
    return <div className="p-10 text-center">Loading task details...</div>;
  if (!task)
    return (
      <div className="p-10 text-center text-red-500">
        Task not found or an error occurred.
      </div>
    );

  return (
    <section className="mx-auto w-full max-w-[1400px] pt-5">
      <div className="bg-card border border-border rounded-[16px] p-4 shadow-md w-full mx-auto transition-all duration-300 hover:shadow-md">
        <TaskHeader task={task} />
        <TaskAttachments attachments={task.attachments || []} backendUrl={backendUrl} />
        <TaskMeta
          task={task}
          statuses={statuses}
          selectedStatusId={selectedStatusId}
          setSelectedStatusId={setSelectedStatusId}
          handleStatusUpdate={handleStatusUpdate}
          currentUserId={currentUserId}
        />
        <CommentsSection
          messages={messages}
          loadOlderMessages={loadOlderMessages}
          loadingOlder={loadingOlder}
          onScroll={() => { }}
        />
        <CommentInput
          isResolved={isResolved}
          messageError={messageError}
          setMessageError={setMessageError}
          handleSendMessage={handleSendMessage}
          messageInputRef={messageInputRef}
        />
      </div>
    </section>
  );
}