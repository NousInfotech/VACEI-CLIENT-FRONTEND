// File: src/api/taskService.ts

// Mock implementation - no backend calls
// Simulate API delay
async function simulateDelay(ms: number = 300) {
  await new Promise(resolve => setTimeout(resolve, ms));
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
  // Simulate API delay
  await simulateDelay(300);
  
  // Mock task data
  const mockTask: Task = {
    id: taskId,
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
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    priority: "High",
  };
  
  return mockTask;
}

export async function deleteTaskAttachment(
  attachmentId: number
): Promise<void> {
  // Simulate API delay
  await simulateDelay(200);
  // Mock - no action needed
}

export async function fetchTaskCategories() {
  // Simulate API delay
  await simulateDelay(200);
  
  // Mock categories
  return [
    { id: 1, name: "Financial Review" },
    { id: 2, name: "Tax" },
    { id: 3, name: "Audit" },
    { id: 4, name: "Compliance" },
  ];
}

export async function fetchTaskStatuses() {
  // Simulate API delay
  await simulateDelay(200);
  
  // Mock statuses
  return [
    { id: 1, name: "In Progress" },
    { id: 2, name: "Pending" },
    { id: 3, name: "Completed" },
    { id: 4, name: "Cancelled" },
  ];
}

export async function createOrUpdateTask(
  body: FormData | Record<string, any>,
  editTaskId?: number | null
) {
  // Simulate API delay
  await simulateDelay(400);
  
  // Mock response
  return {
    id: editTaskId || Date.now(),
    ...(body instanceof FormData ? {} : body),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export async function updateTaskStatus(
  taskId: number,
  newStatusId: number
): Promise<void> {
  // Simulate API delay
  await simulateDelay(200);
  // Mock - no action needed
}

export async function deleteTask(taskId: number) {
  // Simulate API delay
  await simulateDelay(200);
  // Mock - no action needed
  return null;
}

// ----------------------
// Chat + Comments
// ----------------------

export async function fetchChatUsers(): Promise<Assignment[]> {
  // Simulate API delay
  await simulateDelay(200);
  
  // Mock chat users
  return [
    {
      assignmentId: 1,
      accountant: {
        id: 1,
        first_name: "John",
        last_name: "Doe",
        email: "john.doe@example.com",
        name: "John Doe",
      },
    },
    {
      assignmentId: 2,
      accountant: {
        id: 2,
        first_name: "Jane",
        last_name: "Smith",
        email: "jane.smith@example.com",
        name: "Jane Smith",
      },
    },
  ];
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
  // Simulate API delay
  await simulateDelay(200);
  
  // Mock comments
  return [
    {
      id: 1,
      taskId: taskId,
      commentedById: 1,
      comment: "This task is progressing well.",
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 2,
      taskId: taskId,
      commentedById: 2,
      comment: "Please review the attached documents.",
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    },
  ];
}

// --- MODIFIED createCommentTask ---
export async function createTaskComment(
  payload: FormData
): Promise<CommentFromApi> {
  // Simulate API delay
  await simulateDelay(300);
  
  // Mock comment response
  return {
    id: Date.now(),
    comment: payload.get("comment") as string || "New comment",
    commentedById: 1,
    createdAt: new Date().toISOString(),
  };
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