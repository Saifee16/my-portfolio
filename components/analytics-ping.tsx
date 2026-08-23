"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function AnalyticsPing() {
  const pathname = usePathname();
  useEffect(() => {
    if (pathname.startsWith("/admin")) return;
    void fetch("/api/analytics", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ event: "page_view", path: pathname }), keepalive: true }).catch(() => undefined);
  }, [pathname]);
  return null;
}
