"use client"

import React from 'react'
import DashboardCard from '@/components/DashboardCard'
import { Button } from '@/components/ui/button'
import { FileText, Eye, Download } from 'lucide-react'

interface Document {
  id: string
  name: string
  date: string
  url?: string
}

interface QuickAccessDocumentsProps {
  documents: Document[]
  maxItems?: number
  serviceName: string
}

export const QuickAccessDocuments: React.FC<QuickAccessDocumentsProps> = ({
  documents,
  maxItems = 4,
  serviceName
}) => {
  const displayDocuments = documents.slice(0, maxItems)

  if (displayDocuments.length === 0) {
    return (
      <DashboardCard className="p-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-1 h-6 bg-gray-900 rounded-full" />
            <h3 className="text-lg font-medium tracking-tight">Quick Access Documents</h3>
          </div>
          <p className="text-sm text-gray-500">No documents available for {serviceName}.</p>
        </div>
      </DashboardCard>
    )
  }

  return (
    <DashboardCard className="p-6">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-1 h-6 bg-gray-900 rounded-full" />
          <h3 className="text-lg font-medium tracking-tight">Quick Access Documents</h3>
        </div>
        
        <div className="space-y-2">
          {displayDocuments.map((doc) => (
            <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-gray-50/30 hover:bg-gray-50/50 transition-colors">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{doc.name}</p>
                  <p className="text-xs text-gray-500">{doc.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-3 text-xs rounded-0"
                  onClick={() => doc.url && window.open(doc.url, '_blank')}
                >
                  <Eye className="w-3 h-3 mr-1" />
                  View
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-3 text-xs rounded-0"
                  onClick={() => doc.url && window.open(doc.url, '_blank')}
                >
                  <Download className="w-3 h-3 mr-1" />
                  Download
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardCard>
  )
}
