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

interface NotificationItemProps {
    notification: Notification;
    onMarkAsRead: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onMarkAsRead }) => {
    let bgColorClass = '';
    let textColorClass = '';
    const isRead = notification.isRead;

    switch (notification.type) {
        case 'meeting_scheduled':
        case 'meeting_updated':
        case 'task_assigned':
        case 'task_created':
        case 'task_status_updated':
        case 'task_attachment_deleted':
        case 'task_updated':
            bgColorClass = isRead ? 'bg-brand-muted' : 'bg-brand-primary/10 border-brand-primary/20';
            textColorClass = isRead ? 'text-brand-primary' : 'text-brand-primary';
            break;
        case 'meeting_canceled':
        case 'error':
        case 'task_deleted':
            bgColorClass = isRead ? 'bg-red-50' : 'bg-red-100 border-red-200';
            textColorClass = isRead ? 'text-red-600' : 'text-red-800';
            break;
        case 'chat_message':
            bgColorClass = isRead ? 'bg-sidebar-background' : 'bg-sidebar-background border-green-200';
            textColorClass = isRead ? 'text-green-600' : 'text-green-800';
            break;
        default:
            bgColorClass = isRead ? 'bg-brand-body' : 'bg-brand-muted border-border';
            textColorClass = isRead ? 'text-muted-foreground' : 'text-gray-800';
    }

    const handleClick = () => {
        if (!isRead) {
            onMarkAsRead(notification.id);
        }
    };

    const content = (
        <div
            className={`p-4 border-l-4 rounded-md shadow-sm flex justify-between items-center ${bgColorClass} cursor-pointer hover:shadow-md transition-all`}
            onClick={handleClick}
        >
            <div>
                <p className={`font-semibold ${textColorClass}`}>{notification.title}</p>
                <p className="text-gray-600 text-sm mt-1">{notification.content}</p>
                <small className="text-muted-foreground mt-2 block">
                    {new Date(notification.createdAt).toLocaleString()}
                    {isRead ? ' (Read)' : ' (Unread)'}
                </small>
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
        <div className="p-4 border-l-4 border-border rounded-md shadow-md mb-4 flex justify-between items-center bg-brand-muted animate-pulse">
            <div className="flex-1">
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-1/2"></div>
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
            setNotifications(response.items);
            setTotalPages(response.meta.totalPages);
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
                    ) : notifications.length > 0 ? (
                        notifications.map((notification) => (
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
