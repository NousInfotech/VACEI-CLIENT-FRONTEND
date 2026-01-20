"use client"

import React from 'react';
import { Download, Eye } from 'lucide-react';
import { LibraryItem } from '@/data/libraryData';

interface ContextMenuProps {
  x: number;
  y: number;
  itemId: string;
  items: LibraryItem[];
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  x,
  y,
  itemId,
  items
}) => {
  const item = items.find(i => i.id === itemId);
  if (!item) return null;

  return (
    <div 
      className="fixed z-50 bg-white border border-gray-200 rounded-xl shadow-xl p-1 min-w-[160px] animate-in fade-in zoom-in duration-100"
      style={{ top: y, left: x }}
      onClick={(e) => e.stopPropagation()}
    >
      <button className="flex items-center w-full gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors text-left">
        <Download className="w-4 h-4 text-gray-500" />
        Download
      </button>
      {item.type === 'file' && (
        <button className="flex items-center w-full gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors text-left">
          <Eye className="w-4 h-4 text-gray-500" />
          View File
        </button>
      )}
    </div>
  );
};
