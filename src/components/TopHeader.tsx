'use client';

import Link from "next/link";
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from '@hugeicons/react';
import { Notification01Icon, Upload04Icon, Video01Icon } from '@hugeicons/core-free-icons';
import { PanelLeft, PanelLeftClose } from 'lucide-react';
import { cn } from "@/lib/utils";

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
            bgColorClass = notification.read ? 'bg-brand-muted' : 'bg-brand-primary/10';
            textColorClass = notification.read ? 'text-brand-primary' : 'text-brand-body';
            break;
        case 'meeting_canceled':
        case 'error':
            bgColorClass = notification.read ? 'bg-destructive/10' : 'bg-destructive/20';
            textColorClass = notification.read ? 'text-destructive' : 'text-destructive';
            break;
        case 'chat_message':
            bgColorClass = notification.read ? 'bg-brand-muted' : 'bg-sidebar-hover/30';
            textColorClass = notification.read ? 'text-brand-body' : 'text-brand-body';
            break;
        default:
            bgColorClass = notification.read ? 'bg-brand-body' : 'bg-brand-muted';
            textColorClass = notification.read ? 'text-muted-foreground' : 'text-brand-body';
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
                <p className={`font-semibold text-sm ${textColorClass} overflow-hidden text-ellipsis `}>
                    {displayMessage}
                </p>
                <small className="text-brand-body text-xs">
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
                    className="ml-2 !px-3 py-1 bg-sidebar-background text-sidebar-foreground rounded-md hover:bg-sidebar-hover transition-colors text-xs flex-shrink-0 cursor-pointer shadow-md"
                >
                    Mark
                </Button>
            )}
        </div>
    );
};


interface TopHeaderProps {
    onSidebarToggle?: () => void;
    isSidebarCollapsed?: boolean;
}

