import React from "react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
 
import { Eye, Download, FileEdit, FileUp, Upload, RefreshCw, Eraser, File as FileIcon } from "lucide-react";
import { RequestedDocument } from "./types";

interface UploadingMultipleState {
  documentId?: string;
}

interface DocumentRequestMultipleProps {
  /** ID of the parent document request */
  requestId: string;
  /** Array of grouped (multi) documents */
  multipleDocuments: RequestedDocument[];
  /** Uploading state coming from the parent, used to show spinners/disable inputs */
  uploadingState?: UploadingMultipleState | null;
  /**
   * Called when user selects one or more files for a grouped document.
   */
  onUploadMultiple: (
    requestId: string,
    requestedDocumentId: string,
    files: FileList
  ) => void | Promise<void>;
  /** Called when user clicks "Clear" button to clear file only for a specific item */
  onClearMultipleItem?: (
    requestId: string,
    requestedDocumentId: string
  ) => void | Promise<void>;
  /** Called when user wants to clear all files in a multiple document group */
  onClearMultipleGroup?: (
    requestId: string,
    multipleDocumentId: string,
    groupName: string
  ) => void | Promise<void>;
  /** Called when user wants to download all files from a multiple document group */
  onDownloadMultipleGroup?: (
    requestId: string,
    multipleDocumentId: string,
    groupName: string,
    items: RequestedDocument[]
  ) => void | Promise<void>;
  isDisabled?: boolean;
  isClientView?: boolean;
}

