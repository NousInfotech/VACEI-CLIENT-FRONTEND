"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAuth } from "../app/hooks/useAuth";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface UserMenuProps {
    isCollapsed?: boolean;
}

export default function UserMenu({ isCollapsed = false }: UserMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [dropUp, setDropUp] = useState(false);
    const [userName, setUserName] = useState("User");
    const [userEmail, setUserEmail] = useState("Email");

    const buttonRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLUListElement>(null);
    const { logout } = useAuth();
    const pathname = usePathname();

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    const handleLogout = async () => {
        setIsOpen(false);
        await logout();
    };

    // Close dropdown whenever pathname changes
    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

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

    useEffect(() => {
        if (isOpen && buttonRef.current && menuRef.current) {
            const buttonRect = buttonRef.current.getBoundingClientRect();
            const menuHeight = menuRef.current.offsetHeight;
            const spaceBelow = window.innerHeight - buttonRect.bottom;
            setDropUp(spaceBelow < menuHeight + 10);
        }
    }, [isOpen]);

    return (
        <div className="relative">
            <div
                className={cn(
                    "border rounded-2xl",
                    isCollapsed ? "p-2" : "p-4"
                )}
                style={{
                    backgroundColor: `hsl(var(--sidebar-hover))`,
                    borderColor: `hsl(var(--sidebar-border))`
                }}
            >
                <button
                    ref={buttonRef}
                    onClick={toggleDropdown}
                    className={cn(
                        "flex items-center w-full cursor-pointer",
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
                            <div className="flex items-center gap-1 mt-1">
                                <div className="w-1.5 h-1.5 bg-sidebar-background0 rounded-full animate-pulse"></div>
                                <span 
                                    className="text-xs opacity-70"
                                    style={{ color: `hsl(var(--sidebar-foreground))` }}
                                >
                                    Online
                                </span>
                            </div>
                        </div>
                    )}
                </button>

                {isOpen && (
                    <ul
                        ref={menuRef}
                        className={cn(
                            "absolute left-0 right-0 rounded-2xl shadow-lg z-50 text-sm overflow-hidden transition-all border",
                            dropUp ? "bottom-full mb-2" : "top-full mt-2"
                        )}
                        style={{
                            backgroundColor: `hsl(var(--sidebar-hover))`,
                            borderColor: `hsl(var(--sidebar-border))`
                        }}
                    >
                        <li>
                            <Link
                                href="/dashboard/profile"
                                className="block px-4 py-3 hover:bg-[hsl(var(--sidebar-active))] transition-colors"
                                style={{ color: `hsl(var(--sidebar-foreground))` }}
                                onClick={() => setIsOpen(false)}
                            >
                                Profile
                            </Link>
                        </li>
                        <li>
                            <button
                                onClick={handleLogout}
                                className="block w-full text-left px-4 py-3 hover:bg-red-900/20 transition-colors text-red-400 hover:text-red-300"
                            >
                                Logout
                            </button>
                        </li>
                    </ul>
                )}
            </div>
        </div>
    );
}
