"use client";
import { useEffect, useState, FormEvent, ChangeEvent, useCallback, useRef } from "react"; // Import useRef
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { AttachmentIcon, MessageUser01Icon, WaveTriangleIcon, Unlink03Icon, Edit03Icon, ViewIcon, Delete02Icon, Cancel01Icon, Clock01FreeIcons } from "@hugeicons/core-free-icons";
import { fetchTasks, createOrUpdateTask, fetchTaskCategories, fetchTaskStatuses, fetchChatUsers, fetchTaskById, deleteTask } from "@/api/taskService";
import TodoListTabs from "@/components/TodoListTabs";
import AlertMessage, { AlertVariant } from "@/components/AlertMessage";
import { Category, Status, TaskAttachment, Task, AttachedFile, Pagination } from "@/interfaces";
import TaskForm from "./TaskForm";
import TaskInfo, { Priority } from "./TaskInfo";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";
// Custom hook for debouncing a value
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

export default function TodoList() {
    const backendUrl = process.env.NEXT_PUBLIC_UPLOAD_PATH || "";
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Create a ref for the TaskForm
    const taskFormRef = useRef<HTMLDivElement>(null);

    const [currentUserId, setCurrentUserId] = useState<number | null>(null);
    const [accountants, setAccountants] = useState<any[]>([]);

    const [tasks, setTasks] = useState<Task[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [statuses, setStatuses] = useState<Status[]>([]);
    const [pagination, setPagination] = useState<Pagination>({ page: 1, totalPages: 1, total: 0, limit: 10 });

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [assignedToIds, setAssignedToIds] = useState<number[]>([]);
    const [statusId, setStatusId] = useState<number | null>(null);
    const [priority, setPriority] = useState<any | null>(null);
    const [dueDate, setDueDate] = useState<any>(null);
    const [attachmentFiles, setAttachmentFiles] = useState<AttachedFile[]>([]);
    const [editTaskId, setEditTaskId] = useState<number | null>(null);
    const [errors, setErrors] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState<string>("");
    const [alertVariant, setAlertVariant] = useState<AlertVariant | undefined>(undefined);

    const categoryParam = searchParams.get("category");

    if (categoryParam == null) {
        router.push(`/dashboard/todo-list?category=MQ==`);
    }

    const categoryFilterId = categoryParam ? parseInt(atob(categoryParam)) : null;

    const [existingAttachments, setExistingAttachments] = useState<TaskAttachment[]>([]);
    const [searchText, setSearchText] = useState<string>("");
    const [assignedToFilterId, setAssignedToFilterId] = useState<number | null>(null);
    const [priorityFilter, setPriorityFilter] = useState<string>("");
    const [dueDateFilter, SetdueDateFilter] = useState<string | null>(null);
    const [statusFilterId, setStatusFilterId] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true); // Default to true for initial load

    // Debounce filter values
    const debouncedSearchText = useDebounce(searchText, 500);
    const debouncedAssignedToFilterId = useDebounce(assignedToFilterId, 300);
    const debouncedStatusFilterId = useDebounce(statusFilterId, 300);
    const debouncedPriorityFilter = useDebounce(priorityFilter, 300);
    const debounceddueDateFilter = useDebounce(dueDateFilter, 300);

    useEffect(() => {
        const encoded = localStorage.getItem("user_id");
        if (encoded) {
            try {
                const decoded = atob(encoded);
                const userId = parseInt(decoded);
                setCurrentUserId(isNaN(userId) ? null : userId);
            } catch (err) {
                console.error("Failed to decode user_id from localStorage:", err);
            }
        }
    }, []);

    // Consolidated loadData function. Removed page parameter from here
    // as it will be managed by a separate effect for pagination.
    const loadFilteredData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [taskResponse, cats, stats, chatUsers] = await Promise.all([
                fetchTasks({
                    categoryId: categoryFilterId ?? undefined,
                    assignedToId: debouncedAssignedToFilterId ?? undefined,
                    statusId: debouncedStatusFilterId ?? undefined,
                    search: debouncedSearchText,
                    priority: debouncedPriorityFilter ?? '',
                    dueDate: debounceddueDateFilter ?? '',
                    page: 1 // Always load page 1 when filters change
                }),
                fetchTaskCategories(),
                fetchTaskStatuses(),
                fetchChatUsers(),
            ]);
            setTasks(taskResponse.data);
            setPagination(taskResponse.pagination);
            setCategories(cats);
            setAccountants(chatUsers);
            setStatuses(stats);
        } catch (err) {
            console.error("Failed to load data:", err);
            setMessage("Failed to load data.");
            setAlertVariant("danger");
        } finally {
            setIsLoading(false);
        }
    }, [categoryFilterId, debouncedAssignedToFilterId, debouncedStatusFilterId, debouncedSearchText, debouncedPriorityFilter, debounceddueDateFilter]);

    // Separate function for pagination to avoid re-fetching all static data
    const loadPaginatedTasks = useCallback(async (page: number) => {
        setIsLoading(true);
        try {
            const taskResponse = await fetchTasks({
                categoryId: categoryFilterId ?? undefined,
                assignedToId: assignedToFilterId ?? undefined,
                statusId: statusFilterId ?? undefined,
                priority: priorityFilter ?? '',
                search: searchText,
                page
            });
            setTasks(taskResponse.data);
            setPagination(taskResponse.pagination);
        } catch (err) {
            console.error("Failed to load paginated data:", err);
            setMessage("Failed to load tasks for this page.");
            setAlertVariant("danger");
        } finally {
            setIsLoading(false);
        }
    }, [categoryFilterId, assignedToFilterId, statusFilterId, priorityFilter, searchText, dueDateFilter]); // Depend on actual filters, not debounced, for pagination

    // This effect runs only when the filters change (debounced for search and dropdowns)
    // or when categoryFilterId changes (which isn't debounced by nature of its source).
    useEffect(() => {
        loadFilteredData();
    }, [loadFilteredData]); // loadFilteredData is now stable due to useCallback dependencies

    function clearFilters() {
        setAssignedToFilterId(null);
        setPriorityFilter("");
        setStatusFilterId(null);
        setSearchText("");
        // No need to explicitly call loadData here, the useEffect above will react to state changes.
    }

    async function handleView(encodedTaskId: string) {
        router.push(`/dashboard/todo-list/todo-list-view?taskId=${encodedTaskId}`);
    }

    const handleEdit = useCallback(async (encodedTaskId: string) => {
        try {
            const decodedId = parseInt(atob(encodedTaskId));
            const taskData = await fetchTaskById(decodedId);

            setEditTaskId(decodedId);
            setTitle(taskData.title);
            setPriority(taskData.priority);
            setDueDate(taskData.dueDate);
            setDescription(taskData.description);

            const assignedIds = taskData.assignedAccountants?.map((accountant) => accountant.id) || [];
            setAssignedToIds(assignedIds);

            setStatusId(taskData.statusId);
            setAttachmentFiles([]);
            if (taskData.attachments && taskData.attachments.length > 0) {
                const fullUrls = taskData.attachments.map((attachment: TaskAttachment) => ({
                    ...attachment,
                    filePath: `${backendUrl.replace(/\/$/, '')}/${attachment.filePath.replace(/^\//, '')}`
                }));
                setExistingAttachments(fullUrls);
            } else {
                setExistingAttachments([]);
            }

            // Scroll to the TaskForm after setting the data
            if (taskFormRef.current) {
                taskFormRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }

        } catch (err) {
            console.error("Failed to fetch task for edit:", err);
            setMessage("Failed to load task data.");
            setAlertVariant("danger");
        }
    }, [backendUrl]);

    async function handleDelete(taskId: number) {
        if (!confirm("Are you sure you want to delete this task?")) {
            return;
        }

        try {
            await deleteTask(taskId);
            setMessage("Task deleted successfully!");
            setAlertVariant("success");
            await loadFilteredData(); // Re-fetch based on current filters
        } catch (err) {
            console.error("Failed to delete task:", err);
            setMessage("Failed to delete task.");
            setAlertVariant("danger");
        }
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        const newErrors: string[] = [];

        if (!title.trim()) newErrors.push("Task title is required.");

        if (!description.trim()) newErrors.push("Task description is required.");
        if (assignedToIds.length === 0) newErrors.push("Please select at least one Accountant.");
        if (statusId === null) newErrors.push("Please select a Status.");
        if (!priority || !priority.trim()) newErrors.push("Please select a priority for the task.");
        if (!dueDate || !dueDate.trim()) newErrors.push("Please select a due date for the task.");

        if (newErrors.length > 0) { setErrors(newErrors); return; }

        setErrors([]);
        setIsSubmitting(true);

        try {
            const formData = new FormData();
            formData.append("title", title);
            formData.append("description", description);
            formData.append("statusId", statusId!.toString());
            formData.append("priority", priority!.toString());
            formData.append("dueDate", dueDate);
            assignedToIds.forEach(id => {
                formData.append("assignedToIds[]", id.toString());
            });

            if (categoryFilterId) formData.append("categoryId", categoryFilterId.toString());

            attachmentFiles.forEach((attachedFile) => {
                formData.append("attachments", attachedFile.file);
            });

            if (editTaskId) {
                formData.append("taskId", editTaskId.toString());
                existingAttachments.forEach(att => {
                    formData.append("existingAttachmentIds", att.id.toString());
                });
            }

            await createOrUpdateTask(formData, editTaskId);
            resetForm();
            await loadFilteredData(); // Re-fetch based on current filters
            setMessage(editTaskId ? "Task updated successfully!" : "Task created successfully!");
            setAlertVariant("success");
        } catch (error) {
            console.error(error);
            if ((error as any).response?.data?.message) {
                setErrors([(error as any).response.data.message]);
            } else {
                setErrors(["Something went wrong while submitting the form."]);
            }
            setMessage("Failed to process task.");
            setAlertVariant("danger");
        } finally {
            setIsSubmitting(false);
        }
    }

    function resetForm() {
        setTitle("");
        setPriority("")
        setDueDate("")
        setDescription("");
        setAssignedToIds([]);
        setStatusId(null);
        setAttachmentFiles([]);
        setEditTaskId(null);
        setExistingAttachments([]);
    }

    function handleCategoryClick(id: number | null) {
        if (id === null) {
            router.push(pathname);
        } else {
            const encoded = btoa(`${id}`);
            router.push(`${pathname}?category=${encoded}`);
        }
    }

    function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
        if (e.target.files && e.target.files.length > 0) {
            const newAttachedFiles: AttachedFile[] = Array.from(e.target.files)
                .filter(file => file instanceof File)
                .map(file => ({
                    file,
                    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`
                }));

            setAttachmentFiles(prevFiles => [...prevFiles, ...newAttachedFiles]);
        } else {
            console.log("No files selected, attachmentFiles remain as is unless cleared manually.");
        }
        e.target.value = '';
    }

    function removeAttachment(idToRemove: string) {
        setAttachmentFiles(prevFiles => prevFiles.filter(file => file.id !== idToRemove));
    }

    function removeExistingAttachment(idToRemove: number) {
        setExistingAttachments(prevAttachments => prevAttachments.filter(att => att.id !== idToRemove));
    }

    return (
        <section className="mx-auto max-w-[1400px] w-full pt-5">
            <div className="bg-card border border-border rounded-[16px] p-4 shadow-md w-full mx-auto transition-all duration-300 hover:shadow-md">
                <h1 className="text-xl leading-normal text-brand-body capitalize font-medium">To-Do List</h1>
                <hr className="my-3 border-t border-gray-100"></hr>
                {message && <AlertMessage message={message} variant={alertVariant} onClose={() => setMessage("")} duration={6000} />}
                <TodoListTabs categories={categories} onCategoryClick={handleCategoryClick} />

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-5 items-center">
                    <input
                        type="text"
                        placeholder="Search tasks..."
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        className="flex-1 min-w-[200px] border border-border rounded-lg px-3 py-2 bg-card"
                    />

                    <select
                        id="priority"
                        value={priorityFilter ?? ""}
                        onChange={(e) => setPriorityFilter(e.target.value)}
                        className="w-full md:w-auto rounded-md border border-border bg-card focus:border-border focus:ring focus:ring-blue-200 focus:ring-opacity-50 px-3 py-2 text-sm text-brand-body"
                    >
                        <option value="">Select Priority</option>
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                    </select>

                    <DatePicker
                        selected={dueDateFilter ? new Date(dueDateFilter) : null}
                        onChange={(date) => {
                            SetdueDateFilter(date ? date.toISOString().split("T")[0] : null);
                        }}
                        id="dueDateFilter"
                        popperPlacement="bottom-start"
                        dateFormat="yyyy-MM-dd"
                        showMonthDropdown
                        showYearDropdown
                        dropdownMode="select"
                        isClearable
                        minDate={new Date()}
                        placeholderText="Upto Due date"
                        onKeyDown={(e) => e.preventDefault()}
                        withPortal
                        className="w-full md:w-auto min-w-[150px] px-3 py-2 text-sm text-brand-body border-border bg-card border rounded-lg"
                    />


                    <select
                        value={assignedToFilterId ?? ""}
                        onChange={(e) =>
                            setAssignedToFilterId(e.target.value ? Number(e.target.value) : null)
                        }
                        className="w-full md:w-auto rounded-md border  border-border bg-card focus:border-border focus:ring focus:ring-blue-200 focus:ring-opacity-50 px-3 py-2 text-sm text-brand-body"
                    >
                        <option value="">All Accountants</option>
                        {accountants.map((acc) => (
                            <option key={acc.accountant.id} value={acc.accountant.id}>
                                {acc.accountant.name} ({acc.accountant.email})
                            </option>
                        ))}
                    </select>

                    <select
                        value={statusFilterId ?? ""}
                        onChange={(e) => setStatusFilterId(e.target.value ? Number(e.target.value) : null)}
                        className="w-full md:w-auto rounded-md border  border-border bg-card px-3 py-2 text-sm text-brand-body"
                    >
                        <option value="">All Statuses</option>
                        {statuses.map((status) => (
                            <option key={status.id} value={status.id}>
                                {status.name}
                            </option>
                        ))}
                    </select>

                    <Button
                        variant="outline"
                        onClick={clearFilters}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm cursor-pointer bg-sidebar-background text-card-foreground !font-normal"
                    >
                        Clear
                    </Button>
                </div>

                {/* Listing Section */}
                <div className="bg-card border border-border rounded-[16px] shadow-md w-full mx-auto transition-all duration-300 hover:shadow-md">
                    <h2 className="text-xl font-medium px-5 py-3 border-b border-border">Current Tasks</h2>
                    <div className="space-y-3 p-3 max-h-96 overflow-y-auto">
                        {isLoading ? (
                            // Skeleton Loader
                            <div className="space-y-3">
                                {[...Array(3)].map((_, index) => ( // Render 3 skeleton items
                                    <div key={index} className="bg-gradient-to-l from-white/80 to-blue-100/50 backdrop-blur[10px] border border-border rounded-[16px] py-3 px-4 flex justify-between items-center animate-pulse">
                                        <div className="flex-1">
                                            <div className="h-4 bg-black/10 rounded w-3/4 mb-2"></div>
                                            <div className="h-3 bg-black/10 rounded w-1/2"></div>
                                        </div>
                                        <div className="w-1/4 h-4 bg-black/10 rounded"></div>
                                    </div>
                                ))}
                            </div>
                        ) : tasks.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                                <svg className="w-16 h-16 mb-4 text-sidebar-foreground" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                </svg>
                                <p className="text-lg font-medium">No tasks found</p>
                                <p className="text-sm text-muted-foreground">You can create a new task using the form below.</p>
                            </div>
                        ) : (
                            tasks.map((task) => (
                                <div key={task.id} className="bg-card px-4 py-3 flex justify-between items-centerbg-card border border-border rounded-[16px] p-4 shadow-md w-full mx-auto transition-all duration-300 hover:shadow-md">
                                    <Link
                                        href={`/dashboard/todo-list/todo-list-view?taskId=${btoa(task.id.toString())}`}
                                        passHref
                                        className="flex-1 cursor-pointer hover:bg-brand-body -mx-4 -my-3 px-4 py-3 rounded-lg transition-colors duration-200"
                                    >
                                        <div>
                                            <TaskInfo
                                                title={task.title}
                                                priority={task.priority as Priority | null}
                                                dueDate={task.dueDate}
                                                createdAtDate={task.createdAt}
                                            />
                                            <div className="flex flex-wrap gap-3 mt-2">
                                                {task.assignedAccountants && task.assignedAccountants.length > 0 ? (
                                                    <span className="text-sm flex gap-2 items-center">
                                                        <HugeiconsIcon icon={MessageUser01Icon} className="w-4.5 h-4.5 text-green-700" />
                                                        {task.assignedAccountants.map(acc => `${acc.username} (${acc.email})`).join(", ")}
                                                    </span>
                                                ) : (
                                                    task.otherUser && (
                                                        <span className="text-sm flex gap-2 items-center">
                                                            <HugeiconsIcon icon={MessageUser01Icon} className="w-4.5 h-4.5 text-brand-primary700" />
                                                            {task.otherUser.username} ({task.otherUser.email})
                                                        </span>
                                                    )
                                                )}
                                                <span className="text-sm flex gap-2 items-center text-primary">
                                                    <HugeiconsIcon icon={WaveTriangleIcon} className="w-4.5 h-4.5 text-rose-700" />
                                                    {task.status ?? "No Status"}
                                                </span>
                                                {task.category && (
                                                    <span className="text-sm flex gap-2 items-center">
                                                        <HugeiconsIcon icon={Unlink03Icon} className="w-4.5 h-4.5 text-amber-600" />
                                                        {task.category}
                                                    </span>
                                                )}
                                                {task.attachments && task.attachments.length > 0 && (
                                                    <span className="text-sm flex gap-2 items-center">
                                                        <HugeiconsIcon icon={AttachmentIcon} className="w-4.5 h-4.5 text-cyan-800" />
                                                        {task.attachments.length} Attachment(s)
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </Link>

                                    <div className="flex items-center gap-4 pl-4">
                                        <div className="flex gap-3">
                                            {task.createdById === currentUserId && (
                                                <>
                                                    <button
                                                        className="cursor-pointer bg-sidebar-background w-7 h-7 flex items-center justify-center rounded-full shadow-md hover:bg-sidebar-hover transition-colors"
                                                        onClick={() => handleEdit(btoa(task.id.toString()))}
                                                        aria-label={`Edit task ${task.title}`}
                                                    >
                                                        <HugeiconsIcon icon={Edit03Icon} className="w-4.5 h-4.5 text-sidebar-foreground" />
                                                    </button>
                                                    <button
                                                        className="cursor-pointer bg-rose-700 w-7 h-7 flex items-center justify-center rounded-full"
                                                        onClick={() => handleDelete(task.id)}
                                                        aria-label={`Delete task ${task.title}`}
                                                    >
                                                        <HugeiconsIcon icon={Delete02Icon} className="w-4.5 h-4.5 text-rose-100" />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="flex justify-center items-center space-x-2 mt-5 p-5 border-t border-border">
                        <button onClick={() => loadPaginatedTasks(pagination.page - 1)} disabled={pagination.page === 1 || isLoading} className="px-3 py-1 border rounded disabled:opacity-50">Prev</button>
                        <span>Page {pagination.page} of {pagination.totalPages}</span>
                        <button onClick={() => loadPaginatedTasks(pagination.page + 1)} disabled={pagination.page === pagination.totalPages || isLoading} className="px-3 py-1 border rounded disabled:opacity-50">Next</button>
                    </div>
                </div>

                {/* Create or Edit Task Section */}
                <div className="bg-card border border-border rounded-[16px] shadow-md w-full mx-auto transition-all duration-300 hover:shadow-md overflow-hidden mt-8"> {/* Added mt-8 for spacing */}
                    <h2 className="text-xl font-medium px-5 py-3 border-b border-border">{editTaskId ? "Edit Task" : "Create New Task"}</h2>
                    <div className="p-1" ref={taskFormRef}>
                        <TaskForm
                            title={title}
                            setTitle={setTitle}
                            description={description}
                            setDescription={setDescription}
                            assignedToIds={assignedToIds}
                            setAssignedToIds={setAssignedToIds}
                            statusId={statusId}
                            setStatusId={setStatusId}
                            priority={priority}
                            dueDate={dueDate}
                            setDueDate={setDueDate}
                            setPriority={setPriority}
                            accountants={accountants}
                            statuses={statuses}
                            attachmentFiles={attachmentFiles}
                            existingAttachments={existingAttachments}
                            handleFileChange={handleFileChange}
                            removeAttachment={removeAttachment}
                            removeExistingAttachment={removeExistingAttachment}
                            handleSubmit={handleSubmit}
                            resetForm={resetForm}
                            isSubmitting={isSubmitting}
                            editTaskId={editTaskId}
                            errors={errors}
                            backendUrl={backendUrl} />
                    </div>
                </div>
            </div>
        </section>
    );
}