// File: src/api/taskService.ts

const backendUrl =
  process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/?$/, "/") || "";
// REMOVED: import { Assignment, TaskComment, Task } from "@/interfaces"; // This line was causing the conflict

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("token") || "";
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function nullToUndefined<T>(val: T | null): T | undefined {
  return val === null ? undefined : val;
}

async function request(
  method: string,
  endpoint: string,
  {
    params = {},
    body = null,
  }: {
    params?: Record<string, any>;
    body?: FormData | Record<string, any> | null;
  } = {}
) {
  const url = new URL(`${backendUrl}${endpoint}`);

  if (method === "GET" && params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        // If the value is an array, append each item separately (e.g., for assignedToIds[])
        if (Array.isArray(value)) {
          value.forEach(item => {
            url.searchParams.append(`${key}[]`, String(item));
          });
        } else {
          url.searchParams.append(key, String(value));
        }
      }
    });
  }

  const headers: Record<string, string> = getAuthHeaders();
  const isFormData =
    typeof FormData !== "undefined" && body instanceof FormData;

  // Only set Content-Type to application/json if it's NOT FormData
  if (!isFormData && body !== null) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(url.toString(), {
    method,
    headers,
    // If it's FormData, pass it directly. Otherwise, stringify JSON or pass null.
    body: isFormData ? body : body ? JSON.stringify(body) : null,
  });

  const isJson = res.headers.get("Content-Type")?.includes("application/json");
  const data = isJson ? await res.json() : await res.text();

  if (!res.ok) {
    throw new Error(
      (isJson && data?.error) || data || `API request failed: ${res.status}`
    );
  }

  return res.status === 204 ? null : data;
}

export async function fetchTasks(params: FetchTasksParams = {}) {
  // Mock data - simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));

  // Mock tasks data
  const mockTasks: any[] = [
    {
      id: 1,
      title: "Review Q4 Financial Statements",
      description: "Complete review of Q4 financial statements and prepare summary report",
      statusId: 1,
      categoryId: 1,
      createdById: 1,
      assignedAccountants: [],
      assignedToId: [],
      status: "In Progress",
      category: "Financial Review",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      priority: "High",
    },
    {
      id: 2,
      title: "Tax Filing Preparation",
      description: "Prepare all necessary documents for annual tax filing",
      statusId: 2,
      categoryId: 2,
      createdById: 1,
      assignedAccountants: [],
      assignedToId: [],
      status: "Pending",
      category: "Tax",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
      priority: "Medium",
    },
    {
      id: 3,
      title: "Audit Documentation",
      description: "Compile and organize all audit-related documentation",
      statusId: 3,
      categoryId: 1,
      createdById: 1,
      assignedAccountants: [],
      assignedToId: [],
      status: "Completed",
      category: "Audit",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
      priority: "Low",
    },
  ];

  const page = params.page || 1;
  const limit = params.limit || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedData = mockTasks.slice(startIndex, endIndex);

  return {
    data: paginatedData,
    pagination: {
      total: mockTasks.length,
      page: page,
      totalPages: Math.ceil(mockTasks.length / limit),
      limit: limit,
    },
  };
}

export async function fetchTaskById(taskId: number): Promise<Task> {
  // Assuming your backend's tasks/list?taskId=X endpoint returns a single task object directly
  // or an array with one task that we then extract.
  const result = await request("GET", `tasks/list?taskId=${taskId}`);

  // Safely extract the task data, assuming backend might return { data: Task } or just Task
  const taskData: Task = result?.data || result;

  if (!taskData || !taskData.id) {
    throw new Error("Task not found or invalid data received");
  }


  return taskData;
}
export async function deleteTaskAttachment(
  attachmentId: number
): Promise<void> {
  return await request("DELETE", `tasks/attachments/${attachmentId}`);
}

export async function fetchTaskCategories() {
  const result = await request("GET", "tasks/categories");
  return result.data || [];
}

export async function fetchTaskStatuses() {
  const result = await request("GET", "tasks/statuses");
  return result.data || [];
}

export async function createOrUpdateTask(
  body: FormData | Record<string, any>,
  editTaskId?: number | null
) {
  const endpoint = editTaskId ? `tasks/update/${editTaskId}` : "tasks/create";

  // If body is not FormData, ensure assignedToIds is correctly passed
  if (!(body instanceof FormData)) {
    // If you're sending `assignedAccountantIds` from the frontend, rename it to `assignedToIds` here
    // or ensure your form data already has `assignedToIds`.
    // Example: If your form sends assignedAccountantIds, convert it.
    if (body.assignedAccountantIds) {
      body.assignedToIds = body.assignedAccountantIds;
      delete body.assignedAccountantIds;
    }
  }

  return await request("POST", endpoint, { body });
}

