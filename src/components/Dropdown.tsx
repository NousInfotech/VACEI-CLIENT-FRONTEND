"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, Search } from "lucide-react";

export interface DropdownItem {
  id: string | number;
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  className?: string;
  destructive?: boolean;
}

interface DropdownProps {
  trigger?: React.ReactNode;
  label?: string;
  items?: DropdownItem[];
  children?: React.ReactNode; // For custom content like headers/footers
  className?: string;
  contentClassName?: string;
  align?: "left" | "right" | "center";
  side?: "top" | "bottom";
  closeOnClick?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
}

export const Dropdown = ({
  trigger,
  label = "Menu",
  items = [],
  children,
  className,
  contentClassName,
  align = "right",
  side = "bottom",
  closeOnClick = true,
  searchable = false,
  searchPlaceholder = "Search...",
}: DropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      if (searchable && searchInputRef.current) {
        setTimeout(() => searchInputRef.current?.focus(), 100);
      }
    } else {
      setSearchQuery(""); // Reset search when closed
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, searchable]);

  const filteredItems = useMemo(() => {
    if (!searchable || !searchQuery) return items;
    return items.filter((item) =>
      item.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [items, searchQuery, searchable]);

  const highlightMatch = (text: string) => {
    if (!searchQuery) return text;
    const parts = text.split(new RegExp(`(${searchQuery})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) => 
          part.toLowerCase() === searchQuery.toLowerCase() ? (
            <span key={i} className="text-blue-600 font-bold">{part}</span>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  const alignmentClasses = {
    left: "left-0",
    right: "right-0",
    center: "left-1/2 -translate-x-1/2",
  };

  const sideClasses = {
    bottom: "mt-2 top-full",
    top: "mb-2 bottom-full",
  };

  return (
    <div className={cn("relative inline-block text-left z-1 hover:z-50 focus-within:z-50", className)} ref={dropdownRef}>
      {/* Trigger */}
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger ? (
          trigger
        ) : (
          <button
            type="button"
            className="inline-flex w-full items-center justify-center gap-x-1.5 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 hover:bg-gray-50 transition-all duration-200 active:scale-95"
          >
            {label}
            <ChevronDown
              className={cn(
                "h-4 w-4 text-gray-400 transition-transform duration-300",
                isOpen && "rotate-180"
              )}
              aria-hidden="true"
            />
          </button>
        )}
      </div>

      {/* Dropdown menu */}
      <div
        className={cn(
          "absolute z-50 w-64 origin-top rounded-2xl bg-white/95 backdrop-blur-md p-1.5 shadow-2xl ring-1 ring-black/5 focus:outline-none transition-all duration-300 ease-in-out",
          alignmentClasses[align],
          sideClasses[side],
          isOpen
            ? "scale-100 opacity-100 translate-y-0 pointer-events-auto"
            : "scale-95 opacity-0 -translate-y-2 pointer-events-none",
          contentClassName
        )}
      >
        {searchable && !children && (
          <div className="p-2 pb-1.5 border-b border-gray-100/50 mb-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full pl-9 pr-4 py-2 text-xs font-medium bg-gray-50/50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900/5 focus:border-gray-200 transition-all"
              />
            </div>
          </div>
        )}

        {children ? (
            <div onClick={() => closeOnClick && setIsOpen(false)}>
                {children}
            </div>
        ) : (
            <div className="py-1 max-h-72 overflow-y-auto custom-scrollbar">
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                  <button
                  key={item.id}
                  onClick={() => {
                      item.onClick?.();
                      if (closeOnClick) setIsOpen(false);
                  }}
                  className={cn(
                      "group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200",
                      item.destructive
                      ? "text-red-600 hover:bg-red-50"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900",
                      item.className
                  )}
                  >
                  {item.icon && (
                      <div
                      className={cn(
                          "flex h-8 w-8 items-center justify-center rounded-lg transition-colors group-hover:scale-110 duration-200",
                          item.destructive ? "bg-red-50" : "bg-gray-50 group-hover:bg-white shadow-sm"
                      )}
                      >
                      {item.icon}
                      </div>
                  )}
                  <span className="font-medium text-left">{highlightMatch(item.label)}</span>
                  </button>
              ))
            ) : (
              <div className="py-8 px-4 text-center">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">No results found</p>
              </div>
            )}
            </div>
        )}
      </div>
    </div>
  );
};

export default Dropdown;
