"use client";

import { Building2 } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import CompanyListTable from "@/components/dashboard/CompanyListTable";

export default function GlobalCompaniesPage() {
    return (
        <div className="space-y-8">
            <PageHeader 
                title="Companies"
                subtitle="Manage and oversee all your business entities."
                icon={Building2}
            />

            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <CompanyListTable />
            </div>
        </div>
    );
}
