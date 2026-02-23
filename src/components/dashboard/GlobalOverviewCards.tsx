"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Building2, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  BarChart3, 
  MessageSquare, 
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGlobalDashboard } from "@/context/GlobalDashboardContext";
import { listComplianceCalendars, ComplianceCalendarEntry } from "@/api/complianceCalendarService";
import { format, isPast, isToday, addDays } from "date-fns";

export default function GlobalOverviewCards() {
  const router = useRouter();
  const { 
    companies, 
    loading, 
    complianceState, 
    hasMessages, 
    pendingDocs 
  } = useGlobalDashboard();

  const [calendarEntries, setCalendarEntries] = useState<ComplianceCalendarEntry[]>([]);
  const [loadingEntries, setLoadingEntries] = useState(true);

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const data = await listComplianceCalendars();
        setCalendarEntries(data);
      } catch (error) {
        console.error("Failed to fetch dashboard compliance data:", error);
      } finally {
        setLoadingEntries(false);
      }
    };
    fetchEntries();
  }, []);

  const CardWrapper = ({ children, bgImage, title, button }: { children: React.ReactNode, bgImage: string, title: string, button: React.ReactNode }) => (
    <div className="relative group overflow-hidden rounded-4xl h-[280px] border border-white/20 shadow-2xl transition-all duration-500">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${bgImage})` }}
      />
      <div className="absolute inset-0 bg-black/20" />
      
      {/* Content Layer */}
      <div className="relative h-full w-full p-8 flex flex-col">
        <h3 className="text-2xl font-bold text-white mb-4 tracking-tight drop-shadow-md">
          {title}
        </h3>
        <div className="grow space-y-3">
          {children}
        </div>
        <div className="mt-4">
          {button}
        </div>
      </div>
    </div>
  );

  const getComplianceContent = () => {
    // Calculate real data from entries
    const overdueEntries = calendarEntries.filter(e => isPast(new Date(e.dueDate)) && !isToday(new Date(e.dueDate)));
    const dueSoonEntries = calendarEntries.filter(e => {
      const due = new Date(e.dueDate);
      return !isPast(due) && due <= addDays(new Date(), 7);
    });
    
    // Most urgent item
    const urgentEntry = overdueEntries.length > 0 ? overdueEntries[0] : 
                        dueSoonEntries.length > 0 ? dueSoonEntries[0] : 
                        calendarEntries.length > 0 ? [...calendarEntries].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0] : 
                        null;

    let statusBadge = (
      <div className="flex items-center gap-3 text-emerald-400 font-semibold bg-emerald-950/30 w-fit px-4 py-1.5 rounded-full border border-emerald-500/30">
        <CheckCircle2 size={18} />
        <span>All companies fully compliant.</span>
      </div>
    );
    let description = "No immediate actions required.";
    let deadlineLabel = "Next deadline";
    let deadlineValue = urgentEntry ? `${urgentEntry.company?.name || 'Global'} – ${urgentEntry.title} – ${format(new Date(urgentEntry.dueDate), "dd MMM")}` : "No upcoming deadlines";
    let buttonLabel = "View Deadlines";

    if (overdueEntries.length > 0) {
      statusBadge = (
        <div className="flex items-center gap-3 text-red-400 font-semibold bg-red-950/30 w-fit px-4 py-1.5 rounded-full border border-red-500/30">
          <AlertCircle size={18} />
          <span>{overdueEntries.length} {overdueEntries.length === 1 ? 'filing is' : 'filings are'} overdue.</span>
        </div>
      );
      description = "Immediate action is required.";
      deadlineLabel = "Overdue: " + (urgentEntry?.company?.name || 'Global');
      deadlineValue = urgentEntry ? `${urgentEntry.title} – ${format(new Date(urgentEntry.dueDate), "dd MMM")}` : "";
      buttonLabel = "Resolve Now";
    } else if (dueSoonEntries.length > 0) {
      statusBadge = (
        <div className="flex items-center gap-3 text-amber-400 font-semibold bg-amber-950/30 w-fit px-4 py-1.5 rounded-full border border-amber-500/30">
          <AlertTriangle size={18} />
          <span>{dueSoonEntries.length} {dueSoonEntries.length === 1 ? 'deadline' : 'deadlines'} coming up soon.</span>
        </div>
      );
      description = "Please review upcoming filings.";
      deadlineLabel = "Next deadline";
      deadlineValue = urgentEntry ? `${urgentEntry.company?.name || 'Global'} – ${urgentEntry.title} – ${format(new Date(urgentEntry.dueDate), "dd MMM")}` : "";
      buttonLabel = "Review Deadlines";
    }

    if (loadingEntries) {
        return {
            content: (
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-white/10 rounded-full w-48" />
                    <div className="h-4 bg-white/10 rounded w-32" />
                    <div className="space-y-2 pt-2">
                        <div className="h-2 bg-white/10 rounded w-20" />
                        <div className="h-4 bg-white/10 rounded w-full" />
                    </div>
                </div>
            ),
            button: <div className="h-10 bg-white/10 rounded-xl w-32 animate-pulse" />
        };
    }

    return {
      content: (
        <>
          {statusBadge}
          <p className="text-white/90 text-sm mt-2">{description}</p>
          <div className="flex flex-col gap-0.5 mt-2">
            <span className="text-white/60 text-[10px] uppercase tracking-widest font-bold">{deadlineLabel}</span>
            <span className="text-white font-medium truncate">{deadlineValue}</span>
          </div>
        </>
      ),
      button: (
        <Button 
          variant="outline" 
          className="bg-white/10 border-none text-white hover:bg-white hover:text-black rounded-xl backdrop-blur-xl group/btn transition-all duration-300"
          onClick={() => router.push('/global-dashboard/compliance')}
        >
          {buttonLabel}
          <ArrowRight size={16} className="ml-2 group-hover/btn:translate-x-1 transition-transform" />
        </Button>
      )
    };
  };

  const getCompaniesContent = () => {
    const hasAttention = companies.some(c => c.overdueCount > 0 || c.dueSoonCount > 0);
    return {
      content: (
        <>
          <div className="flex items-center gap-3 text-blue-300 font-semibold">
            <Building2 size={24} className="text-white/70" />
            <span className="text-xl">{companies.length} Active Companies</span>
          </div>
          <p className="text-white/80 text-sm leading-relaxed mt-2">
            {hasAttention 
              ? "One company requires your attention. Please review pending items."
              : "All your companies are in good standing managed efficiently."}
          </p>
        </>
      ),
      button: (
        <Button 
          variant="outline" 
          className="bg-white/10 border-none text-white hover:bg-white hover:text-black rounded-xl backdrop-blur-xl group/btn transition-all duration-300"
          onClick={() => router.push('/global-dashboard/companies')}
        >
          {hasAttention ? "View Companies" : "Manage Companies"}
          <ArrowRight size={16} className="ml-2 group-hover/btn:translate-x-1 transition-transform" />
        </Button>
      )
    };
  };

  const getResellerAnalyticsContent = () => {
    return {
      content: (
        <>
          <div className="flex items-center gap-3 text-white/90 font-semibold">
            <BarChart3 size={24} className="text-white/70" />
            <span className="text-xl">Reseller Analytics</span>
          </div>
          <p className="text-white/80 text-sm leading-relaxed mt-2">
            Track your signups, referrals, and earnings in real-time. 
            Monitor your reseller performance across all companies.
          </p>
        </>
      ),
      button: (
        <Button 
          variant="outline" 
          className="bg-white/10 border-none text-white hover:bg-white hover:text-black rounded-xl backdrop-blur-xl group/btn transition-all duration-300"
          onClick={() => router.push('/global-dashboard/analytics')}
        >
          View Analytics
          <ArrowRight size={16} className="ml-2 group-hover/btn:translate-x-1 transition-transform" />
        </Button>
      )
    };
  };

  const getSupportContent = () => {
    return {
      content: (
        <>
          <div className="flex items-center gap-3 text-white/90 font-semibold">
            <MessageSquare size={24} className="text-white/70" />
            <span className="text-xl">{hasMessages ? "New Message" : "Support Center"}</span>
          </div>
          <p className="text-white/80 text-sm leading-relaxed mt-2">
            {hasMessages 
              ? "You have 1 new message from your advisor regarding your filings."
              : "Need assistance? Our dedicated support team is here to help you."}
          </p>
        </>
      ),
      button: (
        <Button 
          variant="outline" 
          className="bg-white/10 border-none text-white hover:bg-white hover:text-black rounded-xl backdrop-blur-xl group/btn transition-all duration-300"
          onClick={() => router.push('/global-dashboard/support')}
        >
          {hasMessages ? "Open Messages" : "Contact Support"}
          <ArrowRight size={16} className="ml-2 group-hover/btn:translate-x-1 transition-transform" />
        </Button>
      )
    };
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-[280px] rounded-4xl bg-gray-200 animate-pulse" />
        ))}
      </div>
    );
  }

  const compliance = getComplianceContent();
  const companiesData = getCompaniesContent();
  const analytics = getResellerAnalyticsContent();
  const support = getSupportContent();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <CardWrapper 
        title="Compliance Status" 
        bgImage="/global-dashboard/compliance-status.png"
        button={compliance.button}
      >
        {compliance.content}
      </CardWrapper>

      <CardWrapper 
        title="My Companies" 
        bgImage="/global-dashboard/companies.png"
        button={companiesData.button}
      >
        {companiesData.content}
      </CardWrapper>

      <CardWrapper 
        title="Reseller Analytics" 
        bgImage="/global-dashboard/document-requests.png"
        button={analytics.button}
      >
        {analytics.content}
      </CardWrapper>

      <CardWrapper 
        title="Support" 
        bgImage="/global-dashboard/supports.png"
        button={support.button}
      >
        {support.content}
      </CardWrapper>
    </div>
  );
}
