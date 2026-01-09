"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAuth } from "../app/hooks/useAuth";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface UserMenuProps {
    isCollapsed?: boolean;
}

import Dropdown from "./Dropdown";

interface UserMenuProps {
    isCollapsed?: boolean;
}

export default function UserMenu({ isCollapsed = false }: UserMenuProps) {
    const [userName, setUserName] = useState("User");
    const [userEmail, setUserEmail] = useState("Email");

    const { logout } = useAuth();
    const pathname = usePathname();

    const handleLogout = async () => {
        await logout();
    };

    useEffect(() => {
           const nameFromStorage = localStorage.getItem("username")
               ? atob(localStorage.getItem("username")!)
               : null;
           const emailFromStorage = localStorage.getItem("email")
               ? atob(localStorage.getItem("email")!)
               : null;
           if (nameFromStorage) {
               setUserName(nameFromStorage);
           }
           if (emailFromStorage) {
               setUserEmail(emailFromStorage);
           }
       }, []);

    const userMenuItems = [
        {
            id: "profile",
            label: "Profile",
            onClick: () => { window.location.href = "/dashboard/profile"; }
        },
        {
            id: "logout",
            label: "Logout",
            destructive: true,
            onClick: handleLogout
        }
    ];

    return (
        <Dropdown
            side="top"
            align="left"
            className="w-full"
            contentClassName="w-full mb-2"
            trigger={
                <div
                    className={cn(
                        "border rounded-2xl p-4 w-full cursor-pointer transition-all hover:bg-white/10",
                        isCollapsed ? "p-2" : "p-4"
                    )}
                    style={{
                        backgroundColor: `hsl(var(--sidebar-hover))`,
                        borderColor: `hsl(var(--sidebar-border))`
                    }}
                >
                    <div
                        className={cn(
                            "flex items-center w-full",
                            isCollapsed ? "justify-center" : "gap-3"
                        )}
                    >
                        <div className="relative">
                            <div 
                                className={cn(
                                    "rounded-2xl flex items-center justify-center",
                                    isCollapsed ? "w-8 h-8" : "w-10 h-10"
                                )}
                                style={{ backgroundColor: `hsl(var(--accent))` }}
                            >
                                <span 
                                    className={cn(
                                        "font-bold",
                                        isCollapsed ? "text-xs" : "text-sm"
                                    )}
                                    style={{ color: `hsl(var(--accent-foreground))` }}
                                >
                                    {userName?.charAt(0)?.toUpperCase() || 'U'}
                                </span>
                            </div>
                            <div 
                                className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-sidebar-background0 rounded-full border-2"
                                style={{ borderColor: `hsl(var(--sidebar-background))` }}
                            ></div>
                        </div>

                        {!isCollapsed && (
                            <div className="flex-1 min-w-0 text-left">
                                <p 
                                    className="text-sm font-semibold truncate"
                                    style={{ color: `hsl(var(--sidebar-foreground))` }}
                                >
                                    {userName}
                                </p>
                                <p 
                                    className="text-xs truncate opacity-70"
                                    style={{ color: `hsl(var(--sidebar-foreground))` }}
                                >
                                    {userEmail}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            }
            items={userMenuItems}
        />
    );
}
