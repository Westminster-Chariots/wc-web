import { Metadata } from "next";
import { generatePageMetadata } from "@/lib/metadata";

export const metadata: Metadata = generatePageMetadata({
  title: "Sign In",
  description: "Sign in to your Westminster Chariots account to manage bookings, view ride history, and access exclusive member benefits.",
  path: "/auth",
  noIndex: true,
});
