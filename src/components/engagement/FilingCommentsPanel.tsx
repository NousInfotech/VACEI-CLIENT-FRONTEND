"use client";

import { useState, useEffect } from "react";
import { 
  Send, 
  MessageSquare,
  User,
  Lock
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Modal } from "../ui/modal";
import { Input } from "../ui/input";
import { 
  getFilingComments, 
  addFilingComment, 
  type FilingItem, 
  type FilingCommentItem 
} from "../../api/filingService";

interface FilingCommentsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  filing: FilingItem;
  engagementId: string;
}

export default function FilingCommentsPanel({ 
  isOpen, 
  onClose, 
  filing,
  engagementId
}: FilingCommentsPanelProps) {
  const [comments, setComments] = useState<FilingCommentItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadComments();
    }
  }, [isOpen, filing.id]);

  const loadComments = async () => {
    setIsLoading(true);
    try {
      const data = await getFilingComments(engagementId, filing.id);
      setComments(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load comments");
    } finally {
      setIsLoading(false);
    }
  };

  const isLocked = filing.status === 'FILED';

  const handleSend = async () => {
    if (!newComment.trim() || isSubmitting || isLocked) return;
    setIsSubmitting(true);
    try {
      await addFilingComment(engagementId, filing.id, newComment);
      setNewComment("");
      toast.success("Comment added");
      loadComments();
    } catch (error: any) {
      toast.error(error?.message || "Failed to add comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Comments: ${filing.name}`} size="wide">
      <div className="flex flex-col h-[500px]">
        {isLocked && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-100 rounded-lg flex items-center gap-2 text-amber-700 text-xs font-bold">
            <Lock size={14} />
            This filing is closed. No further comments can be added.
          </div>
        )}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/10 rounded-lg mb-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="text-xs font-semibold uppercase tracking-wider">Loading thread...</p>
            </div>
          ) : comments.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <div className="h-16 w-16 rounded-full bg-background flex items-center justify-center text-muted-foreground mb-4 shadow-sm border border-border">
                <MessageSquare size={24} />
              </div>
              <p className="text-sm font-semibold text-brand-body">No comments yet</p>
              <p className="text-xs text-muted-foreground mt-1 font-medium">Be the first to start the conversation.</p>
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <div className="h-8 w-8 rounded-full bg-background border border-border flex items-center justify-center text-primary shadow-sm flex-shrink-0">
                  <User size={16} />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-brand-body">
                      {comment.user?.firstName} {comment.user?.lastName}
                    </p>
                    <p className="text-[10px] font-medium text-muted-foreground">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="bg-background p-3 rounded-xl rounded-tl-none border border-border shadow-sm">
                    <p className="text-sm text-brand-body leading-relaxed font-medium">{comment.comment}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {!isLocked && (
          <div className="relative group shrink-0">
            <Input 
              placeholder="Write a comment..." 
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="h-12 pl-4 pr-12 rounded-xl border-border bg-background focus:ring-1 focus:ring-primary/20 transition-all text-sm font-medium"
            />
            <Button 
              size="icon" 
              variant="ghost"
              className="absolute right-1 top-1 h-10 w-10 text-primary hover:bg-primary/5 transition-all"
              disabled={!newComment.trim() || isSubmitting}
              onClick={handleSend}
            >
              <Send size={18} />
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
}
