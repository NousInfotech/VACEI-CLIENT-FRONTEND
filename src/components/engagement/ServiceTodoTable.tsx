"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Filter, Calendar, CheckCircle2, Clock, AlertCircle, User, ExternalLink, Plus } from "lucide-react";
import { ShadowCard } from "@/components/ui/ShadowCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { TodoItem, updateTodoStatus } from "@/api/todoService";
import { useGlobalDashboard } from "@/context/GlobalDashboardContext";
import { useActiveCompany } from "@/context/ActiveCompanyContext";
import { SERVICE_METADATA } from "@/lib/menuData";
import { format } from "date-fns";

const resolveServiceEngagementBase = (service?: string) => {
  if (!service) return "";
  const normalized = service.toUpperCase().replace(/[-\s&]/g, "_");
  const metadataKey = (Object.keys(SERVICE_METADATA).find((k) =>
    normalized === k || normalized.includes(k)
  ) || "") as keyof typeof SERVICE_METADATA | "";
  if (!metadataKey) return "";
  return SERVICE_METADATA[metadataKey]?.href || "";
};

export const ServiceTodoTable = ({
  todos,
  loading,
  onOpen,
  hideHeader = false,
}: {
  todos: TodoItem[];
  loading: boolean;
  onOpen?: (todo: TodoItem) => void;
  hideHeader?: boolean;
}) => {
  const router = useRouter();
  const { refreshSidebar } = useGlobalDashboard();
  const { activeCompanyId } = useActiveCompany();
  const [filter, setFilter] = useState<'all' | 'ACTION_REQUIRED' | 'ACTION_TAKEN' | 'COMPLETED'>('all');

  const handleOpen = async (todo: TodoItem) => {
    if (onOpen) {
      onOpen(todo);
      return;
    }

    const type = (todo.type || "").toUpperCase();
    const serviceBase = resolveServiceEngagementBase(todo.service);
    
    if (type === "CUSTOM") {
      router.push(`/dashboard/todo-list/todo-list-view?taskId=${btoa(todo.id)}`);
      return;
    } 

    const base = todo.engagementId ? (
      serviceBase 
        ? `${serviceBase.replace('/dashboard/', `/dashboard/${activeCompanyId}/`)}/engagements/${todo.engagementId}` 
        : `/dashboard/${activeCompanyId}/engagements/${todo.engagementId}`
    ) : null;

    if (
      (type === "DOCUMENT_REQUEST" || type === "REQUESTED_DOCUMENT") &&
      base
    ) {
      router.push(
        `${base}?tab=workFlow${
          todo.moduleId ? `&scrollTo=${todo.moduleId}&t=${Date.now()}` : ""
        }`
      );
    } else if (type === "CHAT" && base) {
      try {
        await updateTodoStatus(todo.id, "ACTION_TAKEN");
        refreshSidebar().catch(console.error);
      } catch (e) {
        console.error("Failed to auto-update chat todo status", e);
      }

      router.push(
        `${base}?tab=chat${
          todo.moduleId ? `&messageId=${todo.moduleId}` : ""
        }`
      );
    } else if (base) {
      router.push(base);
    } else {
      router.push(`/dashboard/todo-list/todo-list-view?taskId=${btoa(todo.id)}`);
    }
  };

  const filteredTodos = useMemo(() => {
    if (!todos) return [];
    if (filter === 'all') return todos;
    return todos.filter((t) => (t.status || '').toUpperCase() === filter);
  }, [todos, filter]);

  const getStatusIcon = (status?: string) => {
    const s = (status || '').toUpperCase();
    switch (s) {
      case 'COMPLETED': return <CheckCircle2 size={16} className="text-green-500" />;
      case 'ACTION_TAKEN': return <Clock size={16} className="text-blue-500" />;
      default: return <AlertCircle size={16} className="text-amber-500" />;
    }
  };

  const getStatusLabel = (status?: string) => {
    const s = (status || '').toUpperCase();
    switch (s) {
        case 'COMPLETED': return "Completed";
        case 'ACTION_TAKEN': return "Action Taken";
        default: return "Action Required";
    }
  };

  if (loading) {
    return (
        <div className="space-y-4">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full rounded-3xl" />)}
        </div>
    );
  }

  return (
    <div className={cn("space-y-6 p-2 pb-20 font-inter", hideHeader && "pb-4")}>
        {/* Header & Stats */}
        {!hideHeader && (
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Engagement Todos</h2>
                    <p className="text-sm text-gray-500">Manage and track tasks for this engagement</p>
                </div>
            </div>
        )}

        {hideHeader && (
            <div className="flex items-center justify-between h-10">
                <div>
                    <h3 className="text-lg font-bold text-gray-900 leading-none">Tasks</h3>
                    <p className="text-[10px] uppercase font-black tracking-widest text-gray-400 mt-1">To-do list for this workspace</p>
                </div>
            </div>
        )}

        {/* Filters */}
        <div className={cn("flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none", hideHeader && "gap-1.5")}>
            <Filter size={hideHeader ? 14 : 16} className="text-gray-400 shrink-0" />
            {(['all', 'ACTION_REQUIRED', 'ACTION_TAKEN', 'COMPLETED'] as const).map(f => (
                <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={cn(
                        "px-4 py-2 rounded-full text-xs font-bold capitalize transition-all shrink-0 border",
                        hideHeader && "px-3 py-1 text-[10px]",
                        filter === f 
                            ? "bg-gray-900 text-white border-gray-900 shadow-md" 
                            : "bg-white text-gray-500 border-gray-100 hover:bg-gray-50"
                    )}
                >
                    {f === 'all' ? 'All Tasks' : getStatusLabel(f)}
                </button>
            ))}
        </div>

        {/* Todo List */}
        <div className={cn("grid grid-cols-1 gap-4", hideHeader && "gap-3")}>
            {filteredTodos.length > 0 ? (
                filteredTodos.map((todo) => (
                    <ShadowCard key={todo.id} className={cn(
                        "group relative overflow-hidden bg-white border border-gray-100 rounded-4xl hover:shadow-xl transition-all duration-300",
                        hideHeader && "rounded-2xl"
                    )}>
                        <div className={cn("p-6", hideHeader && "p-4")}>
                            <div className="flex justify-between items-start gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className={cn(
                                            "p-1.5 rounded-lg flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider",
                                            hideHeader && "p-1 text-[8px]",
                                            (todo.status || '').toUpperCase() === 'COMPLETED' ? "bg-green-50 text-green-600" :
                                            (todo.status || '').toUpperCase() === 'ACTION_TAKEN' ? "bg-blue-50 text-blue-600" :
                                            "bg-amber-50 text-amber-600"
                                        )}>
                                            {getStatusIcon(todo.status)}
                                            {getStatusLabel(todo.status)}
                                        </div>
                                        {/* {todo.type !== 'CUSTOM' && todo.moduleId && (
                                            <button 
                                                onClick={() => handleOpen(todo)}
                                                className={cn(
                                                    "px-2 py-1 bg-primary/5 text-primary hover:bg-primary/10 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-all",
                                                    hideHeader && "text-[8px] px-1.5 py-0.5"
                                                )}
                                            >
                                                Next
                                                <ExternalLink size={hideHeader ? 8 : 10} />
                                            </button>
                                        )} */}
                                    </div>
                                    <h3 className={cn("text-lg font-bold text-gray-900 truncate mb-1", hideHeader && "text-base")}>{todo.title}</h3>
                                    <p className={cn("text-sm text-gray-500 line-clamp-2 mb-4", hideHeader && "text-xs mb-3")}>{todo.description || 'No description provided'}</p>
                                    
                                    <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-gray-400">
                                        {todo.deadline && (
                                            <div className={cn("flex items-center gap-1.5", hideHeader && "gap-1 text-[10px]")}>
                                                <Calendar size={hideHeader ? 12 : 14} />
                                                Due {format(new Date(todo.deadline), 'MMM dd, yyyy')}
                                            </div>
                                        )}
                                        {(todo as any).createdBy && (
                                            <div className={cn("flex items-center gap-1.5", hideHeader && "gap-1 text-[10px]")}>
                                                <User size={hideHeader ? 12 : 14} />
                                                By {(todo as any).createdBy.user?.firstName} {(todo as any).createdBy.user?.lastName}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-col items-end gap-3">
                                    {(todo.status || '').toUpperCase() !== 'COMPLETED' && (
                                        <Button
                                            onClick={() => handleOpen(todo)}
                                            className={cn(
                                                "h-9 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                                                hideHeader && "h-7 px-3 text-[9px]",
                                                "bg-primary text-white hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20"
                                            )}
                                        >
                                            {todo.cta ? (todo.cta.charAt(0).toUpperCase() + todo.cta.slice(1)) : "Open Task"}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </ShadowCard>
                ))
            ) : (
                <ShadowCard className={cn(
                    "p-12 text-center rounded-[2.5rem] bg-gray-50/50 border-dashed border-2 border-gray-200",
                    hideHeader && "p-8 rounded-3xl"
                )}>
                    <div className="mb-4 flex justify-center">
                        <div className="p-4 bg-white rounded-full text-gray-300">
                            <Plus size={32} />
                        </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No Todos Found</h3>
                    <p className="text-gray-500 max-w-sm mx-auto">There are no tasks assigned to this engagement {filter !== 'all' && 'matching the current filter'}.</p>
                </ShadowCard>
            )}
        </div>
    </div>
  );
};
