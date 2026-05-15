"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    
    // All pages use light theme by default
    // We'll handle the hero section separately with a wrapper
    root.removeAttribute("data-theme");
  }, [pathname]);

  return <>{children}</>;
}
