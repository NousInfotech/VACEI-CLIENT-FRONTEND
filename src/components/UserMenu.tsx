"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAuth } from "../app/hooks/useAuth"; // Adjust the path if needed
import { usePathname } from "next/navigation";

export default function UserMenu() {
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
        <div className="relative inline-block text-left p-2.5">
            <div
                className="bg-red-50 rounded-[10px] py-6 ps-5 pe-1.5"
                style={{
                    backgroundImage: "url('/user-menu-bg.jpg')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                }}
            >
                <button
                    ref={buttonRef}
                    onClick={toggleDropdown}
                    className="dropdown-toggle user_setting_menu flex gap-2.5 w-full p-0 cursor-pointer items-center text-white"
                >
                    <img src="/user.png" className="w-10 h-10" alt="{userName}"/>
                    <div className="text-start overflow-hidden"> {/* Add overflow-hidden here */}
                       <span className="block capitalize font-semibold">{userName}</span>
                        <span className="block font-normal truncate">{userEmail}</span> {/* Add truncate here */}
                    </div>
                </button>

                {isOpen && (
                    <ul
                        ref={menuRef}
                        className={`absolute right-4 bg-primary text-white rounded-md shadow-lg z-50 w-48 text-sm overflow-hidden transition-all ${
                            dropUp ? "bottom-full -mb-2" : "top-full mt-2"
                        }`}
                    >
                        <li>
                            <Link
                                href="/dashboard/profile"
                                className="dropdown-item text-white block px-4 py-2"
                            >
                                Profile
                            </Link>
                        </li>
                        <li>
                            <button
                                onClick={handleLogout}
                                className="dropdown-item block w-full text-left px-4 py-2 hover:bg-gray-700"
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
