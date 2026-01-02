"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { MenuItem } from "@/lib/menuData";
import { HugeiconsIcon } from "@hugeicons/react";

export default function SidebarMenu({ menu }: { menu: MenuItem[] }) {
    const [openItems, setOpenItems] = useState<Record<string, boolean>>({});
    const pathname = usePathname();

    const toggleItem = (slug: string) => {
        setOpenItems((prev) => ({
            ...prev,
            [slug]: !prev[slug],
        }));
    };

    return (
        <ul className="menu">
            {menu.map((item) => {
                const hasChildren = item.children && item.children.length > 0;
                const isOpen = openItems[item.slug];
                const isActive = pathname === item.href;
                const hasActiveChild = item.children?.some((child) => pathname === child.href);

                return (
                    <li
                        key={item.slug}
                        className={`sidebar-item ${isOpen ? "open" : ""} ${hasChildren ? "has-children" : ""} ${isActive || hasActiveChild ? "active" : ""
                            }`}
                    >
                        <div className="sidebar-item flex items-center gap-2">
                            <Link href={item.href}
                                className={`flex-1 flex items-center gap-2 p-2 hover:text-sky-600 rounded-lg ${isActive ? 'text-sky-600' : 'text-gray-700 hover:bg-gray-100'}`}>
                                <HugeiconsIcon icon={item.icon} className="w-6 h-6" />
                                <span className="flex-1 text-base font-normal">{item.label}</span>
                            </Link>
                            {hasChildren && (
                                <i
                                    className={`${isOpen ? "fi fi-br-angle-up" : "fi fi-br-angle-down"} arrows`}
                                    onClick={() => toggleItem(item.slug)}
                                />
                            )}
                        </div>

                        {hasChildren && isOpen && item.children && (
                            <ul className="mt-1 space-y-1 bg-gradient-to-r from-blue-100 to-blue-100/50 backdrop-blur[10px] border border-blue-200/50 rounded-[16px]">
                                {item.children.map((child) => {
                                    const isChildActive = pathname === child.href;
                                    return (
                                        <li key={child.label} className={isChildActive ? "active_submenu" : ""}>
                                            <Link
                                                href={child.href}
                                                className="flex items-center !gap-2 text-gray-600 hover:underline hover:!text-sky-800"
                                            >
                                                <HugeiconsIcon icon={child.icon} className="w-4.5 h-4.5" />
                                                <span className="text-sm font-normal">{child.label}</span>
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </li>
                );
            })}
        </ul>
    );
}
