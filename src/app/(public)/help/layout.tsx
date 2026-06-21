import type { Metadata } from "next";
import { generatePageMetadata, structuredData } from "@/lib/metadata";

export const metadata: Metadata = generatePageMetadata({
  title: "Help & FAQ",
  description:
    "Answers to common questions about booking, cancellations, payment methods, service areas, and chauffeur standards at Westminster Chariots luxury car service in Washington DC.",
  path: "/help",
});

export default function HelpLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData.faq) }}
      />
      {children}
    </>
  );
}
