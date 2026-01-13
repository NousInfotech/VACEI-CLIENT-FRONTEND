"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Search } from "lucide-react";
import DashboardCard from "@/components/DashboardCard";

// Modular Components
import GrantsHeader from "@/components/services/grants/GrantsHeader";
import GrantsFilters from "@/components/services/grants/GrantsFilters";
import GrantCard from "@/components/services/grants/GrantCard";
import MyRequestsPanel from "@/components/services/grants/MyRequestsPanel";

// Data & Types
import { MOCK_GRANTS, MOCK_REQUESTS } from "@/components/services/grants/data";
import { useTabQuery } from "@/hooks/useTabQuery";
import { Button } from "@/components/ui/button";

export default function GrantsIncentivesPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useTabQuery("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProvider, setSelectedProvider] = useState<string>("All");
  const [selectedDeadline, setSelectedDeadline] = useState<string>("All");
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<string>("All");
  const [selectedFundingType, setSelectedFundingType] = useState<string>("All");
  const [sortBy, setSortBy] = useState<string>("Newest");

  const hasActiveFilters = useMemo(() => {
    return searchQuery !== "" || 
           selectedProvider !== "All" || 
           selectedDeadline !== "All" || 
           selectedBeneficiary !== "All" || 
           selectedFundingType !== "All" || 
           activeTab !== "All";
  }, [searchQuery, selectedProvider, selectedDeadline, selectedBeneficiary, selectedFundingType, activeTab]);

  const filteredGrants = useMemo(() => {
    let result = MOCK_GRANTS.filter(grant => {
      const matchesTab = activeTab === "All" || grant.category === activeTab;
      const matchesSearch = grant.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          grant.provider.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesProvider = selectedProvider === "All" || grant.provider === selectedProvider;
      const matchesBeneficiary = selectedBeneficiary === "All" || grant.beneficiary === selectedBeneficiary;
      const matchesFundingType = selectedFundingType === "All" || grant.fundingType === selectedFundingType;
      
      let matchesDeadline = true;
      if (selectedDeadline === "Open") {
        matchesDeadline = grant.deadline === "Ongoing" || (!!grant.deadline && new Date(grant.deadline) > new Date());
      } else if (selectedDeadline === "Closing soon") {
        if (grant.deadline === "Ongoing") matchesDeadline = false;
        else if (grant.deadline) {
          const deadlineDate = new Date(grant.deadline);
          const now = new Date();
          const soon = new Date();
          soon.setDate(now.getDate() + 30);
          matchesDeadline = deadlineDate > now && deadlineDate < soon;
        } else {
          matchesDeadline = false;
        }
      }

      return matchesTab && matchesSearch && matchesProvider && matchesBeneficiary && matchesFundingType && matchesDeadline;
    });

    // Sort result
    if (sortBy === "Newest") {
      result.sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime());
    } else if (sortBy === "Closing soon") {
      result.sort((a, b) => {
        if (a.deadline === "Ongoing") return 1;
        if (b.deadline === "Ongoing") return -1;
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      });
    } else if (sortBy === "Highest funding") {
      result.sort((a, b) => {
        const getVal = (s?: string) => {
          if (!s) return 0;
          const match = s.match(/[\d,]+/);
          return match ? parseInt(match[0].replace(/,/g, '')) : 0;
        }
        return getVal(b.fundingAmount) - getVal(a.fundingAmount);
      });
    }

    return result;
  }, [activeTab, searchQuery, selectedProvider, selectedDeadline, selectedBeneficiary, selectedFundingType, sortBy]);

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedProvider("All");
    setSelectedDeadline("All");
    setSelectedBeneficiary("All");
    setSelectedFundingType("All");
    setSortBy("Newest");
    setActiveTab("All");
  };

  const handleGlobalRequest = () => {
    // Navigate to the first grant by default or an expert recommendation page
    router.push(`/dashboard/services/grants-incentives/${MOCK_GRANTS[0].id}`);
  };

  return (
    <section className="mx-auto max-w-[1400px] w-full pt-5 px-4 md:px-6 space-y-3 pb-10">
      {/* Back Button */}
      <div className="flex items-center">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-brand-body transition-colors group"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted/50 group-hover:bg-muted transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </div>
          <span className="font-medium">Back</span>
        </button>
      </div>

      <GrantsHeader onStartRequest={handleGlobalRequest} />

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr,320px] gap-8">
        
        <div className="space-y-6">
          <GrantsFilters 
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedProvider={selectedProvider}
            setSelectedProvider={setSelectedProvider}
            selectedDeadline={selectedDeadline}
            setSelectedDeadline={setSelectedDeadline}
            selectedBeneficiary={selectedBeneficiary}
            setSelectedBeneficiary={setSelectedBeneficiary}
            selectedFundingType={selectedFundingType}
            setSelectedFundingType={setSelectedFundingType}
            sortBy={sortBy}
            setSortBy={setSortBy}
            hasActiveFilters={hasActiveFilters}
            handleClearFilters={handleClearFilters}
          />

          {/* Grant Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredGrants.length > 0 ? (
              filteredGrants.map(grant => (
                <GrantCard 
                  key={grant.id} 
                  grant={grant} 
                />
              ))
            ) : (
              <DashboardCard className="col-span-full py-16 flex flex-col items-center justify-center text-center space-y-4 border-dashed">
                <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center">
                  <Search className="w-8 h-8 text-muted-foreground opacity-50" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-brand-body">No grants found</h3>
                  <p className="text-muted-foreground max-w-xs mx-auto mt-1 text-sm">
                    We couldn't find any grants matching your current filters. Try adjusting your search or filters.
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  onClick={handleClearFilters}
                  className="rounded-xl h-11 px-6 font-bold border-primary/20 text-primary"
                >
                  Clear all filters
                </Button>
              </DashboardCard>
            )}
          </div>
        </div>

        {/* Right Panel - My Grant Requests */}
        <aside className="space-y-6">
          <MyRequestsPanel requests={MOCK_REQUESTS} />
        </aside>
      </div>
    </section>
  );
}
