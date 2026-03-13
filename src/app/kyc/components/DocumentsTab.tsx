"use client"

import React from 'react'
import { FileText } from 'lucide-react'
import { type DocumentRequest } from '@/api/kycService'
import DocumentCard from './DocumentCard'

interface DocumentsTabProps {
  docRequest: DocumentRequest
  kycToken: string
  onUploaded: () => void
}

const DocumentsTab: React.FC<DocumentsTabProps> = ({
  docRequest,
  kycToken,
  onUploaded,
}) => {
  const docs = docRequest.requestedDocuments || []
  const rootDocs = docs.filter(d => !d.parentId)

  const totalCount = docs.length
  const uploadedCount = docs.filter(d => d.status === 'UPLOADED' || d.status === 'ACCEPTED').length

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Progress Section */}
      <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm font-bold text-gray-900">Upload Progress</p>
            <p className="text-xs text-gray-500">Please complete all required documents</p>
          </div>
          <div className="text-right">
            <span className={`text-lg font-bold ${uploadedCount === totalCount ? 'text-emerald-600' : 'text-blue-600'}`}>
              {uploadedCount} / {totalCount}
            </span>
          </div>
        </div>
        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${uploadedCount === totalCount ? 'bg-emerald-500' : 'bg-blue-500'}`}
            style={{ width: totalCount > 0 ? `${(uploadedCount / totalCount) * 100}%` : '0%' }}
          />
        </div>
      </div>

      {/* Document Request Metadata */}
      <div className="flex items-center gap-3 px-1">
        <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
          <FileText size={20} />
        </div>
        <div>
          <h4 className="font-bold text-gray-900 text-lg leading-tight">{docRequest.title}</h4>
          {docRequest.description && <p className="text-sm text-gray-500 mt-0.5">{docRequest.description}</p>}
        </div>
      </div>

      {/* Document List */}
      {rootDocs.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
          <FileText size={48} className="mx-auto mb-4 text-gray-200" />
          <p className="font-medium text-gray-400">No documents requested for this process.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {rootDocs.map(doc => (
            <DocumentCard
              key={doc.id}
              doc={doc}
              documentRequestId={docRequest.id}
              kycToken={kycToken}
              onUploaded={onUploaded}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default DocumentsTab
