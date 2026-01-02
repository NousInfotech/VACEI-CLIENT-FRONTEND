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
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        width: "100%",
        backgroundColor: "#fff",
        borderTop: "1px solid #ccc",
        boxShadow: "0 -2px 8px rgba(0,0,0,0.1)",
        zIndex: 1000,
        maxHeight: "300px",
        overflow: "auto",
      }}
    >
      <ChatModule />
    </div>
  );
}
