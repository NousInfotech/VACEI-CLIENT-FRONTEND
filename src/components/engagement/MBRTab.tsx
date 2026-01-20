"use client"

import React, { useState } from 'react'
import { FileText, Building2, CheckCircle2, Clock, AlertCircle } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card2'
import DashboardCard from "@/components/DashboardCard"
import EmptyState from '../shared/EmptyState'
import { TableSkeleton } from "../shared/CommonSkeletons"
import { useEngagement } from './hooks/useEngagement'

const MBRTab = () => {
  const { engagement } = useEngagement()
  const [loading] = useState(false)
  const [mbrSubmissions] = useState([
    { code: "A1", name: "Annual Return", status: "Pending", dueDate: "2025-03-31" },
    { code: "BO1", name: "Initial UBO Declaration", status: "Done", dueDate: "2024-12-15" },
    { code: "BO2", name: "Change in UBO Details", status: "Waiting", dueDate: "2025-02-28" },
    { code: "FS", name: "Financial Statements Filing", status: "Draft", dueDate: "2025-04-30" },
  ])

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'done':
      case 'completed':
        return <Badge className="bg-green-100 text-green-700 border-green-200">Done</Badge>
      case 'waiting':
      case 'waiting on you':
        return <Badge className="bg-amber-100 text-amber-700 border-amber-200">Waiting</Badge>
      case 'draft':
        return <Badge className="bg-blue-100 text-blue-700 border-blue-200">Draft</Badge>
      case 'pending':
        return <Badge className="bg-gray-100 text-gray-700 border-gray-200">Pending</Badge>
      default:
        return <Badge variant="outline">{status || 'Active'}</Badge>
    }
  }

  if (loading) {
    return <TableSkeleton rows={5} />
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex items-center justify-between bg-white/40 rounded-2xl border border-white/60 shadow-sm backdrop-blur-md mb-5 p-6">
        <div>
          <h2 className="text-3xl font-semibold">MBR Submissions</h2>
          <p className="text-sm text-gray-500 mt-1 font-medium">
            Track all Malta Business Registry forms with statuses and quick actions
          </p>
        </div>
        <div className="p-4 bg-linear-to-br from-blue-500 to-indigo-600 rounded-2xl text-white shadow-lg shadow-blue-200">
          <Building2 size={32} />
        </div>
      </div>

      {!mbrSubmissions || mbrSubmissions.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No MBR Submissions"
          description="No MBR submissions have been created for this engagement yet."
        />
      ) : (
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/60 text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Form Code</th>
                  <th className="px-4 py-3 font-medium">Form Name</th>
                  <th className="px-4 py-3 font-medium">Due Date</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {mbrSubmissions.map((submission) => (
                  <tr key={submission.code} className="border-t border-border hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-semibold text-brand-body">{submission.code}</td>
                    <td className="px-4 py-3">{submission.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {submission.dueDate ? new Date(submission.dueDate).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(submission.status)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="rounded-lg text-xs px-3 shadow-sm hover:shadow-md transition-shadow"
                      >
                        {submission.status === "Pending" ? "Start" : submission.status === "Done" ? "View" : "Open"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <DashboardCard className="p-6 mt-6">
            <h3 className="text-lg font-semibold text-brand-body mb-4">MBR Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground mb-1">Engagement ID</p>
                <p className="font-medium text-brand-body">{engagement?._id || '—'}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Total Submissions</p>
                <p className="font-medium text-brand-body">{mbrSubmissions.length}</p>
              </div>
            </div>
          </DashboardCard>
        </div>
      )}
    </div>
  )
}

export default MBRTab

