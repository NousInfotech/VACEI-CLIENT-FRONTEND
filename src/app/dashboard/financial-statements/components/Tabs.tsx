"use client";

import { useRouter, usePathname } from "next/navigation";

const tabs = [
  { label: "Profit & Loss", href: "/dashboard/financial-statements/profit-loss" },
  { label: "Balance Sheet", href: "/dashboard/financial-statements/balance-sheet" },
  { label: "Cash Flow Statement", href: "/dashboard/financial-statements/cash-flow-statement" },
];

export default function ReportTabs() {
  const router = useRouter();
  const pathname = usePathname();  // <-- get current path here

  return (
    <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
      <ul className="flex flex-wrap -mb-px text-sm font-medium text-center text-gray-500 dark:text-gray-400">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <li className="me-5" key={tab.label} role="presentation">
              <button
                onClick={() => router.push(tab.href)}
                className={`inline-flex items-center gap-2 px-2 py-3 border-b-2 text-sm transition-all cursor-pointer ${
                  isActive
                    ? "text-sky-800 border-sky-800 active font-medium"
                    : "border-transparent text-black font-normal"
                }`}
                type="button"
              >
                {tab.label}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
