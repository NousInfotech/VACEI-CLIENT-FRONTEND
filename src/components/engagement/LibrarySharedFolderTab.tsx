"use client"

import React, { useState } from 'react'
import { 
  FolderOpen, 
  FileText, 
  Upload, 
  Download, 
  Eye, 
  Edit, 
  Trash2, 
  CheckCircle2,
  X,
  FileCheck,
  PenTool,
  Share2
} from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card2'
import DashboardCard from "@/components/DashboardCard"
import EmptyState from '../shared/EmptyState'
import { TableSkeleton } from "../shared/CommonSkeletons"
import { useEngagement } from './hooks/useEngagement'
import PillTabs from '../shared/PillTabs'

interface Document {
  id: string
  name: string
  type: 'draft' | 'signed'
  status: 'draft' | 'pending_signature' | 'signed' | 'archived'
  uploadedBy: string
  uploadedDate: string
  version: number
  size: string
  url?: string
}

const LibrarySharedFolderTab = () => {
  const { engagement } = useEngagement()
  const [activeSubTab, setActiveSubTab] = useState('drafts')
  const [loading] = useState(false)
  
  // Mock data - replace with actual API calls
  const [draftDocuments] = useState<Document[]>([
    {
      id: '1',
      name: 'Financial Statements 2024 - Draft v1.pdf',
      type: 'draft',
      status: 'draft',
      uploadedBy: 'John Doe',
      uploadedDate: '2025-01-15',
      version: 1,
      size: '2.4 MB'
    },
    {
      id: '2',
      name: 'Tax Return 2024 - Draft v2.pdf',
      type: 'draft',
      status: 'draft',
      uploadedBy: 'Jane Smith',
      uploadedDate: '2025-01-20',
      version: 2,
      size: '1.8 MB'
    },
  ])

  const [signedDocuments] = useState<Document[]>([
    {
      id: '3',
      name: 'Annual Return 2024 - Signed.pdf',
      type: 'signed',
      status: 'signed',
      uploadedBy: 'John Doe',
      uploadedDate: '2025-01-10',
      version: 1,
      size: '3.1 MB',
      url: '#'
    },
    {
      id: '4',
      name: 'UBO Declaration - Signed.pdf',
      type: 'signed',
      status: 'signed',
      uploadedBy: 'Jane Smith',
      uploadedDate: '2025-01-12',
      version: 1,
      size: '1.2 MB',
      url: '#'
    },
  ])

  const subTabs = [
    { id: 'drafts', label: 'Drafts', icon: PenTool },
    { id: 'signed', label: 'Signed Documents', icon: FileCheck },
  ]

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'signed':
        return <Badge className="bg-green-100 text-green-700 border-green-200">Signed</Badge>
      case 'pending_signature':
        return <Badge className="bg-amber-100 text-amber-700 border-amber-200">Pending Signature</Badge>
      case 'draft':
        return <Badge className="bg-blue-100 text-blue-700 border-blue-200">Draft</Badge>
      case 'archived':
        return <Badge className="bg-gray-100 text-gray-700 border-gray-200">Archived</Badge>
      default:
        return <Badge variant="outline">{status || 'Active'}</Badge>
    }
  }

  const currentDocuments = activeSubTab === 'drafts' ? draftDocuments : signedDocuments

  if (loading) {
    return <TableSkeleton rows={5} />
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex items-center justify-between bg-white/40 rounded-2xl border border-white/60 shadow-sm backdrop-blur-md mb-5 p-6">
        <div>
          <h2 className="text-3xl font-semibold">Library & Shared Folder</h2>
          <p className="text-sm text-gray-500 mt-1 font-medium">
            Manage draft documents and signed documents for this engagement
          </p>
        </div>
        <div className="p-4 bg-linear-to-br from-purple-500 to-pink-600 rounded-2xl text-white shadow-lg shadow-purple-200">
          <FolderOpen size={32} />
        </div>
      </div>

      <PillTabs 
        tabs={subTabs} 
        activeTab={activeSubTab} 
        onTabChange={setActiveSubTab} 
      />

      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm text-muted-foreground">
            {activeSubTab === 'drafts' 
              ? `${draftDocuments.length} draft document${draftDocuments.length !== 1 ? 's' : ''}`
              : `${signedDocuments.length} signed document${signedDocuments.length !== 1 ? 's' : ''}`
            }
          </p>
        </div>
        <Button size="sm" className="rounded-lg">
          <Upload className="w-4 h-4 mr-2" />
          Upload Document
        </Button>
      </div>

      {!currentDocuments || currentDocuments.length === 0 ? (
        <EmptyState
          icon={FileText}
          title={`No ${activeSubTab === 'drafts' ? 'Draft' : 'Signed'} Documents`}
          description={`No ${activeSubTab === 'drafts' ? 'draft' : 'signed'} documents have been uploaded for this engagement yet.`}
        />
      ) : (
        <div className="space-y-4">
          {currentDocuments.map((doc) => (
            <Card
              key={doc.id}
              className="bg-white/80 border border-gray-300 rounded-xl shadow-sm hover:bg-white/70 transition-all overflow-hidden"
            >
              <CardContent className="p-0">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          doc.type === 'draft' 
                            ? 'bg-blue-50 text-blue-600' 
                            : 'bg-green-50 text-green-600'
                        }`}>
                          {doc.type === 'draft' ? (
                            <PenTool size={20} />
                          ) : (
                            <FileCheck size={20} />
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-gray-900 mb-1">
                            {doc.name}
                          </h4>
                          <div className="flex items-center gap-3 flex-wrap">
                            {getStatusBadge(doc.status)}
                            <span className="text-xs text-muted-foreground">
                              Version {doc.version}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {doc.size}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              Uploaded by {doc.uploadedBy}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(doc.uploadedDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {doc.type === 'draft' && (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="rounded-lg"
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="rounded-lg"
                          >
                            <Share2 className="w-4 h-4 mr-1" />
                            Request Signature
                          </Button>
                        </>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="rounded-lg"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="rounded-lg"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                      {doc.type === 'draft' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <DashboardCard className="p-6 mt-6">
        <h3 className="text-lg font-semibold text-brand-body mb-4">Library Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground mb-1">Total Drafts</p>
            <p className="font-medium text-brand-body text-lg">{draftDocuments.length}</p>
          </div>
          <div>
            <p className="text-muted-foreground mb-1">Total Signed</p>
            <p className="font-medium text-brand-body text-lg">{signedDocuments.length}</p>
          </div>
          <div>
            <p className="text-muted-foreground mb-1">Engagement ID</p>
            <p className="font-medium text-brand-body">{engagement?._id || '—'}</p>
          </div>
        </div>
      </DashboardCard>
    </div>
  )
}

export default LibrarySharedFolderTab

