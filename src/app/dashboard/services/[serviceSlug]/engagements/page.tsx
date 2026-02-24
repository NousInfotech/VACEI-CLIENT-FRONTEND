"use client";

import ServiceEngagement from "@/components/engagement/ServiceEngagement";
import { useParams } from "next/navigation";

export default function EngagementsListPage() {
    const params = useParams();
    const serviceSlug = params.serviceSlug as string;

    return (
        <ServiceEngagement serviceSlug={serviceSlug} />
    );
}
