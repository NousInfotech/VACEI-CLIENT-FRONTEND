"use client"

import React from 'react';
import { Search, List, LayoutGrid, Download, ArrowLeft, Filter, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface ToolbarProps {
  currentFolderId: string | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  viewMode: 'list' | 'grid';
  setViewMode: (mode: 'list' | 'grid') => void;
  sortConfig: { field: string; order: 'asc' | 'desc' };
  handleSort: (field: any) => void;
  handleBack: () => void;
  selectedItemsCount: number;
  filterType: string;
  setFilterType: (type: string) => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  currentFolderId,
  searchQuery,
  setSearchQuery,
  viewMode,
  setViewMode,
  sortConfig,
  handleSort,
  handleBack,
  selectedItemsCount,
  filterType,
  setFilterType
}) => {
  const [isFilterOpen, setIsFilterOpen] = React.useState(false);

  const filterOptions = [
    { id: 'all', label: 'All Files' },
    { id: 'pdf', label: 'PDF Documents' },
    { id: 'spreadsheet', label: 'Spreadsheets' },
    { id: 'document', label: 'Word Documents' },
  ];
  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-200 gap-4">
      <div className="flex items-center gap-3 flex-1">
        {currentFolderId && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleBack}
            className="h-10 w-10 p-0 border-gray-200 rounded-xl"
          >
            <ArrowLeft className="w-4 h-4 text-gray-600" />
          </Button>
        )}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input 
            placeholder="Search files and folders..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-10 border-gray-200 bg-gray-50/50 rounded-xl focus-visible:ring-primary/20"
          />
        </div>

        {/* Filter Dropdown */}
        <div className="relative">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={cn(
              "h-10 border-gray-200 rounded-xl gap-2 font-medium transition-all px-4",
              filterType !== 'all' ? "bg-primary/5 border-primary/20 text-primary" : "text-gray-600 bg-white"
            )}
          >
            <Filter className="w-4 h-4" />
            {filterOptions.find(opt => opt.id === filterType)?.label || 'Filter'}
            <ChevronDown className={cn("w-4 h-4 transition-transform", isFilterOpen && "rotate-180")} />
          </Button>

          {isFilterOpen && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setIsFilterOpen(false)} 
              />
              <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-xl p-1 z-50 animate-in fade-in zoom-in duration-100">
                {filterOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setFilterType(opt.id);
                      setIsFilterOpen(false);
                    }}
                    className={cn(
                      "flex items-center w-full px-3 py-2 text-sm rounded-lg transition-colors text-left",
                      filterType === opt.id 
                        ? "bg-primary/10 text-primary font-medium" 
                        : "text-gray-600 hover:bg-gray-50"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
        
        {/* Sort Options */}
        <div className="flex items-center bg-gray-50/50 p-1 rounded-xl border border-gray-200">
          {(['name', 'type', 'size'] as const).map((field) => (
            <Button
              key={field}
              variant="ghost"
              size="sm"
              onClick={() => handleSort(field)}
              className={cn(
                "h-8 px-3 rounded-lg text-xs gap-1",
                sortConfig.field === field ? "bg-white shadow-sm" : "text-gray-500",
                field !== 'name' && "border-l border-gray-100"
              )}
            >
              {field.charAt(0).toUpperCase() + field.slice(1)} 
              {sortConfig.field === field && (sortConfig.order === 'asc' ? '↑' : '↓')}
            </Button>
          ))}
        </div>

        {/* View Mode Toggles */}
        <div className="flex items-center bg-gray-50/50 p-1 rounded-xl border border-gray-200">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode('list')}
            className={cn("h-8 w-8 p-0 rounded-lg", viewMode === 'list' && "bg-white shadow-sm")}
          >
            <List className="w-4 h-4 text-gray-600" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode('grid')}
            className={cn("h-8 w-8 p-0 rounded-lg", viewMode === 'grid' && "bg-white shadow-sm")}
          >
            <LayoutGrid className="w-4 h-4 text-gray-600" />
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {selectedItemsCount > 1 && (
          <Button variant="outline" className="h-10 border-gray-200 text-gray-600 rounded-xl gap-2 transition-all">
            <Download className="w-4 h-4" />
            Download Zip ({selectedItemsCount})
          </Button>
        )}
        <Button variant="default" className="h-10 bg-primary hover:bg-primary/90 text-white font-medium border-0 rounded-xl gap-2 shadow-none px-6">
          <Download className="w-4 h-4" />
          Download All
        </Button>
      </div>
    </div>
  );
};
