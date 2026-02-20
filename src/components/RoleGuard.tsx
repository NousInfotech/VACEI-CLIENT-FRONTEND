'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Lock, LogOut, ArrowLeft } from 'lucide-react';
import DashboardCard from './DashboardCard';

interface RoleGuardProps {
    children: React.ReactNode;
    allowedRole?: string;
}

export default function RoleGuard({ children, allowedRole = 'client' }: RoleGuardProps) {
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
    const [role, setRole] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const storedRole = localStorage.getItem('role');
        if (storedRole) {
            try {
                const decodedRole = atob(storedRole).toLowerCase();
                setRole(decodedRole);
                setIsAuthorized(decodedRole === allowedRole.toLowerCase());
            } catch (e) {
                console.error('Error decoding role:', e);
                setIsAuthorized(false);
            }
        } else {
            // No role found, assume unauthorized
            setIsAuthorized(false);
        }
    }, [allowedRole]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('username');
        localStorage.removeItem('email');
        localStorage.removeItem('user_id');
        document.cookie = 'client-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        router.push('/login');
    };

    if (isAuthorized === null) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-brand-body">
                <div className="animate-pulse flex flex-col items-center gap-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                    <div className="h-4 w-32 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    if (!isAuthorized) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-brand-body p-6">
                <DashboardCard className="max-w-md w-full p-8 border-none shadow-2xl bg-white text-center space-y-6">
                    <div className="flex justify-center">
                        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center">
                            <Lock className="w-10 h-10 text-red-600" />
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Access Denied</h1>
                        <p className="text-gray-600 font-medium leading-relaxed">
                            Your account with role <span className="text-gray-900 font-bold uppercase tracking-tight">"{role || 'Unknown'}"</span> is not authorized to access the Client Portal.
                        </p>
                    </div>

                    <div className="pt-4 space-y-3">
                        <Button 
                            className="w-full bg-gray-900 hover:bg-black text-white font-bold h-12 rounded-xl flex items-center justify-center gap-2"
                            onClick={() => window.history.back()}
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Go Back
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
                        If you believe this is an error, please contact your organization administrator.
                    </p>
                </DashboardCard>
            </div>
        );
    }

    return <>{children}</>;
}
