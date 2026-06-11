import type { Metadata } from "next";
import { Inter, Syne } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { defaultMetadata } from "@/lib/metadata";
import ThemeWrapper from "@/components/ThemeWrapper";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const syne = Syne({ subsets: ["latin"], variable: "--font-syne", display: "swap" });

export const metadata: Metadata = defaultMetadata;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth" className={`${inter.variable} ${syne.variable}`}>
      <head>
        {/* Favicons - Blue Theme */}
        <link rel="icon" href="/favicon.ico" sizes="32x32" />
        <link rel="icon" href="/favicon-16x16.png" sizes="16x16" type="image/png" />
        <link rel="icon" href="/favicon-32x32.png" sizes="32x32" type="image/png" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" />
        
        {/* Manifest */}
        <link rel="manifest" href="/manifest.json" />
        
        {/* Theme Colors - Blue Theme */}
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <meta name="theme-color" content="#09adff" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#0a0a0a" media="(prefers-color-scheme: dark)" />
        
        {/* Safari Pinned Tab */}
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#09adff" />
        
        {/* MS Tiles */}
        <meta name="msapplication-TileColor" content="#09adff" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
      </head>
      <body className="min-h-screen bg-background text-foreground font-body antialiased" suppressHydrationWarning>
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:shadow-lg"
        >
          Skip to main content
        </a>
        <ThemeWrapper>
          <Providers>{children}</Providers>
        </ThemeWrapper>
      </body>
    </html>
  );
}
