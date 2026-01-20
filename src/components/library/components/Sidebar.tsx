"use client"

import React from 'react';
import { FolderIcon } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { LibraryItem } from '@/data/libraryData';

interface SidebarProps {
  rootFolders: LibraryItem[];
  currentFolderId: string | null;
  handleFolderClick: (id: string | null) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  rootFolders,
  currentFolderId,
  handleFolderClick
}) => {
  return (
    <div className="w-64 border-r border-gray-200 flex flex-col bg-gray-50/20">
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-1">
          <p className="px-3 py-2 text-[10px] font-medium text-gray-400 uppercase tracking-widest">Navigation</p>
          <button
            onClick={() => handleFolderClick(null)}
            className={cn(
              "flex items-center w-full gap-3 px-3 py-2.5 rounded-xl transition-all text-sm text-left",
              currentFolderId === null ? "bg-white shadow-sm border border-gray-200 text-primary" : "text-gray-600 hover:bg-gray-100/50"
            )}
          >
            <FolderIcon className={cn("w-4 h-4", currentFolderId === null ? "text-primary fill-primary/10" : "text-gray-400")} />
            All Files
          </button>
          {rootFolders.map(folder => (
            <button
              key={folder.id}
              onClick={() => handleFolderClick(folder.id)}
              className={cn(
                "flex items-center w-full gap-3 px-3 py-2.5 rounded-xl transition-all text-sm group text-left",
                currentFolderId === folder.id ? "bg-white shadow-sm border border-gray-200 text-primary" : "text-gray-600 hover:bg-gray-100/50"
              )}
            >
              <FolderIcon className={cn("w-4 h-4 transition-colors", currentFolderId === folder.id ? "text-primary fill-primary/10" : "text-gray-400 group-hover:text-primary")} />
              {folder.name}
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
