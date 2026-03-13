"use client"

import React, { useState } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Building2, 
  ChevronUp, 
  ChevronDown, 
  Shield, 
  FileText,
  Clock,
  ExternalLink,
  Info
} from "lucide-react"
import { type DocumentRequest } from '@/api/kycService'
import KycSingleDocumentRequest from './KycSingleDocumentRequest'
import KycDoubleDocumentRequest from './KycDoubleDocumentRequest'
import KycBulkUploadZone from './KycBulkUploadZone'
import { ConfirmationModal } from "@/components/ui/ConfirmationModal"
import UnassignedFilesSection from '@/components/company/shared/UnassignedFilesSection'

import { useKyc } from '../context/KycContext'

interface KycSectionTabProps {
  docRequest: DocumentRequest
  clientName: string
  roles?: string[]
  involvementStatus?: string
  requestStatus?: string
}

const KycSectionTab: React.FC<KycSectionTabProps> = ({
  docRequest,
  clientName,
  roles,
  involvementStatus,
  requestStatus,
}) => {
  const { uploadDocument, clearDocument } = useKyc()
  const [isExpanded, setIsExpanded] = useState(true)
  const [uploadMode, setUploadMode] = useState<'bulk' | 'single'>('bulk')
  const [uploadingId, setUploadingId] = useState<string | null>(null)
  const [confirmClear, setConfirmClear] = useState<{ reqId: string, docId: string } | null>(null)

  const isGlobalDisabled = involvementStatus === 'VERIFIED' || requestStatus === 'COMPLETED'

  const docs = docRequest.requestedDocuments || []
  const singleDocs = docs.filter(d => d.count === 'SINGLE')
  const multipleDocs = docs.filter(d => d.count === 'MULTIPLE')

  // Calculate completion
  const allFlattened = docs.flatMap(d => d.count === 'MULTIPLE' ? (d.children || []) : [d])
  const total = allFlattened.length
  const completed = allFlattened.filter(d => !!(d.file?.url || d.status === 'UPLOADED' || d.status === 'ACCEPTED')).length
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0

  const handleUpload = async (reqId: string, docId: string, file: File) => {
    setUploadingId(docId)
    const res = await uploadDocument(reqId, docId, file)
    if (!res.success) {
      alert(res.message)
    }
    setUploadingId(null)
  }
  
  const handleClear = async (reqId: string, docId: string) => {
    setConfirmClear({ reqId, docId })
  }

  const executeClear = async () => {
    if (!confirmClear) return
    const { reqId, docId } = confirmClear
    const res = await clearDocument(reqId, docId)
    if (!res.success) {
      alert(res.message)
    }
    setConfirmClear(null)
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-white/80 border border-gray-100 rounded-[32px] shadow-sm overflow-hidden transition-all hover:shadow-md">
        <Card>
          <CardContent className="p-0">
          <div className="">
            <div className="flex items-start justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shadow-sm border border-blue-100">
                    <Shield size={28} />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900">{clientName}</h4>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {roles?.map((role, idx) => (
                        <Badge key={idx} variant="outline" className="bg-gray-50 text-gray-500 border-gray-100 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md">
                          {role.replace(/_/g, ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mb-6 flex flex-wrap gap-2">
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-100 rounded-xl px-3 py-1 text-xs font-bold uppercase tracking-wider">
                    {completed}/{total} DOCUMENTS COMPLETED
                  </Badge>
                </div>

                {total > 0 && (
                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                      <div 
                        className={`h-full transition-all duration-1000 ease-out shadow-xs ${completionRate === 100 ? 'bg-emerald-500' : 'bg-blue-500'}`}
                        style={{ width: `${completionRate}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-blue-600 tracking-tighter">
                      {completionRate}%
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-col items-end gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="rounded-2xl border-gray-200 text-gray-600 hover:bg-gray-50 h-11 px-5 font-bold shadow-xs transition-all"
                >
                  {isExpanded ? <ChevronUp size={18} className="mr-2" /> : <ChevronDown size={18} className="mr-2" />}
                  {isExpanded ? 'Hide Details' : 'View Details'}
                </Button>

                {isExpanded && (
                  <div className="flex bg-gray-100/80 p-1.5 rounded-2xl border border-gray-200 shadow-inner">
                    <button
                      onClick={() => setUploadMode('bulk')}
                      className={`px-4 py-2 rounded-xl text-xs font-medium uppercase tracking-widest transition-all ${
                        uploadMode === 'bulk' 
                          ? "bg-white text-blue-600 shadow-sm border border-gray-100" 
                          : "text-gray-400 hover:text-gray-600"
                      }`}
                    >
                      Bulk
                    </button>
                    <button
                      onClick={() => setUploadMode('single')}
                      className={`px-4 py-2 rounded-xl text-xs font-medium uppercase tracking-widest transition-all ${
                        uploadMode === 'single' 
                          ? "bg-white text-blue-600 shadow-sm border border-gray-100" 
                          : "text-gray-400 hover:text-gray-600"
                      }`}
                    >
                      Single
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {isExpanded && (
            <div className="bg-gray-50/40 border-t border-gray-100 py-8 space-y-6 animate-in slide-in-from-top-4 duration-500">
              <div className="flex items-center justify-between">
                <h5 className="text-xs font-semibold text-gray-400 uppercase tracking-[0.2em]">Verification Records</h5>
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-[0.2em]">Secure identification channel</span>
              </div>

              {uploadMode === 'bulk' ? (
                <>
                  <KycBulkUploadZone 
                    requestId={docRequest.id}
                    documents={docs}
                    isDisabled={isGlobalDisabled}
                  />
                  {/* Since this is a new page, we might not have unassignedFiles in details yet, 
                      but we pass it if we add it to kycService types later */}
                  {(docRequest as any).unassignedFiles && (docRequest as any).unassignedFiles.length > 0 && (
                     <UnassignedFilesSection files={(docRequest as any).unassignedFiles} />
                  )}
                </>
              ) : (
                <div className="space-y-6">
                  <KycSingleDocumentRequest
                    requestId={docRequest.id}
                    documents={singleDocs}
                    onUpload={handleUpload}
                    onClearDocument={handleClear}
                    uploadingId={uploadingId}
                    isDisabled={isGlobalDisabled}
                  />
                  <KycDoubleDocumentRequest
                    requestId={docRequest.id}
                    multipleDocuments={multipleDocs}
                    onUpload={handleUpload}
                    onClearDocument={handleClear}
                    uploadingId={uploadingId}
                    isDisabled={isGlobalDisabled}
                  />
                </div>
              )}
            </div>
          )}
          </CardContent>
        </Card>
      </div>

      {/* Footer Info */}
      <div className="p-6 bg-blue-50/50 rounded-[32px] border border-blue-100 flex items-start gap-4">
        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm border border-blue-100 shrink-0">
          <Info size={20} />
        </div>
        <div className="space-y-1">
          <h6 className="text-sm font-black text-blue-900 uppercase tracking-wider">Secure Submission</h6>
          <p className="text-xs text-blue-700/80 font-medium leading-relaxed">
            All documents uploaded are encrypted and securely stored. Once submitted, our team will review the information and update your status accordingly.
          </p>
        </div>
      </div>

      <ConfirmationModal
        isOpen={!!confirmClear}
        onClose={() => setConfirmClear(null)}
        onConfirm={executeClear}
        title="Clear Document"
        message="Are you sure you want to remove this uploaded document? You will need to upload it again."
        confirmText="Yes, Clear"
        cancelText="Cancel"
        variant="destructive"
      />
    </div>
  )
}

export default KycSectionTab
