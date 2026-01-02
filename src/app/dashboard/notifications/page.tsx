'use client'; // If you're using Next.js App Router

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link'; // Import Link component from Next.js
import {
    Notification,
    fetchNotificationsAPI,
    fetchUnreadCountAPI,
    markNotificationAsReadAPI,
    markAllNotificationsAsReadAPI,
} from '@/api/notificationService'; // Adjust path as necessary

// Props interface for NotificationItem for better TypeScript clarity
interface NotificationItemProps {
    notification: Notification;
    onMarkAsRead: (id: number) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onMarkAsRead }) => {
    let bgColorClass = '';
    let textColorClass = '';

    // Determine background and text colors based on notification type and read status
    switch (notification.type) {
        case 'meeting_scheduled':
        case 'meeting_updated':
        case 'task_assigned':
        case 'task_created': // Added for task creation notification
        case 'task_status_updated': // Added for task status update notification
        case 'task_attachment_deleted': // Added for task attachment deletion notification
        case 'task_updated': // Added for general task update notification
            bgColorClass = notification.read ? 'bg-blue-50' : 'bg-blue-100 border-blue-400';
            textColorClass = notification.read ? 'text-blue-600' : 'text-blue-800';
            break;
        case 'meeting_canceled':
        case 'error':
        case 'task_deleted': // Added for task deletion notification
            bgColorClass = notification.read ? 'bg-red-50' : 'bg-red-100 border-red-400';
            textColorClass = notification.read ? 'text-red-600' : 'text-red-800';
            break;
        case 'chat_message':
            bgColorClass = notification.read ? 'bg-green-50' : 'bg-green-100 border-green-400';
            textColorClass = notification.read ? 'text-green-600' : 'text-green-800';
            break;
        default:
            bgColorClass = notification.read ? 'bg-gray-50' : 'bg-gray-100 border-gray-300';
            textColorClass = notification.read ? 'text-gray-600' : 'text-gray-800';
    }

    // Determine if the notification should be wrapped in a Link component
    const shouldBeLink = notification.link && notification.link.startsWith('/dashboard/');

    // New click handler that marks as read, then (optionally) navigates
    const handleClick = () => {
        // Only mark as read if it's currently unread
        if (!notification.read) {
            onMarkAsRead(notification.id);
        }
        // Navigation for Link component is handled by its href prop
    };

    const content = (
        <div
            className={`p-4 border-l-4 rounded-md shadow-sm flex justify-between items-center ${bgColorClass} ${shouldBeLink ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
            onClick={!shouldBeLink ? handleClick : undefined} // Only attach onClick if it's not a link
        >
            <div>
                <p className={`font-semibold ${textColorClass}`}>{notification.message}</p>
                <small className="text-gray-500">
                    {new Date(notification.createdAt).toLocaleString()}
                    {notification.read ? ' (Read)' : ' (Unread)'}
                </small>
            </div>
            {/* Removed the explicit "Mark as Read" button */}
        </div>
    );

    return (
        <div className="mb-4">
            {shouldBeLink ? (
                <Link href={notification.link!} passHref onClick={handleClick}>
                    {content}
                </Link>
            ) : (
                content
            )}
        </div>
    );
};

// --- NEW SKELETON COMPONENT ---
const NotificationSkeleton: React.FC = () => {
    return (
        <div className="p-4 border-l-4 border-gray-200 rounded-md shadow-sm mb-4 flex justify-between items-center bg-gray-100 animate-pulse">
            <div className="flex-1">
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-1/2"></div>
            </div>
            {/* Removed the placeholder for "Mark as Read" button */}
        </div>
    );
};
// --- END NEW SKELETON COMPONENT ---


export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [showUnreadOnly, setShowUnreadOnly] = useState<boolean>(false);

    // Callback to fetch notifications from the API
    const fetchNotifications = useCallback(async () => {
        setLoading(true); // Set loading to true before API call
        setError(null);
        try {
            const response = await fetchNotificationsAPI({
                page: currentPage,
                limit: 10,
                read: showUnreadOnly ? false : undefined,
            });
            setNotifications(response.notifications);
            setTotalPages(response.pagination.totalPages);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch notifications.');
            console.error('Error fetching notifications:', err);
        } finally {
            setLoading(false); // Set loading to false after API call (success or failure)
        }
    }, [currentPage, showUnreadOnly]);

    // Callback to fetch unread notification count
    const fetchUnreadCount = useCallback(async () => {
        try {
            const response = await fetchUnreadCountAPI();
            setUnreadCount(response.unreadCount);
        } catch (err: any) {
            console.error('Error fetching unread count:', err);
        }
    }, []);

    // useEffect to trigger data fetching on component mount or when dependencies change
    useEffect(() => {
        fetchNotifications();
        fetchUnreadCount();
    }, [fetchNotifications, fetchUnreadCount]);

    // Handler for marking a single notification as read
    const handleMarkAsRead = async (id: number) => {
        try {
            await markNotificationAsReadAPI(id);
            setNotifications((prev) =>
                prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif))
            );
            fetchUnreadCount();
        } catch (err: any) {
            console.error('Error marking as read:', err);
            alert('Failed to mark notification as read: ' + err.message);
        }
    };

    // Handler for marking all unread notifications as read
    const handleMarkAllAsRead = async () => {
        if (unreadCount === 0) {
            alert('No unread notifications to mark.');
            return;
        }
        if (!confirm('Are you sure you want to mark all notifications as read?')) {
            return;
        }
        try {
            await markAllNotificationsAsReadAPI();
            setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
            setUnreadCount(0);
        } catch (err: any) {
            console.error('Error marking all as read:', err);
            alert('Failed to mark all notifications as read: ' + err.message);
        }
    };

    // Handler for pagination page changes
    const handlePageChange = (newPage: number) => {
        if (newPage > 0 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    // Handler for toggling between showing all notifications and only unread ones
    const handleToggleShowUnread = () => {
        setShowUnreadOnly(prev => !prev);
        setCurrentPage(1);
    };

    return (
        <section className="mx-auto max-w-[1400px] w-full pt-5">
            <div className="bg-white border border-blue-200/50 rounded-[16px] p-4 shadow-sm w-full mx-auto transition-all duration-300 hover:shadow-md">
                <h1 className="text-xl leading-normal text-black capitalize font-medium"> Notifications ({unreadCount} Unread)</h1>

                <div className="flex justify-between items-center mt-4 mb-4">
                    <div>
                        <button
                            onClick={handleMarkAllAsRead}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors mr-2" // Already green
                            disabled={unreadCount === 0 || loading}
                        >
                            Mark All As Read
                        </button>
                        <button
                            onClick={handleToggleShowUnread}
                            className={`px-4 py-2 rounded-md transition-colors ${showUnreadOnly ? 'bg-green-700 text-white hover:bg-green-800 cursor-pointer' : 'cursor-pointer bg-sky-700 text-white hover:bg-sky-800' // Changed to green for "Show Unread Only"
                                }`}
                            disabled={loading}
                        >
                            {showUnreadOnly ? 'Show All' : 'Show Unread Only'}
                        </button>
                    </div>
                    {error && <p className="text-red-500">Error: {error}</p>}
                </div>

                <div className="space-y-4">
                    {loading ? (
                        // Render 3 skeleton items while loading
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
                        <p className="text-gray-600">
                            No notifications found{' '}
                            {showUnreadOnly ? ' (showing unread only).' : '.'}
                        </p>
                    )}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="flex justify-center items-center mt-6 space-x-2">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1 || loading}
                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 disabled:opacity-50" // Added border for clarity
                        >
                            Previous
                        </button>
                        <span>Page {currentPage} of {totalPages}</span>
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages || loading}
                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 disabled:opacity-50" // Added border for clarity
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
}