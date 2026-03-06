"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { GripVertical, FileText, ClipboardList } from "lucide-react";
import DocumentRequestsTab from "./DocumentRequestsTab";
import { ServiceTodoTable } from "./ServiceTodoTable";
import { TodoItem } from "@/api/todoService";

interface WorkFlowSplitTabProps {
  engagementId: string;
  todos: TodoItem[];
  todosLoading: boolean;
  refreshKey?: number;
}

export default function WorkFlowSplitTab({
  engagementId,
  todos,
  todosLoading,
  refreshKey
}: WorkFlowSplitTabProps) {
  // Resizable state
  const [leftWidth, setLeftWidth] = useState(60); // percentage
  const isDragging = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const startResizing = useCallback(() => {
    isDragging.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, []);

  const stopResizing = useCallback(() => {
    isDragging.current = false;
    document.body.style.cursor = 'default';
    document.body.style.userSelect = 'auto';
  }, []);

  const resize = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDragging.current || !containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? (e as TouchEvent).touches[0].clientX : (e as MouseEvent).clientX;
    const newLeftWidth = ((clientX - containerRect.left) / containerRect.width) * 100;
    
    // Limits
    if (newLeftWidth > 20 && newLeftWidth < 80) {
      setLeftWidth(newLeftWidth);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', resize);
    window.addEventListener('mouseup', stopResizing);
    window.addEventListener('touchmove', resize);
    window.addEventListener('touchend', stopResizing);
    
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
      window.removeEventListener('touchmove', resize);
      window.removeEventListener('touchend', stopResizing);
    };
  }, [resize, stopResizing]);

  return (
    <div 
      ref={containerRef} 
      className="flex h-[calc(100vh-280px)] min-h-[600px] w-full gap-0 overflow-hidden rounded-2xl border border-gray-200 bg-white/50 shadow-xl animate-in fade-in duration-500 backdrop-blur-sm"
    >
      {/* Left Panel: Document Requests */}
      <div 
        style={{ width: `${leftWidth}%` }} 
        className="flex flex-col h-full bg-transparent overflow-hidden border-r border-gray-100"
      >
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <DocumentRequestsTab refreshKey={refreshKey} />
        </div>
      </div>

      {/* Resizer */}
      <div 
        onMouseDown={startResizing}
        className="w-1.5 hover:w-2 bg-gray-50 hover:bg-blue-500/10 transition-all cursor-col-resize flex items-center justify-center group relative z-50 overflow-visible border-x border-gray-100/50"
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-white border border-gray-200 shadow-xl rounded-full p-1 text-gray-400">
            <GripVertical size={12} />
          </div>
        </div>
      </div>

      {/* Right Panel: Todo List */}
      <div 
        style={{ width: `${100 - leftWidth}%` }} 
        className="flex flex-col h-full bg-gray-50/30 overflow-hidden"
      >
        <div className="p-6 shrink-0 border-b border-gray-100 bg-white/50">
            <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-200">
                    <ClipboardList className="h-5 w-5" />
                </div>
                <div>
                    <h3 className="text-xs font-bold text-gray-900 tracking-tight leading-none uppercase">Tasks & Todo</h3>
                    <p className="text-[8px] uppercase font-black tracking-widest text-gray-400 mt-1">Actions Required</p>
                </div>
            </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <ServiceTodoTable 
            todos={todos} 
            loading={todosLoading} 
            hideHeader={true}
          />
        </div>
      </div>
    </div>
  );
}
