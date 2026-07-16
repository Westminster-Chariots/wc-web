import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/metadata";

export const metadata: Metadata = generatePageMetadata({
  title: "Our Luxury Fleet",
  description:
    "Mercedes-Benz S-Class, GLS, Sprinter, and more — Westminster Chariots operates an immaculately maintained fleet of luxury vehicles for executives, families, and VIP clients across Washington DC, VA, and MD.",
  path: "/fleet",
});

export default function FleetLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
