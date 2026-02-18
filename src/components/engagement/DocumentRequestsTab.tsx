"use client"

import React, { useState } from 'react'
import { format } from 'date-fns'
import {
  FileText,
  ChevronDown,
  ChevronUp,
  Eraser
} from 'lucide-react'
import { TableSkeleton } from "../shared/CommonSkeletons";
import { Card, CardContent } from '@/components/ui/card2'
import { Badge } from '@/components/ui/badge'
import { Button } from "@/components/ui/button"
import { SuccessModal } from '@/components/ui/SuccessModal'
import { ClearReasonModal } from '@/components/ui/ClearReasonModal'
import { useDocumentRequests } from './hooks/useDocumentRequests'
import { useEngagement } from './hooks/useEngagement'
import { uploadDocumentRequestFile, clearDocumentRequestFile } from '@/api/documentRequestService'
import DocumentRequestSingle from '../company/kyc/SingleDocumentRequest'
import DocumentRequestDouble from '../company/kyc/DoubleDocumentRequest'
import EmptyState from '../shared/EmptyState'

type UploadingState =
  | { requestId: string; docIndex: number; multipleId?: null; itemIndex?: null }
  | { requestId: string; docIndex?: null; multipleId: string; itemIndex: number }

type ClearAction = (reason: string) => Promise<void>

