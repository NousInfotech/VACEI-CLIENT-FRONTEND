"use client"

import React from "react"
import DashboardCard from "../DashboardCard"
import { Skeleton } from "@/components/ui/skeleton"
import { useEngagement } from "./hooks/useEngagement"
import { useFilings } from "./hooks/useFilings"
import { 
  FileText, 
  Download, 
  ExternalLink,
  CheckCircle2,
  FileIcon
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

function formatTs(ts: string) {
  const d = new Date(ts)
  if (Number.isNaN(d.getTime())) return ts
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

export default function FilingsTab() {
  const { engagement } = useEngagement()
  const engagementId =
    ((engagement as any)?._id as string | undefined) ||
    ((engagement as any)?.id as string | undefined) ||
    null
  
  const { filings, loading, error } = useFilings(engagementId)

  if (loading) {
    return (
      <div className="space-y-4">
        <DashboardCard className="p-6 rounded-0">
          <Skeleton className="h-20 w-full rounded-0" />
        </DashboardCard>
        {Array.from({ length: 4 }).map((_, i) => (
          <DashboardCard key={i} className="p-4 rounded-0 flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/3 rounded-0" />
              <Skeleton className="h-3 w-1/4 rounded-0" />
            </div>
            <Skeleton className="h-8 w-24 rounded-0" />
          </DashboardCard>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-20 bg-white border border-dashed border-red-200">
        <p className="text-sm text-red-500 font-medium">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <DashboardCard className="p-8 rounded-0 border-l-4 border-l-primary bg-slate-50/50">
        <div className="flex items-center gap-6">
          <div className="h-14 w-14 rounded-0 bg-primary/10 text-primary flex items-center justify-center shadow-sm shrink-0">
            <FileText className="h-7 w-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-bold tracking-tight text-slate-900">Official Filings</h3>
            <p className="text-sm text-slate-500 font-medium">
              Access all officially filed documents and reports for this engagement.
            </p>
          </div>
        </div>
      </DashboardCard>

      {!filings.length ? (
        <div className="text-center py-32 bg-white border border-dashed border-slate-200">
          <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200">
            <CheckCircle2 size={40} />
          </div>
          <h4 className="text-lg font-bold text-slate-900">No Filed Records Found</h4>
          <p className="text-slate-500 mt-2 max-w-xs mx-auto">
            Once documents are finalized and filed by our team, they will appear here.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Document</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Filed Date</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filings.map((filing) => (
                <tr key={filing.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-0 bg-slate-100 text-slate-400 flex items-center justify-center group-hover:bg-primary/5 group-hover:text-primary transition-colors">
                        <FileIcon size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 leading-none">{filing.name}</p>
                        <p className="text-xs text-slate-400 mt-1.5 font-medium">{filing.file?.file_name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-sm font-medium text-slate-600">
                      {formatTs(filing.updatedAt)}
                    </p>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <Badge variant="outline" className="rounded-0 px-3 py-1 bg-emerald-50 text-emerald-600 border-emerald-100 text-[10px] font-black uppercase tracking-widest">
                      <CheckCircle2 size={10} className="mr-1.5" />
                      Filed
                    </Badge>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-9 w-9 rounded-0 hover:bg-white hover:text-primary border border-transparent hover:border-slate-200 shadow-none"
                              onClick={() => window.open(filing.file?.url, '_blank')}
                            >
                              <Download size={16} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent className="rounded-0 bg-slate-900">
                            <p className="text-[10px] uppercase font-black tracking-widest">Download Filing</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-9 w-9 rounded-0 hover:bg-white hover:text-primary border border-transparent hover:border-slate-200 shadow-none"
                              onClick={() => window.open(filing.file?.url, '_blank')}
                            >
                              <ExternalLink size={16} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent className="rounded-0 bg-slate-900">
                            <p className="text-[10px] uppercase font-black tracking-widest">View Online</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
