"use client";

import React from "react";
import PageHeader from "@/components/shared/PageHeader";
import { OrganizationCard } from "@/components/organization/OrganizationCard";
import { mockOrganizations } from "@/data/mockOrganizations";

export default function OrganizationListPage() {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Organizations" 
        description="View and manage organizations available in the portal."
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockOrganizations.map((org) => (
          <OrganizationCard
            key={org.id}
            id={org.id}
            name={org.name}
            registrationNumber={org.registrationNumber}
          />
        ))}
      </div>
    </div>
  );
}
