export interface DocumentRequestDocumentSingle {
  _id?: string;
  name: string;
  description?: string;
  status?: string;
  url?: string;
  uploadedAt?: string;
  uploadedFileName?: string;
  type?: string | { type: string };
  template?: {
    url: string;
  };
}

export interface MultipleDocumentItem {
  label: string;
  status?: string;
  url?: string;
  uploadedAt?: string;
  uploadedFileName?: string;
  template?: {
    url?: string;
    instruction?: string;
  };
}

export interface DocumentRequestDocumentMultiple {
  _id: string;
  name: string;
  instruction?: string;
  type?: string | { type: string };
  multiple: MultipleDocumentItem[];
}
