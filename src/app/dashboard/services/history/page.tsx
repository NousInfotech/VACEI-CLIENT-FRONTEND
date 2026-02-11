"use client";

import { useActiveCompany } from "@/context/ActiveCompanyContext";
import { PageHeader } from "@/components/shared/PageHeader";
import DashboardCard from "@/components/DashboardCard";
import ServiceRequestHistory from "@/components/services/ServiceRequestHistory";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ServiceRequestHistoryPage() {
  const { activeCompanyId, companies } = useActiveCompany();
  const activeCompanyName = companies.find(c => c.id === activeCompanyId)?.name;

  return (
    <section className="mx-auto w-full p-5 space-y-6">
      <PageHeader
        title="Service Request History"
        subtitle="View and track your submitted service requests."
        activeCompany={activeCompanyName}
        actions={
          <Link href="/dashboard/services/request">
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Requests
            </Button>
          </Link>
        }
      />

      <DashboardCard className="p-6">
        <ServiceRequestHistory companyId={activeCompanyId} />
      </DashboardCard>
    </section>
  );
}
