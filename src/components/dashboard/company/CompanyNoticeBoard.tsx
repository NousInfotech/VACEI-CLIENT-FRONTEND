"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ChevronRight, ArrowRight, ChevronLeft } from "lucide-react";
import ShadowCard from "@/components/ui/ShadowCard";
import { fetchTodayNotices, Notice } from "@/api/noticeService";

interface CompanyNoticeBoardProps {
  isLoading?: boolean;
}

export default function CompanyNoticeBoard({ isLoading = false }: CompanyNoticeBoardProps) {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  const isAnyLoading = isLoading || loading;

  const loadNotices = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchTodayNotices();
      setNotices(data);
    } catch (error) {
      console.error("Failed to fetch notices:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotices();
  }, [loadNotices]);

  useEffect(() => {
    if (notices.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % notices.length);
    }, 15000);

    return () => clearInterval(interval);
  }, [notices.length]);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + notices.length) % notices.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % notices.length);
  };

  if (isAnyLoading) {
    return (
      <ShadowCard className="space-y-4 p-5 animate-pulse">
        <div className="h-8 w-48 bg-gray-200 rounded"></div>
        <div className="h-[220px] bg-gray-100 rounded-[20px]"></div>
      </ShadowCard>
    );
  }

  const currentNotice = notices[currentIndex];

  return (
    <ShadowCard className="space-y-4 p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
      
          <h2 className="text-xl font-semibold text-[#1A1F2C]">Notice Board</h2>
          {notices.length > 0 && (
            <span className="bg-[#F1F5F9] text-[#64748B] text-xs font-semibold px-3 py-1 rounded-full">
              {notices.length} {notices.length === 1 ? 'update' : 'updates'}
            </span>
          )}


        </div>

        {notices.length > 1 && (
            <div className="flex items-center gap-1 mr-1">
              <button 
                onClick={handlePrev}
                className="p-1 rounded-lg hover:bg-gray-100 text-[#64748B] transition-colors border border-gray-100 shadow-xs"
                title="Previous"
              >
                <ChevronLeft size={18} />
              </button>
              <button 
                onClick={handleNext}
                className="p-1 rounded-lg hover:bg-gray-100 text-[#64748B] transition-colors border border-gray-100 shadow-xs"
                title="Next"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
      </div>

      <div className="relative h-[220px] rounded-[20px] overflow-hidden group">
        <Image 
          src="/logo/notice-bar.jpeg" 
          alt="Notice Board" 
          fill 
          className="object-cover"
          quality={100}
          priority
          unoptimized
        />
        


        {notices.length > 0 ? (
          <div className="absolute inset-0 bg-black/40 flex flex-col justify-center items-start p-8 text-white">
            <span className="bg-white/20 backdrop-blur-md text-white text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded mb-3 border border-white/30">
              {currentNotice.type}
            </span>
            <h3 className="text-2xl font-bold mb-3 line-clamp-2">{currentNotice.title}</h3>
            <p className="text-white/90 text-base line-clamp-3">
              {currentNotice.description}
            </p>
            
            {notices.length > 1 && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5">
                {notices.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentIndex(i)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${i === currentIndex ? 'w-6 bg-white' : 'w-1.5 bg-white/30 hover:bg-white/50'}`}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="absolute inset-0 bg-linear-to-r from-black/60 to-transparent flex flex-col justify-center items-center p-8 text-white text-center">
            <h3 className="text-xl font-bold mb-2">No active notices</h3>
            <p className="text-white/80 text-sm max-w-xs">
              Check back later for updates and announcements.
            </p>
          </div>
        )}
      </div>
    </ShadowCard>
  );
}
