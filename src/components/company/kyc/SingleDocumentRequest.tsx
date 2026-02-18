import React, { useState } from "react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
 
import { Eye, Download, FileEdit, FileUp, Upload, RefreshCw, File as FileIcon } from "lucide-react";
import { DocumentRequestDocumentSingle } from "./types";

interface UploadingDocumentState {
  documentRequestId?: string;
  documentIndex?: number;
}

function SingleDocUploadCell({
  requestId,
  docIndex,
  isUploading,
  isDisabled,
  onUpload,
  formatFileSize,
  accept,
}: {
  requestId: string;
  docIndex: number;
  isUploading: boolean;
  isDisabled: boolean;
  onUpload: (requestId: string, docIndex: number, file: File) => void | Promise<void>;
  formatFileSize: (bytes: number) => string;
  accept: string;
}) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setSelectedFile(file);
    e.target.value = "";
  };

  const handleUploadClick = async () => {
    if (!selectedFile) return;
    try {
      await onUpload(requestId, docIndex, selectedFile);
      setSelectedFile(null); // Clear only on success (retry possible on failure)
    } catch {
      // Keep selectedFile so user can retry
    }
  };

  if (isUploading) {
    return (
      <div className="flex items-center gap-2">
        <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
        <span className="text-xs text-gray-500">Uploading...</span>
      </div>
    );
  }

  if (selectedFile) {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-gray-600 max-w-[140px] truncate" title={selectedFile.name}>
          {selectedFile.name} ({formatFileSize(selectedFile.size)})
        </span>
        <Button
          size="sm"
          variant="outline"
          className="border-blue-300 hover:bg-blue-50 hover:text-blue-800 text-blue-700 h-8 px-3"
          onClick={handleUploadClick}
          disabled={isDisabled}
        >
          <Upload className="h-4 w-4 mr-1" />
          Upload
        </Button>
        <label className="cursor-pointer">
          <input type="file" className="hidden" accept={accept} onChange={handleFileSelect} disabled={isDisabled} />
          <Button size="sm" variant="outline" className="h-8 px-2 text-xs" asChild disabled={isDisabled}>
            <span>Change</span>
          </Button>
        </label>
      </div>
    );
  }

  return (
    <label className={isDisabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}>
      <input
        type="file"
        className="hidden"
        accept={accept}
        onChange={handleFileSelect}
        disabled={isDisabled}
      />
      <Button
        size="sm"
        variant="outline"
        className="border-blue-300 hover:bg-blue-50 hover:text-blue-800 text-blue-700"
        title="Choose file to upload"
        disabled={isDisabled}
        asChild
      >
        <span>
          <Upload className="h-4 w-4 mr-1" />
          Choose File
        </span>
      </Button>
    </label>
  );
}

interface DocumentRequestSingleProps {
  /** ID of the parent document request */
  requestId: string;
  /** Array of single-document requirements */
  documents: DocumentRequestDocumentSingle[];
  /** Uploading state coming from the parent, used to show spinners/disable inputs */
  uploadingDocument?: UploadingDocumentState | null;
  /** Called when user selects a file for a specific document (single file only) */
  onUpload: (requestId: string, documentIndex: number, file: File) => void | Promise<void>;
  /** Called when user clicks "Clear" button to clear file only */
  onClearDocument?: (requestId: string, documentIndex: number, documentName: string) => void | Promise<void>;
  isDisabled?: boolean;
  isClientView?: boolean;
}

