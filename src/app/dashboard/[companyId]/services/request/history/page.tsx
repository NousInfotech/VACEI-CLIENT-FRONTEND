"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/PageHeader";
import DashboardCard from "@/components/DashboardCard";
import { useActiveCompany } from "@/context/ActiveCompanyContext";
import ServiceRequestHistory from "@/components/services/ServiceRequestHistory";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function ServiceRequestHistoryPage() {
    const router = useRouter();
    const { activeCompanyId, companies } = useActiveCompany();
    const [historyRefreshKey] = useState(0);

    const activeCompanyName = companies.find(c => c.id === activeCompanyId)?.name;

    return (
        <section className="mx-auto w-full p-5 space-y-6">
            <PageHeader
                title="Service Request History"
                subtitle="View and track your previous service requests."
                activeCompany={activeCompanyName}
            />

            <DashboardCard className="p-6 space-y-6">
                <div className="pt-2 animate-in fade-in slide-in-from-top-4 duration-500">
                    <ServiceRequestHistory
                        companyId={activeCompanyId}
                        refreshKey={historyRefreshKey}
                    />
                </div>
            </DashboardCard>
        </section>
    );
}
