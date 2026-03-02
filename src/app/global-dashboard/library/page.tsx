"use client";

import { Library } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import { LibraryExplorer } from "@/components/library/LibraryExplorer";

export default function GlobalLibraryPage() {
    return (
        <div className="flex flex-col h-[calc(100vh-100px)] -m-4 lg:-m-6 overflow-hidden">
            <div className="p-4 lg:p-6 pb-2">
                <PageHeader 
                    title="Global Library"
                    icon={Library}
                />
            </div>

            <div className="flex-1 mx-5 rounded-2xl min-h-0 bg-white border-t border-gray-200">
                <LibraryExplorer useApi={true} />
            </div>
        </div>
    );
}