export async function updateTaskStatus(
  taskId: number,
  newStatusId: number
): Promise<void> {
  await request("PATCH", `tasks/update-status/${taskId}`, {
    body: { statusId: newStatusId },
  });
}

export async function deleteTask(taskId: number) {
  return await request("DELETE", `tasks/${taskId}`);
}

// ----------------------
// Chat + Comments
// ----------------------

export async function fetchChatUsers(): Promise<Assignment[]> {
  const result = await request("GET", "chat/getChatUsers");
  if (!Array.isArray(result)) throw new Error("Invalid response format");

  return result.map((item: any) => {
    const [first_name, ...rest] = (item.name ?? "").split(" ");
    return {
      assignmentId: item.id,
      accountant: {
        id: item.id,
        first_name: first_name ?? "",
        last_name: rest.join(" ") ?? "",
        email: item.email ?? "",
        name: item.name ?? "",
      },
    };
  });
}

// Modified CommentFromApi to be more aligned with TaskComment,
// and to allow for attachments if returned by the API on creation.
export type CommentFromApi = Pick<
  TaskComment,
  "id" | "comment" | "commentedById" | "createdAt"
> & {
  attachments?: TaskComment["attachments"];
};

export async function fetchTaskComments(
  taskId: number,
  since?: string | null,
  before?: string | null,
  limit?: number
): Promise<TaskComment[]> {
  const params: Record<string, any> = { taskId, since, before, limit };
  const result = await request("GET", "tasks/comments", { params });
  return result.data || [];
}

// --- MODIFIED createCommentTask ---
export async function createTaskComment(
  payload: FormData
): Promise<CommentFromApi> {
  console.log(payload);

  const result = await request("POST", "tasks/comments/create", {
    body: payload,
  });

  return result.data as CommentFromApi;
}

// --- Core Types ---

export interface HasId {
  id: number;
}

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  name: string;
}

export interface Timestamps {
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

// --- Accountant Interfaces ---

export interface Accountant {
  id: any;
  accountant: User;
}

// --- Meeting Interfaces ---

// Base meeting properties
export interface BaseMeeting {
  title: string;
  description?: string | null; // Allow null for clearing description
  start: Date;
  end: Date;
  status: number; // Consider an enum for status (e.g., MeetingStatus.Active, MeetingStatus.Cancelled)
  clientId?: string | null; // <--- CHANGE THIS LINE
  accountantId: string | null; // <--- CHANGE THIS LINE
  client?: string | null; // <-- make optional
  accountant?: string | null; // <-- make optional
}

// Meeting as returned from API or for display in calendar
export interface Meeting extends BaseMeeting, HasId {
  // id: number; // Inherited from HasId
  // title: string; // Inherited from BaseMeeting
  // description?: string; // Inherited from BaseMeeting
  // start: Date; // Inherited from BaseMeeting
  // end: Date; // Inherited from BaseMeeting
  // status: number; // Inherited from BaseMeeting
  // clientId: number; // Inherited from BaseMeeting
  // accountantId: string; // Inherited from BaseMeeting
}

// Calendar event for display (This is your primary event type)
export interface CalendarEvent extends Meeting {
  // Inherits all properties from Meeting
  accountantName?: string; // Optional, can be derived
  owner?: number; // <--- ADD THIS LINE HERE
}

// --- FIX: Import types from 'react-big-calendar' ---
import type { SlotInfo, View, NavigateAction, Event as RbcEvent } from 'react-big-calendar';

// Define the type for your events as expected by react-big-calendar.
// It should extend your CalendarEvent to ensure type compatibility.
// We are explicitly defining the `RbcEvent` parts that might conflict,
// making sure our `Date` types are dominant.
export interface MyCalendarEvent extends CalendarEvent {
  // Properties from RbcEvent that we want to explicitly include if CalendarEvent doesn't have them
  // or if RbcEvent's type for a shared property is broader than CalendarEvent (e.g., allDay).
  // For 'start' and 'end', CalendarEvent already defines them as Date, which is often
  // what react-big-calendar expects when you're passing Date objects.

  // The 'title' property from RbcEvent is compatible with CalendarEvent's 'title: string'.

