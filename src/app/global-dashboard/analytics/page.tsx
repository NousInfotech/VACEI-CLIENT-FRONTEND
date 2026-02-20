"use client";

import { BarChart3 } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import ResellerAnalyticsPage from "../../dashboard/reseller-analytics/page";

export default function GlobalAnalyticsPage() {
    return (
        <div className="space-y-8">

            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <ResellerAnalyticsPage />
            </div>
        </div>
    );
}
