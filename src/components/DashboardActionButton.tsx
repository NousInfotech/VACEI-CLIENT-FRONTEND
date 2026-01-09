"use client";
import { LucideIcon, ArrowRight } from "lucide-react";

interface DashboardActionButtonProps {
  Icon: LucideIcon;
  title: string;
  subtitle: string;
  onClick?: () => void;
  showArrow?: boolean;
  className?: string;
}

export const DashboardActionButton = ({
  Icon,
  title,
  subtitle,
  onClick,
  showArrow = true,
  className = "",
}: DashboardActionButtonProps) => {
  return (
    <div
      onClick={onClick}
      className={`group cursor-pointer bg-gray-900 hover:bg-black text-white rounded-2xl p-4 flex items-center gap-4 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${className}`}
    >
      <div className="bg-white/10 rounded-xl p-3 group-hover:bg-white/20 transition-colors">
        <Icon className="w-6 h-6" />
      </div>
      <div className="pr-4 flex-1">
        <p className="text-sm font-bold text-white/90 leading-tight">{title}</p>
        <p className="text-xs text-white/60 mt-0.5">{subtitle}</p>
      </div>
      {showArrow && (
        <ArrowRight className="w-5 h-5 text-white/40 group-hover:text-white transition-all group-hover:translate-x-1" />
      )}
    </div>
  );
};

export default DashboardActionButton;