  // If you use `allDay` property from RbcEvent:
  allDay?: RbcEvent['allDay'];

  // If you use `resource` property from RbcEvent:
  resource?: RbcEvent['resource'];

  // If there are other RbcEvent properties you use, add them here:
  // e.g., tooltip?: RbcEvent['tooltip'];
}


// Define the interface for the MeetingCalendar component's props
export interface MeetingCalendarProps {
  events: MyCalendarEvent[]; // This will now correctly expect CalendarEvent's description type
  onSelectSlot: (slotInfo: SlotInfo) => void;
  onSelectEvent: (event: MyCalendarEvent, e: React.SyntheticEvent) => void;
  date: Date;
  onNavigate: (newDate: Date, view: View, action: NavigateAction) => void; // Full signature
}


// Meeting details for forms (nullable dates for input)
export interface MeetingDetails extends Omit<BaseMeeting, 'start' | 'end'> {
  id?: number;
  start: Date | null;
  end: Date | null;
  status: number; // Assuming status is always present for form details
  client?: any; // or a more specific type like `User` if you have one
  accountant?: any;
}

export interface FetchMeetingsOptions {
  accountantId?: number | "all";
}

// --- Form and UI Related Interfaces ---

export interface ValidationErrors {
  [key: string]: string | undefined;
  title?: string;
  description?: string;
  accountantId?: string;
  start?: string;
  end?: string;
  timeConflict?: string;
  general?: string;
}

export interface MeetingFormProps {
  meetingDetails: MeetingDetails;
  accountants: Accountant[];
  validationErrors: ValidationErrors;
  isSubmitting: boolean;
  onFormChange: (name: keyof MeetingDetails, value: string | Date | number | null) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export interface MeetingInfoPopupProps {
  meeting: CalendarEvent;
  accountants: Accountant[];
  onClose: () => void;
  onView:(meetingId: number) => void;
  onEdit: (meetingId: number) => void;
  onMeetingDeleted?: () => void;
}

export interface TextInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  className?: string;
  type?: string;
  textarea?: boolean;
}

// --- Task Related Interfaces ---

export interface Category extends HasId {
  name: string;
}

export interface Status extends HasId {
  name: string;
}

export interface TaskAttachment extends HasId {
  fileName: string;
  filePath: string;
  uploadedAt: string;
}

export interface AttachedFile {
  file: File;
  id: string; // Unique ID for client-side tracking of attached files
}

export interface BaseTask {
  title: string;
  description: string;
  // This is now an array for creation/update
  assignedToIds: number[]; // Change from assignedToId to assignedToIds (array)
  statusId: number;
  categoryId?: number;
}

// This interface is how the frontend expects the task data after fetching
export interface Task extends HasId, Timestamps {
  dueDate(dueDate: any): unknown;
  priority // Inherited from BaseMeeting
 (priority: any): unknown;
  title: string;
  description: string;
  statusId: number;
  categoryId?: number;
  createdById: number;
  // From the backend, this is how assigned users come (the join table)
  assignedAccountants: Array<{
    id: any;
    accountId: number;
    account: User; // The actual user details
  }>;
  // This is for frontend forms/logic, derived from assignedAccountants
  assignedToId: number[]; // Array of IDs for assigned users
  // These are for display purposes, can be derived or fetched separately
  status: string; // Name of the status
  category?: string; // Name of the category
  // This `otherUser` field is part of the `formatTask` helper on the backend, not a direct model field
  otherUser?: {
    type: "creator" | "assignee";
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    name: string;
  };
  attachments?: TaskAttachment[];
}

export interface FetchTasksParams {
  page?: number;
  limit?: number;
  search?: string;
  priority ?: string;
  dueDate ?: string;
  categoryId?: number | null;
  statusId?: number | null;
  assignedToId?: number | null; // This is for filtering by a single assigned user
}

export interface Assignment {
  assignmentId: number;
  accountant: User; // Reusing the User interface
}

export interface TaskComment extends HasId, Timestamps {
  taskId: number;
  commentedById: number;
  comment: string;
  commentedBy?: User; // Reusing the User interface
  attachments?: Array<{
    id: number;
    filename: string;
    mimetype: string;
    size: number;
    url: string;
    // ... other attachment properties
  }>;
}

// --- Pagination ---
export interface PaginationData {
  page: number;
  totalPages: number;
  total: number;
  limit: 10; // This seems like a fixed value, might be better as a constant or dynamic
}