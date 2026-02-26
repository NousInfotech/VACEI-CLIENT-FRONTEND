'use client';

import Link from "next/link";
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GlobalUploadDrawer } from "@/components/GlobalUploadDrawer";
import { HugeiconsIcon } from '@hugeicons/react';
import { Notification01Icon, Upload04Icon, Video01Icon } from '@hugeicons/core-free-icons';
import { PanelLeft, PanelLeftClose, ChevronDown, LayoutGrid, ArrowLeft } from 'lucide-react';
import { cn } from "@/lib/utils";
import Dropdown from "./Dropdown";

import {
    Notification,
    fetchNotificationsAPI,
    fetchUnreadCountAPI,
    markNotificationAsReadAPI,
} from '@/api/notificationService';
import { getCompanies } from '@/api/auditService';
import { useActiveCompany } from '@/context/ActiveCompanyContext';
import { useGlobalDashboard } from '@/context/GlobalDashboardContext';
import { useSSE } from '@/hooks/useSSE';

// NotificationItem component
interface HeaderNotificationItemProps {
    notification: Notification;
    onMarkAsRead: (id: string) => void;
}

const HeaderNotificationItem: React.FC<HeaderNotificationItemProps> = ({ notification, onMarkAsRead }) => {
    let bgColorClass = '';
    let textColorClass = '';

    const isRead = notification.isRead;

    switch (notification.type) {
        case 'meeting_scheduled':
        case 'meeting_updated':
        case 'task_assigned':
            bgColorClass = isRead ? 'bg-brand-muted' : 'bg-brand-primary/10';
            textColorClass = isRead ? 'text-brand-primary' : 'text-brand-body';
            break;
        case 'meeting_canceled':
        case 'error':
            bgColorClass = isRead ? 'bg-destructive/10' : 'bg-destructive/20';
            textColorClass = isRead ? 'text-destructive' : 'text-destructive';
            break;
        case 'chat_message':
            bgColorClass = isRead ? 'bg-brand-muted' : 'bg-sidebar-hover/30';
            textColorClass = isRead ? 'text-brand-body' : 'text-brand-body';
            break;
        default:
            bgColorClass = isRead ? 'bg-brand-body' : 'bg-brand-muted';
            textColorClass = isRead ? 'text-muted-foreground' : 'text-brand-body';
    }

    const displayTitle = notification.title.length > 50
        ? notification.title.substring(0, 47) + '...'
        : notification.title;

    return (
        <div className={`p-3 rounded-xl mb-2 flex items-center ${bgColorClass} border border-transparent hover:border-gray-200 transition-all`}>
            <div className="flex-1 min-w-0">
                <p className={`font-semibold text-sm ${textColorClass} overflow-hidden text-ellipsis `}>
                    {displayTitle}
                </p>
                <p className="text-gray-500 text-xs line-clamp-1">{notification.content}</p>
                <small className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-1 block">
                    {new Date(notification.createdAt).toLocaleDateString()}
                    {isRead ? ' • Read' : ' • New'}
                </small>
            </div>
            {!isRead && (
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
    const [showUploadDrawer, setShowUploadDrawer] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    // Use ActiveCompanyContext instead of local state
    const { activeCompanyId, setActiveCompanyId, companies, setCompanies } = useActiveCompany();
    const { companies: globalCompanies } = useGlobalDashboard();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        setIsMounted(true);
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
            setUnreadCount(response.count);
        } catch (error) {
            console.error("Failed to fetch unread notification count:", error);
        }
    }, []);

    const getLatestNotifications = useCallback(async () => {
        try {
            const response = await fetchNotificationsAPI({ page: 1, limit: 10 });
            setLatestNotifications(Array.isArray(response) ? response : (response?.items || []));
        } catch (error) {
            console.error("Failed to fetch latest notifications:", error);
            setLatestNotifications([]);
        }
    }, []);

    // SSE Hook
    const { notifications: sseNotifications, unreadCount: sseUnreadCount } = useSSE();

    // Re-fetch when SSE notification arrives
    useEffect(() => {
        if (sseNotifications.length > 0) {
            getUnreadCount();
            getLatestNotifications();
        }
    }, [sseNotifications, getUnreadCount, getLatestNotifications]);

    // Fetch companies from backend API
    const fetchCompaniesFromAPI = useCallback(async () => {
        try {
            const companiesData = await getCompanies();
            if (Array.isArray(companiesData) && companiesData.length > 0) {
                // Map backend companies to header format
                const mappedCompanies = companiesData.map((company: any) => ({
                    id: company._id || company.id,
                    name: company.name || 'Unnamed Company'
                }));
                setCompanies(mappedCompanies);
                localStorage.setItem("vacei-companies", JSON.stringify(mappedCompanies));
            }
        } catch (error) {
            console.error("Failed to fetch companies from API:", error);
            // Fallback to localStorage if API fails
            const storedCompanies = localStorage.getItem("vacei-companies");
            if (storedCompanies) {
                try {
                    const parsed = JSON.parse(storedCompanies);
                    setCompanies(parsed);
                } catch { /* ignore */ }
            }
        }
    }, [activeCompanyId, setActiveCompanyId, setCompanies]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const storedUsername = localStorage.getItem("username");
            const storedRole = localStorage.getItem("role");

            if (storedUsername) {
                try { setUsername(atob(storedUsername)); } catch { setUsername('User'); }
            }
            if (storedRole) {
                try { setRole(atob(storedRole)); } catch { setRole(storedRole); }
            }

            // Fetch companies from API immediately after login
            fetchCompaniesFromAPI();
            // Active company is managed by context, no need to set it here
        }
    }, [fetchCompaniesFromAPI]);

    useEffect(() => {
        getUnreadCount();
        getLatestNotifications();
    }, [pathname, getUnreadCount, getLatestNotifications]);

    // Refresh companies when navigating to dashboard (after login or signup)
    useEffect(() => {
        if (pathname?.startsWith('/dashboard')) {
            // Check if token exists (user is logged in)
            const token = localStorage.getItem('token');
            if (token) {
                // Fetch companies from API to ensure latest data
                fetchCompaniesFromAPI();
            }
        }
    }, [pathname, fetchCompaniesFromAPI]);

    // Listen for signup completion event or storage changes
    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            // If onboarding data is cleared or company data changes, refresh companies
            if (e.key === 'onboarding-data' || e.key === 'vacei-companies') {
                const token = localStorage.getItem('token');
                if (token && pathname?.startsWith('/dashboard')) {
                    fetchCompaniesFromAPI();
                }
            }
        };

        // Listen for storage events (from other tabs/windows)
        window.addEventListener('storage', handleStorageChange);

        // Also check for signup completion flag
        const checkSignupCompletion = () => {
            const signupCompleted = sessionStorage.getItem('signup-completed');
            if (signupCompleted === 'true') {
                const token = localStorage.getItem('token');
                if (token) {
                    fetchCompaniesFromAPI();
                    // Clear the flag
                    sessionStorage.removeItem('signup-completed');
                }
            }
        };

        // Check immediately
        checkSignupCompletion();

        // Check periodically for a short time after mount (in case signup just completed)
        const checkInterval = setInterval(() => {
            checkSignupCompletion();
        }, 1000);

        // Stop checking after 10 seconds
        setTimeout(() => {
            clearInterval(checkInterval);
        }, 10000);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            clearInterval(checkInterval);
        };
    }, [pathname, fetchCompaniesFromAPI]);

    const handleMarkAsReadFromDropdown = async (id: string) => {
        try {
            await markNotificationAsReadAPI(id);
            setLatestNotifications(prev =>
                prev.map(notif => (notif.id === id ? { ...notif, isRead: true } : notif))
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

    const activeCompanyName = companies.find(c => c.id === activeCompanyId)?.name || "Select Company";

    const companyMenuItems = companies.map(c => {
        const isActive = c.id === activeCompanyId;
        return {
            id: c.id,
            label: c.name,
            className: isActive ? "bg-success/10 text-success font-bold" : "",
            icon: <div className={cn("w-2 h-2 rounded-full", isActive ? "bg-success" : "bg-gray-200")} />,
            onClick: () => {
                setActiveCompanyId(c.id);
                router.push(`/dashboard`);
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
                            <PanelLeft className="h-5 w-5 group-hover:scale-110 transition-transform text-foreground" />
                        ) : (
                            <PanelLeftClose className="h-5 w-5 group-hover:scale-110 transition-transform text-foreground" />
                        )}
                    </button>
                )}

                <Button
                    onClick={() => {
                        if (pathname === '/dashboard/services/request/history' || pathname === '/global-dashboard/services/request/history') {
                            router.push('/dashboard/services/request');
                        } else if (window.history.length > 2) {
                            router.back();
                        } else {
                            router.push('/dashboard');
                        }
                    }}
                    variant="secondary"
                    size="sm"
                    className="rounded-full px-4 bg-[#0B1525] text-white hover:bg-[#0B1525]/90 border border-white/10"
                    aria-label="Go Back"
                    title="Go Back"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                </Button>

                {/* <div className="flex items-center gap-2 max-w-[350px] flex-1">
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
                    </div> */}
            </div>

            <div className="flex items-center gap-3">
                {!pathname.startsWith("/global-dashboard") && (
                    <div className="hidden md:flex items-center gap-2">
                        <Link href="/global-dashboard">
                            <Button
                                variant="outline"
                                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium cursor-pointer border-border bg-card shadow-sm hover:shadow-md hover:bg-white transition-all h-10 group"
                            >
                                <LayoutGrid className="w-4 h-4 text-gray-900 group-hover:scale-110 transition-transform" />
                                <span className="hidden lg:inline uppercase">Global Dashboard</span>
                            </Button>
                        </Link>

                        <div className="h-4 w-px bg-border mx-1" />

                        <Dropdown
                            align="left"
                            label={activeCompanyName}
                            items={companyMenuItems}
                            searchable={true}
                            searchPlaceholder="Search companies..."
                            trigger={
                                <div className="rounded-xl border border-border bg-card px-4 py-2 text-xs font-medium text-gray-900 cursor-pointer shadow-sm hover:shadow-md hover:bg-white transition-all min-w-[160px] flex justify-between items-center group">
                                    <span className="flex items-center gap-2">
                                        <div className={cn(
                                            "w-1.5 h-1.5 rounded-full",
                                            globalCompanies.find(c => c.id === activeCompanyId)?.overdueCount ? "bg-destructive animate-pulse" :
                                                globalCompanies.find(c => c.id === activeCompanyId)?.dueSoonCount ? "bg-amber-500" : "bg-success"
                                        )} />
                                        {isMounted ? (activeCompanyName.length > 20 ? activeCompanyName.substring(0, 17) + "..." : activeCompanyName) : "Loading..."}
                                    </span>
                                    <ChevronDown className="w-3.5 h-3.5 ml-2 opacity-40 group-hover:opacity-100 transition-opacity" />
                                </div>
                            }
                        />
                    </div>
                )}

                {/* <Dropdown
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
                /> */}

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
                                    <Link href={notification.redirectUrl || '#'} key={notification.id} passHref>
                                        <div
                                            onClick={async () => {
                                                if (!notification.isRead) {
                                                    await markNotificationAsReadAPI(notification.id);
                                                    setLatestNotifications(prev =>
                                                        prev.map(notif => (notif.id === notification.id ? { ...notif, isRead: true } : notif))
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
