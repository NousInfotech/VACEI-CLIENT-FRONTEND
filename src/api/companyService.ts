const backendUrl =
  process.env.NEXT_PUBLIC_VACEI_BACKEND_URL?.replace(/\/?$/, "/") ||
  "http://localhost:5000/api/v1/";

function getAuthHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("token") || "";
  return { Authorization: `Bearer ${token}` };
}

export interface SidebarServiceData {
  serviceName: string;
  customServiceCycleId?: string | null;
  activeEngagements: { id: string; name: string | null }[];
  worstCompliance:
  | "OVERDUE"
  | "DUE_TODAY"
  | "DUE_SOON"
  | "ACTION_REQUIRED"
  | "ACTION_TAKEN"
  | "COMPLETED"
  | "ON_TRACK";
}

export const fetchSidebarData = async (
  companyId: string
): Promise<SidebarServiceData[]> => {
  const response = await fetch(`${backendUrl}companies/${companyId}/sidebar`, {
    method: "GET",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to fetch sidebar data");
  }

  const result = await response.json();

  // ✅ Log full API response
  console.log("Sidebar API Full Response:", result);

  // ✅ Log only sidebar data
  console.log("Sidebar Data:", result.data);

  return result.data;
};

export const getCompanyProfile = async (companyId: string): Promise<any> => {
  const response = await fetch(`${backendUrl}companies/${companyId}`, {
    method: "GET",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to fetch company profile");
  }

  const result = await response.json();
  return result.data;
};

export const updateCompanyProfile = async (companyId: string, payload: any): Promise<any> => {
  const response = await fetch(`${backendUrl}companies/${companyId}`, {
    method: "PUT",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to update company profile");
  }

  const result = await response.json();
  return result.data;
};