const DocumentRequestSingle: React.FC<DocumentRequestSingleProps> = ({
  requestId,
  documents,
  uploadingDocument,
  onUpload,
  onClearDocument,
  isDisabled,
  isClientView = false,
}) => {
 

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (!documents || documents.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500 text-sm bg-white rounded-lg">
        No documents in this request yet
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {documents.map((doc, docIndex) => {
        const docType =
          typeof doc.type === "string" ? doc.type : (doc as any).type?.type || "direct";
        const isUploading =
          uploadingDocument?.documentRequestId === requestId &&
          uploadingDocument?.documentIndex === docIndex;
        const docStatus = (doc.status ?? "").toUpperCase();
        const canUpload = docStatus !== "REJECTED";

        const docUrl = doc.url ?? (doc as any)?.file?.url
        return (
          <div
            key={doc._id ?? doc.id ?? `${requestId}-${docIndex}`}
            className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200"
          >
            <div className="flex items-center gap-3">
              {docType === "template" ? (
                <FileEdit className="h-5 w-5 text-gray-600" />
              ) : (
                <FileUp className="h-5 w-5 text-gray-600" />
              )}
              <div>
                <p className="font-medium text-gray-900">{doc.name}</p>
                {doc.description && (
                  <div className="flex flex-col gap-1 mt-0.5">
                    {doc.description.split('\n').map((line: string, i: number) => (
                      <p key={i} className="text-xs text-gray-600">{line}</p>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  {(doc as any).isMandatory && (
                    <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50 text-[10px]">
                      Required
                    </Badge>
                  )}
                  {docType === "template" ? (
                    <Badge
                      variant="outline"
                      className="text-gray-600 border-gray-300 bg-gray-50"
                    >
                      Template
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="text-gray-600 border-gray-300 bg-gray-50"
                    >
                      Direct
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-gray-600 border-gray-300">
                    {typeof doc.status === "string"
                      ? doc.status
                      : String(doc.status || "pending")}
                  </Badge>
                  {docUrl && doc.uploadedAt && (
                    <span className="text-xs text-gray-500">
                      Uploaded: {(() => {
                        const date = new Date(doc.uploadedAt);
                        return isNaN(date.getTime())
                          ? "N/A"
                          : format(date, "MMM dd, yyyy HH:mm");
                      })()}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {!docUrl ? (
                <SingleDocUploadCell
                  requestId={requestId}
                  docIndex={docIndex}
                  isUploading={isUploading}
                  isDisabled={isDisabled || !canUpload}
                  onUpload={onUpload}
                  formatFileSize={formatFileSize}
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
                />
              ) : (
                <>
                  <span className="text-xs text-gray-600 mr-1 truncate max-w-[120px]" title={(doc.uploadedFileName ?? doc.name) ?? "File"}>
                    {(doc.uploadedFileName ?? (doc as any)?.file?.file_name ?? doc.name) ?? "File"}
                    {(doc as any)?.file?.size != null && (
                      <span className="text-gray-400 ml-1">
                        ({formatFileSize((doc as any).file.size)})
                      </span>
                    )}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(docUrl!, "_blank")}
                    className="border-blue-300 hover:bg-blue-50 hover:text-blue-800 text-blue-700 h-8 w-8 p-0"
                    title="View Document"
                    disabled={isDisabled}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={async () => {
                      try {
                        const response = await fetch(docUrl!);
                        const blob = await response.blob();
                        const url = window.URL.createObjectURL(blob);
                        const link = document.createElement("a");
                        link.href = url;
                        link.download = doc.uploadedFileName || doc.name;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        window.URL.revokeObjectURL(url);
                      } catch (error) {
                        console.error("Download error:", error);
                      }
                    }}
                    className="border-green-300 hover:bg-green-50 hover:text-green-800 text-green-700 h-8 w-8 p-0"
                    title="Download Document"
                    disabled={isDisabled}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </>
              )}

              {/* Clear (reset) only the uploaded file, keep requirement row */}
              {onClearDocument && docUrl && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onClearDocument(requestId, docIndex, doc.name)}
                  className="border-yellow-300 hover:bg-yellow-50 hover:text-yellow-800 text-yellow-700 h-8 px-2 text-xs"
                  title="Clear Uploaded File"
                  disabled={isDisabled}
                >
                  Clear
                </Button>
              )}

               {/* Template download button - always available for template documents,
                  so users can re-open the original blank template even after upload. */}
              {docType === "template" && (doc as any).template?.url && (
                <Button
                  size="sm"
                  variant="outline"
                  className="border-amber-300 text-amber-700 hover:bg-amber-700/20 hover:text-amber-700"
                  title="View Template"
                  disabled={isDisabled}
                  asChild
                >
                  <a
                    href={(doc as any).template.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center h-8 w-8 p-0 ${isDisabled ? 'pointer-events-none opacity-50' : ''}`}
                  >  
                    <span><FileIcon/></span>
                  </a>
                  
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DocumentRequestSingle;