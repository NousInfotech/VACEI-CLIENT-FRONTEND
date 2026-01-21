'use client';

import Link from "next/link";
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GlobalUploadDrawer } from "@/components/GlobalUploadDrawer";
import { HugeiconsIcon } from '@hugeicons/react';
import { Notification01Icon, Upload04Icon, Video01Icon } from '@hugeicons/core-free-icons';
import { PanelLeft, PanelLeftClose, ChevronDown } from 'lucide-react';
import { cn } from "@/lib/utils";
import Dropdown from "./Dropdown";

import {
    Notification,
    fetchNotificationsAPI,
    fetchUnreadCountAPI,
    markNotificationAsReadAPI,
} from '@/api/notificationService';

// NotificationItem component
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

    const displayMessage = notification.message.length > 50
        ? notification.message.substring(0, 47) + '...'
        : notification.message;

    return (
        <div className={`p-3 rounded-xl mb-2 flex items-center ${bgColorClass} border border-transparent hover:border-gray-200 transition-all`}>
            <div className="flex-1 min-w-0">
                <p className={`font-semibold text-sm ${textColorClass} overflow-hidden text-ellipsis `}>
                    {displayMessage}
                </p>
                <small className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-1 block">
                    {new Date(notification.createdAt).toLocaleDateString()}
                    {notification.read ? ' • Read' : ' • New'}
                </small>
            </div>
            {!notification.read && (
                <Button
                    variant="default"
                    size="sm"
                    onClick={(e) => {
                        e.stopPropagation();
                        onMarkAsRead(notification.id);
                    }}
                    className="ml-2 h-7 px-3 bg-gray-900 text-white rounded-lg hover:bg-black transition-colors text-[10px] font-bold uppercase tracking-widest flex-shrink-0 cursor-pointer shadow-sm"
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
    const [latestNotifications, setLatestNotifications] = useState<Notification[]>([]);
    const [searchTerm, setSearchTerm] = useState(''); 
    const [username, setUsername] = useState<string>('User'); 
    const [role, setRole] = useState<string>('Client');
    const [companies, setCompanies] = useState<{ id: string; name: string }[]>([]);
    const [activeCompany, setActiveCompany] = useState<string>("");
    const [showUploadDrawer, setShowUploadDrawer] = useState(false);

    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        const qParam = searchParams.get('q');
        if (pathname === '/dashboard/search' && qParam !== null) {
            setSearchTerm(decodeURIComponent(qParam));
        }
        // Don't clear search term when navigating away - keep it for better UX
        // Users can continue searching from any page
    }, [pathname, searchParams]);

    const getUnreadCount = useCallback(async () => {
        try {
            const response = await fetchUnreadCountAPI();
            setUnreadCount(response.unreadCount);
        } catch (error) {
            console.error("Failed to fetch unread notification count:", error);
        }
    }, []);

    const getLatestNotifications = useCallback(async () => {
        try {
            const response = await fetchNotificationsAPI({ page: 1, limit: 4, read: undefined });
            setLatestNotifications(response.notifications);
        } catch (error) {
            console.error("Failed to fetch latest notifications:", error);
        }
    }, []);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const storedUsername = localStorage.getItem("username");
            const storedRole = localStorage.getItem("role");
            const storedCompanies = localStorage.getItem("vacei-companies");
            const storedActiveCompany = localStorage.getItem("vacei-active-company");

            if (storedUsername) {
                try { setUsername(atob(storedUsername)); } catch { setUsername('User'); }
            }
            if (storedRole) {
                try { setRole(atob(storedRole)); } catch { setRole(storedRole); }
            }

            let finalCompanies = companies;
            if (storedCompanies) {
                try {
                    const parsed = JSON.parse(storedCompanies);
                    setCompanies(parsed);
                    finalCompanies = parsed;
                } catch { /* ignore */ }
            } else {
                const defaults = [
                    { id: "c1", name: "Acme Ltd" },
                    { id: "c2", name: "Beta Holdings" },
                ];
                setCompanies(defaults);
                finalCompanies = defaults;
                localStorage.setItem("vacei-companies", JSON.stringify(defaults));
            }

            if (storedActiveCompany) {
                setActiveCompany(storedActiveCompany);
            } else {
                const first = finalCompanies?.[0]?.id || "c1";
                setActiveCompany(first);
                localStorage.setItem("vacei-active-company", first);
            }
        }
    }, []);

    useEffect(() => {
        getUnreadCount();
        const REFRESH_INTERVAL = 30 * 1000;
        const intervalId = setInterval(() => {
            getUnreadCount();
        }, REFRESH_INTERVAL);
        return () => clearInterval(intervalId);
    }, [pathname]);

    const handleMarkAsReadFromDropdown = async (id: number) => {
        try {
            await markNotificationAsReadAPI(id);
            setLatestNotifications(prev =>
                prev.map(notif => (notif.id === id ? { ...notif, read: true } : notif))
            );
            await getUnreadCount();
        } catch (err: any) {
            console.error('Error marking as read from dropdown:', err);
        }
    };

    const handleSearchClick = () => {
        if (searchTerm.trim()) {
            router.push(`/dashboard/search?q=${encodeURIComponent(searchTerm.trim())}`);
        } else {
            // If no search term, navigate to search page anyway
            router.push('/dashboard/search');
        }
    };

    const activeCompanyName = companies.find(c => c.id === activeCompany)?.name || "Select Company";

    const companyMenuItems = companies.map(c => {
        const isActive = c.id === activeCompany;
        return {
            id: c.id,
            label: c.name,
            className: isActive ? "bg-success/10 text-success font-bold" : "",
            icon: <div className={cn("w-2 h-2 rounded-full", isActive ? "bg-success" : "bg-gray-200")} />,
            onClick: () => {
                setActiveCompany(c.id);
                if (typeof window !== "undefined") localStorage.setItem("vacei-active-company", c.id);
            }
        };
    });

    const quickActionItems = [
        {
            id: 'upload',
            label: 'Upload documents',
            icon: <HugeiconsIcon icon={Upload04Icon} className="w-4 h-4" />,
            onClick: () => setShowUploadDrawer(true)
        },
        ...(role.toLowerCase() !== "viewer" ? [{
            id: 'request',
            label: 'Request service',
            icon: <HugeiconsIcon icon={Video01Icon} className="w-4 h-4" />,
            onClick: () => router.push('/dashboard/services/request')
        }] : []),
        {
            id: 'schedule',
            label: 'Schedule a call',
            icon: <HugeiconsIcon icon={Video01Icon} className="w-4 h-4" />,
            onClick: () => router.push('/dashboard/schedule')
        }
    ];

    return (
        <header 
            className="h-16 backdrop-blur-xl border flex items-center justify-between px-6 sticky top-0 z-40 rounded-[2rem] m-2 mb-0 mr-2 bg-background/80 shadow-lg"
            style={{
                borderColor: `hsl(var(--border))`,
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
            }}
        >
            <div className="flex items-center gap-4">
                {onSidebarToggle && (
                    <button
                        className="md:flex hidden p-2 rounded-2xl hover:bg-[hsl(var(--muted))] transition-colors group"
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

                <div className="flex items-center gap-2 max-w-[350px] flex-1">
                        <div className="relative flex items-center w-full">
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
                <div className="hidden md:flex items-center gap-2">
                    <Dropdown
                        align="left"
                        label={activeCompanyName}
                        items={companyMenuItems}
                        searchable={true}
                        searchPlaceholder="Search companies..."
                        trigger={
                            <div className="rounded-xl border border-border bg-card px-4 py-2 text-xs font-medium text-gray-900 cursor-pointer shadow-sm hover:shadow-md hover:bg-white transition-all min-w-[160px] flex justify-between items-center group">
                                <span className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-success" />
                                    {activeCompanyName}
                                </span>
                                <ChevronDown className="w-3.5 h-3.5 ml-2 opacity-40 group-hover:opacity-100 transition-opacity" />
                            </div>
                        }
                    />
                </div>

                <Dropdown
                    align="right"
                    items={quickActionItems}
                    trigger={
                        <Button
                            variant="outline"
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium cursor-pointer border-gray-200 hover:shadow-md transition-all h-10"
                        >
                            <i className="fi fi-rr-menu-burger text-sm" />
                            <span className="hidden md:inline">QUICK ACTIONS</span>
                        </Button>
                    }
                />

                <Dropdown
                    align="right"
                    contentClassName="w-84 overflow-hidden"
                    trigger={
                        <Button
                            variant="ghost"
                            onClick={getLatestNotifications}
                            className="h-10 w-10 rounded-xl hover:bg-white hover:shadow-md cursor-pointer relative transition-all"
                        >
                            <HugeiconsIcon icon={Notification01Icon} className="w-5 h-5 text-gray-900" />
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-destructive text-white text-[10px] font-bold rounded-lg h-5 min-w-[20px] px-1 flex items-center justify-center shadow-md border-2 border-white">
                                    {unreadCount > 99 ? '99+' : unreadCount}
                                </span>
                            )}
                        </Button>
                    }
                    closeOnClick={false}
                >
                    <div className="flex flex-col max-h-[480px]">
                        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Latest Notifications</h3>
                            {unreadCount > 0 && (
                                <span className="text-[10px] font-bold text-destructive bg-destructive/10 px-2 py-0.5 rounded-full uppercase tracking-widest">
                                    {unreadCount} New
                                </span>
                            )}
                        </div>
                        <div className="p-3 overflow-y-auto">
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
                                <div className="py-12 flex flex-col items-center justify-center text-center px-6">
                                    <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-3">
                                        <HugeiconsIcon icon={Notification01Icon} className="w-6 h-6 text-gray-300" />
                                    </div>
                                    <p className="text-sm font-bold text-gray-900 mb-1">All caught up!</p>
                                    <p className="text-xs text-gray-500">No new notifications at the moment.</p>
                                </div>
                            )}
                        </div>
                        <div className="p-3 border-t border-gray-100 bg-gray-50/50">
                            <Link href="/dashboard/notifications" passHref className="block">
                                <Button
                                    variant="ghost"
                                    className="w-full text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-gray-900 hover:bg-white rounded-xl h-10 transition-all"
                                >
                                    View all notifications
                                </Button>
                            </Link>
                        </div>
                    </div>
                </Dropdown>

                <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-xl hover:bg-white hover:shadow-md transition-all"
                    aria-label="Open settings"
                    title="Settings"
                >
                    <i className="fi fi-rr-settings text-gray-900"></i>
                </Button>

                <div 
                    className="flex items-center gap-4 pl-4 border-l border-gray-200"
                >
                    <div className="hidden sm:block text-right">
                        <p className="text-sm font-bold text-gray-900 leading-tight">
                            {username}
                        </p>
                        <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mt-0.5">
                            {role || "Client"}
                        </p>
                    </div>

                    <div className="relative group cursor-pointer">
                        <div 
                            className="w-10 h-10 rounded-xl flex items-center justify-center bg-gray-900 text-white shadow-lg group-hover:scale-105 transition-transform"
                        >
                            <span className="text-sm font-medium">
                                {username.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <div 
                            className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success rounded-full border-2 border-white shadow-sm"
                        ></div>
                    </div>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                            if (typeof window !== 'undefined') {
                                // Clear only auth-related items, preserve onboarding data
                                localStorage.removeItem('token');
                                localStorage.removeItem('username');
                                localStorage.removeItem('email');
                                localStorage.removeItem('user_id');
                                document.cookie = 'client-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax';
                                document.cookie = 'client-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=None; Secure';
                                router.push('/login');
                            }
                        }}
                        className="h-10 w-10 rounded-xl text-red-500 hover:text-white hover:bg-red-500 transition-all shadow-sm hover:shadow-red-200"
                    >
                        <i className="fi fi-rr-sign-out-alt"></i>
                    </Button>
                </div>
            </div>

            <GlobalUploadDrawer open={showUploadDrawer} onClose={() => setShowUploadDrawer(false)} />
        </header>
    );
}
