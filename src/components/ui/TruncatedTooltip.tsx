"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  TooltipPortal,
} from "@/components/ui/tooltip";

interface TruncatedTooltipProps {
  children: React.ReactNode;
  content?: string;
  className?: string;
  style?: React.CSSProperties;
  delayDuration?: number;
}

export const TruncatedTooltip = ({
  children,
  content,
  className,
  style,
  delayDuration = 300,
}: TruncatedTooltipProps) => {
  const [isTruncated, setIsTruncated] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkTruncation = () => {
      if (containerRef.current) {
        const { scrollWidth, offsetWidth } = containerRef.current;
        setIsTruncated(scrollWidth > offsetWidth);
      }
    };

    const resizeObserver = new ResizeObserver(() => {
      checkTruncation();
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    checkTruncation();

    return () => {
      resizeObserver.disconnect();
    };
  }, [children]);

  const tooltipText = content || (typeof children === "string" ? children : "");

  return (
    <TooltipProvider delayDuration={delayDuration}>
      <Tooltip open={isTruncated ? undefined : false}>
        <TooltipTrigger asChild>
          <div
            ref={containerRef}
            className={className}
            style={{ ...style, minWidth: 0 }}
          >
            {children}
          </div>
        </TooltipTrigger>
        {isTruncated && (
          <TooltipPortal>
            <TooltipContent
              side="right"
              sideOffset={10}
              className="z-[9999] min-w-[120px] max-w-[300px] px-3 py-2 whitespace-normal break-words bg-primary text-white border-none shadow-2xl rounded-lg"
            >
              {tooltipText}
            </TooltipContent>
          </TooltipPortal>
        )}
      </Tooltip>
    </TooltipProvider>
  );
};
