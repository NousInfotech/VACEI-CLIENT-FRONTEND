"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ClipboardList } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { TodoItem, updateTodoStatus } from "@/api/todoService";
import { useGlobalDashboard } from "@/context/GlobalDashboardContext";
import { useActiveCompany } from "@/context/ActiveCompanyContext";
import { SERVICE_METADATA } from "@/lib/menuData";

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

    if (
      (type === "DOCUMENT_REQUEST" || type === "REQUESTED_DOCUMENT") &&
      todo.engagementId
    ) {
      const base = serviceBase 
        ? `${serviceBase.replace('/dashboard/', `/dashboard/${activeCompanyId}/`)}/engagements/${todo.engagementId}` 
        : `/dashboard/${activeCompanyId}/engagements/${todo.engagementId}`;
      router.push(
        `${base}?tab=workFlow${
          todo.moduleId ? `&scrollTo=${todo.moduleId}&t=${Date.now()}` : ""
        }`
      );
    } else if (type === "CHAT" && todo.engagementId) {
      // Instant status update for chat todos
      try {
        await updateTodoStatus(todo.id, "ACTION_TAKEN");
        refreshSidebar().catch(console.error);
      } catch (e) {
        console.error("Failed to auto-update chat todo status", e);
      }

      const base = serviceBase 
        ? `${serviceBase}/engagements/${todo.engagementId}` 
        : `/dashboard/engagements/${todo.engagementId}`;
      router.push(
        `${base}?tab=chat${
          todo.moduleId ? `&messageId=${todo.moduleId}` : ""
        }`
      );
    } else if (todo.engagementId) {
      const base = serviceBase 
        ? `${serviceBase}/engagements/${todo.engagementId}` 
        : `/dashboard/engagements/${todo.engagementId}`;
      router.push(base);
    } else {
      router.push(`/dashboard/todo-list/todo-list-view?taskId=${btoa(todo.id)}`);
    }
  };

  if (loading) return <Skeleton className="h-64 w-full" />;
  
  if (todos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-gray-50/50 border border-dashed border-gray-200 rounded-xl">
        <ClipboardList className="w-12 h-12 text-gray-300 mb-4" />
        <p className="text-gray-500 font-medium">No todos found for this engagement.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      {!hideHeader && (
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h4 className="text-sm font-bold text-gray-900 uppercase tracking-widest flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-blue-500" />
            Todo List
          </h4>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-100 uppercase tracking-widest text-[10px] font-bold">
            {todos.length} Items
          </Badge>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50/50">
              <th className="text-left py-3 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Task Title</th>
              <th className="text-left py-3 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Status</th>
              <th className="text-left py-3 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Deadline</th>
              <th className="text-right py-3 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Action</th>
            </tr>
          </thead>
          <tbody>
            {todos.map((todo) => (
              <tr key={todo.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="py-4 px-6">
                  <p className="font-bold text-gray-900 text-[13px]">{todo.title}</p>
                  <p className="text-[9px] text-gray-500 uppercase font-bold tracking-wider mt-0.5">{todo.type || 'Engagement Task'}</p>
                </td>
                <td className="py-4 px-6">
                  <Badge
                    className={cn(
                      "rounded-0 border px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest bg-transparent",
                      (todo.status?.toUpperCase() === 'COMPLETED' || todo.status?.toUpperCase() === 'ACTION_TAKEN') ? "text-emerald-500 border-emerald-500/20" :
                      todo.status?.toUpperCase() === 'ACTION_REQUIRED' ? "text-amber-500 border-amber-500/20" : "text-gray-400 border-gray-200"
                    )}
                  >
                    {todo.status || 'Pending'}
                  </Badge>
                </td>
                <td className="py-4 px-6 text-gray-600 font-medium">
                  {todo.deadline && todo.status?.toUpperCase() !== 'COMPLETED' && todo.status?.toUpperCase() !== 'ACTION_TAKEN' ? new Date(todo.deadline).toLocaleDateString('en-GB') : '—'}
                </td>
                <td className="py-4 px-6 text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 text-[10px] font-bold uppercase tracking-widest h-8 px-3 rounded-lg border border-transparent hover:border-blue-100"
                    onClick={() => handleOpen(todo)}
                  >
                    {todo.cta ? (todo.cta.charAt(0).toUpperCase() + todo.cta.slice(1)) : 'Open'}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
