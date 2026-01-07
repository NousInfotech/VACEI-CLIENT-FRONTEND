"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { MenuItem, MenuSection } from "@/lib/menuData";
import { HugeiconsIcon } from "@hugeicons/react";
import { cn } from "@/lib/utils";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface SidebarMenuProps {
    menu: MenuItem[];
    isCollapsed?: boolean;
}

export default function SidebarMenu({ menu, isCollapsed = false }: SidebarMenuProps) {
    const [openItems, setOpenItems] = useState<Record<string, boolean>>({});
    const pathname = usePathname();

    const toggleItem = (slug: string) => {
        setOpenItems((prev) => ({
            ...prev,
            [slug]: !prev[slug],
        }));
    };

    const renderMenuItem = (item: MenuItem) => {
                const hasChildren = item.children && item.children.length > 0;
                const isOpen = openItems[item.slug];
                const isActive = pathname === item.href;
                const hasActiveChild = item.children?.some((child) => pathname === child.href);

        const linkContent = (
            <Link
                key={item.href}
                href={item.href}
                onClick={(e) => {
                    if (hasChildren && !isCollapsed) {
                        e.preventDefault();
                        toggleItem(item.slug);
                    } else {
                        // Ensure navigation works for items without children
                        // Don't prevent default for regular links
                    }
                }}
                className={cn(
                    'group relative flex items-center transition-all duration-300 ease-out',
                    isCollapsed 
                        ? 'justify-center px-2 py-3 rounded-2xl' 
                        : 'gap-4 px-4 py-3 rounded-2xl',
                    'hover:scale-[1.02] hover:shadow-lg border'
                )}
                style={{
                    backgroundColor: isActive || hasActiveChild ? `hsl(var(--sidebar-active))` : 'transparent',
                    color: isActive || hasActiveChild ? `hsl(var(--sidebar-foreground))` : `hsl(var(--sidebar-foreground) / 0.8)`,
                    borderColor: isActive || hasActiveChild ? `hsl(var(--sidebar-border))` : 'transparent'
                }}
                onMouseEnter={(e) => {
                    if (!isActive && !hasActiveChild) {
                        e.currentTarget.style.backgroundColor = `hsl(var(--sidebar-hover))`;
                        e.currentTarget.style.color = `hsl(var(--sidebar-foreground))`;
                    }
                }}
                onMouseLeave={(e) => {
                    if (!isActive && !hasActiveChild) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = `hsl(var(--sidebar-foreground) / 0.8)`;
                    }
                }}
            >
                {/* Active indicator */}
                {(isActive || hasActiveChild) && !isCollapsed && (
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
                        backgroundColor: isActive || hasActiveChild ? `hsl(var(--accent))` : `hsl(var(--sidebar-hover))`,
                        color: isActive || hasActiveChild ? `hsl(var(--accent-foreground))` : `hsl(var(--sidebar-foreground))`
                    }}
                >
                    <HugeiconsIcon icon={item.icon} className={cn(isCollapsed ? "h-4 w-4" : "h-5 w-5")} />
                </div>

                {/* Text content */}
                {!isCollapsed && (
                    <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm truncate">{item.label}</div>
                    </div>
                )}

                {/* Arrow for children */}
                {hasChildren && !isCollapsed && (
                    <i
                        className={`${isOpen ? "fi fi-br-angle-up" : "fi fi-br-angle-down"} arrows`}
                        style={{ color: `hsl(var(--sidebar-foreground))` }}
                    />
                )}

                {/* Hover effect */}
                <div className={cn(
                    'absolute inset-0 transition-opacity duration-300 rounded-2xl pointer-events-none',
                    isActive || hasActiveChild ? 'opacity-0' : 'opacity-0 group-hover:opacity-10'
                )}
                style={{ backgroundColor: `hsl(var(--sidebar-foreground))` }}
                ></div>
            </Link>
        );

        const menuItemContent = (
            <>
                {linkContent}

                {/* Children menu - only show when not collapsed */}
                {hasChildren && isOpen && item.children && !isCollapsed && (
                    <ul className="mt-2 ml-4 space-y-1 border-l-2 pl-4" style={{ borderColor: `hsl(var(--sidebar-border))` }}>
                        {item.children.map((child) => {
                            const isChildActive = pathname === child.href;
                            return (
                                <li key={child.label}>
                                    <Link
                                        href={child.href}
                                        className={cn(
                                            "flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all",
                                            isChildActive ? "font-semibold" : "opacity-80"
                                        )}
                                        style={{
                                            color: isChildActive ? `hsl(var(--accent))` : `hsl(var(--sidebar-foreground) / 0.8)`,
                                            backgroundColor: isChildActive ? `hsl(var(--sidebar-hover))` : 'transparent'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!isChildActive) {
                                                e.currentTarget.style.backgroundColor = `hsl(var(--sidebar-hover))`;
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!isChildActive) {
                                                e.currentTarget.style.backgroundColor = 'transparent';
                                            }
                                        }}
                                    >
                                        <HugeiconsIcon icon={child.icon} className="h-4 w-4" />
                                        <span>{child.label}</span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </>
        );

        // Wrap with tooltip when collapsed
        if (isCollapsed) {
            return (
                <Tooltip key={item.slug}>
                    <TooltipTrigger asChild>
                        {linkContent}
                    </TooltipTrigger>
                    <TooltipContent 
                        side="right" 
                        className="shadow-lg"
                        style={{
                            backgroundColor: `hsl(var(--sidebar-accent))`,
                            color: `hsl(var(--sidebar-accent-foreground))`,
                            borderColor: `hsl(var(--sidebar-border))`
                        }}
                    >
                        <p className="font-semibold">{item.label}</p>
                    </TooltipContent>
                </Tooltip>
            );
        }

        return <li key={item.slug}>{menuItemContent}</li>;
    };

    const sections: { id: MenuSection; label: string }[] = [
        { id: "primary", label: "Client portal" },
        { id: "workspaces", label: "Workspaces & insights" },
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

    return (
        <TooltipProvider delayDuration={300}>
            <ul className="menu space-y-4">
                {sections.map((section) => {
                    const items = grouped[section.id];
                    if (!items.length) return null;
                    return (
                        <li key={section.id} className="space-y-1">
                            {!isCollapsed && (
                                <p className="px-4 py-1.5 mt-1 text-[11px] font-semibold tracking-wide uppercase text-[hsl(var(--sidebar-foreground)/0.6)]">
                                    {section.label}
                                </p>
                            )}
                            <ul className="space-y-2">
                                {items.map((item) => renderMenuItem(item))}
                            </ul>
                            {isCollapsed && (
                                <div className="mx-2 mt-2 h-px bg-[hsl(var(--sidebar-border)/0.5)]" />
                            )}
                        </li>
                    );
                })}
            </ul>
        </TooltipProvider>
    );
}
