"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
    chatService,
    type ClientChatRoom,
    type ChatMessage,
} from "@/api/chatService";
import { getDecodedUserId } from "@/utils/authUtils";
import type { Chat, Message, User } from "@/components/dashboard/messages/types";

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Map a ClientChatRoom (from GET /chat/client/rooms) → frontend Chat shape.
 */
function mapClientRoomToChat(room: ClientChatRoom): Chat {
    let lastMsg: Message | undefined;
    if (room.lastMessage) {
        const lm = room.lastMessage;
        lastMsg = {
            id: room.id + "-last",
            senderId: `${lm.sender.firstName} ${lm.sender.lastName}`.trim(),
            type: "text",
            text: lm.content,
            timestamp: new Date(lm.sentAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
            }),
            status: "read",
            createdAt: new Date(lm.sentAt).getTime(),
        };
    }

    return {
        id: room.id,
        type: "INDIVIDUAL",
        name: room.title,
        participants: [],
        lastMessage: lastMsg,
        unreadCount: 0,
        isPinned: false,
        isMuted: false,
        messages: [],
    };
}

/** Map a ChatMessage from the API → frontend Message shape */
export function mapApiMessage(m: ChatMessage): Message {
    const currentUserId = getDecodedUserId() ?? "";

    return {
        id: m.id,
        senderId: m.senderId === currentUserId ? "me" : m.senderId,
        type: m.type === "FILE" ? "document" : "text",
        text: m.content ?? undefined,
        fileUrl: (m as any).fileUrl ?? undefined,
        timestamp: new Date(m.sentAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        }),
        status: (m.participantStates?.every((s) => s.status === "READ")
            ? "read"
            : m.participantStates?.some((s) => s.status === "DELIVERED")
                ? "delivered"
                : "sent") as "sent" | "delivered" | "read",
        createdAt: new Date(m.sentAt).getTime(),
    };
}

/**
 * Build a participants array from the messages in a room (since
 * the client rooms endpoint doesn't return member info directly).
 */
