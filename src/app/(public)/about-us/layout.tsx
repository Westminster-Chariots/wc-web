import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/metadata";

export const metadata: Metadata = generatePageMetadata({
  title: "About Westminster Chariots",
  description:
    "Westminster Chariots — Washington DC's premier luxury black car service. Professional chauffeurs, complete discretion, and a standard of travel that speaks for itself. Serving DC, Virginia, and Maryland.",
  path: "/about-us",
});

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
