"use client";

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, AlertCircle, Info, CheckCircle, AlertTriangle, Megaphone, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { Spinner } from '@/components/ui/spinner';

enum RoleEnum {
  ADMIN = "admin",
  EMPLOYEE = "employee",
  CLIENT = "client",
}

enum NoticeTypeEnum {
  EMERGENCY = "emergency",
  WARNING = "warning",
  UPDATE = "update",
  ANNOUNCEMENT = "announcement",
  REMINDER = "reminder",
  INFO = "info",
  SUCCESS = "success"
}

interface Notice {
  id: string;
  title: string;
  description: string;
  roles: RoleEnum[];
  createdBy: "admin" | "super-admin";
  type: NoticeTypeEnum;
  createdAt: Date;
  updatedAt: Date;
}

const MOCK_NOTICES: Notice[] = [
  {
    id: "1",
    title: "System Maintenance Scheduled",
    description: "Our systems will undergo routine maintenance this Sunday from 02:00 to 04:00 AM UTC. Some services may be briefly unavailable.",
    roles: [RoleEnum.CLIENT, RoleEnum.EMPLOYEE],
    createdBy: "admin",
    type: NoticeTypeEnum.UPDATE,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
  },
  {
    id: "2",
    title: "New VAT Filing Deadline",
    description: "Please note the updated deadline for Q2 VAT submissions is now July 15th. Ensure all documents are uploaded by July 10th.",
    roles: [RoleEnum.CLIENT],
    createdBy: "super-admin",
    type: NoticeTypeEnum.EMERGENCY,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
  },
  {
    id: "3",
    title: "Updated CSP Service Terms",
    description: "We have updated our Corporate Services terms. You can review the new terms in your service agreement section.",
    roles: [RoleEnum.CLIENT],
    createdBy: "admin",
    type: NoticeTypeEnum.INFO,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
  },
  {
    id: "4",
    title: "Successful Audit Completion",
    description: "Congratulations! The annual audit for ACME LTD has been successfully completed and filed with the authorities.",
    roles: [RoleEnum.CLIENT],
    createdBy: "super-admin",
    type: NoticeTypeEnum.SUCCESS,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72), // 3 days ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 72),
  }
];

const getNoticeTypeConfig = (type: NoticeTypeEnum) => {
  const configs = {
    [NoticeTypeEnum.EMERGENCY]: {
      icon: AlertCircle,
      badgeColor: "bg-red-500",
      gradient: "from-red-600 via-red-500 to-red-400",
      gradientDark: "from-red-700 via-red-600 to-red-500",
      label: "Emergency",
      textColor: "text-white"
    },
    [NoticeTypeEnum.WARNING]: {
      icon: AlertTriangle,
      badgeColor: "bg-orange-500",
      gradient: "from-orange-600 via-orange-500 to-orange-400",
      gradientDark: "from-orange-700 via-orange-600 to-orange-500",
      label: "Warning",
      textColor: "text-white"
    },
    [NoticeTypeEnum.UPDATE]: {
      icon: Info,
      badgeColor: "bg-blue-500",
      gradient: "from-blue-600 via-blue-500 to-blue-400",
      gradientDark: "from-blue-700 via-blue-600 to-blue-500",
      label: "Update",
      textColor: "text-white"
    },
    [NoticeTypeEnum.ANNOUNCEMENT]: {
      icon: Megaphone,
      badgeColor: "bg-purple-500",
      gradient: "from-purple-600 via-purple-500 to-purple-400",
      gradientDark: "from-purple-700 via-purple-600 to-purple-500",
      label: "Announcement",
      textColor: "text-white"
    },
    [NoticeTypeEnum.REMINDER]: {
      icon: Clock,
      badgeColor: "bg-yellow-500",
      gradient: "from-yellow-600 via-yellow-500 to-yellow-400",
      gradientDark: "from-yellow-700 via-yellow-600 to-yellow-500",
      label: "Reminder",
      textColor: "text-white"
    },
    [NoticeTypeEnum.INFO]: {
      icon: Info,
      badgeColor: "bg-gray-500",
      gradient: "from-gray-600 via-gray-500 to-gray-400",
      gradientDark: "from-gray-700 via-gray-600 to-gray-500",
      label: "Info",
      textColor: "text-white"
    },
    [NoticeTypeEnum.SUCCESS]: {
      icon: CheckCircle,
      badgeColor: "bg-green-500",
      gradient: "from-green-600 via-green-500 to-green-400",
      gradientDark: "from-green-700 via-green-600 to-green-500",
      label: "Success",
      textColor: "text-white"
    }
  };
  return configs[type] || configs[NoticeTypeEnum.INFO];
};

