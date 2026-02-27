"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
    chatService,
    type ClientChatRoom,
    type ChatMessage,
} from "@/api/chatService";
import { getDecodedUserId } from "@/utils/authUtils";
import type { Chat, Message, User, UserRole } from "@/components/dashboard/messages/types";

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Map room members to participants (excludes current user).
 */
function membersToParticipants(members?: Array<Record<string, any>>): User[] {
    if (!members?.length) return [];
    const currentUserId = getDecodedUserId() ?? "";
    return members
        .filter((m) => m.userId !== currentUserId)
        .map((m) => {
            const rawRole =
                m.appRole ||
                m.user?.appRole ||
                "";
            const roleStr = typeof rawRole === "string" ? rawRole : "";
            const displayRole = roleStr.replace(/^ORG_/, "PARTNER_");
            return {
                id: m.userId,
                name: m.user
                    ? `${m.user.firstName ?? ""} ${m.user.lastName ?? ""}`.trim() || m.userId
                    : m.userId,
                role: displayRole,
                isOnline: false,
            };
        });
}

/**
 * Map a ClientChatRoom (from GET /chat/client/rooms) → frontend Chat shape.
 */
function mapClientRoomToChat(room: ClientChatRoom): Chat {
    const currentUserId = getDecodedUserId() ?? "";
    let lastMsg: Message | undefined;
    if (room.lastMessage) {
        const lm = room.lastMessage;
        const isMe = lm.sender?.id === currentUserId;
        const resolvedName = lm.sender
            ? `${lm.sender.firstName ?? ""} ${lm.sender.lastName ?? ""}`.trim()
            : "";
        lastMsg = {
            id: room.id + "-last",
            senderId: isMe ? "me" : (lm.sender?.id ?? resolvedName),
            senderName: isMe ? undefined : resolvedName || undefined,
            type: "text",
            text: lm.content,
            timestamp: new Date(lm.sentAt).toLocaleTimeString('en-US', {
                hour: "2-digit",
                minute: "2-digit",
            }),
            status: "read",
            createdAt: new Date(lm.sentAt).getTime(),
        };
    }

    return {
        id: room.id,
        // @ts-ignore - The API may not explicitly type contextType here, but that is what we need
        type: (room.contextType && room.contextType === 'DIRECT')
            ? "INDIVIDUAL"
            : (room.contextType === 'ENGAGEMENT' || (room.members && room.members.length > 2)) ? "GROUP" : "INDIVIDUAL",
        name: room.title,
        participants: membersToParticipants(room.members),
        lastMessage: lastMsg,
        unreadCount: 0,
        isPinned: false,
        isMuted: false,
        messages: [],
    };
}

