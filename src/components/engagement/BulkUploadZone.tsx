"use client"

import React, { useState, useCallback } from 'react'
import { Upload, X, File as FileIcon, Loader2, AlertCircle, CloudDownload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { bulkUploadDocumentRequestFiles } from '@/api/documentRequestService'

interface BulkUploadZoneProps {
  requestId: string
  onSuccess: () => void
  onClear: (requestId: string, documentId: string) => void
  isDisabled?: boolean
  documents: any[]
}

const BulkUploadZone: React.FC<BulkUploadZoneProps> = ({
  requestId,
  onSuccess,
  onClear,
  isDisabled = false,
  documents
}) => {
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
      await bulkUploadDocumentRequestFiles(requestId, files)
      setFiles([])
      onSuccess()
    } catch (err: any) {
      console.error('Bulk upload failed:', err)
      setError(err.message || 'Failed to upload files. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="p-4 bg-gray-50/80 border-b border-gray-100 flex items-center justify-between">
          <h5 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Requested Documents:</h5>
        </div>
        <div className="divide-y divide-gray-50 max-h-64 overflow-y-auto">
          {documents.filter(doc => {
            const isUploaded = (doc.url || doc.file?.url || doc.fileId);
            const isRejected = (doc.status?.toUpperCase() === 'REJECTED');
            return !isUploaded || isRejected;
          }).length === 0 && (
            <div className="p-10 text-center bg-white/50">
              <p className="text-gray-400 text-xs italic">All requested documents have been uploaded.</p>
            </div>
          )}
          {documents.filter(doc => {
            const isUploaded = (doc.url || doc.file?.url || doc.fileId);
            const isRejected = (doc.status?.toUpperCase() === 'REJECTED');
            return !isUploaded || isRejected;
          }).map((doc, index) => {
            const docId = doc.id ?? doc._id
            const template = doc.templateFile || doc.templateFileId
            
            return (
              <div key={docId || index} className="p-3.5 flex items-center justify-between hover:bg-gray-50/30 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-5 h-5 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0 ml-1.5 shadow-sm">
                    <span className="text-[10px] font-bold text-orange-600">{index + 1}</span>
                  </div>

                  <p className="text-sm font-semibold text-gray-800 truncate">
                    {doc.documentName || doc.name || doc.label || 'Untitled'}
                  </p>
                  {(doc.status?.toUpperCase() === 'REJECTED' && doc.rejectionReason) && (
                    <div className="flex items-start gap-1.5 mt-1 text-[10px] text-rose-600 bg-rose-50/50 p-1.5 rounded-lg border border-rose-100/50">
                      <AlertCircle className="w-3 h-3 shrink-0 mt-0.5" />
                      <span className="leading-tight">Reason: {doc.rejectionReason}</span>
                    </div>
                  )}
                </div>

                {template && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                        const url = typeof template === 'string' ? `/api/files/${template}/download` : template.url;
                        window.open(url, '_blank')
                    }}
                    className="h-8 px-3 text-xs font-bold text-orange-600 hover:text-orange-700 hover:bg-orange-50 flex items-center gap-2 rounded-xl border border-orange-100"
                  >
                    <CloudDownload size={14} />
                    Template
                  </Button>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div
        className={cn(
          "relative group cursor-pointer",
          "border-2 border-dashed rounded-2xl p-8 transition-all duration-200",
          dragActive ? "border-orange-500 bg-orange-50/50" : "border-gray-200 hover:border-orange-300 hover:bg-gray-50/50",
          isDisabled && "opacity-50 cursor-not-allowed pointer-events-none"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id={`bulk-upload-${requestId}`}
          multiple
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={handleFileChange}
          disabled={isDisabled || isUploading}
        />
        
        <div className="flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600 mb-4 group-hover:scale-110 transition-transform">
            <Upload size={24} />
          </div>
          <p className="text-gray-900 font-semibold mb-1">
            Click to upload or drag and drop
          </p>
          <p className="text-gray-500 text-xs">
            Upload multiple documents at once. The system will automatically match them.
          </p>
        </div>
      </div>

      {files.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700">{files.length} Files Selected</span>
            <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setFiles([])} 
                className="h-8 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                disabled={isUploading}
            >
                Clear All
            </Button>
          </div>
          <div className="max-h-48 overflow-y-auto divide-y divide-gray-100">
            {files.map((file, idx) => (
              <div key={idx} className="p-3 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-500 shrink-0">
                    <FileIcon size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                    <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
                {!isUploading && (
                  <button 
                    onClick={() => removeFile(idx)}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
          <div className="p-4 bg-gray-50 border-t border-gray-200">
            <Button 
              className="w-full bg-orange-600 hover:bg-orange-700 text-white rounded-xl h-10 shadow-lg shadow-orange-100"
              onClick={handleUpload}
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                `Upload ${files.length} Documents`
              )}
            </Button>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-red-700 text-sm">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}
    </div>
  )
}

export default BulkUploadZone
