"use client"

import React from "react"
import DashboardCard from "../DashboardCard"
import { Skeleton } from "@/components/ui/skeleton"
import { useEngagement } from "./hooks/useEngagement"
import { useFilings } from "./hooks/useFilings"
import { useRouter, useParams } from "next/navigation"
import { 
  FileText, 
  Download, 
  ExternalLink,
  CheckCircle2,
  FileIcon,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  AlertCircle,
  Clock
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { 
  getFilings, 
  type FilingItem 
} from "../../api/filingService"
import FilingCommentsPanel from "./FilingCommentsPanel"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

function formatTs(ts: string) {
  const d = new Date(ts)
  if (Number.isNaN(d.getTime())) return ts
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

export default function FilingsTab() {
  const router = useRouter()
  const params = useParams()
  const companyId = params.companyId as string
  const serviceSlug = params.serviceSlug as string
  
  const { engagement, loading: engagementLoading } = useEngagement()
  const engagementId =
    ((engagement as any)?._id as string | undefined) ||
    ((engagement as any)?.id as string | undefined) ||
    null
  
  const { filings, loading, error, refetch } = useFilings(engagementId)
  
  const [isCommentsOpen, setIsCommentsOpen] = React.useState(false)
  const [activeFilingForComments, setActiveFilingForComments] = React.useState<FilingItem | null>(null)
  const handleOpenComments = (filing: FilingItem) => {
    setActiveFilingForComments(filing)
    setIsCommentsOpen(true)
  }

  const handleOpenDetails = (filing: FilingItem) => {
    if (companyId && serviceSlug && engagementId) {
      router.push(`/dashboard/${companyId}/services/${serviceSlug}/${engagementId}/filings/${filing.id}`)
    }
  }

  if (loading || engagementLoading) {
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
      {/* <DashboardCard className="p-8 rounded-0 border-l-4 border-l-primary bg-slate-50/50">
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
      </DashboardCard> */}

      {!filings.length ? (
        <div className="text-center py-32 bg-white border border-dashed border-slate-200">
          <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200">
            <CheckCircle2 size={40} />
          </div>
          <h4 className="text-lg font-bold text-slate-900">No Filing Records Found</h4>
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
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filings.map((filing) => (
                <NestedFilingRows 
                  key={filing.id} 
                  filing={filing} 
                  onOpenComments={handleOpenComments}
                  onOpenDetails={handleOpenDetails}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeFilingForComments && engagementId && (
        <FilingCommentsPanel 
          isOpen={isCommentsOpen}
          onClose={() => setIsCommentsOpen(false)}
          filing={activeFilingForComments}
          engagementId={engagementId}
        />
      )}
    </div>
  )
}

function NestedFilingRows({ 
  filing, 
  onOpenComments,
  onOpenDetails
}: { 
  filing: any;
  onOpenComments: (filing: any) => void;
  onOpenDetails: (filing: any) => void;
}) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const hasMultiple = (filing.files || []).length > 1;

  if (!filing.files?.length) return null;

  // Primary row (shows first file info or summary)
  const firstFile = filing.files[0];

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'FILED':
        return { 
          label: "Filed", 
          icon: <CheckCircle2 size={10} className="mr-1.5" />, 
          className: "bg-emerald-50 text-emerald-600 border-emerald-100" 
        };
      case 'CLIENT_REVIEW':
        return { 
          label: "In Review", 
          icon: <Clock size={10} className="mr-1.5" />, 
          className: "bg-indigo-50 text-indigo-600 border-indigo-100" 
        };
      case 'CANCELLED':
        return { 
          label: "Cancelled", 
          icon: <AlertCircle size={10} className="mr-1.5" />, 
          className: "bg-red-50 text-red-600 border-red-100" 
        };
      default:
        return { 
          label: "Draft", 
          icon: <Clock size={10} className="mr-1.5" />, 
          className: "bg-amber-50 text-amber-600 border-amber-100" 
        };
    }
  };

  const statusCfg = getStatusConfig(filing.status);

  return (
    <>
      <tr className="hover:bg-slate-50/50 transition-colors group">
        <td className="px-6 py-5">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-0 bg-slate-100 text-slate-400 flex items-center justify-center group-hover:bg-primary/5 group-hover:text-primary transition-colors">
              <FileIcon size={18} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 leading-none">{filing.name}</p>
              {hasMultiple ? (
                <button 
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-[10px] text-primary mt-1.5 font-black uppercase tracking-widest flex items-center gap-1 hover:underline"
                >
                  {filing.files.length} Files
                  {isExpanded ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                </button>
              ) : (
                <p className="text-xs text-slate-400 mt-1.5 font-medium">{firstFile.file?.file_name}</p>
              )}
            </div>
          </div>
        </td>
        <td className="px-6 py-5 text-center">
          <Badge variant="outline" className={cn("rounded-0 px-3 py-1 text-[10px] font-black uppercase tracking-widest", statusCfg.className)}>
            {statusCfg.icon}
            {statusCfg.label}
          </Badge>
        </td>
        <td className="px-6 py-5">
          <div className="flex items-center justify-end gap-3">
             {/* Comments */}
             <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 rounded-full bg-slate-50 text-slate-500 hover:bg-primary/5 hover:text-primary px-3 gap-2 text-[10px] font-black uppercase tracking-widest"
                    onClick={() => onOpenComments(filing)}
                  >
                    <MessageSquare size={12} />
                    {(filing.comments || []).length > 0 && (
                      <span className="text-[9px]">{(filing.comments || []).length}</span>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-[10px] uppercase font-black tracking-widest">Discussion</p>
                </TooltipContent>
              </Tooltip>

              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 rounded-full bg-white hover:bg-slate-50 px-4 gap-2 text-[10px] font-black uppercase tracking-widest text-slate-700 border-slate-200 hover:border-slate-300 transition-all"
                onClick={() => onOpenDetails(filing)}
              >
                View Details
              </Button>
            </TooltipProvider>

            {!hasMultiple && (
              <FileActions file={firstFile.file} name={filing.name} />
            )}
          </div>
        </td>
      </tr>
      {isExpanded && hasMultiple && (
        <tr className="bg-slate-50/30">
          <td colSpan={3} className="px-6 py-4">
            <div className="space-y-2 ml-14">
              {filing.files.map((f: any) => (
                <div key={f.id} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-0 hover:border-primary/20 transition-all">
                  <div className="flex items-center gap-3">
                    <FileIcon size={14} className="text-slate-400" />
                    <span className="text-xs font-medium text-slate-700">{f.file.file_name}</span>
                  </div>
                  <FileActions file={f.file} />
                </div>
              ))}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function FileActions({ file, name }: { file: any, name?: string }) {
  if (!file?.url) return null;
  return (
    <div className="flex items-center justify-end gap-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-900 hover:text-white transition-all duration-200 border border-slate-200 hover:border-slate-900 shadow-sm"
              onClick={() => {
                const link = document.createElement('a');
                link.href = file.url;
                link.download = file.file_name || name || 'document';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
            >
              <Download size={14} />
            </Button>
          </TooltipTrigger>
          <TooltipContent className="rounded-0 bg-slate-900 text-white">
            <p className="text-[10px] uppercase font-black tracking-widest">Download</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-900 hover:text-white transition-all duration-200 border border-slate-200 hover:border-slate-900 shadow-sm"
              onClick={() => window.open(file.url, '_blank')}
            >
              <ExternalLink size={14} />
            </Button>
          </TooltipTrigger>
          <TooltipContent className="rounded-0 bg-slate-900 text-white">
            <p className="text-[10px] uppercase font-black tracking-widest">View</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
