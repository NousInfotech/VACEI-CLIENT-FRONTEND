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
  Trash2,
  Eraser
} from "lucide-react"
import { downloadFile } from "@/api/kycService"

import { useKyc } from "../context/KycContext"

export interface DocumentFile {
  id: string
  file_name: string
  url: string
}

export interface RequestedDocument {
  id: string
  documentName: string
  type: 'DIRECT' | 'TEMPLATE'
  count: 'SINGLE' | 'MULTIPLE'
  isMandatory: boolean
  status: string
  file: DocumentFile | null
  templateFile: DocumentFile | null
  rejectionReason?: string
  children?: RequestedDocument[]
}

interface KycSingleDocumentRequestProps {
  requestId: string
  documents: RequestedDocument[]
  onUpload: (requestId: string, documentId: string, file: File) => void | Promise<void>
  onClearDocument?: (requestId: string, documentId: string) => void | Promise<void>
  isDisabled?: boolean
  uploadingId?: string | null
}

const KycSingleDocumentRequest: React.FC<KycSingleDocumentRequestProps> = ({
  requestId,
  documents,
  onUpload,
  onClearDocument,
  isDisabled,
  uploadingId
}) => {
  if (!documents || documents.length === 0) return null

  return (
    <div className="space-y-3">
      {documents.map((doc) => {
        const isUploading = uploadingId === doc.id
        const docStatus = (doc.status || "").toUpperCase()
        const docUrl = doc.file?.url
        const templateFileUrl = doc.templateFile?.url
        const isRejected = docStatus === 'REJECTED'

        return (
          <div
            key={doc.id}
            className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 shadow-sm transition-all hover:border-blue-100"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
                <FileUp className="h-5 w-5" />
              </div>
              <div>
                <p className="font-bold text-gray-900">{doc.documentName}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  {doc.isMandatory && (
                    <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50 text-[10px] font-bold uppercase tracking-wider">
                      Required
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-gray-500 border-gray-200 bg-gray-50 text-[10px] font-bold uppercase tracking-wider">
                    {doc.type}
                  </Badge>
                  <Badge 
                    variant="outline" 
                    className={`text-[10px] font-bold uppercase tracking-wider ${
                      isRejected 
                        ? "text-rose-600 border-rose-200 bg-rose-50" 
                        : docStatus === 'ACCEPTED' || docStatus === 'UPLOADED'
                        ? "text-emerald-600 border-emerald-200 bg-emerald-50"
                        : "text-blue-600 border-blue-200 bg-blue-50"
                    }`}
                  >
                    {docStatus || 'PENDING'}
                  </Badge>
                </div>
                {isRejected && doc.rejectionReason && (
                  <div className="text-[10px] bg-rose-50 text-rose-700 p-2 rounded-lg border border-rose-100 flex items-start gap-2 mt-2">
                    <Info className="w-3 h-3 mt-0.5 shrink-0" />
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold uppercase tracking-wider text-[9px] opacity-70">Reason for rejection</span>
                      <span className="leading-relaxed">{doc.rejectionReason}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* 1. Upload Button */}
              {(!docUrl || isRejected) && (
                <label className={isDisabled || docStatus === 'ACCEPTED' ? "cursor-not-allowed opacity-50" : "cursor-pointer"}>
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      e.target.value = ""
                      if (file) onUpload(requestId, doc.id, file)
                    }}
                    disabled={isDisabled || docStatus === 'ACCEPTED'}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-blue-200 hover:bg-blue-50 text-blue-700 font-bold rounded-xl h-9 px-4"
                    disabled={isDisabled || docStatus === 'ACCEPTED'}
                    asChild
                  >
                    <span>
                      {isUploading ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4 mr-2" />
                      )}
                      {isRejected ? "Reupload" : "Upload"}
                    </span>
                  </Button>
                </label>
              )}

              {/* 2 & 3. Download and View Buttons */}
              {docUrl && (
                <div className="flex items-center gap-1.5">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => downloadFile(docUrl, doc.file?.file_name || 'document')}
                    className="border-gray-200 hover:bg-gray-50 text-gray-400 hover:text-blue-600 h-9 w-9 p-0 rounded-xl"
                    title="Download Document"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(docUrl, "_blank")}
                    className="border-gray-200 hover:bg-gray-50 text-gray-400 hover:text-blue-600 h-9 w-9 p-0 rounded-xl"
                    title="View Document"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {/* 4. Clear Button */}
              {onClearDocument && docUrl && docStatus !== 'ACCEPTED' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onClearDocument(requestId, doc.id)}
                  className="border-gray-200 hover:bg-gray-50 text-gray-400 hover:text-rose-600 h-9 w-9 p-0 rounded-xl"
                  title="Clear Document"
                  disabled={isDisabled}
                >
                  <Eraser/>
                </Button>
              )}

              {/* 5. Template Button */}
              {doc.type === "TEMPLATE" && templateFileUrl && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.open(templateFileUrl, "_blank")}
                  className="border-amber-200 text-amber-700 hover:bg-amber-50 h-9 px-3 rounded-xl gap-2"
                  title="Download Template"
                >
                  <FileText className="h-4 w-4" />
                  <span className="text-xs font-bold">Template</span>
                </Button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default KycSingleDocumentRequest
