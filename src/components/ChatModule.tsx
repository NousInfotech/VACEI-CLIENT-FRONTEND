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
import { useChatRooms, mapApiMessage, extractParticipants } from '@/hooks/useChatRooms';
import { chatService } from '@/api/chatService';
import type { Chat, Message, User } from './dashboard/messages/types';

interface ChatModuleProps {
    isEmbedded?: boolean;
}

export default function ChatModule({ isEmbedded = false }: ChatModuleProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isMaximized, setIsMaximized] = useState(false);
    const [showSidebar, setShowSidebar] = useState(true);
    const [activeChatId, setActiveChatId] = useState<string | undefined>(undefined);

    const {
        rooms: chats,
        setRoomMessages,
        setRoomMessagesWithMerge,
        appendMessage,
        setUnreadCount,
    } = useChatRooms(activeChatId);

    const [messagesLoading, setMessagesLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [previewMessage, setPreviewMessage] = useState<Message | null>(null);
    const [forwardingMessages, setForwardingMessages] = useState<Message[]>([]);
    const [selectedForwardChatIds, setSelectedForwardChatIds] = useState<string[]>([]);
    const [replyToMessage, setReplyToMessage] = useState<Message | null>(null);
    const [editingMessage, setEditingMessage] = useState<Message | null>(null);
    const [isSelectMode, setIsSelectMode] = useState(false);
    const [selectedMessageIds, setSelectedMessageIds] = useState<string[]>([]);
    const [confirmState, setConfirmState] = useState<{
        isOpen: boolean;
        type: 'message' | 'clear-chat';
        messageId?: string;
    }>({ isOpen: false, type: 'message' });

    // Auto-select first chat if embedded
    useEffect(() => {
        if (isEmbedded && !activeChatId && chats.length > 0) {
            setActiveChatId(chats[0].id);
        }
    }, [chats, activeChatId, isEmbedded]);

    // Fetch messages for the active chat
    useEffect(() => {
        if (!activeChatId) return;

        // Immediately clear the unread badge for this room
        setUnreadCount(activeChatId, 0);

        setMessagesLoading(true);
        chatService
            .getClientRoomMessages(activeChatId, 50)
            .then((res) => {
                const rawMsgs = (res.data ?? []).reverse();
                const apiMsgs = rawMsgs.map(mapApiMessage).sort((a, b) => (a.createdAt ?? 0) - (b.createdAt ?? 0));

                const fromMessages = extractParticipants(res.data ?? []);
                const room = chats.find((r) => r.id === activeChatId);
                const mergedParticipants = new Map<string, User>();
                const mergeUser = (u: User) => {
                    const existing = mergedParticipants.get(u.id);
                    const incomingRole = u.role ?? 'PLATFORM_EMPLOYEE';
                    const finalRole =
                        existing?.role === 'PLATFORM_ADMIN' ? 'PLATFORM_ADMIN' : incomingRole;
                    mergedParticipants.set(u.id, {
                        ...(existing ?? u),
                        ...u,
                        role: finalRole,
                        isOnline: u.isOnline ?? existing?.isOnline ?? false,
                    });
                };

                (room?.participants ?? []).forEach(mergeUser);
                fromMessages.forEach(mergeUser);
                const participants = Array.from(mergedParticipants.values());

                setRoomMessagesWithMerge(activeChatId, apiMsgs, participants);
            })
            .catch(console.error)
            .finally(() => setMessagesLoading(false));

        chatService.markRoomAsRead(activeChatId).catch(console.error);
    }, [activeChatId, setRoomMessagesWithMerge, setUnreadCount]);

    const activeChat = chats.find(c => c.id === activeChatId);


    const handleSendMessage = async (content: {
        text?: string;
        gifUrl?: string;
        fileUrl?: string;
        fileName?: string;
        fileSize?: string;
        type: 'text' | 'gif' | 'image' | 'document'
    }) => {
        if (!activeChatId) return;

        if (editingMessage) {
            const text = content.text || '';
            const activeRoom = chats.find(r => r.id === activeChatId);
            if (activeRoom) {
                const updated = activeRoom.messages.map(m => m.id === editingMessage.id ? { ...m, text, isEdited: true } : m);
                setRoomMessages(activeChatId, updated);
            }
            chatService.editMessage(editingMessage.id, text).catch(console.error);
            setEditingMessage(null);
            return;
        }

        const optimisticId = `optimistic-${Date.now()}`;
        const newMessage: Message = {
            id: optimisticId,
            senderId: 'me',
            type: content.type,
            text: content.text,
            gifUrl: content.gifUrl,
            fileUrl: content.fileUrl,
            fileName: content.fileName,
            fileSize: content.fileSize,
            replyToId: replyToMessage?.id,
            timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            createdAt: Date.now(),
            status: 'sent',
        };

        appendMessage(activeChatId, newMessage);
        setReplyToMessage(null);

        try {
            let mediaUrl = content.fileUrl;
            const sent = await chatService.sendMessage(activeChatId, content.text || '', mediaUrl);
            if (sent) {
                const activeRoom = chats.find(r => r.id === activeChatId);
                if (activeRoom) {
                    const updated = activeRoom.messages.map(m => m.id === optimisticId ? mapApiMessage(sent) : m);
                    setRoomMessages(activeChatId, updated);
                }
            }
        } catch (err) {
            console.error('Failed to send message:', err);
        }
    };

    const handleToggleMute = (chatId: string) => {
        // Mock UI state for mute
    };

    const handleClearChat = () => {
        // Soft clear
    };

    const handleReactToMessage = (messageId: string, emoji: string) => {
        if (!activeChatId) return;
        const room = chats.find(r => r.id === activeChatId);
        if (!room) return;

        const updated = room.messages.map(m => {
            if (m.id !== messageId) return m;
            const reactions = { ...(m.reactions || {}) };
            const alreadyHas = (reactions[emoji] || []).includes('me');
            Object.keys(reactions).forEach(key => {
                reactions[key] = reactions[key].filter(id => id !== 'me');
                if (reactions[key].length === 0) delete reactions[key];
            });
            if (!alreadyHas) reactions[emoji] = [...(reactions[emoji] || []), 'me'];
            return { ...m, reactions };
        });
        setRoomMessages(activeChatId, updated);
        chatService.addReaction(messageId, emoji).catch(console.error);
    };

    const handleDeleteMessage = async (messageId?: string) => {
        const idsToDelete = confirmState.type === 'message' && messageId ? [messageId] : selectedMessageIds;
        await Promise.allSettled(idsToDelete.map(id => chatService.deleteMessage(id)));

        if (activeChatId) {
            const room = chats.find(r => r.id === activeChatId);
            if (room) {
                const updated = room.messages.map(m =>
                    idsToDelete.includes(m.id) ? { ...m, isDeleted: true, text: undefined, type: 'text' as const, reactions: {} } : m
                );
                setRoomMessages(activeChatId, updated);
            }
        }
        setIsSelectMode(false);
        setSelectedMessageIds([]);
        setConfirmState({ isOpen: false, type: 'message' });
    };

    const handleForwardMessages = () => {
        if (forwardingMessages.length === 0 || selectedForwardChatIds.length === 0) return;
        selectedForwardChatIds.forEach(targetRoomId => {
            forwardingMessages.forEach(async msg => {
                const text = msg.text || '';
                if (text) {
                    try {
                        const sent = await chatService.sendMessage(targetRoomId, text);
                        if (sent) appendMessage(targetRoomId, mapApiMessage(sent));
                    } catch (err) { console.error('Forward failed:', err); }
                }
            });
        });
        setForwardingMessages([]);
        setSelectedForwardChatIds([]);
        setIsSelectMode(false);
        setSelectedMessageIds([]);
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
                        onCreateGroup={() => { }}
                        onTogglePin={() => { }}
                        onToggleMute={handleToggleMute}
                        hideCreateGroup={true}
                    />
                </div>
                <div className="flex-1 min-w-0">
                    {activeChat ? (
                        <ChatWindow
                            chat={activeChat}
                            onSendMessage={handleSendMessage}
                            onSearchToggle={() => { }}
                            onInfoToggle={() => { }}
                            onMute={() => handleToggleMute(activeChat.id)}
                            onClearChat={handleClearChat}
                            onSelectMessages={() => setIsSelectMode(true)}
                            onMediaClick={setPreviewMessage}
                            onReplyMessage={setReplyToMessage}
                            onEditMessage={setEditingMessage}
                            onDeleteMessage={(id) => setConfirmState({ isOpen: true, type: 'message', messageId: id })}
                            onReactToMessage={handleReactToMessage}
                            onForwardMessage={() => setForwardingMessages(activeChat.messages.filter(m => selectedMessageIds.includes(m.id)))}
                            replyingTo={replyToMessage}
                            editingMessage={editingMessage}
                            onCancelReply={() => setReplyToMessage(null)}
                            onCancelEdit={() => setEditingMessage(null)}
                            isSelectMode={isSelectMode}
                            selectedMessageIds={selectedMessageIds}
                            onSelectMessage={() => { }}
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
                            {isMaximized
                                ? 'Messages'
                                : showSidebar
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
                            onCreateGroup={() => { }}
                            onTogglePin={() => { }}
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
                        {messagesLoading && (
                            <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#efeae2]/60 backdrop-blur-[1px]">
                                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                            </div>
                        )}
                        {activeChat ? (
                            <ChatWindow
                                chat={activeChat}
                                onSendMessage={handleSendMessage}
                                onSearchToggle={() => { }}
                                onInfoToggle={() => { }}
                                onMute={() => handleToggleMute(activeChat.id)}
                                onClearChat={handleClearChat}
                                onSelectMessages={() => setIsSelectMode(true)}
                                onMediaClick={setPreviewMessage}
                                onReplyMessage={setReplyToMessage}
                                onEditMessage={setEditingMessage}
                                onDeleteMessage={(id) => setConfirmState({ isOpen: true, type: 'message', messageId: id })}
                                onReactToMessage={handleReactToMessage}
                                onForwardMessage={() => setForwardingMessages(activeChat.messages.filter(m => selectedMessageIds.includes(m.id)))}
                                replyingTo={replyToMessage}
                                editingMessage={editingMessage}
                                onCancelReply={() => setReplyToMessage(null)}
                                onCancelEdit={() => setEditingMessage(null)}
                                isSelectMode={isSelectMode}
                                selectedMessageIds={selectedMessageIds}
                                onSelectMessage={() => { }}
                                onEnterSelectMode={() => setIsSelectMode(true)}
                                hideHeader={!isMaximized}
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
                onConfirm={() => {
                    if (confirmState.type === 'message' || confirmState.type === 'clear-chat') {
                        handleDeleteMessage(confirmState.messageId);
                    }
                }}
                onCancel={() => setConfirmState({ isOpen: false, type: 'message' })}
            />
        </>
    );
}
