import React, { useState } from "react";
import { ChevronRight, Calendar, CheckCircle, Building2, CalendarDays, AlertCircle, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { format, isPast, isToday } from "date-fns";
import { ComplianceCalendarEntry } from "@/api/complianceCalendarService";
import ShadowCard from "@/components/ui/ShadowCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useGlobalDashboard } from "@/context/GlobalDashboardContext";

export type ComplianceStatus = 'filed' | 'upcoming' | 'due_today' | 'overdue'

interface ComplianceItem {
  id: string
  complianceId: string
  companyId?: string
  companyName?: string
  title: string
  type: string
  dueDate: string
  status: ComplianceStatus
  authority: string
  description: string
  cta: string
  serviceCategory: string
}

function mapApiToComplianceItem(c: ComplianceCalendarEntry): ComplianceItem {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const deadline = new Date(c.dueDate)
  deadline.setHours(0, 0, 0, 0)
  
  const isPastDate = deadline.getTime() < today.getTime()
  const isTodayDate = deadline.getTime() === today.getTime()
 
  let status: ComplianceStatus = 'upcoming'
  if (isPastDate) status = 'overdue'
  else if (isTodayDate) status = 'due_today'
  else status = 'upcoming'

  return {
    id: c.id,
    complianceId: c.id,
    companyId: c.companyId || undefined,
    companyName: c.company?.name || (c.type === 'GLOBAL' ? 'Global' : 'Other'),
    title: c.title,
    type: c.frequency,
    dueDate: c.dueDate,
    status,
    authority: c.customServiceCycle?.title || c.serviceCategory,
    description: c.description || '',
    cta: 'Mark as done',
    serviceCategory: c.serviceCategory,
  }
}

const statusConfig: Record<ComplianceStatus, { label: string; color: string; icon: any }> = {
  filed: { 
    label: 'Completed', 
    color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    icon: CheckCircle2,
  },
  upcoming: { 
    label: 'Upcoming', 
    color: 'bg-blue-50 text-blue-600 border-blue-100',
    icon: Clock,
  },
  due_today: { 
    label: 'Due Today', 
    color: 'bg-orange-50 text-orange-600 border-orange-100',
    icon: AlertCircle,
  },
  overdue: { 
    label: 'Overdue', 
    color: 'bg-red-50 text-red-600 border-red-100',
    icon: AlertCircle,
  },
}

interface GlobalTasksProps {
  calendarEntries: ComplianceCalendarEntry[];
  isLoading?: boolean;
}

export default function GlobalTasks({ calendarEntries, isLoading = false }: GlobalTasksProps) {
  const router = useRouter();
  const { companies } = useGlobalDashboard();
  const [selectedItem, setSelectedItem] = useState<ComplianceItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const overdueItems = calendarEntries.filter(e => isPast(new Date(e.dueDate)) && !isToday(new Date(e.dueDate)));
  const upcomingItems = calendarEntries.filter(e => isToday(new Date(e.dueDate)) || !isPast(new Date(e.dueDate)));

  // Find first company with unverified KYC
  const invalidKycCompany = companies.find(c => c.kycStatus === false);

  const handleViewDetails = (e: ComplianceCalendarEntry) => {
    setSelectedItem(mapApiToComplianceItem(e));
    setIsModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-7 w-32 rounded-lg" />
          <Skeleton className="h-8 w-24 rounded-md" />
        </div>
        
        <ShadowCard>
          <div className="divide-y divide-slate-50 px-5 py-5 flex flex-col gap-7">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Skeleton className="w-12 h-12 rounded-2xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-48 rounded-md" />
                    <Skeleton className="h-3 w-32 rounded-md" />
                  </div>
                </div>
                <Skeleton className="h-9 w-24 rounded-md" />
              </div>
            ))}
          </div>
        </ShadowCard>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Global Tasks</h2>
        <Button 
          variant="ghost" 
          onClick={() => router.push('/global-dashboard/compliance')}
        >
          View All <ChevronRight size={16} />
        </Button>
      </div>
      
      <ShadowCard>
        <div className="divide-y divide-slate-50 px-5 py-5 flex flex-col gap-7">
          {/* 1. Overdue Item */}
          {overdueItems.slice(0, 1).map(e => (
            <div key={e.id} className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#5C6BC0]/10 flex items-center justify-center">
                  <Calendar className="text-[#5C6BC0] w-6 h-6" />
                </div>
                <div>
                  <h4 className="flex items-center gap-2">
                    <span className="font-bold">Follow up:</span> {e.title}
                    <span className="bg-rose-50 text-rose-500 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Overdue</span>
                  </h4>
                </div>
              </div>
              <Button 
                variant="outline" 
                onClick={() => handleViewDetails(e)}
              >
                View <ChevronRight size={14} className="ml-2" />
              </Button>
            </div>
          ))}

          {/* 2. Upcoming Item */}
          {upcomingItems.slice(0, 1).map(e => (
            <div key={e.id} className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center">
                  <Calendar className="text-amber-500 w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-semibold">{e.title} scheduled</h4>
                  <p className="text-slate-400 text-xs flex items-center gap-1 mt-0.5">
                    <Calendar size={12} /> {format(new Date(e.dueDate), "MMM dd, yyyy")}
                  </p>
                </div>
              </div>
              <Button 
                variant="outline"
                onClick={() => handleViewDetails(e)}
              >
                View <ChevronRight size={14} className="ml-2" />
              </Button>
            </div>
          ))}

          {/* 3. KYC Task */}
          {invalidKycCompany && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-sky-50 flex items-center justify-center">
                  <CheckCircle className="text-sky-500 w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-semibold">Update KYC for client companies</h4>
                </div>
              </div>
              <Button 
                variant="outline"
                onClick={() => router.push(`/global-dashboard/companies/${invalidKycCompany.id}`)}
              >
                View <ChevronRight size={14} className="ml-2" />
              </Button>
            </div>
          )}
        </div>
      </ShadowCard>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Compliance Details"
        size="wide"
      >
        {selectedItem && (
          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-gray-900 tracking-tight">{selectedItem.title}</h3>
                {selectedItem.companyName && (
                  <div className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-gray-400" />
                    <p className="text-sm text-gray-500 font-medium">{selectedItem.companyName}</p>
                  </div>
                )}
              </div>
              <Badge className={cn("rounded-0 px-3 py-1 text-[10px] font-bold uppercase tracking-widest border", statusConfig[selectedItem.status]?.color)}>
                {statusConfig[selectedItem.status]?.label}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 p-6 bg-slate-50 border border-slate-100 rounded-xl">
              <div className="space-y-1.5">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Due Date</p>
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-primary" />
                  <p className="text-sm font-semibold text-slate-900">
                    {format(new Date(selectedItem.dueDate), "dd MMMM yyyy")}
                  </p>
                </div>
              </div>
              <div className="space-y-1.5">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Authority</p>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-white text-slate-900 border-slate-200 font-medium">
                    {selectedItem.authority}
                  </Badge>
                </div>
              </div>
              <div className="space-y-1.5">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Frequency</p>
                <p className="text-sm font-semibold text-slate-900">{selectedItem.type}</p>
              </div>
              <div className="space-y-1.5">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Service Category</p>
                <p className="text-sm font-semibold text-slate-900">{selectedItem.serviceCategory}</p>
              </div>
            </div>

            {selectedItem.description && (
              <div className="space-y-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Filing Description</p>
                <div className="p-4 bg-white border border-slate-100 rounded-xl">
                  <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                    {selectedItem.description}
                  </p>
                </div>
              </div>
            )}
            
            <div className="pt-4 flex justify-end">
              <Button 
                variant="outline" 
                onClick={() => setIsModalOpen(false)}
                className="rounded-xl px-6"
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
