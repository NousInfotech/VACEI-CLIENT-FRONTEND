"use client"
import React, { useState, useRef } from "react";
import { 
    HelpCircle, 
    Send, 
    CheckCircle2, 
    LifeBuoy, 
    MessageSquare, 
    Clock, 
    ChevronDown,
    Upload,
    X,
    ImageIcon,
    FileText
} from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import DashboardCard from "@/components/DashboardCard";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import Dropdown, { DropdownItem } from "@/components/Dropdown";
import { cn } from "@/lib/utils";

const SERVICES_SUBJECTS = [
    { id: "bookkeeping", label: "Bookkeeping" },
    { id: "vat", label: "VAT" },
    { id: "tax", label: "Tax" },
    { id: "incorporation", label: "Incorporation" },
    { id: "audit", label: "Audit" },
    { id: "payroll", label: "Payroll" },
    { id: "banking-payments", label: "Banking & Payments" },
    { id: "business-plans", label: "Business Plans" },
    { id: "cfo", label: "CFO Services" },
    { id: "csp-mbr", label: "CSP / MBR" },
    { id: "liquidation", label: "Liquidation" },
    { id: "regulated-licenses", label: "Regulated Licenses" },
    { id: "international-structuring", label: "International Structuring" },
    { id: "crypto-digital-assets", label: "Crypto & Digital Assets" },
    { id: "other", label: "Other" },
];

export default function GlobalSupportPage() {
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        subject: "",
        customSubject: "",
        brief: ""
    });
    const [attachments, setAttachments] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files).filter(file => file.type.startsWith('image/'));
            setAttachments(prev => [...prev, ...newFiles]);
        }
    };

    const removeAttachment = (index: number) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    };

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        if (e.dataTransfer.files) {
            const newFiles = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
            setAttachments(prev => [...prev, ...newFiles]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        console.log("Support Request Submitted:", {
            subject: formData.subject === "other" ? formData.customSubject : formData.subject,
            brief: formData.brief,
            attachments: attachments.map(f => f.name),
            submittedAt: new Date().toISOString()
        });

        setIsLoading(false);
        setIsSubmitted(true);
    };

    const handleReset = () => {
        setIsSubmitted(false);
        setFormData({
            subject: "",
            customSubject: "",
            brief: ""
        });
        setAttachments([]);
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
                        <h2 className="text-3xl font-bold text-slate-900 mb-2">Request Sent!</h2>
                        <p className="text-slate-500 font-medium mb-8 leading-relaxed">
                            Your support request has been received. <br />
                            Our team will review the details and get back to you shortly.
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
                            Need help with your services or documents? Our dedicated support team is available Mon-Fri, 9am - 6pm.
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
                </div>

                {/* Form Column */}
                <div className="lg:col-span-2">
                    <DashboardCard className="p-8 border-none shadow-sm bg-white overflow-visible">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Subject */}
                            <div className="space-y-3">
                                <label className="text-xs font-bold uppercase tracking-widest text-slate-400 px-1">
                                    Subject
                                </label>
                                <Dropdown
                                    className="w-full"
                                    label={SERVICES_SUBJECTS.find(s => s.id === formData.subject)?.label || "Select Subject"}
                                    trigger={
                                        <button 
                                            type="button"
                                            className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between hover:border-slate-300 transition-all font-medium text-slate-700"
                                        >
                                            <div className="flex items-center gap-2">
                                                <span>{SERVICES_SUBJECTS.find(s => s.id === formData.subject)?.label || "Select Subject"}</span>
                                            </div>
                                            <ChevronDown className="w-4 h-4 opacity-50" />
                                        </button>
                                    }
                                    items={SERVICES_SUBJECTS.map(s => ({
                                        id: s.id,
                                        label: s.label,
                                        onClick: () => setFormData(prev => ({ ...prev, subject: s.id }))
                                    }))}
                                    fullWidth
                                />
                                {formData.subject === "other" && (
                                    <Input 
                                        className="h-12 px-4 rounded-xl bg-slate-50/50 border-slate-200 focus:ring-slate-900/5 focus:border-slate-300 animate-in slide-in-from-top-2" 
                                        placeholder="Please specify the subject"
                                        required
                                        value={formData.customSubject}
                                        onChange={(e) => setFormData(prev => ({ ...prev, customSubject: e.target.value }))}
                                    />
                                )}
                            </div>

                            {/* Brief */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-slate-400 px-1">
                                    Brief Details
                                </label>
                                <Textarea 
                                    className="min-h-[160px] p-4 rounded-xl bg-slate-50/50 border-slate-200 focus:ring-slate-900/5 focus:border-slate-300 transition-all"
                                    placeholder="Please describe your request in detail..."
                                    required
                                    value={formData.brief}
                                    onChange={(e) => setFormData(prev => ({ ...prev, brief: e.target.value }))}
                                />
                            </div>

                            {/* Attachments */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-slate-400 px-1">
                                    Attachments (Images Only)
                                </label>
                                <div 
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={onDrop}
                                    className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center bg-slate-50/30 hover:bg-slate-50/80 hover:border-slate-300 transition-all cursor-pointer"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <input 
                                        type="file" 
                                        ref={fileInputRef} 
                                        onChange={handleFileChange} 
                                        className="hidden" 
                                        multiple 
                                        accept="image/*"
                                    />
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="p-3 bg-white rounded-xl shadow-sm">
                                            <Upload className="w-6 h-6 text-slate-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-700">Click to upload or drag and drop</p>
                                            <p className="text-xs text-slate-400 mt-1">PNG, JPG or GIF up to 10MB each</p>
                                        </div>
                                    </div>
                                </div>

                                {attachments.length > 0 && (
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 animate-in fade-in slide-in-from-top-2">
                                        {attachments.map((file, index) => (
                                            <div key={index} className="relative group rounded-xl overflow-hidden border border-slate-200 aspect-square bg-white">
                                                <img 
                                                    src={URL.createObjectURL(file)} 
                                                    alt={`Attachment ${index}`}
                                                    className="w-full h-full object-cover"
                                                />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <button 
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            removeAttachment(index);
                                                        }}
                                                        className="p-2 bg-white rounded-full text-slate-900 hover:bg-red-500 hover:text-white transition-all shadow-lg"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                                <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/60 backdrop-blur-sm">
                                                    <p className="text-[10px] text-white truncate font-medium">
                                                        {file.name}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="pt-2">
                                <Button 
                                    type="submit" 
                                    disabled={isLoading || !formData.subject || (formData.subject === 'other' && !formData.customSubject)}
                                    className="w-full md:w-auto px-10 h-14 rounded-2xl bg-slate-900 hover:bg-black text-white font-bold flex items-center justify-center gap-2 shadow-xl shadow-slate-200 hover:shadow-slate-300 transition-all active:scale-[0.98] disabled:opacity-50 disabled:scale-100"
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
