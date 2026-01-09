"use client";
import { ReactNode } from "react";

interface DashboardCardProps {
  children?: ReactNode;
  className?: string;
  animate?: boolean;
  hover?: boolean;
}

export const DashboardCard = ({ 
  children, 
  className = "", 
  animate = false, 
}: DashboardCardProps) => {
  const hasBg = className.includes("bg-");

  const baseStyles = `${!hasBg ? "bg-white/80" : ""} border border-white/50 rounded-2xl backdrop-blur-md shadow-lg shadow-gray-300/30 transition-all duration-300`;
  const animationStyles = animate ? "animate-slide-in-right" : "";
 
  return (
    <div className={`${baseStyles} ${animationStyles} ${className}`}>
      {children}
    </div>
  );
};

export default DashboardCard;
