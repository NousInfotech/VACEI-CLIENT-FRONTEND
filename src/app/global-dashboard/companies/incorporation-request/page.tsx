"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useActiveCompany } from "@/context/ActiveCompanyContext";
import PageHeader from "@/components/shared/PageHeader";
import DashboardCard from "@/components/DashboardCard";
import ServiceRequestForm from "@/components/services/ServiceRequestForm";
import { SuccessModal } from "@/components/ui/SuccessModal";
import { Building2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function IncorporationRequestPage() {
    const router = useRouter();
    const { activeCompanyId, companies } = useActiveCompany();
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const activeCompanyName = companies.find(c => c.id === activeCompanyId)?.name;

    const handleSuccess = () => {
        setShowSuccessModal(true);
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

            <SuccessModal 
                isOpen={showSuccessModal}
                onClose={() => setShowSuccessModal(false)}
                title="Request Submitted!"
                message="Your incorporation request has been submitted successfully. Our team will review it and get back to you shortly."
                buttonText="View Companies"
                onAction={() => router.push('/global-dashboard/companies')}
            />
        </section>
    );
}
