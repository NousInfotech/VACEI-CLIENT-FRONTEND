"use client";

import React from "react";
import { cn } from "@/lib/utils";
import DashboardCard from "../DashboardCard";

interface StatItemProps {
  label: string;
  value: string | number;
  iconClass: string;
  iconBg: string;
}

const StatItem = ({ label, value, iconClass, iconBg }: StatItemProps) => (
  <DashboardCard className="p-4 flex flex-col items-center justify-center text-center border-none bg-white">
    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110", iconBg)}>
      <i className={cn("fi text-2xl leading-none pt-1", iconClass)} />
    </div>
    <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
    <div className="text-sm font-medium">{label}</div>
  </DashboardCard>
);

interface OrgStatsProps {
  engagements: number;
  clients: number;
  services: number;
  rating: number;
}

export const OrgStats = ({
  engagements,
  clients,
  services,
  rating
}: OrgStatsProps) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
      <StatItem 
        label="Engagements" 
        value={engagements} 
        iconClass="fi-rr-user-md" 
        iconBg="bg-blue-50 text-blue-500" 
      />
      <StatItem 
        label="Clients" 
        value={clients} 
        iconClass="fi-rr-users" 
        iconBg="bg-green-50 text-green-500" 
      />
      <StatItem 
        label="Services" 
        value={services} 
        iconClass="fi-rr-document" 
        iconBg="bg-purple-50 text-purple-500" 
      />
      <StatItem 
        label="Rating" 
        value={rating} 
        iconClass="fi-rr-star" 
        iconBg="bg-orange-50 text-orange-400" 
      />
    </div>
  );
};

export default OrgStats;
