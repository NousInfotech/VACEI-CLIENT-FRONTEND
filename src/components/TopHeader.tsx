'use client'; // This is correct for App Router client components

import Link from "next/link";
import ChatWrapper from "../components/ChatWrapper";
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation'; // Correctly imported
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from '@hugeicons/react';
import { Notification01Icon, Upload04Icon, Video01Icon } from '@hugeicons/core-free-icons';
import { cn } from "@/lib/utils"

import {
    Notification,
    fetchNotificationsAPI,
    fetchUnreadCountAPI,
    markNotificationAsReadAPI,
} from '@/api/notificationService';

// NotificationItem component (copied from your notifications page, slightly adapted for header)
interface HeaderNotificationItemProps {
    notification: Notification;
    onMarkAsRead: (id: number) => void;
}

const HeaderNotificationItem: React.FC<HeaderNotificationItemProps> = ({ notification, onMarkAsRead }) => {
    let bgColorClass = '';
    let textColorClass = '';

    switch (notification.type) {
        case 'meeting_scheduled':
        case 'meeting_updated':
        case 'task_assigned':
            bgColorClass = notification.read ? 'bg-blue-50' : 'bg-blue-100';
            textColorClass = notification.read ? 'text-blue-600' : 'text-blue-800';
            break;
        case 'meeting_canceled':
        case 'error':
            bgColorClass = notification.read ? 'bg-red-50' : 'bg-red-100';
            textColorClass = notification.read ? 'text-red-600' : 'text-red-800';
            break;
        case 'chat_message':
            bgColorClass = notification.read ? 'bg-sky-50' : 'bg-sky-100';
            textColorClass = notification.read ? 'text-red-700' : 'text-sky-800';
            break;
        default:
            bgColorClass = notification.read ? 'bg-gray-50' : 'bg-sky-100/70';
            textColorClass = notification.read ? 'text-gray-600' : 'text-gray-800';
    }

    // Truncate message for display in dropdown
    const displayMessage = notification.message.length > 50
        ? notification.message.substring(0, 47) + '...'
        : notification.message;

    return (
        <div className={`p-3 rounded-lg mb-2 flex items-center ${bgColorClass}`}>
            {/* Added min-w-0 to allow the flex item to shrink below its content size.
                Added overflow-hidden, text-ellipsis, and for visual truncation of text. */}
            <div className="flex-1 min-w-0">
                <p className={`font-semibold text-sm ${textColorClass} overflow-hidden text-sky-800 text-ellipsis `}>
                    {displayMessage}
                </p>
                <small className="text-black text-xs">
                    {new Date(notification.createdAt).toLocaleString()}
                    {notification.read ? ' (Read)' : ' (Unread)'}
                </small>
            </div>
            {!notification.read && (
                <Button
                    variant="default"
                    onClick={(e) => {
                        e.stopPropagation(); // Prevent dropdown from closing if it's open
                        onMarkAsRead(notification.id);
                    }}
                    // Added flex-shrink-0 to prevent the button from shrinking when space is tight.
                    className="ml-2 !px-3 py-1 bg-sky-700 text-white rounded-md hover:bg-sky-700 transition-colors text-xs flex-shrink-0 cursor-pointer"
                >
                    Mark
                </Button>
            )}
        </div>
    );
};


