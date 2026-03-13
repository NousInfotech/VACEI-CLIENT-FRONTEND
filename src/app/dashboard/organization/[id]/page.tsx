"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { mockOrganizations } from "@/data/mockOrganizations";
import OrgHeader from "@/components/organization/OrgHeader";
import OrgStats from "@/components/organization/OrgStats";
import OrgSideMenu from "@/components/organization/OrgSideMenu";
import OrgServices from "@/components/organization/OrgServices";
import DashboardCard from "@/components/DashboardCard";

export default function OrganizationDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const organization = mockOrganizations.find((org) => org.id === id);

  if (!organization) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Organization not found</h2>
        <button 
          onClick={() => router.push("/dashboard/organization")}
          className="bg-primary text-white px-6 py-2 rounded-xl"
        >
          Back to list
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10 max-w-[1600px] mx-auto px-4 lg:px-0">
      {/* Header Section */}
      <OrgHeader 
        name={organization.name}
        description={organization.description}
        registrationNumber={organization.registrationNumber}
      />

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Left Side: Stats and Services */}
        <div className="flex-1 space-y-8 w-full">
          {/* Stats Grid */}
          <OrgStats 
            engagements={organization.engagements}
            clients={organization.clients}
            services={organization.services}
            rating={organization.rating}
          />

          {/* Services Offered */}
          <OrgServices 
            services={organization.servicesOffered}
          />
        </div>

      </div>
    </div>
  );
}
