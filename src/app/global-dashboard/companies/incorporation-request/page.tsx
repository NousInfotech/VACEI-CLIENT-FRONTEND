"use client";

import { useRouter } from "next/navigation";
import { useActiveCompany } from "@/context/ActiveCompanyContext";
import PageHeader from "@/components/shared/PageHeader";
import DashboardCard from "@/components/DashboardCard";
import ServiceRequestForm from "@/components/services/ServiceRequestForm";
import { toast } from "sonner";
import { Building2 } from "lucide-react";

export default function IncorporationRequestPage() {
    const router = useRouter();
    const { activeCompanyId, companies } = useActiveCompany();

    const activeCompanyName = companies.find(c => c.id === activeCompanyId)?.name;

    const handleSuccess = () => {
        toast.success("Created");
        setTimeout(() => {
            router.push('/global-dashboard/companies');
        }, 1500);
    };

    return (
        <section className="mx-auto w-full p-5 space-y-6">

            <PageHeader 
                title="Incorporation Request"
                subtitle="Provide the necessary details for your company incorporation."
                activeCompany={activeCompanyName}
                icon={Building2}
            />

            <DashboardCard className="p-8">
                <div className="mx-auto">
                    <ServiceRequestForm 
                        service="INCORPORATION"
                        companyId={activeCompanyId}
                        onSuccess={handleSuccess}
                        serviceLabel="Incorporation"
                    />
                </div>
            </DashboardCard>
        </section>
    );
}
