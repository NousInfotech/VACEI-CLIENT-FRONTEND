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
  replyToMessageId?: string | null;
  replyToMessage?: ChatMessage | null;
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
  // Optional UI-only flags to align with global chat behaviour
  isDeleted?: boolean;
  reactions?: Record<string, string[]>;
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

/** Room member from backend */
export interface ClientRoomMember {
  userId: string;
  user?: { id?: string; firstName?: string; lastName?: string; email?: string };
}

/** Shape returned by GET /chat/client/rooms */
export interface ClientChatRoom {
  id: string;
  title: string;
  contextType: "ENGAGEMENT" | "DIRECT" | "GROUP" | string;
  members?: ClientRoomMember[];
  lastMessage?: {
    content: string;
    type: "TEXT" | "FILE";
    sentAt: string;
    sender: {
      id?: string;
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

  private get hasSupabase(): boolean {
    return !!this.supabase;
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
    // Use backend API so we get sender { firstName, lastName } for display names.
    const params = new URLSearchParams({ limit: String(limit) });
    if (cursor) params.append("cursor", cursor);
    return this.request<ClientMessagesResponse>(
      "GET",
      `chat/client/rooms/${roomId}/messages?${params}`
    );
  }

  // ── Generic (partner / admin) endpoints ────────────────────────────────

  async getMessages(roomId: string, cursor?: string): Promise<MessagesResponse> {
    // When Supabase is available, read directly from ChatMessage so
    // history matches what realtime inserts into.
    if (this.hasSupabase) {
      const roomUuid = this.toUuidIfBase64(roomId);
      const { data, error } = await (this.supabase as any)
        .from("ChatMessage")
        .select("*")
        .eq("roomId", roomUuid)
        .order("sentAt", { ascending: true })
        .limit(50);

      if (error) {
        throw error;
      }

      // Supabase can return timestamp strings without timezone info.
      // Normalize to ISO-with-zone so UI displays correct local time.
      const normalized = (data || []).map((row: any) => normalizeRealtimePayload(row)) as any;
      return {
        data: normalized as ChatMessage[],
      };
    }

    // Fallback to backend API
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
    fileUrl?: string,
    options?: { replyToMessageId?: string | null }
  ): Promise<ChatMessage | null> {
    const userId = this.getCurrentUserId();
    if (!userId) throw new Error("Not authenticated");

    const replyToMessageId = options?.replyToMessageId ?? null;

    if (this.supabase) {
      const message: Record<string, unknown> = {
        roomId: this.toUuidIfBase64(roomId),
        senderId: userId,
        content: content || null,
        fileUrl: fileUrl || null,
        type: fileUrl ? "FILE" : "TEXT",
        sentAt: new Date().toISOString(),
      };
      if (replyToMessageId) message.replyToMessageId = replyToMessageId;

      const { data, error } = await (this.supabase as any)
        .from("ChatMessage")
        .insert([message])
        .select()
        .single();

      if (error) throw error;
      const msg = normalizeRealtimePayload(data as any) as unknown as ChatMessage;
      this.notifyRoomMembers(roomId, content || "", msg?.id).catch(() => { });
      return msg;
    }

    const body: Record<string, unknown> = {
      content,
      fileUrl: fileUrl || null,
      type: fileUrl ? "FILE" : "TEXT",
    };
    if (replyToMessageId) body.replyToMessageId = replyToMessageId;

    const res = await this.request<{ data: ChatMessage }>("POST", `chat/rooms/${roomId}/messages`, body);
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

  async clearRoom(roomId: string): Promise<void> {
    await this.request("DELETE", `chat/rooms/${roomId}/messages`);
  }

  /** Notify room members of a new message (call after Supabase direct insert). */
  async notifyRoomMembers(roomId: string, content: string, messageId?: string): Promise<void> {
    try {
      await this.request("POST", `chat/rooms/${roomId}/notify-members`, { content, messageId });
    } catch (e) {
      console.warn("Failed to notify room members:", e);
    }
  }

  async markRoomAsRead(roomId: string): Promise<void> {
    await this.request("PATCH", `chat/rooms/${roomId}/read`, {});
  }

  // ============ REALTIME ============

  subscribeToMessages(
    roomId: string,
    onMessageChange: (message: ChatMessage, eventType: 'INSERT' | 'UPDATE' | 'DELETE') => void
  ): RealtimeChannel | null {
    if (!this.supabase) return null;

    return this.supabase
      .channel(`room_${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "*", // Listen to INSERT, UPDATE, DELETE
          schema: "public",
          table: "ChatMessage",
          filter: `roomId=eq.${roomId}`,
        },
        (payload) => {
          const eventType = payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE';
          // For DELETE, there is only payload.old
          const raw = (eventType === 'DELETE' ? payload.old : payload.new) as Record<string, unknown>;
          const msg = normalizeRealtimePayload(raw) as unknown as ChatMessage;
          onMessageChange(msg, eventType);
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

/** Normalize Supabase Realtime payload to match ChatMessage shape (sentAt for correct timestamp display). */
function normalizeRealtimePayload(raw: Record<string, unknown>): Record<string, unknown> {
  const r = raw || {};
  const sentAtRaw =
    r.sentAt ??
    r.sent_at ??
    (r as any).sentat ??
    // Fallbacks: many tables store createdAt/created_at instead of sentAt
    (r as any).createdAt ??
    (r as any).created_at ??
    (r as any).insertedAt ??
    (r as any).inserted_at;
  let sentAt: string;
  if (typeof sentAtRaw === 'string') {
    sentAt = String(sentAtRaw).trim().replace(' ', 'T');
    if (!sentAt.endsWith('Z') && !/[+-]\d{2}(:?\d{2})?$/.test(sentAt)) {
      sentAt += 'Z';
    }
  } else if (typeof sentAtRaw === 'number') {
    sentAt = sentAtRaw < 1e12 ? new Date(sentAtRaw * 1000).toISOString() : new Date(sentAtRaw).toISOString();
  } else {
    sentAt = new Date().toISOString();
  }
  return {
    ...r,
    id: r.id ?? (r as any).id,
    roomId: r.roomId ?? (r as any).room_id,
    senderId: r.senderId ?? (r as any).sender_id,
    content: r.content,
    fileUrl: r.fileUrl ?? (r as any).file_url,
    type: r.type,
    sentAt,
    replyToMessageId: r.replyToMessageId ?? (r as any).reply_to_message_id ?? null,
  };
}

export const chatService = new ChatService();