export default function TopHeader({ onSidebarToggle, isSidebarCollapsed = false }: TopHeaderProps) {
    const [unreadCount, setUnreadCount] = useState(0);
    const [showNotifications, setShowNotifications] = useState(false);
    const [latestNotifications, setLatestNotifications] = useState<Notification[]>([]);
    const notificationRef = useRef<HTMLDivElement>(null);
    const [searchTerm, setSearchTerm] = useState(''); // State for search input
    const [username, setUsername] = useState<string>('User'); // State for username to avoid hydration error

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

    // Set username on client side to avoid hydration error
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const storedUsername = localStorage.getItem("username");
            if (storedUsername) {
                try {
                    setUsername(atob(storedUsername));
                } catch (e) {
                    setUsername('User');
                }
            }
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
        <header 
            className="h-16 backdrop-blur-xl border flex items-center justify-between px-6 sticky top-0 z-40 rounded-[2rem] m-2 mb-0 mr-2 bg-background/80 shadow-lg"
            style={{
                borderColor: `hsl(var(--border))`,
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
            }}
        >
            <div className="flex items-center gap-4">
                {/* Sidebar toggle - visible on desktop only */}
                {onSidebarToggle && (
                    <button
                        className="hidden md:flex p-2 rounded-2xl hover:bg-[hsl(var(--muted))] transition-colors group"
                        onClick={onSidebarToggle}
                        aria-label={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                        title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                    >
                        {isSidebarCollapsed ? (
                            <PanelLeft className="h-5 w-5 group-hover:scale-110 transition-transform text-[hsl(var(--foreground))]" />
                        ) : (
                            <PanelLeftClose className="h-5 w-5 group-hover:scale-110 transition-transform text-[hsl(var(--foreground))]" />
                        )}
                    </button>
                )}

                {/* Search */}
                <div className="flex items-center gap-2 max-w-[350px] flex-1">
                        <div className="relative flex w-full">
                            <Input
                                type="text"
                                placeholder="Search..."
                            className="caret-[hsl(var(--primary))] bg-card capitalize text-[hsl(var(--foreground))] border-[hsl(var(--border))] border-r-0 placeholder-gray-500 rounded-lg rounded-r-none focus:outline-none w-full h-[37px] ps-4 focus:ring-2 focus:ring-[hsl(var(--ring))] focus-visible:ring-2"
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
                            className="bg-[hsl(var(--primary))] text-card-foreground py-3 ps-3 pe-4 rounded-s-none font-medium cursor-pointer hover:bg-[hsl(var(--primary-hover))] transition-colors focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
                            >
                                <i className="fi fi-rr-search text-base leading-0 block" style={{ color: '#ffffff' }}></i>
                            </Button>
                        </div>
                    </div>
            </div>

            <div className="flex items-center gap-3">
                {/* Quick Actions */}
                        <Link href="/dashboard/document-organizer/document-upload">
                    <Button variant="outline" className="flex items-center gap-1 rounded-2xl text-xs cursor-pointer transition-colors focus:outline-none focus:ring-2 border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))]">
                        <HugeiconsIcon icon={Upload04Icon} className="w-5 h-5" />
                        Upload
                            </Button>
                        </Link>
                
                        <Link href="/dashboard/schedule">
                    <Button variant="outline" className="flex items-center gap-2 px-4 py-2 rounded-2xl text-xs cursor-pointer border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))]">
                        <HugeiconsIcon icon={Video01Icon} className="w-5 h-5" />
                                Schedule a Call
                            </Button>
                        </Link>

                {/* Notifications */}
                        <div className="relative" ref={notificationRef}>
                            <Button
                        variant="ghost"
                                onClick={toggleNotifications}
                        className="h-9 w-9 rounded-2xl hover:bg-[hsl(var(--muted))] cursor-pointer relative"
                            >
                        <HugeiconsIcon icon={Notification01Icon} className="w-5 h-5 text-[hsl(var(--foreground))]" />
                                {unreadCount > 0 && (
                            <span className="absolute -top-0 right-1.5 bg-[hsl(var(--primary))] text-card-foreground !text-[10px] rounded-full h-4 w-4 flex items-center justify-center">
                                        {unreadCount}
                                    </span>
                                )}
                            </Button>
                            {showNotifications && (
                        <div className="absolute right-0 mt-2 w-80 bg-card border border-[hsl(var(--border))] rounded-2xl shadow-lg z-50 p-4 max-h-96 overflow-y-auto">
                            <h3 className="text-lg font-semibold mb-3 text-[hsl(var(--foreground))]">Latest Notifications</h3>
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
                                        <p className="text-muted-foreground text-sm">No new notifications.</p>
                                    )}
                                    <div className="text-center mt-3">
                                <Link href="/dashboard/notifications" passHref>
                                            <Button
                                                variant="link"
                                        className="text-[hsl(var(--primary))] hover:text-[hsl(var(--primary-hover))] hover:underline text-sm cursor-pointer font-medium !py-0 h-fit"
                                                onClick={() => setShowNotifications(false)}
                                            >
                                                Read More
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>

                {/* Settings */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-2xl hover:bg-[hsl(var(--muted))]"
                    aria-label="Open settings"
                    title="Settings"
                >
                    <i className="fi fi-rr-settings text-[hsl(var(--foreground))]"></i>
                </Button>

                {/* User profile */}
                <div 
                    className="flex items-center gap-3 pl-3 border-l"
                    style={{ borderColor: `hsl(var(--border))` }}
                >
                    <div className="hidden sm:block text-right">
                        <p className="text-sm font-semibold text-[hsl(var(--foreground))]">
                            {username}
                        </p>
                        <p className="text-xs text-[hsl(var(--muted-foreground))] capitalize">
                            Employee
                        </p>
                    </div>

                    {/* User avatar */}
                    <div className="relative">
                        <div 
                            className="w-8 h-8 rounded-2xl flex items-center justify-center bg-[hsl(var(--muted))]"
                        >
                            <span className="text-[hsl(var(--foreground))] text-xs font-semibold">
                                {username.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <div 
                            className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-background"
                        ></div>
                    </div>

                    {/* Logout button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                            if (typeof window !== 'undefined') {
                                localStorage.clear();
                                // Clear the cookie used by middleware
                                document.cookie = 'client-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax';
                                document.cookie = 'client-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=None; Secure';
                                router.push('/login');
                            }
                        }}
                        className="h-9 w-9 rounded-2xl text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-colors"
                    >
                        <i className="fi fi-rr-sign-out-alt"></i>
                    </Button>
                </div>
            </div>
        </header>
    );
}