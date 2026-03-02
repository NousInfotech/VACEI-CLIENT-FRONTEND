"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
    Bell, 
    CheckCheck, 
    Filter, 
    MessageSquare, 
    Calendar, 
    AlertTriangle, 
    ChevronLeft, 
    ChevronRight,
    Clock,
    Search
} from 'lucide-react';
import {
    Notification,
    fetchNotificationsAPI,
    fetchUnreadCountAPI,
    markNotificationAsReadAPI,
    markAllNotificationsAsReadAPI,
} from '@/api/notificationService';
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from '@/components/ui/button';
import { useSSE } from '@/hooks/useSSE';
import { cn } from '@/lib/utils';

interface ExtendedNotification extends Notification {
    severity?: 'info' | 'warning' | 'error' | 'success';
}

const getNotificationIcon = (type: string) => {
    switch (type) {
        case 'chat_message': return MessageSquare;
        case 'meeting_scheduled':
        case 'meeting_updated': return Calendar;
        case 'meeting_canceled':
        case 'error': return AlertTriangle;
        default: return Bell;
    }
};

const getNotificationColor = (type: string, isRead: boolean) => {
    if (isRead) return 'text-slate-400 bg-slate-50 border-slate-100';
    switch (type) {
        case 'chat_message': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
        case 'meeting_scheduled':
        case 'meeting_updated': return 'text-blue-600 bg-blue-50 border-blue-100';
        case 'meeting_canceled':
        case 'error': return 'text-rose-600 bg-rose-50 border-rose-100';
        default: return 'text-amber-600 bg-amber-50 border-amber-100';
    }
};

const NotificationCard = ({ notification, onMarkAsRead }: { notification: ExtendedNotification, onMarkAsRead: (id: string) => void }) => {
    const isRead = notification.isRead;
    const Icon = getNotificationIcon(notification.type);
    const colorClasses = getNotificationColor(notification.type, isRead);

    const cardContent = (
        <div 
            onClick={() => !isRead && onMarkAsRead(notification.id)}
            className={cn(
                "group relative flex gap-4 p-5 rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden",
                isRead 
                    ? "bg-white/40 border-slate-100 grayscale-[0.5] opacity-80" 
                    : "bg-white border-slate-200 shadow-sm hover:shadow-md hover:border-primary/20 hover:translate-x-1"
            )}
        >
            {/* Unread Indicator Bar */}
            {!isRead && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
            )}

            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center border shrink-0 transition-transform group-hover:scale-110", colorClasses)}>
                <Icon className="w-6 h-6" />
            </div>

            <div className="flex-1 min-w-0 space-y-1">
                <div className="flex justify-between items-start gap-2">
                    <h4 className={cn("font-semibold text-sm sm:text-base transition-colors", isRead ? "text-slate-500" : "text-slate-900 group-hover:text-primary")}>
                        {notification.title}
                    </h4>
                    <span className="text-[10px] sm:text-xs font-medium text-slate-400 whitespace-nowrap flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(notification.createdAt).toLocaleDateString()}
                    </span>
                </div>
                
                <p className={cn("text-xs sm:text-sm line-clamp-2 leading-relaxed", isRead ? "text-slate-400" : "text-slate-600")}>
                    {notification.content}
                </p>

                <div className="pt-2 flex items-center gap-3">
                    <span className={cn(
                        "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border",
                        isRead ? "text-slate-400 bg-slate-50 border-slate-100" : "text-primary/70 bg-primary/5 border-primary/10"
                    )}>
                        {notification.type.replace(/_/g, ' ')}
                    </span>
                    {!isRead && (
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    )}
                </div>
            </div>
        </div>
    );

    if (notification.redirectUrl) {
        return (
            <Link href={notification.redirectUrl} className="block no-underline">
                {cardContent}
            </Link>
        );
    }

    return cardContent;
};

const SkeletonCard = () => (
    <div className="flex gap-4 p-5 rounded-2xl border border-slate-100 bg-slate-50/50 animate-pulse">
        <div className="w-12 h-12 rounded-xl bg-slate-200 shrink-0" />
        <div className="flex-1 space-y-3">
            <div className="flex justify-between items-start">
                <div className="h-4 bg-slate-200 rounded w-1/3" />
                <div className="h-3 bg-slate-100 rounded w-20" />
            </div>
            <div className="h-3 bg-slate-200 rounded w-full" />
            <div className="h-3 bg-slate-200 rounded w-2/3" />
        </div>
    </div>
);

