import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import type { Chat, Message } from '../types';
import { ChatHeader } from './ChatHeader';
import { MessageItem } from '@/components/dashboard/messages/components/MessageItem';
import { MessageInput } from './MessageInput';

interface ChatWindowProps {
  chat: Chat;
  currentUserId?: string | null;
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
  onMediaClick: (message: Message) => void;
  scrollToMessageId?: string;
  onScrollComplete?: () => void;
  onFileUpload?: (file: File) => Promise<string>;
  isUploading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  isLoadingMore?: boolean;
  onReplyMessage?: (message: Message) => void;
  replyingTo?: Message | null;
  onCancelReply?: () => void;
  onEditMessage?: (message: Message) => void;
  onDeleteMessage?: (messageId: string) => void;
  onReactToMessage?: (messageId: string, emoji: string) => void;
  onForwardMessage?: (message: Message) => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  chat,
  onSendMessage,
  onSearchToggle,
  onInfoToggle,
  onMediaClick,
  scrollToMessageId,
  onScrollComplete,
  onFileUpload,
  isUploading = false,
  currentUserId,
  hasMore,
  onLoadMore,
  isLoadingMore = false,
  onReplyMessage = () => { },
  replyingTo: replyingToProp,
  onCancelReply: onCancelReplyProp,
  onEditMessage = () => { },
  onDeleteMessage = () => { },
  onReactToMessage = () => { },
  onForwardMessage = () => { }
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [activeOptionsId, setActiveOptionsId] = useState<string | null>(null);
  const [internalReplyingTo, setInternalReplyingTo] = useState<Message | null>(null);
  const replyingTo = replyingToProp !== undefined ? replyingToProp : internalReplyingTo;
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const lastMessagesLength = useRef(chat.messages.length);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedMessageIds, setSelectedMessageIds] = useState<string[]>([]);

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
  }, [scrollToMessageId, onScrollComplete]);

  // Effect for new message scroll
  useEffect(() => {
    if (chat.messages.length > lastMessagesLength.current && !scrollToMessageId) {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }
    lastMessagesLength.current = chat.messages.length;
  }, [chat.messages, scrollToMessageId]);

  // Initial scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  const handleReply = (message: Message) => {
    if (replyingToProp === undefined) setInternalReplyingTo(message);
    setEditingMessage(null); // Cancel editing if replying
    onReplyMessage(message);
  };

  const handleEdit = (message: Message) => {
    setEditingMessage(message);
    if (replyingToProp !== undefined && onCancelReplyProp) onCancelReplyProp();
    else if (replyingToProp === undefined) setInternalReplyingTo(null);
    onEditMessage(message);
  };

  const handleCancelReply = () => {
    if (onCancelReplyProp) onCancelReplyProp();
    else setInternalReplyingTo(null);
  };

  const handleCancelEdit = () => {
    setEditingMessage(null);
  };

  const toggleSelectMessage = (messageId: string) => {
    setSelectedMessageIds(prev =>
      prev.includes(messageId) ? prev.filter(id => id !== messageId) : [...prev, messageId]
    );
  };

  const handleBulkCopy = () => {
    if (!selectedMessageIds.length) return;
    const selected = chat.messages.filter(m => selectedMessageIds.includes(m.id));
    if (!selected.length) return;
    const text = selected.map(m => m.text || '').join('\n');
    if (text) {
      navigator.clipboard.writeText(text);
    }
    setIsSelectMode(false);
    setSelectedMessageIds([]);
  };

  return (
    <div className="flex flex-col h-full bg-[#efeae2] relative overflow-hidden">
      {/* Background Pattern - WhatsApp style */}
      <div
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")',
          backgroundSize: '400px'
        }}
      />

      <ChatHeader
        chat={chat}
        onSearchToggle={onSearchToggle}
        onInfoToggle={onInfoToggle}
      />

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4 relative z-10 scroll-smooth custom-scrollbar"
      >
        <div className="flex flex-col items-center gap-3">
          {hasMore && onLoadMore && (
            <button
              onClick={onLoadMore}
              disabled={isLoadingMore}
              className="px-4 py-2 text-xs font-medium text-gray-600 bg-white/80 hover:bg-white rounded-lg border border-gray-200 shadow-sm transition-colors disabled:opacity-60"
            >
              {isLoadingMore ? "Loading..." : "Load Earlier Messages"}
            </button>
          )}
          <span className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg text-[11px] font-medium text-gray-500 shadow-sm uppercase tracking-wider">
            Today
          </span>
        </div>

        {chat.messages.map((msg) => {
          const isMe = msg.senderId === currentUserId;
          const sender = chat.participants.find(p => p.id === msg.senderId) as any;
          const showSenderName = chat.type === 'GROUP' && !isMe;

          return (
            <div
              key={msg.id}
              id={`msg-${msg.id}`}
              className={cn(
                "transition-all duration-300 rounded-lg -mx-4 px-4",
                highlightedId === msg.id && "bg-[#dfdfdf] z-20"
              )}
            >
              <MessageItem
                message={msg as any}
                isMe={isMe}
                sender={sender}
                showSenderName={showSenderName}
                onMediaClick={onMediaClick}
                showOptions={activeOptionsId === msg.id}
                onToggleOptions={(show) => setActiveOptionsId(show ? msg.id : null)}
                onReply={() => handleReply(msg)}
                onEdit={() => handleEdit(msg)}
                onDelete={() => onDeleteMessage(msg.id)}
                onReact={(emoji) => onReactToMessage(msg.id, emoji)}
                onForward={() => onForwardMessage(msg)}
                isSelectMode={isSelectMode}
                isSelected={selectedMessageIds.includes(msg.id)}
                onSelect={() => toggleSelectMessage(msg.id)}
                onEnterSelectMode={() => {
                  setIsSelectMode(true);
                  setSelectedMessageIds(prev =>
                    prev.length ? prev : [msg.id]
                  );
                }}
              />
            </div>
          );
        })}
      </div>

      {isSelectMode && (
        <div className="absolute bottom-0 left-0 right-0 bg-[#f0f2f5] border-t border-gray-200 z-50 flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setIsSelectMode(false);
                setSelectedMessageIds([]);
              }}
              className="p-2 hover:bg-gray-200 rounded-full transition-colors"
            >
              <span className="text-xs text-gray-500">✕</span>
            </button>
            <span className="font-semibold text-gray-700 text-sm">
              {selectedMessageIds.length} selected
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleBulkCopy}
              className="p-2 hover:bg-gray-200 rounded-full transition-colors flex flex-col items-center gap-1 group"
            >
              <span className="text-sm text-gray-700 group-hover:text-primary font-medium">
                Copy
              </span>
            </button>
          </div>
        </div>
      )}

      <MessageInput
        onSendMessage={onSendMessage}
        onFileUpload={onFileUpload}
        isUploading={isUploading}
        replyingTo={replyingTo}
        onCancelReply={handleCancelReply}
        currentUserId={currentUserId}
      />
    </div>
  );
};
