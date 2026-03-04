"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import DashboardCard from "@/components/DashboardCard";
import { Users, ArrowRight, Clock, Calendar, Eye } from "lucide-react";
import { fetchDashboardSummary } from "@/api/dashboardApi";
import { useActiveCompany } from "@/context/ActiveCompanyContext";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";


interface Submission {
  id: string;
  name: string;
  status: string;
  due_date?: string;
  description?: string;
  type?: string;
  authority?: string;
}

export const NextComplianceDeadline = () => {
  const [payrollSubmissions, setPayrollSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const { activeCompanyId } = useActiveCompany();

  useEffect(() => {
    const loadData = async () => {
      if (!activeCompanyId) return;
      try {
        setLoading(true);
        const data = await fetchDashboardSummary(activeCompanyId);
        if (data && data.upcomingCompliance) {
          setPayrollSubmissions(data.upcomingCompliance.map((item: any) => ({
            id: item.id || Math.random().toString(),
            name: item.title,
            status: item.status || 'upcoming', // Defaulting to upcoming for upcoming items
            due_date: item.dueDate,
            description: item.description,
            type: item.frequency || item.type,
            authority: item.customServiceCycle?.title || item.serviceCategory || "Pending",
          })));
        }
      } catch (error) {
        console.error("Failed to fetch compliance data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [activeCompanyId]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const [selectedItem, setSelectedItem] = useState<Submission | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const statusConfig: Record<string, { label: string; color: string; }> = {
    filed: {
      label: "Completed",
      color: "bg-emerald-50 text-emerald-600 border-emerald-100",
    },
    upcoming: {
      label: "Upcoming",
      color: "bg-blue-50 text-blue-600 border-blue-100",
    },
    due_today: {
      label: "Due Today",
      color: "bg-orange-50 text-orange-600 border-orange-100",
    },
    overdue: {
      label: "Overdue",
      color: "bg-red-50 text-red-600 border-red-100",
    },
    pending: {
      label: "Pending",
      color: "bg-amber-50 text-amber-700 border-amber-200",
    }
  };

  if (loading) {
    return (
      <DashboardCard className="border-l-4 border-l-primary p-6 md:p-8 animate-pulse">
        <div className="h-20 bg-gray-100 rounded-lg mb-4" />
        <div className="space-y-3 pt-4 border-t border-gray-100">
          <div className="h-10 bg-gray-50 rounded-lg" />
          <div className="h-10 bg-gray-50 rounded-lg" />
        </div>
      </DashboardCard>
    );
  }

  return (
    <DashboardCard className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 shadow-inner">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">Next Compliance Deadline</h2>
            <p className="text-sm text-gray-600 font-medium">Statutory submissions and obligations</p>
          </div>
        </div>
        <Link href={`/dashboard/${activeCompanyId}/compliance`}>
          <Button variant="outline" size="sm" className="rounded-xl border-gray-200 shadow-sm hover:bg-gray-50 font-bold px-4">
            View Calendar
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>

      <div className="space-y-3 pt-5 border-t border-gray-100">
        <h3 className="text-xs font-medium text-gray-400 uppercase tracking-[0.2em] mb-4">Upcoming statutory submissions</h3>
        {payrollSubmissions.length > 0 ? (
          payrollSubmissions.map((submission, index) => (
            <div
              key={index}
              className="group flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-gray-50/50 transition-all duration-300"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary/40 group-hover:bg-primary transition-colors" />
                  <span className="text-base font-bold text-gray-900">
                    {submission.name}
                  </span>
                </div>
                {submission.due_date && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium ml-3.5">
                    <Clock className="w-3.5 h-3.5 opacity-60" />
                    Due: {formatDate(submission.due_date)}
                  </div>
                )}
              </div>
              <div className="shrink-0 flex items-center md:pl-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedItem(submission);
                    setIsDetailModalOpen(true);
                  }}
                  className="bg-white hover:bg-gray-50 text-gray-700 border-gray-200 font-bold uppercase tracking-widest text-[10px]"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View
                </Button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500 py-4 text-center italic">No upcoming deadlines at the moment.</p>
        )}
      </div>

      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Compliance Details"
        size="wide"
      >
        {selectedItem && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <Badge className={cn("px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest border", statusConfig[selectedItem.status]?.color || statusConfig.upcoming.color)}>
                    {statusConfig[selectedItem.status]?.label || "Upcoming"}
                  </Badge>
                  {selectedItem.type && (
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{selectedItem.type}</span>
                  )}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mt-2">{selectedItem.name}</h3>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 py-6 border-y border-gray-100">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Due Date</p>
                <div className="flex items-center gap-2 text-gray-900 font-semibold">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  {selectedItem.due_date ? new Date(selectedItem.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : "—"}
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Authority</p>
                <div className="flex items-center gap-2 text-gray-900 font-semibold">
                  <Clock className="w-4 h-4 text-gray-400" />
                  {selectedItem.authority || "—"}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Description</p>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 min-h-[100px]">
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                  {selectedItem.description || "No description provided for this compliance requirement."}
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-4 gap-3">
              <Button variant="outline" onClick={() => setIsDetailModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </DashboardCard>
  );
};

export default NextComplianceDeadline;
