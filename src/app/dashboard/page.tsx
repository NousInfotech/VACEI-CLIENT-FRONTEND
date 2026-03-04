"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useActiveCompany } from "@/context/ActiveCompanyContext";

export default function DashboardRootRedirect() {
    const router = useRouter();
    const { activeCompanyId, loading } = useActiveCompany();

    useEffect(() => {
        if (!loading) {
            if (activeCompanyId) {
                router.replace(`/dashboard/${activeCompanyId}`);
            } else {
                router.replace("/global-dashboard/companies");
            }
        }
    }, [activeCompanyId, loading, router]);

    return (
        <div className="flex items-center justify-center h-screen bg-brand-body">
            <div className="animate-pulse text-gray-400">Loading your dashboard...</div>
        </div>
    );
}