export default function GlobalAlertsPage() {
    const [notifications, setNotifications] = useState<ExtendedNotification[]>([]);
    const [unreadCount, setUnreadCount] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [filter, setFilter] = useState<'all' | 'unread'>('all');

    const { notifications: sseNotifications } = useSSE();

    const loadData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [notifsResp, countResp] = await Promise.all([
                fetchNotificationsAPI({
                    page: currentPage,
                    limit: 10,
                    read: filter === 'unread' ? false : undefined,
                }),
                fetchUnreadCountAPI()
            ]);

            setNotifications(Array.isArray(notifsResp) ? notifsResp : (notifsResp?.items || []));
            setTotalPages(notifsResp?.meta?.totalPages || 1);
            setUnreadCount(countResp.count);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch messages.');
        } finally {
            setLoading(false);
        }
    }, [currentPage, filter]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    useEffect(() => {
        if (sseNotifications.length > 0) {
            loadData();
        }
    }, [sseNotifications, loadData]);

    const handleMarkAsRead = async (id: string) => {
        try {
            await markNotificationAsReadAPI(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error('Failed to mark as read:', err);
        }
    };

    const handleMarkAllAsRead = async () => {
        if (unreadCount === 0) return;
        try {
            await markAllNotificationsAsReadAPI();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error('Failed to mark all as read:', err);
        }
    };

    return (
        <div className="space-y-8 pb-10">
            <PageHeader 
                title="Activity Feed"
                subtitle="Stay up to date with everything happening across your business entities."
                icon={Bell}
                actions={
                    <div className="flex items-center gap-3">
                        <Button 
                            variant="outline" 
                            size="sm"
                            onClick={handleMarkAllAsRead}
                            disabled={unreadCount === 0 || loading}
                            className="h-10 rounded-xl px-4 text-xs font-bold uppercase tracking-widest border-slate-200 hover:bg-slate-50 transition-all flex items-center gap-2"
                        >
                            <CheckCheck className="w-4 h-4" />
                            <span className="hidden sm:inline">Mark all read</span>
                        </Button>
                        <div className="h-8 w-px bg-slate-200 hidden sm:block mx-1" />
                        <div className="flex p-1 bg-slate-100/50 rounded-xl border border-slate-200">
                            {(['all', 'unread'] as const).map((f) => (
                                <button
                                    key={f}
                                    onClick={() => { setFilter(f); setCurrentPage(1); }}
                                    className={cn(
                                        "px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all",
                                        filter === f 
                                            ? "bg-white text-primary shadow-sm border border-slate-200/50" 
                                            : "text-white"
                                    )}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>
                }
            />

            <div className="gap-8">
                {/* Main Content */}
                <div className="lg:col-span-8 space-y-4">
                    {loading ? (
                        Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                            <AlertTriangle className="w-10 h-10 text-rose-500 mb-4 opacity-50" />
                            <p className="text-slate-900 font-semibold mb-1">Could not load activities</p>
                            <p className="text-slate-400 text-sm mb-6">{error}</p>
                            <Button variant="outline" onClick={loadData}>Try again</Button>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-dashed border-slate-200 animate-in fade-in zoom-in duration-500">
                            <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mb-6">
                                <Bell className="w-10 h-10 text-slate-200" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2">Clean slate!</h3>
                            <p className="text-slate-500 text-sm max-w-xs text-center">
                                {filter === 'unread' 
                                    ? "You've caught up on everything. No unread notifications here." 
                                    : "No activities found in your feed yet."}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-5 duration-700">
                            {notifications.map((notif) => (
                                <NotificationCard 
                                    key={notif.id} 
                                    notification={notif} 
                                    onMarkAsRead={handleMarkAsRead} 
                                />
                            ))}
                        </div>
                    )}

                    {totalPages > 1 && (
                        <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                Page {currentPage} of {totalPages}
                            </p>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1 || loading}
                                    className="rounded-xl border-slate-200 h-10 w-10 shadow-sm"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages || loading}
                                    className="rounded-xl border-slate-200 h-10 w-10 shadow-sm"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar Stats / Info */}
                {/* <div className="lg:col-span-4 space-y-6">
                    <div className="bg-primary/5 border border-primary/10 rounded-3xl p-6 relative overflow-hidden group">
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-primary rounded-lg">
                                    <CheckCheck className="w-5 h-5 text-white" />
                                </div>
                                <h4 className="font-bold text-slate-900 tracking-tight">Overview</h4>
                            </div>
                            <div className="space-y-4">
                                <div className="flex justify-between items-end">
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Unread Alerts</span>
                                    <span className="text-3xl font-bold text-primary tabular-nums">{unreadCount}</span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-primary transition-all duration-1000 ease-out" 
                                        style={{ width: `${Math.min(100, (unreadCount / 20) * 100)}%` }} 
                                    />
                                </div>
                                <p className="text-[10px] leading-relaxed text-slate-400 italic">
                                    {unreadCount > 10 ? "You have a high volume of alerts. Consider reviewing important tasks first." : "Your activity feed is relatively manageable."}
                                </p>
                            </div>
                        </div>
                        <Bell className="absolute -bottom-8 -right-8 w-32 h-32 text-primary/5 -rotate-12 transition-transform group-hover:scale-125" />
                    </div>

                    <div className="bg-white border border-slate-200 rounded-3xl p-6">
                        <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <Filter className="w-4 h-4 text-primary" />
                            Helpful Tips
                        </h4>
                        <ul className="space-y-4">
                            {[
                                "Stay updated on the latest service requests.",
                                "Monitor compliance deadlines in real-time.",
                                "Quickly respond to chat messages from your advisor."
                            ].map((tip, i) => (
                                <li key={i} className="flex gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                                    <p className="text-xs text-slate-500 leading-relaxed">{tip}</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div> */}
            </div>
        </div>
    );
}
