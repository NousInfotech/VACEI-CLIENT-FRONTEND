// utils/api/meetingService.tsx

// Mock implementation - no backend calls
// Import only the necessary types. UpdateMeetingPayload is no longer imported here.
import { Meeting, BaseMeeting, FetchMeetingsOptions } from "@/interfaces";

// Simulate API delay
async function simulateDelay(ms: number = 300) {
  await new Promise(resolve => setTimeout(resolve, ms));
}

// Define the type for meeting updates locally within this file.
// This type allows all fields to be optional, start/end to be nullable,
// and status to accept string or number, mirroring the original UpdateMeetingPayload.
type MeetingUpdateData = Partial<Omit<BaseMeeting, 'start' | 'end' | 'status'>> & {
  start?: Date | null;
  end?: Date | null;
  status?: number | string; // Allows for status update using string values if needed by backend
};

// Fetch all meetings
export async function fetchMeetings(
  options?: FetchMeetingsOptions
): Promise<Meeting[]> {
  // Simulate API delay
  await simulateDelay(300);
  
  // Mock meetings
  const now = new Date();
  const mockMeetings: Meeting[] = [
    {
      id: 1,
      title: "Client Consultation",
      description: "Quarterly review meeting",
      start: new Date(now.getTime() + 24 * 60 * 60 * 1000), // Tomorrow
      end: new Date(now.getTime() + 24 * 60 * 60 * 1000 + 60 * 60 * 1000), // Tomorrow + 1 hour
      status: 1,
      clientId: "client-1",
      accountantId: "1",
      client: "Client Name (client@example.com)",
      accountant: "Accountant Name (accountant@example.com)",
    },
    {
      id: 2,
      title: "Tax Planning Session",
      description: "Annual tax planning discussion",
      start: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      end: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000), // + 1.5 hours
      status: 1,
      clientId: "client-1",
      accountantId: "2",
      client: "Client Name (client@example.com)",
      accountant: "Accountant Name 2 (accountant2@example.com)",
    },
  ];
  
  // Filter by accountantId if provided
  if (options?.accountantId && options.accountantId !== "all") {
    return mockMeetings.filter(m => String(m.accountantId) === String(options.accountantId));
  }
  
  return mockMeetings;
}

// Create a new meeting
// Uses BaseMeeting for the creation payload
export async function createMeeting(meetingData: BaseMeeting): Promise<Meeting> {
  // Simulate API delay
  await simulateDelay(400);
  
  // Mock meeting response
  return {
    id: Date.now(),
    title: meetingData.title,
    description: meetingData.description || "",
    start: meetingData.start,
    end: meetingData.end,
    status: meetingData.status || 1,
    clientId: meetingData.clientId || null,
    accountantId: String(meetingData.accountantId || ""),
    client: null,
    accountant: null,
  };
}

// Update an existing meeting
// Now uses the locally defined MeetingUpdateData type
export async function updateMeeting(id: string, data: MeetingUpdateData): Promise<Meeting> {
  // Simulate API delay
  await simulateDelay(400);
  
  // Mock updated meeting
  return {
    id: parseInt(id),
    title: data.title || "Updated Meeting",
    description: data.description || "",
    start: data.start || new Date(),
    end: data.end || new Date(),
    status: typeof data.status === 'number' ? data.status : (data.status ? 1 : 0),
    clientId: data.clientId || null,
    accountantId: String(data.accountantId || ""),
    client: null,
    accountant: null,
  };
}

// Delete a meeting
export async function deleteMeeting(id: string): Promise<{ message: string }> {
  // Simulate API delay
  await simulateDelay(200);
  
  // Mock response
  return { message: "Meeting deleted successfully" };
}

// Fetch a single meeting by ID
export async function fetchMeetingById(id: string): Promise<Meeting> {
  // Simulate API delay
  await simulateDelay(200);
  
  // Mock meeting
  const now = new Date();
  return {
    id: parseInt(id),
    title: "Sample Meeting",
    description: "Meeting description",
    start: new Date(now.getTime() + 24 * 60 * 60 * 1000),
    end: new Date(now.getTime() + 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
    status: 1,
    clientId: "client-1",
    accountantId: "1",
    client: "Client Name (client@example.com)",
    accountant: "Accountant Name (accountant@example.com)",
  };
}