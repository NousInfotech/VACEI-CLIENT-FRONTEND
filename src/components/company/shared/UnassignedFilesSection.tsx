"use client"

import React from 'react'
import { FileText, Eye, ClipboardList } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface UnassignedFile {
  id: string
  originalName?: string
  file_name?: string
  url?: string
  createdAt?: string
}

interface UnassignedFilesSectionProps {
  files: UnassignedFile[]
  title?: string
}

const UnassignedFilesSection: React.FC<UnassignedFilesSectionProps> = ({ 
  files, 
  title = "Unassigned Bulk Uploads" 
}) => {
  if (!files || files.length === 0) return null

  return (
    <div className="mt-8 bg-white/60 p-6 rounded-2xl border border-indigo-100 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
          <ClipboardList size={24} />
        </div>
        <div>
          <h6 className="text-sm font-bold text-indigo-900 uppercase tracking-wider">
            {title} ({files.length})
          </h6>
          <p className="text-xs text-gray-500 mt-0.5 font-medium">
            Files that could not be automatically assigned during bulk upload
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {files.map((file) => (
          <div 
            key={file.id}
            className="group relative flex items-center justify-between p-4 bg-white/40 hover:bg-white/80 border border-gray-100/50 hover:border-indigo-200 rounded-xl transition-all duration-300 hover:shadow-md"
          >
            <div className="min-w-0 pr-10">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 bg-indigo-50/50 rounded-lg flex items-center justify-center text-indigo-400 shrink-0 group-hover:scale-110 transition-transform">
                  <FileText size={20} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-700 truncate group-hover:text-indigo-600 transition-colors">
                    {file.originalName || file.file_name}
                  </p>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => file.url && window.open(file.url, '_blank')}
              className="absolute right-3 h-10 w-10 p-0 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl bg-white/0 border border-transparent hover:border-indigo-100 transition-all opacity-0 group-hover:opacity-100"
              title="View File"
            >
              <Eye size={18} />
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default UnassignedFilesSection
