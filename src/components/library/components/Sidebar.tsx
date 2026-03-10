"use client"

import React from 'react';
import { FolderIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLibrary } from '@/app/context/LibraryContext';

export const Sidebar: React.FC = () => {
  const { sidebarFolders, currentFolderId, breadcrumbs, handleFolderClick, setIsMobileSidebarOpen } = useLibrary();

  const onFolderClick = (id: string | null) => {
    handleFolderClick(id);
    setIsMobileSidebarOpen(false);
  };

  const activeSidebarFolderId = React.useMemo(() => {
    const sidebarIds = new Set(sidebarFolders.map(f => f.id));
    // Check current folder first
    if (currentFolderId && sidebarIds.has(currentFolderId)) return currentFolderId;
    // Walk backwards through breadcrumbs to find the deepest sidebar folder
    for (let i = breadcrumbs.length - 1; i >= 0; i--) {
      if (sidebarIds.has(breadcrumbs[i].id)) return breadcrumbs[i].id;
    }
    return null;
  }, [sidebarFolders, breadcrumbs, currentFolderId]);

  return (
    <div className="w-64 lg:w-64 h-full border-r border-gray-200 flex flex-col bg-white lg:bg-gray-50/20 shadow-2xl lg:shadow-none">
      <div className="flex-1 overflow-y-auto">
        <div className="p-3 space-y-1">
          <p className="px-3 py-2 text-[10px] font-medium text-gray-400 uppercase tracking-widest">Navigation</p>
          {sidebarFolders.map(folder => {
            const isActive = folder.id === activeSidebarFolderId;
            
            return (
              <button
                key={folder.id}
                onClick={() => onFolderClick(folder.id)}
                className={cn(
                  "flex items-center w-full gap-3 px-3 py-2.5 rounded-xl transition-all text-sm group text-left",
                  isActive ? "bg-primary shadow-md text-white border-0" : "text-gray-600 hover:bg-gray-100/50"
                )}
              >
                <FolderIcon className={cn("w-4 h-4 transition-colors shrink-0", isActive ? "text-white fill-white/10" : "text-gray-400 group-hover:text-primary")} />
                <span className="truncate">{folder.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
