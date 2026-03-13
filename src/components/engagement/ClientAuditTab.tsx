"use client";

import React, { useState, useMemo } from "react";
import {
  FileText,
  FileSpreadsheet,
  FolderOpen,
  Layers,
  Sliders,
  ArrowRightLeft,
  TrendingUp,
  Scale,
  Menu,
  PanelLeftClose,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import PillTabs from "../shared/PillTabs";
import { useEngagement } from "./hooks/useEngagement";
import { useEtb } from "./hooks/useEtb";
import { extractETBData } from "@/lib/extractETBData";
import { ETBRow } from "./mockEngagementData";
import ETBTable from "./ETBTable";
import AdjustmentsTab from "./AdjustmentsTab";
import Reclassification from "./Reclassification";
import IncomeStatement from "./IncomeStatement";
import BalanceSheet from "./BalanceSheet";
import { DetailsSkeleton } from "../shared/CommonSkeletons";

const AUDIT_SUB_TABS = [
  { id: "extended-tb", label: "Extended TB", icon: FileSpreadsheet },
  { id: "sections", label: "Sections", icon: Layers },
] as const;

const CLIENT_AUDIT_SECTIONS = [
  { id: "extended-tb", label: "Extended Trial Balance", icon: FileText },
  { id: "adjustments", label: "Adjustments", icon: Sliders },
  { id: "reclassifications", label: "Reclassifications", icon: ArrowRightLeft },
  { id: "income-statement", label: "Income Statement", icon: TrendingUp },
  { id: "balance-sheet", label: "Balance Sheet", icon: Scale },
] as const;

export default function ClientAuditTab() {
  const [activeAuditTab, setActiveAuditTab] = useState<"extended-tb" | "sections">("extended-tb");
  const [activeSection, setActiveSection] = useState("extended-tb");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const { engagement, loading: engagementLoading } = useEngagement();
  const engagementId = engagement?.id ?? engagement?._id ?? null;
  const { etb, loading: etbLoading } = useEtb(engagementId);

  const transformedEtbRows = useMemo((): ETBRow[] => {
    if (!etb?.rows) return [];
    return etb.rows.map((row) => ({
      _id: row._id || row.rowId || "",
      code: row.code || "",
      accountName: row.accountName || "",
      currentYear: row.currentYear ?? 0,
      priorYear: row.priorYear ?? 0,
      adjustments: row.adjustments ?? 0,
      reclassification: row.reclassifications ?? 0,
      finalBalance: row.finalBalance ?? 0,
      classification: row.classification || "",
    }));
  }, [etb]);

  const extractedData = useMemo(() => {
    if (!engagement || !etb) return null;
    const year = new Date(engagement.yearEndDate).getFullYear() || 2024;
    const base = extractETBData(transformedEtbRows, year);
    return {
      ...base,
      engagement,
    };
  }, [engagement, transformedEtbRows]);

  const loading = engagementLoading || etbLoading;

  const renderSectionsContent = () => {
    if (loading) {
      return (
        <div className="p-8">
          <DetailsSkeleton />
        </div>
      );
    }
    switch (activeSection) {
      case "extended-tb":
        return <ETBTable data={transformedEtbRows} engagementId={engagementId} />;
      case "adjustments":
        return <AdjustmentsTab />;
      case "reclassifications":
        return <Reclassification />;
      case "income-statement":
        return extractedData ? <IncomeStatement data={extractedData} /> : null;
      case "balance-sheet":
        return extractedData ? <BalanceSheet data={extractedData} /> : null;
      default:
        return <ETBTable data={transformedEtbRows} engagementId={engagementId} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Sub-tabs: Extended TB | Sections (same as VACEI_PARTNER_PORTAL) */}
      <div className="w-full overflow-hidden flex items-center">
        <PillTabs
          tabs={AUDIT_SUB_TABS.map((t) => ({ id: t.id, label: t.label, icon: t.icon }))}
          activeTab={activeAuditTab}
          onTabChange={(id) => setActiveAuditTab(id as "extended-tb" | "sections")}
        />
      </div>

      {/* Content: Extended TB tab = ETB only; Sections tab = sidebar + sections */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm min-h-[400px]">
        {activeAuditTab === "extended-tb" ? (
          <div className="p-6">
            {loading ? (
              <DetailsSkeleton />
            ) : (
              <ETBTable data={transformedEtbRows} engagementId={engagementId} />
            )}
          </div>
        ) : (
          <div className="flex overflow-hidden min-h-[600px] h-[calc(100vh-220px)] relative">
            {/* Sections sidebar */}
            <div
              className={`${
                isSidebarOpen ? "w-72 border-r border-gray-200" : "w-0"
              } transition-all duration-300 overflow-hidden bg-gray-50/50 flex flex-col shrink-0 min-h-0`}
            >
              <div className="p-4 border-b bg-white/50 backdrop-blur-sm flex justify-between items-start shrink-0">
                <div>
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <FolderOpen className="h-4 w-4 text-primary shrink-0" />
                    Audit (read-only)
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider font-semibold">
                    Extended TB, adjustments &amp; statements
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="p-1.5 hover:bg-gray-100 rounded-md text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Toggle sidebar"
                >
                  <PanelLeftClose size={18} />
                </button>
              </div>
              <ScrollArea className="flex-1 min-h-0">
                <nav className="p-3 space-y-6">
                  <div className="text-[11px] font-bold text-gray-800 uppercase tracking-wider px-3 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                    GENERAL
                  </div>
                  {CLIENT_AUDIT_SECTIONS.map((section) => {
                    const Icon = section.icon;
                    const isActive = activeSection === section.id;
                    const buttonClasses = [
                      "w-full flex items-center gap-3 text-left h-auto p-3 transition-all duration-300 rounded-xl border border-amber-200 shadow-sm hover:shadow-md",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-lg scale-[1.02] border-primary"
                        : "bg-white hover:bg-amber-50 text-gray-700 hover:text-primary",
                    ].join(" ");
                    return (
                      <div key={section.id} className="px-2 mb-2">
                        <Button
                          variant={isActive ? "default" : "outline"}
                          type="button"
                          onClick={() => setActiveSection(section.id)}
                          className={buttonClasses}
                        >
                          <Icon size={18} className="shrink-0" />
                          <span className="font-semibold text-xs whitespace-normal break-words">
                            {section.label}
                          </span>
                        </Button>
                      </div>
                    );
                  })}
                </nav>
              </ScrollArea>
            </div>

            <div className="flex-1 min-w-0 bg-white relative flex flex-col">
              {!isSidebarOpen && (
                <div className="absolute top-4 left-4 z-20">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsSidebarOpen(true)}
                    className="p-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50"
                  >
                    <Menu size={20} />
                  </Button>
                </div>
              )}
              <div
                className={`h-full overflow-y-auto p-6 ${!isSidebarOpen ? "pt-16" : ""}`}
              >
                {renderSectionsContent()}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