export default function TopHeader() {
    const [unreadCount, setUnreadCount] = useState(0);
    const [showNotifications, setShowNotifications] = useState(false);
    const [latestNotifications, setLatestNotifications] = useState<Notification[]>([]);
    const notificationRef = useRef<HTMLDivElement>(null);
    const [searchTerm, setSearchTerm] = useState(''); // State for search input

    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams(); // Get search parameters

    // Effect to update search term from URL
    // This useEffect correctly reads from searchParams, which is available client-side.
    useEffect(() => {
        const qParam = searchParams.get('q');
        if (pathname === '/dashboard/search' && qParam !== null) {
            setSearchTerm(decodeURIComponent(qParam));
        } else if (pathname !== '/dashboard/search') {
            // Clear search term if not on the search page
            setSearchTerm('');
        }
    }, [pathname, searchParams]); // Rerun when pathname or searchParams change

    // Fetch unread count
    const getUnreadCount = useCallback(async () => {
        try {
            const response = await fetchUnreadCountAPI();
            setUnreadCount(response.unreadCount);
        } catch (error) {
            console.error("Failed to fetch unread notification count:", error);
        }
    }, []);

    // Fetch latest notifications (for dropdown)
    const getLatestNotifications = useCallback(async () => {
        try {
            const response = await fetchNotificationsAPI({ page: 1, limit: 4, read: undefined });
            setLatestNotifications(response.notifications);
        } catch (error) {
            console.error("Failed to fetch latest notifications:", error);
        }
    }, []);

    useEffect(() => {
        getUnreadCount();

        const REFRESH_INTERVAL = 30 * 1000; // 30 seconds
        const intervalId = setInterval(() => {
            getUnreadCount();
        }, REFRESH_INTERVAL);

        return () => {
            clearInterval(intervalId);
        };
    }, [pathname, getUnreadCount]);

    // Click outside handler (separate useEffect as it doesn't depend on pathname or getUnreadCount)
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Toggle notification dropdown visibility
    const toggleNotifications = async () => {
        const newState = !showNotifications;
        setShowNotifications(newState);
        if (newState) {
            await getLatestNotifications(); // Fetch latest when opening dropdown
            await getUnreadCount(); // Refresh count when opening dropdown
        }
    };

    // Handler for marking a single notification as read from the dropdown
    const handleMarkAsReadFromDropdown = async (id: number) => {
        try {
            await markNotificationAsReadAPI(id);
            setLatestNotifications(prev =>
                prev.map(notif => (notif.id === id ? { ...notif, read: true } : notif))
            );
            await getUnreadCount(); // Re-fetch the unread count to update the badge
        } catch (err: any) {
            console.error('Error marking as read from dropdown:', err);
        }
    };

    // Handler for search button click or Enter key
    const handleSearchClick = () => {
        // Ensure that navigating to /dashboard/search always reflects the current searchTerm
        router.push(`/dashboard/search${searchTerm ? `?q=${encodeURIComponent(searchTerm)}` : ''}`);
    };

    return (
        <>
            <div className="bg-gradient-to-r from-white/80 to-blue-100/50 backdrop-blur[10px] border border-blue-200/50 rounded-[16px] py-3 px-4">
                <div className="flex flex-wrap justify-between items-center lg:gap-10 gap-5">
                    <div className="flex items-center gap-2 max-w-[350px]">
                        <div className="relative flex w-full">
                            <Input
                                type="text"
                                placeholder="Search..."
                                className="caret-sky-700 bg-white capitalize text-[#3D3D3D] border-blue-200/50 border-r-0 placeholder-[#3D3D3D] rounded-lg rounded-r-none focus:outline-none w-full h-[37px] ps-4 focus:ring-0 focus-visible:ring-0"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        handleSearchClick();
                                    }
                                }}
                            />
                            <Button
                                onClick={handleSearchClick}
                                className="bg-sky-700 text-white py-3 ps-3 pe-4 rounded-s-none font-medium cursor-pointer hover:bg-sky-700 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-600"
                            >
                                <i className="fi fi-rr-search text-base leading-0 block"></i>
                            </Button>
                        </div>
                    </div>
                    <ChatWrapper />
                    <div className="flex flex-wrap items-center lg:gap-3 gap-5">
                        <Link href="/dashboard/document-organizer/document-upload">
                            <Button variant="outline" className="flex size-custom gap-1 rounded-lg text-xs cursor-pointer transition-colors focus:outline-none focus:ring-2">
                                <HugeiconsIcon icon={Upload04Icon} className="w-5 h-5 size-custom" />Upload
                            </Button>
                        </Link>
                        <Link href="/dashboard/schedule">
                            <Button variant="outline" className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs cursor-pointer">
                                <HugeiconsIcon icon={Video01Icon} className="w-5 h-5 size-custom" />
                                Schedule a Call
                            </Button>
                        </Link>
                        <div className="relative" ref={notificationRef}>
                            <Button
                                variant="link"
                                onClick={toggleNotifications}
                                className="text-[#3D3D3D] cursor-pointer relative p-0 size-custom"
                            >
                                <HugeiconsIcon icon={Notification01Icon} className="w-5 h-5 size-custom" />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-0 right-1.5 bg-sky-700 text-white !text-[10px] size-custom rounded-full h-4 w-4 flex items-center justify-center">
                                        {unreadCount}
                                    </span>
                                )}
                            </Button>
                            {showNotifications && (
                                <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4 max-h-96 overflow-y-auto">
                                    <h3 className="text-lg font-semibold mb-3 !text-sky-700 hover:text-sky-700">Latest Notifications</h3>
                                    {latestNotifications.length > 0 ? (
                                        latestNotifications.map((notification) => (
                                            <Link href={notification.link || '#'} key={notification.id} passHref>
                                                <div
                                                    onClick={async () => {
                                                        if (!notification.read) {
                                                            await markNotificationAsReadAPI(notification.id);
                                                            setLatestNotifications(prev =>
                                                                prev.map(notif => (notif.id === notification.id ? { ...notif, read: true } : notif))
                                                            );
                                                        }
                                                        await getUnreadCount();
                                                        setShowNotifications(false);
                                                    }}
                                                >
                                                    <HeaderNotificationItem
                                                        notification={notification}
                                                        onMarkAsRead={handleMarkAsReadFromDropdown}
                                                    />
                                                </div>
                                            </Link>
                                        ))
                                    ) : (
                                        <p className="text-gray-600 text-sm">No new notifications.</p>
                                    )}
                                    <div className="text-center mt-3">
                                        <Link href="/dashboard/notifications" passHref className="">
                                            <Button
                                                variant="link"
                                                className="!text-sky-700 hover:text-sky-700 hover:underline text-sm cursor-pointer font-medium !py-0 h-fit"
                                                onClick={() => setShowNotifications(false)}
                                            >
                                                Read More
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}