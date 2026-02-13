'use client';

import { useState, useRef, useEffect } from 'react';
import { Message01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { X, Maximize2, Minimize2, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ChatList } from './dashboard/messages/components/ChatList';
import { ChatWindow } from './dashboard/messages/components/ChatWindow';
import { MediaPreviewModal } from './dashboard/messages/components/MediaPreviewModal';
import { ConfirmModal } from './dashboard/messages/components/ConfirmModal';
import { mockChats, users as mockUsers } from './dashboard/messages/mockData';
import type { Chat, Message } from './dashboard/messages/types';

interface ChatModuleProps {
    isEmbedded?: boolean;
}

export default function ChatModule({ isEmbedded = false }: ChatModuleProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isMaximized, setIsMaximized] = useState(false);
    const [showSidebar, setShowSidebar] = useState(true);
    const [chats, setChats] = useState<Chat[]>(mockChats);
    const [activeChatId, setActiveChatId] = useState<string | undefined>(mockChats[0]?.id);
    const [searchQuery, setSearchQuery] = useState('');
    const [previewMessage, setPreviewMessage] = useState<Message | null>(null);
    const [replyToMessage, setReplyToMessage] = useState<Message | null>(null);
    const [editingMessage, setEditingMessage] = useState<Message | null>(null);
    const [isSelectMode, setIsSelectMode] = useState(false);
    const [selectedMessageIds, setSelectedMessageIds] = useState<string[]>([]);
    const [confirmState, setConfirmState] = useState<{ 
        isOpen: boolean; 
        type: 'message' | 'clear-chat'; 
        messageId?: string; 
    }>({ isOpen: false, type: 'message' });

    const activeChat = chats.find(c => c.id === activeChatId);

    const handleSendMessage = (content: { 
        text?: string; 
        gifUrl?: string; 
        fileUrl?: string; 
        fileName?: string; 
        fileSize?: string;
        type: 'text' | 'gif' | 'image' | 'document' 
    }) => {
        if (!activeChatId) return;

        const newMessage: Message = {
            id: `m-${Date.now()}`,
            senderId: 'me',
            type: content.type,
            text: content.text,
            gifUrl: content.gifUrl,
            fileUrl: content.fileUrl,
            fileName: content.fileName,
            fileSize: content.fileSize,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            createdAt: Date.now(),
            status: 'sent',
        };

        setChats(prev => prev.map(chat => 
            chat.id === activeChatId 
                ? { ...chat, messages: [...chat.messages, newMessage], lastMessage: newMessage }
                : chat
        ));
        setReplyToMessage(null);
    };

    const handleToggleMute = (chatId: string) => {
        setChats(prev => prev.map(chat => 
            chat.id === chatId ? { ...chat, isMuted: !chat.isMuted } : chat
        ));
    };

    const handleClearChat = () => {
        if (!activeChatId) return;
        setChats(prev => prev.map(chat => 
            chat.id === activeChatId ? { ...chat, messages: [] } : chat
        ));
    };

    const handleBackToSidebar = () => {
        setShowSidebar(true);
    };

    const handleSelectChat = (chat: Chat) => {
        setActiveChatId(chat.id);
        if (!isMaximized) {
            setShowSidebar(false);
        }
    };

    if (isEmbedded) {
        return (
            <div className="w-full h-full bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 flex transition-all duration-300">
                <div className="w-80 border-r border-gray-100 shrink-0">
                    <ChatList
                        chats={chats}
                        activeChatId={activeChatId}
                        onSelectChat={handleSelectChat}
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        onCreateGroup={() => {}}
                        onTogglePin={() => {}}
                        onToggleMute={handleToggleMute}
                        hideCreateGroup={true}
                    />
                </div>
                <div className="flex-1 min-w-0">
                    {activeChat ? (
                        <ChatWindow
                            chat={activeChat}
                            onSendMessage={handleSendMessage}
                            onSearchToggle={() => {}}
                            onInfoToggle={() => {}}
                            onMute={() => handleToggleMute(activeChat.id)}
                            onClearChat={handleClearChat}
                            onSelectMessages={() => setIsSelectMode(true)}
                            onMediaClick={setPreviewMessage}
                            onReplyMessage={setReplyToMessage}
                            onEditMessage={setEditingMessage}
                            onDeleteMessage={() => {}}
                            onReactToMessage={() => {}}
                            onForwardMessage={() => {}}
                            replyingTo={replyToMessage}
                            editingMessage={editingMessage}
                            onCancelReply={() => setReplyToMessage(null)}
                            onCancelEdit={() => setEditingMessage(null)}
                            isSelectMode={isSelectMode}
                            selectedMessageIds={selectedMessageIds}
                            onSelectMessage={() => {}}
                            onEnterSelectMode={() => setIsSelectMode(true)}
                            hideSearch={true}
                            hideMore={true}
                        />
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center bg-[#f0f2f5] text-gray-500">
                            <p>Select a chat to start messaging</p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className={cn(
                    "fixed bottom-6 right-6 w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center shadow-lg z-50 transition-all duration-300 hover:scale-110",
                    isOpen ? "scale-0 opacity-0 pointer-events-none" : "scale-100 opacity-100"
                )}
            >
                <HugeiconsIcon icon={Message01Icon} className="h-7 w-7" />
            </button>

            <div
                className={cn(
                    "fixed z-50 bg-white shadow-2xl transition-all duration-500 ease-in-out flex flex-col overflow-hidden origin-bottom-right",
                    !isOpen && "scale-95 opacity-0 pointer-events-none",
                    isOpen && "scale-100 opacity-100",
                    isMaximized 
                        ? "bottom-6 right-6 w-[calc(100%-3rem)] h-[calc(100%-3rem)] rounded-2xl" 
                        : "bottom-6 right-6 w-[360px] h-[550px] rounded-xl border border-gray-200"
                )}
            >
                {/* Header - Combined logic */}
                <div className="p-4 border-b border-border flex justify-between items-center bg-white shrink-0 h-16">
                    <div className="flex items-center gap-3 min-w-0">
                        {!showSidebar && !isMaximized && (
                            <button 
                                onClick={handleBackToSidebar}
                                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <ChevronLeft className="w-5 h-5 text-gray-500" />
                            </button>
                        )}
                        <h2 className="font-semibold text-lg text-primary truncate">
                            {showSidebar && !isMaximized 
                                ? 'Messages' 
                                : activeChat 
                                    ? activeChat.name 
                                    : 'Chat'}
                        </h2>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 ml-2">
                        <button
                            onClick={() => {
                                setIsMaximized(!isMaximized);
                                if (!isMaximized) setShowSidebar(true);
                            }}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-muted-foreground"
                            aria-label={isMaximized ? "Restore window" : "Maximize window"}
                        >
                            {isMaximized ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                        </button>
                        <button
                            onClick={() => {
                                setIsOpen(false);
                                setIsMaximized(false);
                                setShowSidebar(true);
                            }}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-muted-foreground"
                            aria-label="Close chat"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 flex overflow-hidden relative">
                    {/* Sidebar */}
                    <div className={cn(
                        "border-r border-gray-100 flex flex-col shrink-0 transition-all duration-300 ease-in-out bg-white",
                        isMaximized 
                            ? "w-80 opacity-100" 
                            : showSidebar 
                                ? "w-full opacity-100" 
                                : "w-0 opacity-0 overflow-hidden text-transparent"
                    )}>
                        <ChatList
                            chats={chats}
                            activeChatId={activeChatId}
                            onSelectChat={handleSelectChat}
                            searchQuery={searchQuery}
                            onSearchChange={setSearchQuery}
                            onCreateGroup={() => {}}
                            onTogglePin={() => {}}
                            onToggleMute={handleToggleMute}
                            hideCreateGroup={true}
                            hideHeader={true}
                        />
                    </div>

                    {/* Chat Window Container */}
                    <div className={cn(
                        "flex-1 min-w-0 bg-[#efeae2] relative transition-all duration-300 ease-in-out flex flex-col",
                        !isMaximized && showSidebar ? "opacity-0 invisible absolute inset-0 translate-x-10" : "opacity-100 visible relative translate-x-0"
                    )}>
                        {activeChat ? (
                            <ChatWindow
                                chat={activeChat}
                                onSendMessage={handleSendMessage}
                                onSearchToggle={() => {}}
                                onInfoToggle={() => {}}
                                onMute={() => handleToggleMute(activeChat.id)}
                                onClearChat={handleClearChat}
                                onSelectMessages={() => setIsSelectMode(true)}
                                onMediaClick={setPreviewMessage}
                                onReplyMessage={setReplyToMessage}
                                onEditMessage={setEditingMessage}
                                onDeleteMessage={() => {}}
                                onReactToMessage={() => {}}
                                onForwardMessage={() => {}}
                                replyingTo={replyToMessage}
                                editingMessage={editingMessage}
                                onCancelReply={() => setReplyToMessage(null)}
                                onCancelEdit={() => setEditingMessage(null)}
                                isSelectMode={isSelectMode}
                                selectedMessageIds={selectedMessageIds}
                                onSelectMessage={() => {}}
                                onEnterSelectMode={() => setIsSelectMode(true)}
                                hideHeader={true}
                            />
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                                Select a user to chat
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {previewMessage && (
                <MediaPreviewModal 
                    message={previewMessage} 
                    onClose={() => setPreviewMessage(null)} 
                />
            )}

            <ConfirmModal 
                isOpen={confirmState.isOpen}
                title={confirmState.type === 'clear-chat' ? "Clear chat?" : "Delete message?"}
                message="Are you sure? This action cannot be undone."
                confirmLabel="Delete"
                cancelLabel="Cancel"
                variant="danger"
                onConfirm={() => {}}
                onCancel={() => setConfirmState({ isOpen: false, type: 'message' })}
            />
        </>
    );
}
