"use client";

import React, { useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useEngagement } from "./hooks/useEngagement";
import { useChat } from "@/hooks/useChat";
import { ChatWindow } from "@/components/dashboard/messages/components/ChatWindow";
import { MessageSearchPane } from "@/components/dashboard/messages/components/MessageSearchPane";
import { GroupInfoPane } from "@/components/dashboard/messages/components/GroupInfoPane";
import { MediaPreviewModal } from "@/components/dashboard/messages/components/MediaPreviewModal";
import { mapApiMessage } from "@/hooks/useChatRooms";
import { Skeleton } from "@/components/ui/skeleton";
import { getUserIdFromLocalStorage, getDecodedUserId } from "@/utils/authUtils";
import type { Chat, Message, User } from "./chat/types";
import { chatService } from "@/api/chatService";
import { cn } from "@/lib/utils";

/** 
 * No longer need local formatTime as mapApiMessage handles it.
 * Keeping mapStatus for sendMessage fallback if needed, though useChat handles most.
 */
function mapStatus(status?: string): "sent" | "delivered" | "read" {
  const s = (status ?? "").toUpperCase();
  if (s === "READ") return "read";
  if (s === "DELIVERED") return "delivered";
  return "sent";
}

export default function EngagementChatTab() {
  const { engagement, serviceSlug } = useEngagement();
  const engagementId = (engagement as { _id?: string; id?: string })?._id ?? (engagement as { _id?: string; id?: string })?.id ?? null;

  const searchParams = useSearchParams();

  const currentUserId = getUserIdFromLocalStorage();
  const orgTeam = (engagement as { orgTeam?: Array<{ userId: string }> })?.orgTeam;
  const partnerId = orgTeam?.find((m) => m.userId !== currentUserId)?.userId ?? null;

  const {
    messages: apiMessages,
    members,
    isLoading,
    hasMore,
    loadMore,
    sendMessage,
    markAsRead,
    uploadFile,
    roomError,
    roomId,
    deleteMessage,
  } = useChat(engagementId, { partnerId });

  const chat: Chat = useMemo(() => {
    const memberName = (m: any) => {
      const first = m.firstName ?? m.first_name ?? m.user?.firstName ?? m.user?.first_name ?? "";
      const last = m.lastName ?? m.last_name ?? m.user?.lastName ?? m.user?.last_name ?? "";
      return [first, last].filter(Boolean).join(" ").trim() || "Unknown";
    };
    const participants: User[] = members.map((m: any) => {
      const appRole =
        (m as any).appRole ||
        (m as any).user?.appRole ||
        (m as any).role ||
        "";
      return {
        id: m.userId,
        name: memberName(m),
        role: (appRole || "CLIENT") as any,
        isOnline: m.isOnline,
        lastSeen: m.lastSeenAt ?? undefined,
      };
    });

    // Use the central mapApiMessage for consistent formatting (timestamps, types, etc)
    const baseMessages: Message[] = apiMessages.map((msg: any) => {
      const mapped = mapApiMessage(msg);
      
      // Realtime/API payloads might not have resolved senderName. 
      // Resolve it from our participants list for display consistency.
      if (mapped.senderId !== 'me' && !mapped.senderName) {
        const p = participants.find(p => p.id === mapped.senderId);
        if (p) mapped.senderName = p.name;
      }

      return mapped as Message;
    });

    // Second pass: resolve replyToMessage so the UI can show quoted preview like global chat
    const byId = new Map<string, Message>();
    baseMessages.forEach((msg) => {
      byId.set(msg.id, msg);
    });
    baseMessages.forEach((msg) => {
      if (msg.replyToMessageId) {
        msg.replyToMessage = byId.get(msg.replyToMessageId) ?? null;
      }
    });

    // Ensure messages are always ordered strictly by time (oldest → newest)
    baseMessages.sort((a, b) => (a.createdAt ?? 0) - (b.createdAt ?? 0));

    return {
      id: roomId ?? engagementId ?? "chat",
      type: "GROUP" as const,
      name: engagement?.title || "Engagement Chat",
      participants,
      messages: baseMessages,
      unreadCount: 0,
    };
  }, [apiMessages, members, engagementId, roomId]);

  const [rightPaneMode, setRightPaneMode] = React.useState<'search' | 'info' | null>(null);
  const [previewMessage, setPreviewMessage] = React.useState<Message | null>(null);
  const [scrollToId, setScrollToId] = React.useState<string | undefined>();
  const [uploadProgress, setUploadProgress] = React.useState(0);
  const [replyingTo, setReplyingTo] = React.useState<Message | null>(null);
  const [editingMessage, setEditingMessage] = React.useState<Message | null>(null);
  const [isSelectMode, setIsSelectMode] = React.useState(false);
  const [selectedMessageIds, setSelectedMessageIds] = React.useState<string[]>([]);

  // When opening from todo-list "Reply": scroll to message and open reply UI
  useEffect(() => {
    const messageId = searchParams.get("messageId");
    if (!messageId) return;
    setScrollToId(messageId);
    const msg = chat.messages.find((m) => m.id === messageId);
    if (msg) {
      setReplyingTo(msg);
    }
  }, [searchParams, chat.messages]);

  useEffect(() => {
    if (roomId) markAsRead();
  }, [roomId, markAsRead]);

  const handleSendMessage = async (content: {
    text?: string;
    gifUrl?: string;
    fileUrl?: string;
    fileName?: string;
    fileSize?: string;
    type: "text" | "gif" | "image" | "document";
  }) => {
    if (!roomId) return;

    try {
      const replyToIdForSend =
        replyingTo?.id &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(replyingTo.id)
          ? replyingTo.id
          : null;

      if (content.type === "text" && content.text) {
        await sendMessage(content.text, undefined, replyToIdForSend);
      } else if (content.type === "gif" && content.gifUrl) {
        await sendMessage(`[GIF]`, content.gifUrl, replyToIdForSend);
      } else if ((content.type === "document" || content.type === "image") && content.fileUrl) {
        await sendMessage(`📎 ${content.fileName ?? "attachment"}`, content.fileUrl, replyToIdForSend);
      } else if (content.fileUrl) {
        await sendMessage(`📎 ${content.fileName ?? "attachment"}`, content.fileUrl, replyToIdForSend);
      }

      if (replyingTo) {
        setReplyingTo(null);
      }
    } catch (err) {
      console.error("Send failed:", err);
    }
  };

  const handleFileUpload = async (file: File): Promise<string> => {
    setUploadProgress(10);
    try {
      const fileUrl = await uploadFile(file);
      setUploadProgress(100);
      setTimeout(() => setUploadProgress(0), 500);
      return fileUrl;
    } catch (err) {
      setUploadProgress(0);
      throw err;
    }
  };

  if (!engagementId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-muted-foreground">
        <p>No engagement selected. Chat is available within an engagement.</p>
      </div>
    );
  }

  if (roomError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-muted-foreground">
        <p className="text-sm">{roomError}</p>
        <p className="text-xs mt-2">Chat room may not exist for this engagement yet.</p>
      </div>
    );
  }

  if (!roomId || (isLoading && chat.messages.length === 0)) {
    return (
      <div className="flex flex-col h-[calc(100vh-350px)] min-h-[500px] bg-white rounded-xl border border-gray-200 p-6 gap-4">
        <Skeleton className="h-12 w-48" />
        <Skeleton className="flex-1 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  return (
    <div className="flex bg-white rounded-xl shadow-xl border border-[#e2e8f0]/30 h-[calc(100vh-350px)] min-h-[500px] overflow-hidden relative">
      <div className="flex-1 flex flex-col min-w-0 relative">
        <ChatWindow
          chat={chat}
          onSendMessage={handleSendMessage}
          onSearchToggle={() => setRightPaneMode(prev => prev === 'search' ? null : 'search')}
          onInfoToggle={() => setRightPaneMode(prev => prev === 'info' ? null : 'info')}
          onMute={() => {
            if (roomId) chatService.updateRoomMute(roomId, true).catch(console.error);
          }}
          onClearChat={async () => {
            if (roomId && window.confirm("Clear all messages?")) {
              await chatService.clearRoom(roomId).catch(console.error);
            }
          }}
          onSelectMessages={() => setIsSelectMode(true)}
          onMediaClick={(msg: any) => setPreviewMessage(msg)}
          scrollToMessageId={scrollToId}
          onScrollComplete={() => setScrollToId(undefined)}
          onReplyMessage={setReplyingTo}
          onEditMessage={setEditingMessage}
          onDeleteMessage={async (msgId) => {
            if (window.confirm("Are you sure you want to delete this message?")) {
              try {
                await deleteMessage(msgId);
              } catch (err) {
                console.error("Failed to delete message:", err);
              }
            }
          }}
          onReactToMessage={async (msgId, emoji) => {
            try {
              await chatService.addReaction(msgId, emoji);
            } catch (err) {
              console.error("Failed to add reaction:", err);
            }
          }}
          onForwardMessage={(msg) => console.log('Forward message', msg)}
          replyingTo={replyingTo}
          editingMessage={editingMessage}
          onCancelReply={() => setReplyingTo(null)}
          onCancelEdit={() => setEditingMessage(null)}
          isSelectMode={isSelectMode}
          selectedMessageIds={selectedMessageIds}
          onSelectMessage={(id) => setSelectedMessageIds(prev => 
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
          )}
          onEnterSelectMode={() => setIsSelectMode(true)}
        />
      </div>

      {/* Side Panes (unified with global layout) */}
      <div className={cn(
        'h-full border-l border-gray-100 transition-all duration-300 ease-in-out overflow-hidden shrink-0',
        rightPaneMode ? 'w-[350px]' : 'w-0 border-transparent'
      )}>
        <div className="w-[350px] h-full">
          {rightPaneMode === 'search' ? (
            <MessageSearchPane
              messages={chat.messages}
              participants={chat.participants}
              onClose={() => setRightPaneMode(null)}
              onMessageClick={(id) => setScrollToId(id)}
            />
          ) : (
            <GroupInfoPane
              name={chat.name}
              type={chat.type}
              participants={chat.participants}
              onClose={() => setRightPaneMode(null)}
            />
          )}
        </div>
      </div>

      {/* Bulk select toolbar */}
      {isSelectMode && (
        <div className="absolute bottom-0 left-0 right-0 bg-[#f0f2f5] border-t border-gray-200 z-50 flex items-center justify-between px-6 py-4 animate-in slide-in-from-bottom duration-200">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setIsSelectMode(false);
                setSelectedMessageIds([]);
              }}
              className="p-2 hover:bg-gray-200 rounded-full transition-colors"
            >
              <span className="text-gray-500 font-bold">✕</span>
            </button>
            <span className="font-semibold text-gray-700">
              {selectedMessageIds.length} selected
            </span>
          </div>
          <div className="flex items-center gap-6">
            <button
              onClick={() => {
                const text = chat.messages
                  .filter(m => selectedMessageIds.includes(m.id))
                  .map(m => m.text || '')
                  .join('\n');
                navigator.clipboard.writeText(text);
                setIsSelectMode(false);
                setSelectedMessageIds([]);
              }}
              className="p-2 hover:bg-gray-200 rounded-full transition-colors flex flex-col items-center gap-1 group"
            >
              <span className="text-xs text-gray-600 group-hover:text-primary font-medium">Copy</span>
            </button>
          </div>
        </div>
      )}

      {previewMessage && (
        <MediaPreviewModal
          message={previewMessage}
          onClose={() => setPreviewMessage(null)}
        />
      )}

      {uploadProgress > 0 && (
        <div className="absolute bottom-20 left-6 right-6 max-w-sm p-3 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className="text-xs text-gray-600">Uploading...</p>
        </div>
      )}
    </div>
  );
}
