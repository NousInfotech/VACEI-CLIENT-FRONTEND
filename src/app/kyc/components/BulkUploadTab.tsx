"use client"

import React, { useState, useCallback } from 'react'
import { 
  Upload, 
  X, 
  File as FileIcon, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  Info,
  ClipboardList
} from 'lucide-react'
import { bulkUploadKycDocuments, type DocumentRequest } from '@/api/kycService'

interface BulkUploadTabProps {
  docRequest: DocumentRequest
  kycToken: string
  onSuccess: () => void
}

const BulkUploadTab: React.FC<BulkUploadTabProps> = ({
  docRequest,
  kycToken,
  onSuccess,
}) => {
  const [dragActive, setDragActive] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

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
      setSuccessMsg(null)
    }
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files)
      setFiles(prev => [...prev, ...selectedFiles])
      setError(null)
      setSuccessMsg(null)
    }
  }

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleUpload = async () => {
    if (files.length === 0) return
    setIsUploading(true)
    setError(null)
    setSuccessMsg(null)
    
    const result = await bulkUploadKycDocuments(docRequest.id, kycToken, files)
    
    if (result.success) {
      setFiles([])
      setSuccessMsg(result.message)
      onSuccess()
    } else {
      setError(result.message)
    }
    setIsUploading(false)
  }

  const docs = docRequest.requestedDocuments || []
  const totalCount = docs.length
  const uploadedCount = docs.filter(d => d.status === 'UPLOADED' || d.status === 'ACCEPTED').length

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Info Box */}
      <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-start gap-3">
        <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800 leading-relaxed">
          <p className="font-bold mb-1">How Bulk Upload Works:</p>
          <ul className="list-disc ml-4 space-y-1">
            <li>Upload multiple files at once.</li>
            <li>The system will automatically match filenames to your document requirements.</li>
            <li>Files that don't match will be placed in the "Unassigned" section for admin review.</li>
          </ul>
        </div>
      </div>

      {/* Progress Section */}
      <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h5 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Required Documents:</h5>
          <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg border border-blue-100">
            {uploadedCount}/{totalCount} COMPLETED
          </span>
        </div>
        <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${uploadedCount === totalCount ? 'bg-emerald-500' : 'bg-blue-500'}`}
            style={{ width: totalCount > 0 ? `${(uploadedCount / totalCount) * 100}%` : '0%' }}
          />
        </div>
      </div>

      {/* Drop Zone */}
      <div
        className={`relative group cursor-pointer border-2 border-dashed rounded-[32px] p-12 transition-all duration-300 ${
          dragActive 
            ? "border-blue-500 bg-blue-50/50" 
            : "border-gray-200 bg-white hover:border-blue-300 hover:bg-gray-50/30"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="bulk-upload-input"
          multiple
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={handleFileChange}
          disabled={isUploading}
        />
        <div className="flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform shadow-sm">
            <Upload size={32} />
          </div>
          <p className="text-xl font-bold text-gray-900 mb-1">Click to upload or drag and drop</p>
          <p className="text-sm text-gray-500 font-medium">Supported formats: PDF, JPG, PNG, DOCX</p>
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm animate-in slide-in-from-top-4 duration-300">
          <div className="p-4 bg-gray-50/80 border-b border-gray-100 flex items-center justify-between">
            <span className="text-sm font-bold text-gray-700">{files.length} Files Selected</span>
            <button 
              onClick={() => setFiles([])} 
              className="text-xs font-bold text-red-600 hover:text-red-700 pr-2"
              disabled={isUploading}
            >
              Clear All
            </button>
          </div>
          <div className="max-h-60 overflow-y-auto divide-y divide-gray-50">
            {files.map((file, idx) => (
              <div key={idx} className="p-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500 shrink-0">
                    <FileIcon size={20} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{file.name}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
                {!isUploading && (
                  <button 
                    onClick={() => removeFile(idx)}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            ))}
          </div>
          <div className="p-6 bg-gray-50/50 border-t border-gray-100">
            <button 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-2xl h-14 font-bold text-lg shadow-lg shadow-blue-100 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              onClick={handleUpload}
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Processing Upload...
                </>
              ) : (
                <>
                  <Upload size={20} />
                  Upload {files.length} Documents
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Status Messages */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-start gap-3 text-emerald-700 animate-in zoom-in-95 duration-300">
          <CheckCircle2 size={20} className="shrink-0 mt-0.5" />
          <p className="text-sm font-semibold">{successMsg}</p>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 text-red-700 animate-in shake duration-500">
          <AlertCircle size={20} className="shrink-0 mt-0.5" />
          <p className="text-sm font-semibold">{error}</p>
        </div>
      )}
    </div>
  )
}

export default BulkUploadTab
