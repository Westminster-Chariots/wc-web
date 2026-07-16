import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/metadata";

export const metadata: Metadata = generatePageMetadata({
  title: "A Message from the Founder",
  description:
    "Haroon Hashmat, Founder & CEO of Westminster Chariots, on why he built DC's most trusted luxury black car service — and the permanent commitment behind every ride.",
  path: "/founder",
});

export default function FounderLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
