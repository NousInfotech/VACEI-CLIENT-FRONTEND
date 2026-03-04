"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { chatService, type ChatMessage, type ChatMember } from "@/api/chatService";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { handleAuthError, getDecodedUserId } from "@/utils/authUtils";

export interface UseChatReturn {
  messages: ChatMessage[];
  members: ChatMember[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  nextCursor: string | null;
  unreadCount: number;
  roomError: string | null;
  roomId: string | null;
  loadMessages: (cursor?: string | null) => Promise<void>;
  loadMore: () => Promise<void>;
  sendMessage: (content: string, fileUrl?: string, replyToMessageId?: string | null) => Promise<ChatMessage | null>;
  markAsRead: () => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  uploadFile: (file: File) => Promise<string>;
}

function mapApiMessageToChatMessage(m: ChatMessage): ChatMessage {
  return {
    ...m,
    content: m.content ?? null,
    fileUrl: m.fileUrl ?? null,
  };
}

export interface UseChatOptions {
  /** Partner user ID for DIRECT chat fallback when engagement room access is denied */
  partnerId?: string | null;
}

export function useChat(
  engagementId: string | null,
  options?: UseChatOptions
): UseChatReturn {
  const partnerId = options?.partnerId ?? null;
  const router = useRouter();

  const [roomId, setRoomId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [members, setMembers] = useState<ChatMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [roomError, setRoomError] = useState<string | null>(null);

  const messageChannelRef = useRef<RealtimeChannel | null>(null);
  const statusChannelRef = useRef<RealtimeChannel | null>(null);

  const loadMessages = useCallback(
    async (cursor?: string | null) => {
      if (!roomId) return;
      setIsLoading(true);
      try {
        const response = await chatService.getMessages(
          roomId,
          cursor || undefined
        );
        const data = (response.data ?? []).map(mapApiMessageToChatMessage);

        // API returns newest first (descending). Reverse to sort ascending (oldest first).
        data.reverse();

        if (cursor) {
          setMessages((prev) => [...data, ...prev]);
        } else {
          setMessages(data);
        }

        setNextCursor(response.meta?.nextCursor ?? null);
        setHasMore(response.meta?.hasMore ?? false);
      } catch (err) {
        console.error("Failed to load messages:", err);
        handleAuthError(err, router);
      } finally {
        setIsLoading(false);
      }
    },
    [roomId, router]
  );

  const loadUnreadCount = useCallback(async () => {
    if (!roomId) return;
    try {
      const response = await chatService.getUnreadCount(roomId);
      setUnreadCount(response.data?.unreadCount ?? 0);
    } catch (err) {
      console.error("Failed to load unread count:", err);
      handleAuthError(err, router);
    }
  }, [roomId, router]);

  const loadMembers = useCallback(async () => {
    if (!roomId) return;
    try {
      const response = await chatService.getRoomById(roomId);
      setMembers(response.data?.members ?? []);
    } catch (err) {
      console.error("Failed to load members:", err);
      handleAuthError(err, router);
    }
  }, [roomId, router]);

  const subscribeToMessages = useCallback(() => {
    if (!roomId) return;
    const channel = chatService.subscribeToMessages(roomId, (newMessage, eventType) => {
      if (eventType === 'DELETE') {
        setMessages((prev) => prev.filter((m) => m.id !== newMessage.id));
        return;
      }
      setMessages((prev) => {
        const idx = prev.findIndex((m) => m.id === newMessage.id);
        if (idx !== -1) {
          const next = [...prev];
          next[idx] = mapApiMessageToChatMessage(newMessage);
          return next;
        }
        return [...prev, mapApiMessageToChatMessage(newMessage)];
      });
    });
    if (channel) messageChannelRef.current = channel;
  }, [roomId]);

  const subscribeToMemberStatus = useCallback(() => {
    if (!roomId) return;
    const channel = chatService.subscribeToMemberStatus(roomId, (statusUpdate) => {
      setMembers((prev) => {
        const idx = prev.findIndex((m) => m.userId === statusUpdate.userId);
        if (idx === -1) return prev;
        const next = [...prev];
        next[idx] = { ...next[idx], ...statusUpdate };
        return next;
      });
    });
    if (channel) statusChannelRef.current = channel;
  }, [roomId]);

  const sendMessage = useCallback(
    async (content: string, fileUrl?: string, replyToMessageId?: string | null) => {
      if (!roomId) return null;
      
      const userId = getDecodedUserId() ?? "";
      const tempId = `optimistic-${Date.now()}`;
      
      const optimisticMsg: ChatMessage = {
        id: tempId,
        roomId,
        senderId: userId,
        content,
        fileUrl: fileUrl ?? null,
        type: fileUrl ? "FILE" : "TEXT",
        sentAt: new Date().toISOString(),
        replyToMessageId,
      };

      // Add optimistic message
      setMessages((prev) => [...prev, optimisticMsg]);

      try {
        const msg = await chatService.sendMessage(
          roomId,
          content,
          fileUrl,
          replyToMessageId ? { replyToMessageId } : undefined
        );
        
        if (msg) {
          setMessages((prev) => {
            // Replace optimistic with canonical
            const filtered = prev.filter((m) => m.id !== tempId);
            if (filtered.some((m) => m.id === msg.id)) return filtered;
            return [...filtered, mapApiMessageToChatMessage(msg)];
          });
        } else {
          // If null, remove optimistic
          setMessages((prev) => prev.filter((m) => m.id !== tempId));
        }
        return msg;
      } catch (err) {
        // Rollback on error
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
        console.error("Failed to send message:", err);
        handleAuthError(err, router);
        throw err;
      }
    },
    [roomId, router]
  );

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading || isLoadingMore) return;
    setIsLoadingMore(true);
    try {
      await loadMessages(nextCursor);
    } finally {
      setIsLoadingMore(false);
    }
  }, [hasMore, isLoading, isLoadingMore, loadMessages, nextCursor]);

  const markAsRead = useCallback(async () => {
    if (!roomId) return;
    try {
      await chatService.markRoomAsRead(roomId);
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark as read:", err);
      handleAuthError(err, router);
    }
  }, [roomId, router]);

  const deleteMessage = useCallback(
    async (messageId: string) => {
      try {
        await chatService.deleteMessage(messageId);
        setMessages((prev) => prev.map(m => m.id === messageId ? { ...m, isDeleted: true } : m));
      } catch (err) {
        console.error("Failed to delete message:", err);
        handleAuthError(err, router);
        throw err;
      }
    },
    [router]
  );

  const uploadFile = useCallback(async (file: File): Promise<string> => {
    const res = await chatService.uploadFile(file);
    const data = res.data as { fileUrl?: string; url?: string } | undefined;
    return data?.url ?? data?.fileUrl ?? "";
  }, []);

  useEffect(() => {
    if (!engagementId) return;

    setRoomError(null);

    (async () => {
      try {
        const response = await chatService.getRoomByEngagementId(engagementId);
        const room = response.data;
        const id = room?.id;
        if (!id) {
          setRoomError("Room not found");
          return;
        }
        setRoomId(id);
      } catch (err: unknown) {
        const msg = (err as Error).message ?? "Failed to load room";
        const isAccessDenied =
          msg.toLowerCase().includes("access") ||
          msg.toLowerCase().includes("authorization") ||
          msg.includes("403");

        if (isAccessDenied && partnerId) {
          try {
            const directRes = await chatService.createDirectRoom(
              partnerId,
              "Chat with partner"
            );
            const id = directRes.data?.id;
            if (id) {
              setRoomId(id);
              setRoomError(null);
              return;
            }
          } catch (directErr) {
            setRoomError((directErr as Error).message ?? "Failed to create direct chat");
            setRoomId(null);
            return;
          }
        }

        setRoomError(msg);
        setRoomId(null);
      }
    })();
  }, [engagementId, partnerId]);

  useEffect(() => {
    if (!roomId) return;

    setNextCursor(null);
    setHasMore(true);

    // NOTE: We are not using Supabase Auth sessions here.
    // Do not set a custom realtime auth token based on the backend JWT,
    // as this can cause channel errors while auth.uid() remains NULL.

    (async () => {
      await Promise.all([
        loadMessages(null),
        loadMembers(),
        loadUnreadCount(),
      ]);
    })();

    subscribeToMessages();
    subscribeToMemberStatus();

    return () => {
      messageChannelRef.current?.unsubscribe?.();
      statusChannelRef.current?.unsubscribe?.();
      messageChannelRef.current = null;
      statusChannelRef.current = null;
    };
  }, [roomId]);

  return {
    messages,
    members,
    isLoading,
    isLoadingMore,
    hasMore,
    nextCursor,
    unreadCount,
    roomError,
    roomId,
    loadMessages,
    loadMore,
    sendMessage,
    markAsRead,
    deleteMessage,
    uploadFile,
  };
}
