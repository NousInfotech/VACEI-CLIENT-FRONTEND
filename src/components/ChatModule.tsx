'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
    Cancel01Icon,
    Message01Icon,
    Maximize01Icon,
    SquareArrowShrink01Icon,
    BubbleChatAddIcon,
} from '@hugeicons/core-free-icons';
import { ENGAGEMENT_CONFIG } from '@/config/engagementConfig';
import { MOCK_CHAT_DATA } from './chat/mockChatData';

const backendUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001/api/';

type Message = {
    id: number | string;
    sender: { id: number; first_name: string; avatar?: string; username?: string };
    message: string;
    createdAt: Date;
    isOptimistic?: boolean;
};

type Assignment = {
    assignmentId: number;
    accountant: {
        id: number;
        first_name: string;
        last_name: string;
        email: string;
        avatar?: string;
        name: string;
    };
};

type MessagesByAssignment = Record<number, Message[]>;

interface ChatModuleProps {
    isEmbedded?: boolean;
}

export default function CollapsibleFacebookChat({ isEmbedded = false }: ChatModuleProps) {
    const latestTimestampsRef = useRef<Record<string, number>>({});
    const earliestTimestampsRef = useRef<Record<string, number>>({});
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const pollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const pollingRef = useRef(false);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const shouldScrollToBottomRef = useRef(true);

    const [userId, setUserId] = useState<number | null>(null);
    const [username, setUsername] = useState<string>('You');
    const [token, setToken] = useState<string>('');

    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(
        null
    );
    const [messages, setMessages] = useState<MessagesByAssignment>({});
    const [input, setInput] = useState('');

    const [isOpen, setIsOpen] = useState(false);
    const [isMaximized, setIsMaximized] = useState(false);
    const [isLoadingInitialData, setIsLoadingInitialData] = useState<boolean>(true);
    const [isChatLoading, setIsChatLoading] = useState<boolean>(false);
    const [hasMoreMessages, setHasMoreMessages] = useState<Record<number, boolean>>(
        {}
    );
    // NEW: State for new message indicator
    const [hasNewMessages, setHasNewMessages] = useState(false);

    // Flag to indicate if initial messages for a chat have been loaded (even if empty)
    const hasInitialMessagesLoadedRef = useRef<Record<number, boolean>>({});

    // Effect to load user data from localStorage when component mounts
    useEffect(() => {
        try {
            const encodedUserId = localStorage.getItem('user_id');
            const encodedUsername = localStorage.getItem('username');
            const storedToken = localStorage.getItem('token');

            if (encodedUserId) {
                setUserId(Number(atob(decodeURIComponent(encodedUserId))));
            }
            if (encodedUsername) {
                const decodedUsername = atob(encodedUsername);
                setUsername(decodedUsername);
            }
            if (storedToken) {
                setToken(storedToken);
            }
        } catch (err) {
            console.error('Failed to parse user data from localStorage:', err);
        } finally {
            setIsLoadingInitialData(false);
        }
    }, []);

    const mapMessages = useCallback(
        (msgs: any[], assignment?: Assignment): Message[] =>
            (msgs ?? []).map((msg) => ({
                id: msg.id,
                sender: {
                    id: msg.senderId,
                    first_name:
                        msg.senderId === userId
                            ? 'You'
                            : assignment?.accountant.first_name ?? '',
                    avatar: undefined,
                    username: msg.senderId === userId ? username : assignment?.accountant.name,
                },
                message: msg.message,
                createdAt: new Date(msg.createdAt),
            })),
        [userId, username]
    );

    const fetchMessagesForAssignment = useCallback(
        async (
            assignment: Assignment,
            limit: number = 10,
            beforeTimestamp?: number,
            sinceTimestamp?: number,
            isInitialEmptyPoll: boolean = false
        ): Promise<{ messages: Message[]; hasMore: boolean }> => {
            if (!assignment || !token) {
                console.warn('Attempted to fetch messages without assignment or token.');
                return { messages: [], hasMore: false };
            }

            try {
                if (ENGAGEMENT_CONFIG.USE_MOCK_CHAT) {
                    await new Promise(resolve => setTimeout(resolve, 500));
                    const mockMsgs = MOCK_CHAT_DATA.messages[assignment.assignmentId as keyof typeof MOCK_CHAT_DATA.messages] || [];
                    const mappedMsgs = mockMsgs.map(msg => ({
                        ...msg,
                        sender: {
                            id: msg.senderId === 'current_user' ? (userId ?? 0) : msg.senderId,
                            first_name: msg.senderId === 'current_user' ? 'You' : assignment.accountant.first_name,
                            username: msg.senderId === 'current_user' ? username : assignment.accountant.name,
                        },
                        createdAt: new Date(msg.createdAt)
                    }));
                    mappedMsgs.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
                    return { messages: mappedMsgs as any[], hasMore: false };
                }

                const url = new URL(`${backendUrl}chat/getMessages`);
                url.searchParams.append('userId', String(assignment.accountant.id));

                if (sinceTimestamp) {
                    url.searchParams.append('since', String(sinceTimestamp));
                    if (isInitialEmptyPoll) {
                        url.searchParams.append('limit', String(limit));
                    } else if (limit !== 0) {
                        url.searchParams.append('limit', String(limit));
                    }
                } else {
                    url.searchParams.append('limit', String(limit));
                    if (beforeTimestamp) {
                        url.searchParams.append('before', String(beforeTimestamp));
                    }
                }

                const res = await fetch(url.toString(), {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!res.ok) {
                    const errorData = await res.json().catch(() => ({ message: 'Unknown error' }));
                    throw new Error(errorData.message || `Failed to load messages: ${res.status}`);
                }

                const responseData = await res.json();
                const rawMsgs = Array.isArray(responseData) ? responseData : responseData.data || [];
                const mappedMsgs = mapMessages(rawMsgs, assignment);

                mappedMsgs.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

                const hasMore = sinceTimestamp ? false : (responseData.hasMore !== undefined ? responseData.hasMore : rawMsgs.length === limit);

                return { messages: mappedMsgs, hasMore };
            } catch (e) {
                console.error('Failed to fetch messages:', e instanceof Error ? e.message : e);
                return { messages: [], hasMore: false };
            }
        },
        [mapMessages, token]
    );

    const loadChatMessages = useCallback(
        async (assignment: Assignment) => {
            if (hasInitialMessagesLoadedRef.current[assignment.assignmentId]) {
                if (messages[assignment.assignmentId] && messages[assignment.assignmentId].length === 0) {
                    return;
                }
                if (messages[assignment.assignmentId] && messages[assignment.assignmentId].length > 0) {
                    return;
                }
            }

            setIsChatLoading(true);
            shouldScrollToBottomRef.current = true;
            try {
                const { messages: msgs, hasMore } = await fetchMessagesForAssignment(assignment, 10);
                setMessages((prev) => ({
                    ...prev,
                    [assignment.assignmentId]: msgs,
                }));
                setHasMoreMessages((prev) => ({ ...prev, [assignment.assignmentId]: hasMore }));

                if (msgs.length > 0) {
                    latestTimestampsRef.current[assignment.assignmentId] = Math.max(...msgs.map((m) => m.createdAt.getTime()));
                    earliestTimestampsRef.current[assignment.assignmentId] = Math.min(...msgs.map((m) => m.createdAt.getTime()));
                } else {
                    latestTimestampsRef.current[assignment.assignmentId] = Date.now() + 1000;
                    earliestTimestampsRef.current[assignment.assignmentId] = 0;
                }
                hasInitialMessagesLoadedRef.current[assignment.assignmentId] = true;
            } catch (error) {
                console.error('Error loading chat messages:', error);
            } finally {
                setIsChatLoading(false);
            }
        },
        [fetchMessagesForAssignment, messages]
    );

    // Effect to fetch chat assignments on initial load
    useEffect(() => {
        if (isLoadingInitialData) return;
        if (!token && !ENGAGEMENT_CONFIG.USE_MOCK_CHAT) return;

        const loadAssignments = async () => {
            try {
                if (ENGAGEMENT_CONFIG.USE_MOCK_CHAT) {
                    await new Promise(resolve => setTimeout(resolve, 500));
                    const mapped: Assignment[] = MOCK_CHAT_DATA.assignments;
                    setAssignments(mapped);
                    if (mapped.length > 0) {
                        setSelectedAssignment(mapped[0]);
                    }
                    return;
                }

                const res = await fetch(`${backendUrl}chat/getChatUsers`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!res.ok) throw new Error('Failed to load chat users');

                const data = await res.json();

                if (Array.isArray(data)) {
                    const mapped: Assignment[] = data.map((item: any) => {
                        const name = item.name ?? '';
                        return {
                            assignmentId: item.id,
                            accountant: {
                                id: item.id,
                                first_name: name.split(' ')[0] ?? '',
                                last_name: name.split(' ').slice(1).join(' ') ?? '',
                                email: item.email ?? '',
                                avatar: undefined,
                                name: name,
                            },
                        };
                    });
                    setAssignments(mapped);
                    if (mapped.length > 0) {
                        setSelectedAssignment(mapped[0]);
                    }
                }
            } catch (e) {
                console.error('Error loading assignments:', e);
            }
        };

        loadAssignments();
    }, [isLoadingInitialData, token]);

    // Effect to load messages when selectedAssignment changes or chat is opened
    useEffect(() => {
        if (!selectedAssignment || isLoadingInitialData) return;
        if (!token && !ENGAGEMENT_CONFIG.USE_MOCK_CHAT) return;
        loadChatMessages(selectedAssignment);
    }, [isOpen, selectedAssignment, isLoadingInitialData, token, loadChatMessages]);

    // Polling effect for new messages
    useEffect(() => {
        if (pollTimeoutRef.current) {
            clearTimeout(pollTimeoutRef.current);
            pollTimeoutRef.current = null;
        }

        if (!selectedAssignment || !token || ENGAGEMENT_CONFIG.USE_MOCK_CHAT) return; // Disable polling in mock mode

        let isMounted = true;

        const poll = async () => {
            if (pollingRef.current) return;
            pollingRef.current = true;

            try {
                const assignmentId = selectedAssignment.assignmentId;
                const latestTimestamp = latestTimestampsRef.current[assignmentId];

                if (latestTimestamp === undefined) {
                    console.warn(`Polling skipped for assignment ${assignmentId}: latestTimestamp not set yet.`);
                    return;
                }

                const isCurrentlyEmpty = (messages[assignmentId] || []).length === 0;

                const { messages: newMsgs } = await fetchMessagesForAssignment(
                    selectedAssignment,
                    isCurrentlyEmpty ? 10 : 0,
                    undefined,
                    latestTimestamp,
                    isCurrentlyEmpty
                );

                if (!isMounted) return;

                if (newMsgs.length > 0) {
                    // Only scroll to bottom if chat is currently open OR if it's the currently selected chat
                    // and we want to indicate new messages when opened later.
                    if (isOpen) {
                        shouldScrollToBottomRef.current = true;
                    } else {
                        // NEW: Set new message indicator if chat is closed
                        setHasNewMessages(true);
                    }

                    setMessages((prev) => {
                        const currentMsgs = prev[assignmentId] || [];
                        const filteredCurrentMsgs = currentMsgs.filter(
                            (m) =>
                                !(
                                    m.isOptimistic &&
                                    newMsgs.some(
                                        (nm) =>
                                            nm.message === m.message &&
                                            Math.abs(nm.createdAt.getTime() - m.createdAt.getTime()) < 60000
                                    )
                                )
                        );

                        const existingIds = new Set(filteredCurrentMsgs.map((m) => m.id));
                        const newUniqueMsgs = newMsgs.filter((m) => !existingIds.has(m.id));

                        if (newUniqueMsgs.length > 0) {
                            const latestNew = Math.max(...newUniqueMsgs.map((m) => m.createdAt.getTime()));
                            if (latestNew > (latestTimestampsRef.current[assignmentId] || 0)) {
                                latestTimestampsRef.current[assignmentId] = latestNew;
                            }
                        }

                        return {
                            ...prev,
                            [assignmentId]: [...filteredCurrentMsgs, ...newUniqueMsgs].sort(
                                (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
                            ),
                        };
                    });
                }
            } catch (e) {
                console.error('Polling fetch messages error:', e);
            } finally {
                pollingRef.current = false;
                if (isMounted) {
                    pollTimeoutRef.current = setTimeout(poll, 5000);
                }
            }
        };

        pollTimeoutRef.current = setTimeout(poll, 500);

        return () => {
            isMounted = false;
            if (pollTimeoutRef.current) {
                clearTimeout(pollTimeoutRef.current);
                pollTimeoutRef.current = null;
            }
        };
    }, [selectedAssignment, token, fetchMessagesForAssignment, messages, isOpen]); // `isOpen` added to deps

    // Effect to scroll to bottom when messages or UI changes, controlled by ref
    useEffect(() => {
        if (shouldScrollToBottomRef.current && messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
            shouldScrollToBottomRef.current = false;
        }
    }, [messages, selectedAssignment, isOpen]);

    // NEW: Effect to clear new message indicator when chat is opened
    useEffect(() => {
        if (isOpen) {
            setHasNewMessages(false); // Clear indicator when chat window is open
        }
    }, [isOpen]);

    // Function to handle loading older messages (for pagination)
    const handleLoadMoreMessages = useCallback(async () => {
        if (!selectedAssignment || !hasMoreMessages[selectedAssignment.assignmentId])
            return;

        setIsChatLoading(true);
        shouldScrollToBottomRef.current = false;

        const chatContainer = chatContainerRef.current;
        const previousScrollHeight = chatContainer?.scrollHeight || 0;

        try {
            const currentMsgs = messages[selectedAssignment.assignmentId] || [];
            if (currentMsgs.length === 0) {
                setIsChatLoading(false);
                return;
            }

            const earliestMessageTimestamp =
                earliestTimestampsRef.current[selectedAssignment.assignmentId];

            const { messages: olderMsgs, hasMore } = await fetchMessagesForAssignment(
                selectedAssignment,
                50,
                earliestMessageTimestamp
            );

            if (olderMsgs.length > 0) {
                setMessages((prev) => {
                    const existingMsgs = prev[selectedAssignment.assignmentId] || [];
                    const newUniqueOlderMsgs = olderMsgs.filter(
                        (newMsg) =>
                            !existingMsgs.some((existingMsg) => existingMsg.id === newMsg.id)
                    );

                    earliestTimestampsRef.current[selectedAssignment.assignmentId] = Math.min(
                        earliestMessageTimestamp,
                        ...olderMsgs.map((m) => m.createdAt.getTime())
                    );

                    return {
                        ...prev,
                        [selectedAssignment.assignmentId]: [
                            ...newUniqueOlderMsgs,
                            ...existingMsgs,
                        ].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime()),
                    };
                });

                if (chatContainer) {
                    setTimeout(() => {
                        const newScrollHeight = chatContainer.scrollHeight;
                        chatContainer.scrollTop = newScrollHeight - previousScrollHeight;
                    }, 0);
                }
            }
            setHasMoreMessages((prev) => ({
                ...prev,
                [selectedAssignment.assignmentId]: hasMore,
            }));
        } catch (e) {
            console.error('Failed to load older messages:', e);
        } finally {
            setIsChatLoading(false);
        }
    }, [selectedAssignment, messages, hasMoreMessages, fetchMessagesForAssignment]);

    async function sendMessage() {
        if (!input.trim() || !selectedAssignment || userId === null || !token) {
            console.warn(
                'Cannot send message: Input empty, no assignment selected, user ID is null, or no token.'
            );
            return;
        }

        const assignmentId = selectedAssignment.assignmentId;
        const messageToSend = input.trim();
        const tempId = `optimistic-${Date.now()}-${Math.random()
            .toString(36)
            .substring(2, 9)}`;
        const createdAt = new Date();

        shouldScrollToBottomRef.current = true;

        setMessages((prev) => {
            const currentMsgs = prev[assignmentId] || [];
            const newMessage: Message = {
                id: tempId,
                sender: { id: userId, first_name: username, username: username },
                message: messageToSend,
                createdAt,
                isOptimistic: true,
            };
            return {
                ...prev,
                [assignmentId]: [...currentMsgs, newMessage].sort(
                    (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
                ),
            };
        });
        setInput('');

        try {
            if (ENGAGEMENT_CONFIG.USE_MOCK_CHAT) {
                await new Promise(resolve => setTimeout(resolve, 300));
                // In mock mode, we just keep the optimistic message
                return;
            }

            await fetch(`${backendUrl}chat/send`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                    senderId: userId,
                    receiverId: selectedAssignment.accountant.id,
                    message: messageToSend,
                }),
            });
        } catch (e) {
            console.error('Failed to send message', e);
            setMessages((prev) => {
                const currentMsgs = prev[assignmentId] || [];
                return {
                    ...prev,
                    [assignmentId]: currentMsgs.filter((msg) => msg.id !== tempId),
                };
            });
        }
    }

    const getInitials = (name: string | undefined): string => {
        if (!name) return '??';
        const parts = name.split(' ').filter(Boolean);
        if (parts.length === 0) return '??';
        if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
        return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
    };

    const buttonCommonClasses = 'border-none cursor-pointer bg-transparent';

    if (isLoadingInitialData) {
        return null;
    }

    return (
        <>
            {!isOpen && !isEmbedded && (
                <button
                    id="openChatBubble"
                    onClick={() => {
                        setIsOpen(true);
                        shouldScrollToBottomRef.current = true;
                    }}
                    aria-label="Open chat"
                    className="fixed bottom-6 right-6 w-15 h-15 rounded-full bg-sidebar-background text-sidebar-foreground flex items-center justify-center select-none shadow-lg z-50 transition-all duration-300 hover:scale-105 hover:shadow-xl"
                >
                    <HugeiconsIcon icon={Message01Icon} className="h-8 w-8" />
                    {/* NEW: New message indicator */}
                    {hasNewMessages && (
                        <span className="absolute top-0 right-0 block h-3 w-3 rounded-full ring-2 ring-white bg-red-500"></span>
                    )}
                </button>
            )}

            {(isOpen || isEmbedded) && (
                <div
                    className={`${isEmbedded ? 'relative w-full h-[600px]' : 'fixed bottom-6 right-6 rounded-xl shadow-2xl z-50 transition-all duration-300'} 
                    bg-card flex flex-col font-sans
                    ${!isEmbedded && (isMaximized ? 'w-[90vw] h-[80vh] sm:w-[90vw] sm:h-[90vh]' : 'w-[400px] h-[500px]')}`}
                >
                    {/* Header */}
                    <div className="p-4 border-b border-border flex justify-between items-center font-semibold text-lg text-primary">
                        <div>
                            {assignments.length === 0 || !selectedAssignment
                                ? 'Chat'
                                : `Chat with ${selectedAssignment.accountant.first_name}`}
                        </div>

                        <div className="flex gap-3 items-center">
                            {!isEmbedded && (
                                <button
                                    disabled={assignments.length === 0}
                                    onClick={() => setIsMaximized(!isMaximized)}
                                    aria-label={isMaximized ? 'Restore window' : 'Maximize window'}
                                    className={`text-muted-foreground ${buttonCommonClasses} focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1`}
                                >
                                    {isMaximized ? (
                                        <HugeiconsIcon icon={SquareArrowShrink01Icon} className="h-6 w-6" />
                                    ) : (
                                        <HugeiconsIcon icon={Maximize01Icon} className="h-6 w-6" />
                                    )}
                                </button>
                            )}
                            {!isEmbedded && (
                                <button
                                    onClick={() => {
                                        setIsOpen(false);
                                        setIsMaximized(false);
                                    }}
                                    aria-label="Close chat"
                                    className={`text-muted-foreground ${buttonCommonClasses} focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1`}
                                >
                                    <HugeiconsIcon icon={Cancel01Icon} className="h-6 w-6" />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-grow overflow-hidden">
                        {/* Sidebar (Chat Partner List) */}
                        <div className="w-24 border-r border-border bg-brand-body overflow-y-auto p-2">
                            {assignments.length === 0 ? (
                                <div className="text-sm text-muted-foreground text-center mt-5 select-none">
                                    No users found
                                </div>
                            ) : (
                                assignments.map((a) => {
                                    const isSelected =
                                        selectedAssignment?.assignmentId === a.assignmentId;
                                    return (
                                        <div
                                            key={a.assignmentId}
                                            onClick={async () => {
                                                if (selectedAssignment?.assignmentId === a.assignmentId)
                                                    return;

                                                setSelectedAssignment(a);
                                            }}
                                            className={`cursor-pointer mb-3 p-1 rounded-lg flex flex-col items-center transition-colors duration-200
                        ${isSelected ? 'bg-sidebar-hover/50' : 'hover:bg-brand-muted'}`}
                                        >
                                            <div
                                                className="w-12 h-12 flex items-center justify-center rounded-full font-semibold text-lg select-none"
                                                title={a.accountant.name}
                                            >
                                                {getInitials(a.accountant.name)}
                                            </div>
                                            <div
                                                title={`${a.accountant.first_name} ${a.accountant.last_name}`}
                                                className={`text-xs text-center overflow-hidden text-ellipsis w-full
                            ${isSelected ? 'text-brand-body font-semibold' : 'text-brand-body'}`}
                                            >
                                                {a.accountant.first_name}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Chat area (messages + input) */}
                        <div
                            ref={chatContainerRef}
                            className={`grow flex flex-col p-3
                ${(assignments.length === 0 || !selectedAssignment) ? 'justify-center items-center text-muted-foreground text-sm' : ''}`}
                        >
                            {isChatLoading &&
                                selectedAssignment &&
                                (!messages[selectedAssignment.assignmentId] ||
                                    messages[selectedAssignment.assignmentId]?.length === 0) ? (
                                <div className="text-muted-foreground text-center mt-10">
                                    Loading chat...
                                </div>
                            ) : assignments.length === 0 || !selectedAssignment ? (
                                <div className="text-muted-foreground text-center mt-10">
                                    Select a user to chat.
                                </div>
                            ) : (
                                <>
                                    {/* Messages Display Area */}
                                    <div className="grow overflow-y-auto pr-2 mb-2">
                                        {/* "Load More" Button for pagination */}
                                        {hasMoreMessages[selectedAssignment.assignmentId] && (
                                            <div className="text-center py-2">
                                                <button
                                                    onClick={handleLoadMoreMessages}
                                                    className="text-primary text-sm hover:underline"
                                                    disabled={isChatLoading}
                                                >
                                                    {isChatLoading ? 'Loading...' : 'Load Older Messages'}
                                                </button>
                                            </div>
                                        )}
                                        {(messages[selectedAssignment.assignmentId] || []).length ===
                                            0 && !isChatLoading ? (
                                            <div className="text-muted-foreground text-center mt-10">
                                                No messages found. Start a conversation!
                                            </div>
                                        ) : (
                                            (messages[selectedAssignment.assignmentId] || []).map(
                                                (msg) => {
                                                    const isUser = msg.sender.id === userId;
                                                    const senderName = isUser
                                                        ? username
                                                        : msg.sender.username || msg.sender.first_name;

                                                    return (
                                                        <div
                                                            key={msg.id}
                                                            className={`flex items-end mb-2 ${isUser ? 'justify-end' : 'justify-start'
                                                                }`}
                                                        >
                                                            {!isUser && (
                                                                <div
                                                                    className="w-7 h-7 flex items-center justify-center rounded-full font-semibold text-xs select-none mr-2 text-brand-body"
                                                                    title={senderName}
                                                                >
                                                                    {getInitials(senderName)}
                                                                </div>
                                                            )}
                                                            <div
                                                                className={`max-w-[70%] p-2 rounded-2xl text-sm leading-tight
                                            ${isUser
                                                                        ? 'text-card-foreground rounded-tr-sm'
                                                                        : 'text-brand-body rounded-tl-sm'
                                                                    }
                                            ${msg.isOptimistic ? 'opacity-70' : 'opacity-100'}
                                            `}
                                                            >
                                                                {msg.message}
                                                                <div
                                                                    className={`text-[10px] mt-1 text-right
                                                ${isUser ? 'text-card-foreground/70' : 'text-muted-foreground'}`}
                                                                >
                                                                    {msg.createdAt.toLocaleTimeString([], {
                                                                        hour: '2-digit',
                                                                        minute: '2-digit',
                                                                    })}
                                                                </div>
                                                            </div>
                                                            {isUser && (
                                                                <div
                                                                    className="w-7 h-7 flex items-center justify-center  bg-primary text-white rounded-full font-semibold text-xs select-none ml-2"
                                                                    title={username}
                                                                >
                                                                    {getInitials(username)}
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                }
                                            )
                                        )}
                                        <div ref={messagesEndRef} />
                                    </div>

                                    {/* Message Input Area */}
                                    <div className="flex border-t border-border pt-2">
                                        <input
                                            type="text"
                                            placeholder="Type a message..."
                                            value={input}
                                            onChange={(e) => setInput(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                                            className="flex-grow rounded-full border border-border px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                                            disabled={!selectedAssignment || userId === null || isChatLoading}
                                        />
                                        <button
                                            onClick={sendMessage}
                                            aria-label="Send message"
                                            className="ml-2 text-card-foreground rounded-full w-9 h-9 flex items-center justify-center cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
                                            disabled={!selectedAssignment || !input.trim() || userId === null || isChatLoading}
                                        >
                                            <HugeiconsIcon icon={BubbleChatAddIcon} className="h-6 w-6" />
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}