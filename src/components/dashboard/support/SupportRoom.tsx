"use client";

import React, { useState } from 'react';
import { ChatWindow } from '@/components/dashboard/messages/components/ChatWindow';
import { MediaPreviewModal } from '@/components/dashboard/messages/components/MediaPreviewModal';
import { MessageSearchPane } from '@/components/dashboard/messages/components/MessageSearchPane';
import { supportChat as initialSupportChat } from '@/components/dashboard/messages/mockData';
import type { Chat, Message } from '@/components/dashboard/messages/types';
import { cn } from '@/lib/utils';

const SupportRoom: React.FC = () => {
  const [chat, setChat] = useState<Chat>(initialSupportChat);
  const [previewMessage, setPreviewMessage] = useState<Message | null>(null);
  const [replyToMessage, setReplyToMessage] = useState<Message | null>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [scrollTargetId, setScrollTargetId] = useState<string | undefined>(undefined);

  const handleSearchMessageClick = (messageId: string) => {
    setScrollTargetId(messageId);
  };

  const handleSendMessage = (content: { 
    text?: string; 
    gifUrl?: string; 
    fileUrl?: string; 
    fileName?: string; 
    fileSize?: string;
    type: 'text' | 'gif' | 'image' | 'document' 
  }) => {
    if (editingMessage) {
      setChat(prevChat => ({
        ...prevChat,
        messages: prevChat.messages.map(m => 
          m.id === editingMessage.id 
            ? { ...m, text: content.text, isEdited: true }
            : m
        )
      }));
      setEditingMessage(null);
      return;
    }

    const newMessage: Message = {
      id: `s-${Date.now()}`,
      senderId: 'me',
      type: content.type,
      text: content.text,
      gifUrl: content.gifUrl,
      fileUrl: content.fileUrl,
      fileName: content.fileName,
      fileSize: content.fileSize,
      replyToId: replyToMessage?.id,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createdAt: Date.now(),
      status: 'sent',
    };

    setChat(prevChat => ({
      ...prevChat,
      messages: [...prevChat.messages, newMessage],
      lastMessage: newMessage,
    }));

    setReplyToMessage(null);
  };

  return (
    <div className="flex h-full bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 relative">
      <div className="flex-1 h-full min-w-0">
        <ChatWindow
          chat={chat}
          onSendMessage={handleSendMessage}
          onSearchToggle={() => setIsSearchOpen(prev => !prev)}
          onInfoToggle={() => {}}
          onMute={() => {}}
          onClearChat={() => {}}
          onSelectMessages={() => {}}
          onMediaClick={setPreviewMessage}
          scrollToMessageId={scrollTargetId}
          onScrollComplete={() => setScrollTargetId(undefined)}
          onReplyMessage={setReplyToMessage}
          onEditMessage={setEditingMessage}
          onDeleteMessage={() => {}}
          onReactToMessage={() => {}}
          onForwardMessage={() => {}}
          replyingTo={replyToMessage}
          editingMessage={editingMessage}
          onCancelReply={() => setReplyToMessage(null)}
          onCancelEdit={() => setEditingMessage(null)}
          isSelectMode={false}
          selectedMessageIds={[]}
          onSelectMessage={() => {}}
          onEnterSelectMode={() => {}}
          hideHeader={false} // We want the name "VACEI Support"
          hideSubtitle={true} // Hide "X members"
          hideAvatar={true} // Hide group icon
          hideSearch={false}
          hideMore={true}
          currentUserId={undefined}
        />
      </div>

      <div 
        className={cn(
          "h-full border-l border-gray-200 transition-all duration-300 ease-in-out overflow-hidden shrink-0",
          isSearchOpen ? "w-[400px]" : "w-0 border-transparent"
        )}
      >
        <div className="w-[400px] h-full">
          {isSearchOpen && (
            <MessageSearchPane
              messages={chat.messages}
              participants={chat.participants}
              onClose={() => setIsSearchOpen(false)}
              onMessageClick={handleSearchMessageClick}
            />
          )}
        </div>
      </div>

      {previewMessage && (
        <MediaPreviewModal 
          message={previewMessage} 
          onClose={() => setPreviewMessage(null)} 
        />
      )}
    </div>
  );
};

export default SupportRoom;
