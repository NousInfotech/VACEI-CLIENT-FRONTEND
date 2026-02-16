import api from "./serviceRequestTemplateService";

export interface DetailEntry {
  question: string;
  answer: any;
  attachedFiles?: string[];
}

export interface ServiceRequestPayload {
  companyId: string;
  service: string;
  customServiceCycleId?: string;
}

export interface ServiceRequestUpdatePayload {
  generalDetails?: DetailEntry[];
  serviceDetails?: DetailEntry[];
}

export interface ServiceRequestSubmitPayload {
  generalDetails: DetailEntry[];
  serviceDetails: DetailEntry[];
}

export const createDraft = async (payload: ServiceRequestPayload, files?: File[]) => {
  if (files && files.length > 0) {
    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== undefined) formData.append(key, value);
    });
    files.forEach((file) => formData.append("files", file));
    const res = await api.post("/service-requests", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  }
  const res = await api.post("/service-requests", payload);
  return res.data;
};

export const updateDraft = async (id: string, payload: ServiceRequestUpdatePayload, files?: File[]) => {
  if (files && files.length > 0) {
    const formData = new FormData();
    if (payload.generalDetails) {
      formData.append("generalDetails", JSON.stringify(payload.generalDetails));
    }
    if (payload.serviceDetails) {
      formData.append("serviceDetails", JSON.stringify(payload.serviceDetails));
    }
    files.forEach((file) => formData.append("files", file));
    const res = await api.put(`/service-requests/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  }
  const res = await api.put(`/service-requests/${id}`, payload);
  return res.data;
};

export const submitRequest = async (id: string, payload: ServiceRequestSubmitPayload, files?: File[]) => {
  if (files && files.length > 0) {
    const formData = new FormData();
    formData.append("generalDetails", JSON.stringify(payload.generalDetails));
    formData.append("serviceDetails", JSON.stringify(payload.serviceDetails));
    files.forEach((file) => formData.append("files", file));
    const res = await api.post(`/service-requests/${id}/submit`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  }
  const res = await api.post(`/service-requests/${id}/submit`, payload);
  return res.data;
};

export const getServiceRequestById = async (id: string) => {
  const res = await api.get(`/service-requests/${id}`);
  return res.data;
};

export const listServiceRequests = async (params: {
  companyId?: string;
  service?: string;
  customServiceCycleId?: string;
  status?: string;
  page?: number;
  limit?: number;
}) => {
  const res = await api.get("/service-requests", { params });
  return res.data;
};

export const getUploadFolder = async (id: string) => {
  const res = await api.get(`/service-requests/${id}/upload-folder`);
  return res.data;
};
