"use client"

import React, { useState, useCallback } from 'react'
import { Upload, X, File as FileIcon, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { bulkUploadKycDocuments, type RequestedDocument } from '@/api/kycService'
import { useKyc } from '../context/KycContext'

interface KycBulkUploadZoneProps {
  requestId: string
  documents: RequestedDocument[]
  isDisabled?: boolean
}

const KycBulkUploadZone: React.FC<KycBulkUploadZoneProps> = ({
  requestId,
  documents,
  isDisabled = false,
}) => {
  const { token: kycToken, refreshKyc: onSuccess } = useKyc()
  const [dragActive, setDragActive] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files)
      setFiles(prev => [...prev, ...droppedFiles])
      setError(null)
    }
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files)
      setFiles(prev => [...prev, ...selectedFiles])
      setError(null)
    }
  }

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleUpload = async () => {
    if (files.length === 0) return
    setIsUploading(true)
    setError(null)
    try {
      const result = await bulkUploadKycDocuments(requestId, kycToken, files)
      if (result.success) {
        setFiles([])
        onSuccess()
      } else {
        setError(result.message)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to upload files. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const isItemPending = (doc: RequestedDocument) => {
    const isUploaded = !!(doc.file?.url || doc.status === 'UPLOADED' || doc.status === 'ACCEPTED')
    const isRejected = (doc.status === 'REJECTED')
    return !isUploaded || isRejected
  }

  const allItems = documents.flatMap(doc => doc.count === 'MULTIPLE' ? (doc.children || []) : [doc])
  const uploadedCount = allItems.filter(d => !isItemPending(d)).length
  const totalCount = allItems.length

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="p-4 bg-gray-50/80 border-b border-gray-100 flex items-center justify-between">
          <h5 className="text-sm font-bold text-gray-700 uppercase tracking-wider">
            Required Documents:
          </h5>
          <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg border border-blue-100">
            {uploadedCount}/{totalCount} COMPLETED
          </span>
        </div>

        <div className="divide-y divide-gray-50 max-h-80 overflow-y-auto">
          {documents.map((doc, index) => {
            const hasTemplate = doc.type === 'TEMPLATE' && doc.templateFile?.url
            const templateFileUrl = doc.templateFile?.url

            if (doc.count !== 'MULTIPLE') {
              const isDown = !isItemPending(doc)
              return (
                <div key={doc.id} className="p-3.5 hover:bg-gray-50/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-5 h-5 rounded-full flex items-center justify-center shrink-0 shadow-xs border",
                        isDown ? "bg-emerald-50 border-emerald-100 text-emerald-600" : "bg-blue-50 border-blue-100 text-blue-600"
                      )}>
                        {isDown ? <CheckCircle2 size={12} strokeWidth={3} /> : <span className="text-[10px] font-bold">{index + 1}</span>}
                      </div>
                      <p className={cn("text-sm font-bold", isDown ? "text-gray-400" : "text-gray-700")}>
                        {doc.documentName}
                      </p>
                    </div>
                    {hasTemplate && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation()
                          window.open(templateFileUrl!, "_blank")
                        }}
                        className="border-amber-200 text-amber-700 hover:bg-amber-50 h-8 px-3 rounded-xl gap-2 text-[10px] font-bold uppercase tracking-wider"
                        title="Download Template"
                      >
                        <FileIcon size={12} />
                        Template
                      </Button>
                    )}
                  </div>
                  {doc.status === 'REJECTED' && doc.rejectionReason && (
                    <div className="mt-2 ml-8 bg-rose-50 text-rose-700 p-2 rounded-xl border border-rose-100 flex items-start gap-2 max-w-lg">
                      <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                      <div className="space-y-0.5">
                        <p className="text-[10px] uppercase font-black tracking-wider opacity-60">Rejection Reason</p>
                        <p className="text-[11px] leading-tight font-bold">{doc.rejectionReason}</p>
                      </div>
                    </div>
                  )}
                </div>
              )
            } else {
              return (
                <div key={doc.id} className="p-3.5 space-y-3 bg-gray-50/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0 shadow-xs">
                        <span className="text-[10px] font-bold text-gray-500">{index + 1}</span>
                      </div>
                      <p className="text-sm font-bold text-gray-900 uppercase tracking-tight">{doc.documentName}</p>
                    </div>
                    {hasTemplate && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation()
                          window.open(templateFileUrl!, "_blank")
                        }}
                        className="border-amber-200 text-amber-700 hover:bg-amber-50 h-8 px-3 rounded-xl gap-2 text-[10px] font-bold uppercase tracking-wider"
                        title="Download Template"
                      >
                        <FileIcon size={12} />
                        Template
                      </Button>
                    )}
                  </div>
                  <ul className="ml-10 space-y-2">
                    {doc.children?.map((child, cIdx) => {
                      const isChildDown = !isItemPending(child)
                      return (
                        <li key={child.id} className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", isChildDown ? "bg-emerald-400" : "bg-blue-400")} />
                              <span className={cn("text-[13px] font-medium", isChildDown ? "text-gray-400" : "text-gray-600")}>
                                {child.documentName}
                              </span>
                            </div>
                            {child.type === 'TEMPLATE' && child.templateFile?.url && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  window.open(child.templateFile!.url, "_blank")
                                }}
                                className="border-amber-200 text-amber-700 hover:bg-amber-50 h-7 px-2 rounded-lg gap-1.5 text-[9px] font-bold uppercase tracking-wider"
                                title="Download Template"
                              >
                                <FileIcon size={10} />
                                Template
                              </Button>
                            )}
                          </div>
                          {child.status === 'REJECTED' && child.rejectionReason && (
                            <div className="ml-4 flex items-start gap-1.5 text-rose-600 bg-rose-50/50 px-2 py-1.5 rounded-xl border border-rose-100 max-w-sm">
                              <AlertCircle size={12} className="mt-0.5 shrink-0" />
                              <div className="space-y-0.5">
                                <p className="text-[8px] uppercase font-black tracking-wider opacity-60">Reject Detail</p>
                                <p className="text-[10px] font-bold leading-tight">{child.rejectionReason}</p>
                              </div>
                            </div>
                          )}
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )
            }
          })}
        </div>
      </div>

      <div
        className={cn(
          "relative group cursor-pointer border-2 border-dashed rounded-3xl p-10 transition-all duration-300",
          dragActive ? "border-blue-500 bg-blue-50/50" : "border-gray-200 hover:border-blue-300 hover:bg-gray-50/30",
          isDisabled && "opacity-50 cursor-not-allowed pointer-events-none"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          multiple
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={handleFileChange}
          disabled={isDisabled || isUploading}
        />
        <div className="flex flex-col items-center justify-center text-center">
          <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-4 group-hover:scale-110 transition-transform">
            <Upload size={28} />
          </div>
          <p className="text-gray-900 font-bold mb-1">Click to upload or drag and drop</p>
          <p className="text-gray-400 text-xs font-medium">Automatic matching will find the right slots for your files.</p>
        </div>
      </div>

      {files.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm animate-in slide-in-from-top-4">
          <div className="p-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
            <span className="text-sm font-bold text-gray-700">{files.length} Files Selected</span>
            <button onClick={() => setFiles([])} className="text-xs font-bold text-rose-600 hover:text-rose-700" disabled={isUploading}>Clear All</button>
          </div>
          <div className="max-h-48 overflow-y-auto divide-y divide-gray-50">
            {files.map((file, idx) => (
              <div key={idx} className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-500 shrink-0"><FileIcon size={16} /></div>
                  <p className="text-sm font-semibold text-gray-700 truncate">{file.name}</p>
                </div>
                {!isUploading && (
                  <button onClick={() => removeFile(idx)} className="p-1 text-gray-400 hover:text-rose-500"><X size={16} /></button>
                )}
              </div>
            ))}
          </div>
          <div className="p-4 bg-gray-50/50 border-t border-gray-100">
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-2xl h-11 font-bold shadow-lg shadow-blue-100" onClick={handleUpload} disabled={isUploading}>
              {isUploading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Uploading...</> : `Upload ${files.length} Documents`}
            </Button>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-sm font-bold">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}
    </div>
  )
}

export default KycBulkUploadZone
