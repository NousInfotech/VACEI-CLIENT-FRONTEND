import React, { useState } from "react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
 
import { RefreshCw, Eye, Download, FileEdit, FileUp, Upload, FileIcon } from "lucide-react";
import { RequestedDocument } from "./types";

interface UploadingDocumentState {
  documentId?: string;
}

function SingleDocUploadCell({
  requestId,
  documentId,
  isUploading,
  isDisabled,
  isRejected,
  onUpload,
  formatFileSize,
  accept,
}: {
  requestId: string;
  documentId: string;
  isUploading: boolean;
  isDisabled: boolean;
  isRejected?: boolean;
  onUpload: (requestId: string, documentId: string, file: File) => void | Promise<void>;
  formatFileSize: (bytes: number) => string;
  accept: string;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // Reset input immediately so the same file can be selected again next time
    e.target.value = "";
    if (!file) return;
    try {
      await onUpload(requestId, documentId, file);
    } catch {
      // error handled by parent
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

  return (
    <label className={isDisabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept={accept}
        onChange={handleFileSelect}
        disabled={isDisabled}
      />
      <Button
        size="sm"
        variant="outline"
        className="border-blue-300 hover:bg-blue-50 hover:text-blue-800 text-blue-700 font-bold"
        title={isRejected ? "Choose file to reupload" : "Choose file to upload"}
        disabled={isDisabled}
        asChild
      >
        <span>
          <Upload className="h-4 w-4 mr-1" />
          {isRejected ? "Reupload" : "Choose File"}
        </span>
      </Button>
    </label>
  );
}

interface DocumentRequestSingleProps {
  /** ID of the parent document request */
  requestId: string;
  /** Array of single-document requirements */
  documents: RequestedDocument[];
  /** Uploading state coming from the parent, used to show spinners/disable inputs */
  uploadingDocument?: UploadingDocumentState | null;
  /** Called when user selects a file for a specific document */
  onUpload: (requestId: string, documentId: string, file: File) => void | Promise<void>;
  /** Called when user clicks "Clear" button to clear file */
  onClearDocument?: (requestId: string, documentId: string) => void | Promise<void>;
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
    return null;
  }

  return (
    <div className="space-y-2">
      {documents.map((doc) => {
        const isUploading = uploadingDocument?.documentId === doc.id;
        const docStatus = (doc.status ?? "").toUpperCase();
        const canUpload = docStatus !== "ACCEPTED"; // Client can't change accepted docs

        const docUrl = doc.file?.url;
        const templateFileUrl = doc.templateFile?.url;

        return (
          <div
            key={doc.id}
            id={doc.id}
            className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 transition-all duration-500"
          >
            <div className="flex items-center gap-3">
              {doc.type === "TEMPLATE" ? (
                <FileEdit className="h-5 w-5 text-gray-600" />
              ) : (
                <FileUp className="h-5 w-5 text-gray-600" />
              )}
              <div>
                <p className="font-medium text-gray-900">{doc.documentName}</p>
                {/* Description logic (V2 doesn't have it on RequestedDocument yet, but keeping for compatibility) */}
                {(doc as any).description && (
                  <div className="flex flex-col gap-1 mt-0.5">
                    {(doc as any).description.split('\n').map((line: string, i: number) => (
                      <p key={i} className="text-xs text-gray-600">{line}</p>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  {doc.isMandatory && (
                    <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50 text-[10px]">
                      Required
                    </Badge>
                  )}
                  <Badge
                    variant="outline"
                    className="text-gray-600 border-gray-300 bg-gray-50 capitalize"
                  >
                    {doc.type.toLowerCase()}
                  </Badge>
                  <Badge variant="outline" className={docStatus === 'REJECTED' ? "text-rose-600 border-rose-300 bg-rose-50" : "text-gray-600 border-gray-300"}>
                    {doc.status}
                  </Badge>
                  {docUrl && doc.createdAt && (
                    <span className="text-xs text-gray-500">
                      Uploaded: {(() => {
                        const date = new Date(doc.createdAt);
                        return isNaN(date.getTime())
                          ? "N/A"
                          : format(date, "MMM dd, yyyy HH:mm");
                      })()}
                    </span>
                  )}
                </div>
                {docStatus === 'REJECTED' && doc.rejectionReason && (
                    <div className="mt-2 text-xs bg-rose-50 text-rose-700 p-2 rounded-lg border border-rose-100 flex items-start gap-2">
                        <span className="font-bold">Reason:</span>
                        <span>{doc.rejectionReason}</span>
                    </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1">
              {(!docUrl || docStatus === 'REJECTED') && (
                <SingleDocUploadCell
                  requestId={requestId}
                  documentId={doc.id}
                  isUploading={isUploading}
                  isDisabled={isDisabled || !canUpload}
                  isRejected={docStatus === 'REJECTED'}
                  onUpload={onUpload}
                  formatFileSize={formatFileSize}
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
                />
              )}
              {docUrl && (
                <>
                  <span className="text-xs text-gray-600 mr-1 truncate max-w-[120px]" title={doc.file?.file_name ?? "File"}>
                    {doc.file?.file_name ?? "File"}
                    {doc.file?.size != null && (
                      <span className="text-gray-400 ml-1">
                        ({formatFileSize(doc.file.size)})
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
                        link.download = doc.file?.file_name || doc.documentName;
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
                  onClick={() => onClearDocument(requestId, doc.id)}
                  className="border-yellow-300 hover:bg-yellow-50 hover:text-yellow-800 text-yellow-700 h-8 px-2 text-xs"
                  title="Clear Uploaded File"
                  disabled={isDisabled || !canUpload}
                >
                  Clear
                </Button>
              )}

               {/* Template download button */}
              {doc.type === "TEMPLATE" && templateFileUrl && (
                <Button
                  size="sm"
                  variant="outline"
                  className="border-amber-300 text-amber-700 hover:bg-amber-700/20 hover:text-amber-700"
                  title="View Template"
                  disabled={isDisabled}
                  asChild
                >
                  <a
                    href={templateFileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center h-8 w-8 p-0 ${isDisabled ? 'pointer-events-none opacity-50' : ''}`}
                  >  
                    <span><FileIcon className="h-4 w-4"/></span>
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