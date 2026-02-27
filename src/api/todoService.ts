/**
 * Todo API Service
 */

import { dedupeInFlight } from "@/lib/inFlightDedupe";

const backendUrl =
  process.env.NEXT_PUBLIC_VACEI_BACKEND_URL?.replace(/\/?$/, "/") ||
  "http://localhost:5000/api/v1/";

function getAuthHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("token") || "";
  return { Authorization: `Bearer ${token}` };
}

export interface TodoItem {
  id: string;
  engagementId: string | null;
  companyId: string;
  service: string;
  type: string;
  moduleId: string | null;
  title: string;
  description: string | null;
  customerComment: string | null;
  status: string;
  deadline: string | null;
  cta: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * GET /todos
 */
export async function getTodos(params: { id?: string } = {}): Promise<TodoItem[]> {
  const id = params.id ?? "";
  return dedupeInFlight(`todos:${id || "all"}`, async () => {
    const url = new URL(`${backendUrl}todos`);
    if (params.id) {
      url.searchParams.append("id", params.id);
    }

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to fetch todos");
    }

    const result = await response.json();
    return result.data ?? result;
  });
}

/**
 * PATCH /todos/:id/status
 */
export async function updateTodoStatus(todoId: string, status: string): Promise<void> {
  const response = await fetch(`${backendUrl}todos/${todoId}/status`, {
    method: "PATCH",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to update todo status");
  }
}

/**
 * PATCH /todos/:id
 */
export async function updateTodo(todoId: string, data: Partial<TodoItem>): Promise<TodoItem> {
  const response = await fetch(`${backendUrl}todos/${todoId}`, {
    method: "PATCH",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to update todo");
  }

  const result = await response.json();
  return result.data ?? result;
}
