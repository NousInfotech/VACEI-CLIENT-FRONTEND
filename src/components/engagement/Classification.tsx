"use client"

import React, { useState, useMemo, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  ChevronDown, 
  ChevronRight, 
  Search,
  CheckCircle2,
  PieChart,
  Wallet,
  CreditCard,
  Scale,
  TrendingUp,
  LayoutGrid,
  PanelLeftClose,
  PanelLeftOpen,
  Maximize2,
  X,
  FileSearch,
  AlertCircle
} from 'lucide-react';
import EmptyState from '../shared/EmptyState';
import { formatAmount } from '@/lib/utils';

interface ClassificationProps {
  data: any;
}

const Classification: React.FC<ClassificationProps> = ({ data }) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isFullViewOpen, setIsFullViewOpen] = useState(false);

  const leadSheets = data.lead_sheets || [];

  const getIcon = (group: string) => {
    switch(group) {
      case 'Assets': return <Wallet className="h-4 w-4" />;
      case 'Liabilities': return <CreditCard className="h-4 w-4" />;
      case 'Equity': return <Scale className="h-4 w-4" />;
      case 'Income': return <TrendingUp className="h-4 w-4" />;
      default: return <LayoutGrid className="h-4 w-4" />;
    }
  };

  // Default selection on mount
  useEffect(() => {
    if (!selectedNodeId && leadSheets.length > 0) {
      const firstParent = leadSheets[0];
      const firstSection = firstParent.children?.[0];
      const firstItem = firstSection?.children?.[0];
      if (firstItem) {
        setSelectedNodeId(firstItem.group);
      } else if (firstParent.group) {
        setSelectedNodeId(firstParent.group);
      }
    }
  }, [leadSheets, selectedNodeId]);

  // Handle Escape key to close full view
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsFullViewOpen(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  if (!data || !data.lead_sheets) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-400 italic bg-white border border-dashed border-slate-200 rounded-0">
        No classification data available
      </div>
    );
  }

  const formatValue = (val: number) => {
    if (val === 0) return "-";
    return formatAmount(val);
  };

  const getAccount = (id: string) => data.etb?.find((r: any) => r._id === id);

  const activeContent = useMemo(() => {
    if (!selectedNodeId) return null;

    let targetNode: any = null;
    let parentCategory: string = "";

    const findNode = (nodes: any[], parentName: string = "") => {
      for (const n of nodes) {
        if (n.group === selectedNodeId) {
          targetNode = n;
          parentCategory = parentName;
          return;
        }
        if (n.children) findNode(n.children, n.group);
      }
    };
    findNode(leadSheets);

    if (!targetNode) return null;

    const tables: any[] = [];
    const aggregate = {
      currentYear: 0,
      priorYear: 0,
      adjustments: 0,
      reclassification: 0,
      finalBalance: 0
    };

    const collectTables = (n: any) => {
      if (n.id || (n.rows && n.rows.length > 0)) {
        tables.push(n);
        aggregate.currentYear += (n.totals?.currentYear || 0);
        aggregate.priorYear += (n.totals?.priorYear || 0);
        aggregate.adjustments += (n.totals?.adjustments || 0);
        aggregate.reclassification += (n.totals?.reclassification || 0);
        aggregate.finalBalance += (n.totals?.finalBalance || 0);
      }
      if (n.children) n.children.forEach(collectTables);
    };
    collectTables(targetNode);

    return { 
      nodeName: targetNode.group, 
      parentCategory,
      tables, 
      aggregate 
    };
  }, [leadSheets, selectedNodeId]);

  const renderTable = (node: any, showHeading: boolean = true) => {
    const accounts = (node.rows || []).map(getAccount).filter(Boolean);

    return (
      <div key={node.id || node.group} className="mb-12 animate-in fade-in slide-in-from-bottom-2 duration-500">
        {showHeading && (
          <div className="bg-black text-white px-3 py-1 rounded-0 inline-block mb-4">
            <h3 className="text-sm font-medium">{node.group}</h3>
          </div>
        )}

        <div className="border border-gray-400 overflow-hidden bg-white rounded-0">
          <Table className="border-collapse">
            <TableHeader>
              <TableRow className="hover:bg-transparent border-b border-gray-400">
                <TableHead className="border-r border-gray-400 font-bold p-3">Code</TableHead>
                <TableHead className="border-r border-gray-400 font-bold p-3">Account Name</TableHead>
                <TableHead className="text-right border-r border-gray-400 font-bold p-3">Current Year</TableHead>
                <TableHead className="text-right border-r border-gray-400 font-bold p-3">Re-classification</TableHead>
                <TableHead className="text-right border-r border-gray-400 font-bold p-3">Adjustments</TableHead>
                <TableHead className="text-right border-r border-gray-400 font-bold p-3">Final Balance</TableHead>
                <TableHead className="text-right last:border-r-0 font-bold p-3">Prior Year</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.map((row: any) => (
                <TableRow key={row._id} className="border-b border-gray-400 last:border-b-0">
                  <TableCell className="border-r border-gray-400">{row.code}</TableCell>
                  <TableCell className="border-r border-gray-400">{row.accountName}</TableCell>
                  <TableCell className="text-right border-r border-gray-400">{formatValue(row.currentYear)}</TableCell>
                  <TableCell className="text-right border-r border-gray-400">{formatValue(row.reclassification)}</TableCell>
                  <TableCell className="text-right border-r border-gray-400">{formatValue(row.adjustments)}</TableCell>
                  <TableCell className="text-right font-bold border-r border-gray-400">{formatValue(row.finalBalance)}</TableCell>
                  <TableCell className="text-right last:border-r-0 text-slate-500">{formatValue(row.priorYear)}</TableCell>
                </TableRow>
              ))}
              {/* Table Summary Row */}
              <TableRow className="bg-slate-50 border-t-2 border-black h-12">
                <TableCell colSpan={2} className="pl-4 border-r border-gray-400">
                  <span className="font-medium text-xl">Total</span>
                </TableCell>
                <TableCell className="text-right border-r border-gray-400 font-bold">{formatValue(node.totals?.currentYear || 0)}</TableCell>
                <TableCell className="text-right border-r border-gray-400">{formatValue(node.totals?.reclassification || 0)}</TableCell>
                <TableCell className="text-right border-r border-gray-400">{formatValue(node.totals?.adjustments || 0)}</TableCell>
                <TableCell className="text-right border-r border-gray-400 font-bold">{formatValue(node.totals?.finalBalance || 0)}</TableCell>
                <TableCell className="text-right last:border-r-0 font-bold">{formatValue(node.totals?.priorYear || 0)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-[calc(100vh-12rem)] w-full gap-8 animate-in fade-in duration-700 overflow-hidden">
      {/* Sidebar Navigation */}
      <aside 
        className={`flex flex-col transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'w-20' : 'w-80'} overflow-y-auto custom-scrollbar border-r border-slate-100 pr-2`}
      >
        <div className="flex items-center justify-between px-4 py-4 mb-4">
          {!isSidebarCollapsed && (
            <span className="text-md text-gray-500">Classification</span>
          )}
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className={`p-2 hover:bg-slate-50 rounded-lg transition-colors text-slate-400 hover:text-gray-400 ${isSidebarCollapsed ? 'mx-auto' : ''}`}
          >
            {isSidebarCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          </button>
        </div>

        {leadSheets.map((g1: any) => (
          <div key={g1.group} className="mb-8">
            {!isSidebarCollapsed ? (
              <div className="flex items-center gap-2 px-4 mb-4">
                <div className="text-gray-500">{getIcon(g1.group)}</div>
                <h2 className="text-md font-bold uppercase">
                  {g1.group}
                </h2>
              </div>
            ) : (
              <div className="flex justify-center mb-4">
                 <div className="p-3 bg-slate-50 rounded-xl text-black shadow-sm">
                   {getIcon(g1.group)}
                 </div>
              </div>
            )}
            
            {g1.children?.map((g2: any) => (
              <div key={g2.group} className="mb-6">
                {!isSidebarCollapsed && (
                  <h3 className="px-4 text-[11px] font-bold uppercase tracking-wider mb-2">
                    {g2.group}
                  </h3>
                )}
                
                <div className={`space-y-2 ${isSidebarCollapsed ? 'px-1' : 'px-2'}`}>
                  {g2.children?.map((g3: any) => (
                    <button
                      key={g3.group}
                      onClick={() => setSelectedNodeId(g3.group)}
                      className={`w-full group text-left transition-all border-2 relative
                        ${selectedNodeId === g3.group 
                          ? 'bg-black border-black shadow-lg scale-[1.02]' 
                          : 'bg-white border-slate-200 hover:border-gray-300 hover:shadow-md'}
                        ${isSidebarCollapsed ? 'h-12 w-12 rounded-0 p-0 flex items-center justify-center mx-auto' : 'px-5 py-3.5 rounded-0'}
                      `}
                    >
                      {isSidebarCollapsed ? (
                        <div className="relative">
                          {selectedNodeId === g3.group ? (
                            <CheckCircle2 className="h-4 w-4 text-white" />
                          ) : (
                            <span className="text-[10px] font-black">{g3.group.substring(0, 2).toUpperCase()}</span>
                          )}
                          {selectedNodeId === g3.group && (
                            <div className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-yellow-400 border-2 border-black" />
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <span className={`text-sm font-semibold transition-colors ${selectedNodeId === g3.group ? 'text-white' : 'text-black'}`}>
                            {g3.group}
                          </span>
                          {selectedNodeId === g3.group && (
                            <div className="h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.6)]" />
                          )}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}
      </aside>

      {/* Content Area */}
      <main className="flex-1 overflow-y-auto custom-scrollbar pr-4 pb-10">
        {!activeContent ? (
          <EmptyState 
            icon={FileSearch}
            title="No Category Selected"
            description="Please select a lead sheet or category from the sidebar to view its detailed classification and financial summary."
            className="h-full"
          />
        ) : (
          <div className="w-full">
            {/* Aggregate Summary Ribbon */}
            <div className="mb-5 bg-gray-50/50 border border-gray-200 rounded-0 p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-white border border-gray-200 rounded-0 flex items-center justify-center shadow-sm">
                    <PieChart className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                      {activeContent.nodeName}
                    </h2>
                  </div>
                </div>
                <button 
                  onClick={() => setIsFullViewOpen(true)}
                  className="p-2.5 hover:bg-white rounded-0 border border-gray-200 transition-all text-gray-400 hover:text-black shadow-sm bg-white/50 group"
                  title="Full View"
                >
                  <Maximize2 size={18} className="group-hover:scale-110 transition-transform" />
                </button>
              </div>
              
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: 'Current Year', value: activeContent.aggregate.currentYear },
                  { label: 'Prior Year', value: activeContent.aggregate.priorYear },
                  { label: 'Adjustments', value: activeContent.aggregate.adjustments },
                  { label: 'Final Balance', value: activeContent.aggregate.finalBalance }
                ].map((item) => (
                  <div 
                    key={item.label} 
                    className={`bg-white p-4 border border-gray-200 rounded-0 shadow-sm transition-all duration-300
                      
                    `}
                  >
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                      {item.label}
                    </p>
                      <span className={`text-2xl font-medium tracking-tight`}>
                        {formatValue(item.value)}
                      </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Individual Tables */}
            <div className="space-y-4">
              {activeContent.tables.map((table: any) => renderTable(table, activeContent.tables.length > 1))}
            </div>
          </div>
        )}
      </main>
      {/* Full View Modal */}
      {isFullViewOpen && activeContent && (
        <div className="fixed inset-0 z-100 bg-white animate-in fade-in zoom-in-95 duration-200 flex flex-col">
          <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100 bg-white sticky top-0 z-20">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-gray-50 border border-gray-200 rounded-0 flex items-center justify-center shadow-sm">
                <PieChart className="h-6 w-6 text-gray-900" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900 tracking-tighter">
                  {activeContent.nodeName}
                </h2>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">Full Screen View</span>
              </div>
            </div>
            <button
              onClick={() => setIsFullViewOpen(false)}
              className="p-3 hover:bg-gray-100 rounded-0 transition-all text-gray-400 hover:text-black hover:rotate-90 duration-300"
            >
              <X size={28} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-12 py-10 bg-gray-50/30">
            <div className="max-w-7xl mx-auto space-y-12">
               {/* Modal Summary Grid */}
               <div className="grid grid-cols-4 gap-4">
                {[
                  { label: 'Current Year', value: activeContent.aggregate.currentYear },
                  { label: 'Prior Year', value: activeContent.aggregate.priorYear },
                  { label: 'Adjustments', value: activeContent.aggregate.adjustments },
                  { label: 'Final Balance', value: activeContent.aggregate.finalBalance }
                ].map((item) => (
                  <div
                    key={item.label}
                    className="bg-white p-4 border border-gray-200 rounded-xl shadow-sm transition-all duration-300"
                  >
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                      {item.label}
                    </p>
                    <span className="text-2xl font-medium tracking-tight text-black">
                      {formatValue(item.value)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Modal Tables */}
              <div className="space-y-8 pb-20">
                {activeContent.tables.map((table: any) => renderTable(table, activeContent.tables.length > 1))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Classification;