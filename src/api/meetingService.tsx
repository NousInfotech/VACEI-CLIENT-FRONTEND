// utils/api/meetingService.tsx

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/?$/, "") || "";
// Import only the necessary types. UpdateMeetingPayload is no longer imported here.
import { Meeting, BaseMeeting, FetchMeetingsOptions } from "@/interfaces";

// Define the type for meeting updates locally within this file.
// This type allows all fields to be optional, start/end to be nullable,
// and status to accept string or number, mirroring the original UpdateMeetingPayload.
type MeetingUpdateData = Partial<Omit<BaseMeeting, 'start' | 'end' | 'status'>> & {
  start?: Date | null;
  end?: Date | null;
  status?: number | string; // Allows for status update using string values if needed by backend
};


// Auth header utility
function getAuthHeaders(): Record<string, string> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Helper to handle API responses
async function handleResponse(res: Response): Promise<any> {
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: "Something went wrong" }));
    if ([401, 403].includes(res.status)) {
      console.error("Authentication error:", errorData.message);
      throw new Error("Authentication failed. Please log in.");
    }
    throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
  }
  return res.json();
}

// Fetch all meetings
export async function fetchMeetings(
  options?: FetchMeetingsOptions
): Promise<Meeting[]> {
  try {
    let url = `${backendUrl}/meetings`;

    // If an accountantId is provided and it's not "all", add it as a query parameter
    if (options?.accountantId && options.accountantId !== "all") {
      url += `?accountantId=${options.accountantId}`;
    }

    const res = await fetch(url, {
      headers: getAuthHeaders(),
      // Add cache control if you are using Next.js 13+ fetch and want to manage caching
      // For example, to ensure fresh data on every request:
      // cache: 'no-store',
    });

    const data = await handleResponse(res);

    return data.map((m: any) => ({
      id: m.id,
      title: m.title,
      description: m.description,
      start: new Date(m.startTime),
      end: new Date(m.endTime),
      status: m.status,
      clientId: m.clientId ,
      client:m.client.username+'('+m.client.email+')' || null,
      accountant:m.accountant.username+'('+m.accountant.email+')' || null,
      owner: m.owner,
      // Ensure accountantId is treated as a string as per your interface definition
      accountantId: String(m.accountantId),
    }));
  } catch (error) {
    console.error("Error fetching meetings:", error);
    throw error;
  }
}

// Create a new meeting
// Uses BaseMeeting for the creation payload
export async function createMeeting(meetingData: BaseMeeting): Promise<Meeting> {
  try {
    const { start, end, title, description, accountantId,clientId, status = 1 } = meetingData;

    const res = await fetch(`${backendUrl}/meetings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify({
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        title,
        description,
        accountantId,
        clientId,
        status,
      }),
    });

    return handleResponse(res);
  } catch (error) {
    console.error("Error creating meeting:", error);
    throw error;
  }
}

// Update an existing meeting
// Now uses the locally defined MeetingUpdateData type
export async function updateMeeting(id: string, data: MeetingUpdateData): Promise<Meeting> {
  try {
    const payload: any = { ...data };

    if (payload.start instanceof Date) {
      payload.startTime = payload.start.toISOString();
      delete payload.start;
    }
    if (payload.end instanceof Date) {
      payload.endTime = payload.end.toISOString();
      delete payload.end;
    }

    // Convert status to number if it's a string, assuming backend expects number
    if (payload.status !== undefined) {
      payload.status = typeof payload.status === 'string' ? parseInt(payload.status, 10) : payload.status;
    }

    const res = await fetch(`${backendUrl}/meetings/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify(payload),
    });

    return handleResponse(res);
  } catch (error) {
    console.error(`Error updating meeting ${id}:`, error);
    throw error;
  }
}

// Delete a meeting
export async function deleteMeeting(id: string): Promise<{ message: string }> {
  try {
    const res = await fetch(`${backendUrl}/meetings/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    return handleResponse(res);
  } catch (error) {
    console.error(`Error deleting meeting ${id}:`, error);
    throw error;
  }
}

// Fetch a single meeting by ID
export async function fetchMeetingById(id: string): Promise<Meeting> {
  try {
    const res = await fetch(`${backendUrl}/meetings/${id}`, {
      headers: getAuthHeaders(),
    });

    const data = await handleResponse(res);

    return {
      id: data.id,
      title: data.title,
      description: data.description,
      start: new Date(data.startTime),
      end: new Date(data.endTime),
      status: data.status,
      clientId: data.clientId,
	      client: data.client,
      accountant: data.accountant,
   
      // Ensure accountantId is returned as a string as per your Meeting interface
      accountantId: String(data.accountantId),
    };
  } catch (error) {
    console.error(`Error fetching meeting with ID ${id}:`, error);
    throw error;
  }
}