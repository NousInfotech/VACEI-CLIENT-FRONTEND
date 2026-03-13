"use client";

import React from "react";
import DashboardCard from "../DashboardCard";
import { PlusCircle } from "lucide-react";

interface OrgServicesProps {
  services: string[];
}

export const OrgServices = ({ services }: OrgServicesProps) => {
  return (
    <DashboardCard className="p-8 bg-white border-none shadow-sm h-full">
      <div className="flex items-center gap-3 mb-8">
        <PlusCircle/>
        <h3 className="font-bold text-lg text-gray-900">Services Offered</h3>
      </div>

      <div className="flex flex-wrap gap-3">
        {services.map((service, index) => (
          <div 
            key={index}
            className="text-gray-600 shadow-2xl px-6 py-3 rounded-2xl text-sm font-semibold tracking-wide border border-gray-200 transition-all duration-300 cursor-default"
          >
            {service}
          </div>
        ))}
      </div>
    </DashboardCard>
  );
};

export default OrgServices;
