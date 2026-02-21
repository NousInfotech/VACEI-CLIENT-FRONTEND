export type UserRole = 'PLATFORM_ADMIN' | 'PLATFORM_EMPLOYEE';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  isOnline: boolean;
  lastSeen?: string;
}

export interface Message {
  id: string;
  senderId: string;
  senderName?: string; // resolved display name (undefined for 'me', partner name for others)
  type?: 'text' | 'gif' | 'image' | 'document';
  text?: string;
  gifUrl?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
  /** ID of the message being replied to (backend: replyToMessageId) */
  replyToId?: string;
  replyToMessageId?: string | null;
  /** Resolved reply message for display (text, fileName, etc.) */
  replyToMessage?: Message | null;
  isEdited?: boolean;
  reactions?: Record<string, string[]>; // emoji -> array of userIds
  isDeleted?: boolean;
  createdAt?: number; // Timestamp in milliseconds for edit window calculation
}

export type ChatType = 'INDIVIDUAL' | 'GROUP';

export interface Chat {
  id: string;
  type: ChatType;
  name: string;
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
  isPinned?: boolean;
  isMuted?: boolean;
  messages: Message[];
}