const DocumentRequestsTab = () => {
  const [expandedRequests, setExpandedRequests] = useState<Set<string>>(new Set())
  const [uploadingState, setUploadingState] = useState<UploadingState | null>(null)
  const [uploadSuccessOpen, setUploadSuccessOpen] = useState(false)
  const [clearSuccessOpen, setClearSuccessOpen] = useState(false)
  const [clearModal, setClearModal] = useState<{ isOpen: boolean; onConfirm: ClearAction; title?: string; message?: string } | null>(null)
  const { engagement } = useEngagement()
  const { documentRequests, loading, error, refetch } = useDocumentRequests(
    (engagement as any)?._id ?? (engagement as any)?.id ?? null
  )

  const reqId = (r: any) => r.id ?? r._id

  const toggleExpand = (id: string) => {
    const newSet = new Set(expandedRequests)
    if (newSet.has(id)) {
      newSet.delete(id)
    } else {
      newSet.add(id)
    }
    setExpandedRequests(newSet)
  }

  const handleUpload = async (requestId: string, docIndex: number, file: File) => {
    const request = documentRequests.find((r) => reqId(r) === requestId)
    const doc = request?.documents?.[docIndex]
    const requestedDocumentId = doc?.id ?? doc?._id
    if (!requestedDocumentId) {
      alert('Document not found')
      return
    }
    setUploadingState({ requestId, docIndex })
    try {
      await uploadDocumentRequestFile(requestId, requestedDocumentId, [file])
      await refetch()
      setUploadSuccessOpen(true)
    } catch (err: any) {
      console.error('Failed to upload document:', err)
      alert(err.message || 'Failed to upload document')
      throw err // Rethrow so caller can retry
    } finally {
      setUploadingState(null)
    }
  }

  const handleUploadMultiple = async (
    requestId: string,
    requestedDocumentId: string,
    files: FileList,
    itemIndex?: number,
    multipleId?: string
  ) => {
    setUploadingState(multipleId != null && itemIndex != null ? { requestId, multipleId, itemIndex } : null)
    try {
      const fileArray = Array.from(files)
      await uploadDocumentRequestFile(requestId, requestedDocumentId, fileArray)
      await refetch()
      setUploadSuccessOpen(true)
    } catch (err: any) {
      console.error('Failed to upload documents:', err)
      alert(err.message || 'Failed to upload documents')
      throw err
    } finally {
      setUploadingState(null)
    }
  }

  const handleClear = (requestId: string, docIndex: number, _name: string) => {
    const request = documentRequests.find((r) => reqId(r) === requestId)
    const doc = request?.documents?.[docIndex]
    const requestedDocumentId = doc?.id ?? doc?._id
    if (!requestedDocumentId) {
      alert('Document not found')
      return
    }
    setClearModal({
      isOpen: true,
      title: 'Clear Document',
      message: 'Please provide a reason for clearing this document. This will be logged for audit purposes.',
      onConfirm: async (reason) => {
        await clearDocumentRequestFile(requestId, requestedDocumentId, reason)
        await refetch()
        setClearSuccessOpen(true)
      },
    })
  }

  const handleClearMultipleItem = (requestId: string, multipleId: string, itemIndex: number, _label: string) => {
    const request = documentRequests.find((r) => reqId(r) === requestId)
    const group = (request?.multipleDocuments ?? []).find((g) => g._id === multipleId)
    const item = group?.multiple?.[itemIndex]
    const requestedDocumentId = item?.id ?? item?._id
    if (!requestedDocumentId) return
    setClearModal({
      isOpen: true,
      title: 'Clear Document',
      message: 'Please provide a reason for clearing this document. This will be logged for audit purposes.',
      onConfirm: async (reason) => {
        await clearDocumentRequestFile(requestId, requestedDocumentId, reason)
        await refetch()
        setClearSuccessOpen(true)
      },
    })
  }

  const handleClearMultipleGroup = (requestId: string, multipleId: string, _groupName: string) => {
    const request = documentRequests.find((r) => reqId(r) === requestId)
    const group = (request?.multipleDocuments ?? []).find((g) => g._id === multipleId)
    const itemsToClear = (group?.multiple ?? []).filter((m: any) => m.url)
    if (itemsToClear.length === 0) return
    setClearModal({
      isOpen: true,
      title: 'Clear All Documents in Group',
      message: 'Please provide a reason for clearing all documents in this group. This will be logged for audit purposes.',
      onConfirm: async (reason) => {
        for (const item of itemsToClear) {
          const requestedDocumentId = item.id ?? item._id
          if (requestedDocumentId) {
            await clearDocumentRequestFile(requestId, requestedDocumentId, reason)
          }
        }
        await refetch()
        setClearSuccessOpen(true)
      },
    })
  }

  const handleDownloadMultipleGroup = (requestId: string, _multipleId: string, _groupName: string, items: any[]) => {
    items.forEach((item) => {
      if (item?.url) window.open(item.url, '_blank')
    })
  }

  const handleClearAllForRequest = (requestId: string) => {
    const request = documentRequests.find((r) => reqId(r) === requestId)
    if (!request) return
    const toClear: { id: string }[] = []
    ;(request.documents ?? []).forEach((d: any) => {
      if (d?.url ?? d?.file?.url ?? d?.fileId) toClear.push({ id: d.id ?? d._id })
    })
    ;(request.multipleDocuments ?? []).forEach((g: any) => {
      ;(g.multiple ?? []).forEach((m: any) => {
        if (m?.url ?? m?.file?.url ?? m?.fileId) toClear.push({ id: m.id ?? m._id })
      })
    })
    if (toClear.length === 0) return
    setClearModal({
      isOpen: true,
      title: 'Clear All Uploaded Documents',
      message: 'Please provide a reason for clearing all uploaded documents. This will be logged for audit purposes.',
      onConfirm: async (reason) => {
        for (const { id } of toClear) {
          await clearDocumentRequestFile(requestId, id, reason)
        }
        await refetch()
        setClearSuccessOpen(true)
      },
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'COMPLETED':
        return <Badge className="bg-green-100 text-green-700 border-green-200">Completed</Badge>
      case 'UPLOADED':
        return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Uploaded</Badge>
      case 'SUBMITTED':
        return <Badge className="bg-blue-100 text-blue-700 border-blue-200">Submitted</Badge>
      case 'PENDING':
        return <Badge className="bg-amber-100 text-amber-700 border-amber-200">Pending</Badge>
      case 'REJECTED':
        return <Badge className="bg-red-100 text-red-700 border-red-200">Rejected</Badge>
      case 'REOPENED':
        return <Badge className="bg-rose-100 text-rose-700 border-rose-200">Reopened</Badge>
      default:
        return <Badge variant="outline">{status || 'Active'}</Badge>
    }
  }

  if (loading) {
    return <TableSkeleton rows={10} />;
  }

  if (error) {
    return (
      <EmptyState
        icon={FileText}
        title="Error Loading Document Requests"
        description={error}
      />
    )
  }

  if (!documentRequests || documentRequests.length === 0) {
    return (
      <EmptyState 
        icon={FileText}
        title="No Document Requests"
        description="No specific document requests have been initiated for this engagement yet."
      />
    )
  }

  return (
    <div className="space-y-3 animate-in fade-in duration-700">
      <div className="flex items-center justify-between bg-white/40 rounded-2xl border border-white/60 shadow-sm backdrop-blur-md mb-5">
        <div>
          <h2 className="text-3xl font-semibold">Document Requests</h2>
          <p className="text-sm text-gray-500 mt-1 font-medium">Manage document requests and track progress</p>
        </div>
        {/* <div className="p-4 bg-linear-to-br from-amber-500 to-orange-600 rounded-2xl text-white shadow-lg shadow-orange-200">
          <ClipboardList size={32} />
        </div> */}
      </div>

      <div className="space-y-4">
        {documentRequests.map((request) => {
          const requestIdVal = reqId(request)
          const isExpanded = expandedRequests.has(requestIdVal)
          
          const singleDocs = (request.documents || []) as any[]
          const multipleGroups = (request.multipleDocuments || []) as any[]
          const isUploaded = (d: any) => !!(d?.url ?? d?.file?.url ?? d?.fileId)
          
          const totalDocs = singleDocs.length + multipleGroups.reduce((acc, md) => acc + (md.multiple?.length || 0), 0)
          const uploadedDocsCount = singleDocs.filter(isUploaded).length + 
            multipleGroups.reduce((acc, md) => acc + (md.multiple?.filter(isUploaded).length || 0), 0)
          const percentage = totalDocs > 0 ? Math.round((uploadedDocsCount / totalDocs) * 100) : 0

          return (
            <Card
              key={requestIdVal}
              className="bg-white/80 border border-gray-300 rounded-xl shadow-sm hover:bg-white/70 transition-all mb-4 overflow-hidden"
            >
              <CardContent className="p-0">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center text-orange-600 font-bold text-lg">
                          {(request.category || request.title || 'D').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">
                            {request.title || request.name || 'Document Request'}
                          </h4>
                          {request.deadline && (
                            <p className="text-xs text-gray-500 mt-0.5">
                              Deadline: {format(new Date(request.deadline), 'MMM d, yyyy')}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="mb-4 flex flex-wrap gap-2">
                        {request.category && (
                          <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-100 rounded-lg px-2 py-0.5 text-[11px] font-semibold">
                            {request.category.toUpperCase()}
                          </Badge>
                        )}
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-100 rounded-lg px-2 py-0.5 text-[11px] font-semibold">
                          {uploadedDocsCount}/{totalDocs} DOCUMENTS ({percentage}%)
                        </Badge>
                        {getStatusBadge(request.status ?? '')}
                      </div>

                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-64 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-emerald-500 rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-[14px] font-medium text-emerald-600 tracking-tight">
                          {percentage}%
                        </span>
                      </div>

                      {request.description && (
                         <p className="text-sm text-gray-600 leading-relaxed max-w-2xl">
                            {request.description}
                         </p>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      {uploadedDocsCount > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleClearAllForRequest(requestIdVal)}
                          className="rounded-xl border-amber-200 text-amber-700 hover:bg-amber-50 h-9 px-4"
                        >
                          <Eraser className="h-4 w-4 mr-2" />
                          Clear All Uploaded
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => toggleExpand(requestIdVal)}
                        className="rounded-xl border-gray-200 text-gray-600 hover:bg-gray-50 h-9 px-4"
                      >
                        {isExpanded ? <ChevronUp size={16} className="mr-2" /> : <ChevronDown size={16} className="mr-2" />}
                        {isExpanded ? 'Hide Details' : 'View Details'}
                      </Button>
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="bg-gray-50/50 border-t border-gray-100 p-6 animate-in slide-in-from-top-2 duration-300 space-y-4">
                    <div className="mb-2 flex items-center justify-between">
                      <h5 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Requested Items</h5>
                      <span className="text-[10px] text-gray-400 italic">Submit supporting evidence for this category</span>
                    </div>

                    <DocumentRequestSingle 
                      requestId={requestIdVal}
                      documents={singleDocs}
                      onUpload={handleUpload}
                      onClearDocument={handleClear}
                      uploadingDocument={
                        uploadingState?.docIndex != null
                          ? { documentRequestId: uploadingState.requestId, documentIndex: uploadingState.docIndex }
                          : undefined
                      }
                      isDisabled={request.status === 'REJECTED'}
                    />

                    <DocumentRequestDouble 
                      requestId={requestIdVal}
                      multipleDocuments={multipleGroups}
                      onUploadMultiple={handleUploadMultiple}
                      onClearMultipleItem={handleClearMultipleItem}
                      onClearMultipleGroup={handleClearMultipleGroup}
                      onDownloadMultipleGroup={handleDownloadMultipleGroup}
                      uploadingState={
                        uploadingState?.multipleId
                          ? { documentRequestId: uploadingState.requestId, multipleDocumentId: uploadingState.multipleId, itemIndex: uploadingState.itemIndex }
                          : undefined
                      }
                      isDisabled={request.status === 'REJECTED'}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      <SuccessModal
        isOpen={uploadSuccessOpen}
        onClose={() => setUploadSuccessOpen(false)}
        title="Upload Successful"
        message="Your document has been uploaded successfully."
        buttonText="Got it"
      />

      <SuccessModal
        isOpen={clearSuccessOpen}
        onClose={() => setClearSuccessOpen(false)}
        title="Document Cleared"
        message="The document has been cleared successfully. You can upload a new file if needed."
        buttonText="Got it"
      />

      {clearModal && (
        <ClearReasonModal
          isOpen={true}
          onClose={() => setClearModal(null)}
          onConfirm={clearModal.onConfirm}
          title={clearModal.title}
          message={clearModal.message}
        />
      )}
    </div>
  )
}

export default DocumentRequestsTab
