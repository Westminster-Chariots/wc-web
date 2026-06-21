import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/metadata";

export const metadata: Metadata = generatePageMetadata({
  title: "Luxury Chauffeur Services",
  description:
    "Airport transfers, corporate car service, wedding transportation, city tours, and more — all delivered in Mercedes-Benz luxury across Washington DC, Northern Virginia, and Maryland. Book instantly online.",
  path: "/services",
});

export default function ServicesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
