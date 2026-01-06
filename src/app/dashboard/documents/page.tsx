"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import DocumentForm from "@/app/dashboard/document-organizer/components/DocumentForm";
import { Button } from "@/components/ui/button";

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

  const markChecklistDone = (id: string) => {
    setChecklist((items) =>
      items.map((item) =>
        item.id === id ? { ...item, done: !item.done } : item
      )
    );
  };

  const resetChecklist = () => {
    setChecklist((items) => items.map((item) => ({ ...item, done: false })));
  };

  return (
    <section className="mx-auto max-w-[1400px] w-full pt-5 space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-brand-body">
            Documents
          </h1>
          <p className="text-sm text-muted-foreground">
            Master vault for all documents, requests and smart checklists.
          </p>
        </div>

        <div className="flex gap-2">
          <Link href="/dashboard/document-organizer/document-upload">
            <Button variant="default" className="rounded-full px-4">
              Upload documents
            </Button>
          </Link>
          <Link href="/dashboard/document-organizer/document-listing">
            <Button variant="outline" className="rounded-full px-4">
              View all
            </Button>
          </Link>
        </div>
      </div>

      <div className="bg-card border border-border rounded-[16px] shadow-md p-5 space-y-6">
        {/* Tabs (UI uses local state but links still go to listing filters) */}
        <div className="flex flex-wrap gap-2">
          <Link href="/dashboard/document-organizer/document-listing">
            <button
              className={`px-3 py-1.5 rounded-full text-xs md:text-sm font-medium shadow-sm ${
                activeTab === "all"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
              onClick={() => setActiveTab("all")}
              type="button"
            >
              All
            </button>
          </Link>
          <Link href="/dashboard/document-organizer/document-listing?tab=requested">
            <button
              className={`px-3 py-1.5 rounded-full text-xs md:text-sm font-medium shadow-sm ${
                activeTab === "requested"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
              onClick={() => setActiveTab("requested")}
              type="button"
            >
              Requested
            </button>
          </Link>
          <Link href="/dashboard/document-organizer/document-listing?tab=uploaded">
            <button
              className={`px-3 py-1.5 rounded-full text-xs md:text-sm font-medium shadow-sm ${
                activeTab === "uploaded"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
              onClick={() => setActiveTab("uploaded")}
              type="button"
            >
              Uploaded by you
            </button>
          </Link>
        </div>

        {/* Upload zone – reuses existing DocumentForm for full functionality */}
        <div className="grid gap-6 lg:grid-cols-[2fr,1.3fr]">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-brand-body">
                Upload zone
              </h2>
              <span className="text-xs uppercase tracking-wide text-muted-foreground">
                Drag & drop or use the form
              </span>
            </div>

            <div className="rounded-[14px] border border-dashed border-border bg-muted/40 p-4 md:p-5">
              {/* The existing form already supports drag & drop and tagging – keep logic there */}
              <DocumentForm />
            </div>
          </div>

          {/* Smart checklist card – state is stored in localStorage */}
          <aside className="rounded-[14px] border border-border bg-background/80 shadow-sm p-4 md:p-5 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h2 className="text-lg font-medium text-brand-body">
                  Smart checklist – missing documents
                </h2>
                <p className="text-xs text-muted-foreground">
                  Shows outstanding document requests across all services.
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full text-[11px]"
                  onClick={resetChecklist}
                  type="button"
                >
                  Reset
                </Button>
                <Link href="/dashboard/todo-list">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full text-[11px]"
                  >
                    View tasks
                  </Button>
                </Link>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              {checklist.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between gap-3 rounded-lg border border-border/70 bg-muted/40 px-3 py-2.5"
                >
                  <div className="flex-1">
                    <p className="font-medium text-brand-body flex items-center gap-2">
                      <span>{item.title}</span>
                      {item.done && (
                        <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
                          Done
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1 items-end">
                    <Link
                      href={item.href}
                      className="text-xs font-medium text-primary hover:underline whitespace-nowrap"
                    >
                      Upload
                    </Link>
                    <button
                      type="button"
                      onClick={() => markChecklistDone(item.id)}
                      className="text-[11px] text-muted-foreground hover:text-primary"
                    >
                      {item.done ? "Mark as pending" : "Mark done"}
                    </button>
                  </div>
                </div>
              ))}

              <p className="mt-2 text-[11px] text-muted-foreground">
                This checklist is a client view on top of your existing document
                organizer. It does not change any underlying document logic.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}


