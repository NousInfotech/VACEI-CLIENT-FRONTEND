// commentUtils.ts

export interface Attachment {
  id: number;
  filename: string;
  mimetype: string;
  size: number;
  filepath: string;
  uploadedAt: string;
}

export interface CommentedBy {
  id: number;
  first_name: string;
  last_name: string;
  username: string; // This is required
  email: string;    // This is required
  name: string;
}

export interface Comment {
  id: number;
  taskId: number;
  commentedById: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  commentedBy: CommentedBy;
  attachments: Attachment[];
  sender?: "self" | "other";
}

export function mergeComments(existing: Comment[], incoming: Comment[]): Comment[] {
  const existingIds = new Set(existing.map(m => m.id));
  const filtered = incoming.filter(m => !existingIds.has(m.id));
  return [...existing, ...filtered].sort((a, b) =>
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
}

export function mapComments(raw: any[], userId: number): Comment[] {
  return (raw ?? []).map((c) => {
    const cb = c.commentedBy ?? {};

    const username: string =
      cb.username ??
      cb.email ??
      cb.name ??
      (typeof c.commentedById === "number" ? `User ${c.commentedById}` : "Unknown user");

    const name: string = cb.name ?? username;

    return {
      id: c.id,
      comment: c.comment,
      commentedById: c.commentedById,
      createdAt: c.createdAt,
      attachments: c.attachments
        ? c.attachments.map((att: any) => ({
            id: att.id,
            filename: att.filename,
            mimetype: att.mimetype,
            size: att.size,
            filepath: att.filepath,
            uploadedAt: att.uploadedAt,
          }))
        : [],
      commentedBy: {
        id: cb.id ?? c.commentedById,
        first_name: cb.first_name ?? "",
        last_name: cb.last_name ?? "",
        username,
        email: cb.email ?? "",
        name,
      },
      sender: c.commentedById === userId ? "self" : "other",
      taskId: c.taskId,
      updatedAt: c.updatedAt,
      deletedAt: c.deletedAt,
    };
  });
}