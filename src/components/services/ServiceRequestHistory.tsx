import { useState, useEffect, useRef } from "react";
import { listServiceRequests, getServiceRequestById } from "@/api/serviceRequestService";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Clock, CheckCircle2, AlertCircle, Eye, FileText } from "lucide-react";
import ServiceHistorySkeleton from "./ServiceHistorySkeleton";

interface Props {
  companyId: string | null;
  refreshKey?: number;
}

export default function ServiceRequestHistory({ companyId, refreshKey }: Props) {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [detailLoadingId, setDetailLoadingId] = useState<string | null>(null);
  const scrollRef = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (companyId) {
      loadRequests();
    }
  }, [companyId, refreshKey]);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const res = await listServiceRequests({
        companyId: companyId!,
        limit: 50,
      });
      const history = res.data.filter((r: any) => r.status !== "DRAFT");
      setRequests(history);
    } catch (err) {
      console.error("Failed to load requests:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleExpand = async (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }

    const req = requests.find((r) => r.id === id);
    if (!req.serviceDetails) {
      try {
        setDetailLoadingId(id);
        const res = await getServiceRequestById(id);
        const details = res.data;

        setRequests((prev) =>
          prev.map((r) =>
            r.id === id
              ? {
                  ...r,
                  generalDetails: details.generalDetails,
                  serviceDetails: details.serviceDetails,
                  statusHistory: details.statusHistory,
                }
              : r
          )
        );
      } catch (err) {
        console.error("Failed to load details:", err);
      } finally {
        setDetailLoadingId(null);
      }
    }
    
    setExpandedId(id);
    // Smooth scroll into view
    setTimeout(() => {
      scrollRef.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
  };

  const getRejectionReason = (statusHistory: any[]) => {
    if (!statusHistory) return null;
    const rejectionEntry = [...statusHistory]
      .reverse()
      .find((entry) => entry.status === "REJECTED");
    return rejectionEntry?.reason || rejectionEntry?.message || null;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case "REJECTED":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case "SUBMITTED":
      case "IN_REVIEW":
        return <Clock className="w-4 h-4 text-blue-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-50 text-green-700 border-green-100";
      case "REJECTED":
        return "bg-red-50 text-red-700 border-red-100";
      case "SUBMITTED":
      case "IN_REVIEW":
        return "bg-blue-50 text-blue-700 border-blue-100";
      default:
        return "bg-gray-50 text-gray-700 border-gray-100";
    }
  };

  const formatStatus = (status: string) => {
    return status
      .replace(/_/g, " ")
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const formatAnswer = (answer: any) => {
    if (answer === undefined || answer === null || answer === '') {
      return <span className="text-gray-300 italic font-normal">No response provided</span>;
    }

    const formatValue = (val: any) => {
      if (!val) return '';
      if (typeof val === 'string') return val;
      if (typeof val === 'object' && val !== null) {
        if (val.month && val.year) return `${val.month} ${val.year}`;
        return JSON.stringify(val);
      }
      return String(val);
    };

    if (Array.isArray(answer)) {
      return answer.join(', ');
    }

    if (typeof answer === 'object' && answer !== null) {
      const ans = answer as any;
      if (ans.start || ans.end) {
        return (
          <span className="flex items-center gap-2">
            <span className="text-primary/60 font-bold uppercase text-[10px] tracking-widest">From</span>
            {formatValue(ans.start)}
            <span className="text-primary/60 font-bold uppercase text-[10px] tracking-widest ml-2">To</span>
            {formatValue(ans.end)}
          </span>
        );
      }
      if (ans.month && ans.year) {
        return `${ans.month} ${ans.year}`;
      }
      return JSON.stringify(ans);
    }

    return String(answer);
  };

  if (!companyId) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-muted-foreground">Please select a company to view history.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {loading ? (
        <ServiceHistorySkeleton />
      ) : requests.length === 0 ? (
        <div className="text-center py-12 space-y-3">
          <div className="mx-auto w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-gray-300">
            <Eye className="w-6 h-6" />
          </div>
          <p className="text-sm text-muted-foreground">No submitted requests found for this company.</p>
        </div>
      ) : (
        <div className="divide-y border rounded-2xl bg-white overflow-hidden shadow-sm">
          {requests.map((req) => (
            <div 
              key={req.id} 
              ref={(el) => { scrollRef.current[req.id] = el; }}
              className="p-5 hover:bg-gray-50/30 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="font-semibold text-gray-900 text-lg">{req.service.replace(/_/g, ' ')}</p>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Submitted on {new Date(req.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-bold tracking-widest uppercase border ${getStatusClass(req.status)}`}>
                    {getStatusIcon(req.status)}
                    {formatStatus(req.status)}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`h-10 w-10 rounded-xl transition-all ${expandedId === req.id ? 'bg-primary/10 text-primary' : 'hover:bg-gray-100'}`}
                    onClick={() => handleToggleExpand(req.id)}
                  >
                    {detailLoadingId === req.id ? (
                      <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    ) : (
                      expandedId === req.id ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )
                    )}
                  </Button>
                </div>
              </div>

              {expandedId === req.id && (
                <div className="mt-5 pt-5 border-t space-y-10 animate-in fade-in slide-in-from-top-4 duration-300">
                  {req.status === "REJECTED" && (
                    <section className="space-y-3 p-6 bg-red-50/50 border border-red-100 rounded-2xl ring-1 ring-red-500/5">
                      <div className="flex items-center gap-2 text-red-700 font-bold uppercase text-[10px] tracking-widest mb-1">
                        <AlertCircle className="w-4 h-4" />
                        <h4>Rejection Reason</h4>
                      </div>
                      <p className="text-base text-red-600 font-medium italic pl-6">
                        "{getRejectionReason(req.statusHistory) || "No reason provided."}"
                      </p>
                    </section>
                  )}

                  <div className="space-y-8 mx-auto p-2 rounded-2xl bg-gray-50 border border-gray-200">
                    {[...(req.generalDetails || []), ...(req.serviceDetails || [])].map((detail, idx) => (
                      <div key={idx} className="flex items-start gap-6 group">
                        {/* Numbering */}
                        <div className="shrink-0 pt-1.5">
                          <span className="text-md transition-colors tabular-nums font-medium text-gray-400">
                            {(idx + 1).toString().padStart(2, '0')}.
                          </span>
                        </div>

                        <div className="space-y-2 flex-1">
                          <h5 className="text-lg font-semibold text-gray-900 leading-tight">
                            {detail.question}
                          </h5>
                          <div className="relative">
                            <div className="text-sm text-gray-500 font-medium leading-relaxed">
                              {formatAnswer(detail.answer)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {(!req.generalDetails?.length && !req.serviceDetails?.length) && (
                      <div className="py-12 text-center opacity-40">
                        <FileText className="h-10 w-10 mx-auto text-gray-300 mb-3" />
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">No details available</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
