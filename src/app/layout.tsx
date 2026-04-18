import type { Metadata } from "next";
import { Inter, Syne } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const syne = Syne({ subsets: ["latin"], variable: "--font-syne", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://westminsterchariots.com"),
  title: { default: "Westminster Chariots | Luxury Black Car Service DC", template: "%s | Westminster Chariots" },
  description: "Premium executive transportation across DC, Virginia, and Maryland. Mercedes-Benz fleet, professional chauffeurs, 24/7 availability. Airport transfers, corporate travel, diplomatic services.",
  keywords: ["luxury car service DC", "black car service Washington DC", "executive transportation", "airport transfer DC", "chauffeur service Virginia Maryland"],
  authors: [{ name: "Westminster Chariots" }],
  creator: "Westminster Chariots",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://westminsterchariots.com",
    siteName: "Westminster Chariots",
    title: "Westminster Chariots | Luxury Black Car Service DC",
    description: "Premium executive transportation across DC, Virginia, and Maryland.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Westminster Chariots" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Westminster Chariots | Luxury Black Car Service DC",
    description: "Premium executive transportation across DC, Virginia, and Maryland.",
    images: ["/og-image.png"],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${syne.variable}`}>
      <body className="min-h-screen bg-background text-foreground font-body antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
