"use client";

import React from "react";
import { cn } from "@/lib/utils";
import DashboardCard from "../DashboardCard";

interface MenuItemProps {
  label: string;
  iconClass: string;
  active?: boolean;
}

const MenuItem = ({ label, iconClass, active }: MenuItemProps) => (
  <button className={cn(
    "w-full flex items-center justify-between p-5 rounded-2xl transition-all duration-300 group border border-transparent",
    active ? "bg-white shadow-xl shadow-gray-200/50 border-gray-100" : "hover:bg-gray-50"
  )}>
    <div className="flex items-center gap-4">
      <div className={cn(
        "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
        active ? "bg-primary/5 text-primary" : "bg-gray-50 text-gray-400 group-hover:text-primary group-hover:bg-primary/5"
      )}>
        <i className={cn("fi text-lg", iconClass)} />
      </div>
      <span className={cn(
        "font-semibold text-base transition-colors",
        active ? "text-gray-900" : "text-gray-500 group-hover:text-gray-900"
      )}>
        {label}
      </span>
    </div>
    <i className={cn(
      "fi fi-rr-angle-small-right text-xl transition-all",
      active ? "text-primary translate-x-1" : "text-gray-300 group-hover:text-primary group-hover:translate-x-1"
    )} />
  </button>
);

export const OrgSideMenu = () => {
  return (
    <div className="space-y-4">
      <MenuItem label="Certifications" iconClass="fi-rr-shield-check" />
      <MenuItem label="Awards" iconClass="fi-rr-trophy" />
      <MenuItem label="Documents" iconClass="fi-rr-document" />
    </div>
  );
};

export default OrgSideMenu;
