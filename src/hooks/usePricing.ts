"use client";
import { useCallback } from "react";
import { pricingService, type QuotePreviewRequest, type QuotePreviewResponse } from "@/lib/services";
import { estimateFare, type FareEstimate, type VehicleType } from "@/lib/pricingEstimate";

// Previously this hook fetched pricing_config/vehicle_pricing from the
// backend on every mount to build a local estimate. The backend's pricing
// engine no longer reads those tables (see calculateAdaptiveFareCents in
// wc-backend-1/src/lib/pricing.ts) - their numbers no longer reflect what a
// customer is actually charged, so fetching them here would produce a
// confidently wrong estimate rather than a useful one. The estimate is now a
// pure, offline function of the same fixed constants the backend uses (see
// pricingEstimate.ts), and getAuthoritativeQuote() below remains the only
// source of a number that gates an actual charge.
export function usePricing() {
  const calculatePrice = useCallback(
    (distance: number, duration: number, vehicleType: VehicleType | null): FareEstimate | null => {
      if (!vehicleType) return null;
      return estimateFare({ distanceMiles: distance, durationMinutes: duration, vehicleType });
    },
    []
  );

  // Backend-authoritative quote - calls the same shared calculation booking
  // creation itself uses (calculateAdaptiveFareCents() on the backend), so
  // this and the total a booking is actually created with can never
  // independently drift. Used by checkout for its actual displayed/accepted/
  // charged total; calculatePrice() above remains a local, clearly-lower-
  // trust estimate for contexts (e.g. /book's vehicle picker) that don't
  // gate an actual charge on the result. Throws on failure - callers must
  // treat that as "no authoritative quote available" and must not fall back
  // to a self-computed number for anything that will be charged.
  const getAuthoritativeQuote = useCallback(async (request: QuotePreviewRequest): Promise<QuotePreviewResponse> => {
    return pricingService.calculate(request);
  }, []);

  return {
    calculatePrice,
    getAuthoritativeQuote,
  };
}
