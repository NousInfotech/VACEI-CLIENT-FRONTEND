'use client';

import React from 'react';
import CompanyStatusGuard from '@/components/CompanyStatusGuard';

export default function CompanyLayout({ children }: { children: React.ReactNode }) {
    return (
        <CompanyStatusGuard>
            {children}
        </CompanyStatusGuard>
    );
}
