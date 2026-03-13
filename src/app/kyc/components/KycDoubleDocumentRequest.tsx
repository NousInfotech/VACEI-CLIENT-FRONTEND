"use client"

import React from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Eye, 
  Download,
  FileUp, 
  Upload, 
  RefreshCw, 
  Info,
  FileText,
  Eraser
} from "lucide-react"
import { downloadFile, type RequestedDocument } from "@/api/kycService"
interface KycDoubleDocumentRequestProps {
  requestId: string
  multipleDocuments: RequestedDocument[]
  onUpload: (requestId: string, documentId: string, file: File) => void | Promise<void>
  onClearDocument?: (requestId: string, documentId: string) => void | Promise<void>
  isDisabled?: boolean
  uploadingId?: string | null
}

const KycDoubleDocumentRequest: React.FC<KycDoubleDocumentRequestProps> = ({
  requestId,
  multipleDocuments,
  onUpload,
  onClearDocument,
  isDisabled,
  uploadingId
}) => {
  if (!multipleDocuments || multipleDocuments.length === 0) return null

  return (
    <div className="space-y-4">
      {multipleDocuments.map((group) => (
        <div
          key={group.id}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
        >
          {/* Group Header */}
          <div className="p-4 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-xl shadow-xs text-gray-400 border border-gray-100">
                <FileUp size={18} />
              </div>
              <p className="font-bold text-gray-900 uppercase tracking-tight">{group.documentName}</p>
            </div>
            {group.templateFile?.url && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(group.templateFile!.url, '_blank')}
                className="h-8 border-amber-200 text-amber-700 hover:bg-amber-50 rounded-xl gap-2 font-bold px-3"
              >
                <FileText size={14} />
                <span className="text-[10px]">Group Template</span>
              </Button>
            )}
          </div>

          {/* Children List */}
          <div className="divide-y divide-gray-50">
            {group.children?.map((item) => {
              const isUploading = uploadingId === item.id
              const itemStatus = (item.status || "").toUpperCase()
              const fileUrl = item.file?.url
              const isRejected = itemStatus === 'REJECTED'

              return (
                <div key={item.id} className="p-4 flex items-center justify-between hover:bg-gray-50/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="text-sm font-bold text-gray-700">{item.documentName}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge 
                          variant="outline" 
                          className={`text-[9px] font-bold uppercase tracking-wider h-4 px-1.5 ${
                            isRejected 
                              ? "text-rose-600 border-rose-200 bg-rose-50" 
                              : itemStatus === 'ACCEPTED' || itemStatus === 'UPLOADED'
                              ? "text-emerald-600 border-emerald-200 bg-emerald-50"
                              : "text-blue-600 border-blue-200 bg-blue-50"
                          }`}
                        >
                          {itemStatus || 'PENDING'}
                        </Badge>
                      </div>
                      {isRejected && item.rejectionReason && (
                        <div className="text-[9px] bg-rose-50 text-rose-700 p-1.5 rounded-lg border border-rose-100 flex items-start gap-1.5 mt-1.5 max-w-md">
                          <Info className="w-2.5 h-2.5 mt-0.5 shrink-0" />
                          <span className="leading-tight">{item.rejectionReason}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* 1. Upload Button */}
                    {(!fileUrl || isRejected) && (
                      <label className={isDisabled || itemStatus === 'ACCEPTED' ? "cursor-not-allowed opacity-50" : "cursor-pointer"}>
                        <input
                          type="file"
                          className="hidden"
                          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            e.target.value = ""
                            if (file) onUpload(requestId, item.id, file)
                          }}
                          disabled={isDisabled || itemStatus === 'ACCEPTED'}
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 border-blue-200 hover:bg-blue-50 text-blue-700 font-bold rounded-xl text-xs px-3"
                          disabled={isDisabled || itemStatus === 'ACCEPTED'}
                          asChild
                        >
                          <span>
                            {isUploading ? (
                              <RefreshCw size={12} className="mr-1.5 animate-spin" />
                            ) : (
                              <Upload size={12} className="mr-1.5" />
                            )}
                            {isRejected ? "Reupload" : "Upload"}
                          </span>
                        </Button>
                      </label>
                    )}

                    {/* 2 & 3. Download and View Buttons */}
                    {fileUrl && (
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => downloadFile(fileUrl, item.file?.file_name || 'document')}
                          className="h-8 w-8 p-0 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="Download Document"
                        >
                          <Download size={16} />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => window.open(fileUrl, "_blank")}
                          className="h-8 w-8 p-0 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="View Document"
                        >
                          <Eye size={16} />
                        </Button>
                      </div>
                    )}

                    {/* 4. Clear Button */}
                    {onClearDocument && fileUrl && itemStatus !== 'ACCEPTED' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onClearDocument(requestId, item.id)}
                        className="h-8 w-8 p-0 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                        title="Clear Document"
                        disabled={isDisabled}
                      >
                        <Eraser/>
                      </Button>
                    )}

                    {/* 5. Template Button */}
                    {item.type === "TEMPLATE" && item.templateFile?.url && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(item.templateFile!.url, "_blank")}
                        className="h-8 border-amber-200 text-amber-700 hover:bg-amber-50 rounded-xl gap-2 font-bold px-3"
                        title="Download Template"
                      >
                        <FileText size={12} />
                        <span className="text-[10px]">Template</span>
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

export default KycDoubleDocumentRequest
