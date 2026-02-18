"use client"

import React from 'react';
import { Download, Eye } from 'lucide-react';
import { useLibrary } from '@/app/context/LibraryContext';

export const ContextMenu: React.FC = () => {
  const { contextMenu, closeContextMenu, currentItems, handleDownload, handleView } = useLibrary();
  
  if (!contextMenu) return null;

  const item = currentItems.find(i => i.id === contextMenu.itemId);
  if (!item) return null;

  return (
    <div 
      className="fixed z-50 bg-white border border-gray-200 rounded-xl shadow-2xl py-1.5 w-48 animate-in fade-in zoom-in duration-100"
      style={{ left: contextMenu.x, top: contextMenu.y }}
      onClick={(e) => e.stopPropagation()}
    >
      {item.type === 'file' && (
        <button 
          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-primary transition-colors text-left"
          onClick={() => { handleDownload(item); closeContextMenu(); }}
        >
          <Download className="w-4 h-4" />
          Download
        </button>
      )}
      {item.type === 'file' && (
        <button 
          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-primary transition-colors text-left"
          onClick={() => { handleView(item); closeContextMenu(); }}
        >
          <Eye className="w-4 h-4" />
          View
        </button>
      )}
    </div>
  );
};
