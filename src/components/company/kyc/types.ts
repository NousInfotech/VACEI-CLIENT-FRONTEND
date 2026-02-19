export interface FileResponse {
  id: string;
  url: string;
  file_name: string;
  size: number;
  mime_type: string;
}

export interface RequestedDocument {
  id: string;
  documentRequestId: string;
  parentId?: string | null;
  documentName: string;
  type: 'DIRECT' | 'TEMPLATE';
  count: 'SINGLE' | 'MULTIPLE';
  isMandatory: boolean;
  status: 'PENDING' | 'UPLOADED' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
  fileId?: string | null;
  templateFileId?: string | null;
  file?: FileResponse | null;
  templateFile?: FileResponse | null;
  children?: RequestedDocument[];
}

export interface KycDocumentRequest {
  id: string;
  title: string;
  description?: string;
  status: string;
  requestedDocuments: RequestedDocument[];
}

export interface KycWorkflowItem {
  id: string;
  kycCycleId: string;
  personId?: string;
  companyId?: string;
  status: string;
  documentRequest: KycDocumentRequest;
  person?: {
    id: string;
    name: string;
    address?: string;
    nationality?: string;
  };
}

export interface KycCycle {
  id: string;
  companyId: string;
  status: string;
  workflowType: 'Shareholder' | 'Representative';
  involvementKycs: KycWorkflowItem[];
}
