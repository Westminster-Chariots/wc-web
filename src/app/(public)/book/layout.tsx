import { Metadata } from "next";
import { generatePageMetadata } from "@/lib/metadata";

export const metadata: Metadata = generatePageMetadata({
  title: "Book Your Ride",
  description: "Book premium chauffeur service in Washington DC, Virginia, and Maryland. Choose from luxury sedans and SUVs with professional drivers. Instant online booking available 24/7.",
  path: "/book",
});

export default function BookLayout({ children }: { children: React.ReactNode }) {
  return children;
}
