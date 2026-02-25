"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import { HugeiconsIcon } from "@hugeicons/react";
import { cn } from "@/lib/utils";
import { MenuItem, MenuSection, SERVICE_METADATA } from "@/lib/menuData";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TruncatedTooltip } from "@/components/ui/TruncatedTooltip";
import { useEngagements } from "@/components/engagement/hooks/useEngagements";
import { ENGAGEMENT_CONFIG } from "@/config/engagementConfig";
import { getTodos, TodoItem } from "@/api/todoService";
import { getDocumentRequests, DocumentRequest } from "@/api/documentRequestService";
import { useActiveCompany } from "@/context/ActiveCompanyContext";
import { SidebarServiceData } from "@/api/companyService";
import { useGlobalDashboard } from "@/context/GlobalDashboardContext";

interface SidebarMenuProps {
  menu: MenuItem[];
  isCollapsed?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
  onExpand?: () => void;
}

type StatusConfig = { label: string; color: string; dotColor: string; description?: string };





export default function SidebarMenu({
  menu,
  isCollapsed = false,
  isOpen = false,
  onClose,
  onExpand,
}: SidebarMenuProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});
  const { engagements } = useEngagements();
  const { activeCompanyId } = useActiveCompany();
  const { sidebarData } = useGlobalDashboard();
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [documentRequestsMap, setDocumentRequestsMap] = useState<Record<string, DocumentRequest[]>>({});

  useEffect(() => {
    if (!activeCompanyId) {
      setTodos([]);
      setDocumentRequestsMap({});
      return;
    }
    const fetchData = async () => {
      if (!activeCompanyId) return;
      try {
        // Fetch todos
        const todosData = await getTodos();
        setTodos(Array.isArray(todosData) ? todosData : []);

        // Fetch document requests if we have engagements
        if (engagements.length > 0) {
          const promises = engagements.map(eng => {
            const id = eng.id || eng._id;
            return getDocumentRequests(id).then(data => ({ id, data }));
          });
          const results = await Promise.all(promises);
          const map: Record<string, DocumentRequest[]> = {};
          results.forEach(res => {
            map[res.id] = res.data;
          });
          setDocumentRequestsMap(map);
        }
      } catch (e) {
        console.error("Failed to fetch sidebar status data", e);
      }
    };
    fetchData();
  }, [activeCompanyId, engagements]);
  const sections: { id: MenuSection; label: string }[] = useMemo(() => [
    { id: "primary", label: "Client portal" },
    { id: "operations", label: "Operations & tools" },
    { id: "settings", label: "Settings" },
  ], []);

  const dynamicMenu = useMemo(() => {
    return menu.map((item) => {
      if (item.slug === "services-root") {
        const dynamicChildren = sidebarData.map((s) => {
          // Normalize service name to match SERVICE_METADATA keys
          // Replace all non-alphanumeric with _, collapse multiple _, trim _
          const normalized = s.serviceName.toUpperCase().replace(/[^A-Z0-9]+/g, "_").replace(/^_+|_+$/g, "");
          
          // Try to find a matching metadata key by comparing normalized name with key or label
          const metadataKey = (Object.keys(SERVICE_METADATA).find(k => {
            const metadata = SERVICE_METADATA[k];
            const normalizedKey = k.replace(/[^A-Z0-9]+/g, "_");
            const normalizedLabel = metadata.label.toUpperCase().replace(/[^A-Z0-9]+/g, "_").replace(/^_+|_+$/g, "");
            
            return normalized === normalizedKey || normalized === normalizedLabel || 
                   normalizedKey.includes(normalized) || normalizedLabel.includes(normalized);
          }) || "CUSTOM") as keyof typeof SERVICE_METADATA;
          
          const metadata = SERVICE_METADATA[metadataKey];

          // Check for single engagement to modify href
          const hasSingleEngagement = s.activeEngagements && s.activeEngagements.length === 1;
          const engagementId = hasSingleEngagement ? s.activeEngagements[0].id : undefined;

          return {
            slug: s.serviceName.toLowerCase().replace(/\s+/g, "-"),
            icon: metadata.icon,
            label: s.serviceName,
            href: metadata.href, // Only use base href here, as lower down it appends engagementId again
            isActive: true,
          } as MenuItem;
        });
        return { ...item, children: dynamicChildren };
      }
      return item;
    });
  }, [menu, sidebarData]);

  const grouped: Record<MenuSection, MenuItem[]> = useMemo(() => {
    const res: Record<MenuSection, MenuItem[]> = {
      primary: [],
      workspaces: [],
      operations: [],
      settings: [],
    };
    dynamicMenu.forEach((item) => {
      const section = item.section || "primary";
      res[section].push(item);
    });
    return res;
  }, [dynamicMenu]);

  // Build sidebar status from backend data
  const serviceStatusConfig = useMemo((): {
    items: Record<string, StatusConfig & { engagementId?: string; engagementCount: number }>;
    sections: Record<string, StatusConfig>;
  } => {
    const itemStatus: Record<string, StatusConfig & { engagementId?: string; engagementCount: number }> = {};
    const sectionStatus: Record<string, StatusConfig> = {};

    const COMPLIANCE_MAP: Record<string, StatusConfig> = {
      OVERDUE: { label: "Overdue", color: "text-red-500", dotColor: "bg-red-500" },
      DUE_TODAY: { label: "Due today", color: "text-amber-500", dotColor: "bg-amber-500" },
      DUE_SOON: { label: "Due soon", color: "text-yellow-500", dotColor: "bg-yellow-500" },
      ACTION_REQUIRED: { label: "Action required", color: "text-orange-500", dotColor: "bg-orange-500" },
      ACTION_TAKEN: { label: "Action taken", color: "text-blue-500", dotColor: "bg-blue-500" },
      COMPLETED: { label: "Completed", color: "text-emerald-500", dotColor: "bg-emerald-500" },
      ON_TRACK: { label: "On track", color: "text-emerald-500", dotColor: "bg-emerald-500" },
    };

    const COMPLIANCE_ORDER = [
      "OVERDUE",
      "DUE_TODAY",
      "DUE_SOON",
      "ACTION_REQUIRED",
      "ACTION_TAKEN",
      "COMPLETED",
      "ON_TRACK",
    ];

    const pickWorst = (statuses: string[]) => {
      if (statuses.length === 0) return null;
      let worstIndex = COMPLIANCE_ORDER.length - 1;
      statuses.forEach((s) => {
        const index = COMPLIANCE_ORDER.indexOf(s);
        if (index !== -1 && index < worstIndex) {
          worstIndex = index;
        }
      });
      return COMPLIANCE_ORDER[worstIndex];
    };

    // 1. Map backend data to individual items using serviceName derived slugs
    sidebarData.forEach((item) => {
      const slug = item.serviceName.toLowerCase().replace(/\s+/g, "-");
      const compliance = COMPLIANCE_MAP[item.worstCompliance] || COMPLIANCE_MAP.ON_TRACK;
      itemStatus[slug] = {
        ...compliance,
        engagementCount: item.activeEngagements?.length || 0,
        engagementId: item.activeEngagements?.length === 1 ? item.activeEngagements[0].id : undefined
      };
    });

    // 2. Aggregate status for parent items
    const aggregateItemStatus = (items: MenuItem[]): string | null => {
      const childrenStatuses: string[] = [];
      items.forEach((item) => {
        const currentItemConfig = itemStatus[item.slug];
        let currentStatusKey = Object.keys(COMPLIANCE_MAP).find(
          (key) => COMPLIANCE_MAP[key].label === currentItemConfig?.label
        ) || null;

        if (item.children && item.children.length > 0) {
          const childStatusKey = aggregateItemStatus(item.children);
          if (childStatusKey) {
            currentStatusKey = pickWorst([currentStatusKey, childStatusKey].filter(Boolean) as string[]);
          }
        }
        
        if (currentStatusKey) {
          const compliance = COMPLIANCE_MAP[currentStatusKey];
          itemStatus[item.slug] = {
            ...compliance,
            engagementCount: currentItemConfig?.engagementCount || 0,
            engagementId: currentItemConfig?.engagementId
          };
          childrenStatuses.push(currentStatusKey);
        }
      });
      return pickWorst(childrenStatuses);
    };

    aggregateItemStatus(dynamicMenu);

    // 3. Aggregate status for sections
    sections.forEach(section => {
      const sectionItems = dynamicMenu.filter(item => (item.section || "primary") === section.id);
      const statuses = sectionItems
        .map(item => Object.keys(COMPLIANCE_MAP).find(
          key => COMPLIANCE_MAP[key].label === itemStatus[item.slug]?.label
        ))
        .filter(Boolean) as string[];
      
      const worst = pickWorst(statuses);
      if (worst) {
        sectionStatus[section.id] = COMPLIANCE_MAP[worst];
      }
    });

    return { items: itemStatus, sections: sectionStatus };
  }, [sidebarData, dynamicMenu, sections]);

  // User data from localStorage
  const [user, setUser] = useState({
    name: "User",
    email: "email@example.com",
    role: "user",
  });

  // Find the best matching menu item for the current path
  const getBestMatch = (items: MenuItem[]): MenuItem | null => {
    let best: MenuItem | null = null;
    const currentFullUrl = pathname + (searchParams.toString() ? "?" + searchParams.toString() : "");

    const traverse = (list: MenuItem[]) => {
      list.forEach((item) => {
        if (item.href && item.href !== "#") {
          const isExact = pathname === item.href || currentFullUrl === item.href;
          const isSubPath =
            item.href !== "/dashboard" && pathname.startsWith(item.href + "/");

          if (isExact || isSubPath) {
            if (!best || item.href.length > best.href.length) {
              best = item;
            }
          }
        }
        if (item.children) traverse(item.children);
      });
    };

    traverse(items);
    return best;
  };

  const bestMatch = getBestMatch(dynamicMenu);

  // Auto-expand parent if a child is active
  useEffect(() => {
    if (!bestMatch) return;

    // Find the parent of bestMatch
    let parentSlug: string | null = null;
    const findParent = (list: MenuItem[], currentParent: MenuItem | null = null) => {
      for (const item of list) {
        if (item.slug === bestMatch.slug && currentParent) {
          parentSlug = currentParent.slug;
          return;
        }
        if (item.children) {
          findParent(item.children, item);
        }
      }
    };
    findParent(menu);

    if (parentSlug) {
      setOpenItems(prev => ({
        ...prev,
        [parentSlug!]: true
      }));
    }
  }, [bestMatch, menu]);

  const branding = {
    sidebar_background_color: "15, 23, 41",
    sidebar_footer_color: "222 47% 16%",
    sidebar_text_color: "220 14% 96%",
  };

  const orgName = "Vacei";
  const orgSubname = "CLIENT SERVICE PORTAL";
  const logoUrl = "/logo/logo2.png";

  useEffect(() => {
    try {
      const nameFromStorage = localStorage.getItem("username")
        ? atob(localStorage.getItem("username")!)
        : null;
      const emailFromStorage = localStorage.getItem("email")
        ? atob(localStorage.getItem("email")!)
        : null;
      if (nameFromStorage) {
        setUser((prev) => ({ ...prev, name: nameFromStorage }));
      }
      if (emailFromStorage) {
        setUser((prev) => ({ ...prev, email: emailFromStorage }));
      }
    } catch (e) {
      console.error("Error decoding user info", e);
    }
  }, []);

  const toggleItem = (slug: string) => {
    setOpenItems((prev) => ({
      ...prev,
      [slug]: !prev[slug],
    }));
  };

  const handleMenuClick = (
    e: React.MouseEvent,
    item: MenuItem,
    hasChildren: boolean,
  ) => {
    if (isCollapsed && hasChildren) {
      if (onExpand) onExpand();
      if (!openItems[item.slug]) {
        toggleItem(item.slug);
      }

      // Scroll to the top of the clicked section after expansion
      // Using a slightly longer timeout to account for the sidebar expansion transition (300ms)
      const target = (e.currentTarget as HTMLElement).closest("li");
      if (target) {
        setTimeout(() => {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 400);
      }

      // Only prevent default if there's no actual link to navigate to
      if (!item.href || item.href === "#") {
        e.preventDefault();
      }
      return;
    }

    if (hasChildren && !isCollapsed) {
      toggleItem(item.slug);
      // Allow navigation for specific hubs even if they have children
      const isHub = [
        "services-root",
        "document-organizer",
        "settings",
        "payroll",
        "accounting-bookkeeping",
        "vat",
        "tax",
        "cfo",
        "audit",
        "csp",
        "grants-incentives",
        "mbr-filing",
        "incorporation",
        "business-plans",
        "liquidation",
        "banking-payments",
        "international-structuring",
        "crypto-digital-assets",
      ].includes(item.slug);
      if (!isHub) {
        e.preventDefault();
      }
    } else if (item.href && item.href !== "#") {
      // onClose is for mobile
      if (onClose) onClose();
    }
  };


  const renderMenuItem = (item: MenuItem, level = 1) => {
    const hasChildren = !!(item.children && item.children.length > 0);
    const isItemOpen = openItems[item.slug];

    const checkActive = (it: MenuItem): boolean => {
      if (!it.href || it.href === "#") {
        return !!(it.children && it.children.some(checkActive));
      }

      // Special case for root Dashboard: only match exactly
      if (it.href === "/dashboard") {
        return pathname === "/dashboard";
      }

      // Check if THIS is the best match in the entire menu
      const isBestMatch = it.slug === bestMatch?.slug;
      if (isBestMatch) return true;

      // Otherwise, check if any children are active (for recursive highlighting)
      if (it.children) return it.children.some(checkActive);

      return false;
    };
    const isActive = checkActive(item);

    if (level === 1) {
      const linkContent = (
        <Link
          key={item.slug}
          href={item.disabled ? "#" : item.href || "#"}
          onClick={(e) => {
            if (item.disabled) {
              e.preventDefault();
              return;
            }
            handleMenuClick(e, item, hasChildren);
          }}
          className={cn(
            "group relative flex items-center transition-all duration-300 ease-out",
            isCollapsed
              ? "justify-center px-2 py-3 rounded-2xl"
              : "gap-2 px-3 py-3 rounded-2xl",
            "hover:scale-[1.02] hover:shadow-lg border",
            item.disabled && "opacity-50 cursor-not-allowed grayscale",
          )}
          style={{
            backgroundColor: isActive
              ? `hsl(var(--sidebar-active))`
              : "transparent",
            color: isActive
              ? `hsl(var(--sidebar-foreground))`
              : `hsl(var(--sidebar-foreground) / 0.8)`,
            borderColor: isActive
              ? `hsl(var(--sidebar-border))`
              : "transparent",
            pointerEvents: item.disabled ? "auto" : undefined, // Keep auto so cursor-not-allowed shows
          }}
        >
          {/* Active indicator */}
          {isActive && !isCollapsed && (
            <div
              className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full"
              style={{ backgroundColor: `hsl(var(--accent))` }}
            ></div>
          )}

          {/* Icon container */}
          <div
            className={cn(
              "relative flex items-center justify-center transition-all duration-300",
              isCollapsed ? "w-8 h-8" : "w-10 h-10",
              "rounded-xl",
            )}
            style={{
              backgroundColor: isActive
                ? `hsl(var(--accent))`
                : `hsl(${branding.sidebar_footer_color})`,
              color: isActive
                ? `hsl(var(--accent-foreground))`
                : `hsl(var(--sidebar-foreground))`,
            }}
          >
            <HugeiconsIcon
              icon={item.icon}
              className={cn(isCollapsed ? "h-4 w-4" : "h-5 w-5", "shrink-0")}
            />
          </div>

          {/* Text content */}
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between w-full gap-2">
                <TruncatedTooltip className="font-semibold text-sm truncate min-w-0">
                  {item.label}
                </TruncatedTooltip>
                <div className="flex items-center gap-2">
                  {item.count !== undefined && item.count > 0 && (
                    <span className="flex items-center justify-center min-w-5 h-5 px-2 rounded-full bg-accent text-accent-foreground text-[10px] font-bold">
                      {item.count} Total
                    </span>
                  )}
                  {serviceStatusConfig.items[item.slug] && serviceStatusConfig.items[item.slug].engagementCount > 0 && (
                    <div className="flex items-center gap-1.5 opacity-90 scale-[0.85] origin-right shrink-0">
                      <div className={cn(
                        "w-1.5 h-1.5 rounded-full animate-pulse",
                        serviceStatusConfig.items[item.slug].dotColor
                      )} />
                    </div>
                  )}
                  {hasChildren &&
                    !item.disabled &&
                    (isItemOpen ? (
                      <ChevronUp className="h-4 w-4 opacity-50" />
                    ) : (
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    ))}
                </div>
              </div>
              {item.description && (
                <TruncatedTooltip className="text-[11px] leading-tight opacity-50 truncate mt-0.5 font-medium min-w-0">
                  {item.description}
                </TruncatedTooltip>
              )}
            </div>
          )}

          {/* Hover effect */}
          {!item.disabled && (
            <div
              className={cn(
                "absolute inset-0 transition-opacity duration-300 rounded-2xl pointer-events-none",
                isActive ? "opacity-0" : "opacity-0 group-hover:opacity-10",
              )}
              style={{ backgroundColor: `hsl(var(--sidebar-foreground))` }}
            ></div>
          )}
        </Link>
      );

      return (
        <li key={item.slug} className="space-y-1">
          {isCollapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
              <TooltipContent
                side="right"
                className="bg-sidebar-accent text-sidebar-accent-foreground border-sidebar-border shadow-lg p-3 max-w-xs"
              >
                <div className="space-y-1">
                  <p className="font-bold text-sm leading-none">{item.label}</p>
                  {item.description && (
                    <p className="text-[11px] opacity-70 leading-relaxed">
                      {item.description}
                    </p>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          ) : (
            linkContent
          )}

          {hasChildren && isItemOpen && !isCollapsed && (
            <ul className="ml-4 space-y-1 mt-1 border-l border-white/10 pl-2 py-1">
              {item.children?.map((child) => renderMenuItem(child, level + 1))}
            </ul>
          )}
        </li>
      );
    }

    // Recursive items (Level 2+)
    const isServiceActive = item.isActive !== false; // Default to active if not specified
    const itemConfig = serviceStatusConfig.items[item.slug];
    const engagementId = itemConfig?.engagementId;

    const serviceHref = isServiceActive
      ? engagementId 
        ? `${item.href}/${engagementId}`
        : item.href || "#"
      : "/dashboard/services/request";

    return (
      <li key={item.slug} className="space-y-1">
        <Link
          href={item.disabled ? "#" : serviceHref}
          onClick={(e) => {
            if (item.disabled) {
              e.preventDefault();
              return;
            }
            if (hasChildren) {
              toggleItem(item.slug);
              // Allow service headers to navigate while being a dropdown
              const isNavigableHeader = [
                "audit",
                "vat",
                "tax",
                "payroll",
                "accounting-bookkeeping",
                "client-facing-content",
                "csp",
                "cfo",
                "grants-incentives",
                "mbr-filing",
                "incorporation",
                "business-plans",
                "liquidation",
                "banking-payments",
                "international-structuring",
                "crypto-digital-assets",
                "regulated-licenses",
              ].includes(item.slug);
              if (!isNavigableHeader) {
                e.preventDefault();
              }
            } else if (onClose && serviceHref !== "#") {
              onClose();
            }
          }}
          className={cn(
            "flex items-center justify-between px-2 py-2 rounded-xl transition-all gap-2",
            item.disabled
              ? "opacity-50 cursor-not-allowed grayscale hover:bg-white/5"
              : isServiceActive
                ? "hover:bg-white/5"
                : "opacity-50 cursor-not-allowed hover:bg-white/5",
            isActive
              ? "text-white font-semibold bg-white/10 shadow-sm"
              : "text-white/60",
            level >= 3 ? "text-md" : "text-sm",
          )}
          style={{
            pointerEvents: item.disabled ? "auto" : undefined,
          }}
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <HugeiconsIcon
              icon={item.icon}
              className={cn(
                level >= 3 ? "h-3 w-3" : "h-4 w-4",
                "shrink-0",
                (!isServiceActive || item.disabled) && "opacity-50",
              )}
            />
            <TruncatedTooltip className="truncate min-w-0">{item.label}</TruncatedTooltip>
          </div>
          <div className="flex items-center gap-2">
            {item.count !== undefined && item.count > 0 && (
              <span className="flex items-center justify-center min-w-5 h-5 px-2 rounded-full bg-white/10 text-white text-[10px] font-bold">
                {item.count} Total
              </span>
            )}
            {serviceStatusConfig.items[item.slug] && serviceStatusConfig.items[item.slug].engagementCount > 0 && (
              <div className="flex items-center gap-1.5 opacity-90 scale-[0.85] origin-right ml-2 shrink-0">
                <div className={cn(
                  "w-1.5 h-1.5 rounded-full animate-pulse",
                  serviceStatusConfig.items[item.slug].dotColor
                )} />
                <span className={cn(
                  "text-[10px] font-bold uppercase tracking-wider whitespace-nowrap",
                  serviceStatusConfig.items[item.slug].color
                )}>
                  {serviceStatusConfig.items[item.slug].label}
                </span>
              </div>
            )}
            {!isServiceActive && !hasChildren && !item.disabled && (
              <span className="text-[10px] font-medium text-white/40 uppercase tracking-wider ml-2 shrink-0">
                Request service
              </span>
            )}
            {hasChildren &&
              !item.disabled &&
              (isItemOpen ? (
                <ChevronUp className="h-3 w-3 opacity-50 shrink-0" />
              ) : (
                <ChevronDown className="h-3 w-3 opacity-50 shrink-0" />
              ))}
          </div>
        </Link>

        {hasChildren && isItemOpen && (
          <ul className="ml-4 space-y-1 mt-1 border-l border-white/10 py-1">
            {item.children?.map((child) => renderMenuItem(child, level + 1))}
          </ul>
        )}
      </li>
    );
  };

  return (
    <TooltipProvider delayDuration={300}>
      <div
        className={cn(
          "flex flex-col transform transition-all duration-300 ease-in-out z-50",
          "fixed inset-y-0 left-0 w-64 h-full lg:h-auto",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          isCollapsed
            ? "lg:fixed lg:top-4 lg:bottom-4 lg:left-4 lg:w-20 lg:h-[calc(100vh-2rem)]"
            : "lg:absolute lg:top-4 lg:bottom-4 lg:left-4 lg:w-80 lg:max-w-[4000px] lg:h-[calc(100vh-2rem)]",
          "border-r shadow-xl",
          "rounded-r-4xl lg:rounded-4xl",
        )}
        style={{
          backgroundColor: `rgb(${branding?.sidebar_background_color || "15, 23, 41"})`,
          color: `hsl(${branding?.sidebar_text_color || "220 14% 96%"})`,
          borderColor: `hsl(${branding?.sidebar_background_color || "222 47% 11%"} / 0.5)`,
        }}
      >
        {/* Header */}
        <div
          className={cn("border-b relative", isCollapsed ? "p-4" : "p-6")}
          style={{ borderColor: `hsl(var(--sidebar-border))` }}
        >
          <div className="flex items-center gap-4">
            <div className="relative">
              <div
                className={cn(
                  "rounded-2xl flex items-center justify-center shadow-lg p-1",
                  isCollapsed ? "w-12 h-12" : "w-16 h-16",
                )}
                style={{
                  background: `linear-gradient(to bottom right, hsl(var(--sidebar-logo-bg)), hsl(var(--sidebar-hover)))`,
                  borderColor: `hsl(var(--sidebar-border))`,
                  borderWidth: "1px",
                }}
              >
                <img
                  src={logoUrl}
                  alt="Logo"
                  className={cn(
                    "object-contain rounded-lg",
                    isCollapsed ? "h-10 w-10" : "h-12 w-12",
                  )}
                />
              </div>
              <div
                className="absolute inset-0 rounded-2xl blur-sm"
                style={{
                  backgroundColor: `hsl(${branding.sidebar_footer_color} / 0.05)`,
                }}
              ></div>
            </div>

            <div
              className={cn(
                "flex-1 transition-all duration-300 ease-in-out",
                isCollapsed
                  ? "lg:opacity-0 lg:w-0 lg:overflow-hidden"
                  : "lg:opacity-100 lg:w-auto",
              )}
            >
              <div className="space-y-1">
                <h1
                  className="text-2xl font-bold tracking-tight"
                  style={{ color: `hsl(var(--sidebar-foreground))` }}
                >
                  {orgName}
                </h1>
                <p
                  className="text-xs font-medium uppercase tracking-wider opacity-70"
                  style={{ color: `hsl(var(--sidebar-foreground))` }}
                >
                  {orgSubname}
                </p>
              </div>
            </div>
          </div>

          <button
            className="md:hidden absolute top-6 right-6 p-2 rounded-lg transition-colors hover:bg-white/10"
            onClick={onClose}
            aria-label="Close Menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto scrollbar-hide p-4">
          <ul className="space-y-6">
            {sections.map((section) => {
              const items = grouped[section.id];
              if (!items.length) return null;
              return (
                <li key={section.id} className="space-y-2">
                  {!isCollapsed && (
                    <div className="flex items-center justify-between px-4 py-1">
                      <p className="text-[11px] font-medium tracking-widest uppercase text-white/60">
                        {section.label}
                      </p>
                      {/* {serviceStatusConfig.sections[section.id] && (
                        <div className="flex items-center gap-1.5 opacity-90 scale-[0.8] origin-right shrink-0">
                          <div className={cn(
                            "w-1.5 h-1.5 rounded-full animate-pulse",
                            serviceStatusConfig.sections[section.id].dotColor
                          )} />
                          <span className={cn(
                            "text-[9px] font-bold uppercase tracking-wider",
                            serviceStatusConfig.sections[section.id].color
                          )}>
                            {serviceStatusConfig.sections[section.id].label}
                          </span>
                        </div>
                      )} */}
                    </div>
                  )}
                  <ul className="space-y-2">
                    {items.map((item) => renderMenuItem(item))}
                  </ul>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer / User */}
        <div
          className={cn("border-t p-4", isCollapsed ? "p-2" : "p-4")}
          style={{ borderColor: `hsl(var(--sidebar-hover))` }}
        >
          <div
            className={cn("border rounded-2xl", isCollapsed ? "p-2" : "p-4")}
            style={{
              backgroundColor: `hsl(${branding.sidebar_footer_color})`,
              borderColor: `hsl(${branding.sidebar_footer_color})`,
            }}
          >
            <div
              className={cn(
                "flex items-center",
                isCollapsed ? "justify-center" : "gap-3",
              )}
            >
              <div className="relative">
                <div
                  className={cn(
                    "rounded-2xl flex items-center justify-center",
                    isCollapsed ? "w-8 h-8" : "w-10 h-10",
                  )}
                  style={{ backgroundColor: `hsl(var(--accent))` }}
                >
                  <span
                    className={cn(
                      "font-bold",
                      isCollapsed ? "text-xs" : "text-sm",
                    )}
                    style={{ color: `hsl(var(--accent-foreground))` }}
                  >
                    {user.name?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
                <div
                  className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2"
                  style={{ borderColor: `hsl(var(--sidebar-background))` }}
                ></div>
              </div>

              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <TruncatedTooltip
                    className="text-sm font-semibold truncate min-w-0"
                    style={{ color: `hsl(var(--sidebar-foreground))` }}
                  >
                    {user.name}
                  </TruncatedTooltip>
                  <TruncatedTooltip
                    className="text-xs truncate opacity-70 min-w-0"
                    style={{ color: `hsl(var(--sidebar-foreground))` }}
                  >
                    {user.email}
                  </TruncatedTooltip>
                  <div className="flex items-center gap-1 mt-1">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                    <span
                      className="text-xs opacity-70"
                      style={{ color: `hsl(var(--sidebar-foreground))` }}
                    >
                      Online
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
