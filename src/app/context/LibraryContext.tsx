"use client"

import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { mockLibraryData, LibraryItem } from '@/data/libraryData';

type ViewMode = 'list' | 'grid';
type SortField = 'name' | 'type' | 'size';
type SortOrder = 'asc' | 'desc';

interface SortConfig {
  field: SortField;
  order: SortOrder;
}

interface ContextMenuState {
  x: number;
  y: number;
  itemId: string;
}

interface LibraryContextType {
  // State
  viewMode: ViewMode;
  currentFolderId: string | null;
  searchQuery: string;
  selectedItems: string[];
  sortConfig: SortConfig;
  contextMenu: ContextMenuState | null;
  filterType: string;
  isLoading: boolean;
  
  // Derived Data
  breadcrumbs: LibraryItem[];
  currentItems: LibraryItem[];
  rootFolders: LibraryItem[];
  
  // Actions
  setViewMode: (mode: ViewMode) => void;
  setSearchQuery: (query: string) => void;
  setFilterType: (type: string) => void;
  handleFolderClick: (id: string | null) => void;
  handleBack: () => void;
  handleDoubleClick: (item: LibraryItem) => void;
  handleSelection: (id: string, e: React.MouseEvent) => void;
  handleSort: (field: SortField) => void;
  handleContextMenu: (e: React.MouseEvent, itemId: string) => void;
  closeContextMenu: () => void;
  setSelectedItems: (ids: string[]) => void;
}

const LibraryContext = createContext<LibraryContextType | undefined>(undefined);

export const LibraryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: 'name', order: 'asc' });
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

  const closeContextMenu = () => setContextMenu(null);

  useEffect(() => {
    window.addEventListener('click', closeContextMenu);
    return () => window.removeEventListener('click', closeContextMenu);
  }, []);

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

  const handleFolderClick = (id: string | null) => {
    setCurrentFolderId(id);
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
      handleFolderClick(item.id);
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
    setContextMenu({ x: e.clientX, y: e.clientY, itemId });
    if (!selectedItems.includes(itemId)) {
      setSelectedItems([itemId]);
    }
  };

  const value = {
    viewMode, setViewMode,
    currentFolderId,
    searchQuery, setSearchQuery,
    selectedItems, setSelectedItems,
    sortConfig,
    contextMenu,
    filterType, setFilterType,
    isLoading,
    breadcrumbs,
    currentItems,
    rootFolders,
    handleFolderClick,
    handleBack,
    handleDoubleClick,
    handleSelection,
    handleSort,
    handleContextMenu,
    closeContextMenu
  };

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
};

export const useLibrary = () => {
  const context = useContext(LibraryContext);
  if (context === undefined) {
    throw new Error('useLibrary must be used within a LibraryProvider');
  }
  return context;
};
