"use client";

import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { PlusCircle } from "lucide-react";

interface OrgHeaderProps {
  name: string;
  description: string;
  registrationNumber: string;
  logo?: string;
}

export const OrgHeader = ({
  name,
  description,
  registrationNumber,
  logo
}: OrgHeaderProps) => {
  return (
    <div className="bg-[#0f172a] rounded-[20px] p-8 text-white shadow-2xl relative overflow-hidden">
      {/* Glow Effect */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] -mr-32 -mt-32" />
      
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
        {/* Logo Container */}
        <div className="bg-white rounded-[10px] p-4 w-24 h-24 flex items-center justify-center shadow-lg shrink-0">
          <div className="relative w-full h-full flex items-center justify-center">
             {/* Abstract building icon as fallback logo since we don't have the image file */}
             <i className="fi fi-rr-building text-5xl text-[#3b82f6]" />
          </div>
        </div>

        {/* Info Section */}
        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{name}</h1>
            <div className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-1.5 rounded-[10px] text-sm font-medium tracking-wide">
              {registrationNumber}
            </div>
          </div>
          
          <p className="text-gray-400 text-lg leading-relaxed mb-8">
            {description}
          </p>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
            <button className="flex items-center gap-2 bg-white/5 hover:bg-white/10 transition-colors border border-white/20 px-6 py-3 rounded-xl text-sm font-semibold">
              <PlusCircle/>
              Chat with Org
            </button>
            <button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 transition-colors border border-white/20 px-6 py-3 rounded-xl text-sm font-semibold">
              Assign Engagement
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrgHeader;
