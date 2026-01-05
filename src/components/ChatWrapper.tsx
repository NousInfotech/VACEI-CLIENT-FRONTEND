"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import ChatModule from "./ChatModule";

export default function ChatWrapper() {
  const [hasToken, setHasToken] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const token = localStorage.getItem("token");
    setHasToken(!!token);
  }, [pathname]); // Re-check token whenever path changes

  if (!hasToken) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-50"
      style={{
        maxHeight: "300px",
        overflow: "auto",
      }}
    >
      <ChatModule />
    </div>
  );
}
