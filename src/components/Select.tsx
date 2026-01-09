// components/Select.tsx
import React, { useState, useRef, useEffect, useMemo } from "react";
import { ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  label?: string;
  error?: string;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  searchable?: boolean;
}

const Select: React.FC<SelectProps> = ({
  value,
  onChange,
  options,
  label,
  error,
  disabled = false,
  placeholder = "Select an option",
  className = "",
  searchable = true, // Default to true for better UX in forms
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      if (searchable && searchInputRef.current) {
        setTimeout(() => searchInputRef.current?.focus(), 100);
      }
    } else {
      setSearchQuery("");
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, searchable]);

  const filteredOptions = useMemo(() => {
    if (!searchable || !searchQuery) return options;
    return options.filter((opt) =>
      opt.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [options, searchQuery, searchable]);

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

  return (
    <div className={cn("relative z-1 hover:z-50 focus-within:z-50", className)} ref={containerRef}>
      {label && (
        <label className="block text-[15px] font-medium uppercase tracking-widest text-black mb-2 px-1">
          {label}
        </label>
      )}
      
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between rounded-xl px-4 py-3 bg-white border border-gray-300 transition-all cursor-pointer group",
          isOpen ? "border-gray-900 ring-4 ring-gray-900/5 shadow-md" : "hover:border-gray-600 shadow-sm",
          error && "border-red-500",
          disabled && "opacity-50 cursor-not-allowed bg-gray-50"
        )}
      >
        <span className={cn(
          "text-sm font-medium transition-colors",
          selectedOption ? "text-gray-900" : "text-gray-400"
        )}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={cn(
          "w-4 h-4 text-gray-400 transition-transform duration-300",
          isOpen && "rotate-180 text-gray-900"
        )} />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white/95 backdrop-blur-md border border-gray-100 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 origin-top">
          {searchable && (
            <div className="p-2 pb-1.5 border-b border-gray-100/50 mb-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search options..."
                  className="w-full pl-9 pr-4 py-2 text-xs font-medium bg-gray-50/50 border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900/5 focus:border-gray-200 transition-all"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
          )}
          
          <div className="max-h-60 overflow-y-auto p-1 py-1.5 custom-scrollbar">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <div
                  key={opt.value}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "px-4 py-2.5 text-sm font-medium rounded-xl cursor-pointer transition-all",
                    opt.value === value 
                      ? "bg-gray-900 text-white" 
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  {highlightMatch(opt.label)}
                </div>
              ))
            ) : (
              <div className="px-4 py-8 text-xs font-bold uppercase tracking-widest text-gray-400 text-center">
                No matching options
              </div>
            )}
          </div>
        </div>
      )}

      {error && <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest mt-2 px-1">{error}</p>}
    </div>
  );
};

export default Select;
