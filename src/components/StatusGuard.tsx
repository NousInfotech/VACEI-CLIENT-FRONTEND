'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldX, ArrowLeft, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DashboardCard from './DashboardCard';

interface StatusGuardProps {
    children: React.ReactNode;
}

interface CompanyStatus {
    incorporationStatus: boolean;
    kycStatus: boolean;
}

/**
 * Guards the /dashboard route.
 * Reads the active company from localStorage, fetches its incorporation + KYC status,
 * and blocks access if either is not verified.
 */
export default function StatusGuard({ children }: StatusGuardProps) {
    const [status, setStatus] = useState<'loading' | 'allowed' | 'denied'>('loading');
    const router = useRouter();

    useEffect(() => {
        const checkStatus = async () => {
            try {
                const token = localStorage.getItem('token');
                const activeCompanyId = localStorage.getItem('vacei-active-company');

                if (!token || !activeCompanyId) {
                    setStatus('denied');
                    return;
                }

                const backendUrl = process.env.NEXT_PUBLIC_VACEI_BACKEND_URL?.replace(/\/?$/, '/') || 'http://localhost:5000/api/v1/';
                const response = await fetch(`${backendUrl}companies/${activeCompanyId}`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                });

                if (!response.ok) {
                    setStatus('denied');
                    return;
                }

                const result = await response.json();
                const company = result.data || result;

                const incorporationOk = company?.incorporationStatus === true;
                const kycOk = company?.kycStatus === true;

                if (incorporationOk && kycOk) {
                    setStatus('allowed');
                } else {
                    setStatus('denied');
                }
            } catch (err) {
                console.error('StatusGuard: failed to check company status', err);
                setStatus('denied');
            }
        };

        checkStatus();
    }, []);

    const handleGoBack = () => {
        router.push('/global-dashboard/companies');
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('username');
        localStorage.removeItem('email');
        localStorage.removeItem('user_id');
        localStorage.removeItem('vacei-active-company');
        localStorage.removeItem('vacei-companies');
        document.cookie = 'client-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        router.push('/login');
    };

    if (status === 'loading') {
        return (
            <div className="flex items-center justify-center min-h-screen bg-brand-body">
                <div className="animate-pulse flex flex-col items-center gap-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full" />
                    <div className="h-4 w-48 bg-gray-200 rounded" />
                    <div className="h-3 w-32 bg-gray-100 rounded" />
                </div>
            </div>
        );
    }

    if (status === 'denied') {
        return (
            <div className="flex items-center justify-center min-h-screen bg-brand-body p-6">
                <DashboardCard className="max-w-md w-full p-8 border-none shadow-2xl bg-white text-center space-y-6">
                    <div className="flex justify-center">
                        <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center">
                            <ShieldX className="w-10 h-10 text-amber-500" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                            Dashboard Locked
                        </h1>
                        <p className="text-gray-600 font-medium leading-relaxed">
                            Your company dashboard is not yet accessible. Both{' '}
                            <span className="text-gray-900 font-bold">Incorporation</span> and{' '}
                            <span className="text-gray-900 font-bold">KYC verification</span> must be
                            completed before you can access the company dashboard.
                        </p>
                    </div>

                    <div className="pt-2 space-y-3">
                        <Button
                            className="w-full bg-gray-900 hover:bg-black text-white font-bold h-12 rounded-xl flex items-center justify-center gap-2"
                            onClick={handleGoBack}
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Companies
                        </Button>

                        <Button
                            variant="outline"
                            className="w-full border-gray-200 text-gray-600 font-bold h-12 rounded-xl flex items-center justify-center gap-2"
                            onClick={handleLogout}
                        >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                        </Button>
                    </div>

                    <p className="text-xs text-gray-400 font-medium">
                        Once your verification is complete, you will have full access to your company dashboard.
                    </p>
                </DashboardCard>
            </div>
        );
    }

    return <>{children}</>;
}
