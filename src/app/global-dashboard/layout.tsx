"use client";

import { useState, Suspense, useMemo } from "react";
import Sidebar from "@/components/Sidebar";
import Link from "next/link";
import Image from "next/image";
import SidebarMenu from "@/components/SidebarMenu";
import { menuData, globalMenuData } from "@/lib/menuData";
import UserMenu from "@/components/UserMenu";
import TopHeader from "@/components/TopHeader";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import ChatWrapper from "@/components/ChatWrapper";
import { cn } from "@/lib/utils";
import { ActiveCompanyProvider } from "@/context/ActiveCompanyContext";
import { GlobalDashboardProvider } from "@/context/GlobalDashboardContext";
import RoleGuard from "@/components/RoleGuard";
import { usePathname } from "next/navigation";

export default function GlobalDashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);

    const isGlobal = pathname.startsWith("/global-dashboard");
    const activeMenu = isGlobal ? globalMenuData : menuData;

    const handleSidebarToggle = () => {
        setIsSidebarCollapsed(!isSidebarCollapsed);
    };

    return (
        <RoleGuard allowedRole="client">
            <GlobalDashboardProvider>
            <ActiveCompanyProvider>
            <div className="flex h-screen bg-brand-body relative">
                <Suspense fallback={<div className="w-24 lg:w-84 h-screen bg-brand-body animate-pulse" />}>
                    <Sidebar 
                        isOpen={isSidebarOpen}
                        onClose={() => setIsSidebarOpen(false)}
                        isCollapsed={isSidebarCollapsed}
                        onExpand={() => setIsSidebarCollapsed(false)}
                        menu={activeMenu}
                    />
                </Suspense>

            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}

            <div className={cn("lg:hidden fixed inset-0 z-50 pointer-events-none", isSidebarOpen && "pointer-events-auto")}>
                <Suspense fallback={null}>
                    <SidebarMenu 
                        menu={activeMenu} 
                        isCollapsed={false} 
                        isOpen={isSidebarOpen}
                        onClose={() => setIsSidebarOpen(false)}
                        onExpand={() => setIsSidebarCollapsed(false)}
                    />
                </Suspense>
            </div>

            <div
                className={cn(
                    "flex-1 flex flex-col transition-all duration-300 min-w-0",
                    isSidebarCollapsed ? "lg:ml-24" : "lg:ml-84"
                )}
            >
                <header
                    className="lg:hidden sticky top-0 z-10 bg-background border-b backdrop-blur-xl flex justify-between items-center px-4 py-4"
                    style={{ borderColor: `hsl(var(--border))` }}
                >
                    <button
                        className="text-foreground text-2xl cursor-pointer p-2 rounded-lg hover:bg-muted"
                        aria-label="Open sidebar"
                        onClick={() => setIsSidebarOpen(true)}
                    >
                        <i className="fi fi-rr-menu-burger block leading-0"></i>
                    </button>
                    <Link href="/global-dashboard">
                        <Image
                            src="/logo.svg"
                            alt="Logo"
                            width={120}
                            height={40}
                            className="object-contain"
                        />
                    </Link>
                    <div className="w-10"></div>
                </header>

                <Suspense fallback={<div className="h-16">Loading header...</div>}>
                    <div className="hidden lg:block">
                        <TopHeader
                            onSidebarToggle={handleSidebarToggle}
                            isSidebarCollapsed={isSidebarCollapsed}
                        />
                    </div>
                </Suspense>

                <main 
                    className="flex-1 overflow-y-auto overflow-x-auto lg:overflow-x-hidden bg-brand-body p-4 lg:p-6 min-w-0"
                >
                    <Suspense fallback={<div className="flex items-center justify-center h-full">Loading...</div>}>
                        {children}
                    </Suspense>
                </main>
            </div>

                <ChatWrapper />
            </div>
            </ActiveCompanyProvider>
            </GlobalDashboardProvider>
        </RoleGuard>
    );
}
