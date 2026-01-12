"use client";

import SidebarMenu from "@/components/SidebarMenu";
import { menuData } from "@/lib/menuData";

interface SidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
    isCollapsed?: boolean;
    onExpand?: () => void;
}

/**
 * Sidebar component that acts as a wrapper for SidebarMenu.
 * The new premium design is implemented directly in SidebarMenu.
 */
export default function Sidebar({ isOpen = false, onClose, isCollapsed = false, onExpand }: SidebarProps) {
    return (
        <div className="hidden lg:block">
            <SidebarMenu 
                menu={menuData} 
                isCollapsed={isCollapsed} 
                isOpen={isOpen}
                onClose={onClose}
                onExpand={onExpand}
            />
        </div>
    );
}
