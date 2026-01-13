"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import { FileText, Plus } from "lucide-react";

interface GrantsHeaderProps {
  onStartRequest: () => void;
}

export default function GrantsHeader({ onStartRequest }: GrantsHeaderProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-primary-color-new p-7 rounded-2xl text-light mb-5">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          Grants & Incentives
        </h1>
        <p className=" mt-1">
          Find grants and request support in minutes.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Button variant={"outline"} className="text-dark">
          <FileText className="w-4 h-4" />
          View my requests
        </Button>
        <Button 
          variant={"outline"}
          className="text-dark"
          onClick={onStartRequest}
        >
          <Plus className="w-4 h-4" />
          Request support
        </Button>
      </div>
    </div>
  );
}