/** Map a ChatMessage from the API → frontend Message shape */
// Accept a flexible payload shape from both REST and realtime, where content may be null/undefined.
export function mapApiMessage(
    m: ChatMessage & Record<string, any>
): Message {

    const currentUserId = getDecodedUserId() ?? "";
    const rawSenderId = m.senderId ?? m.sender_id;
    const isMe = rawSenderId === currentUserId;

    const sender = m.sender ?? (m as any).sender;
    const resolvedName = sender
        ? `${sender.firstName ?? sender.first_name ?? ""} ${sender.lastName ?? sender.last_name ?? ""}`.trim()
        : undefined;

    const sentAt =
        m.sentAt ??
        m.sent_at ??
        m.createdAt ??
        m.created_at ??
        new Date().toISOString();

    const createdAtMs = new Date(sentAt).getTime();

    const replyToMsgObj = m.replyToMessage ?? m.reply_to_message;
    let mappedReply: Message | undefined = undefined;
    if (replyToMsgObj) {
        const replyUserId = replyToMsgObj.senderId ?? replyToMsgObj.sender_id;
        mappedReply = {
            id: replyToMsgObj.id,
            senderId: replyUserId === currentUserId ? "me" : replyUserId,
            text: replyToMsgObj.content ?? replyToMsgObj.text,
            fileName: replyToMsgObj.fileName ?? replyToMsgObj.file_name,
            timestamp: new Date(replyToMsgObj.sentAt ?? replyToMsgObj.sent_at ?? new Date()).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            createdAt: new Date(replyToMsgObj.sentAt ?? replyToMsgObj.sent_at ?? new Date()).getTime(),
            type: "text", // fallback
            status: "sent"
        };
    }

    return {
        id: m.id,
        senderId: isMe ? "me" : rawSenderId,
        senderName: isMe ? undefined : resolvedName || undefined,
        type: String(m.type ?? (m as any).type).toUpperCase() === "FILE" ? "document" : "text",
        text: (m.content ?? (m as any).content ?? undefined) ?? undefined,
        fileUrl: m.fileUrl ?? m.file_url ?? undefined,
        createdAt: createdAtMs, // ✅ ONLY STORE UTC
        timestamp: new Date(sentAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        status: (m.participantStates?.every((s: any) => s.status === "READ")
            ? "read"
            : m.participantStates?.some((s: any) => s.status === "DELIVERED")
                ? "delivered"
                : "sent") as "sent" | "delivered" | "read",
        replyToId: m.replyToMessageId ?? undefined,
        replyToMessageId: m.replyToMessageId ?? undefined,
        replyToMessage: mappedReply,
    };
}

/**
 * Build a participants array from the messages in a room (since
 * the client rooms endpoint doesn't return member info directly).
 */
export function extractParticipants(messages: (ChatMessage & { sender_id?: string; sender?: { firstName?: string; lastName?: string; first_name?: string; last_name?: string } })[]): User[] {
    const seen = new Map<string, User>();
    const currentUserId = getDecodedUserId() ?? "";

    messages.forEach((m) => {
        const senderId = m.senderId ?? (m as any).sender_id;
        if (!senderId || seen.has(senderId) || senderId === currentUserId) return;
        const sender = m.sender ?? (m as any).sender;
        const name = sender
            ? `${(sender as any).firstName ?? (sender as any).first_name ?? ""} ${(sender as any).lastName ?? (sender as any).last_name ?? ""}`.trim()
            : senderId;
        const rawRole: unknown =
            (sender as any)?.appRole ||
            (sender as any)?.user?.appRole ||
            "";
        const roleStr = typeof rawRole === "string" ? rawRole : "";
        const displayRole = roleStr.replace(/^ORG_/, "PARTNER_");
        seen.set(senderId, {
            id: senderId,
            name: name || senderId,
            role: displayRole,
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
    setRoomMessagesWithMerge: (roomId: string, apiMessages: Message[], participants?: User[]) => void;
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
                        (rawMsg: ChatMessage, eventType: 'INSERT' | 'UPDATE' | 'DELETE') => {
                            if (cancelled) return;
                            const msg = mapApiMessage(rawMsg);
                            const isActiveRoom = room.id === activeRoomIdRef.current;

                            setRooms((prev) =>
                                prev.map((r) => {
                                    if (r.id !== room.id) return r;

                                    let newMessages = r.messages;
                                    let unreadDelta = 0;

                                    // Realtime payloads don't include joined relations (e.g., sender: { firstName, lastName })
                                    // So we must manually resolve the senderName from the room's participants list
                                    const finalMsg = { ...msg };
                                    if (finalMsg.senderId !== 'me' && !finalMsg.senderName) {
                                        const participant = r.participants.find(p => p.id === finalMsg.senderId);
                                        if (participant) finalMsg.senderName = participant.name;
                                    }

                                    if (eventType === 'INSERT') {
                                        const existingIndex = r.messages.findIndex(m => m.id === finalMsg.id);

                                        // Try to match and replace an optimistic message (id starts with "optimistic-")
                                        let optimisticIndex = -1;
                                        if (finalMsg.senderId === 'me') {
                                            optimisticIndex = r.messages.findIndex(
                                                (m) =>
                                                    m.id.startsWith('optimistic-') &&
                                                    m.senderId === 'me' &&
                                                    (m.text || '') === (finalMsg.text || '')
                                            );
                                        }

                                        if (isActiveRoom) {
                                            // Ensure the new message sorts to the bottom
                                            const maxExisting = r.messages.length
                                                ? Math.max(...r.messages.map(m => m.createdAt ?? 0))
                                                : 0;
                                            const safeCreatedAt = Math.max(maxExisting + 1, finalMsg.createdAt ?? Date.now());
                                            const msgForSort = { ...finalMsg, createdAt: safeCreatedAt };

                                            if (msgForSort.replyToMessageId && !msgForSort.replyToMessage) {
                                                const original = r.messages.find(m => m.id === msgForSort.replyToMessageId);
                                                if (original) msgForSort.replyToMessage = original;
                                            }

                                            const merged = [...r.messages];
                                            if (optimisticIndex !== -1) {
                                                // Replace optimistic message with the canonical one
                                                merged[optimisticIndex] = msgForSort;
                                            } else if (existingIndex === -1) {
                                                merged.push(msgForSort);
                                            }

                                            merged.sort((a, b) => (a.createdAt ?? 0) - (b.createdAt ?? 0));
                                            newMessages = merged;
                                        } else {
                                            // Non‑active rooms: just append if it doesn't already exist
                                            if (existingIndex === -1) {
                                                newMessages = [...r.messages, finalMsg];
                                            } else {
                                                newMessages = r.messages;
                                            }
                                        }

                                        if (!isActiveRoom) unreadDelta = 1;
                                    } else if (eventType === 'UPDATE') {
                                        newMessages = r.messages.map(m => m.id === finalMsg.id ? finalMsg : m);
                                        newMessages.sort((a, b) => (a.createdAt ?? 0) - (b.createdAt ?? 0));
                                    } else if (eventType === 'DELETE') {
                                        newMessages = r.messages.map(m =>
                                            m.id === finalMsg.id ? { ...m, isDeleted: true, text: undefined, type: 'text' as const, reactions: {} } : m
                                        );
                                    }

                                    return {
                                        ...r,
                                        messages: newMessages,
                                        // Update last message preview if it's the one that was changed or it's a new message
                                        lastMessage: (eventType === 'INSERT' || r.lastMessage?.id === finalMsg.id) ? finalMsg : r.lastMessage,
                                        unreadCount: r.unreadCount + unreadDelta,
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

    /** Merge API messages with any Realtime messages that arrived during fetch (avoids overwriting them) */
    const setRoomMessagesWithMerge = useCallback(
        (roomId: string, apiMessages: Message[], participants?: User[]) => {
            setRooms((prev) =>
                prev.map((r) => {
                    if (r.id !== roomId) return r;
                    const apiIds = new Set(apiMessages.map((m) => m.id));
                    const fromRealtime = r.messages.filter((m) => !apiIds.has(m.id));
                    const merged = [...apiMessages, ...fromRealtime].sort(
                        (a, b) => (a.createdAt ?? 0) - (b.createdAt ?? 0)
                    );

                    const byId = new Map<string, Message>();
                    merged.forEach(m => byId.set(m.id, m));
                    const finalMerged = merged.map(m => {
                        if (m.replyToMessageId && !m.replyToMessage) {
                            const original = byId.get(m.replyToMessageId);
                            if (original) return { ...m, replyToMessage: original };
                        }
                        return m;
                    });

                    return { ...r, messages: finalMerged, participants: participants ?? r.participants };
                })
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
        setRoomMessagesWithMerge,
        appendMessage,
        setUnreadCount,
    };
}
