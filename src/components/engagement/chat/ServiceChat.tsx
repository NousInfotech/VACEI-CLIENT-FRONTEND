"use client"

import React, { useState, useMemo } from 'react';
import { Chat, Message } from './types';
import { getMockChatForService } from './mockChatData';
import { ChatWindow } from './components/ChatWindow';
import { MessageSearchPane } from './components/MessageSearchPane';
import { GroupInfoPane } from './components/GroupInfoPane';
import { MediaPreviewModal } from './components/MediaPreviewModal';
import { cn } from '@/lib/utils';

interface ServiceChatProps {
  serviceSlug: string;
  serviceName: string;
}

const ServiceChat: React.FC<ServiceChatProps> = ({ serviceSlug, serviceName }) => {
  const initialChat = useMemo(() => getMockChatForService(serviceSlug, serviceName), [serviceSlug, serviceName]);
  const [chat, setChat] = useState<Chat>(initialChat);
  const [showSearch, setShowSearch] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [previewMessage, setPreviewMessage] = useState<Message | null>(null);
  const [scrollToId, setScrollToId] = useState<string | undefined>(undefined);

  const handleSendMessage = (content: any) => {
    const newMessage: Message = {
      id: Math.random().toString(36).substr(2, 9),
      senderId: 'me',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent',
      ...content,
    };

    setChat(prev => ({
      ...prev,
      messages: [...prev.messages, newMessage],
      lastMessage: newMessage,
    }));
  };

  return (
    <div className="flex bg-white rounded-xl shadow-xl border border-[#e2e8f0]/30 h-[700px] overflow-hidden relative">
      <div className="flex-1 flex flex-col min-w-0 relative">
        <ChatWindow 
          chat={chat}
          onSendMessage={handleSendMessage}
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
        />
      </div>

      {/* Side Panes */}
      {showSearch && (
        <div className="w-[350px] shrink-0 h-full border-l border-gray-100 flex-col flex animate-in slide-in-from-right duration-300">
          <MessageSearchPane 
            messages={chat.messages}
            participants={chat.participants}
            onClose={() => setShowSearch(false)}
            onMessageClick={(id) => {
              setScrollToId(id);
              // In mobile view might need to close search, but here we keep it
            }}
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

      {/* Media Preview Modal */}
      {previewMessage && (
        <MediaPreviewModal 
          message={previewMessage}
          onClose={() => setPreviewMessage(null)}
        />
      )}
    </div>
  );
};

export default ServiceChat;
