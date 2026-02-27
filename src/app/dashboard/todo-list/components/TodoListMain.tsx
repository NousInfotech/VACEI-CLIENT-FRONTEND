"use client";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { getTodos, TodoItem } from "@/api/todoService";
import AlertMessage, { AlertVariant } from "@/components/AlertMessage";
import { Pagination } from "@/interfaces";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";
import { ChevronLeft, ChevronRight } from "lucide-react";
import TaskDetailModal from "./TaskDetailModal";
import { SERVICE_METADATA } from "@/lib/menuData";



export default function TodoList() {
    const router = useRouter();

    const [allTasks, setAllTasks] = useState<TodoItem[]>([]);
    const [tasks, setTasks] = useState<TodoItem[]>([]);
    const [pagination, setPagination] = useState<Pagination>({ page: 1, totalPages: 1, total: 0, limit: 10 });

    const [message, setMessage] = useState<string>("");
    const [alertVariant, setAlertVariant] = useState<AlertVariant | undefined>(undefined);

    const [typeFilter, setTypeFilter] = useState<string>("");
    const [serviceFilter, setServiceFilter] = useState<string>("");
    const [statusFilter, setStatusFilter] = useState<string>("");
    const [isLoading, setIsLoading] = useState(true);

    const [selectedTask, setSelectedTask] = useState<TodoItem | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const todoResponse = await getTodos();
            const filteredTodos = todoResponse.filter(t =>
                t.type === 'DOCUMENT_REQUEST' ||
                t.type === 'REQUESTED_DOCUMENT' ||
                t.type === 'CUSTOM' ||
                t.type === 'CHAT'
            );
            setAllTasks(filteredTodos);
        } catch (err) {
            console.error("Failed to load data:", err);
            setMessage("Failed to load data.");
            setAlertVariant("danger");
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Derive unique services from tasks for the Service dropdown
    const serviceOptions = Array.from(new Set(allTasks.map(t => t.service).filter(Boolean))) as string[];

    const filterAndPaginate = useCallback(() => {
        let filtered = [...allTasks];

        if (typeFilter) {
            filtered = filtered.filter(t => t.type === typeFilter);
        }
        if (serviceFilter) {
            filtered = filtered.filter(t => t.service === serviceFilter);
        }
        if (statusFilter) {
            filtered = filtered.filter(t => (t.status || '').toUpperCase() === statusFilter);
        }

        const total = filtered.length;
        const totalPages = Math.ceil(total / pagination.limit);
        const start = (pagination.page - 1) * pagination.limit;
        const paginated = filtered.slice(start, start + pagination.limit);

        setTasks(paginated);
        setPagination(prev => ({ ...prev, total, totalPages }));
    }, [allTasks, typeFilter, serviceFilter, statusFilter, pagination.page, pagination.limit]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    useEffect(() => {
        filterAndPaginate();
    }, [filterAndPaginate]);

    const loadPaginatedTasks = (page: number) => {
        setPagination(prev => ({ ...prev, page }));
    };





    const clearFilters = () => {
        setTypeFilter("");
        setServiceFilter("");
        setStatusFilter("");
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const resolveServiceEngagementBase = (service?: string) => {
        if (!service) return "";
        const normalized = service.toUpperCase().replace(/[-\s&]/g, "_");
        const metadataKey = (Object.keys(SERVICE_METADATA).find((k) =>
            normalized === k || normalized.includes(k)
        ) || "") as keyof typeof SERVICE_METADATA | "";
        if (!metadataKey) return "";
        return SERVICE_METADATA[metadataKey]?.href || "";
    };

    const handleAction = (task: TodoItem) => {
        const type = (task.type || "").toUpperCase();
        const serviceBase = resolveServiceEngagementBase(task.service);

        if (type === 'CUSTOM') {
            setSelectedTask(task);
            setIsModalOpen(true);
            return;
        }

        // Chat-related todos should open engagement chat tab, optionally scrolled to a specific message
        if (type === 'CHAT' && task.engagementId) {
            const messageQuery = task.moduleId ? `&messageId=${task.moduleId}` : "";
            if (serviceBase) {
                router.push(`${serviceBase}/engagements/${task.engagementId}?tab=chat${messageQuery}`);
            } else {
                router.push(`/dashboard/engagements/${task.engagementId}?tab=chat${messageQuery}`);
            }
            return;
        }

        // Requested documents should open engagement document request tab
        if ((type === 'DOCUMENT_REQUEST' || type === 'REQUESTED_DOCUMENT') && task.engagementId) {
            const scrollQuery = task.moduleId ? `&scrollTo=${task.moduleId}` : "";
            if (serviceBase) {
                router.push(`${serviceBase}/engagements/${task.engagementId}?tab=document_requests${scrollQuery}`);
            } else {
                router.push(`/dashboard/engagements/${task.engagementId}?tab=document_requests${scrollQuery}`);
            }
            return;
        }

        if (task.engagementId) {
            if (serviceBase) {
                router.push(`${serviceBase}/engagements/${task.engagementId}`);
            } else {
                router.push(`/dashboard/engagements/${task.engagementId}`);
            }
        } else {
            router.push(`/dashboard/todo-list/todo-list-view?taskId=${btoa(task.id)}`);
        }
    };

    const todoStats = useMemo(() => {
        if (!allTasks.length) return undefined;
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const sevenDaysFromNow = new Date();
        sevenDaysFromNow.setDate(today.getDate() + 7);
        sevenDaysFromNow.setHours(23, 59, 59, 999);

        const incompleteTasks = allTasks.filter(t => {
            const st = (t.status || '').toUpperCase();
            return st !== 'COMPLETED' && st !== 'ACTION_TAKEN';
        });

        const hasUrgentTasks = incompleteTasks.some(t => {
            if (!t.deadline) return false;
            const deadline = new Date(t.deadline);
            return deadline <= sevenDaysFromNow;
        });

        return {
            total: allTasks.length,
            completed: allTasks.length - incompleteTasks.length,
            healthStatus: (hasUrgentTasks ? 'Action Required' : 'Healthy') as 'Action Required' | 'Healthy'
        };
    }, [allTasks]);

    return (
        <section className="mx-auto max-w-[1400px] w-full pt-5 space-y-4">
            <PageHeader
                title="To-Do List"
                subtitle="Manage your tasks, track progress, and collaborate with your team."
                todoStats={todoStats}
                todoStatsHref="/dashboard/todo-list"
            />

            <div className="bg-card border border-border rounded-[16px] p-4 shadow-md w-full mx-auto transition-all duration-300 hover:shadow-md">
                {message && <AlertMessage message={message} variant={alertVariant} onClose={() => setMessage("")} duration={6000} />}

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-3 mb-5 items-center">
                    {/* Type */}
                    <select
                        value={typeFilter}
                        onChange={(e) => { setTypeFilter(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}
                        className="flex-1 min-w-[160px] border border-border rounded-lg px-3 py-2 bg-card text-sm"
                    >
                        <option value="">All Types</option>
                        <option value="DOCUMENT_REQUEST">Document Request</option>
                        <option value="REQUESTED_DOCUMENT">Requested Document</option>
                        <option value="CUSTOM">Custom</option>
                        <option value="CHAT">Chat</option>
                    </select>

                    {/* Service */}
                    <select
                        value={serviceFilter}
                        onChange={(e) => { setServiceFilter(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}
                        className="flex-1 min-w-[160px] border border-border rounded-lg px-3 py-2 bg-card text-sm"
                    >
                        <option value="">All Services</option>
                        {serviceOptions.map(s => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>

                    {/* Status */}
                    <select
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}
                        className="flex-1 min-w-[160px] border border-border rounded-lg px-3 py-2 bg-card text-sm"
                    >
                        <option value="">All Statuses</option>
                        <option value="ACTION_REQUIRED">Action Required</option>
                        <option value="ACTION_TAKEN">Action Taken</option>
                        <option value="COMPLETED">Completed</option>
                    </select>

                    <Button
                        variant="outline"
                        onClick={clearFilters}
                        className="bg-light text-primary-color-new shrink-0"
                    >
                        Clear
                    </Button>
                </div>

                {/* Table */}
                <div className="bg-card border border-border rounded-[16px] shadow-md w-full mx-auto overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                                    <th className="px-5 py-3 text-left font-semibold">Title</th>
                                    <th className="px-4 py-3 text-left font-semibold">Type</th>
                                    <th className="px-4 py-3 text-left font-semibold">Service</th>
                                    <th className="px-4 py-3 text-left font-semibold">Status</th>
                                    <th className="px-4 py-3 text-left font-semibold">Deadline</th>
                                    <th className="px-4 py-3 text-right font-semibold">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    [...Array(5)].map((_, i) => (
                                        <tr key={i} className="border-b border-border animate-pulse">
                                            {[...Array(6)].map((_, j) => (
                                                <td key={j} className="px-5 py-4">
                                                    <div className="h-3 bg-gray-200 rounded w-full" />
                                                </td>
                                            ))}
                                        </tr>
                                    ))
                                ) : tasks.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-16 text-muted-foreground">
                                            <p className="text-base font-medium">No tasks found</p>
                                            <p className="text-xs mt-1">Try adjusting your filters</p>
                                        </td>
                                    </tr>
                                ) : (
                                    tasks.map((task, idx) => {
                                        const typeLabel: Record<string, string> = {
                                            DOCUMENT_REQUEST: 'Doc Request',
                                            REQUESTED_DOCUMENT: 'Req. Doc',
                                            CUSTOM: 'Custom',
                                            CHAT: 'Chat',
                                        };
                                        const st = (task.status || 'ACTION_REQUIRED').toUpperCase();
                                        const statusLabelMap: Record<string, string> = {
                                            ACTION_REQUIRED: 'Action Required',
                                            ACTION_TAKEN: 'Action Taken',
                                            COMPLETED: 'Completed',
                                        };
                                        const statusColorMap: Record<string, string> = {
                                            ACTION_REQUIRED: 'bg-amber-50 text-amber-700 border-amber-200',
                                            ACTION_TAKEN: 'bg-green-50 text-green-700 border-green-200',
                                            COMPLETED: 'bg-blue-50 text-blue-700 border-blue-200',
                                        };
                                        const statusLabel = statusLabelMap[st] || st;
                                        const colorClass = statusColorMap[st] || 'bg-gray-50 text-gray-700 border-gray-200';
                                        return (
                                            <tr
                                                key={task.id}
                                                className={`border-b border-border transition-colors hover:bg-muted/30 ${
                                                    idx % 2 === 0 ? '' : 'bg-muted/10'
                                                }`}
                                            >
                                                <td className="px-5 py-4 max-w-[280px]">
                                                    <p className="font-semibold text-gray-900 truncate" title={task.title}>{task.title}</p>
                                                    {task.description && (
                                                        <p className="text-xs text-muted-foreground mt-0.5 truncate" title={task.description}>{task.description}</p>
                                                    )}
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    <span className="text-xs font-medium text-gray-600 bg-gray-100 border border-gray-200 px-2.5 py-1 rounded-lg">
                                                        {typeLabel[task.type] ?? task.type}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-gray-600">{task.service || '—'}</td>
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    <span className={`text-xs font-semibold border px-2.5 py-1 rounded-xl ${colorClass}`}>
                                                        {statusLabel}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    {task.deadline ? (
                                                        <span className="text-xs font-medium text-rose-600">
                                                            {new Date(task.deadline).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                        </span>
                                                    ) : (
                                                        <span className="text-muted-foreground text-xs">—</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-4 text-right">
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleAction(task)}
                                                        className="whitespace-nowrap bg-brand-primary text-white px-4 rounded-xl hover:bg-brand-active transition-all"
                                                    >
                                                        {task.cta || 'Take Action'}
                                                    </Button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex justify-between items-center px-5 py-3 border-t border-border">
                        <span className="text-xs text-muted-foreground">
                            Showing {((pagination.page - 1) * pagination.limit) + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
                        </span>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => loadPaginatedTasks(pagination.page - 1)}
                                disabled={pagination.page === 1 || isLoading}
                                className="p-1.5 rounded-lg border border-border hover:bg-gray-50 disabled:opacity-40 transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <span className="text-sm font-medium px-2">
                                {pagination.page} / {pagination.totalPages || 1}
                            </span>
                            <button
                                onClick={() => loadPaginatedTasks(pagination.page + 1)}
                                disabled={pagination.page === pagination.totalPages || isLoading}
                                className="p-1.5 rounded-lg border border-border hover:bg-gray-50 disabled:opacity-40 transition-colors"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Custom Task Detail Modal */}
                <TaskDetailModal
                    isOpen={isModalOpen}
                    onClose={() => { setIsModalOpen(false); setSelectedTask(null); }}
                    onSuccess={() => loadPaginatedTasks(pagination.page)}
                    task={selectedTask}
                />
            </div>
        </section>
    );
}