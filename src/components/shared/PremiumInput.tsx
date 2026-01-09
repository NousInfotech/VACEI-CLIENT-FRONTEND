"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

export interface PremiumInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: LucideIcon;
  rightIcon?: LucideIcon;
  containerClassName?: string;
  glowColor?: string;
}

const PremiumInput = React.forwardRef<HTMLInputElement, PremiumInputProps>(
  (
    {
      className,
      label,
      error,
      leftIcon: LeftIcon,
      rightIcon: RightIcon,
      containerClassName,
      glowColor = "ring-blue-500/20",
      type,
      ...props
    },
    ref
  ) => {
    return (
      <div className={cn("w-full space-y-2", containerClassName)}>
        {label && (
          <label className="text-[15px] font-medium uppercase tracking-[0.2em] text-black ml-1">
            {label}
          </label>
        )}
        <div className="relative group mt-2">
          {LeftIcon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gray-900 transition-colors duration-300">
              <LeftIcon className="w-5 h-5" />
            </div>
          )}
          
          <input
            type={type}
            className={cn(
              "flex h-12 w-full rounded-xl border border-gray-300 bg-white/80 px-2 py-1 text-sm transition-all duration-500 ease-in-out placeholder:text-gray-400 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
              "focus:border-[#0f1729] focus:bg-white",
              LeftIcon && "pl-12",
              RightIcon && "pr-12",
              error && "border-destructive focus:ring-destructive/10",
              className
            )}
            ref={ref}
            {...props}
          />

          {RightIcon && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gray-900 transition-colors duration-300">
              <RightIcon className="w-5 h-5" />
            </div>
          )}
        </div>
        
        {error && (
          <p className="text-[10px] font-bold text-destructive uppercase tracking-widest ml-1 animate-in fade-in slide-in-from-top-1">
            {error}
          </p>
        )}
      </div>
    );
  }
);

PremiumInput.displayName = "PremiumInput";

export { PremiumInput };
