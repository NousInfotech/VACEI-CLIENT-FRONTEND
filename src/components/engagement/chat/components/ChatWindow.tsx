import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import type { Chat, Message } from '../types';
import { ChatHeader } from './ChatHeader';
import { MessageItem } from './MessageItem';
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
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [highlightedId, setHighlightedId] = React.useState<string | null>(null);
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
          const isMe = currentUserId ? msg.senderId === currentUserId : msg.senderId === 'me';
          const sender = chat.participants.find(p => p.id === msg.senderId);
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
                message={msg}
                isMe={isMe}
                sender={sender}
                showSenderName={showSenderName}
                onMediaClick={onMediaClick}
              />
            </div>
          );
        })}
      </div>

      <MessageInput onSendMessage={onSendMessage} onFileUpload={onFileUpload} isUploading={isUploading} />
    </div>
  );
};
