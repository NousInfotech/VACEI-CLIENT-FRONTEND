// Mock implementation - no backend calls
// Simulate API delay
async function simulateDelay(ms: number = 300) {
  await new Promise(resolve => setTimeout(resolve, ms));
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
  // Simulate API delay
  await simulateDelay(300);
  
  // Mock liquidation project
  return {
    project_id: `project-${companyId}`,
    company_id: companyId,
    project_type: "liquidation",
    liquidation_type: "MVL",
    status: "in_progress",
    start_date: new Date().toISOString(),
    expected_completion: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    liquidator: "Liquidator Name",
    milestones: [
      { id: "1", name: "Initial Filing", status: "Completed", due: new Date().toISOString() },
      { id: "2", name: "Creditor Notification", status: "Upcoming", due: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() },
      { id: "3", name: "Final Distribution", status: "Upcoming", due: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString() },
    ],
    documents: [
      { id: "1", name: "Statement of Affairs", status: "Uploaded" },
      { id: "2", name: "Creditor List", status: "Missing" },
    ],
    invoices: [
      { id: "1", status: "Pending", amount: 5000 },
    ],
  };
}

export async function createLiquidationProject(payload: Omit<LiquidationProject, "project_id">): Promise<LiquidationProject> {
  // Simulate API delay
  await simulateDelay(400);
  
  // Mock response
  return {
    project_id: `project-${Date.now()}`,
    ...payload,
  };
}

export async function updateLiquidationStatus(projectId: string, status: LiquidationStrictStatus): Promise<LiquidationProject> {
  // Simulate API delay
  await simulateDelay(300);
  
  // Mock response - get existing project and update status
  const existing = await getLiquidationProject(projectId.split("-")[1] || "default");
  if (!existing) {
    throw new Error("Project not found");
  }
  
  return {
    ...existing,
    status,
  };
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

