"use client";

import React from "react";
import DashboardCard from "@/components/DashboardCard";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface OrganizationCardProps {
  id: string;
  name: string;
  registrationNumber: string;
  className?: string;
}

export const OrganizationCard = ({
  id,
  name,
  registrationNumber,
  className,
}: OrganizationCardProps) => {
  return (
    <DashboardCard className={cn("p-6 flex flex-col gap-4 hover:shadow-xl transition-all duration-300", className)}>
      <div className="flex justify-between items-start">
        <div className="bg-muted w-12 h-12 rounded-xl flex items-center justify-center">
            <i className="fi fi-rr-building text-2xl text-primary" />
        </div>
        <div className="bg-primary/5 text-primary text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">
          {registrationNumber}
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{name}</h3>
      </div>

      <div className="pt-4 border-t border-gray-100">
        <Link 
          href={`/dashboard/organization/${id}`}
          className="bg-primary w-full flex items-center justify-center text-white text-xs font-bold px-6 py-2.5 rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
        >
          View
        </Link>
      </div>
    </DashboardCard>
  );
};

export default OrganizationCard;
