"use client";

import ServiceEngagement from "@/components/engagement/ServiceEngagement";
import { useParams } from "next/navigation";

export default function MultipleEngagementWorkspacePage() {
    const params = useParams();
    const serviceSlug = params.serviceSlug as string;
    const engagementId = params.engagementId as string;

    return (
        <ServiceEngagement serviceSlug={serviceSlug} engagementId={engagementId} />
    );
}
