"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { label: "Recurring Expenses", href: "/insights" },
  { label: "Burn Rate", href: "#" },
  { label: "Flux Insights", href: "#" },
];

export default function InsightsTabs() {
  const pathname = usePathname();

  return (
    <div className="mb-6 border-b border-border dark:border-gray-700">
      <ul className="flex flex-wrap -mb-px text-sm font-medium text-center text-muted-foreground dark:text-muted-foreground">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <li className="me-5" key={tab.label} role="presentation">
              <Link
                href={tab.href}
                className={`inline-block px-2 py-3 border-b-2 text-[15px] transition-all ${isActive
                    ? "text-primary border-color active"
                    : "border-transparent"
                  }`}
              >
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
