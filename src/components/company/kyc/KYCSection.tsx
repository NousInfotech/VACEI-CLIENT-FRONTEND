"use client"

import React, { useState } from 'react'
import {
  Building2,
  User,
  MapPin,
  Globe,
  Shield,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { ListSkeleton } from "../../shared/CommonSkeletons";
import { Card, CardContent } from '../../ui/card2'
import { Badge } from '@/components/ui/badge'
import { Button } from "@/components/ui/button"
import { useKyc } from '../hooks/useKyc'
import { useCompany } from '../hooks/useCompany'
import DocumentRequestSingle from './SingleDocumentRequest'
import DocumentRequestDouble from './DoubleDocumentRequest'
import PillTabs from '../../shared/PillTabs'
import EmptyState from '../../shared/EmptyState'
import { clearRequestedDocument, uploadRequestedDocument } from '@/api/auditService'

const KYCSection = () => {
  const [activeTab, setActiveTab] = useState('Company')
  const [expandedRequests, setExpandedRequests] = useState<Set<string>>(new Set())
  const { company } = useCompany()
  const { kyc, refetch, loading, error } = useKyc(company?._id || company?.id || null)

  const tabs = [
    { id: 'Company', label: 'COMPANY' },
    { id: 'Involvements', label: 'INVOLVEMENTS' },
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

  // Real API handlers (V2)
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
    if (loading) {
      return <ListSkeleton count={3} />;
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

    // Create a map of person IDs to their KYC workflow items
    const kycArray = Array.isArray(kyc) ? kyc : (kyc ? [kyc] : []);
    
    if (kycArray.length === 0) {
      return (
        <EmptyState
          icon={Shield}
          title="KYC Not Initiated"
          description={`No KYC process has been initiated for ${workflowType.toLowerCase()}s by the platform admin yet.`}
        />
      )
    }

    if (workflowType === 'Company') {
      const companyCycles = kycArray.filter((cycle: any) =>
        !!cycle.documentRequest && cycle.documentRequest.status !== 'DRAFT'
      )
      if (companyCycles.length === 0) {
        return (
          <EmptyState
            icon={Shield}
            title="KYC Not Initiated"
            description="No company-level KYC process has been initiated by the platform admin yet."
          />
        )
      }

      return (
        <div className="space-y-4">
          {companyCycles.map((cycle: any) => {
            const request = cycle.documentRequest
            const isExpanded = expandedRequests.has(request.id)
            
            const docs = request.requestedDocuments || []
            const singleDocs = docs.filter((d: any) => d.count === 'SINGLE')
            const multipleGroups = docs.filter((d: any) => d.count === 'MULTIPLE')
            const totalDocs = docs.length
            const uploadedDocsCount = docs.filter((d: any) => d.status === 'UPLOADED' || d.status === 'ACCEPTED').length

            return (
              <Card
                key={cycle.id}
                className="bg-white/80 border border-gray-300 rounded-xl shadow-sm hover:bg-white/70 transition-all mb-4 overflow-hidden"
              >
                <CardContent className="p-0">
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 font-bold text-lg">
                            <Building2 className="h-6 w-6" />
                          </div>
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900">
                              {company?.name || 'Company Documents'}
                            </h4>
                          </div>
                        </div>

                        <div className="mb-4 flex flex-wrap gap-2">
                          <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-100 rounded-lg px-2 py-0.5 text-[11px] font-semibold">
                            ENTITY KYC
                          </Badge>
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-100 rounded-lg px-2 py-0.5 text-[11px] font-semibold">
                            {uploadedDocsCount}/{totalDocs} DOCUMENTS
                          </Badge>
                          {cycle.status && getStatusBadge(cycle.status)}
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-start gap-2 text-sm text-gray-600">
                            <MapPin className="h-4 w-4 mt-0.5 text-gray-400 shrink-0" />
                            <span className="text-xs leading-relaxed">{company?.address || 'Company Address'}</span>
                          </div>
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
                      <div className="mb-2 flex items-center justify-between">
                        <h5 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Entity Verification Records</h5>
                        <span className="text-[10px] text-gray-400 italic">Core identification and incorporation documents</span>
                      </div>

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
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )
    }
  }

  // Involvements tab: merge shareholders + representatives deduped by personId
  const renderInvolvements = () => {
    if (loading) return <ListSkeleton count={3} />
    if (error) return <EmptyState icon={Shield} title="Error Loading KYC" description={error} />

    const kycArray = Array.isArray(kyc) ? kyc : (kyc ? [kyc] : []);
    if (kycArray.length === 0) {
      return <EmptyState icon={Shield} title="KYC Not Initiated" description="No KYC process has been initiated for involvements yet." />
    }

    // Build combined persons list from shareHolders + representationalSchema
    const personMap = new Map<string, any>()

    ;(company?.shareHolders || []).forEach((sh: any) => {
      const pid = sh.personId?._id || sh.personId?.id || sh._id
      if (!pid) return
      const existing = personMap.get(pid) || {
        _id: pid,
        name: sh.personId?.name || 'Unknown',
        address: sh.personId?.address,
        nationality: sh.personId?.nationality,
        roles: [],
        sharePercentage: sh.sharePercentage,
      }
      if (!existing.roles.includes('SHAREHOLDER')) existing.roles.push('SHAREHOLDER')
      personMap.set(pid, existing)
    })

    ;(company?.representationalSchema || []).forEach((rep: any) => {
      const pid = rep.personId?._id || rep.personId?.id || rep._id
      if (!pid) return
      const existing = personMap.get(pid) || {
        _id: pid,
        name: rep.personId?.name || 'Unknown',
        address: rep.personId?.address,
        nationality: rep.personId?.nationality,
        roles: [],
      }
      ;(rep.role || []).forEach((r: string) => {
        if (!existing.roles.includes(r)) existing.roles.push(r)
      })
      if (!existing.roles.includes('REPRESENTATIVE')) existing.roles.push('REPRESENTATIVE')
      personMap.set(pid, existing)
    })

    // Build KYC map from involvementKycs — exclude DRAFT document requests
    const kycMap = new Map<string, any>()
    kycArray.forEach((cycle: any) => {
      ;(cycle.involvementKycs || []).forEach((item: any) => {
        // Skip if document request is DRAFT
        if (item.documentRequest?.status === 'DRAFT') return
        const pid = item.personId || item.person?.id || item.person?._id ||
          item.involvement?.personId || item.involvement?.person?.id || item.involvement?.person?._id
        if (pid) kycMap.set(pid, item)
      })
    })

    // Only show persons who have KYC initiated
    const persons = Array.from(personMap.values()).filter(p => kycMap.has(p._id))

    if (persons.length === 0) {
      return <EmptyState icon={Shield} title="No KYC Initiated" description="No KYC process has been initiated for any involvement by the platform admin yet." />
    }

    return (
      <div className="space-y-4">
        {persons.map((person) => {
          const kycItem = kycMap.get(person._id)
          const request = kycItem?.documentRequest
          const isExpanded = request ? expandedRequests.has(request.id) : false

          let totalDocs = 0, uploadedDocsCount = 0
          let singleDocs: any[] = [], multipleGroups: any[] = []
          if (request) {
            const docs = request.requestedDocuments || []
            singleDocs = docs.filter((d: any) => d.count === 'SINGLE')
            multipleGroups = docs.filter((d: any) => d.count === 'MULTIPLE')
            totalDocs = docs.length
            uploadedDocsCount = docs.filter((d: any) => d.status === 'UPLOADED' || d.status === 'ACCEPTED').length
          }

          return (
            <Card key={person._id} className="bg-white/80 border border-gray-300 rounded-xl shadow-sm hover:bg-white/70 transition-all mb-4 overflow-hidden">
              <CardContent className="p-0">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 font-bold text-lg">
                          {person.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">{person.name}</h4>
                          <div className="flex gap-1 mt-1">
                            {person.roles.map((role: string) => (
                              <span key={role} className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                                {role}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="mb-4 flex flex-wrap gap-2">
                        {request ? (
                          <>
                            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-100 rounded-lg px-2 py-0.5 text-[11px] font-semibold">
                              {uploadedDocsCount}/{totalDocs} DOCUMENTS
                            </Badge>
                            {getStatusBadge(request.status)}
                          </>
                        ) : (
                          <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-200 rounded-lg px-2 py-0.5 text-[11px] font-semibold">
                            NO KYC WORKFLOW
                          </Badge>
                        )}
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
                        {person.sharePercentage !== undefined && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <User className="h-4 w-4 text-gray-400 shrink-0" />
                            <span className="text-xs">Share: {person.sharePercentage.toFixed(2)}%</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {request && (
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
                    )}
                  </div>
                </div>

                {request && isExpanded && (
                  <div className="bg-gray-50/50 border-t border-gray-100 p-6 animate-in slide-in-from-top-2 duration-300 space-y-4">
                    {singleDocs.length === 0 && multipleGroups.length === 0 ? (
                      <div className="text-center py-4 text-gray-500 text-sm bg-white rounded-lg">No documents yet</div>
                    ) : (
                      <>
                        <DocumentRequestSingle requestId={request.id} documents={singleDocs} onUpload={handleUpload} onClearDocument={handleClear} />
                        <DocumentRequestDouble requestId={request.id} multipleDocuments={multipleGroups} onUploadMultiple={handleUploadMultiple} onClearMultipleItem={handleClearMultipleItem} onClearMultipleGroup={handleClearMultipleGroup} onDownloadMultipleGroup={handleDownloadMultipleGroup} />
                      </>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
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
        {activeTab === 'Company' ? renderWorkflowList('Company') : renderInvolvements()}
      </div>
    </div>
  )
}

export default KYCSection