"use client";

import React from 'react';
import { Search, Filter, ChevronDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Dropdown from "@/components/Dropdown";
import PillTabs from "@/components/shared/PillTabs";
import { GRANTS_TABS } from "./data";

interface GrantsFiltersProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedProvider: string;
  setSelectedProvider: (provider: string) => void;
  selectedDeadline: string;
  setSelectedDeadline: (deadline: string) => void;
  selectedBeneficiary: string;
  setSelectedBeneficiary: (beneficiary: string) => void;
  selectedFundingType: string;
  setSelectedFundingType: (type: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  hasActiveFilters: boolean;
  handleClearFilters: () => void;
}

export default function GrantsFilters({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  selectedProvider,
  setSelectedProvider,
  selectedDeadline,
  setSelectedDeadline,
  selectedBeneficiary,
  setSelectedBeneficiary,
  selectedFundingType,
  setSelectedFundingType,
  sortBy,
  setSortBy,
  hasActiveFilters,
  handleClearFilters
}: GrantsFiltersProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <PillTabs 
          tabs={GRANTS_TABS} 
          activeTab={activeTab} 
          onTabChange={setActiveTab}
          className='border border-gray-300'
        />
        
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search grants..." 
            className="pl-10 rounded-xl border border-gray-300 h-11"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 py-2 border-y border-border/50">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mr-1">
          <Filter className="w-4 h-4" />
          <span className="font-medium">Filters:</span>
        </div>
        
        <Dropdown 
          label="Provider" 
          className="w-full md:w-auto"
          trigger={
            <Button variant="outline" className="w-full md:w-auto h-9 justify-between rounded-xl text-sm">
              {selectedProvider === "All" ? "Provider" : selectedProvider} 
              <ChevronDown className="ml-1 w-4 h-4 opacity-50" />
            </Button>
          }
          items={[
            { id: "All", label: "All", onClick: () => setSelectedProvider("All") },
            { id: "Malta Enterprise", label: "Malta Enterprise", onClick: () => setSelectedProvider("Malta Enterprise") },
            { id: "JobsPlus", label: "JobsPlus", onClick: () => setSelectedProvider("JobsPlus") },
            { id: "Ministry for Economy", label: "Ministry for Economy", onClick: () => setSelectedProvider("Ministry for Economy") }
          ]}
        />
        <Dropdown 
          label="Deadline" 
          className="w-full md:w-auto"
          trigger={
            <Button variant="outline" className="w-full md:w-auto h-9 justify-between rounded-xl text-sm">
              {selectedDeadline === "All" ? "Deadline" : selectedDeadline} 
              <ChevronDown className="ml-1 w-4 h-4 opacity-50" />
            </Button>
          }
          items={[
            { id: "All", label: "All", onClick: () => setSelectedDeadline("All") },
            { id: "Open", label: "Open", onClick: () => setSelectedDeadline("Open") },
            { id: "Closing soon", label: "Closing soon", onClick: () => setSelectedDeadline("Closing soon") }
          ]}
        />
        <Dropdown 
          label="Beneficiary" 
          className="w-full md:w-auto"
          trigger={
            <Button variant="outline" className="w-full md:w-auto h-9 justify-between rounded-xl text-sm">
              {selectedBeneficiary === "All" ? "Beneficiary" : selectedBeneficiary} 
              <ChevronDown className="ml-1 w-4 h-4 opacity-50" />
            </Button>
          }
          items={[
            { id: "All", label: "All", onClick: () => setSelectedBeneficiary("All") },
            { id: "Business", label: "Business", onClick: () => setSelectedBeneficiary("Business") },
            { id: "Individual", label: "Individual", onClick: () => setSelectedBeneficiary("Individual") }
          ]}
        />
        <Dropdown 
          label="Funding Type" 
          className="w-full md:w-auto"
          trigger={
            <Button variant="outline" className="w-full md:w-auto h-9 justify-between rounded-xl text-sm">
              {selectedFundingType === "All" ? "Funding Type" : selectedFundingType} 
              <ChevronDown className="ml-1 w-4 h-4 opacity-50" />
            </Button>
          }
          items={[
            { id: "All", label: "All", onClick: () => setSelectedFundingType("All") },
            { id: "Grant", label: "Grant", onClick: () => setSelectedFundingType("Grant") },
            { id: "Tax Credit", label: "Tax Credit", onClick: () => setSelectedFundingType("Tax Credit") },
            { id: "Scheme", label: "Scheme", onClick: () => setSelectedFundingType("Scheme") }
          ]}
        />
       
        {hasActiveFilters && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleClearFilters}
            className="h-8 px-2 text-xs text-primary hover:bg-primary/10 rounded-lg flex items-center gap-1 group"
          >
            <X className="w-3 h-3 transition-transform group-hover:rotate-90" />
            Clear
          </Button>
        )}
        <div className="ml-auto flex items-center gap-2">
          <span className="text-sm text-muted-foreground font-medium">Sort:</span>
          <Dropdown 
            label="Sort by" 
            className="w-full md:w-auto"
            trigger={
              <Button variant="outline" className="w-full md:w-auto h-9 justify-between rounded-xl text-sm font-medium">
                {sortBy} 
                <ChevronDown className="ml-1 w-4 h-4 opacity-50" />
              </Button>
            }
            items={[
              { id: "Newest", label: "Newest", onClick: () => setSortBy("Newest") },
              { id: "Closing soon", label: "Closing soon", onClick: () => setSortBy("Closing soon") },
              { id: "Highest funding", label: "Highest funding", onClick: () => setSortBy("Highest funding") }
            ]}
          />
        </div>
      </div>
    </div>
  );
}
