"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Building2, 
  AlertTriangle, 
  BarChart3, 
  MessageSquare, 
} from "lucide-react";
import { useGlobalDashboard } from "@/context/GlobalDashboardContext";
import { listComplianceCalendars, ComplianceCalendarEntry } from "@/api/complianceCalendarService";
import { getTodos, TodoItem } from "@/api/todoService";
import { fetchNotificationsAPI, Notification } from "@/api/notificationService";
import { isPast, isToday, addDays, format } from "date-fns";

// Modular Components
import AttentionRequiredBanner from "./global/AttentionRequiredBanner";
import GlobalOverviewCard from "./global/GlobalOverviewCard";
import GlobalTasks from "./global/GlobalTasks";
import AlertsNotifications from "./global/AlertsNotifications";
import AIAssistant from "./global/AIAssistant";
import ShadowCard from "../ui/ShadowCard";

export default function GlobalOverviewCards() {
  const router = useRouter();
  const { 
    companies, 
    loading: dashboardLoading
  } = useGlobalDashboard();

  const [calendarEntries, setCalendarEntries] = useState<ComplianceCalendarEntry[]>([]);
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [complianceData, todosData, notificationsData] = await Promise.all([
          listComplianceCalendars(),
          getTodos(),
          fetchNotificationsAPI({ page: 1, limit: 5 })
        ]);
        
        setCalendarEntries(complianceData);
        setTodos(todosData);
        setNotifications(Array.isArray(notificationsData) ? notificationsData : (notificationsData?.items || []));
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const overdueCompliance = calendarEntries.filter(e => isPast(new Date(e.dueDate)) && !isToday(new Date(e.dueDate)));
  const upcomingCompliance = calendarEntries.filter(e => isToday(new Date(e.dueDate)) || (!isPast(new Date(e.dueDate)) && new Date(e.dueDate) <= addDays(new Date(), 30)));
  const urgentTodo = todos.find(t => t.status !== 'COMPLETED') || todos[0];

  const isLoadingDashboard = loading || dashboardLoading;

  return (
    <div className="space-y-8">
      {/* 1. Attention Required Banner */}
      {/* <AttentionRequiredBanner urgentTodo={urgentTodo || null} isLoading={isLoadingDashboard} /> */}

      {/* 2. Overview Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Compliance Status */}
        <GlobalOverviewCard 
          title="Compliance Status" 
          bgImage="/global-dashboard/compliance-status.png"
          buttonLabel="Review Deadlines"
          onClick={() => router.push('/global-dashboard/compliance')}
          isLoading={isLoadingDashboard}
        >
          <div className="bg-black/20 rounded-full px-3 py-1 flex items-center gap-2 text-white text-xs font-semibold w-fit backdrop-blur-md">
            <AlertTriangle size={14} /> {upcomingCompliance.length} deadline{upcomingCompliance.length !== 1 ? 's' : ''} coming up soon.
          </div>
          <p className="text-white/90 text-sm mt-3 font-medium drop-shadow-sm">Please review upcoming filings.</p>
          <div className="mt-4">
            <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest">Upcoming</p>
            <p className="text-white text-sm font-semibold truncate drop-shadow-sm">
              {upcomingCompliance.length > 0 ? `${upcomingCompliance[0].title} - ${format(new Date(upcomingCompliance[0].dueDate), "dd MMM")}` : 'No upcoming deadlines'}
            </p>
          </div>
        </GlobalOverviewCard>

        {/* My Companies */}
        <GlobalOverviewCard 
          title="My Companies" 
          bgImage="/global-dashboard/companies.png"
          buttonLabel="Manage Companies"
          onClick={() => router.push('/global-dashboard/companies')}
          isLoading={isLoadingDashboard}
        >
          <div className="flex items-center gap-2 text-white font-bold text-lg mb-2 drop-shadow-sm">
            <Building2 size={24} className="text-white/80" /> {companies.length} Active Companies
          </div>
          <p className="text-white/90 text-sm leading-relaxed drop-shadow-sm">
            All your companies are in good standing, efficiently managed.
          </p>
        </GlobalOverviewCard>

        {/* Reseller Analytics */}
        <GlobalOverviewCard 
          title="Reseller Analytics" 
          bgImage="/global-dashboard/document-requests.png"
          buttonLabel="View Analytics"
          onClick={() => router.push('/global-dashboard/analytics')}
          isLoading={isLoadingDashboard}
        >
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-2 backdrop-blur-md">
            <BarChart3 size={24} className="text-white" />
          </div>
          <p className="text-white/90 text-sm leading-relaxed mt-4 drop-shadow-sm">
            Track your signups, referrals, and earnings in real-time.
          </p>
        </GlobalOverviewCard>

        {/* Support */}
        <GlobalOverviewCard 
          title="Support" 
          bgImage="/global-dashboard/supports.png"
          buttonLabel="Contact Support"
          onClick={() => router.push('/global-dashboard/support')}
          isLoading={isLoadingDashboard}
        >
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-2 backdrop-blur-md">
            <MessageSquare size={24} className="text-white" />
          </div>
          <p className="text-white/90 text-sm leading-relaxed drop-shadow-sm">
            Need assistance? Our dedicated support team is here to help you.
          </p>
        </GlobalOverviewCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* 3. Global Tasks & Alerts */}
        <ShadowCard className="lg:col-span-2 space-y-8 p-5">
          <GlobalTasks calendarEntries={calendarEntries} isLoading={isLoadingDashboard} />
          <AlertsNotifications notifications={notifications} isLoading={isLoadingDashboard} />
        </ShadowCard>

        {/* 4. AI Assistant Sidebar */}
        <AIAssistant isLoading={isLoadingDashboard} />
      </div>
    </div>
  );
}
