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
import NavigationLoading from "@/components/NavigationLoading";
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
            />

            {/* Overlay for mobile */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 backdrop-blur-sm z-40 lg:hidden"
                    style={{ backgroundColor: `hsl(var(--sidebar-background) / 0.2)` }}
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}

            {/* Mobile Sidebar */}
            <div
                className={cn(
                    "fixed inset-y-0 left-0 z-50 w-4/6 transform transition-transform duration-300 ease-in-out overflow-auto lg:hidden",
                    isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                )}
                style={{
                    backgroundColor: `hsl(var(--sidebar-background))`,
                    color: `hsl(var(--sidebar-foreground))`,
                }}
            >
                <div className="flex justify-between items-center p-4 border-b" style={{ borderColor: `hsl(var(--sidebar-border))` }}>
                    <Link href="/dashboard">
                        <Image
                            src="/logo.svg"
                            alt="Logo"
                            width={120}
                            height={40}
                            className="object-contain"
                        />
                    </Link>
                    <button
                        className="text-[hsl(var(--sidebar-foreground))] text-xl cursor-pointer p-2 rounded-lg hover:bg-[hsl(var(--sidebar-hover))]"
                        aria-label="Close sidebar"
                        onClick={() => setIsSidebarOpen(false)}
                    >
                        <i className="fi fi-br-cross"></i>
                    </button>
                </div>

                <div className="flex flex-col shrink-0 overflow-scroll min-h-[95vh]">
                    <div className="scrollarea grow overflow-scroll p-4">
                        <SidebarMenu menu={menuData} isCollapsed={false} />
                    </div>
                    <div className="p-4 border-t" style={{ borderColor: `hsl(var(--sidebar-border))` }}>
                        <UserMenu isCollapsed={false} />
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div
                className={cn(
                    "flex-1 flex flex-col overflow-hidden transition-all duration-300",
                    isSidebarCollapsed ? "lg:ml-24" : "lg:ml-[21rem]"
                )}
            >
                {/* Mobile Header */}
                <header
                    className="lg:hidden sticky top-0 z-10 bg-[hsl(var(--background))] border-b backdrop-blur-xl flex justify-between items-center px-4 py-4"
                    style={{ borderColor: `hsl(var(--border))` }}
                >
                    <button
                        className="text-[hsl(var(--foreground))] text-2xl cursor-pointer p-2 rounded-lg hover:bg-[hsl(var(--muted))]"
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
                <Breadcrumbs />

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto overflow-x-hidden bg-brand-body p-4 lg:p-6">
                    {children}
                </main>
            </div>

            {/* Chat Widget - Bottom Right */}
            <ChatWrapper />
            
            {/* Navigation Loading Overlay */}
            <NavigationLoading />
        </div>
    );
}