"use client";

import SidebarMenu from "@/components/SidebarMenu";
import { menuData } from "@/lib/menuData";

interface SidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
    isCollapsed?: boolean;
    onExpand?: () => void;
    menu?: any[];
}

/**
 * Sidebar component that acts as a wrapper for SidebarMenu.
 * The new premium design is implemented directly in SidebarMenu.
 */
export default function Sidebar({ isOpen = false, onClose, isCollapsed = false, onExpand, menu }: SidebarProps) {
    // Sidebar should be hidden when hamburger icon is visible
    // Hamburger in TopHeader is visible at md breakpoint and up
    // So sidebar should only be visible at lg breakpoint and up (where hamburger toggles it, not shows it)
    return (
        <div className="hidden lg:block">
            <SidebarMenu 
                menu={menu || menuData} 
                isCollapsed={isCollapsed} 
                isOpen={isOpen}
                onClose={onClose}
                onExpand={onExpand}
            />
        </div>
    );
}
