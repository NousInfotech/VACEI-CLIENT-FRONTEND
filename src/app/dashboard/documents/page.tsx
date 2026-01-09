"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import DocumentForm from "@/app/dashboard/document-organizer/components/DocumentForm";
import { Button } from "@/components/ui/button";
import Dropdown from "@/components/Dropdown";
import { MoreVertical, CheckCircle2, Circle, Upload, List, LayoutGrid, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type DocumentsTab = "all" | "requested" | "uploaded";

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  href: string;
  done: boolean;
}

const DOCS_UI_KEY = "vacei-documents-ui-state";

export default function DocumentsMasterPage() {
  const [activeTab, setActiveTab] = useState<DocumentsTab>("all");
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);

  // Hydrate UI state from localStorage once on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const raw = window.localStorage.getItem(DOCS_UI_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as {
          activeTab?: DocumentsTab;
          checklist?: ChecklistItem[];
        };
        if (parsed.activeTab) setActiveTab(parsed.activeTab);
        if (parsed.checklist && parsed.checklist.length > 0) {
          setChecklist(parsed.checklist);
          return;
        }
      }
    } catch {
      // ignore parse errors and fall back to defaults
    }

    // Seed default checklist if nothing stored
    setChecklist([
      {
        id: "bk-latest-period",
        title: "Bookkeeping (latest period)",
        description: "Upload bank statements and card statements.",
        href: "/dashboard/document-organizer/document-upload",
        done: false,
      },
      {
        id: "vat-current-q",
        title: "VAT (current Q)",
        description: "Sales and purchase invoices still required.",
        href: "/dashboard/document-organizer/document-upload",
        done: false,
      },
      {
        id: "audit-core-docs",
        title: "Audit",
        description: "Signed engagement letter and key contracts outstanding.",
        href: "/dashboard/document-organizer/document-upload",
        done: false,
      },
    ]);
  }, []);

  // Persist UI state whenever it changes
  useEffect(() => {
    if (typeof window === "undefined") return;
    const payload = JSON.stringify({ activeTab, checklist });
    window.localStorage.setItem(DOCS_UI_KEY, payload);
  }, [activeTab, checklist]);

  const markChecklistDone = (id: string, doneState?: boolean) => {
    setChecklist((items) =>
      items.map((item) =>
        item.id === id ? { ...item, done: doneState !== undefined ? doneState : !item.done } : item
      )
    );
  };

  const resetChecklist = () => {
    setChecklist((items) => items.map((item) => ({ ...item, done: false })));
  };

  const tabs: { id: DocumentsTab; label: string; href: string }[] = [
    { id: "all", label: "All Documents", href: "/dashboard/document-organizer/document-listing" },
    { id: "requested", label: "Requested", href: "/dashboard/document-organizer/document-listing?tab=requested" },
    { id: "uploaded", label: "Uploaded by you", href: "/dashboard/document-organizer/document-listing?tab=uploaded" },
  ];

  const activeTabLabel = tabs.find(t => t.id === activeTab)?.label || "All Documents";

  return (
    <section className="mx-auto max-w-[1400px] w-full pt-5 space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between px-2 md:px-0">
        <div>
          <h1 className="text-2xl md:text-4xl font-bold text-gray-900 tracking-tight">
            Documents
          </h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">
            Master vault for all documents, requests and smart checklists.
          </p>
        </div>

        <div className="flex gap-3">
          <Link href="/dashboard/document-organizer/document-upload">
            <Button className="rounded-xl px-5 h-11 bg-gray-900 hover:bg-black text-white font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-gray-200 transition-all active:scale-95 flex gap-2">
              <Upload className="w-4 h-4" />
              Upload documents
            </Button>
          </Link>
          <Link href="/dashboard/document-organizer/document-listing">
            <Button variant="outline" className="rounded-xl px-5 h-11 border-gray-200 hover:bg-gray-50 font-bold uppercase tracking-widest text-[10px] transition-all active:scale-95 flex gap-2">
              <List className="w-4 h-4" />
              View all
            </Button>
          </Link>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-xl border border-gray-100 rounded-[2.5rem] shadow-2xl shadow-gray-200/50 p-6 md:p-8 space-y-8">
        {/* Tabs - Responsive */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-2">
           {/* Desktop Tabs */}
           <div className="hidden md:flex gap-1">
            {tabs.map((tab) => (
               <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "px-6 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all relative",
                    activeTab === tab.id
                      ? "text-gray-900 bg-gray-50"
                      : "text-gray-400 hover:text-gray-600 hover:bg-gray-50/50"
                  )}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-gray-900 rounded-full mb-1" />
                  )}
                </button>
            ))}
          </div>

          {/* Mobile Tab Dropdown */}
          <div className="md:hidden w-full">
             <Dropdown
                align="left"
                className="w-full"
                contentClassName="w-full"
                trigger={
                   <div className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-2xl border border-gray-100">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-900">{activeTabLabel}</span>
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                   </div>
                }
                items={tabs.map(tab => ({
                   id: tab.id,
                   label: tab.label,
                   onClick: () => setActiveTab(tab.id)
                }))}
             />
          </div>
          
          <div className="hidden md:flex items-center gap-2">
             <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">View Mode:</span>
             <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg bg-gray-50 text-gray-900">
                <LayoutGrid className="w-4 h-4" />
             </Button>
          </div>
        </div>

        {/* Content grid */}
        <div className="grid gap-8 lg:grid-cols-[1.8fr,1.2fr]">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center">
                     <Upload className="w-5 h-5 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Upload zone
                  </h2>
               </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 bg-gray-50 px-3 py-1 rounded-full">
                Drag & drop ready
              </span>
            </div>

            <div className="rounded-[2rem] border-2 border-dashed border-gray-100 bg-gray-50/30 p-8 transition-all hover:bg-gray-50/50">
              <DocumentForm />
            </div>
          </div>

          {/* Smart checklist */}
          <aside className="rounded-[2rem] border border-gray-100 bg-white/50 p-8 space-y-6 shadow-sm flex flex-col">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-xl font-bold text-gray-900 leading-tight">
                  Smart checklist
                </h2>
                <div className="flex gap-2">
                  <Dropdown
                    align="right"
                    trigger={
                      <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-gray-100">
                        <MoreVertical className="w-5 h-5" />
                      </Button>
                    }
                    items={[
                      { id: 'reset', label: 'Reset Checklist', onClick: resetChecklist },
                      { id: 'tasks', label: 'View All Tasks', onClick: () => window.location.href = "/dashboard/todo-list" }
                    ]}
                  />
                </div>
              </div>
              <p className="text-sm text-gray-500 font-medium">
                Outstanding document requests and pending actions.
              </p>
            </div>

            <div className="space-y-4 flex-1">
              {checklist.map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    "group flex items-start gap-4 rounded-3xl border p-5 transition-all duration-300",
                    item.done 
                    ? "bg-gray-50/50 border-transparent opacity-60" 
                    : "bg-white border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5"
                  )}
                >
                  <div className={cn(
                    "mt-1 w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors",
                    item.done ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"
                  )}>
                    {item.done ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "font-bold text-sm text-gray-900 transition-all",
                      item.done && "line-through text-gray-400"
                    )}>
                      {item.title}
                    </p>
                    <p className="text-xs text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <Dropdown
                    align="right"
                    trigger={
                      <button className="p-2 -mr-2 text-gray-400 hover:text-gray-900 opacity-0 group-hover:opacity-100 transition-all">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    }
                    items={[
                      { 
                        id: 'upload', 
                        label: 'Upload Now', 
                        icon: <Upload className="w-3.5 h-3.5" />,
                        onClick: () => window.location.href = item.href 
                      },
                      { 
                        id: 'toggle', 
                        label: item.done ? 'Mark as Pending' : 'Mark as Done', 
                        icon: item.done ? <Circle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />,
                        onClick: () => markChecklistDone(item.id) 
                      }
                    ]}
                  />
                </div>
              ))}
            </div>

            <div className="pt-4 mt-auto">
               <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                  <p className="text-[10px] font-bold text-blue-800 uppercase tracking-widest leading-relaxed">
                    Note: This checklist is a real-time view of your outstanding requirements.
                  </p>
               </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}


