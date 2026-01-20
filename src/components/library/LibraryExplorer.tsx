"use client"

import React, { useState, useMemo, useEffect } from 'react';
import { FolderIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { mockLibraryData, LibraryItem } from '@/data/libraryData';

// Modular Components
import { Toolbar } from './components/Toolbar';
import { Sidebar } from './components/Sidebar';
import { Breadcrumbs } from './components/Breadcrumbs';
import { ListView } from './components/ListView';
import { GridView } from './components/GridView';
import { ContextMenu } from './components/ContextMenu';
import { ListViewSkeleton } from './components/ListViewSkeleton';
import { GridViewSkeleton } from './components/GridViewSkeleton';

interface LibraryExplorerProps {
  className?: string;
}

type SortField = 'name' | 'type' | 'size';
type SortOrder = 'asc' | 'desc';

interface ContextMenuState {
  x: number;
  y: number;
  itemId: string;
}

export const LibraryExplorer: React.FC<LibraryExplorerProps> = ({ className }) => {
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [sortConfig, setSortConfig] = useState<{ field: SortField; order: SortOrder }>({ field: 'name', order: 'asc' });
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [filterType, setFilterType] = useState('all');
  const [isLoading, setIsLoading] = useState(false);

  // Simulated Loading Effect
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, [currentFolderId, filterType]);

  // Close context menu on click outside
  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  // Keyboard Shortcuts (Ctrl + A)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'a') {
        e.preventDefault();
        setSelectedItems(currentItems.map(item => item.id));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentFolderId, searchQuery]);

  // Derived data
  const breadcrumbs = useMemo(() => {
    const path: LibraryItem[] = [];
    let currentId = currentFolderId;
    while (currentId) {
      const folder = mockLibraryData.find(item => item.id === currentId);
      if (folder) {
        path.unshift(folder);
        currentId = folder.parentId;
      } else {
        break;
      }
    }
    return path;
  }, [currentFolderId]);

  const currentItems = useMemo(() => {
    let filtered = mockLibraryData.filter(item => {
      const matchesFolder = item.parentId === currentFolderId;
      const matchesSearch = searchQuery === '' || item.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      let matchesFilter = true;
      if (filterType === 'pdf') {
        matchesFilter = item.type === 'file' && item.fileType?.toUpperCase() === 'PDF';
      } else if (filterType === 'spreadsheet') {
        matchesFilter = item.type === 'file' && (item.fileType?.toUpperCase() === 'XLSX' || item.fileType?.toUpperCase() === 'CSV');
      } else if (filterType === 'document') {
        matchesFilter = item.type === 'file' && (item.fileType?.toUpperCase() === 'DOCX' || item.fileType?.toUpperCase() === 'DOC');
      }

      return matchesFolder && matchesSearch && matchesFilter;
    });

    filtered.sort((a, b) => {
      let comparison = 0;
      if (sortConfig.field === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortConfig.field === 'type') {
        comparison = (a.fileType || 'Folder').localeCompare(b.fileType || 'Folder');
      } else if (sortConfig.field === 'size') {
        comparison = (a.size || '').localeCompare(b.size || '');
      }
      return sortConfig.order === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [currentFolderId, searchQuery, sortConfig, filterType]);

  const rootFolders = useMemo(() => {
    return mockLibraryData.filter(item => item.parentId === null && item.type === 'folder');
  }, []);

  const handleFolderClick = (folderId: string | null) => {
    setCurrentFolderId(folderId);
    setSelectedItems([]);
    setContextMenu(null);
  };

  const handleBack = () => {
    if (currentFolderId) {
      const current = mockLibraryData.find(item => item.id === currentFolderId);
      setCurrentFolderId(current?.parentId || null);
      setSelectedItems([]);
      setContextMenu(null);
    }
  };

  const handleDoubleClick = (item: LibraryItem) => {
    if (item.type === 'folder') {
      setCurrentFolderId(item.id);
      setSelectedItems([]);
    }
  };

  const handleSelection = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setContextMenu(null);
    if (e.ctrlKey || e.metaKey) {
      setSelectedItems(prev => 
        prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
      );
    } else {
      setSelectedItems(prev => (prev.length === 1 && prev[0] === id) ? [] : [id]);
    }
  };

  const handleSort = (field: SortField) => {
    setSortConfig(prev => ({
      field,
      order: prev.field === field && prev.order === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleContextMenu = (e: React.MouseEvent, itemId: string) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      itemId
    });
    if (!selectedItems.includes(itemId)) {
      setSelectedItems([itemId]);
    }
  };

  return (
    <div className={cn("flex flex-col h-[700px] bg-white border border-gray-200 rounded-2xl overflow-hidden", className)}>
      <Toolbar 
        currentFolderId={currentFolderId}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        viewMode={viewMode}
        setViewMode={setViewMode}
        sortConfig={sortConfig}
        handleSort={handleSort}
        handleBack={handleBack}
        selectedItemsCount={selectedItems.length}
        filterType={filterType}
        setFilterType={setFilterType}
      />

      <Breadcrumbs 
        breadcrumbs={breadcrumbs}
        handleFolderClick={handleFolderClick}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          rootFolders={rootFolders}
          currentFolderId={currentFolderId}
          handleFolderClick={handleFolderClick}
        />

        {/* Content Area */}
        <div className="flex-1 flex flex-col min-w-0" onClick={() => { setSelectedItems([]); setContextMenu(null); }}>
          <ScrollArea className="flex-1">
            <div className="p-6" onClick={(e) => e.stopPropagation()}>
              {isLoading ? (
                viewMode === 'list' ? <ListViewSkeleton /> : <GridViewSkeleton />
              ) : currentItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[400px] text-gray-400">
                  <FolderIcon className="w-16 h-16 opacity-10 mb-4" />
                  <p className="text-sm">No items found</p>
                </div>
              ) : viewMode === 'list' ? (
                <ListView 
                  items={currentItems}
                  selectedItems={selectedItems}
                  handleDoubleClick={handleDoubleClick}
                  handleSelection={handleSelection}
                  handleContextMenu={handleContextMenu}
                />
              ) : (
                <GridView 
                  items={currentItems}
                  selectedItems={selectedItems}
                  handleDoubleClick={handleDoubleClick}
                  handleSelection={handleSelection}
                  handleContextMenu={handleContextMenu}
                />
              )}
            </div>
          </ScrollArea>
        </div>
      </div>

      {contextMenu && (
        <ContextMenu 
          x={contextMenu.x}
          y={contextMenu.y}
          itemId={contextMenu.itemId}
          items={mockLibraryData}
        />
      )}
    </div>
  );
};
