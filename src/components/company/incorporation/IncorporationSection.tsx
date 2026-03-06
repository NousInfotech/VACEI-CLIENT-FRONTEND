"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Building2,
  FileText,
  Shield,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  CheckCircle2,
  Loader2,
  Clock,
  Eye,
  AlertCircle,
  Plus
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
import { listServiceRequests } from '@/api/serviceRequestService'
import BulkUploadZone from '../../engagement/BulkUploadZone'
import { cn } from '@/lib/utils'
import { TruncatedTooltip } from '@/components/ui/TruncatedTooltip'
import UnassignedFilesSection from '../shared/UnassignedFilesSection'

const IncorporationSection = () => {
  const [expandedRequests, setExpandedRequests] = useState<Set<string>>(new Set())
  const [uploadMode, setUploadMode] = useState<Record<string, 'single' | 'bulk'>>({})
  const router = useRouter()
  const { company } = useCompany()
  const { incorporation, refetch, loading, error } = useIncorporation(company?._id || company?.id || null)
  const [serviceRequest, setServiceRequest] = useState<any>(null)
  const [srLoading, setSrLoading] = useState(false)

  React.useEffect(() => {
    const fetchSR = async () => {
      if (!company?.id && !company?._id) return;
      setSrLoading(true)
      try {
        const res = await listServiceRequests({ service: 'INCORPORATION' });
        const list = res.data || res || [];
        const sr = list
          .filter((r: any) => (r.companyId?._id || r.companyId?.id || r.companyId) === (company?.id || company?._id))
          .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
        setServiceRequest(sr)
      } catch (err) {
        console.error("Failed to fetch service request:", err)
      } finally {
        setSrLoading(false)
      }
    }
    fetchSR()
  }, [company?.id, company?._id])

  const toggleExpand = (id: string) => {
    setExpandedRequests(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  // Initialize expandedRequests with all IDs when data is loaded
  React.useEffect(() => {
    if (incorporation?.documentRequests) {
      const allIds = incorporation.documentRequests
        .filter((req: any) => req.status !== 'DRAFT')
        .map((req: any) => req.id);
      setExpandedRequests(new Set(allIds));
    }
  }, [incorporation?.documentRequests]);

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
            description="Incorporation is not created by the admin wait for the incorporation kyc"
        />
        {serviceRequest?.status === 'REJECTED' && (
          <div className="bg-rose-50 border border-rose-100 rounded-2xl p-6 mt-6 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-rose-100 rounded-xl text-rose-600">
                <AlertCircle size={24} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-rose-900">Service Request Rejected</h3>
                <p className="text-rose-700 mt-1 font-medium">
                  Reason: {serviceRequest.rejectionReason || serviceRequest.reason || "No reason provided."}
                </p>
                <div className="mt-4">
                  <Button 
                    variant="outline" 
                    className="bg-white border-rose-200 text-rose-700 hover:bg-rose-100 rounded-xl font-bold"
                    onClick={() => router.push(`/global-dashboard/companies/incorporation-request`)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Request Service Again
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  const documentRequests = (incorporation.documentRequests || []).filter(
    (req: any) => req.status !== 'DRAFT'
  );

  // const incorporationStatus = (incorporation.status || 'PENDING').toUpperCase();

  // if (incorporationStatus === 'PENDING') {
  //   return (
  //     <div className="space-y-6 animate-in fade-in duration-700">
  //       <div className="flex items-center justify-between bg-white/40 rounded-2xl border border-white/60 shadow-sm backdrop-blur-md">
  //           <div className="p-6">
  //           <h2 className="text-3xl font-semibold">Incorporation Status</h2>
  //           <div className="flex items-center gap-2 mt-2">
  //             <p className="text-sm text-gray-500 font-medium">Current Status:</p>
  //             {getStatusBadge(incorporation.status)}
  //           </div>
  //           </div>
  //           <div className="p-4 bg-linear-to-br from-indigo-500 to-purple-600 rounded-2xl text-white shadow-lg m-4">
  //           <ClipboardList size={32} />
  //           </div>
  //       </div>
  //       <EmptyState
  //           icon={Clock}
  //           title="Incorporation Pending"
  //           description="Your incorporation cycle has been created by the admin and is currently pending. Please wait for the document requests to be activated."
  //       />
  //     </div>
  //   );
  // }

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {!company?.incorporationStatus && (
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
      )}

      {/* Verification Status */}
      {company?.incorporationStatus ? (
        <Card className="bg-white/60 border-emerald-100 shadow-sm backdrop-blur-md p-12 text-center flex flex-col items-center justify-center animate-in zoom-in-95 duration-500">
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mb-6 drop-shadow-sm">
            <CheckCircle2 size={48} />
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-3 tracking-tight">Incorporation Verified</h3>
          <p className="text-gray-500 max-w-sm mx-auto font-medium">
            Your company incorporation process has been successfully completed and verified by our compliance team.
          </p>
        </Card>
      ) : (
        <>

          <div className="space-y-4">
              {documentRequests.length === 0 ? (
                <EmptyState
                    icon={FileText}
                    title="No Documents Required"
                    description="There are no document requests for this incorporation at the moment."
                />
              ) : (
                documentRequests.map((request: any) => {
                    const isExpanded = expandedRequests.has(request.id);
                    
                    const docs = request.requestedDocuments || []
                    const singleDocs = docs.filter((d: any) => d.count === 'SINGLE')
                    const multipleGroups = docs.filter((d: any) => d.count === 'MULTIPLE')
                    const allFlattenedDocs = docs.flatMap((d: any) => 
                      d.count === 'MULTIPLE' ? (d.children || d.multiple || []) : [d]
                    );
                    const totalDocsCount = allFlattenedDocs.length;
                    const isUploaded = (d: any) => !!(d.fileId || d.uploadedFileName || d.file?.url || ['UPLOADED', 'ACCEPTED', 'SUBMITTED', 'COMPLETED'].includes(d.status?.toUpperCase()));
                    const uploadedDocsCount = allFlattenedDocs.filter(isUploaded).length;
                    const completionRate = totalDocsCount > 0 ? Math.round((uploadedDocsCount / totalDocsCount) * 100) : 0;

                    return (
                      <Card
                        key={request.id}
                        className="bg-white/80 border border-gray-300 rounded-xl shadow-sm hover:bg-white/70 transition-all overflow-hidden"
                      >
                        <CardContent className="p-0">
                          <div className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                  <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center text-orange-600 font-bold text-lg">
                                    {(request.title || 'D').charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <h4 className="text-lg font-semibold text-gray-900 leading-tight">
                                      <TruncatedTooltip content={request.title || 'Document Request'}>
                                        {request.title || 'Document Request'}
                                      </TruncatedTooltip>
                                    </h4>
                                    {request.description && (
                                        <p className="text-sm text-gray-600 leading-relaxed max-w-2xl mt-1">{request.description}</p>
                                    )}
                                  </div>
                                </div>

                                <div className="mb-4 flex flex-wrap gap-2 items-center">
                                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-100 rounded-lg px-2 py-0.5 text-[11px] font-semibold">
                                    {uploadedDocsCount}/{totalDocsCount} DOCUMENTS ({completionRate}%)
                                  </Badge>
                                  {getStatusBadge(request.status)}
                                </div>

                                {totalDocsCount > 0 && (
                                  <div className="flex items-center gap-4 mb-4">
                                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                      <div 
                                        className="h-full bg-emerald-500 rounded-full transition-all duration-500 ease-out"
                                        style={{ width: `${completionRate}%` }}
                                      />
                                    </div>
                                    <span className="text-[14px] font-medium text-emerald-600 tracking-tight">
                                      {completionRate}%
                                    </span>
                                  </div>
                                )}
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
                                {isExpanded && (
                                  <div className="flex bg-gray-100 p-0.5 rounded-xl border border-gray-200 shadow-xs">
                                    <button
                                      onClick={() => setUploadMode(prev => ({ ...prev, [request.id]: 'single' }))}
                                      className={cn(
                                        "px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all duration-200",
                                        uploadMode[request.id] !== 'bulk' 
                                          ? "bg-white text-primary shadow-sm" 
                                          : "text-gray-400 hover:text-gray-600"
                                      )}
                                    >
                                      Single
                                    </button>
                                    <button
                                      onClick={() => setUploadMode(prev => ({ ...prev, [request.id]: 'bulk' }))}
                                      className={cn(
                                        "px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all duration-200",
                                        uploadMode[request.id] === 'bulk' 
                                          ? "bg-white text-primary shadow-sm" 
                                          : "text-gray-400 hover:text-gray-600"
                                      )}
                                    >
                                      Bulk
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {isExpanded && (
                            <div className="bg-gray-50/50 border-t border-gray-100 animate-in slide-in-from-top-2 duration-300 p-4">
                              {singleDocs.length === 0 && multipleGroups.length === 0 ? (
                                <div className="text-center py-4 text-gray-500 text-sm bg-white rounded-lg">
                                  No documents in this request yet
                                </div>
                              ) : (
                                <>
                                  {uploadMode[request.id] !== 'single' ? (
                                    <div className="space-y-6">
                                      <BulkUploadZone
                                        requestId={request.id}
                                        requestTitle={request.title || 'Document Request'}
                                        onSuccess={async () => {
                                          await refetch();
                                        }}
                                        onClear={handleClear}
                                        documents={docs}
                                      />
                                        <UnassignedFilesSection files={request.unassignedFiles || []} />
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
        </>
      )}
      
    </div>
  )
}

export default IncorporationSection
