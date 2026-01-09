"use client"

import React, { useState } from 'react'
import { 
  Shield, 
  MapPin, 
  Globe, 
  ChevronDown, 
  ChevronUp, 
  Loader2,
} from 'lucide-react'
import { Card, CardContent } from '../../ui/card2'
import { Badge } from '@/components/ui/badge'
import { Button } from "@/components/ui/button"
import { useKyc } from '../hooks/useKyc'
import { useCompany } from '../hooks/useCompany'
import DocumentRequestSingle from './SingleDocumentRequest'
import DocumentRequestDouble from './DoubleDocumentRequest'
import PillTabs from '../../shared/PillTabs'
import EmptyState from '../../shared/EmptyState'

const KYCSection = () => {
  const [activeTab, setActiveTab] = useState('Shareholder')
  const [expandedRequests, setExpandedRequests] = useState<Set<string>>(new Set())
  const { company } = useCompany()
  const { kyc, loading, error } = useKyc(company?._id || null)

  const tabs = [
    { id: 'Shareholder', label: 'SHAREHOLDERS' },
    { id: 'Representative', label: 'REPRESENTATIVES' },
  ]

  const toggleExpand = (id: string) => {
    const newSet = new Set(expandedRequests)
    if (newSet.has(id)) {
      newSet.delete(id)
    } else {
      newSet.add(id)
    }
    setExpandedRequests(newSet)
  }

  // Mock handlers
  const handleUpload = (requestId: string, docIndex: number, file: File) => {
    console.log(`Uploading ${file.name} for request ${requestId} at index ${docIndex}`)
  }

  const handleUploadMultiple = (requestId: string, multipleId: string, files: FileList, itemIndex?: number) => {
    console.log(`Uploading ${files.length} files for request ${requestId}, group ${multipleId}, item ${itemIndex}`)
  }

  const handleClear = (requestId: string, docIndex: number, name: string) => {
    console.log(`Clearing ${name} for request ${requestId}`)
  }

  const handleClearMultipleItem = (requestId: string, multipleId: string, itemIndex: number, label: string) => {
    console.log(`Clearing item ${label} for request ${requestId}, group ${multipleId}`)
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

  const renderWorkflowList = (workflowType: string) => {
    // Handle KYC data structure - it may have workflows array or documentRequests array
    const workflows = kyc?.workflows || (kyc?.documentRequests ? [{ documentRequests: kyc.documentRequests }] : [])
    const filteredWorkflows = workflows.filter((w: any) => w.workflowType === workflowType || (!w.workflowType && workflowType === 'Shareholder'))
    
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      )
    }

    if (error) {
      return (
        <EmptyState 
          icon={Shield}
          title="Error Loading KYC"
          description={error}
        />
      )
    }
    
    if (filteredWorkflows.length === 0) {
      return (
        <EmptyState 
          icon={Shield}
          title="No KYC Workflows"
          description={`No ${workflowType} KYC workflows are currently available in the system. Please check later or start a new verification process.`}
        />
      )
    }

    return (
      <div className="space-y-4">
        {filteredWorkflows.map((workflow: any, workflowIndex: number) => (
          <div key={workflow._id || workflowIndex} className="space-y-4">
            {(workflow.documentRequests || []).map((item: any) => {
              const person = item.person
              const request = item.documentRequest
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
                            <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 font-bold text-lg">
                              {person.name.charAt(0)}
                            </div>
                            <div>
                              <h4 className="text-lg font-semibold text-gray-900">
                                {person.name}
                              </h4>
                          </div>
                          </div>
                          
                          <div className="mb-4 flex flex-wrap gap-2">
                            <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-100 rounded-lg px-2 py-0.5 text-[11px] font-semibold">
                              {request.category.toUpperCase()}
                            </Badge>
                            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-100 rounded-lg px-2 py-0.5 text-[11px] font-semibold">
                              {uploadedDocsCount}/{totalDocs} DOCUMENTS
                            </Badge>
                            {getStatusBadge(request.status)}
                          </div>

                          <div className="space-y-2">
                            {person.address && (
                              <div className="flex items-start gap-2 text-sm text-gray-600">
                                <MapPin className="h-4 w-4 mt-0.5 text-gray-400 shrink-0" />
                                <span className="text-xs leading-relaxed">{person.address}</span>
                              </div>
                            )}
                            {person.nationality && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Globe className="h-4 w-4 text-gray-400 shrink-0" />
                                <span className="text-xs">{person.nationality}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => toggleExpand(request._id)}
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
                        <div className="mb-2 flex items-center justify-between">
                          <h5 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Requested Documents</h5>
                          <span className="text-[10px] text-gray-400 italic">Manage your compliance documents here</span>
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
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex items-center justify-between bg-white/40 rounded-2xl border border-white/60 shadow-sm backdrop-blur-md">
        <div>
          <h2 className="text-3xl font-semibold">KYC Workflow Details</h2>
          <p className="text-sm text-gray-500 mt-1 font-medium">Manage document requests and workflow status</p>
        </div>
        <div className="p-4 bg-linear-to-br from-blue-500 to-indigo-600 rounded-2xl text-white shadow-lg shadow-blue-200">
          <Shield size={32} />
        </div>
      </div>

      <PillTabs 
        tabs={tabs} 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        className="mb-8"
      />

      <div className="space-y-6 outline-none">
        {renderWorkflowList(activeTab)}
      </div>
    </div>
  )
}

export default KYCSection