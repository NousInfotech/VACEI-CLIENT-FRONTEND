"use client";

import { Bell } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import NotificationsPage from "../../dashboard/notifications/page";

export default function GlobalAlertsPage() {
    return (
        <div className="space-y-8">
            <PageHeader 
                title="Alerts & Notifications"
                subtitle="Stay updated with the latest alerts and reminders across all entities."
                icon={Bell}
            />

            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <NotificationsPage />
            </div>
        </div>
    );
}
