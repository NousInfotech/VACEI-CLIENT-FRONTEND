"use client";

import { useState, Suspense } from "react";
import Sidebar from "@/components/Sidebar";
import Link from "next/link";
import Image from "next/image";
import SidebarMenu from "@/components/SidebarMenu";
import { menuData } from "@/lib/menuData";
import UserMenu from "@/components/UserMenu";
import TopHeader from "@/components/TopHeader";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import ChatWrapper from "@/components/ChatWrapper";
import { cn } from "@/lib/utils";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true); // Start collapsed by default

    const handleSidebarToggle = () => {
        setIsSidebarCollapsed(!isSidebarCollapsed);
    };

    return (
        <div className="flex h-screen bg-brand-body relative">
            {/* Sidebar for desktop & mobile */}
            <Sidebar 
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                isCollapsed={isSidebarCollapsed}
                onExpand={() => setIsSidebarCollapsed(false)}
            />

            {/* Mobile Backdrop Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}

            {/* Mobile Sidebar */}
            <div className={cn("lg:hidden fixed inset-0 z-50 pointer-events-none", isSidebarOpen && "pointer-events-auto")}>
                <SidebarMenu 
                    menu={menuData} 
                    isCollapsed={false} 
                    isOpen={isSidebarOpen}
                    onClose={() => setIsSidebarOpen(false)}
                    onExpand={() => setIsSidebarCollapsed(false)}
                />
            </div>

            {/* Main Content Area */}
            <div
                className={cn(
                    "flex-1 flex flex-col transition-all duration-300",
                    isSidebarCollapsed ? "lg:ml-24" : "lg:ml-84"
                )}
            >
                {/* Mobile Header */}
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
                    <Link href="/dashboard">
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

                {/* Desktop Header */}
                <Suspense fallback={<div className="h-16">Loading header...</div>}>
                    <div className="hidden lg:block">
                        <TopHeader
                            onSidebarToggle={handleSidebarToggle}
                            isSidebarCollapsed={isSidebarCollapsed}
                        />
                    </div>
                </Suspense>

                {/* Breadcrumbs (desktop only) */}
                {/* <Breadcrumbs /> */}

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto overflow-x-hidden bg-brand-body p-4 lg:p-6">
                    {children}
                </main>
            </div>

            {/* Chat Widget - Bottom Right */}
            <ChatWrapper />
        </div>
    );
}