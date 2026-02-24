"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { fetchSidebarData, SidebarServiceData } from "@/api/companyService";
import { useActiveCompany } from "./ActiveCompanyContext";

interface Company {
  id: string;
  name: string;
  overdueCount: number;
  dueSoonCount: number;
}

interface GlobalDashboardContextType {
  companies: Company[];
  loading: boolean;
  complianceState: "all-good" | "due" | "overdue";
  hasMessages: boolean;
  pendingDocs: number;
  sidebarData: SidebarServiceData[];
  refreshData: () => Promise<void>;
  refreshSidebar: () => Promise<void>;
}

const GlobalDashboardContext = createContext<GlobalDashboardContextType | undefined>(undefined);

export function GlobalDashboardProvider({ children }: { children: React.ReactNode }) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [complianceState, setComplianceState] = useState<"all-good" | "due" | "overdue">("all-good");
  const [hasMessages, setHasMessages] = useState(false);
  const [pendingDocs, setPendingDocs] = useState(0);
  const [sidebarData, setSidebarData] = useState<SidebarServiceData[]>([]);
  const [isFetched, setIsFetched] = useState(false);
  const { activeCompanyId } = useActiveCompany();

  const fetchDashboardData = useCallback(async (force = false) => {
    if (isFetched && !force) return;

    setLoading(true);
    try {
      const backendUrl = process.env.NEXT_PUBLIC_VACEI_BACKEND_URL?.replace(/\/?$/, "/") || "http://localhost:5000/api/v1/";
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${backendUrl}companies`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const result = await response.json();
        const data = result.data || result || [];
        const mappedCompanies = data.map((c: any) => ({
          id: c.id,
          name: c.name,
          overdueCount: c.overdueComplianceCount || 0,
          dueSoonCount: c.dueSoonComplianceCount || 0
        }));
        setCompanies(mappedCompanies);

        // Determine compliance state
        const hasOverdue = mappedCompanies.some((c: any) => c.overdueCount > 0);
        const hasDue = mappedCompanies.some((c: any) => c.dueSoonCount > 0);
        
        if (hasOverdue) setComplianceState("overdue");
        else if (hasDue) setComplianceState("due");
        else setComplianceState("all-good");
        
        setIsFetched(true);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }, [isFetched]);

  const fetchSidebar = useCallback(async () => {
    if (!activeCompanyId) {
      setSidebarData([]);
      return;
    }
    try {
      const data = await fetchSidebarData(activeCompanyId);
      setSidebarData(data);
    } catch (error) {
      console.error("Failed to fetch sidebar data:", error);
    }
  }, [activeCompanyId]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  useEffect(() => {
    fetchSidebar();
  }, [fetchSidebar]);

  const refreshData = async () => {
    await fetchDashboardData(true);
  };

  return (
    <GlobalDashboardContext.Provider value={{ 
      companies, 
      loading, 
      complianceState, 
      hasMessages, 
      pendingDocs,
      sidebarData,
      refreshData,
      refreshSidebar: fetchSidebar
    }}>
      {children}
    </GlobalDashboardContext.Provider>
  );
}

export function useGlobalDashboard() {
  const context = useContext(GlobalDashboardContext);
  if (context === undefined) {
    throw new Error("useGlobalDashboard must be used within a GlobalDashboardProvider");
  }
  return context;
}
