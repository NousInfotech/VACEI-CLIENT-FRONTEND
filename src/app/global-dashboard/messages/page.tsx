"use client";

import { MessageSquare } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import Messages from "@/components/dashboard/messages/Messages";

export default function GlobalMessagesPage() {
    return (
        <div className="space-y-8">
            <PageHeader 
                title="Messages"
                subtitle="Unified message center for all your companies."
                icon={MessageSquare}
            />

            <div className="bg-white rounded-2xl overflow-hidden border border-white/10 p-4 min-h-[600px] animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Messages />
            </div>
        </div>
    );
}
