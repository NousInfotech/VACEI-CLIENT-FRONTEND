"use client";

import { useEffect } from "react";
import ChatModule from "@/components/ChatModule";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";

export default function MessagesPage() {
  useEffect(() => {
    const timer = setTimeout(() => {
      const btn = document.getElementById("openChatBubble");
      if (btn) btn.click();
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="mx-auto max-w-[1400px] w-full pt-5 space-y-4">
      <PageHeader
        title="Messages"
        subtitle="Unified inbox for service-based threads and attachments."
        actions={
          <Button
            variant="outline"
            className="bg-light text-primary-color-new"
            onClick={() => {
              const btn = document.getElementById("openChatBubble");
              if (btn) btn.click();
            }}
          >
            Open inbox
          </Button>
        }
      />

      <div className="bg-card border border-border rounded-card shadow-md p-6">
        <p className="text-sm text-muted-foreground mb-4">
          The inbox uses your existing chat threads. If the floating chat is not
          open, click "Open inbox."
        </p>
        {/* Render ChatModule directly so the thread data is available on this page */}
        <div className="relative min-h-[400px] rounded-lg border border-border bg-muted/20 p-4">
          <ChatModule />
        </div>
      </div>
    </section>
  );
}


