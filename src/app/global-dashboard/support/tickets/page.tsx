"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { HelpCircle, ArrowLeft, Loader2, ListChecks, Send } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import DashboardCard from "@/components/DashboardCard";
import { Button } from "@/components/ui/button";
import { getSupportRequests, type SupportRequestItem } from "@/api/supportService";

function RequestStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PENDING: "bg-amber-100 text-amber-800",
    ACCEPTED: "bg-emerald-100 text-emerald-800",
    REJECTED: "bg-red-100 text-red-800",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] ?? "bg-slate-100 text-slate-700"}`}>
      {status}
    </span>
  );
}

function TicketStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PENDING: "bg-amber-100 text-amber-800",
    ACTIVE: "bg-blue-100 text-blue-800",
    IN_PROGRESS: "bg-blue-100 text-blue-800",
    RESOLVED: "bg-emerald-100 text-emerald-800",
    CLOSED: "bg-slate-100 text-slate-700",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] ?? "bg-slate-100 text-slate-700"}`}>
      {status}
    </span>
  );
}

export default function SupportTicketsPage() {
  const [requests, setRequests] = useState<SupportRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1, limit: 10 });

  useEffect(() => {
    setLoading(true);
    setError(null);
    getSupportRequests({ page, limit: 10 })
      .then((res) => {
        setRequests(res.data);
        setMeta(res.meta);
      })
      .catch((err) => setError(err?.message ?? "Failed to load requests"))
      .finally(() => setLoading(false));
  }, [page]);

  const ticketStatus = (r: SupportRequestItem) => {
    const t = r.tickets?.[0];
    return t ? t.status : "—";
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <PageHeader
        title="My Support Requests"
        subtitle="View status of your support requests and tickets."
        icon={HelpCircle}
        actions={
          <Link href="/global-dashboard/support">
            <Button className="bg-slate-900 hover:bg-black text-white">
              <Send className="w-4 h-4 mr-2" />
              New support request
            </Button>
          </Link>
        }
      />

      <div className="space-y-4">
        <DashboardCard className="p-6 border-none shadow-sm bg-white">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
            </div>
          ) : error ? (
            <p className="text-red-600 py-6 text-center">{error}</p>
          ) : requests.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <ListChecks className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium">No support requests yet</p>
              <p className="text-sm mt-1">Submit a request from the support page.</p>
              <Link href="/global-dashboard/support">
                <Button className="mt-4 bg-slate-900 hover:bg-black text-white">
                  Go to Support
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="pb-3 text-xs font-bold uppercase tracking-widest text-slate-400">Subject</th>
                      <th className="pb-3 text-xs font-bold uppercase tracking-widest text-slate-400">Description</th>
                      <th className="pb-3 text-xs font-bold uppercase tracking-widest text-slate-400">Request status</th>
                      <th className="pb-3 text-xs font-bold uppercase tracking-widest text-slate-400">Ticket status</th>
                      <th className="pb-3 text-xs font-bold uppercase tracking-widest text-slate-400">Submitted</th>
                      <th className="pb-3 text-xs font-bold uppercase tracking-widest text-slate-400 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((r) => (
                      <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                        <td className="py-4 font-medium text-slate-900">{r.subject}</td>
                        <td className="py-4 text-sm text-slate-600 max-w-xs">
                          <span className="line-clamp-2">{r.description || "—"}</span>
                        </td>
                        <td className="py-4">
                          <RequestStatusBadge status={r.status} />
                        </td>
                        <td className="py-4">
                          <TicketStatusBadge status={ticketStatus(r)} />
                        </td>
                        <td className="py-4 text-sm text-slate-500">
                          {new Date(r.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-4 text-right">
                          <Link href={`/global-dashboard/support/tickets/request/${r.id}`}>
                            <Button variant="outline" size="sm" className="border-slate-200 text-slate-700">
                              View
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {meta.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                  <p className="text-sm text-slate-500">
                    Page {page} of {meta.totalPages} ({meta.total} total)
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= meta.totalPages}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </DashboardCard>
      </div>
    </div>
  );
}
