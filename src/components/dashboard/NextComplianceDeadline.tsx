"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import DashboardCard from "@/components/DashboardCard";
import { Users, ArrowRight, Clock } from "lucide-react";
import { fetchPayrollData } from "@/lib/payrollComplianceIntegration";

interface Submission {
  name: string;
  status: string;
  due_date?: string;
}

export const NextComplianceDeadline = () => {
  const [payrollSubmissions, setPayrollSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await fetchPayrollData();
        if (data) {
          setPayrollSubmissions(data.submissions);
        }
      } catch (error) {
        console.error("Failed to fetch compliance data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    if (status === "submitted") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm">
          Submitted
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium bg-amber-50 text-amber-700 border-amber-200 shadow-sm">
        Pending
      </span>
    );
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
        <Link href="/dashboard/compliance">
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
              {getStatusBadge(submission.status)}
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500 py-4 text-center italic">No upcoming deadlines at the moment.</p>
        )}
      </div>
    </DashboardCard>
  );
};

export default NextComplianceDeadline;
