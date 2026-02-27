import React, { useEffect, useLayoutEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import type { Chat, Message } from '../types';
import { ChatHeader } from './ChatHeader';
import { MessageItem } from './MessageItem';
import { MessageInput } from './MessageInput';

interface ChatWindowProps {
  chat: Chat;
  onSendMessage: (content: {
    text?: string;
    gifUrl?: string;
    fileUrl?: string;
    fileName?: string;
    fileSize?: string;
    type: 'text' | 'gif' | 'image' | 'document'
  }) => void;
  onSearchToggle: () => void;
  onInfoToggle: () => void;
  onMute: () => void;
  onClearChat: () => void;
  onSelectMessages: () => void;
  onMediaClick: (message: Message) => void;
  scrollToMessageId?: string;
  onScrollComplete?: () => void;
  onReplyMessage: (message: Message) => void;
  onEditMessage: (message: Message) => void;
  onDeleteMessage: (messageId: string) => void;
  onReactToMessage: (messageId: string, emoji: string) => void;
  onForwardMessage: (message: Message) => void;
  replyingTo: Message | null;
  editingMessage: Message | null;
  onCancelReply: () => void;
  onCancelEdit: () => void;
  isSelectMode: boolean;
  selectedMessageIds: string[];
  onSelectMessage: (messageId: string) => void;
  onEnterSelectMode: () => void;
  hideHeader?: boolean;
  hideSearch?: boolean;
  hideMore?: boolean;
  hideSubtitle?: boolean;
  hideAvatar?: boolean;
  /** Optional current user id; when provided we use it (and fall back to 'me') for alignment */
  currentUserId?: string | null;
}

/** Format date label for the divider chip */
function getDateLabel(date: Date): string {
  const today = new Date();
  const todayStr = today.toDateString();
  const yesterdayStr = new Date(today.getTime() - 86_400_000).toDateString();
  const dateStr = date.toDateString();

  if (dateStr === todayStr) return 'Today';
  if (dateStr === yesterdayStr) return 'Yesterday';
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
  });
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  chat,
  onSendMessage,
  onSearchToggle,
  onInfoToggle,
  onMute,
  onClearChat,
  onSelectMessages,
  onMediaClick,
  scrollToMessageId,
  onScrollComplete,
  onReplyMessage,
  onEditMessage,
  onDeleteMessage,
  onReactToMessage,
  onForwardMessage,
  replyingTo,
  editingMessage,
  onCancelReply,
  onCancelEdit,
  isSelectMode,
  selectedMessageIds,
  onSelectMessage,
  onEnterSelectMode,
  hideHeader = false,
  hideSearch = false,
  hideMore = false,
  hideSubtitle = false,
  hideAvatar = false,
  currentUserId,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [highlightedId, setHighlightedId] = React.useState<string | null>(null);
  const [activeOptionsId, setActiveOptionsId] = React.useState<string | null>(null);
  const lastMessagesLength = useRef(chat.messages.length);

  // Effect for search-triggered scroll
  useEffect(() => {
    if (scrollToMessageId) {
      const element = document.getElementById(`msg-${scrollToMessageId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setHighlightedId(scrollToMessageId);

        const timer = setTimeout(() => {
          setHighlightedId(null);
          onScrollComplete?.();
        }, 800);

        return () => clearTimeout(timer);
      }
    }
  }, [scrollToMessageId]);

  // Instant scroll to bottom on chat switch or initial load
  useLayoutEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chat.id]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (chat.messages.length > lastMessagesLength.current && !scrollToMessageId) {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }
    lastMessagesLength.current = chat.messages.length;
  }, [chat.messages, scrollToMessageId]);

  return (
    <div className="flex flex-col h-full bg-[#efeae2] relative overflow-hidden">
      {/* Background Pattern */}
      <div
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")',
          backgroundSize: '400px'
        }}
      />

      {!hideHeader && (
        <ChatHeader
          chat={chat}
          onSearchToggle={onSearchToggle}
          onInfoToggle={onInfoToggle}
          onMute={onMute}
          onClearChat={onClearChat}
          onSelectMessages={onSelectMessages}
          hideSearch={hideSearch}
          hideMore={hideMore}
          hideSubtitle={hideSubtitle}
          hideAvatar={hideAvatar}
        />
      )}

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-1 relative z-10 custom-scrollbar"
      >
        {/* ── Messages with dynamic date dividers ── */}
        {(() => {
          let lastDateStr = '';

          return chat.messages.map((msg) => {
            const isMe = currentUserId
              ? msg.senderId === currentUserId || msg.senderId === 'me'
              : msg.senderId === 'me';
            const sender = chat.participants.find(p => p.id === msg.senderId) ||
              (msg.senderName ? { id: msg.senderId, name: msg.senderName, role: 'PLATFORM_EMPLOYEE' as const, isOnline: false } : undefined);
            const showSenderName = !isMe; // Always show partner name for non-me messages

            // Date divider
            const msgDate = msg.createdAt ? new Date(msg.createdAt) : null;
            const dateStr = msgDate ? msgDate.toDateString() : '';
            const showDateDivider = Boolean(dateStr && dateStr !== lastDateStr);
            if (showDateDivider) lastDateStr = dateStr;

            return (
              <React.Fragment key={msg.id}>
                {showDateDivider && msgDate && (
                  <div className="flex justify-center py-2">
                    <span className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg text-[11px] font-medium text-gray-500 shadow-sm uppercase tracking-wider">
                      {getDateLabel(msgDate)}
                    </span>
                  </div>
                )}

                <div
                  id={`msg-${msg.id}`}
                  className={cn(
                    "transition-all duration-300 rounded-lg -mx-4 px-4",
                    highlightedId === msg.id && "bg-[#dfdfdf] z-20"
                  )}
                >
                  <MessageItem
                    message={msg}
                    isMe={isMe}
                    sender={sender}
                    showSenderName={showSenderName}
                    onMediaClick={onMediaClick}
                    onReply={() => onReplyMessage(msg)}
                    onEdit={() => onEditMessage(msg)}
                    onDelete={() => onDeleteMessage(msg.id)}
                    onReact={(emoji) => onReactToMessage(msg.id, emoji)}
                    onForward={() => onForwardMessage(msg)}
                    isSelectMode={isSelectMode}
                    isSelected={selectedMessageIds.includes(msg.id)}
                    onSelect={() => onSelectMessage(msg.id)}
                    onEnterSelectMode={onEnterSelectMode}
                    showOptions={activeOptionsId === msg.id}
                    onToggleOptions={(show) => setActiveOptionsId(show ? msg.id : null)}
                    onImageLoad={() => {
                      if (scrollRef.current) {
                        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
                      }
                    }}
                  />
                </div>
              </React.Fragment>
            );
          });
        })()}
      </div>

      <MessageInput
        onSendMessage={onSendMessage}
        replyingTo={replyingTo}
        editingMessage={editingMessage}
        onCancelReply={onCancelReply}
        onCancelEdit={onCancelEdit}
      />
    </div>
  );
};
