"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  documents: "Documents",
  services: "Services",
  compliance: "Compliance",
  list: "List",
  detail: "Detail",
  "todo-list": "To-Do",
  notifications: "Notifications",
  settings: "Settings",
  messages: "Messages",
};

export default function Breadcrumbs() {
  const pathname = usePathname();

  if (!pathname || !pathname.startsWith("/dashboard")) {
    return null;
  }

  const segments = pathname
    .split("/")
    .filter(Boolean); // remove empty parts

  const items = segments.map((seg, index) => {
    const href = "/" + segments.slice(0, index + 1).join("/");
    const isLast = index === segments.length - 1;
    const label = LABELS[seg] ?? seg.replace(/-/g, " ");
    return { href, label, isLast };
  });

  return (
    <nav
      aria-label="Breadcrumb"
      className="hidden lg:flex items-center gap-2 px-6 pt-2 pb-1 text-xs text-muted-foreground"
    >
      {items.map((item, idx) => (
        <span key={item.href} className="flex items-center gap-2">
          {idx > 0 && <span className="text-[10px]">/</span>}
          {item.isLast ? (
            <span className="font-medium text-foreground line-clamp-1">
              {item.label}
            </span>
          ) : (
            <Link
              href={item.href}
              className="hover:text-primary transition-colors line-clamp-1"
            >
              {item.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}


