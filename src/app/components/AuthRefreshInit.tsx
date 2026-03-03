"use client";

import { useEffect } from "react";
import { initAuthRefresh } from "@/lib/authRefresh";

/**
 * Initializes global fetch patch for 401 -> refresh token -> retry.
 * Renders nothing. Mount once in root layout.
 */
export default function AuthRefreshInit() {
  useEffect(() => {
    initAuthRefresh();
  }, []);
  return null;
}
