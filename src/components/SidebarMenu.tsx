"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Clock, Calendar, ChevronDown, ChevronUp, X } from "lucide-react";
import { HugeiconsIcon } from "@hugeicons/react";
import { cn } from "@/lib/utils";
import { MenuItem, MenuSection } from "@/lib/menuData";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import Image from "next/image";

interface SidebarMenuProps {
    menu: MenuItem[];
    isCollapsed?: boolean;
    isOpen?: boolean;
    onClose?: () => void;
    onExpand?: () => void;
}

export default function SidebarMenu({ 
    menu, 
    isCollapsed = false, 
    isOpen = false, 
    onClose,
    onExpand
}: SidebarMenuProps) {
    const pathname = usePathname();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [openItems, setOpenItems] = useState<Record<string, boolean>>({});
    
    // User data from localStorage
    const [user, setUser] = useState({
        name: "User",
        email: "email@example.com",
        role: "user"
    });
    
    // Find the best matching menu item for the current path
    const getBestMatch = (items: MenuItem[]): MenuItem | null => {
        let best: MenuItem | null = null;
        
        const traverse = (list: MenuItem[]) => {
            list.forEach(item => {
                if (item.href && item.href !== "#") {
                    const isExact = pathname === item.href;
                    const isSubPath = item.href !== "/dashboard" && pathname.startsWith(item.href + "/");
                    
                    if (isExact || isSubPath) {
                        if (!best || item.href.length > best.href.length) {
                            best = item;
                        }
                    }
                }
                if (item.children) traverse(item.children);
            });
        };
        
        traverse(items);
        return best;
    };

    const bestMatch = getBestMatch(menu);

    const branding = {
        sidebar_background_color: "15, 23, 41",
        sidebar_footer_color: "222 47% 16%",
        sidebar_text_color: "220 14% 96%"
    };

    const orgName = "Vacei";
    const orgSubname = "CLIENT SERVICE PORTAL";
    const logoUrl = "/logo/logo2.png";

    useEffect(() => {
        try {
            const nameFromStorage = localStorage.getItem("username")
                ? atob(localStorage.getItem("username")!)
                : null;
            const emailFromStorage = localStorage.getItem("email")
                ? atob(localStorage.getItem("email")!)
                : null;
            if (nameFromStorage) {
                setUser(prev => ({ ...prev, name: nameFromStorage }));
            }
            if (emailFromStorage) {
                setUser(prev => ({ ...prev, email: emailFromStorage }));
            }
        } catch (e) {
            console.error("Error decoding user info", e);
        }
    }, []);

    const toggleItem = (slug: string) => {
        setOpenItems((prev) => ({
            ...prev,
            [slug]: !prev[slug],
        }));
    };

    const handleMenuClick = (e: React.MouseEvent, item: MenuItem, hasChildren: boolean) => {
        if (isCollapsed && hasChildren) {
            if (onExpand) onExpand();
            if (!openItems[item.slug]) {
                toggleItem(item.slug);
            }

            // Scroll to the top of the clicked section after expansion
            // Using a slightly longer timeout to account for the sidebar expansion transition (300ms)
            const target = (e.currentTarget as HTMLElement).closest('li');
            if (target) {
                setTimeout(() => {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 400);
            }

            // Only prevent default if there's no actual link to navigate to
            if (!item.href || item.href === "#") {
                e.preventDefault();
            }
            return;
        }

        if (hasChildren && !isCollapsed) {
            toggleItem(item.slug);
            // Allow navigation for specific hubs even if they have children
            const isHub = ['services-root', 'document-organizer', 'settings'].includes(item.slug);
            if (!isHub) {
                e.preventDefault();
            }
        } else if (item.href && item.href !== "#") {
            // onClose is for mobile
            if (onClose) onClose();
        }
    };

    const sections: { id: MenuSection; label: string }[] = [
        { id: "primary", label: "Client portal" },
        { id: "operations", label: "Operations & tools" },
        { id: "settings", label: "Settings" },
    ];

    const grouped: Record<MenuSection, MenuItem[]> = {
        primary: [],
        workspaces: [],
        operations: [],
        settings: [],
    };

    menu.forEach((item) => {
        const section = item.section || "primary";
        grouped[section].push(item);
    });

    const renderMenuItem = (item: MenuItem, level = 1) => {
        const hasChildren = !!(item.children && item.children.length > 0);
        const isItemOpen = openItems[item.slug];
        
        const checkActive = (it: MenuItem): boolean => {
            if (!it.href || it.href === "#") {
                return !!(it.children && it.children.some(checkActive));
            }

            // Special case for root Dashboard: only match exactly
            if (it.href === "/dashboard") {
                return pathname === "/dashboard";
            }

            // Check if THIS is the best match in the entire menu
            const isBestMatch = it.slug === bestMatch?.slug;
            if (isBestMatch) return true;

            // Otherwise, check if any children are active (for recursive highlighting)
            if (it.children) return it.children.some(checkActive);
            
            return false;
        };
        const isActive = checkActive(item);

        if (level === 1) {
            const linkContent = (
                <Link
                    key={item.slug}
                    href={item.href || "#"}
                    onClick={(e) => handleMenuClick(e, item, hasChildren)}
                    className={cn(
                        'group relative flex items-center transition-all duration-300 ease-out',
                        isCollapsed 
                            ? 'justify-center px-2 py-3 rounded-2xl' 
                            : 'gap-4 px-4 py-3 rounded-2xl',
                        'hover:scale-[1.02] hover:shadow-lg border'
                    )}
                    style={{
                        backgroundColor: isActive ? `hsl(var(--sidebar-active))` : 'transparent',
                        color: isActive ? `hsl(var(--sidebar-foreground))` : `hsl(var(--sidebar-foreground) / 0.8)`,
                        borderColor: isActive ? `hsl(var(--sidebar-border))` : 'transparent'
                    }}
                >
                    {/* Active indicator */}
                    {isActive && !isCollapsed && (
                        <div 
                            className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full"
                            style={{ backgroundColor: `hsl(var(--accent))` }}
                        ></div>
                    )}
                    
                    {/* Icon container */}
                    <div 
                        className={cn(
                            'relative flex items-center justify-center transition-all duration-300',
                            isCollapsed ? 'w-8 h-8' : 'w-10 h-10',
                            'rounded-xl'
                        )}
                        style={{
                            backgroundColor: isActive ? `hsl(var(--accent))` : `hsl(${branding.sidebar_footer_color})`,
                            color: isActive ? `hsl(var(--accent-foreground))` : `hsl(var(--sidebar-foreground))`
                        }}
                    >
                        <HugeiconsIcon icon={item.icon} className={cn(isCollapsed ? "h-4 w-4" : "h-5 w-5")} />
                    </div>

                    {/* Text content */}
                    {!isCollapsed && (
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between w-full gap-2">
                                <span className="font-semibold text-sm truncate">{item.label}</span>
                                {hasChildren && (
                                    isItemOpen ? <ChevronUp className="h-4 w-4 opacity-50" /> : <ChevronDown className="h-4 w-4 opacity-50" />
                                )}
                            </div>
                            {item.description && (
                                <p className="text-[11px] leading-tight opacity-50 truncate mt-0.5 font-medium">
                                    {item.description}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Hover effect */}
                    <div className={cn(
                        'absolute inset-0 transition-opacity duration-300 rounded-2xl pointer-events-none',
                        isActive ? 'opacity-0' : 'opacity-0 group-hover:opacity-10'
                    )}
                    style={{ backgroundColor: `hsl(var(--sidebar-foreground))` }}
                    ></div>
                </Link>
            );

            return (
                <li key={item.slug} className="space-y-1">
                    {isCollapsed ? (
                        <Tooltip>
                            <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                            <TooltipContent side="right" className="bg-sidebar-accent text-sidebar-accent-foreground border-sidebar-border shadow-lg p-3 max-w-xs">
                                <div className="space-y-1">
                                    <p className="font-bold text-sm leading-none">{item.label}</p>
                                    {item.description && <p className="text-[11px] opacity-70 leading-relaxed">{item.description}</p>}
                                </div>
                            </TooltipContent>
                        </Tooltip>
                    ) : (
                        linkContent
                    )}

                    {hasChildren && isItemOpen && !isCollapsed && (
                        <ul className="ml-5 space-y-1 mt-1 border-l border-white/10 pl-4 py-1">
                            {item.children?.map((child) => renderMenuItem(child, level + 1))}
                        </ul>
                    )}
                </li>
            );
        }

        // Recursive items (Level 2+)
        const isServiceActive = item.isActive !== false; // Default to active if not specified
        const serviceHref = isServiceActive ? (item.href || "#") : "/dashboard/services/request";
        
        return (
            <li key={item.slug} className="space-y-1">
                <Link
                    href={serviceHref}
                    onClick={(e) => {
                        if (hasChildren) {
                            toggleItem(item.slug);
                            // Allow 'Audit' to navigate while being a dropdown
                            const isNavigableHeader = ['audit'].includes(item.slug);
                            if (!isNavigableHeader) {
                                e.preventDefault();
                            }
                        } else if (onClose && serviceHref !== "#") {
                            onClose();
                        }
                    }}
                    className={cn(
                        "flex items-center justify-between px-3 py-2 rounded-xl transition-all",
                        isServiceActive 
                            ? "hover:bg-white/5" 
                            : "opacity-50 cursor-not-allowed hover:bg-white/5",
                        isActive ? "text-white font-semibold bg-white/10 shadow-sm" : "text-white/60",
                        level >= 3 ? "text-md" : "text-sm"
                    )}
                >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <HugeiconsIcon icon={item.icon} className={cn(level >= 3 ? "h-3 w-3" : "h-4 w-4", !isServiceActive && "opacity-50")} />
                        <span className="truncate">{item.label}</span>
                    </div>
                    {!isServiceActive && !hasChildren && (
                        <span className="text-[10px] font-medium text-white/40 uppercase tracking-wider ml-2 shrink-0">
                            Request service
                        </span>
                    )}
                    {hasChildren && (
                        isItemOpen ? <ChevronUp className="h-3 w-3 opacity-50 shrink-0" /> : <ChevronDown className="h-3 w-3 opacity-50 shrink-0" />
                    )}
                </Link>

                {hasChildren && isItemOpen && (
                    <ul className="ml-5 space-y-1 mt-1 border-l border-white/10 pl-4 py-1">
                        {item.children?.map((child) => renderMenuItem(child, level + 1))}
                    </ul>
                )}
            </li>
        );
    };

    return (
        <TooltipProvider delayDuration={300}>
            <div
                className={cn(
                    "flex flex-col transform transition-all duration-300 ease-in-out z-50",
                    "fixed inset-y-0 left-0 w-64 h-full md:h-auto",
                    isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
                    isCollapsed 
                        ? "md:fixed md:top-4 md:bottom-4 md:left-4 md:w-20 md:h-[calc(100vh-2rem)]" 
                        : "md:absolute md:top-4 md:bottom-4 md:left-4 md:w-80 md:max-w-[4000px] md:h-[calc(100vh-2rem)]",
                    "border-r shadow-xl",
                    "rounded-r-4xl md:rounded-4xl"
                )}
                style={{
                    backgroundColor: `rgb(${branding?.sidebar_background_color || '15, 23, 41'})`,
                    color: `hsl(${branding?.sidebar_text_color || '220 14% 96%'})`,
                    borderColor: `hsl(${branding?.sidebar_background_color || '222 47% 11%'} / 0.5)`
                }}
            >
                {/* Header */}
                <div 
                    className={cn(
                        "border-b relative",
                        isCollapsed ? "p-4" : "p-6"
                    )}
                    style={{ borderColor: `hsl(var(--sidebar-border))` }}
                >
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div 
                                className={cn(
                                    "rounded-2xl flex items-center justify-center shadow-lg p-1",
                                    isCollapsed ? "w-12 h-12" : "w-16 h-16"
                                )}
                                style={{ 
                                    background: `linear-gradient(to bottom right, hsl(var(--sidebar-logo-bg)), hsl(var(--sidebar-hover)))`,
                                    borderColor: `hsl(var(--sidebar-border))`,
                                    borderWidth: '1px'
                                }}
                            >
                                <img 
                                    src={logoUrl} 
                                    alt="Logo" 
                                    className={cn(
                                        "object-contain rounded-lg",
                                        isCollapsed ? "h-10 w-10" : "h-12 w-12"
                                    )} 
                                />
                            </div>
                            <div 
                                className="absolute inset-0 rounded-2xl blur-sm"
                                style={{ backgroundColor: `hsl(${branding.sidebar_footer_color} / 0.05)` }}
                            ></div>
                        </div>
                        
                        <div className={cn(
                            "flex-1 transition-all duration-300 ease-in-out",
                            isCollapsed ? "md:opacity-0 md:w-0 md:overflow-hidden" : "md:opacity-100 md:w-auto"
                        )}>
                            <div className="space-y-1">
                                <h1 className="text-2xl font-bold tracking-tight" style={{ color: `hsl(var(--sidebar-foreground))` }}>{orgName}</h1>
                                <p className="text-xs font-medium uppercase tracking-wider opacity-70" style={{ color: `hsl(var(--sidebar-foreground))` }}>{orgSubname}</p>
                            </div>
                        </div>
                    </div>

                    <button
                        className="md:hidden absolute top-6 right-6 p-2 rounded-lg transition-colors hover:bg-white/10"
                        onClick={onClose}
                        aria-label="Close Menu"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            
                {/* Nav */}
                <nav className="flex-1 overflow-y-auto scrollbar-hide p-4">
                    <ul className="space-y-6">
                        {sections.map((section) => {
                            const items = grouped[section.id];
                            if (!items.length) return null;
                            return (
                                <li key={section.id} className="space-y-2">
                                    {!isCollapsed && (
                                        <p className="px-4 py-1 text-[11px] font-medium tracking-widest uppercase text-white/60">
                                            {section.label}
                                        </p>
                                    )}
                                    <ul className="space-y-2">
                                        {items.map((item) => renderMenuItem(item))}
                                    </ul>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {/* Footer / User */}
                <div 
                    className={cn(
                        "border-t p-4",
                        isCollapsed ? "p-2" : "p-4"
                    )}
                    style={{ borderColor: `hsl(var(--sidebar-hover))` }}
                >
                    <div 
                        className={cn(
                            "border rounded-2xl",
                            isCollapsed ? "p-2" : "p-4"
                        )}
                        style={{
                            backgroundColor: `hsl(${branding.sidebar_footer_color})`,
                            borderColor: `hsl(${branding.sidebar_footer_color})`
                        }}
                    >
                        <div className={cn("flex items-center", isCollapsed ? "justify-center" : "gap-3")}>
                            <div className="relative">
                                <div 
                                    className={cn("rounded-2xl flex items-center justify-center", isCollapsed ? "w-8 h-8" : "w-10 h-10")}
                                    style={{ backgroundColor: `hsl(var(--accent))` }}
                                >
                                    <span className={cn("font-bold", isCollapsed ? "text-xs" : "text-sm")} style={{ color: `hsl(var(--accent-foreground))` }}>
                                        {user.name?.charAt(0)?.toUpperCase()}
                                    </span>
                                </div>
                                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2" style={{ borderColor: `hsl(var(--sidebar-background))` }}></div>
                            </div>

                            {!isCollapsed && (
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold truncate" style={{ color: `hsl(var(--sidebar-foreground))` }}>{user.name}</p>
                                    <p className="text-xs truncate opacity-70" style={{ color: `hsl(var(--sidebar-foreground))` }}>{user.email}</p>
                                    <div className="flex items-center gap-1 mt-1">
                                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                                        <span className="text-xs opacity-70" style={{ color: `hsl(var(--sidebar-foreground))` }}>Online</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </TooltipProvider> 
    );
}