export const NoticeBoard = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const loadNotices = async () => {
      try {
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));
        setNotices(MOCK_NOTICES);
      } catch (err: any) {
        setError(err.message || 'Failed to load notices');
      } finally {
        setLoading(false);
      }
    };

    loadNotices();
  }, []);

  // Auto-play carousel effect
  useEffect(() => {
    if (notices.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % notices.length);
    }, 5000); // Change notice every 5 seconds

    return () => clearInterval(interval);
  }, [notices.length, isPaused]);

  const nextNotice = () => {
    setCurrentIndex((prev) => (prev + 1) % notices.length);
  };

  const prevNotice = () => {
    setCurrentIndex((prev) => (prev - 1 + notices.length) % notices.length);
  };

  if (loading) {
    return (
      <div className="relative">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="h-5 w-5 text-gray-700" />
          <h2 className="text-xl font-semibold text-gray-900">Notice Board</h2>
        </div>
        <div className="bg-linear-to-br from-gray-50 to-gray-100 rounded-2xl p-12 border border-gray-200 shadow-lg">
          <div className="flex items-center justify-center py-8">
            <Spinner size={32} className="text-primary-color-new" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="h-5 w-5 text-gray-700" />
          <h2 className="text-xl font-semibold text-gray-900">Notice Board</h2>
        </div>
        <div className="bg-linear-to-br from-red-50 to-red-100 rounded-2xl p-8 border border-red-200 shadow-lg">
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-sm text-red-700 font-medium">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (notices.length === 0) {
    return (
      <div className="relative">
        <div className="bg-linear-to-br from-gray-50 to-gray-100 rounded-2xl p-8 border border-gray-200 shadow-lg">
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-200 mb-4">
              <Bell className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No Notices Available</h3>
            <p className="text-sm text-gray-500">
              No notices available at the moment.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative pt-2">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 px-1">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-gray-700" />
          <h2 className="text-lg font-semibold text-gray-900 uppercase tracking-widest">Notice Board</h2>
          <Badge variant="secondary" className="rounded-full px-2 py-0">
            {notices.length}
          </Badge>
        </div>
        {notices.length > 1 && (
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={prevNotice}
              className="h-9 w-9 p-0 rounded-full border-gray-200 bg-primary-color-new hover:bg-white text-white transition-all shadow-sm flex items-center justify-center"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <span className="text-[15px] font-medium min-w-[45px] text-center uppercase tracking-widest text-gray-500">
              {currentIndex + 1} / {notices.length}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={nextNotice}
              className="h-9 w-9 p-0 rounded-full border-gray-200 bg-primary-color-new hover:bg-white text-white transition-all shadow-sm flex items-center justify-center"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        )}
      </div>

      {/* Main Notice Card - VISA Card Style with Parallax Carousel */}
      <div 
        className="relative w-full overflow-hidden rounded-2xl" 
        style={{ height: '280px' }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {notices.map((notice, index) => {
          const noticeConfig = getNoticeTypeConfig(notice.type as NoticeTypeEnum);
          const NoticeIcon = noticeConfig.icon;
          const noticeDate = new Date(notice.createdAt);
          const noticeFormattedDate = noticeDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          });
          const noticeFormattedTime = noticeDate.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
          });

          // Calculate position in stack
          const distanceFromCurrent = index - currentIndex;
          const isCurrent = index === currentIndex;
          const isNext = distanceFromCurrent === 1 || (currentIndex === notices.length - 1 && index === 0);
          const isPrev = distanceFromCurrent === -1 || (currentIndex === 0 && index === notices.length - 1);
          
          // Calculate transform and opacity based on position
          let transform = '';
          let opacity = 1;
          let zIndex = notices.length - Math.abs(distanceFromCurrent);
          
          if (isCurrent) {
            transform = 'translateX(0) translateY(0) rotate(0deg) scale(1)';
            opacity = 1;
            zIndex = notices.length + 2;
          } else if (isNext) {
            transform = 'translateX(20px) translateY(8px) rotate(2deg) scale(0.95)';
            opacity = 0.7;
            zIndex = notices.length + 1;
          } else if (isPrev) {
            transform = 'translateX(-20px) translateY(8px) rotate(-2deg) scale(0.95)';
            opacity = 0.7;
            zIndex = notices.length;
          } else {
            const offset = Math.abs(distanceFromCurrent) * 15;
            const rotation = distanceFromCurrent > 0 ? 3 : -3;
            transform = `translateX(${distanceFromCurrent > 0 ? offset : -offset}px) translateY(${Math.abs(distanceFromCurrent) * 10}px) rotate(${rotation}deg) scale(${1 - Math.abs(distanceFromCurrent) * 0.05})`;
            opacity = Math.max(0.2, 0.7 - Math.abs(distanceFromCurrent) * 0.15);
            zIndex = Math.max(1, notices.length - Math.abs(distanceFromCurrent));
          }

          return (
            <div
              key={notice.id}
              className="absolute w-full h-full transition-all duration-500 ease-out"
              style={{
                transform,
                opacity,
                zIndex,
                transformOrigin: 'center center',
                willChange: 'transform, opacity'
              }}
            >
              <div
                className={cn(
                  "relative bg-[#0f1729] rounded-2xl shadow-xl transition-all duration-500",
                  "text-white overflow-hidden",
                  "w-full h-full",
                  isCurrent && "cursor-pointer border border-white/10"
                )}
              >
                {/* Decorative Background Patterns */}
                <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -mr-40 -mt-40 blur-3xl" />
                <div className="absolute bottom-0 left-0 w-60 h-60 bg-white/5 rounded-full -ml-30 -mb-30 blur-2xl" />
                
                {/* Card Chip Effect (Top Left) - Adjusted to not overlap weirdly */}
                <div className="absolute top-6 left-6 w-12 h-10 bg-linear-to-br from-white/20 to-white/5 rounded-md backdrop-blur-sm border border-white/10 shadow-md opacity-40" />
                
                {/* Contactless Symbol (Top Right) */}
                <div className="absolute top-6 right-6 flex items-center gap-1 opacity-30">
                  <div className="w-8 h-8 border border-white/30 rounded-full flex items-center justify-center">
                    <div className="w-4 h-4 border border-white/30 rounded-full"></div>
                  </div>
                </div>

                {/* Card Content */}
                <div className="relative z-10 h-full flex flex-col px-8 py-7">
                  {/* Top Section - Badge */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={cn("p-2.5 rounded-xl border border-white/10 backdrop-blur-md shadow-inner", noticeConfig.badgeColor)}>
                        <NoticeIcon className="h-5 w-5 text-white" />
                      </div>
                      <Badge className={cn("text-white border-white/20 text-[10px] font-bold uppercase tracking-widest px-3 py-1", noticeConfig.badgeColor)}>
                        {noticeConfig.label}
                      </Badge>
                    </div>
                  </div>

                  {/* Middle Section - Title and Description */}
                  <div className="flex-1 flex flex-col justify-start mt-2 mb-4">
                    <h3 className="text-xl font-bold mb-2 text-white leading-tight tracking-tight">
                      {notice.title}
                    </h3>
                    <p className="text-white/70 text-sm leading-relaxed line-clamp-3 font-medium">
                      {notice.description}
                    </p>
                  </div>

                  {/* Bottom Section - Card Number Style Layout */}
                  <div className="mt-auto pt-4 border-t border-white/10">
                    <div className="flex items-end justify-between">
                      <div className="flex-1">
                        <div className="text-[9px] text-white/40 mb-1.5 uppercase tracking-widest font-bold">Release Date</div>
                        <div className="flex items-center gap-2 text-white/90">
                          <Clock className="h-4 w-4 text-white/30" />
                          <span className="font-semibold text-[15px] tracking-tight">{noticeFormattedDate} <span className="text-white/40 mx-1">•</span> <span className="text-white/60 text-[13px]">{noticeFormattedTime}</span></span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[9px] text-white/40 mb-1.5 uppercase tracking-widest font-bold">Privilege</div>
                        <div className="flex gap-1.5 justify-end">
                          {notice.roles?.map((role: string) => (
                            <Badge
                              key={role}
                              className="bg-white/10 text-white/80 border-white/10 backdrop-blur-sm capitalize text-[10px] font-semibold px-2 py-0.5"
                            >
                              {role}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default NoticeBoard;
