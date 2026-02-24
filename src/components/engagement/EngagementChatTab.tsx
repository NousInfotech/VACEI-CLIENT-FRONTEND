"use client";

import React, { useEffect, useMemo } from "react";
import { useEngagement } from "./hooks/useEngagement";
import { useChat } from "@/hooks/useChat";
import { ChatWindow } from "./chat/components/ChatWindow";
import { MessageSearchPane } from "./chat/components/MessageSearchPane";
import { GroupInfoPane } from "./chat/components/GroupInfoPane";
import { MediaPreviewModal } from "./chat/components/MediaPreviewModal";
import { Skeleton } from "@/components/ui/skeleton";
import { getUserIdFromLocalStorage, getDecodedUserId } from "@/utils/authUtils";
import type { Chat, Message, User } from "./chat/types";

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function mapStatus(status?: string): "sent" | "delivered" | "read" {
  const s = (status ?? "").toUpperCase();
  if (s === "READ") return "read";
  if (s === "DELIVERED") return "delivered";
  return "sent";
}

export default function EngagementChatTab() {
  const { engagement, serviceSlug } = useEngagement();
  const engagementId = (engagement as { _id?: string; id?: string })?._id ?? (engagement as { _id?: string; id?: string })?.id ?? null;

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
    const participants: User[] = members.map((m: any) => ({
      id: m.userId,
      name: memberName(m),
      role: "CLIENT" as const,
      isOnline: m.isOnline,
      lastSeen: m.lastSeenAt ?? undefined,
    }));

    const messages: Message[] = apiMessages.map((m) => {
      const fileUrl = m.fileUrl ?? undefined;
      const fileName = fileUrl ? fileUrl.split("/").pop() ?? fileUrl.split("?")[0]?.split("/").pop() ?? "File" : undefined;
      const hasImageExt = (s: string) => /\.(jpe?g|png|gif|webp|bmp|svg)(\?|$|\s)/i.test(s);
      const isImage = fileUrl && (hasImageExt(fileUrl) || hasImageExt(m.content || ""));
      const displayType = fileUrl ? (isImage ? "image" : "document") : "text";
      return {
        id: m.id,
        senderId: m.senderId,
        type: displayType,
        text: m.content ?? undefined,
        fileUrl,
        fileName,
        timestamp: formatTime(m.sentAt),
        status: mapStatus(m.participantStates?.[0]?.status),
      };
    });

    return {
      id: roomId ?? engagementId ?? "chat",
      type: "GROUP" as const,
      name: "Engagement Chat",
      participants,
      messages,
      unreadCount: 0,
    };
  }, [apiMessages, members, engagementId, roomId]);

  const [showSearch, setShowSearch] = React.useState(false);
  const [showInfo, setShowInfo] = React.useState(false);
  const [previewMessage, setPreviewMessage] = React.useState<Message | null>(null);
  const [scrollToId, setScrollToId] = React.useState<string | undefined>();
  const [uploadProgress, setUploadProgress] = React.useState(0);

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
      if (content.type === "text" && content.text) {
        await sendMessage(content.text);
      } else if (content.type === "gif" && content.gifUrl) {
        await sendMessage(`[GIF]`, content.gifUrl);
      } else if ((content.type === "document" || content.type === "image") && content.fileUrl) {
        await sendMessage(`📎 ${content.fileName ?? "attachment"}`, content.fileUrl);
      } else if (content.fileUrl) {
        await sendMessage(`📎 ${content.fileName ?? "attachment"}`, content.fileUrl);
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
      <div className="flex flex-col h-[600px] bg-white rounded-xl border border-gray-200 p-6 gap-4">
        <Skeleton className="h-12 w-48" />
        <Skeleton className="flex-1 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  return (
    <div className="flex bg-white rounded-xl shadow-xl border border-[#e2e8f0]/30 h-[700px] overflow-hidden relative">
      <div className="flex-1 flex flex-col min-w-0 relative">
        <ChatWindow
          chat={chat}
          currentUserId={getDecodedUserId() ?? currentUserId}
          onSendMessage={handleSendMessage}
          onFileUpload={handleFileUpload}
          isUploading={uploadProgress > 0}
          hasMore={hasMore}
          onLoadMore={loadMore}
          isLoadingMore={isLoading}
          onSearchToggle={() => {
            setShowSearch(!showSearch);
            if (showInfo) setShowInfo(false);
          }}
          onInfoToggle={() => {
            setShowInfo(!showInfo);
            if (showSearch) setShowSearch(false);
          }}
          onMediaClick={(msg) => setPreviewMessage(msg)}
          scrollToMessageId={scrollToId}
          onScrollComplete={() => setScrollToId(undefined)}
          onReplyMessage={(msg) => console.log('Reply to', msg)} // Will handle via ChatWindow state and MessageInput
          onEditMessage={(msg) => console.log('Edit message', msg)} // Will handle via ChatWindow state and MessageInput
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
              const { chatService } = await import('@/api/chatService');
              await chatService.addReaction(msgId, emoji);
            } catch (err) {
              console.error("Failed to add reaction:", err);
            }
          }}
          onForwardMessage={(msg) => console.log('Forward message', msg)}
        />
      </div>

      {showSearch && (
        <div className="w-[350px] shrink-0 h-full border-l border-gray-100 flex flex-col animate-in slide-in-from-right duration-300">
          <MessageSearchPane
            messages={chat.messages}
            participants={chat.participants}
            onClose={() => setShowSearch(false)}
            onMessageClick={(id) => setScrollToId(id)}
          />
        </div>
      )}

      {showInfo && (
        <GroupInfoPane
          name={chat.name}
          type={chat.type}
          participants={chat.participants}
          onClose={() => setShowInfo(false)}
        />
      )}

      {previewMessage && (
        <MediaPreviewModal
          message={previewMessage}
          onClose={() => setPreviewMessage(null)}
        />
      )}

      {uploadProgress > 0 && (
        <div className="absolute bottom-20 left-6 right-6 max-w-sm p-3 bg-white rounded-lg shadow-lg border border-gray-200">
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
