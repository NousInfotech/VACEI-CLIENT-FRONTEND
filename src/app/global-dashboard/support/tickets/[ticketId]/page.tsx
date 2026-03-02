"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { HelpCircle, ArrowLeft, Loader2, MessageSquare, Send } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import DashboardCard from "@/components/DashboardCard";
import { Button } from "@/components/ui/button";
import { getTicketById, createTicketUpdate, type TicketItem, type TicketUpdateItem } from "@/api/supportService";

function StatusBadge({ status }: { status: string }) {
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

export default function TicketDetailPage() {
  const params = useParams();
  const ticketId = params?.ticketId as string | undefined;
  const [ticket, setTicket] = useState<TicketItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!ticketId) {
      setError("Missing ticket ID");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    getTicketById(ticketId)
      .then(setTicket)
      .catch((err) => setError(err?.message ?? "Failed to load ticket"))
      .finally(() => setLoading(false));
  }, [ticketId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketId || !description.trim()) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await createTicketUpdate(ticketId, {
        title: title.trim() || undefined,
        description: description.trim(),
      });
      setTitle("");
      setDescription("");
      const updated = await getTicketById(ticketId);
      setTicket(updated);
    } catch (err: any) {
      setSubmitError(err?.message ?? "Failed to add update");
    } finally {
      setSubmitting(false);
    }
  };

  if (!ticketId) {
    return (
      <div className="space-y-8 animate-in fade-in duration-300">
        <PageHeader title="Ticket" subtitle="Invalid ticket." icon={HelpCircle} />
        <p className="text-slate-500">Missing ticket ID.</p>
        <Link href="/global-dashboard/support/tickets">
          <Button variant="outline" className="border-slate-200 text-slate-700">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to My Requests
          </Button>
        </Link>
      </div>
    );
  }

  if (loading || !ticket) {
    return (
      <div className="space-y-8 animate-in fade-in duration-300">
        <PageHeader title="Ticket" subtitle={error ?? "Loading..."} icon={HelpCircle} />
        {loading && (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
          </div>
        )}
        {error && !loading && (
          <>
            <p className="text-red-600">{error}</p>
            <Link href="/global-dashboard/support/tickets">
              <Button variant="outline">Back to My Requests</Button>
            </Link>
          </>
        )}
      </div>
    );
  }

  const updates: TicketUpdateItem[] = ticket.updates ?? [];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <PageHeader
        title="Ticket"
        subtitle={ticket.supportRequest?.subject ?? "Support ticket"}
        icon={HelpCircle}
      />

      <div className="flex flex-col gap-4">
        <Link href="/global-dashboard/support/tickets">
          <Button variant="outline" className="border-slate-200 text-slate-700">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to My Requests
          </Button>
        </Link>

        <DashboardCard className="p-6 border-none shadow-sm bg-white">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Subject</p>
              <p className="font-medium text-slate-900">{ticket.supportRequest?.subject ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Status</p>
              <StatusBadge status={ticket.status} />
            </div>
          </div>

          <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Updates
          </h3>
          {updates.length === 0 ? (
            <p className="text-slate-500 py-4">No updates yet. Add one below.</p>
          ) : (
            <ul className="space-y-4 mb-6">
              {updates.map((u) => (
                <li key={u.id} className="border-l-2 border-slate-900/20 pl-4 py-2">
                  <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                    <span className="font-medium text-slate-700">
                      {u.createdBy ? [u.createdBy.firstName, u.createdBy.lastName].filter(Boolean).join(" ") : "Support"}
                    </span>
                    <span>{new Date(u.createdAt).toLocaleString()}</span>
                  </div>
                  {u.title && <p className="font-medium text-slate-900">{u.title}</p>}
                  {u.description && <p className="text-slate-700 whitespace-pre-wrap">{u.description}</p>}
                </li>
              ))}
            </ul>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-sm font-bold text-slate-700">Add update</h3>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Title (optional)</label>
              <input
                type="text"
                className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300"
                placeholder="Brief title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Message</label>
              <textarea
                className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300 min-h-[100px]"
                placeholder="Your message..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>
            {submitError && <p className="text-sm text-red-600">{submitError}</p>}
            <Button
              type="submit"
              className="bg-slate-900 hover:bg-black text-white"
              disabled={submitting || !description.trim()}
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
              Add update
            </Button>
          </form>
        </DashboardCard>
      </div>
    </div>
  );
}