const DocumentRequestDouble: React.FC<DocumentRequestMultipleProps> = ({
  requestId,
  multipleDocuments,
  uploadingState,
  onUploadMultiple,
  onClearMultipleItem,
  onClearMultipleGroup,
  onDownloadMultipleGroup,
  isDisabled,
  isClientView = false,
}) => {
  if (!multipleDocuments || multipleDocuments.length === 0) {
    return null;
  }

  const renderItemStatus = (item: RequestedDocument) => {
    const isRejected = (item.status ?? "").toUpperCase() === "REJECTED";
    return (
      <Badge variant="outline" className={isRejected ? "text-rose-600 border-rose-300 bg-rose-50" : "text-gray-600 border-gray-300"}>
        {item.status}
      </Badge>
    );
  };

  return (
    <div className="space-y-3 mt-4">
      {multipleDocuments.map((group) => {
        const isUploading = uploadingState?.documentId === group.id;

        return (
          <div
            key={group.id}
            id={group.id}
            className="p-3 bg-white rounded-lg border border-gray-200 space-y-3 transition-all duration-500"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1">
                {group.type === "TEMPLATE" ? (
                  <FileEdit className="h-5 w-5 text-gray-600 mt-1" />
                ) : (
                  <FileUp className="h-5 w-5 text-gray-600 mt-1" />
                )}
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-gray-900">{group.documentName}</p>
                    <Badge
                      variant="outline"
                      className="text-gray-600 border-gray-300 bg-gray-50 capitalize"
                    >
                      {group.type.toLowerCase()}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-1 shrink-0">
                {group.type === "TEMPLATE" && group.templateFile?.url && (
                   <Button
                    size="sm"
                    variant="outline"
                    className="border-amber-300 text-amber-700 hover:bg-amber-700/20 hover:text-amber-700 h-8 w-8 p-0"
                    title="Download Group Template"
                    disabled={isDisabled}
                    asChild
                  >
                    <a
                      href={group.templateFile.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={isDisabled ? 'pointer-events-none opacity-50' : ''}
                    >  
                      <FileIcon className="h-4 w-4"/>
                    </a>
                  </Button>
                )}
                {group.children && group.children.some((item) => item.file?.url) && onDownloadMultipleGroup && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const uploadedItems = group.children!.filter((item) => item.file?.url);
                      onDownloadMultipleGroup(requestId, group.id, group.documentName, uploadedItems);
                    }}
                    className="border-green-300 hover:bg-green-50 hover:text-green-800 text-green-700 h-8 px-3"
                    title="Download All Files"
                    disabled={isDisabled}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    <span className="text-xs">Download All</span>
                  </Button>
                )}
              </div>
            </div>
          
            {group.children && group.children.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-gray-100">
                {group.children.map((item) => {
                  const itemUrl = item.file?.url;
                  const templateUrl = item.templateFile?.url;
                  const isItemUploading = uploadingState?.documentId === item.id;
                  const itemStatus = (item.status ?? "").toUpperCase();

                  return (
                    <div
                      key={item.id}
                      id={item.id}
                      className="flex flex-col gap-2 border border-gray-100 p-3 rounded-md transition-all duration-500"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            {item.documentName}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                            {renderItemStatus(item)}
                            {itemUrl && item.createdAt && (
                              <span className="text-xs text-gray-500">
                                Uploaded: {(() => {
                                  const date = new Date(item.createdAt);
                                  return isNaN(date.getTime())
                                    ? "N/A"
                                    : format(date, "MMM dd, yyyy HH:mm");
                                })()}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          {(!itemUrl || itemStatus === 'REJECTED') && (
                            <label className={`cursor-pointer ${isDisabled ? 'cursor-not-allowed opacity-50' : ''}`}>
                              <input
                                type="file"
                                className="hidden"
                                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const dataTransfer = new DataTransfer();
                                    dataTransfer.items.add(file);
                                    onUploadMultiple(requestId, item.id, dataTransfer.files);
                                  }
                                  e.target.value = "";
                                }}
                                disabled={isItemUploading || isDisabled}
                              />
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-blue-300 hover:bg-blue-50 hover:text-blue-800 text-blue-700 h-8 px-3 font-bold"
                                title={itemStatus === 'REJECTED' ? "Choose file to reupload" : "Upload Document"}
                                disabled={isItemUploading || isDisabled}
                                asChild
                              >
                                <span>
                                  {isItemUploading ? (
                                    <RefreshCw className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <>
                                      <Upload className="h-4 w-4 mr-1" />
                                      {itemStatus === 'REJECTED' ? "Reupload" : "Upload"}
                                    </>
                                  )}
                                </span>
                              </Button>
                            </label>
                          )}

                          {itemUrl && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => window.open(itemUrl!, "_blank")}
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
                                    const response = await fetch(itemUrl!);
                                    const blob = await response.blob();
                                    const url = window.URL.createObjectURL(blob);
                                    const link = document.createElement("a");
                                    link.href = url;
                                    link.download = item.file?.file_name || item.documentName;
                                    document.body.appendChild(link);
                                    link.click();
                                    document.body.removeChild(link);
                                    window.URL.revokeObjectURL(url);
                                  } catch (error) {
                                    console.error("Download error:", error);
                                  }
                                }}
                                className="border-green-300 hover:bg-green-50 hover:text-green-800 text-green-700 h-8 w-8 p-0"
                                title="Download Uploaded Document"
                                disabled={isDisabled}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </>
                          )}

                          {onClearMultipleItem && itemUrl && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onClearMultipleItem(requestId, item.id)}
                              className="border-yellow-300 hover:bg-yellow-50 hover:text-yellow-800 text-yellow-700 h-8 px-2 text-xs"
                              title="Clear Uploaded File"
                              disabled={isDisabled}
                            >
                              Clear
                            </Button>
                          )}
                           
                          {templateUrl && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-amber-300 hover:bg-amber-50 hover:text-amber-700 text-amber-700"
                              title="Download Template"
                              disabled={isDisabled}
                              asChild
                            >
                              <a
                                href={templateUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`inline-flex items-center gap-1 text-sm ${isDisabled ? 'pointer-events-none opacity-50' : ''}`}
                              >
                                <FileIcon className="h-4 w-4"/>
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                      {itemStatus === 'REJECTED' && item.rejectionReason && (
                        <div className="text-[10px] bg-rose-50 text-rose-700 p-2 rounded-lg border border-rose-100 flex items-start gap-2">
                           <span className="font-bold shrink-0">Reason:</span>
                           <span>{item.rejectionReason}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default DocumentRequestDouble;