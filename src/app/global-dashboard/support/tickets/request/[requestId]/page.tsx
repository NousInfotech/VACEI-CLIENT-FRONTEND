"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { HelpCircle, ArrowLeft, Loader2, MessageSquare, FileText, ExternalLink } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import DashboardCard from "@/components/DashboardCard";
import { Button } from "@/components/ui/button";
import { getSupportRequestById, getTickets, type SupportRequestItem, type TicketItem, type TicketUpdateItem } from "@/api/supportService";

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

function UpdateItem({ u }: { u: TicketUpdateItem }) {
  return (
    <li className="border-l-2 border-slate-200 pl-4 py-2">
      <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
        <span className="font-medium text-slate-700">
          {u.createdBy ? [u.createdBy.firstName, u.createdBy.lastName].filter(Boolean).join(" ") : "Support"}
        </span>
        <span>{new Date(u.createdAt).toLocaleString()}</span>
      </div>
      {u.title && <p className="font-medium text-slate-900">{u.title}</p>}
      {u.description && <p className="text-slate-700 whitespace-pre-wrap">{u.description}</p>}
    </li>
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
        {/* Support request details */}
        <h3 className="text-sm font-bold text-slate-700 mb-4">Request details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
          <div className="mb-4">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Description</p>
            <p className="text-slate-700 whitespace-pre-wrap">{request.description}</p>
          </div>
        )}
        {(request.attachments?.length ?? 0) > 0 && (
          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" /> Attachments
            </p>
            <ul className="flex flex-wrap gap-2">
              {request.attachments!.map((a) => (
                <li key={a.id}>
                  <a href={a.url} target="_blank" rel="noopener noreferrer" className="text-sm text-slate-700 hover:text-slate-900 underline flex items-center gap-1">
                    {a.file_name}
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Tickets + updates all in one */}
        <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2 mt-8 pt-6 border-t border-slate-100">
          <MessageSquare className="w-4 h-4" />
          Tickets & updates
        </h3>
        {tickets.length === 0 ? (
          <p className="text-slate-500 py-4">No ticket yet. When your request is accepted, a ticket will appear here.</p>
        ) : (
          <div className="space-y-6">
            {tickets.map((t) => (
              <div key={t.id} className="rounded-xl border border-slate-100 bg-slate-50/30 p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium text-slate-900">{t.supportRequest?.subject ?? "Ticket"}</span>
                  <TicketStatusBadge status={t.status} />
                </div>
                <p className="text-xs text-slate-500 mb-3">Created {new Date(t.createdAt).toLocaleDateString()}</p>
                {(t.updates?.length ?? 0) === 0 ? (
                  <p className="text-slate-500 text-sm">No updates yet.</p>
                ) : (
                  <ul className="space-y-1">
                    {t.updates!.map((u) => (
                      <UpdateItem key={u.id} u={u} />
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}
      </DashboardCard>
    </div>
  );
}
