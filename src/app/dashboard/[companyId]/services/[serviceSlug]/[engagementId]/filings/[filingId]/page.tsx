"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  FileIcon,
  Download,
  ExternalLink,
  MessageSquare,
  User,
  CornerDownRight,
  Paperclip,
  X,
  Send, 
  Lock,
  RefreshCw
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  getFilingById,
  getFilingComments,
  addFilingComment,
  type FilingItem,
  type FilingCommentItem
} from "@/api/filingService";

function formatTs(ts: string) {
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return ts;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: '2-digit', minute: '2-digit' });
}

export default function ClientFilingDetailView() {
  const params = useParams();
  const router = useRouter();
  
  const companyId = params.companyId as string;
  const serviceSlug = params.serviceSlug as string;
  const engagementId = params.engagementId as string;
  const filingId = params.filingId as string;

  const [filing, setFiling] = useState<FilingItem | null>(null);
  const [comments, setComments] = useState<FilingCommentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Comment state
  const [newComment, setNewComment] = useState("");
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);
  const [isAttachMenuOpen, setIsAttachMenuOpen] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  useEffect(() => {
    if (engagementId && filingId) {
      loadData();
    }
  }, [engagementId, filingId]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [filingData, commentsData] = await Promise.all([
        getFilingById(engagementId, filingId),
        getFilingComments(engagementId, filingId)
      ]);
      setFiling(filingData);
      setComments(commentsData);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to load filing details");
    } finally {
      setIsLoading(false);
    }
  };

  const reloadComments = async () => {
    try {
      const commentsData = await getFilingComments(engagementId, filingId);
      setComments(commentsData);
    } catch (error: any) {
      console.error(error);
    }
  };

  const handleBack = () => {
    router.push(`/dashboard/${companyId}/services/${serviceSlug}/${engagementId}`);
  };

  const handleSendComment = async () => {
    if (!newComment.trim() || isLocked) return;
    setIsSubmittingComment(true);
    try {
      await addFilingComment(
        engagementId, 
        filingId, 
        newComment, 
        undefined, 
        selectedFileIds
      );
      setNewComment("");
      setSelectedFileIds([]);
      setIsAttachMenuOpen(false);
      toast.success("Comment added");
      await reloadComments();
    } catch (error: any) {
      toast.error(error?.message || "Failed to add comment");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 space-y-8 animate-in fade-in duration-500">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 bg-slate-100 rounded-xl animate-pulse" />
          <div className="space-y-2 flex-1">
            <div className="h-6 bg-slate-100 rounded w-1/4 animate-pulse" />
            <div className="h-4 bg-slate-100 rounded w-1/3 animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-4">
            <div className="h-40 bg-slate-50 rounded-2xl animate-pulse border border-slate-100" />
            <div className="h-40 bg-slate-50 rounded-2xl animate-pulse border border-slate-100" />
          </div>
          <div className="h-[600px] bg-slate-50 rounded-2xl animate-pulse border border-slate-100" />
        </div>
      </div>
    );
  }

  if (!filing) {
    return (
      <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-200">
        <div className="h-16 w-16 bg-slate-50 flex items-center justify-center rounded-full mx-auto mb-4 text-slate-400">
          <AlertCircle size={32} />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Filing not found</h2>
        <p className="text-slate-500 mt-2 mb-6">This filing may have been deleted or you don't have access to it.</p>
        <Button onClick={handleBack} variant="outline" className="rounded-xl">Go Back</Button>
      </div>
    );
  }

  const isLocked = filing.status === 'FILED';
  
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'FILED': return { label: "Filed", icon: <CheckCircle2 size={12} className="mr-1.5" />, className: "bg-emerald-50 text-emerald-600 border-emerald-100" };
      case 'CLIENT_REVIEW': return { label: "In Review", icon: <Clock size={12} className="mr-1.5" />, className: "bg-indigo-50 text-indigo-600 border-indigo-100" };
      case 'CANCELLED': return { label: "Cancelled", icon: <AlertCircle size={12} className="mr-1.5" />, className: "bg-red-50 text-red-600 border-red-100" };
      default: return { label: "Draft", icon: <Clock size={12} className="mr-1.5" />, className: "bg-amber-50 text-amber-600 border-amber-100" };
    }
  };

  const statusCfg = getStatusConfig(filing.status);

  const renderComment = (comment: any, isReply = false) => {
    return (
    <div key={comment.id} className={cn("flex gap-3 group", isReply ? "ml-8 mt-3 relative" : "")}>
      {isReply && (
        <div className="absolute left-[-22px] top-4 w-5 h-5 border-l-2 border-b-2 border-slate-200 rounded-bl-xl opacity-50" />
      )}
      <div className="h-8 w-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-primary shadow-sm shrink-0 z-10">
        <User size={16} />
      </div>
      <div className="flex-1 space-y-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <p className="text-xs font-bold text-slate-900">
              {comment.user?.firstName} {comment.user?.lastName}
            </p>
            {comment.user?.role !== 'CLIENT' && (
              <Badge variant="secondary" className="bg-amber-50 text-amber-600 border-amber-100 text-[8px] h-4 font-black uppercase tracking-tighter px-1.5 py-0">
                Staff
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <p className="text-[10px] font-medium text-slate-400">
              {formatTs(comment.createdAt)}
            </p>
          </div>
        </div>
        <div className={cn(
          "p-3 rounded-2xl rounded-tl-none border shadow-sm",
          "bg-white border-slate-100"
        )}>
          <p className="text-xs text-slate-700 leading-relaxed font-medium whitespace-pre-wrap">{comment.comment}</p>
          
          {/* Referenced Files */}
          {comment.referencedFileIds && comment.referencedFileIds.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {comment.referencedFileIds.map((fileId: string) => {
                const fileView = filing?.files.find((f: any) => f.fileId === fileId);
                if (!fileView) return null;
                return (
                  <div key={fileId} className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 border border-slate-200 shadow-sm rounded-lg text-[9px] font-black uppercase tracking-widest text-slate-600 cursor-pointer hover:border-primary/30 transition-colors" onClick={() => window.open(fileView.file.url, "_blank")}>
                    <Paperclip size={10} className="text-primary" />
                    <span className="truncate max-w-[150px]">{fileView.file.file_name}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Nested Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="space-y-3 pt-1">
            {comment.replies.map((reply: any) => renderComment(reply, true))}
          </div>
        )}
      </div>
    </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      {/* Header */}
      <div className="flex items-start justify-between bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-col gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleBack}
            className="w-fit text-slate-500 hover:text-slate-900 gap-2 h-8 px-3 rounded-full hover:bg-slate-100 -ml-2 text-[10px] font-black uppercase tracking-widest transition-colors"
          >
            <ArrowLeft size={14} /> Back to Filings
          </Button>
          
          <div className="space-y-1 pl-1">
            <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">{filing.name}</h1>
            <p className="text-xs font-medium text-slate-400">Created on {formatTs(filing.createdAt)}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={isLoading}
            className="h-9 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest gap-2 border-slate-200 hover:bg-slate-50 transition-all text-slate-500 hover:text-primary shadow-sm"
          >
            <RefreshCw size={14} className={cn(isLoading && "animate-spin")} />
            Refresh
          </Button>

          <Badge variant="outline" className={cn("px-4 py-1.5 text-xs font-black uppercase tracking-widest rounded-xl shadow-sm", statusCfg.className)}>
            {statusCfg.icon} {statusCfg.label}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Files */}
        <div className="h-[500px]">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between shrink-0">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <FileIcon size={14} /> Attached Documents
              </h3>
              <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 transition-colors uppercase font-black text-[10px] tracking-widest px-2 py-0 border-none">
                {filing.files.length} Files
              </Badge>
            </div>
            <div className="divide-y divide-slate-100 bg-white overflow-y-auto custom-scrollbar flex-1">
              {filing.files.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                    <FileIcon size={32} />
                  </div>
                  <p className="text-sm font-semibold text-slate-700">No documents attached.</p>
                </div>
              ) : (
                filing.files.map((fv) => (
                  <div key={fv.id} className="p-4 hover:bg-slate-50/50 transition-colors flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-primary/5 group-hover:text-primary transition-colors">
                        <FileIcon size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-sm text-slate-900">{fv.file.file_name}</p>
                        <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-black">
                          {fv.file.file_size ? `${(fv.file.file_size / 1024).toFixed(1)} KB` : 'Document'}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-9 w-9 rounded-full hover:bg-slate-200 text-slate-600 transition-colors"
                              onClick={() => {
                                const link = document.createElement('a');
                                link.href = fv.file.url;
                                link.download = fv.file.file_name;
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                              }}
                            >
                              <Download size={16} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent className="bg-slate-900 text-white rounded-xl text-xs font-bold py-1 px-3">
                            Download
                          </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-9 w-9 rounded-full hover:bg-slate-200 text-slate-600 transition-colors"
                              onClick={() => window.open(fv.file.url, "_blank")}
                            >
                              <ExternalLink size={16} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent className="bg-slate-900 text-white rounded-xl text-xs font-bold py-1 px-3">
                            View
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Discussion */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[500px] overflow-hidden">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50 shrink-0">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <MessageSquare size={14} /> Discussion Thread
            </h3>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-slate-50/30">
            {comments.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <div className="h-16 w-16 bg-white border border-slate-100 shadow-sm rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                  <MessageSquare size={32} />
                </div>
                <p className="text-sm font-bold text-slate-700">No comments yet.</p>
                <p className="text-xs font-medium text-slate-400 mt-1">Start a conversation regarding this filing.</p>
              </div>
            ) : (
              comments.map((comment: any) => renderComment(comment))
            )}
          </div>

          <div className="p-5 border-t border-slate-100 bg-white shrink-0 space-y-4">
            {isLocked && (
              <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl flex items-center gap-2 text-amber-700 text-xs font-bold shadow-sm">
                <Lock size={14} />
                This filing is closed. No further comments can be added.
              </div>
            )}

            {!isLocked && (
              <>
                {selectedFileIds.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {selectedFileIds.map(fileId => {
                      const fileView = filing?.files.find((f: any) => f.fileId === fileId);
                      if (!fileView) return null;
                      return (
                        <div key={fileId} className="flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-[9px] font-black uppercase text-slate-600 shadow-sm">
                          <Paperclip size={10} className="text-primary" />
                          <span className="truncate max-w-[120px]">{fileView.file.file_name}</span>
                          <button onClick={() => setSelectedFileIds(prev => prev.filter(id => id !== fileId))} className="ml-1 text-slate-400 hover:text-red-500 transition-colors">
                            <X size={10} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="flex items-center gap-2 mb-3">
                  <div className="relative">
                    <Button
                      size="sm"
                      variant="ghost"
                      className={cn(
                        "h-8 px-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all gap-1.5",
                        isAttachMenuOpen ? "bg-slate-200 text-slate-700" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                      )}
                      onClick={() => setIsAttachMenuOpen(!isAttachMenuOpen)}
                    >
                      <Paperclip size={12} /> Attach Files
                    </Button>

                    {isAttachMenuOpen && (
                      <div className="absolute bottom-full left-0 mb-2 w-[280px] bg-white rounded-2xl border border-slate-200 shadow-xl p-3 z-50">
                        <div className="flex items-center justify-between mb-2 px-1">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select files</p>
                          <button onClick={() => setIsAttachMenuOpen(false)} className="text-slate-400 hover:text-slate-700">
                            <X size={12} />
                          </button>
                        </div>
                        
                        <div className="max-h-[160px] overflow-y-auto space-y-1 custom-scrollbar">
                          {filing?.files.length === 0 ? (
                            <p className="text-xs text-slate-400 p-2">No files available.</p>
                          ) : (
                            filing?.files.map((fileView: any) => (
                              <label key={fileView.fileId} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-xl cursor-pointer group transition-colors">
                                <Checkbox 
                                  checked={selectedFileIds.includes(fileView.fileId)}
                                  onCheckedChange={(checked) => {
                                    if (checked) setSelectedFileIds(prev => [...prev, fileView.fileId]);
                                    else setSelectedFileIds(prev => prev.filter(id => id !== fileView.fileId));
                                  }}
                                  className="border-slate-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                />
                                <FileIcon size={12} className="text-slate-400 group-hover:text-primary transition-colors shrink-0" />
                                <span className="text-xs font-semibold text-slate-700 truncate">{fileView.file.file_name}</span>
                              </label>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="relative flex items-center mt-3">
                  <Input 
                    placeholder="Write a message..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendComment()}
                    className="h-12 pl-4 pr-12 rounded-2xl border-slate-200 bg-slate-50 focus-visible:ring-1 focus-visible:ring-primary/20 transition-all font-medium text-sm shadow-inner"
                  />
                  <Button 
                    size="icon" 
                    className="absolute right-1 w-10 h-10 rounded-xl bg-primary hover:bg-primary/90 text-white shadow-md transition-all shadow-primary/20"
                    disabled={!newComment.trim() || isSubmittingComment}
                    onClick={handleSendComment}
                  >
                    <Send size={16} className={cn("transition-transform", isSubmittingComment ? "translate-x-1 opacity-80" : "")} />
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
