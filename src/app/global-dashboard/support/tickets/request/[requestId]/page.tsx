"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { HelpCircle, ArrowLeft, Loader2 } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import DashboardCard from "@/components/DashboardCard";
import { Button } from "@/components/ui/button";
import { getSupportRequestById, getTickets, type SupportRequestItem, type TicketItem } from "@/api/supportService";

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

export default function RequestDetailPage() {
  const params = useParams();
  const requestId = params?.requestId as string | undefined;
  const [request, setRequest] = useState<SupportRequestItem | null>(null);
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!requestId) {
      setError("Missing request ID");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    Promise.all([
      getSupportRequestById(requestId),
      getTickets({ supportRequestId: requestId, limit: 20 }),
    ])
      .then(([req, ticketsRes]) => {
        setRequest(req);
        setTickets(ticketsRes.data ?? []);
      })
      .catch((err) => setError(err?.message ?? "Failed to load"))
      .finally(() => setLoading(false));
  }, [requestId]);

  if (!requestId) {
    return (
      <div className="space-y-8 animate-in fade-in duration-300">
        <PageHeader title="Support request" subtitle="Invalid request." icon={HelpCircle} />
        <p className="text-slate-500">Missing request ID.</p>
        <Link href="/global-dashboard/support/tickets">
          <Button variant="outline">Back to my requests</Button>
        </Link>
      </div>
    );
  }

  if (loading || !request) {
    return (
      <div className="space-y-8 animate-in fade-in duration-300">
        <PageHeader title="Support request" subtitle={error ?? "Loading..."} icon={HelpCircle} />
        {loading && (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
          </div>
        )}
        {error && !loading && (
          <Link href="/global-dashboard/support/tickets">
            <Button variant="outline">Back to my requests</Button>
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <PageHeader
        title="Support request"
        subtitle={request.subject}
        icon={HelpCircle}
        actions={
          <Link href="/global-dashboard/support/tickets">
            <Button variant="outline" className="border-slate-200 text-slate-700">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to my requests
            </Button>
          </Link>
        }
      />

      <DashboardCard className="p-6 border-none shadow-sm bg-white">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Subject</p>
            <p className="font-medium text-slate-900">{request.subject}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Request status</p>
            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
              request.status === "ACCEPTED" ? "bg-emerald-100 text-emerald-800" :
              request.status === "REJECTED" ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"
            }`}>
              {request.status}
            </span>
          </div>
        </div>
        {request.description && (
          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Description</p>
            <p className="text-slate-700 whitespace-pre-wrap">{request.description}</p>
          </div>
        )}

        <h3 className="text-sm font-bold text-slate-700 mb-3">Tickets</h3>
        {tickets.length === 0 ? (
          <p className="text-slate-500 py-4">No ticket yet. When your request is accepted, a ticket will appear here.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="pb-3 text-xs font-bold uppercase tracking-widest text-slate-400">Subject</th>
                  <th className="pb-3 text-xs font-bold uppercase tracking-widest text-slate-400">Ticket status</th>
                  <th className="pb-3 text-xs font-bold uppercase tracking-widest text-slate-400">Created</th>
                  <th className="pb-3 text-xs font-bold uppercase tracking-widest text-slate-400 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((t) => (
                  <tr key={t.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                    <td className="py-4 font-medium text-slate-900">{t.supportRequest?.subject ?? "—"}</td>
                    <td className="py-4">
                      <TicketStatusBadge status={t.status} />
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
  );
}
