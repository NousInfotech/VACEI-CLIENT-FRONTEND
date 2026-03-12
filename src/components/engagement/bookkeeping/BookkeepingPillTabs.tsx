"use client";

import React, { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BookkeepingTab {
  id: string;
  label: string;
  icon?: React.ElementType;
}

interface BookkeepingPillTabsProps {
  tabs: BookkeepingTab[];
  activeTab: string;
  onTabChange: (id: string) => void;
  className?: string;
}

/**
 * Bookkeeping subtab strip — mirror match of VACEI_PARTNER_PORTAL PillTab:
 * horizontal scroll with scrollbar-hide, scroll-smooth, and left/right chevron buttons.
 */
export function BookkeepingPillTabs({
  tabs,
  activeTab,
  onTabChange,
  className = "",
}: BookkeepingPillTabsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 5);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [tabs]);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 200;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
      // Update arrow visibility after scroll
      setTimeout(checkScroll, 300);
    }
  };

  return (
    <div
      className={cn(
        "relative group flex items-center w-full min-w-0 px-1",
        className
      )}
    >
      {/* Left Arrow — mirror of partner PillTab */}
      {showLeftArrow && (
        <button
          type="button"
          onClick={() => scroll("left")}
          className="absolute left-1 z-10 p-1.5 bg-white/90 backdrop-blur-sm border border-gray-200 shadow-lg rounded-full hover:bg-white transition-all duration-200"
          aria-label="Scroll left"
        >
          <ChevronLeft size={16} className="text-gray-600" />
        </button>
      )}

      {/* Tabs container — overflow-x-auto, scrollbar-hide, scroll-smooth (mirror partner) */}
      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="overflow-x-auto flex space-x-1 bg-gray-100 p-1 rounded-xl w-full scrollbar-hide scroll-smooth"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 whitespace-nowrap shrink-0",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              )}
            >
              {Icon && <Icon size={18} className="shrink-0" />}
              <span className="font-medium text-sm whitespace-nowrap">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Right Arrow — mirror of partner PillTab */}
      {showRightArrow && (
        <button
          type="button"
          onClick={() => scroll("right")}
          className="absolute right-1 z-10 p-1.5 bg-white/90 backdrop-blur-sm border border-gray-200 shadow-lg rounded-full hover:bg-white transition-all duration-200"
          aria-label="Scroll right"
        >
          <ChevronRight size={16} className="text-gray-600" />
        </button>
      )}
    </div>
  );
}
