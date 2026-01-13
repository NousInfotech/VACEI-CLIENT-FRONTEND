const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/?$/, "/") || "";

function getAuthHeaders(): Record<string, string> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(
  method: string,
  endpoint: string,
  {
    params = {},
    body = null,
  }: {
    params?: Record<string, any>;
    body?: Record<string, any> | null;
  } = {}
) {
  const url = new URL(`${backendUrl}${endpoint}`);
  if (method === "GET" && params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.append(key, String(value));
      }
    });
  }
  const headers: Record<string, string> = {
    ...getAuthHeaders(),
  };
  if (body !== null) {
    headers["Content-Type"] = "application/json";
  }
  const res = await fetch(url.toString(), {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  });
  const isJson = res.headers.get("Content-Type")?.includes("application/json");
  const data = isJson ? await res.json() : await res.text();
  if (!res.ok) {
    throw new Error((isJson && data?.error) || data || `API request failed: ${res.status}`);
  }
  return res.status === 204 ? null : data;
}

export type LiquidationStrictStatus = "draft" | "in_progress" | "waiting_on_you" | "completed";

export interface LiquidationMilestone {
  id: string;
  name: string;
  due?: string;
  status: "Completed" | "Upcoming";
  cta?: "Upload" | "View";
}

export interface LiquidationDocument {
  id: string;
  name: string;
  status: "Uploaded" | "Approved" | "Filed" | "Missing";
  url?: string;
}

export interface LiquidationInvoice {
  id: string;
  status: string;
  amount?: number;
  url?: string;
}

export interface LiquidationProject {
  project_id: string;
  company_id: string;
  project_type: "liquidation";
  liquidation_type: "MVL" | "CVL" | "Strike-off";
  status: LiquidationStrictStatus;
  start_date: string;
  expected_completion: string;
  liquidator: string;
  milestones: LiquidationMilestone[];
  documents: LiquidationDocument[];
  invoices: LiquidationInvoice[];
}

export async function getLiquidationProject(companyId: string): Promise<LiquidationProject | null> {
  const result = await request("GET", "liquidations/projects", { params: { companyId } });
  const list: LiquidationProject[] = result?.data || result || [];
  if (!Array.isArray(list) || list.length === 0) return null;
  return list.find((p) => p.company_id === companyId) || list[0] || null;
}

export async function createLiquidationProject(payload: Omit<LiquidationProject, "project_id">): Promise<LiquidationProject> {
  const result = await request("POST", "liquidations/projects", { body: payload });
  return result?.data || result;
}

export async function updateLiquidationStatus(projectId: string, status: LiquidationStrictStatus): Promise<LiquidationProject> {
  const result = await request("PATCH", `liquidations/projects/${projectId}/status`, { body: { status } });
  return result?.data || result;
}

import { fetchTasks, fetchTaskCategories, fetchTaskStatuses, createOrUpdateTask, deleteTask } from "@/api/taskService";

function normalizeDate(d?: string) {
  if (!d) return undefined;
  const parsed = new Date(d);
  if (isNaN(parsed.getTime())) return undefined;
  return parsed.toISOString();
}

export async function upsertComplianceTasksForMilestones(project: LiquidationProject) {
  const categories = await fetchTaskCategories();
  const statuses = await fetchTaskStatuses();
  const statusIdFor = (name: string) => {
    const match = statuses.find((s: any) => (s.name || "").toLowerCase().includes(name.toLowerCase()));
    return match?.id || statuses[0]?.id || 1;
  };
  const corporateCategory = categories.find((c: any) => (c.name || "").toLowerCase().includes("corporate"));
  const categoryId = corporateCategory?.id || categories[0]?.id;
  for (const m of project.milestones) {
    if (!m.due) continue;
    const search = `${m.name}`;
    const existing = await fetchTasks({ page: 1, limit: 5, search });
    const dueIso = normalizeDate(m.due);
    const waiting = m.cta === "Upload";
    const completed = m.status === "Completed";
    const statusId = completed ? statusIdFor("completed") : waiting ? statusIdFor("waiting") : statusIdFor("in progress");
    if (existing.data && existing.data.length > 0) {
      const t = existing.data[0];
      await createOrUpdateTask(
        {
          title: search,
          description: "Liquidation statutory milestone",
          statusId,
          categoryId,
          assignedToIds: [],
          dueDate: dueIso,
        },
        t.id
      );
    } else {
      await createOrUpdateTask({
        title: search,
        description: "Liquidation statutory milestone",
        statusId,
        categoryId,
        assignedToIds: [],
        dueDate: dueIso,
      });
    }
  }
}

export async function removeCompletedComplianceTasks(project: LiquidationProject) {
  const completed = project.milestones.filter((m) => m.status === "Completed");
  for (const m of completed) {
    const search = `${m.name}`;
    const existing = await fetchTasks({ page: 1, limit: 10, search });
    for (const t of existing.data || []) {
      await deleteTask(t.id);
    }
  }
}

