/**
 * Chat Service - Supabase Realtime + REST API
 * 100% Supabase Realtime for messages & member status (no polling)
 */

import { createClient, type RealtimeChannel } from "@supabase/supabase-js";

const backendUrl =
  process.env.NEXT_PUBLIC_VACEI_BACKEND_URL?.replace(/\/?$/, "/") ||
  "http://localhost:5000/api/v1/";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

function getAuthHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("token") || "";
  const activeCompanyId = localStorage.getItem("vacei-active-company") || "";
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
  if (activeCompanyId) {
    headers["X-Company-Id"] = activeCompanyId;
  }
  return headers;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  content: string | null;
  fileUrl: string | null;
  type: "TEXT" | "FILE";
  sentAt: string;
  sender?: {
    id: string;
    firstName?: string;
    lastName?: string;
  };
  participantStates?: Array<{
    userId: string;
    status: "SENT" | "DELIVERED" | "READ";
    readAt: string | null;
  }>;
}

export interface ChatMember {
  userId: string;
  firstName: string;
  lastName: string;
  lastSeenAt: string | null;
  isOnline: boolean;
  status: "online" | "offline" | "away";
}

export interface MessagesResponse {
  data: ChatMessage[];
  meta?: {
    nextCursor?: string | null;
    hasMore?: boolean;
  };
}

/** Shape returned by GET /chat/client/rooms */
export interface ClientChatRoom {
  id: string;
  title: string;
  contextType: "ENGAGEMENT" | "DIRECT" | "GROUP" | string;
  lastMessage?: {
    content: string;
    type: "TEXT" | "FILE";
    sentAt: string;
    sender: {
      firstName: string;
      lastName: string;
    };
  } | null;
}

export interface ClientRoomsResponse {
  success: boolean;
  data: ClientChatRoom[];
  message?: string;
}

export interface ClientMessagesResponse {
  success: boolean;
  data: ChatMessage[];
  meta: {
    nextCursor: string | null;
    hasMore: boolean;
  };
  message?: string;
}

export interface ChatRoom {
  id: string;
  name: string;
  type: "INDIVIDUAL" | "GROUP";
  members: ChatMember[];
  lastMessage?: ChatMessage | null;
  unreadCount: number;
  isPinned?: boolean;
  isMuted?: boolean;
  contextType?: string;
  engagementId?: string | null;
  createdAt?: string;
}

export interface RoomsResponse {
  data: ChatRoom[];
}

export interface RoomResponse {
  data: {
    id: string;
    name?: string;
    members?: ChatMember[];
    [k: string]: unknown;
  };
}

class ChatService {
  private supabase: ReturnType<typeof createClient> | null = null;

  constructor() {
    if (supabaseUrl && supabaseAnonKey && typeof window !== "undefined") {
      this.supabase = createClient(supabaseUrl, supabaseAnonKey);
    }
  }

  public setAccessToken(token: string) {
    if (this.supabase) {
      this.supabase.realtime.setAuth(token);
    }
  }

  private getCurrentUserId(): string | null {
    if (typeof window === "undefined") return null;
    const raw =
      localStorage.getItem("user_id") || localStorage.getItem("userId") || null;
    return raw ? this.toUuidIfBase64(raw) : null;
  }

