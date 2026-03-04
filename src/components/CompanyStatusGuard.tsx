'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useActiveCompany } from '@/context/ActiveCompanyContext';
import { ShieldAlert, ArrowRight, ClipboardList, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DashboardCard from './DashboardCard';
import { DetailsSkeleton } from './shared/CommonSkeletons';

interface CompanyStatusGuardProps {
    children: React.ReactNode;
}

export default function CompanyStatusGuard({ children }: CompanyStatusGuardProps) {
    const { companies, activeCompanyId, loading } = useActiveCompany();
    const router = useRouter();
    const params = useParams();
    
    // Find current company from context
    const currentCompany = companies.find(c => c.id === activeCompanyId);

    if (loading) {
        return (
            <div className="p-8 max-w-7xl mx-auto">
                <DetailsSkeleton />
            </div>
        );
    }

    // If no company found or no status info, allow through for regular dashboard or global routes
    // Only guard if we have specific status information
    if (!currentCompany) {
        return <>{children}</>;
    }

    const { incorporationStatus, kycStatus, name, id } = currentCompany;

    // Incorporation Guard
    if (incorporationStatus === false) {
        return (
            <div className="flex items-center justify-center min-h-[80vh] bg-brand-body p-6">
                <DashboardCard className="max-w-xl w-full p-10 border-none shadow-2xl bg-white text-center space-y-8 animate-in fade-in zoom-in duration-500">
                    <div className="flex justify-center">
                        <div className="w-24 h-24 bg-amber-50 rounded-3xl flex items-center justify-center border border-amber-100 rotate-3">
                            <ClipboardList className="w-12 h-12 text-amber-500 -rotate-3" />
                        </div>
                    </div>
                    
                    <div className="space-y-3">
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Incorporation Pending</h1>
                        <p className="text-gray-500 font-medium leading-relaxed px-4">
                            You don't have access to <span className="text-gray-900 font-bold">{name}</span> yet. 
                            Please complete the incorporation process first to unlock your dashboard.
                        </p>
                    </div>

                    <div className="pt-4 px-6">
                        <Button 
                            className="w-full bg-gray-900 hover:bg-black text-white font-bold h-14 rounded-2xl flex items-center justify-center gap-3 text-lg shadow-xl shadow-gray-200 transition-all active:scale-95"
                            onClick={() => router.push(`/global-dashboard/companies/${id}?tab=incorporation&highlight=incorporation`)}
                        >
                            Complete Incorporation
                            <ArrowRight className="w-5 h-5" />
                        </Button>
                        
                        <button 
                            className="mt-6 text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors uppercase tracking-widest"
                            onClick={() => router.push('/global-dashboard/companies')}
                        >
                            Back to Companies
                        </button>
                    </div>

                    <div className="pt-4 border-t border-gray-50 flex items-center justify-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-amber-400" />
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                            Required Action: Setup your business profile
                        </p>
                    </div>
                </DashboardCard>
            </div>
        );
    }

    // KYC Guard
    if (kycStatus === false) {
        return (
            <div className="flex items-center justify-center min-h-[80vh] bg-brand-body p-6">
                <DashboardCard className="max-w-xl w-full p-10 border-none shadow-2xl bg-white text-center space-y-8 animate-in fade-in zoom-in duration-500">
                    <div className="flex justify-center">
                        <div className="w-24 h-24 bg-blue-50 rounded-3xl flex items-center justify-center border border-blue-100 rotate-3">
                            <ShieldCheck className="w-12 h-12 text-blue-500 -rotate-3" />
                        </div>
                    </div>
                    
                    <div className="space-y-3">
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">KYC Verification Required</h1>
                        <p className="text-gray-500 font-medium leading-relaxed px-4">
                            Access to <span className="text-gray-900 font-bold">{name}</span> is restricted until your KYC verification is complete.
                        </p>
                    </div>

                    <div className="pt-4 px-6">
                        <Button 
                            className="w-full bg-gray-900 hover:bg-black text-white font-bold h-14 rounded-2xl flex items-center justify-center gap-3 text-lg shadow-xl shadow-gray-200 transition-all active:scale-95"
                            onClick={() => router.push(`/global-dashboard/companies/${id}?tab=kyc&highlight=kyc`)}
                        >
                            Complete KYC Verification
                            <ArrowRight className="w-5 h-5" />
                        </Button>
                        
                        <button 
                            className="mt-6 text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors uppercase tracking-widest"
                            onClick={() => router.push('/global-dashboard/companies')}
                        >
                            Back to Companies
                        </button>
                    </div>

                    <div className="pt-4 border-t border-gray-50 flex items-center justify-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-400" />
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                            Required Action: Verify your identity
                        </p>
                    </div>
                </DashboardCard>
            </div>
        );
    }

    return <>{children}</>;
}
