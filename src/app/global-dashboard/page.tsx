"use client";

import { useState, useEffect } from "react";
import { LayoutGrid } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import GlobalOverviewCards from "@/components/dashboard/GlobalOverviewCards";
import { getDecodedUsername } from "@/utils/authUtils";

export default function GlobalDashboardPage() {
    const [username, setUsername] = useState<string>('');

    useEffect(() => {
        const decoded = getDecodedUsername();
        if (decoded) {
            setUsername(decoded);
        }
    }, []);

    const getGreeting = () => {
        const hour = new Date().getHours();
        let timeGreeting = '';
        if (hour < 12) timeGreeting = 'Good morning';
        else if (hour < 17) timeGreeting = 'Good afternoon';
        else timeGreeting = 'Good evening';
        
        if (username && username.trim()) {
            const firstName = username.split(' ')[0];
            return `${timeGreeting}, ${firstName}!`;
        }
        return `${timeGreeting}!`;
    };

    return (
        <div className="space-y-8">
            <PageHeader 
                title={getGreeting()}
                subtitle="Here's your compliance status and what's happening with your business today."
                icon={LayoutGrid}
            />

            <div className="mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <GlobalOverviewCards />
            </div>
        </div>
    );
}
