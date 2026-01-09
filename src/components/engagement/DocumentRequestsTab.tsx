"use client"

import React, { useState } from 'react'
import {
  FileText,
  ChevronDown,
  ChevronUp,
  ClipboardList
} from 'lucide-react'
import { TableSkeleton } from "../shared/CommonSkeletons";
import { Card, CardContent } from '@/components/ui/card2'
import { Badge } from '@/components/ui/badge'
import { Button } from "@/components/ui/button"
import { useDocumentRequests } from './hooks/useDocumentRequests'
import { useEngagement } from './hooks/useEngagement'
import { uploadDocumentRequestDocument, clearDocumentRequestDocument } from '@/api/auditService'
import DocumentRequestSingle from '../company/kyc/SingleDocumentRequest'
import DocumentRequestDouble from '../company/kyc/DoubleDocumentRequest'
import EmptyState from '../shared/EmptyState'

const DocumentRequestsTab = () => {
  const [expandedRequests, setExpandedRequests] = useState<Set<string>>(new Set())
  const { engagement } = useEngagement()
  const { documentRequests, loading, error, refetch } = useDocumentRequests(engagement?._id || null)

  const toggleExpand = (id: string) => {
    const newSet = new Set(expandedRequests)
    if (newSet.has(id)) {
      newSet.delete(id)
    } else {
      newSet.add(id)
    }
    setExpandedRequests(newSet)
  }

  // Real API handlers
  const handleUpload = async (requestId: string, docIndex: number, file: File) => {
    try {
      // Find the document request and document to get the name
      const request = documentRequests.find(r => r._id === requestId)
      const document = request?.documents?.[docIndex]
      const documentName = document?.name || file.name
      
      // Backend expects 'documentIndex' (not 'docIndex') and 'documentName'
      await uploadDocumentRequestDocument(requestId, [file], { 
        documentIndex: docIndex,
        documentName: documentName
      })
      await refetch()
    } catch (err: any) {
      console.error('Failed to upload document:', err)
      alert(err.message || 'Failed to upload document')
    }
  }

  const handleUploadMultiple = async (requestId: string, multipleId: string, files: FileList, itemIndex?: number) => {
    try {
      const fileArray = Array.from(files)
      await uploadDocumentRequestDocument(requestId, fileArray, { multipleId, itemIndex })
      await refetch()
    } catch (err: any) {
      console.error('Failed to upload documents:', err)
      alert(err.message || 'Failed to upload documents')
    }
  }

  const handleClear = async (requestId: string, docIndex: number, name: string) => {
    try {
      await clearDocumentRequestDocument(requestId, docIndex)
      await refetch()
    } catch (err: any) {
      console.error('Failed to clear document:', err)
      alert(err.message || 'Failed to clear document')
    }
  }

  const handleClearMultipleItem = (requestId: string, multipleId: string, itemIndex: number, label: string) => {
    // This would need a specific API endpoint for clearing multiple items
    console.log(`Clearing item ${label} for request ${requestId}, group ${multipleId}`)
  }

  const handleClearMultipleGroup = (requestId: string, multipleId: string, groupName: string) => {
    // This would need a specific API endpoint for clearing multiple groups
    console.log(`Clearing all items for group ${groupName} in request ${requestId}`)
  }

  const handleDownloadMultipleGroup = (requestId: string, multipleId: string, groupName: string, items: any[]) => {
    // Download functionality - would need to implement file download
    console.log(`Downloading all items for group ${groupName} in request ${requestId}`)
  }

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-700 border-green-200">Completed</Badge>
      case 'submitted':
        return <Badge className="bg-blue-100 text-blue-700 border-blue-200">Submitted</Badge>
      case 'pending':
        return <Badge className="bg-amber-100 text-amber-700 border-amber-200">Pending</Badge>
      case 'reopened':
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
        <div className="p-4 bg-linear-to-br from-amber-500 to-orange-600 rounded-2xl text-white shadow-lg shadow-orange-200">
          <ClipboardList size={32} />
        </div>
      </div>

      <div className="space-y-4">
        {documentRequests.map((request) => {
          const isExpanded = expandedRequests.has(request._id)
          
          const singleDocs = (request.documents || []) as any[]
          const multipleGroups = (request.multipleDocuments || []) as any[]
          
          const totalDocs = singleDocs.length + multipleGroups.reduce((acc, md) => acc + (md.multiple?.length || 0), 0)
          const uploadedDocsCount = singleDocs.filter(d => d.url).length + 
            multipleGroups.reduce((acc, md) => acc + (md.multiple?.filter((m: any) => m.url).length || 0), 0)

          return (
            <Card
              key={request._id}
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
                        </div>
                      </div>
                      
                      <div className="mb-4 flex flex-wrap gap-2">
                        {request.category && (
                          <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-100 rounded-lg px-2 py-0.5 text-[11px] font-semibold">
                            {request.category.toUpperCase()}
                          </Badge>
                        )}
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-100 rounded-lg px-2 py-0.5 text-[11px] font-semibold">
                          {uploadedDocsCount}/{totalDocs} DOCUMENTS
                        </Badge>
                        {getStatusBadge(request.status)}
                      </div>

                      {request.description && (
                         <p className="text-sm text-gray-600 leading-relaxed max-w-2xl">
                            {request.description}
                         </p>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => toggleExpand(request._id)}
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
                      requestId={request._id}
                      documents={singleDocs}
                      onUpload={handleUpload}
                      onClearDocument={handleClear}
                    />

                    <DocumentRequestDouble 
                      requestId={request._id}
                      multipleDocuments={multipleGroups}
                      onUploadMultiple={handleUploadMultiple}
                      onClearMultipleItem={handleClearMultipleItem}
                      onClearMultipleGroup={handleClearMultipleGroup}
                      onDownloadMultipleGroup={handleDownloadMultipleGroup}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

export default DocumentRequestsTab
