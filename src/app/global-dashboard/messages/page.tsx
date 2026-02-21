"use client";

import Messages from "@/components/dashboard/messages/Messages";

export default function GlobalMessagesPage() {
    return (
        <div className="flex flex-col h-[calc(100vh-120px)] w-full pb-4 px-4 overflow-hidden">

            <div className="flex-1 bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500 min-h-0 mt-4">
                <Messages />
            </div>
        </div>
    );
}
