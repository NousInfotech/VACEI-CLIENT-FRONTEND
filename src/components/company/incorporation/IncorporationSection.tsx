"use client"

import React, { useState } from 'react'
import {
  Building2,
  FileText,
  Shield,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  CheckCircle2,
  Loader2
} from "lucide-react";
import { ListSkeleton } from "../../shared/CommonSkeletons";
import { Card, CardContent } from '@/components/ui/card2'
import { Badge } from '@/components/ui/badge'
import { Button } from "@/components/ui/button"
import { useIncorporation } from '../hooks/useIncorporation'
import { useCompany } from '../hooks/useCompany'
import DocumentRequestSingle from '../kyc/SingleDocumentRequest'
import DocumentRequestDouble from '../kyc/DoubleDocumentRequest'
import EmptyState from '../../shared/EmptyState'
import { clearRequestedDocument, uploadRequestedDocument } from '@/api/auditService'

const IncorporationSection = () => {
  const [expandedRequests, setExpandedRequests] = useState<Set<string>>(new Set())
  const { company } = useCompany()
  const { incorporation, refetch, loading, error } = useIncorporation(company?._id || company?.id || null)

  const toggleExpand = (id: string) => {
    const newSet = new Set(expandedRequests)
    if (newSet.has(id)) {
      newSet.delete(id)
    } else {
      newSet.add(id)
    }
    setExpandedRequests(newSet)
  }

  // API handlers
  const handleUpload = async (requestId: string, requestedDocumentId: string, file: File) => {
    try {
      await uploadRequestedDocument(requestId, requestedDocumentId, [file])
      await refetch()
    } catch (err: any) {
      console.error('Failed to upload document:', err)
      alert(err.message || 'Failed to upload document')
    }
  }

  const handleUploadMultiple = async (requestId: string, requestedDocumentId: string, files: FileList) => {
    try {
      await uploadRequestedDocument(requestId, requestedDocumentId, Array.from(files))
      await refetch()
    } catch (err: any) {
      console.error('Failed to upload documents:', err)
      alert(err.message || 'Failed to upload documents')
    }
  }

  const handleClear = async (requestId: string, requestedDocumentId: string) => {
    try {
      await clearRequestedDocument(requestId, requestedDocumentId)
      await refetch()
    } catch (err: any) {
      console.error('Failed to clear document:', err)
      alert(err.message || 'Failed to clear document')
    }
  }

  const handleClearMultipleItem = async (requestId: string, requestedDocumentId: string) => {
    await handleClear(requestId, requestedDocumentId);
  }

  const handleClearMultipleGroup = (requestId: string, multipleId: string, groupName: string) => {
    console.log(`Clearing all items for group ${groupName} in request ${requestId}`)
  }

  const handleDownloadMultipleGroup = (requestId: string, multipleId: string, groupName: string, items: any[]) => {
    console.log(`Downloading all items for group ${groupName} in request ${requestId}`)
  }

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'approved':
        return <Badge className="bg-green-100 text-green-700 border-green-200">Completed</Badge>
      case 'submitted':
      case 'in_progress':
        return <Badge className="bg-blue-100 text-blue-700 border-blue-200">In Progress</Badge>
      case 'pending':
        return <Badge className="bg-amber-100 text-amber-700 border-amber-200">Pending</Badge>
      case 'rejected':
        return <Badge className="bg-rose-100 text-rose-700 border-rose-200">Rejected</Badge>
      default:
        return <Badge variant="outline">{status || 'Active'}</Badge>
    }
  }

  if (loading) {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between bg-white/40 rounded-2xl border border-white/60 shadow-sm backdrop-blur-md p-4">
                <div className="space-y-2">
                     <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
                     <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
                </div>
                <div className="h-12 w-12 bg-gray-200 rounded-2xl animate-pulse" />
            </div>
            <ListSkeleton count={2} />
        </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        icon={Shield}
        title="Error Loading Incorporation Data"
        description={error}
      />
    )
  }

  if (!incorporation) {
    return (
      <div className="space-y-6 animate-in fade-in duration-700">
         <div className="flex items-center justify-between bg-white/40 rounded-2xl border border-white/60 shadow-sm backdrop-blur-md">
            <div className="p-6">
            <h2 className="text-3xl font-semibold">Incorporation Status</h2>
            <p className="text-sm text-gray-500 mt-1 font-medium">Track your company registration status</p>
            </div>
            <div className="p-4 bg-linear-to-br from-indigo-500 to-purple-600 rounded-2xl text-white shadow-lg m-4">
            <ClipboardList size={32} />
            </div>
        </div>
        <EmptyState
            icon={Building2}
            title="Incorporation Not Started"
            description="The incorporation process has not been initiated for this company yet."
        />
      </div>
    )
  }

  const documentRequests = (incorporation.documentRequests || []).filter(
    (req: any) => req.status !== 'DRAFT'
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex items-center justify-between bg-white/40 rounded-2xl border border-white/60 shadow-sm backdrop-blur-md">
        <div className="p-6">
          <h2 className="text-3xl font-semibold">Incorporation Status</h2>
          <div className="flex items-center gap-2 mt-2">
            <p className="text-sm text-gray-500 font-medium">Current Status:</p>
            {getStatusBadge(incorporation.status)}
          </div>
        </div>
        <div className="p-4 bg-linear-to-br from-indigo-500 to-purple-600 rounded-2xl text-white shadow-lg m-4">
          <ClipboardList size={32} />
        </div>
      </div>

      {/* Progress bar */}
      {documentRequests.length > 0 && (() => {
        const allDocs = documentRequests.flatMap((r: any) => r.requestedDocuments || []);
        const totalDocs = allDocs.length;
        const uploadedDocs = allDocs.filter((d: any) => d.status === 'UPLOADED' || d.status === 'ACCEPTED').length;
        const percent = totalDocs > 0 ? Math.round((uploadedDocs / totalDocs) * 100) : 0;
        return (
          <div className="bg-white/60 rounded-2xl border border-white/60 shadow-sm backdrop-blur-md px-6 py-4 space-y-2">
            <div className="flex items-center justify-between text-sm font-semibold">
              <span className="text-gray-700 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-indigo-500" />
                Document Upload Progress
              </span>
              <span className="text-indigo-600">{uploadedDocs} / {totalDocs} uploaded</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
              <div
                className="h-2.5 rounded-full bg-green-500 transition-all duration-700"
                style={{ width: `${percent}%` }}
              />
            </div>
            <p className="text-[11px] text-gray-400 font-medium text-right">{percent}% complete</p>
          </div>
        );
      })()}

      <div className="space-y-4">
          {documentRequests.length === 0 ? (
             <EmptyState
                icon={FileText}
                title="No Documents Required"
                description="There are no document requests for this incorporation at the moment."
            />
          ) : (
             documentRequests.map((request: any) => {
                const isExpanded = expandedRequests.has(request.id) || true; // Default expanded for visibility
                
                const docs = request.requestedDocuments || []
                const singleDocs = docs.filter((d: any) => d.count === 'SINGLE')
                const multipleGroups = docs.filter((d: any) => d.count === 'MULTIPLE')
                const totalDocs = docs.length
                const uploadedDocsCount = docs.filter((d: any) => d.status === 'UPLOADED' || d.status === 'ACCEPTED').length

                return (
                  <Card
                    key={request.id}
                    className="bg-white/80 border border-gray-300 rounded-xl shadow-sm hover:bg-white/70 transition-all mb-4 overflow-hidden"
                  >
                    <CardContent className="p-0">
                      <div className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 font-bold text-lg">
                                <FileText className="h-6 w-6" />
                              </div>
                              <div>
                                <h4 className="text-lg font-semibold text-gray-900">
                                  {request.title || 'Document Request'}
                                </h4>
                                {request.description && (
                                    <p className="text-sm text-gray-500">{request.description}</p>
                                )}
                              </div>
                            </div>

                            <div className="mb-4 flex flex-wrap gap-2">
                              <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-100 rounded-lg px-2 py-0.5 text-[11px] font-semibold">
                                {uploadedDocsCount}/{totalDocs} DOCUMENTS
                              </Badge>
                              {getStatusBadge(request.status)}
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleExpand(request.id)}
                              className="rounded-xl border-gray-200 text-gray-600 hover:bg-gray-50 h-9 px-3"
                            >
                              {isExpanded ? <ChevronUp size={16} className="mr-2" /> : <ChevronDown size={16} className="mr-2" />}
                              {isExpanded ? 'Hide Documents' : 'View Documents'}
                            </Button>
                          </div>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="bg-gray-50/50 border-t border-gray-100 p-6 animate-in slide-in-from-top-2 duration-300 space-y-4">
                          {singleDocs.length === 0 && multipleGroups.length === 0 ? (
                            <div className="text-center py-4 text-gray-500 text-sm bg-white rounded-lg">
                              No documents in this request yet
                            </div>
                          ) : (
                            <>
                              <DocumentRequestSingle
                                requestId={request.id}
                                documents={singleDocs}
                                onUpload={handleUpload}
                                onClearDocument={handleClear}
                              />

                              <DocumentRequestDouble
                                requestId={request.id}
                                multipleDocuments={multipleGroups}
                                onUploadMultiple={handleUploadMultiple}
                                onClearMultipleItem={handleClearMultipleItem}
                                onClearMultipleGroup={handleClearMultipleGroup}
                                onDownloadMultipleGroup={handleDownloadMultipleGroup}
                              />
                            </>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
             })
          )}
      </div>
    </div>
  )
}

export default IncorporationSection
