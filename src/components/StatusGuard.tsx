'use client';

import React from 'react';

interface StatusGuardProps {
    children: React.ReactNode;
}

/**
 * Guards the /dashboard route.
 * Currently disabled - always allows access.
 */
export default function StatusGuard({ children }: StatusGuardProps) {
    return <>{children}</>;
}
