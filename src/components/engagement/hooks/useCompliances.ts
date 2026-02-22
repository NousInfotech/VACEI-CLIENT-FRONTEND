"use client";

import { useEffect, useState, useCallback } from "react";
import { ENGAGEMENT_CONFIG } from "@/config/engagementConfig";
import {
  EngagementCompliance,
  getEngagementCompliances,
} from "@/api/auditService";

export function useCompliances(engagementId: string | null, companyId?: string | null) {
  const [compliances, setCompliances] = useState<EngagementCompliance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCompliances = useCallback(async () => {
    if (!engagementId || ENGAGEMENT_CONFIG.USE_MOCK_DATA) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getEngagementCompliances(engagementId, { companyId: companyId ?? undefined });
      setCompliances(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e?.message || "Failed to fetch compliances");
      setCompliances([]);
    } finally {
      setLoading(false);
    }
  }, [engagementId, companyId]);

  useEffect(() => {
    if (!engagementId) {
      setLoading(false);
      setCompliances([]);
      return;
    }

    if (ENGAGEMENT_CONFIG.USE_MOCK_DATA) {
      setLoading(false);
      setCompliances([]);
      return;
    }

    const controller = new AbortController();
    const signal = controller.signal;

    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getEngagementCompliances(engagementId, { companyId: companyId ?? undefined, signal });
        if (signal.aborted) return;
        setCompliances(Array.isArray(data) ? data : []);
      } catch (e: any) {
        if (e?.name === "AbortError") return;
        setError(e?.message || "Failed to fetch compliances");
        setCompliances([]);
      } finally {
        if (!signal.aborted) setLoading(false);
      }
    };

    run();
    return () => controller.abort();
  }, [engagementId, companyId]);

  return { compliances, loading, error, refetch: fetchCompliances };
}
