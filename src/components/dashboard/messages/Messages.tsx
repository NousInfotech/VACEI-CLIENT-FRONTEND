import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChatList } from './components/ChatList';
import { ChatWindow } from './components/ChatWindow';
import { NewGroupSidebar } from './components/NewGroupSidebar';
import { MessageSearchPane } from './components/MessageSearchPane';
import { MediaPreviewModal } from './components/MediaPreviewModal';
import { GroupInfoPane } from './components/GroupInfoPane';
import { EmojiPicker } from './components/EmojiPicker';
import { ConfirmModal } from './components/ConfirmModal';
import { useChatRooms, mapApiMessage, extractParticipants } from '@/hooks/useChatRooms';
import { chatService } from '@/api/chatService';
import type { Chat, Message } from './types';
import { Inbox, X, Copy, Forward, Trash2, Check, Users, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type RightPaneMode = 'search' | 'info' | null;
type SidebarView = 'chats' | 'create-group';

const Messages: React.FC = () => {
  // activeChatId must be declared before useChatRooms so we can pass it in
  const [activeChatId, setActiveChatId] = useState<string | undefined>(undefined);

  const {
    rooms,
    isLoading: roomsLoading,
    error: roomsError,
    refresh: refreshRooms,
    togglePin,
    toggleMute,
    setRoomMessages,
    appendMessage,
    setUnreadCount,
  } = useChatRooms(activeChatId);

  const [messagesLoading, setMessagesLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarWidth, setSidebarWidth] = useState(380);
  const [isResizing, setIsResizing] = useState(false);
  const [sidebarView, setSidebarView] = useState<SidebarView>('chats');
  const [rightPaneMode, setRightPaneMode] = useState<RightPaneMode>(null);
  const [previewMessage, setPreviewMessage] = useState<Message | null>(null);
  const [scrollTargetId, setScrollTargetId] = useState<string | undefined>(undefined);
  const [replyToMessage, setReplyToMessage] = useState<Message | null>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedMessageIds, setSelectedMessageIds] = useState<string[]>([]);
  const [emojiPickerMessageId, setEmojiPickerMessageId] = useState<string | null>(null);
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    type: 'message' | 'bulk-message' | 'clear-chat';
    messageId?: string;
  }>({ isOpen: false, type: 'message' });
  const [forwardingMessages, setForwardingMessages] = useState<Message[]>([]);
  const [selectedForwardChatIds, setSelectedForwardChatIds] = useState<string[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);

  // ─── Select first room once rooms load ───────────────────────────────────
  useEffect(() => {
    if (!activeChatId && rooms.length > 0) {
      setActiveChatId(rooms[0].id);
    }
  }, [rooms, activeChatId]);

  // ─── Load messages when active room changes ──────────────────────────────
  useEffect(() => {
    if (!activeChatId) return;

    setRightPaneMode(null);
    setScrollTargetId(undefined);
    // Immediately clear the unread badge for this room
    setUnreadCount(activeChatId, 0);

    const roomId = activeChatId;

    // Load messages from API using the client-specific endpoint
    setMessagesLoading(true);
    chatService
      .getClientRoomMessages(roomId, 50)
      .then((res) => {
        // API returns newest-first → reverse so oldest shows at top
        const rawMsgs = (res.data ?? []).reverse();
        const msgs = rawMsgs.map(mapApiMessage);
        // Derive participants from message senders
        const participants = extractParticipants(res.data ?? []);
        setRoomMessages(roomId, msgs, participants);
      })
      .catch(console.error)
      .finally(() => setMessagesLoading(false));

    // Mark room as read
    chatService.markRoomAsRead(roomId).catch(console.error);
    // Note: Supabase Realtime subscriptions are now fully managed by useChatRooms
  }, [activeChatId]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleRightPane = (mode: RightPaneMode) => {
    setRightPaneMode(prev => (prev === mode ? null : mode));
    if (!mode) setScrollTargetId(undefined);
  };

  const handleSearchMessageClick = (messageId: string) => {
    setScrollTargetId(messageId);
  };

  // ─── Create group ─────────────────────────────────────────────────────────
  const handleCreateGroup = async (name: string, participantIds: string[]) => {
    try {
      const userId = typeof window !== 'undefined'
        ? localStorage.getItem('user_id') || localStorage.getItem('userId') || ''
        : '';
      const res = await chatService.createDirectRoom(participantIds[0], name); // TODO: replace with proper group endpoint
      const newRoomId = res.data?.id;
      if (newRoomId) {
        await refreshRooms();
        setActiveChatId(newRoomId);
      }
    } catch (err) {
      console.error('Failed to create group:', err);
    }
    setSidebarView('chats');
  };

  // ─── Pin / Mute ───────────────────────────────────────────────────────────
  const handleTogglePin = (chatId: string) => togglePin(chatId);
  const handleToggleMute = (chatId: string) => toggleMute(chatId);

  // ─── Delete / Clear ───────────────────────────────────────────────────────
  const handleDeleteMessage = (_chatId: string, messageId: string) => {
    setConfirmState({ isOpen: true, type: 'message', messageId });
  };

  const handleClearChat = () => {
    setConfirmState({ isOpen: true, type: 'clear-chat' });
  };

  const confirmDelete = async () => {
    const { messageId, type } = confirmState;
    if (!activeChatId) return;

    if (type === 'clear-chat') {
      setRoomMessages(activeChatId, []);
      setConfirmState({ isOpen: false, type: 'message' });
      return;
    }

    const isBulk = type === 'bulk-message';
    const idsToDelete = isBulk ? selectedMessageIds : messageId ? [messageId] : [];

    // Fire API deletes
    await Promise.allSettled(idsToDelete.map((id) => chatService.deleteMessage(id)));

    // Update local state — soft-delete (mark isDeleted)
    const activeRoom = rooms.find((r) => r.id === activeChatId);
    if (activeRoom) {
      const updatedMessages = activeRoom.messages.map((m) =>
        idsToDelete.includes(m.id)
          ? { ...m, isDeleted: true, text: undefined, type: 'text' as const, reactions: {} }
          : m
      );
      setRoomMessages(activeChatId, updatedMessages);
    }

    if (isBulk) {
      setIsSelectMode(false);
      setSelectedMessageIds([]);
    }
    setConfirmState({ isOpen: false, type: 'message' });
  };

  // ─── Reactions ────────────────────────────────────────────────────────────
  const handleReactToMessage = (chatId: string, messageId: string, emoji: string) => {
    if (emoji === '+') {
      setEmojiPickerMessageId(messageId);
      return;
    }

    const room = rooms.find((r) => r.id === chatId);
    if (!room) return;

    const updatedMessages = room.messages.map((m) => {
      if (m.id !== messageId) return m;
      const reactions = { ...(m.reactions || {}) };
      const alreadyHas = (reactions[emoji] || []).includes('me');
      Object.keys(reactions).forEach((key) => {
        reactions[key] = reactions[key].filter((id) => id !== 'me');
        if (reactions[key].length === 0) delete reactions[key];
      });
      if (!alreadyHas) {
        reactions[emoji] = [...(reactions[emoji] || []), 'me'];
      }
      return { ...m, reactions };
    });
    setRoomMessages(chatId, updatedMessages);

    // Fire API
    chatService.addReaction(messageId, emoji).catch(console.error);
  };

  // ─── Forward ──────────────────────────────────────────────────────────────
  const handleForwardMessages = () => {
    if (forwardingMessages.length === 0 || selectedForwardChatIds.length === 0) return;

    const timestamp = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    selectedForwardChatIds.forEach((targetRoomId) => {
      forwardingMessages.forEach(async (msg) => {
        const text = msg.text || '';
        if (text) {
          try {
            const sent = await chatService.sendMessage(targetRoomId, text);
            if (sent) appendMessage(targetRoomId, mapApiMessage(sent));
          } catch (err) {
            console.error('Forward failed:', err);
          }
        }
      });
    });

    setForwardingMessages([]);
    setSelectedForwardChatIds([]);
    setIsSelectMode(false);
    setSelectedMessageIds([]);
  };

  // ─── Send Message ─────────────────────────────────────────────────────────
  const handleSendMessage = async (content: {
    text?: string;
    gifUrl?: string;
    fileUrl?: string;
    fileName?: string;
    fileSize?: string;
    type: 'text' | 'gif' | 'image' | 'document';
  }) => {
    if (!activeChatId) return;

    // Handle edit
    if (editingMessage) {
      const text = content.text || '';
      const activeRoom = rooms.find((r) => r.id === activeChatId);
      if (activeRoom) {
        const updatedMessages = activeRoom.messages.map((m) =>
          m.id === editingMessage.id ? { ...m, text, isEdited: true } : m
        );
        setRoomMessages(activeChatId, updatedMessages);
      }
      chatService.editMessage(editingMessage.id, text).catch(console.error);
      setEditingMessage(null);
      return;
    }

    // Optimistic local message
    const optimisticId = `optimistic-${Date.now()}`;
    const optimistic: Message = {
      id: optimisticId,
      senderId: 'me',
      type: content.type,
      text: content.text,
      fileUrl: content.fileUrl,
      fileName: content.fileName,
      fileSize: content.fileSize,
      replyToId: replyToMessage?.id,
      replyToMessageId: replyToMessage?.id ?? null,
      replyToMessage: replyToMessage ?? null,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      createdAt: Date.now(),
      status: 'sent',
    };
    appendMessage(activeChatId, optimistic);
    const replyToIdForSend = replyToMessage?.id;
    setReplyToMessage(null);

    try {
      let fileUrl: string | undefined;
      if (content.type === 'image' || content.type === 'document') {
        // fileUrl is already a blob URL from local selection —
        // in real usage pass the uploaded URL from chatService.uploadFile
        fileUrl = content.fileUrl;
      }
      const sent = await chatService.sendMessage(
        activeChatId,
        content.text || '',
        fileUrl,
        replyToIdForSend ? { replyToMessageId: replyToIdForSend } : undefined
      );
      if (sent) {
        // Replace optimistic with real message
        const activeRoom = rooms.find((r) => r.id === activeChatId);
        if (activeRoom) {
          const updatedMessages = activeRoom.messages.map((m) =>
            m.id === optimisticId ? mapApiMessage(sent) : m
          );
          setRoomMessages(activeChatId, updatedMessages);
        }
      }
    } catch (err) {
      console.error('Failed to send message:', err);
      // Mark optimistic message as failed (keep it visible)
    }
  };

  // ─── Select mode helpers ──────────────────────────────────────────────────
  const handleToggleSelectMessage = (messageId: string) => {
    setSelectedMessageIds(prev =>
      prev.includes(messageId) ? prev.filter(id => id !== messageId) : [...prev, messageId]
    );
  };

  const handleBulkCopy = () => {
    const activeRoom = rooms.find((r) => r.id === activeChatId);
    if (!activeRoom) return;
    const selectedMessages = activeRoom.messages.filter(m => selectedMessageIds.includes(m.id));
    const text = selectedMessages.map(m => `[${m.timestamp}] ${m.senderId}: ${m.text || ''}`).join('\n');
    navigator.clipboard.writeText(text);
    setIsSelectMode(false);
    setSelectedMessageIds([]);
  };

  const handleBulkDelete = () => setConfirmState({ isOpen: true, type: 'bulk-message' });

  const handleBulkForward = () => {
    const activeRoom = rooms.find((r) => r.id === activeChatId);
    if (!activeRoom) return;
    const selectedMessages = activeRoom.messages.filter(m => selectedMessageIds.includes(m.id));
    if (selectedMessages.length > 0) setForwardingMessages(selectedMessages);
  };

  // ─── Resize ───────────────────────────────────────────────────────────────
  const startResizing = (e: React.MouseEvent) => { setIsResizing(true); e.preventDefault(); };
  const stopResizing = useCallback(() => setIsResizing(false), []);
  const resize = useCallback((e: MouseEvent) => {
    if (isResizing && containerRef.current) {
      const containerLeft = containerRef.current.getBoundingClientRect().left;
      const newWidth = e.clientX - containerLeft;
      if (newWidth >= 280 && newWidth <= 450) setSidebarWidth(newWidth);
    }
  }, [isResizing]);

  useEffect(() => {
    window.addEventListener('mousemove', resize);
    window.addEventListener('mouseup', stopResizing);
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [resize, stopResizing]);

  // ─── Derived ──────────────────────────────────────────────────────────────
  const activeChat = rooms.find(c => c.id === activeChatId);

  const filteredRooms = rooms.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div
      ref={containerRef}
      className="flex h-full bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 relative"
    >
      {/* Left: Chat List / Create Group */}
      <div style={{ width: `${sidebarWidth}px` }} className="shrink-0 h-full overflow-hidden">
        {sidebarView === 'chats' ? (
          <div className="flex flex-col h-full">
            {roomsLoading && rooms.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-primary animate-spin" />
              </div>
            ) : roomsError ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 p-6 text-center">
                <p className="text-sm text-red-500">{roomsError}</p>
                <button
                  onClick={refreshRooms}
                  className="text-xs text-primary underline hover:no-underline"
                >
                  Retry
                </button>
              </div>
            ) : (
              <ChatList
                chats={filteredRooms}
                activeChatId={activeChatId}
                onSelectChat={(chat) => setActiveChatId(chat.id)}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onCreateGroup={() => setSidebarView('create-group')}
                onTogglePin={handleTogglePin}
                onToggleMute={handleToggleMute}
              />
            )}
          </div>
        ) : (
          <NewGroupSidebar
            onBack={() => setSidebarView('chats')}
            onCreateGroup={handleCreateGroup}
          />
        )}
      </div>

      {/* Resize Handle */}
      <div
        onMouseDown={startResizing}
        className={cn(
          'w-px hover:w-0.5 h-full cursor-col-resize hover:bg-primary/30 transition-all z-10 shrink-0',
          isResizing ? 'bg-primary/50 w-1' : 'bg-gray-200'
        )}
      />

      {/* Right: Chat Window */}
      <div className="flex-1 h-full min-w-0 flex overflow-hidden">
        {activeChat ? (
          <>
            <div className="flex-1 h-full min-w-0 relative">
              {messagesLoading && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#efeae2]/60 backdrop-blur-[1px]">
                  <Loader2 className="w-7 h-7 text-primary animate-spin" />
                </div>
              )}
              <ChatWindow
                chat={activeChat}
                onSendMessage={handleSendMessage}
                onSearchToggle={() => toggleRightPane('search')}
                onInfoToggle={() => toggleRightPane('info')}
                onMute={() => handleToggleMute(activeChat.id)}
                onClearChat={handleClearChat}
                onSelectMessages={() => setIsSelectMode(true)}
                onMediaClick={setPreviewMessage}
                scrollToMessageId={scrollTargetId}
                onScrollComplete={() => setScrollTargetId(undefined)}
                onReplyMessage={setReplyToMessage}
                onEditMessage={setEditingMessage}
                onDeleteMessage={(msgId: string) => handleDeleteMessage(activeChat.id, msgId)}
                onReactToMessage={(msgId: string, emoji: string) => handleReactToMessage(activeChat.id, msgId, emoji)}
                onForwardMessage={(msg: Message) => setForwardingMessages([msg])}
                replyingTo={replyToMessage}
                editingMessage={editingMessage}
                onCancelReply={() => setReplyToMessage(null)}
                onCancelEdit={() => setEditingMessage(null)}
                isSelectMode={isSelectMode}
                selectedMessageIds={selectedMessageIds}
                onSelectMessage={handleToggleSelectMessage}
                onEnterSelectMode={() => setIsSelectMode(true)}
              />
            </div>

            {/* Bulk select toolbar */}
            {isSelectMode && (
              <div className="absolute bottom-0 left-0 right-0 bg-[#f0f2f5] border-t border-gray-200 z-50 flex items-center justify-between px-6 py-4 animate-in slide-in-from-bottom duration-200">
                <div className="flex items-center gap-3">
                  <button onClick={() => { setIsSelectMode(false); setSelectedMessageIds([]); }} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                  <span className="font-semibold text-gray-700">{selectedMessageIds.length} selected</span>
                </div>
                <div className="flex items-center gap-6">
                  <button onClick={handleBulkCopy} className="p-2 hover:bg-gray-200 rounded-full transition-colors flex flex-col items-center gap-1 group">
                    <Copy className="w-5 h-5 text-gray-600 group-hover:text-primary" />
                    <span className="text-[10px] text-gray-500 font-medium">Copy</span>
                  </button>
                  <button onClick={handleBulkForward} className="p-2 hover:bg-gray-200 rounded-full transition-colors flex flex-col items-center gap-1 group">
                    <Forward className="w-5 h-5 text-gray-600 group-hover:text-primary" />
                    <span className="text-[10px] text-gray-500 font-medium">Share</span>
                  </button>
                  <button onClick={handleBulkDelete} className="p-2 hover:bg-gray-200 rounded-full transition-colors flex flex-col items-center gap-1 group">
                    <Trash2 className="w-5 h-5 text-red-500" />
                    <span className="text-[10px] text-red-500 font-medium">Delete</span>
                  </button>
                </div>
              </div>
            )}

            {/* Right drawer: search / info */}
            <div className={cn(
              'h-full border-l border-gray-200 transition-all duration-300 ease-in-out overflow-hidden shrink-0',
              rightPaneMode ? 'w-[400px]' : 'w-0 border-transparent'
            )}>
              <div className="w-[400px] h-full">
                {rightPaneMode === 'search' ? (
                  <MessageSearchPane
                    messages={activeChat.messages}
                    participants={activeChat.participants}
                    chatName={activeChat.name}
                    onClose={() => setRightPaneMode(null)}
                    onMessageClick={handleSearchMessageClick}
                  />
                ) : (
                  <GroupInfoPane
                    name={activeChat.name}
                    type={activeChat.type}
                    participants={activeChat.participants}
                    onClose={() => setRightPaneMode(null)}
                  />
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="h-full flex-1 flex flex-col items-center justify-center bg-[#f0f2f5] p-8 text-center border-l border-gray-200">
            <div className="max-w-md flex flex-col items-center">
              <div className="w-48 h-48 relative mb-8 opacity-40">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl animate-pulse" />
                <Inbox className="w-full h-full text-primary relative z-10" />
              </div>
              <h2 className="text-3xl font-light text-gray-700 mb-4">Vacei Platform Portal</h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-8">
                Send and receive messages without keeping your phone online.<br />
                Use Vacei Platform Portal on up to 4 linked devices and 1 phone at the same time.
              </p>
              <div className="flex items-center gap-2 text-gray-400 text-xs mt-auto">
                <div className="w-3 h-3 border border-current rounded-full flex items-center justify-center text-[8px]">!</div>
                <span>End-to-end encrypted</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Media Preview Modal */}
      {previewMessage && (
        <MediaPreviewModal message={previewMessage} onClose={() => setPreviewMessage(null)} />
      )}

      {/* Forward Modal */}
      {forwardingMessages.length > 0 && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-gray-100 flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-800 text-[15px]">Forward message</h3>
                <p className="text-xs text-gray-500 mt-0.5">{forwardingMessages.length} message{forwardingMessages.length > 1 ? 's' : ''} selected</p>
              </div>
              <button onClick={() => setForwardingMessages([])} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar min-h-[300px]">
              {rooms.map(chat => {
                const isSelected = selectedForwardChatIds.includes(chat.id);
                return (
                  <button
                    key={chat.id}
                    onClick={() => setSelectedForwardChatIds(prev =>
                      isSelected ? prev.filter(id => id !== chat.id) : [...prev, chat.id]
                    )}
                    className={cn(
                      'w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left group',
                      isSelected ? 'bg-primary/5 shadow-sm' : 'hover:bg-gray-50'
                    )}
                  >
                    <div className="relative shrink-0">
                      <div className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center transition-all',
                        isSelected ? 'bg-primary text-white scale-95'
                          : chat.type === 'GROUP' ? 'bg-[#dfe5e7] text-[#54656f]'
                            : 'bg-primary/10 text-primary font-bold'
                      )}>
                        {chat.type === 'GROUP' ? <Users className="w-5 h-5" /> : chat.name.substring(0, 2).toUpperCase()}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn('font-semibold truncate transition-colors', isSelected ? 'text-primary' : 'text-gray-900')}>{chat.name}</p>
                      <p className="text-xs text-gray-500">{chat.participants.length} participants</p>
                    </div>
                    <div className={cn(
                      'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all',
                      isSelected ? 'bg-primary border-primary' : 'border-gray-200 group-hover:border-primary/30'
                    )}>
                      {isSelected && <Check className="w-3 h-3 text-white" />}
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="p-4 border-t border-gray-100 bg-gray-50/50">
              <button
                disabled={selectedForwardChatIds.length === 0}
                onClick={handleForwardMessages}
                className={cn(
                  'w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2',
                  selectedForwardChatIds.length > 0
                    ? 'bg-primary text-white shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                )}
              >
                <Forward className="w-5 h-5" />
                Forward to {selectedForwardChatIds.length || ''} recipient{selectedForwardChatIds.length !== 1 ? 's' : ''}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete / Clear Confirm Modal */}
      <ConfirmModal
        isOpen={confirmState.isOpen}
        title={
          confirmState.type === 'clear-chat' ? 'Clear this chat?' :
            confirmState.type === 'bulk-message' ? 'Delete selected messages?' :
              'Delete message?'
        }
        message={
          confirmState.type === 'clear-chat' ? 'This will delete all messages in this chat. This action cannot be undone.' :
            confirmState.type === 'bulk-message'
              ? `Are you sure you want to delete these ${selectedMessageIds.length} messages? This action cannot be undone.`
              : 'Are you sure you want to delete this message? This action cannot be undone.'
        }
        confirmLabel={confirmState.type === 'clear-chat' ? 'Clear chat' : 'Delete'}
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setConfirmState({ isOpen: false, type: 'message' })}
      />

      {/* Full Emoji Picker for Reactions */}
      {emojiPickerMessageId && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/20 backdrop-blur-[2px]">
          <div className="bg-white rounded-2xl shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setEmojiPickerMessageId(null)}
              className="absolute -top-10 right-0 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
            <div className="p-2">
              <EmojiPicker
                onSelect={(emoji) => {
                  handleReactToMessage(activeChatId!, emojiPickerMessageId, emoji);
                  setEmojiPickerMessageId(null);
                }}
                onClose={() => setEmojiPickerMessageId(null)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Messages;
