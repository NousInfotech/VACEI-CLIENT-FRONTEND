"use client";

import React, { useEffect, useMemo, useRef, useState, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Upload, ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import DashboardCard from "@/components/DashboardCard";
import { fetchCategories, createOrUpdateDocument } from "@/api/documenService";
import { fetchTasks, updateTaskStatus, fetchTaskStatuses } from "@/api/taskService";
import DocumentList from "@/components/documents/DocumentList";
import PageHeader from "@/components/shared/PageHeader";
import Dropdown from "@/components/Dropdown";

// Utility functions moved here to avoid import issues
const generateYears = (currentYear: number, range: number = 5): number[] => {
  return Array.from({ length: range }, (_, i) => currentYear - (range - 1) + i);
};

const toOptions = (years: number[]) => {
  return years.map((y) => ({
    value: y.toString(),
    label: y.toString(),
  }));
};

type FileWithMeta = File & { _key: string };

function makeFileKey(file: File) {
  return `${file.name}__${file.size}__${file.lastModified}`;
}

function DocumentsMasterPage() {
  const dropRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<FileWithMeta[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedCount, setUploadedCount] = useState<number | null>(null);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [loadedCategories, setLoadedCategories] = useState(false);

  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [service, setService] = useState("");
  const [periodYear, setPeriodYear] = useState("");
  const [periodMonth, setPeriodMonth] = useState("");

  const [uploadedDocIds, setUploadedDocIds] = useState<string[]>([]);
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [postUploadNotes, setPostUploadNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesSaved, setNotesSaved] = useState(false);

  const [openRequests, setOpenRequests] = useState<any[]>([]);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const currentYear = new Date().getFullYear();
  const yearOptions = useMemo(() => toOptions(generateYears(currentYear, 5)), [currentYear]);
  const monthOptions = useMemo(() => [
    { value: "1", label: "January" },
    { value: "2", label: "February" },
    { value: "3", label: "March" },
    { value: "4", label: "April" },
    { value: "5", label: "May" },
    { value: "6", label: "June" },
    { value: "7", label: "July" },
    { value: "8", label: "August" },
    { value: "9", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ], []);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const data = await fetchCategories();
        const first = Array.isArray(data) ? data?.[0] : null;
        const firstId = first?.id !== undefined && first?.id !== null ? String(first.id) : null;
        if (!cancelled) setCategoryId(firstId);

        // Fetch tasks for requests linking
        const tasksRes = await fetchTasks({ limit: 50 }); // Fetch recent tasks
        const tasks = tasksRes.data || [];
        // Filter for "open" tasks. Assuming status "Completed" or "Done" means closed.
        // We'll need to fetch statuses to be sure, or just rely on status name if available.
        // For now, let's filter out anything that looks like "Done" or "Completed".
        const openTasks = tasks.filter((t: any) => {
             const statusVal = t.status?.name || t.status || "";
             const s = typeof statusVal === 'string' ? statusVal.toLowerCase() : "";
             return !s.includes("complete") && !s.includes("done") && !s.includes("closed");
        });
        if (!cancelled) setOpenRequests(openTasks);

      } catch (err) {
        console.error("Failed to load initial data:", err);
        if (!cancelled) setCategoryId(null);
      } finally {
        if (!cancelled) setLoadedCategories(true);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const acceptedTypes = useMemo(() => {
    return new Set([
      "application/pdf",
      "image/jpeg",
      "image/png",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ]);
  }, []);

  const addFiles = (incoming: File[]) => {
    if (!incoming.length) return;
    setError(null);
    setFiles((prev) => {
      const nextMap = new Map<string, FileWithMeta>();
      for (const f of prev) nextMap.set(f._key, f);
      for (const f of incoming) {
        if (!acceptedTypes.has(f.type)) continue;
        const key = makeFileKey(f);
        nextMap.set(key, Object.assign(f, { _key: key }));
      }
      return Array.from(nextMap.values());
    });
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = e.target.files ? Array.from(e.target.files) : [];
    addFiles(list);
    e.target.value = "";
  };

  const removeFile = (key: string) => setFiles((prev) => prev.filter((f) => f._key !== key));

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const list = e.dataTransfer.files ? Array.from(e.dataTransfer.files) : [];
    addFiles(list);
  };

  const handleUpload = async () => {
    if (uploading) return;
    if (!files.length) {
      setError("Please select at least one file to upload.");
      return;
    }
    if (!loadedCategories) {
      setError("Loading required settings. Please try again in a moment.");
      return;
    }
    if (!categoryId && !service) {
      setError("Upload setup is incomplete. Use Advanced options to upload.");
      return;
    }

    setUploading(true);
    setError(null);

    const now = new Date();
    const year = periodYear || String(now.getFullYear());
    const month = periodMonth || String(now.getMonth() + 1);
    const title = `Quick upload - ${now.toISOString().slice(0, 10)}`;

    const formData = new FormData();
    for (const file of files) formData.append("files", file);
    formData.append("document_title", title);
    formData.append("year", year);
    formData.append("month", month);
    if (categoryId) formData.append("category", categoryId);
    formData.append("tagIds", JSON.stringify([]));
    
    if (service) {
        formData.append("notes", `Related Service: ${service}`);
    }

    if (selectedRequestId) {
        // Append request info to notes if linked
        const req = openRequests.find(r => String(r.id) === selectedRequestId);
        if (req) {
            const existingNotes = formData.get("notes") || "";
            formData.set("notes", `${existingNotes}\nLinked to Request: ${req.title} (ID: ${req.id})`.trim());
        }
    }

    try {
      const result = await createOrUpdateDocument(formData);
      
      // If linked to a request, mark it as completed
      if (selectedRequestId) {
          try {
              // Find "Completed" status ID
              const statuses = await fetchTaskStatuses();
              const completedStatus = statuses.find((s: any) => s.name.toLowerCase() === "completed" || s.name.toLowerCase() === "done");
              if (completedStatus) {
                  await updateTaskStatus(Number(selectedRequestId), completedStatus.id);
                  // Remove from local list
                  setOpenRequests(prev => prev.filter(r => String(r.id) !== selectedRequestId));
              }
          } catch (err) {
              console.error("Failed to update linked request status", err);
              // Don't fail the upload if task update fails, just log it
          }
      }

      const newIds: string[] = [];
      if (Array.isArray(result)) {
        result.forEach((doc: any) => {
          if (doc.id) newIds.push(String(doc.id));
        });
      } else if (result && result.id) {
        newIds.push(String(result.id));
      } else if (result && result.data && Array.isArray(result.data)) {
          result.data.forEach((doc: any) => {
          if (doc.id) newIds.push(String(doc.id));
        });
      }
      
      setUploadedDocIds(newIds);
      setUploadedCount(files.length);
      setFiles([]);
      setSelectedRequestId(null);
      setRefreshKey(prev => prev + 1); // Refresh document list
    } catch (e: any) {
      setError(e?.message || "Error uploading documents.");
    } finally {
      setUploading(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!postUploadNotes.trim() || !uploadedDocIds.length) return;
    setSavingNotes(true);
    try {
      await Promise.all(uploadedDocIds.map(async (id) => {
        const fd = new FormData();
        fd.append("notes", postUploadNotes);
        await createOrUpdateDocument(fd, id);
      }));
      
      setNotesSaved(true);
      setTimeout(() => setIsNotesOpen(false), 1500);
    } catch (e) {
      console.error("Failed to save notes", e);
    } finally {
      setSavingNotes(false);
    }
  };

  const handleDone = () => {
    setUploadedCount(null);
    setError(null);
    setUploadedDocIds([]);
    setPostUploadNotes("");
    setNotesSaved(false);
    setIsNotesOpen(false);
  };

  return (
    <section className="mx-auto max-w-[1400px] w-full pt-5 space-y-6">
      <PageHeader
        title="Documents"
        subtitle="Master vault for all documents, requests and smart checklists."
      />

      <div className="bg-white/80 backdrop-blur-xl border border-gray-100 rounded-[2.5rem] shadow-2xl shadow-gray-200/50 p-6 md:p-8 space-y-8">
        <div className={cn("space-y-6 relative z-1 hover:z-50 focus-within:z-50")}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center">
                <Upload className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                UPLOAD DOCUMENTS
              </h2>
            </div>
          </div>

          {openRequests.length > 0 && uploadedCount === null && (
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 space-y-3 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center gap-2 text-amber-800 font-medium text-sm">
                    <span className="flex h-2 w-2 rounded-full bg-amber-500" />
                    Pending Requests: Are these documents for...
                </div>
                <div className="flex flex-wrap gap-2">
                    {openRequests.map((req) => (
                        <button
                            key={req.id}
                            onClick={() => setSelectedRequestId(selectedRequestId === String(req.id) ? null : String(req.id))}
                            className={cn(
                                "text-xs px-3 py-1.5 rounded-lg border transition-all duration-200",
                                selectedRequestId === String(req.id)
                                    ? "bg-amber-100 border-amber-300 text-amber-900 font-medium ring-1 ring-amber-300"
                                    : "bg-white border-amber-200 text-amber-700 hover:bg-amber-50 hover:border-amber-300"
                            )}
                        >
                            {req.title}
                        </button>
                    ))}
                    <button 
                        onClick={() => setSelectedRequestId(null)}
                        className="text-xs px-3 py-1.5 rounded-lg text-gray-500 hover:text-gray-900 transition-colors"
                    >
                        Ignore
                    </button>
                </div>
            </div>
          )}

          <DashboardCard className="p-8 relative z-20">
            {uploadedCount !== null ? (
              <div className="space-y-5">
                <div className="space-y-2">
                  <p className="text-lg font-semibold text-gray-900">
                    {uploadedCount} {uploadedCount === 1 ? "file" : "files"} uploaded successfully.
                  </p>
                  <p className="text-sm text-gray-500">
                    Our team will review and organise them. You’ll be notified if anything else is needed.
                  </p>
                </div>

                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => setIsNotesOpen(!isNotesOpen)}
                    className="flex items-center gap-1 text-xs font-medium text-gray-600 hover:text-gray-900 underline underline-offset-4"
                  >
                    {isNotesOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    Add notes
                  </button>
                  
                  {isNotesOpen && (
                    <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
                        <label className="block text-xs text-gray-500">
                            Optional notes (if helpful):
                        </label>
                        <textarea
                            value={postUploadNotes}
                            onChange={(e) => setPostUploadNotes(e.target.value)}
                            placeholder="e.g. March invoices, bank statement, audit documents"
                            className="w-full max-w-md p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            rows={3}
                        />
                        <div className="flex items-center gap-2">
                             <Button 
                                size="sm" 
                                onClick={handleSaveNotes} 
                                disabled={savingNotes || !postUploadNotes.trim() || notesSaved}
                                className={cn(notesSaved && "bg-green-600 hover:bg-green-700")}
                             >
                                {savingNotes ? "Saving..." : notesSaved ? "Saved" : "Save Note"}
                             </Button>
                        </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  <Button onClick={handleDone} variant={notesSaved ? "outline" : "default"}>
                    Done
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {error && (
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <div
                  ref={dropRef}
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                  className={cn(
                    "group/drop relative w-full border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-500 cursor-pointer overflow-hidden",
                    "border-gray-200 bg-blue-50/30 hover:bg-white hover:border-gray-900 hover:shadow-2xl hover:shadow-gray-200/50"
                  )}
                  onClick={() => inputRef.current?.click()}
                >
                  <input
                    ref={inputRef}
                    type="file"
                    multiple
                    onChange={onFileInputChange}
                    className="hidden"
                    accept=".pdf,image/jpeg,image/png,.xlsx,.xls"
                  />

                  <div className="relative z-10 flex flex-col items-center">
                    <div className="w-16 h-16 rounded-2xl bg-white shadow-xl shadow-gray-200/50 flex items-center justify-center mb-6 group-hover/drop:scale-110 group-hover/drop:rotate-6 transition-all duration-500">
                      <Upload className="w-8 h-8 text-gray-900" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-lg font-bold text-gray-900">
                        Drag & drop files here
                      </p>
                      <p className="text-sm text-gray-500">
                        or click to upload
                      </p>
                      <p className="text-xs text-gray-400">
                        You can upload multiple files. We’ll organise them for you.
                      </p>
                    </div>
                  </div>
                </div>

                {files.length > 0 && (
                  <div className="rounded-2xl border border-gray-100 bg-white p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-gray-900">
                        Selected files ({files.length})
                      </p>
                      <button
                        type="button"
                        onClick={() => setFiles([])}
                        className="text-xs font-medium text-gray-600 hover:text-gray-900 underline underline-offset-4"
                      >
                        Clear
                      </button>
                    </div>
                    <div className="space-y-2 max-h-40 overflow-auto pr-1">
                      {files.map((f) => (
                        <div key={f._key} className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 px-3 py-2">
                          <p className="text-xs text-gray-700 truncate">
                            {f.name}
                          </p>
                          <button
                            type="button"
                            onClick={() => removeFile(f._key)}
                            className="text-xs font-medium text-gray-600 hover:text-gray-900 underline underline-offset-4 shrink-0"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}


                <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-3">
                    {files.length > 0 && (
                      <Button onClick={handleUpload} disabled={uploading}>
                          {uploading ? "Uploading..." : "Upload files"}
                      </Button>
                    )}
                    <Button 
                        variant="outline" 
                        disabled={uploading}
                        onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                        className="gap-2"
                    >
                        Advanced options
                        {isAdvancedOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </Button>
                    </div>

                    {isAdvancedOpen && (
                        <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-gray-700">Related service (Optional)</label>
                                <Dropdown
                                    className="w-full"
                                    align="left"
                                    side="bottom"
                                    autoPosition
                                    trigger={
                                        <button
                                            type="button"
                                            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-left text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20 flex items-center justify-between gap-2"
                                        >
                                            <span className="truncate">
                                                {service || "Select service..."}
                                            </span>
                                            <ChevronDown className="w-4 h-4 text-gray-400" />
                                        </button>
                                    }
                                    items={[
                                        { id: "", label: "Select service...", onClick: () => setService("") },
                                        { id: "Bookkeeping", label: "Bookkeeping", onClick: () => setService("Bookkeeping") },
                                        { id: "VAT", label: "VAT", onClick: () => setService("VAT") },
                                        { id: "Audit", label: "Audit", onClick: () => setService("Audit") },
                                        { id: "Payroll", label: "Payroll", onClick: () => setService("Payroll") },
                                        { id: "Other", label: "Other", onClick: () => setService("Other") },
                                    ]}
                                />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-gray-700">Year (Optional)</label>
                                    <Dropdown
                                        className="w-full"
                                        align="left"
                                        side="bottom"
                                        autoPosition
                                        trigger={
                                            <button
                                                type="button"
                                                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-left text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20 flex items-center justify-between gap-2"
                                            >
                                                <span className="truncate">
                                                    {periodYear || `Current (${currentYear})`}
                                                </span>
                                                <ChevronDown className="w-4 h-4 text-gray-400" />
                                            </button>
                                        }
                                        items={[
                                            { id: "", label: `Current (${currentYear})`, onClick: () => setPeriodYear("") },
                                            ...yearOptions.map((opt) => ({
                                                id: opt.value,
                                                label: opt.label,
                                                onClick: () => setPeriodYear(opt.value),
                                            })),
                                        ]}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-gray-700">Month (Optional)</label>
                                    <Dropdown
                                        className="w-full"
                                        align="left"
                                        side="bottom"
                                        autoPosition
                                        trigger={
                                            <button
                                                type="button"
                                                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-left text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20 flex items-center justify-between gap-2"
                                            >
                                                <span className="truncate">
                                                    {periodMonth
                                                        ? monthOptions.find((opt) => opt.value === periodMonth)?.label
                                                        : `Current (${new Date().toLocaleString("default", { month: "long" })})`}
                                                </span>
                                                <ChevronDown className="w-4 h-4 text-gray-400" />
                                            </button>
                                        }
                                        items={[
                                            {
                                                id: "",
                                                label: `Current (${new Date().toLocaleString("default", { month: "long" })})`,
                                                onClick: () => setPeriodMonth(""),
                                            },
                                            ...monthOptions.map((opt) => ({
                                                id: opt.value,
                                                label: opt.label,
                                                onClick: () => setPeriodMonth(opt.value),
                                            })),
                                        ]}
                                    />
                                </div>
                            </div>
                            <p className="text-xs text-gray-400">
                                Nothing is mandatory. This is for power users only.
                            </p>
                        </div>
                    )}
                </div>
              </div>
            )}
          </DashboardCard>
        </div>
        
        <DocumentList refreshTrigger={refreshKey} />
      </div>
    </section>
  );
}

export default function DocumentsPage() {
  return (
    <Suspense fallback={
       <div className="mx-auto max-w-[1400px] w-full pt-10 flex justify-center">
          <div className="h-8 w-8 border-4 border-gray-900 border-t-transparent rounded-full animate-spin" />
       </div>
    }>
      <DocumentsMasterPage />
    </Suspense>
  );
}




