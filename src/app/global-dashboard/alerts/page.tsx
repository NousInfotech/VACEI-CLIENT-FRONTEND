"use client";

import NotificationsPage from "../../dashboard/notifications/page";

export default function GlobalAlertsPage() {
    return (
        <div className="space-y-8">
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <NotificationsPage />
            </div>
        </div>
    );
}
