import axios from "axios";
import type { TemplateResponse } from "@/types/serviceTemplate";

/* -------------------------------------------------------------------------- */
/*                                   API                                      */
/* -------------------------------------------------------------------------- */

const api = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_VACEI_BACKEND_URL?.replace(/\/$/, "") ||
    "http://localhost:5000/api/v1",
});

/* -------------------------------------------------------------------------- */
/*                              Auth Interceptor                               */
/* -------------------------------------------------------------------------- */

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

/* -------------------------------------------------------------------------- */
/*                          GET – Active GENERAL Template                       */
/* -------------------------------------------------------------------------- */

export const getActiveGeneralTemplate =
  async (): Promise<TemplateResponse> => {
    const res = await api.get(
      "/service-request-templates/active/general"
    );
    return res.data;
  };

/* -------------------------------------------------------------------------- */
/*                          GET – Active SERVICE Template                       */
/* -------------------------------------------------------------------------- */

export const getActiveServiceTemplate = async (
  service: string,
  customServiceCycleId?: string | null
): Promise<TemplateResponse> => {
  const res = await api.get(
    `/service-request-templates/active/service/${service}`,
    {
      params: { customServiceCycleId }
    }
  );
  return res.data;
};

/* -------------------------------------------------------------------------- */
/*                          GET – Active CUSTOM Templates                       */
/* -------------------------------------------------------------------------- */

export const getActiveCustomTemplates = async (): Promise<{ data: any[] }> => {
  const res = await api.get("/service-request-templates/active/custom");
  return res.data;
};

export default api;
