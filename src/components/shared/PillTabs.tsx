import React, { useRef, useState, useEffect } from 'react';

export interface Tab {
  id: string;
  label: string;
  icon?: React.ElementType;
}

interface PillTabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (id: string) => void;
  className?: string;
  highlightedTabId?: string;
}

const PillTabs: React.FC<PillTabsProps> = ({ 
  tabs, 
  activeTab, 
  onTabChange, 
  className = "",
  highlightedTabId
}) => {
  const outerRef = useRef<HTMLDivElement>(null);
  const highlightedButtonRef = useRef<HTMLButtonElement>(null);
  const [labelLeft, setLabelLeft] = useState<number | null>(null);

  useEffect(() => {
    if (highlightedButtonRef.current && outerRef.current) {
      const btn = highlightedButtonRef.current;
      const container = outerRef.current;
      const btnRect = btn.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      setLabelLeft(btnRect.left - containerRect.left + btnRect.width / 2);
    }
  }, [highlightedTabId, tabs]);

  return (
    <div ref={outerRef} className="relative w-fit max-w-full">
      {/* Label positioned exactly above the highlighted tab */}
      {highlightedTabId && labelLeft !== null && (
        <div
          className="blink-label absolute -top-9 bg-blue-600 text-white text-[10px] px-2 py-1 rounded-lg whitespace-nowrap font-bold shadow-lg z-50 flex items-center gap-1.5"
          style={{ left: labelLeft, transform: 'translateX(-50%)' }}
        >
          <span className="inline-block w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
          Upload the required document
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-transparent border-t-blue-600" />
        </div>
      )}

      <div className={`overflow-x-auto no-scrollbar bg-gray-100 p-1 rounded-xl ${className}`}>
        <div className="flex space-x-1 min-w-max">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const isHighlighted = highlightedTabId === tab.id;
            return (
              <button
                key={tab.id}
                ref={isHighlighted ? highlightedButtonRef : null}
                onClick={() => onTabChange(tab.id)}
                className={`
                  flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 whitespace-nowrap
                  ${isActive 
                    ? 'bg-primary-color-new text-light shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}
                  ${isHighlighted ? 'blink-item cursor-pointer' : ''}
                `}
              >
                {Icon && <Icon size={18} className="shrink-0" />}
                <span className="font-medium text-sm whitespace-nowrap">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PillTabs;
