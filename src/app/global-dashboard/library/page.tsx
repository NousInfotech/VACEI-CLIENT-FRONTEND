"use client";

import { Library } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import { LibraryExplorer } from "@/components/library/LibraryExplorer";

export default function GlobalLibraryPage() {
    return (
        <div className="space-y-8">
            <PageHeader 
                title="Global Library"
                subtitle="Centralized document storage for all your business entities."
                icon={Library}
            />

            <div className="bg-white rounded-2xl overflow-hidden border border-white/10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <LibraryExplorer useApi={true} />
            </div>
        </div>
    );
}
