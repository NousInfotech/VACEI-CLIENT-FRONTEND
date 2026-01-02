"use client";

import Link from "next/link";
import Image from "next/image";
import SidebarMenu from "@/components/SidebarMenu";
import { menuData } from "@/lib/menuData";
import UserMenu from "@/components/UserMenu";
import AccountSelector from "@/components/AccountSelector";
export default function Sidebar() {

    return (
        <>
            <section
                className="sidebar sticky top-0 flex-col shrink-0 hidden lg:flex w-64 bg-gradient-to-r from-white/80 to-blue-100/50 backdrop-blur[10px] border border-blue-200/50 rounded-[16px] py-3 px-4 overflow-hidden">
                <div className="navigation logo p-4">
                    <Link href="/dashboard">
                        <Image
                            src="/logo.svg"
                            alt="Logo"
                            width={150}
                            height={20}
                        />
                    </Link>
                </div>

                <div className="scrollarea grow">
                   {/*   <AccountSelector/> */}
                    <SidebarMenu menu={menuData}/>
                    <hr className="divider mt-2"/>
                </div>

                <UserMenu/>
            </section>
        </>
    );
}
