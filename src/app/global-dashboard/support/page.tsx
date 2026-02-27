"use client";

import React, { useState } from "react";
import { 
    HelpCircle, 
    Send, 
    CheckCircle2, 
    LifeBuoy, 
    MessageSquare, 
    ShieldAlert, 
    Clock, 
    Flag,
    AlertCircle
} from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import DashboardCard from "@/components/DashboardCard";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import Dropdown, { DropdownItem } from "@/components/Dropdown";
import { cn } from "@/lib/utils";

const CATEGORIES = [
    { id: "incorporation", label: "Incorporation Support", icon: <Flag className="w-4 h-4" /> },
    { id: "kyc", label: "KYC & Verification", icon: <ShieldAlert className="w-4 h-4" /> },
    { id: "billing", label: "Billing & Invoices", icon: <MessageSquare className="w-4 h-4" /> },
    { id: "technical", label: "Technical Issue", icon: <AlertCircle className="w-4 h-4" /> },
    { id: "other", label: "General Inquiry", icon: <HelpCircle className="w-4 h-4" /> },
];

const PRIORITIES = [
    { id: "low", label: "Low", color: "bg-blue-500" },
    { id: "medium", label: "Medium", color: "bg-amber-500" },
    { id: "high", label: "High", color: "bg-orange-500" },
    { id: "urgent", label: "Urgent", color: "bg-red-500" },
];

