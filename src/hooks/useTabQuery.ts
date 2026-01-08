"use client";

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useCallback, useMemo } from 'react';

export function useTabQuery(initialTab: string, paramName: string = 'tab') {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const activeTab = useMemo(() => {
    return searchParams.get(paramName) || initialTab;
  }, [searchParams, paramName, initialTab]);

  const setTab = useCallback((newTab: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(paramName, newTab);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }, [searchParams, paramName, router, pathname]);

  return [activeTab, setTab] as const;
}
