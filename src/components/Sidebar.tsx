"use client";

import Link from "next/link";
import Image from "next/image";
import SidebarMenu from "@/components/SidebarMenu";
import { menuData } from "@/lib/menuData";
import UserMenu from "@/components/UserMenu";
import { cn } from "@/lib/utils";

interface SidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
    isCollapsed?: boolean;
}

export default function Sidebar({ isOpen = true, onClose, isCollapsed = false }: SidebarProps) {
    return (
        <div
            className={cn(
                "flex flex-col transform transition-all duration-300 ease-in-out z-50",
                // mobile slide - only hide on mobile when not open
                isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
                // desktop positioning - fixed when collapsed, absolute when expanded (floating)
                isCollapsed 
                    ? "md:fixed md:top-4 md:bottom-4 md:left-4 md:w-20 md:h-[calc(100vh-2rem)]" 
                    : "md:absolute md:top-4 md:bottom-4 md:left-4 md:w-80 md:max-w-[4000px] md:h-[calc(100vh-2rem)]",
                // modern styling with curves on all corners
                "border shadow-xl rounded-tl-[2rem] rounded-tr-[2rem] rounded-bl-[2rem] rounded-br-[2rem] overflow-hidden",
                "hidden lg:flex"
            )}
            style={{
                backgroundColor: `hsl(var(--sidebar-background))`,
                color: `hsl(var(--sidebar-foreground))`,
                borderColor: `hsl(var(--sidebar-border))`
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
                                "rounded-2xl flex items-center justify-center shadow-lg",
                                isCollapsed ? "w-12 h-12" : "w-16 h-16"
                            )}
                            style={{ 
                                background: `linear-gradient(to bottom right, hsl(var(--sidebar-logo-bg)), hsl(var(--sidebar-hover)))`,
                                borderColor: `hsl(var(--sidebar-border))`,
                                borderWidth: '1px'
                            }}
                        >
                        <Image
                            src="/logo.svg"
                            alt="Logo"
                                width={isCollapsed ? 40 : 48}
                                height={isCollapsed ? 40 : 48}
                                className="object-contain rounded-lg"
                            />
                        </div>
                        {/* Subtle glow effect */}
                        <div 
                            className="absolute inset-0 rounded-2xl blur-sm"
                            style={{ backgroundColor: `hsl(var(--sidebar-foreground) / 0.05)` }}
                        ></div>
                    </div>
                    
                    <div className={cn(
                        "flex-1 transition-all duration-300 ease-in-out",
                        isCollapsed ? "md:opacity-0 md:w-0 md:overflow-hidden" : "md:opacity-100 md:w-auto"
                    )}>
                        <div className="space-y-1">
                            <h1 
                                className="text-2xl font-bold tracking-tight"
                                style={{ color: `hsl(var(--sidebar-foreground))` }}
                            >
                                Vacei
                            </h1>
                            <p 
                                className="text-xs font-medium uppercase tracking-wider opacity-70"
                                style={{ color: `hsl(var(--sidebar-foreground))` }}
                            >
                                CLIENT SERVICE PORTAL
                            </p>
                            {!isCollapsed && (
                                <p
                                    className="text-[11px] mt-1 rounded-full px-3 py-1 inline-flex items-center gap-1"
                                    style={{
                                        backgroundColor: `hsl(var(--sidebar-hover))`,
                                        color: `hsl(var(--sidebar-foreground))`,
                                    }}
                                >
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                    One workspace for bookkeeping, VAT, audit & CSP
                            </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Mobile close button */}
                {onClose && (
                    <button
                        className="md:hidden absolute top-6 right-6 p-2 rounded-lg transition-colors"
                        style={{
                            backgroundColor: `hsl(var(--sidebar-hover))`,
                            borderColor: `hsl(var(--sidebar-border))`,
                            borderWidth: '1px'
                        }}
                        onClick={onClose}
                        aria-label="Close Menu"
                    >
                        <div className="w-5 h-5 relative">
                            <div className="absolute inset-0 rotate-45">
                                <div 
                                    className="w-0.5 h-5 rounded-full"
                                    style={{ backgroundColor: `hsl(var(--sidebar-foreground))` }}
                                ></div>
                            </div>
                            <div className="absolute inset-0 -rotate-45">
                                <div 
                                    className="w-0.5 h-5 rounded-full"
                                    style={{ backgroundColor: `hsl(var(--sidebar-foreground))` }}
                                ></div>
                            </div>
                        </div>
                    </button>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] sidebar-nav">
                <div className={cn(
                    "space-y-2",
                    isCollapsed ? "p-2" : "p-4"
                )}>
                    <SidebarMenu menu={menuData} isCollapsed={isCollapsed} />
                </div>
            </nav>

            {/* Footer / User */}
            <div 
                className={cn(
                    "border-t",
                    isCollapsed ? "p-2" : "p-4"
                )}
                style={{ borderColor: `hsl(var(--sidebar-border))` }}
            >
                <UserMenu isCollapsed={isCollapsed} />
            </div>
        </div>
    );
}
