'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
    Notification,
    fetchNotificationsAPI,
    fetchUnreadCountAPI,
    markNotificationAsReadAPI,
    markAllNotificationsAsReadAPI,
} from '@/api/notificationService';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { useSSE } from '@/hooks/useSSE';
import { cn } from '@/lib/utils';

interface NotificationItemProps {
    notification: Notification;
    onMarkAsRead: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onMarkAsRead }) => {
    const isRead = notification.isRead;
    const isChat = notification.type === 'chat_message';

    const containerClasses = cn(
        'group relative overflow-hidden rounded-2xl border transition-all duration-200',
        isChat
            ? cn(
                'bg-sidebar-background text-[hsl(var(--sidebar-foreground))]',
                isRead
                    ? 'border-[hsl(var(--sidebar-border))] shadow-sm'
                    : 'border-emerald-400/50 shadow-lg ring-1 ring-emerald-400/40'
            )
            : isRead
                ? 'bg-muted border-border shadow-sm'
                : 'bg-white border-amber-100 shadow-md'
    );

    const handleClick = () => {
        if (!isRead) {
            onMarkAsRead(notification.id);
        }
    };

    const content = (
        <div className={containerClasses} onClick={handleClick}>
            {/* Accent strip for chat + unread */}
            {isChat && !isRead && (
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-400 via-emerald-300 to-emerald-500" />
            )}

            <div className="relative flex flex-col gap-2 p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                        <p
                            className={cn(
                                'font-semibold text-sm sm:text-base',
                                isChat
                                    ? 'text-emerald-200'
                                    : 'text-slate-900'
                            )}
                        >
                            {notification.title}
                        </p>
                        {notification.content && (
                            <p
                                className={cn(
                                    'text-xs sm:text-sm leading-relaxed',
                                    isChat
                                        ? 'text-[hsl(var(--sidebar-foreground)/0.85)]'
                                        : 'text-muted-foreground'
                                )}
                            >
                                {notification.content}
                            </p>
                        )}
                    </div>

                    {!isRead && (
                        <span
                            className={cn(
                                'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap',
                                isChat
                                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-400/40'
                                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                            )}
                        >
                            Unread
                        </span>
                    )}
                </div>

                <div className="flex items-center justify-between pt-1 text-[11px] sm:text-xs text-muted-foreground">
                    <span>{new Date(notification.createdAt).toLocaleString()}</span>
                    {isRead && <span className="italic">Read</span>}
                </div>
            </div>
        </div>
    );

    return (
        <div className="mb-4">
            {notification.redirectUrl ? (
                <Link href={notification.redirectUrl} passHref onClick={handleClick}>
                    {content}
                </Link>
            ) : (
                content
            )}
        </div>
    );
};

const NotificationSkeleton: React.FC = () => {
    return (
        <div className="mb-4">
            <div className="rounded-2xl border border-border bg-muted/60 shadow-sm p-4 sm:p-5 animate-pulse">
                <div className="space-y-2">
                    <div className="h-4 bg-gray-300/70 rounded w-3/4" />
                    <div className="h-3 bg-gray-200/80 rounded w-1/2" />
                    <div className="h-3 bg-gray-200/60 rounded w-1/3" />
                </div>
            </div>
        </div>
    );
};

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [showUnreadOnly, setShowUnreadOnly] = useState<boolean>(false);

    const { notifications: sseNotifications } = useSSE();

    const fetchNotifications = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetchNotificationsAPI({
                page: currentPage,
                limit: 10,
                read: showUnreadOnly ? false : undefined,
            });
            setNotifications(Array.isArray(response) ? response : (response?.items || []));
            setTotalPages(response?.meta?.totalPages || 1);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch notifications.');
            console.error('Error fetching notifications:', err);
        } finally {
            setLoading(false);
        }
    }, [currentPage, showUnreadOnly]);

    const fetchUnreadCount = useCallback(async () => {
        try {
            const response = await fetchUnreadCountAPI();
            setUnreadCount(response.count);
        } catch (err: any) {
            console.error('Error fetching unread count:', err);
        }
    }, []);

    useEffect(() => {
        fetchNotifications();
        fetchUnreadCount();
    }, [fetchNotifications, fetchUnreadCount]);

    // Handle real-time updates
    useEffect(() => {
        if (sseNotifications.length > 0) {
            fetchNotifications();
            fetchUnreadCount();
        }
    }, [sseNotifications, fetchNotifications, fetchUnreadCount]);

    const handleMarkAsRead = async (id: string) => {
        try {
            await markNotificationAsReadAPI(id);
            setNotifications((prev) =>
                prev.map((notif) => (notif.id === id ? { ...notif, isRead: true } : notif))
            );
            fetchUnreadCount();
        } catch (err: any) {
            console.error('Error marking as read:', err);
        }
    };

    const handleMarkAllAsRead = async () => {
        if (unreadCount === 0) return;
        try {
            await markAllNotificationsAsReadAPI();
            setNotifications((prev) => prev.map((notif) => ({ ...notif, isRead: true })));
            setUnreadCount(0);
        } catch (err: any) {
            console.error('Error marking all as read:', err);
        }
    };

    const handlePageChange = (newPage: number) => {
        if (newPage > 0 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const handleToggleShowUnread = () => {
        setShowUnreadOnly(prev => !prev);
        setCurrentPage(1);
    };

    return (
        <section className="mx-auto max-w-[1400px] w-full pt-5 space-y-4">
            <PageHeader
                title={`Notifications (${unreadCount} Unread)`}
                subtitle="Stay updated with the latest alerts, tasks, and messages."
                actions={
                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            className="bg-light text-primary-color-new"
                            onClick={handleMarkAllAsRead}
                            disabled={unreadCount === 0 || loading}
                        >
                            Mark All As Read
                        </Button>
                        <Button
                            variant="outline"
                            className="bg-light text-primary-color-new"
                            onClick={handleToggleShowUnread}
                            disabled={loading}
                        >
                            {showUnreadOnly ? 'Show All' : 'Show Unread Only'}
                        </Button>
                    </div>
                }
            />
            <div className="bg-card border border-border rounded-[16px] p-4 shadow-md w-full mx-auto transition-all duration-300 hover:shadow-md">
                {error && <div className="mb-4 text-red-500">Error: {error}</div>}

                <div className="space-y-4">
                    {loading ? (
                        Array.from({ length: 3 }).map((_, index) => (
                            <NotificationSkeleton key={index} />
                        ))
                    ) : notifications && notifications.length > 0 ? (
                        notifications.map((notification: Notification) => (
                            <NotificationItem
                                key={notification.id}
                                notification={notification}
                                onMarkAsRead={handleMarkAsRead}
                            />
                        ))
                    ) : (
                        <div className="py-12 flex flex-col items-center justify-center text-center">
                            <p className="text-muted-foreground">
                                No notifications found{' '}
                                {showUnreadOnly ? ' in unread.' : '.'}
                            </p>
                        </div>
                    )}
                </div>

                {totalPages > 1 && (
                    <div className="flex justify-center items-center mt-6 space-x-2">
                        <Button
                            variant="outline"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1 || loading}
                        >
                            Previous
                        </Button>
                        <span className="text-sm font-medium">Page {currentPage} of {totalPages}</span>
                        <Button
                            variant="outline"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages || loading}
                        >
                            Next
                        </Button>
                    </div>
                )}
            </div>
        </section>
    );
}
