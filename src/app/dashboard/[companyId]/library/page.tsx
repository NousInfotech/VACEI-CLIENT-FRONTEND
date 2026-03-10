"use client";

import { Library, Building2 } from "lucide-react";
import Link from "next/link";
import PageHeader from "@/components/shared/PageHeader";
import { LibraryExplorer } from "@/components/library/LibraryExplorer";
import { useActiveCompany } from "@/context/ActiveCompanyContext";
import { Button } from "@/components/ui/button";

export default function CompanyLibraryPage() {
  const { activeCompanyId, companies } = useActiveCompany();
  const activeCompany = activeCompanyId ? companies.find((c) => c.id === activeCompanyId) : null;

  if (!activeCompanyId) {
    return (
      <div className="space-y-8">
        <PageHeader
          title="Library"
          subtitle="Select a company to view its documents."
          icon={Library}
        />
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <Building2 className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-600 font-medium mb-2">No company selected</p>
          <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
            Choose a company from the dropdown in the header, or go to the dashboard and open a company, then open Library to see that company&apos;s documents only.
          </p>
          <Button asChild variant="outline" className="rounded-xl">
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] overflow-hidden gap-5">
      <PageHeader
        title={activeCompany ? `${activeCompany.name} – Library` : "Library"}
        subtitle={
          activeCompany
            ? `Documents and files for ${activeCompany.name} only.`
            : "Documents and files for the selected company."
        }
        icon={Library}
      />

      <div className="flex-1 rounded-2xl min-h-0 bg-white border-t border-gray-200">
        <LibraryExplorer useApi={true} companyId={activeCompanyId} />
      </div>
    </div> 
  );
}

