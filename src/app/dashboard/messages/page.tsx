"use client";

import { useEffect } from "react";
import ChatModule from "@/components/ChatModule";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";

export default function MessagesPage() {
  return (
    <section className="mx-auto max-w-[1400px] w-full pt-5 space-y-4">
      <PageHeader
        title="Messages"
        subtitle="Unified inbox for service-based threads and attachments."
      />

      <div className="bg-card border border-border rounded-card shadow-md p-6">
        <p className="text-sm text-muted-foreground mb-4">
          The inbox displays your service-related discussions directly on this page.
        </p>
        <div className="relative min-h-[600px] rounded-lg border border-border bg-muted/20 p-4">
          <ChatModule isEmbedded={true} />
        </div>
      </div>
    </section>
  );
}


