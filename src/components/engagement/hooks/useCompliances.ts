"use client";

import { useEffect, useState, useCallback } from "react";
import { ENGAGEMENT_CONFIG } from "@/config/engagementConfig";
import {
  EngagementCompliance,
  getEngagementCompliances,
} from "@/api/auditService";
import { listComplianceCalendars } from "@/api/complianceCalendarService";

export function useCompliances(engagementId: string | null, companyId?: string | null) {
  const [compliances, setCompliances] = useState<EngagementCompliance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCompliances = useCallback(async () => {
    if (!engagementId) return;
    setLoading(true);
    setError(null);
    try {
      const [engagementData, calendarData] = await Promise.all([
        getEngagementCompliances(engagementId, { companyId: companyId ?? undefined }),
        companyId ? listComplianceCalendars({ companyId }) : Promise.resolve([])
      ]);
      
      const combined = [...(Array.isArray(engagementData) ? engagementData : [])];
      
      // Merge calendar data but tag it so we know where it came from
      if (Array.isArray(calendarData)) {
        calendarData.forEach((c: any) => {
          // Avoid duplicates if possible, or just add them
          combined.push({
            id: `cal-${c.id}`,
            engagementId: engagementId,
            title: c.title,
            deadline: c.dueDate,
            status: 'PENDING',
            service: c.serviceCategory,
            description: c.description,
            _fromComplianceCalendar: true
          } as any);
        });
      }

      setCompliances(combined);
    } catch (e: any) {
      setError(e?.message || "Failed to fetch compliances");
      setCompliances([]);
    } finally {
      setLoading(false);
    }
  }, [engagementId, companyId]);

  useEffect(() => {
    fetchCompliances();
  }, [fetchCompliances]);

  return { compliances, loading, error, refetch: fetchCompliances };
}
