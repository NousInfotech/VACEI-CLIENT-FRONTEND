const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/?$/, "/") || "";

// Get auth token from localStorage
function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("token") || "";
  return { Authorization: `Bearer ${token}` };
}

// Generic request function
async function request(method: string, endpoint: string, { params = {}, body = null, isFormData = false } = {}) {
  const url = new URL(`${backendUrl}${endpoint}`);

  // Handle query params for GET requests
  if (method === "GET" && params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.append(key, String(value));
      }
    });
  }

  const headers = getAuthHeaders();
  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(url, {
    method,
    headers,
    body: isFormData ? body : body ? JSON.stringify(body) : null,
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || `API request failed: ${res.status}`);
  }

  // In DELETE some APIs may not return JSON
  if (res.status === 204) return null;
  
  return await res.json();
}
export async function fetchDashboardStats() {
  return await request("GET", "dashboard/fetch-dashboard-stats");
}
