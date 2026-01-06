"use client";

import { useEffect } from "react";
import ChatModule from "@/components/ChatModule";
import { Button } from "@/components/ui/button";

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
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-brand-body">
            Messages
          </h1>
          <p className="text-sm text-muted-foreground">
            Unified inbox for service-based threads and attachments.
          </p>
        </div>
        <Button
          variant="outline"
          className="rounded-full px-4 text-sm"
          onClick={() => {
            const btn = document.getElementById("openChatBubble");
            if (btn) btn.click();
          }}
        >
          Open inbox
        </Button>
      </div>

      <div className="bg-card border border-border rounded-[16px] shadow-md p-5">
        <p className="text-sm text-muted-foreground mb-3">
          The inbox uses your existing chat threads. If the floating chat is not
          open, click “Open inbox.”
        </p>
        {/* Render ChatModule directly so the thread data is available on this page */}
        <div className="relative min-h-[300px]">
          <ChatModule />
        </div>
      </div>
    </section>
  );
}


