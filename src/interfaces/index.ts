// File: src/interfaces.ts

import type { SlotInfo, View, NavigateAction, Event as RbcEvent } from 'react-big-calendar';
import { ReactNode } from 'react';

// --- Core Types ---

export interface HasId {
  id: number;
}

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  name: string; // Full name (e.g., "John Doe")
  username?: string;
}

export interface Timestamps {
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

// --- Accountant Interfaces ---

export interface Accountant extends User {
    accountant: any;
  // Add any *additional* properties specific to an Accountant here, beyond what a User has.
}

// --- Meeting Interfaces ---

export interface BaseMeeting {
  title: string;
  description?: string | null;
  start: Date;
  end: Date;
  status: number;
  clientId?: string | null;
  accountantId: string | null;
  client?: User | null;
  accountant?: User | null;
}

export interface SearchResultItem {
  id: string;
  title: string;
  description: string;
  type: 'Task' | 'Document' | 'Meeting' | 'Service' | 'Page'; // More specific types are better
  link: string;
  status?: string; // Specific to Task
  category?: string; // Specific to Task
  createdBy?: string; // Specific to Task
  uploadedBy?: string; // Specific to Document
  year?: number; // Specific to Document
  client?: string; // Specific to Meeting
  accountant?: string; // Specific to Meeting
  startTime?: string; // Specific to Meeting
  // ... any other common properties
}

export interface SearchResponse {
  success: boolean;
  message?: string;
  data?: SearchResultItem[]; // This explicitly says 'data' is an array of SearchResultItem
  totalCount?: number;
}

export interface Meeting extends BaseMeeting, HasId {
  // If `Meeting` (from API fetch) also includes the full `User` or `Accountant` objects,
  // you would add them here. For example:
  // clientUser?: User;
  // accountantUser?: Accountant;
}

export interface CalendarEvent extends Meeting {
  accountantName?: string;
  owner?: number;
  accountantDetails?: Accountant;
}

export interface MyCalendarEvent extends CalendarEvent {
  allDay?: RbcEvent['allDay'];
  resource?: RbcEvent['resource'];
  start: Date;
  end: Date;
}

export interface MeetingCalendarProps {
  events: MyCalendarEvent[];
  onSelectSlot: (slotInfo: SlotInfo) => void;
  onSelectEvent: (event: MyCalendarEvent, e: React.SyntheticEvent) => void;
  date: Date;
  onNavigate: (newDate: Date, view: View, action: NavigateAction) => void;
}

export interface MeetingDetails extends Omit<BaseMeeting, 'start' | 'end' | 'client' | 'accountant'> {
  id?: number;
  start: Date | null;
  end: Date | null;
  status: number;
  client?: User;
  accountant?: Accountant;
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
  onFormChange: (name: keyof MeetingDetails, value: string | Date | number | null | User | Accountant) => void;
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
   taskCount: number; // added here
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
  assignedToIds: number[];
  statusId: number;
  categoryId?: number;
}


export interface Task extends HasId, Timestamps {
  title: string;
  description: string;
  statusId: number;
  priority: string;
  dueDate: any;
  categoryId?: number;
  createdById: number;
  // *********** THIS IS THE CRITICAL LINE ***********
 assignedAccountants: User[]; // <-- THIS IS CRITICAL AND MUST BE User[]
  // *************************************************

  assignedToId: number[]; // For frontend forms/logic, derived from assignedAccountants
  status: string;
  category?: string;
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
  categoryId?: number | null;
  statusId?: number | null;
  assignedToId?: number | null;
}

export interface Assignment {
  assignmentId: number;
  accountant: User; // Reusing the User interface
}

export interface TaskComment extends HasId, Timestamps {
  taskId: number;
  commentedById: number;
  comment: string;
  commentedBy?: User;
  attachments?: Array<{
    id: number;
    filename: string;
    mimetype: string;
    size: number;
    url: string;
  }>;
}

// --- Pagination ---
export interface PaginationData {
  page: number;
  totalPages: number;
  total: number;
  limit: 10;
}

export interface Pagination {
  page: number;
  totalPages: number;
  total: number;
  limit: 10;
}