export default function GlobalSupportPage() {
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        category: "incorporation",
        priority: "medium",
        subject: "",
        message: ""
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1200));

        console.log("Support Ticket Submitted:", {
            ...formData,
            submittedAt: new Date().toISOString(),
            userId: localStorage.getItem("user_id"),
            companyId: localStorage.getItem("vacei-active-company")
        });

        setIsLoading(false);
        setIsSubmitted(true);
    };

    const handleReset = () => {
        setIsSubmitted(false);
        setFormData({
            category: "incorporation",
            priority: "medium",
            subject: "",
            message: ""
        });
    };

    if (isSubmitted) {
        return (
            <div className="space-y-8 animate-in fade-in duration-500">
                <PageHeader 
                    title="Support"
                    subtitle="Get assistance and help from our team."
                    icon={HelpCircle}
                />
                
                <div className="max-w-2xl mx-auto pt-10">
                    <DashboardCard className="p-12 text-center border-none shadow-2xl bg-white/80 backdrop-blur-xl">
                        <div className="flex justify-center mb-6">
                            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center animate-bounce">
                                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                            </div>
                        </div>
                        <h2 className="text-3xl font-bold text-slate-900 mb-2">Message Sent!</h2>
                        <p className="text-slate-500 font-medium mb-8 leading-relaxed">
                            Your support ticket has been created successfully. <br />
                            Our team will get back to you shortly via the message center.
                        </p>
                        <Button 
                            variant="default" 
                            className="bg-slate-900 hover:bg-black text-white px-8 h-12 rounded-xl transition-all active:scale-95"
                            onClick={handleReset}
                        >
                            Send Another Request
                        </Button>
                    </DashboardCard>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <PageHeader 
                title="Support"
                subtitle="Get assistance and help from our team."
                icon={HelpCircle}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Info Column */}
                <div className="space-y-6">
                    <DashboardCard className="p-6 bg-slate-900 text-white border-none shadow-xl">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-white/10 rounded-lg">
                                <LifeBuoy className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="font-bold text-lg">Direct Assistance</h3>
                        </div>
                        <p className="text-slate-400 text-sm leading-relaxed mb-6">
                            Need help with your incorporation or documents? Our dedicated support team is available Mon-Fri, 9am - 6pm.
                        </p>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-sm font-medium">
                                <Clock className="w-4 h-4 text-slate-500" />
                                <span>Response time: ~2 hours</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm font-medium">
                                <MessageSquare className="w-4 h-4 text-slate-500" />
                                <span>Updates via Message Center</span>
                            </div>
                        </div>
                    </DashboardCard>

                    <div className="p-6 rounded-3xl border border-slate-200 bg-white/50 backdrop-blur-sm">
                        <h4 className="font-bold text-slate-900 mb-3">Frequently Asked</h4>
                        <ul className="space-y-3">
                            {['How to upload KYC?', 'Timeline for Incorporation', 'Billing intervals'].map((q, i) => (
                                <li key={i} className="text-sm text-slate-500 flex items-center gap-2 group cursor-pointer hover:text-slate-900 transition-colors">
                                    <HelpCircle className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    {q}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Form Column */}
                <div className="lg:col-span-2">
                    <DashboardCard className="p-8 border-none shadow-sm bg-white overflow-visible">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Category */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400 px-1">
                                        Support Category
                                    </label>
                                    <Dropdown
                                        className="w-full"
                                        label={CATEGORIES.find(c => c.id === formData.category)?.label || "Select Category"}
                                        trigger={
                                            <button 
                                                type="button"
                                                className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between hover:border-slate-300 transition-all font-medium text-slate-700"
                                            >
                                                <div className="flex items-center gap-2">
                                                    {CATEGORIES.find(c => c.id === formData.category)?.icon}
                                                    <span>{CATEGORIES.find(c => c.id === formData.category)?.label}</span>
                                                </div>
                                                <ChevronDown className="w-4 h-4 opacity-50" />
                                            </button>
                                        }
                                        items={CATEGORIES.map(c => ({
                                            id: c.id,
                                            label: c.label,
                                            icon: c.icon,
                                            onClick: () => setFormData(prev => ({ ...prev, category: c.id }))
                                        }))}
                                        fullWidth
                                    />
                                </div>

                                {/* Priority */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400 px-1">
                                        Priority Level
                                    </label>
                                    <Dropdown
                                        className="w-full"
                                        label={PRIORITIES.find(p => p.id === formData.priority)?.label || "Select Priority"}
                                        trigger={
                                            <button 
                                                type="button"
                                                className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between hover:border-slate-300 transition-all font-medium text-slate-700"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <div className={cn("w-2 h-2 rounded-full", PRIORITIES.find(p => p.id === formData.priority)?.color)} />
                                                    <span>{PRIORITIES.find(p => p.id === formData.priority)?.label}</span>
                                                </div>
                                                <ChevronDown className="w-4 h-4 opacity-50" />
                                            </button>
                                        }
                                        items={PRIORITIES.map(p => ({
                                            id: p.id,
                                            label: p.label,
                                            icon: <div className={cn("w-2 h-2 rounded-full", p.color)} />,
                                            onClick: () => setFormData(prev => ({ ...prev, priority: p.id }))
                                        }))}
                                        fullWidth
                                    />
                                </div>
                            </div>

                            {/* Subject */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-slate-400 px-1">
                                    Subject
                                </label>
                                <Input 
                                    className="h-12 px-4 rounded-xl bg-slate-50/50 border-slate-200 focus:ring-slate-900/5 focus:border-slate-300" 
                                    placeholder="Enter a brief summary of your issue"
                                    required
                                    value={formData.subject}
                                    onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                                />
                            </div>

                            {/* Message */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-slate-400 px-1">
                                    Message Details
                                </label>
                                <Textarea 
                                    className="min-h-[160px] p-4 rounded-xl bg-slate-50/50 border-slate-200 focus:ring-slate-900/5 focus:border-slate-300 transition-all"
                                    placeholder="Please describe your request in detail..."
                                    required
                                    value={formData.message}
                                    onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                                />
                            </div>

                            <div className="pt-2">
                                <Button 
                                    type="submit" 
                                    disabled={isLoading}
                                    className="w-full md:w-auto px-10 h-14 rounded-2xl bg-slate-900 hover:bg-black text-white font-bold flex items-center justify-center gap-2 shadow-xl shadow-slate-200 hover:shadow-slate-300 transition-all active:scale-[0.98]"
                                >
                                    {isLoading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <Send className="w-4 h-4" />
                                            Send Support Message
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </DashboardCard>
                </div>
            </div>
        </div>
    );
}

function ChevronDown(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="m6 9 6 6 6-6" />
        </svg>
    );
}