  /** Decode base64 to UUID when needed (auth stores user_id as btoa(id)) */
  private toUuidIfBase64(value: string): string {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(value)) return value;
    try {
      const decoded = atob(value);
      if (uuidRegex.test(decoded)) return decoded;
    } catch {
      /* not base64 */
    }
    return value;
  }

  private async request<T>(
    method: string,
    endpoint: string,
    data?: unknown
  ): Promise<T> {
    const res = await fetch(`${backendUrl}${endpoint}`, {
      method,
      headers: getAuthHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || err.error || `API Error: ${res.status}`);
    }
    return res.json();
  }

  // ============ REST API ============

  // ── Client-specific endpoints ──────────────────────────────────────────

  /** GET /chat/client/rooms — rooms list for the logged-in client */
  async getClientRooms(): Promise<ClientRoomsResponse> {
    return this.request<ClientRoomsResponse>("GET", "chat/client/rooms");
  }

  /** GET /chat/client/rooms/:roomId/messages?limit=N — messages for a client room */
  async getClientRoomMessages(
    roomId: string,
    limit = 50,
    cursor?: string
  ): Promise<ClientMessagesResponse> {
    const params = new URLSearchParams({ limit: String(limit) });
    if (cursor) params.append("cursor", cursor);
    return this.request<ClientMessagesResponse>(
      "GET",
      `chat/client/rooms/${roomId}/messages?${params}`
    );
  }

  // ── Generic (partner / admin) endpoints ────────────────────────────────

  async getMessages(roomId: string, cursor?: string): Promise<MessagesResponse> {
    const params = new URLSearchParams({ limit: "50" });
    if (cursor) params.append("cursor", cursor);
    return this.request<MessagesResponse>(
      "GET",
      `chat/rooms/${roomId}/messages?${params}`
    );
  }

  async getUnreadCount(roomId: string): Promise<{ data: { unreadCount: number } }> {
    return this.request("GET", `chat/rooms/${roomId}/unread-count`);
  }

  async getUnreadSummary(): Promise<{ data: unknown }> {
    return this.request("GET", "chat/unread-summary");
  }

  async getRooms(): Promise<RoomsResponse> {
    return this.request("GET", "chat/rooms");
  }

  async getRoomById(roomId: string): Promise<RoomResponse> {
    return this.request("GET", `chat/rooms/${roomId}`);
  }

  async updateRoomPin(roomId: string, isPinned: boolean): Promise<void> {
    await this.request("PATCH", `chat/rooms/${roomId}/pin`, { isPinned });
  }

  async updateRoomMute(roomId: string, isMuted: boolean): Promise<void> {
    await this.request("PATCH", `chat/rooms/${roomId}/mute`, { isMuted });
  }

  async editMessage(messageId: string, content: string): Promise<void> {
    await this.request("PATCH", `chat/messages/${messageId}`, { content });
  }

  async addReaction(messageId: string, emoji: string): Promise<void> {
    await this.request("POST", `chat/messages/${messageId}/react`, { emoji });
  }

  async removeReaction(messageId: string): Promise<void> {
    await this.request("DELETE", `chat/messages/${messageId}/react`);
  }

  /**
   * Get the chat room for an engagement. Use the returned room.id for all chat operations.
   * Requires CLIENT to be in engagement.orgTeam.
   */
  async getRoomByEngagementId(engagementId: string): Promise<RoomResponse> {
    return this.request("GET", `chat/engagements/${engagementId}/room`);
  }

  /**
   * Create or get a DIRECT chat room between the current user and a partner.
   * Use when CLIENT wants 1-on-1 with PARTNER without engagement access.
   */
  async createDirectRoom(partnerId: string, title?: string): Promise<RoomResponse> {
    const userId = this.getCurrentUserId();
    if (!userId) throw new Error("Not authenticated");

    const memberIds = [userId, partnerId].sort();
    const res = await this.request<RoomResponse>("POST", "chat/rooms", {
      title: title ?? "Direct chat",
      contextType: "DIRECT",
      memberIds,
    });
    return res;
  }

  async sendMessage(
    roomId: string,
    content: string,
    fileUrl?: string
  ): Promise<ChatMessage | null> {
    const userId = this.getCurrentUserId();
    if (!userId) throw new Error("Not authenticated");

    if (this.supabase) {
      const message = {
        roomId: this.toUuidIfBase64(roomId),
        senderId: userId,
        content: content || null,
        fileUrl: fileUrl || null,
        type: fileUrl ? "FILE" : "TEXT",
        sentAt: new Date().toISOString(),
      };

      const { data, error } = await (this.supabase as any)
        .from("ChatMessage")
        .insert([message])
        .select()
        .single();

      if (error) throw error;
      return data as ChatMessage;
    }

    const res = await this.request<{ data: ChatMessage }>("POST", `chat/rooms/${roomId}/messages`, {
      content,
      fileUrl: fileUrl || null,
      type: fileUrl ? "FILE" : "TEXT",
    });
    return res.data ?? null;
  }

  async uploadFile(file: File): Promise<{ data: { fileUrl: string } }> {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${backendUrl}chat/upload`, {
      method: "POST",
      headers: { Authorization: getAuthHeaders().Authorization },
      body: formData,
    });

    if (!res.ok) throw new Error("Upload failed");
    return res.json();
  }

  async deleteMessage(messageId: string): Promise<void> {
    await this.request("DELETE", `chat/messages/${messageId}`);
  }

  async markRoomAsRead(roomId: string): Promise<void> {
    await this.request("PATCH", `chat/rooms/${roomId}/read`, {});
  }

  // ============ REALTIME ============

  subscribeToMessages(
    roomId: string,
    onNewMessage: (message: ChatMessage) => void
  ): RealtimeChannel | null {
    if (!this.supabase) return null;

    return this.supabase
      .channel(`room_${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "ChatMessage",
          filter: `roomId=eq.${roomId}`,
        },
        (payload) => {
          onNewMessage(payload.new as ChatMessage);
        }
      )
      .subscribe((status) => {
        console.log(`🔥 REALTIME MSG SUBSCRIPTION STATUS: ${status} for room ${roomId}`);
      }) as RealtimeChannel;
  }

  subscribeToMemberStatus(
    roomId: string,
    onStatusChange: (member: ChatMember) => void
  ): RealtimeChannel | null {
    if (!this.supabase) return null;

    const ONLINE_THRESHOLD = 30 * 60 * 1000; // 30 minutes

    return this.supabase
      .channel(`room_status_${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "ChatRoomMember",
          filter: `roomId=eq.${roomId}`,
        },
        (payload) => {
          const member = payload.new as {
            userId: string;
            lastSeenAt: string | null;
            user?: { firstName?: string; lastName?: string };
          };
          const lastSeen = member.lastSeenAt ? new Date(member.lastSeenAt) : null;
          const now = new Date();
          const isOnline =
            lastSeen
              ? now.getTime() - lastSeen.getTime() < ONLINE_THRESHOLD
              : false;

          onStatusChange({
            userId: member.userId,
            firstName: member.user?.firstName || "",
            lastName: member.user?.lastName || "",
            lastSeenAt: member.lastSeenAt,
            isOnline,
            status: isOnline ? "online" : "offline",
          });
        }
      )
      .subscribe((status) => {
        console.log(`🔥 REALTIME MEMBER SUBSCRIPTION STATUS: ${status} for room ${roomId}`);
      }) as RealtimeChannel;
  }
}

export const chatService = new ChatService();
