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
  hover = true 
}: DashboardCardProps) => {
  const baseStyles = "bg-white/80 border border-white/50 rounded-2xl backdrop-blur-md shadow-lg shadow-gray-300/30 transition-all duration-300";
  const animationStyles = animate ? "animate-slide-in-right" : "";
  const hoverStyles = hover ? "hover:bg-white/90" : "";

  return (
    <div className={`${baseStyles} ${animationStyles} ${hoverStyles} ${className}`}>
      {children}
    </div>
  );
};

export default DashboardCard;