export function extractParticipants(messages: ChatMessage[]): User[] {
    const seen = new Map<string, User>();
    const currentUserId = getDecodedUserId() ?? "";

    messages.forEach((m) => {
        if (seen.has(m.senderId)) return;
        if (m.senderId === currentUserId) return;
        const sender = m.sender;
        seen.set(m.senderId, {
            id: m.senderId,
            name: sender
                ? `${sender.firstName ?? ""} ${sender.lastName ?? ""}`.trim()
                : m.senderId,
            role: "PLATFORM_EMPLOYEE" as const,
            isOnline: false,
        });
    });

    return Array.from(seen.values());
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export interface UseChatRoomsReturn {
    rooms: Chat[];
    isLoading: boolean;
    error: string | null;
    refresh: () => void;
    togglePin: (roomId: string) => void;
    toggleMute: (roomId: string) => void;
    setRoomMessages: (roomId: string, messages: Message[], participants?: User[]) => void;
    appendMessage: (roomId: string, message: Message) => void;
    /** Zero-out or set unread badge for a specific room */
    setUnreadCount: (roomId: string, count: number) => void;
}

/**
 * @param activeRoomId - the currently open room; messages arriving here
 *   are appended to the messages list (for display) and do NOT increment
 *   the unread badge. All other rooms DO get their badge incremented.
 */
export function useChatRooms(activeRoomId?: string): UseChatRoomsReturn {
    const [rooms, setRooms] = useState<Chat[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [tick, setTick] = useState(0);

    // Keep a ref so subscription callbacks always see the latest activeRoomId
    // without needing to re-subscribe every time it changes.
    const activeRoomIdRef = useRef(activeRoomId);
    useEffect(() => {
        activeRoomIdRef.current = activeRoomId;
    }, [activeRoomId]);

    const refresh = useCallback(() => setTick((t) => t + 1), []);

    useEffect(() => {
        let cancelled = false;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const channels: any[] = [];

        setIsLoading(true);
        setError(null);

        chatService
            .getClientRooms()
            .then(async (res) => {
                if (cancelled) return;

                const mapped = (res.data ?? []).map(mapClientRoomToChat);
                mapped.sort((a, b) => {
                    if (a.isPinned && !b.isPinned) return -1;
                    if (!a.isPinned && b.isPinned) return 1;
                    return (b.lastMessage?.createdAt ?? 0) - (a.lastMessage?.createdAt ?? 0);
                });
                setRooms(mapped);

                // ── Fetch unread counts for all rooms in parallel ──────────
                const unreadResults = await Promise.allSettled(
                    mapped.map((room) =>
                        chatService
                            .getUnreadCount(room.id)
                            .then((r) => ({ id: room.id, count: r.data?.unreadCount ?? 0 }))
                            .catch(() => ({ id: room.id, count: 0 }))
                    )
                );

                if (cancelled) return;

                const unreadMap = new Map<string, number>();
                unreadResults.forEach((result) => {
                    if (result.status === "fulfilled") {
                        unreadMap.set(result.value.id, result.value.count);
                    }
                });

                setRooms((prev) =>
                    prev.map((r) =>
                        unreadMap.has(r.id)
                            ? { ...r, unreadCount: unreadMap.get(r.id)! }
                            : r
                    )
                );

                // ── Subscribe to ALL rooms via Supabase Realtime ───────────
                // For non-active rooms   → increment badge + update preview
                // For the active room    → append to messages list (so ChatWindow
                //                         shows it instantly) + update preview
                mapped.forEach((room) => {
                    const ch = chatService.subscribeToMessages(
                        room.id,
                        (rawMsg: ChatMessage) => {
                            if (cancelled) return;
                            const msg = mapApiMessage(rawMsg);
                            const isActiveRoom = room.id === activeRoomIdRef.current;

                            setRooms((prev) =>
                                prev.map((r) => {
                                    if (r.id !== room.id) return r;
                                    return {
                                        ...r,
                                        // Append to displayed messages only for the active room
                                        messages: isActiveRoom
                                            ? [...r.messages, msg]
                                            : r.messages,
                                        // Always update the last-message preview in the sidebar
                                        lastMessage: msg,
                                        // Increment badge only for non-active rooms
                                        unreadCount: isActiveRoom
                                            ? r.unreadCount
                                            : r.unreadCount + 1,
                                    };
                                })
                            );
                        }
                    );
                    if (ch) channels.push(ch);
                });
            })
            .catch((err: unknown) => {
                if (cancelled) return;
                setError((err as Error).message ?? "Failed to load rooms");
            })
            .finally(() => {
                if (!cancelled) setIsLoading(false);
            });

        return () => {
            cancelled = true;
            // Unsubscribe from all room channels on cleanup
            channels.forEach((ch) => {
                try { ch?.unsubscribe?.(); } catch { /* ignore */ }
            });
        };
    }, [tick]);

    const togglePin = useCallback((roomId: string) => {
        setRooms((prev) => {
            const updated = prev.map((r) =>
                r.id === roomId ? { ...r, isPinned: !r.isPinned } : r
            );
            return [...updated].sort((a, b) => {
                if (a.isPinned && !b.isPinned) return -1;
                if (!a.isPinned && b.isPinned) return 1;
                return 0;
            });
        });
        // Get current isPinned from state snapshot
        setRooms((prev) => {
            const room = prev.find((r) => r.id === roomId);
            if (room) {
                chatService.updateRoomPin(roomId, !!room.isPinned).catch(console.error);
            }
            return prev;
        });
    }, []);

    const toggleMute = useCallback((roomId: string) => {
        setRooms((prev) =>
            prev.map((r) => r.id === roomId ? { ...r, isMuted: !r.isMuted } : r)
        );
        setRooms((prev) => {
            const room = prev.find((r) => r.id === roomId);
            if (room) {
                chatService.updateRoomMute(roomId, !!room.isMuted).catch(console.error);
            }
            return prev;
        });
    }, []);

    const setRoomMessages = useCallback(
        (roomId: string, messages: Message[], participants?: User[]) => {
            setRooms((prev) =>
                prev.map((r) =>
                    r.id === roomId
                        ? { ...r, messages, participants: participants ?? r.participants }
                        : r
                )
            );
        },
        []
    );

    /** Used for optimistic sends — appends a message without touching unread count */
    const appendMessage = useCallback((roomId: string, message: Message) => {
        setRooms((prev) =>
            prev.map((r) =>
                r.id === roomId
                    ? { ...r, messages: [...r.messages, message], lastMessage: message }
                    : r
            )
        );
    }, []);

    const setUnreadCount = useCallback((roomId: string, count: number) => {
        setRooms((prev) =>
            prev.map((r) => r.id === roomId ? { ...r, unreadCount: count } : r)
        );
    }, []);

    return {
        rooms,
        isLoading,
        error,
        refresh,
        togglePin,
        toggleMute,
        setRoomMessages,
        appendMessage,
        setUnreadCount,
    };
}
