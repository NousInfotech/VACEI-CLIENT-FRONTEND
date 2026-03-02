"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { HelpCircle, ArrowLeft, Loader2, MessageSquare, ListChecks } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import DashboardCard from "@/components/DashboardCard";
import { Button } from "@/components/ui/button";
import { getSupportRequests, getTickets, type SupportRequestItem, type TicketItem } from "@/api/supportService";

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PENDING: "bg-amber-100 text-amber-800",
    ACCEPTED: "bg-emerald-100 text-emerald-800",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] ?? "bg-slate-100 text-slate-700"}`}>
      {status}
    </span>
  );
}

export default function SupportTicketsPage() {
  const [requests, setRequests] = useState<SupportRequestItem[]>([]);
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [ticketsLoading, setTicketsLoading] = useState(true);
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

  useEffect(() => {
    setTicketsLoading(true);
    getTickets({ limit: 50 })
      .then((res) => setTickets(res.data))
      .catch(() => setTickets([]))
      .finally(() => setTicketsLoading(false));
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <PageHeader
        title="My Support Requests"
        subtitle="View status of your support requests."
        icon={HelpCircle}
      />

      <div className="flex flex-col gap-4">
        <Link href="/global-dashboard/support">
          <Button variant="outline" className="border-slate-200 text-slate-700">
            <ArrowLeft className="w-4 h-4 mr-2" />
            New support request
          </Button>
        </Link>

        <DashboardCard className="p-6 border-none shadow-sm bg-white">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
            </div>
          ) : error ? (
            <p className="text-red-600 py-6 text-center">{error}</p>
          ) : requests.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
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
                      <th className="pb-3 text-xs font-bold uppercase tracking-widest text-slate-400">Status</th>
                      <th className="pb-3 text-xs font-bold uppercase tracking-widest text-slate-400">Submitted</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((r) => (
                      <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                        <td className="py-4 font-medium text-slate-900">{r.subject}</td>
                        <td className="py-4">
                          <StatusBadge status={r.status} />
                        </td>
                        <td className="py-4 text-sm text-slate-500">
                          {new Date(r.createdAt).toLocaleDateString()}
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

        <DashboardCard className="p-6 border-none shadow-sm bg-white">
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
            <ListChecks className="w-4 h-4" />
            My tickets (view updates)
          </h3>
          {ticketsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
            </div>
          ) : tickets.length === 0 ? (
            <p className="text-slate-500 py-4">No tickets yet. When a support request is accepted, a ticket will appear here.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="pb-3 text-xs font-bold uppercase tracking-widest text-slate-400">Subject</th>
                    <th className="pb-3 text-xs font-bold uppercase tracking-widest text-slate-400">Status</th>
                    <th className="pb-3 text-xs font-bold uppercase tracking-widest text-slate-400">Created</th>
                    <th className="pb-3 text-xs font-bold uppercase tracking-widest text-slate-400 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((t) => (
                    <tr key={t.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                      <td className="py-4 font-medium text-slate-900">{t.supportRequest?.subject ?? "—"}</td>
                      <td className="py-4">
                        <StatusBadge status={t.status} />
                      </td>
                      <td className="py-4 text-sm text-slate-500">{new Date(t.createdAt).toLocaleDateString()}</td>
                      <td className="py-4 text-right">
                        <Link href={`/global-dashboard/support/tickets/${t.id}`}>
                          <Button variant="outline" size="sm" className="border-slate-200 text-slate-700">
                            View updates
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </DashboardCard>
      </div>
    </div>
  );
}
