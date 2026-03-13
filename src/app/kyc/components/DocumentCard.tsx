"use client"

import React, { useState, useRef } from 'react'
import { 
  FileText, 
  Download, 
  CheckCircle2, 
  Loader2, 
  Upload, 
  ChevronDown, 
  ChevronUp 
} from 'lucide-react'
import { uploadKycDocument, type RequestedDocument } from '@/api/kycService'

interface DocumentCardProps {
  doc: RequestedDocument
  documentRequestId: string
  kycToken: string
  onUploaded: () => void
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    UPLOADED: 'bg-blue-50 text-blue-700 border-blue-200',
    ACCEPTED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    REJECTED: 'bg-red-50 text-red-700 border-red-200',
    PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
  }
  return (
    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${styles[status] || styles.PENDING}`}>
      {status}
    </span>
  )
}

const DocumentCard: React.FC<DocumentCardProps> = ({
  doc,
  documentRequestId,
  kycToken,
  onUploaded,
}) => {
  const [uploading, setUploading] = useState(false)
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null)
  const [expanded, setExpanded] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setUploading(true)
    setMsg(null)
    const result = await uploadKycDocument(doc.id, documentRequestId, kycToken, Array.from(files))
    setMsg({ text: result.message, ok: result.success })
    setUploading(false)
    if (result.success) onUploaded()
  }

  const hasFile = !!doc.file
  const isAccepted = doc.status === 'ACCEPTED'
  const isRejected = doc.status === 'REJECTED'

  return (
    <div className={`rounded-xl border p-4 transition-all ${isAccepted ? 'border-emerald-200 bg-emerald-50/40' : isRejected ? 'border-red-200 bg-red-50/40' : 'border-gray-100 bg-white shadow-sm'}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isAccepted ? 'bg-emerald-100 text-emerald-600' : isRejected ? 'bg-red-100 text-red-600' : 'bg-blue-50 text-blue-500'}`}>
            <FileText size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold text-base text-gray-900 truncate">{doc.documentName}</p>
              {doc.isMandatory && (
                <span className="text-[9px] font-bold uppercase tracking-wider text-red-500 border border-red-200 bg-red-50 px-1.5 py-0.5 rounded-full">Required</span>
              )}
              <StatusBadge status={doc.status} />
            </div>
            
            <div className="flex items-center gap-3 mt-1.5">
              {doc.templateFile && (
                <a
                  href={doc.templateFile.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline font-medium"
                >
                  <Download size={12} /> Download Template
                </a>
              )}
              {hasFile && (
                <p className="text-xs text-gray-500 truncate flex items-center gap-1">
                  <CheckCircle2 size={12} className="text-emerald-500 shrink-0" />
                  {doc.file!.file_name}
                </p>
              )}
            </div>

            {isRejected && doc.rejectionReason && (
              <p className="text-xs text-red-600 mt-2 bg-red-50 p-2 rounded-lg border border-red-100 font-medium">
                Reason: {doc.rejectionReason}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {!isAccepted && (
            <>
              <input
                ref={inputRef}
                type="file"
                className="hidden"
                multiple={doc.count === 'MULTIPLE'}
                onChange={e => handleUpload(e.target.files)}
              />
              <button
                onClick={() => inputRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 rounded-xl px-4 py-2 shadow-sm transition-all"
              >
                {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                {uploading ? 'Uploading…' : hasFile ? 'Replace' : 'Upload'}
              </button>
            </>
          )}
          {doc.children && doc.children.length > 0 && (
            <button onClick={() => setExpanded(v => !v)} className="text-gray-400 hover:text-gray-600 p-1">
              {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
          )}
        </div>
      </div>

      {msg && (
        <div className={`mt-3 text-xs font-medium px-4 py-2 rounded-xl flex items-center gap-2 ${msg.ok ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
          {msg.ok ? <CheckCircle2 size={14} /> : <FileText size={14} />}
          {msg.text}
        </div>
      )}

      {/* Children (sub-documents) */}
      {expanded && doc.children && doc.children.length > 0 && (
        <div className="mt-4 pl-6 border-l-2 border-blue-50 space-y-4">
          {doc.children.map(child => (
            <DocumentCard
              key={child.id}
              doc={child}
              documentRequestId={documentRequestId}
              kycToken={kycToken}
              onUploaded={onUploaded}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default DocumentCard
