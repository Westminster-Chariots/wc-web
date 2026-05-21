"use client";

import { Suspense } from "react";
import PremiumBookingConfirmed from "./PremiumBookingConfirmed";

export default function BookingConfirmedPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="text-sm text-muted-foreground font-body mt-4">Loading premium booking details...</p>
          </div>
        </div>
      }
    >
      <PremiumBookingConfirmed />
    </Suspense>
  );
}
