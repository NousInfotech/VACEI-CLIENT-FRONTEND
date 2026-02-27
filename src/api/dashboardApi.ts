const backendUrl =
  process.env.NEXT_PUBLIC_VACEI_BACKEND_URL?.replace(/\/?$/, "/") ||
  "http://localhost:5000/api/v1/";

function getAuthHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("token") || "";
  return { Authorization: `Bearer ${token}` };
}

export interface DashboardSummary {
  focus: {
    serviceName: string;
    taskDescription: string;
    status: string;
    primaryActionLabel: string;
    todoId: string;
  } | null;
  counts: {
    overdue: number;
    dueSoon: number;
    dueToday: number;
    pending: number;
    waiting: number;
    activeServices: number;
  };
  upcomingCompliance: Array<{
    id: string;
    title: string;
    dueDate: string;
    serviceCategory: string;
  }>;
  activeEngagements: Array<{
    id: string;
    name: string;
    serviceCategory: string;
    status: string;
  }>;
}

export const fetchDashboardSummary = async (companyId: string): Promise<DashboardSummary> => {
  const response = await fetch(`${backendUrl}dashboard/summary?companyId=${companyId}`, {
    method: "GET",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to fetch dashboard summary");
  }

  const result = await response.json();
  return result.data;
};
