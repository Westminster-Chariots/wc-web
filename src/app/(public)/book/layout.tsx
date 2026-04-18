"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Check, Phone } from "lucide-react";

const STEP_LABELS = ["Service Class", "Pickup Info", "Log In", "Checkout"] as const;
const STEP_ROUTES = ["/book", "/book/details", "/book/login", "/book/checkout"] as const;

function getStepIndex(pathname: string): number {
  if (pathname === "/book") return 0;
  if (pathname === "/book/details") return 1;
  if (pathname === "/book/login") return 2;
  if (pathname === "/book/checkout") return 3;
  return 0;
}

export default function BookingLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const currentStep = getStepIndex(pathname);

  return (
    <div className="min-h-screen bg-background">
      {/* Header with glass-frosted styling matching chariot-command */}
      <header className="glass-frosted sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          {/* Logo and branding */}
          <Link href="/" className="flex items-center gap-2 sm:gap-3">
            <Image 
              src="/assets/wc-logo-white.png" 
              alt="Westminster Chariots" 
              width={32}
              height={32}
              className="h-7 sm:h-8 w-auto" 
            />
            <span className="text-xs sm:text-sm font-display font-semibold text-foreground hidden sm:inline">
              Westminster Chariots
            </span>
          </Link>

          {/* Desktop Step Indicator */}
          <nav className="hidden md:flex items-center gap-0">
            {STEP_LABELS.map((step, i) => (
              <div key={step} className="flex items-center">
                {i < currentStep ? (
                  <Link href={STEP_ROUTES[i]} className="flex items-center gap-2 group cursor-pointer">
                    <div className="h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-body font-semibold border transition-all border-primary bg-primary/20 text-primary group-hover:bg-primary group-hover:text-primary-foreground">
                      <Check className="h-3 w-3" />
                    </div>
                    <span className="text-xs font-body text-muted-foreground group-hover:text-foreground transition-colors">
                      {step}
                    </span>
                  </Link>
                ) : (
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-body font-semibold border transition-all ${
                        i === currentStep
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-secondary text-muted-foreground"
                      }`}
                    >
                      {i + 1}
                    </div>
                    <span
                      className={`text-xs font-body ${
                        i === currentStep
                          ? "text-foreground font-semibold"
                          : "text-muted-foreground"
                      }`}
                    >
                      {step}
                    </span>
                  </div>
                )}
                {i < STEP_LABELS.length - 1 && (
                  <div className={`w-8 h-px mx-2 ${i < currentStep ? "bg-primary" : "bg-border"}`} />
                )}
              </div>
            ))}
          </nav>

          {/* Mobile Step Indicator */}
          <div className="flex md:hidden items-center gap-1.5">
            {STEP_LABELS.map((step, i) => (
              <div
                key={step}
                className={`rounded-full transition-all ${
                  i === currentStep
                    ? "h-2 w-6 bg-primary"
                    : i < currentStep
                    ? "h-2 w-2 bg-primary/60"
                    : "h-2 w-2 bg-border"
                }`}
              />
            ))}
          </div>

          {/* Phone Contact */}
          <a
            href="tel:+15714351832"
            className="text-xs text-muted-foreground font-body hover:text-primary transition-colors flex items-center gap-1.5"
          >
            <Phone className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">(571) 435-1832</span>
          </a>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 pb-24">
        {children}
      </main>
    </div>
  );
}
