"use client";

import { HelpCircle, MessageSquare } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";

export default function GlobalSupportPage() {
    return (
        <div className="space-y-8">
            <PageHeader 
                title="Support"
                subtitle="Get assistance and help from our team."
                icon={HelpCircle}
            />

            <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 bg-white rounded-3xl border border-slate-200 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="w-16 h-16 rounded-3xl bg-slate-50 flex items-center justify-center mb-6 border border-slate-100 shadow-inner">
                    <MessageSquare className="w-8 h-8 text-primary-color-new" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Support Center</h2>
                <p className="text-slate-600 font-medium max-w-md leading-relaxed">
                    The support module is currently under development and will be available soon. 
                    If you need immediate assistance, please contact your account manager directly.
                </p>
                <div className="mt-8 px-6 py-2.5 bg-slate-50 rounded-full text-xs font-bold text-slate-500 uppercase tracking-widest leading-none border border-slate-200 shadow-xs">
                    Currently developing
                </div>
            </div>
        </div>
    );
}
