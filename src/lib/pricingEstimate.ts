export type VehicleType = "sedan" | "suv";

// Client-side mirror of the backend's calculateAdaptiveFareCents
// (wc-backend-1/src/lib/pricing.ts). Every constant below must stay
// byte-identical to that file - this is a *display estimate only*, never
// the number that gets charged (see getAuthoritativeQuote in usePricing.ts,
// which calls the backend's own /pricing/calculate for anything that will
// actually be booked/paid). Keeping the two in sync is what makes this an
// honest estimate instead of a guess: see pricingEstimate.test.ts for the
// parity table checked against the backend's own test fixtures.
const BASE_FARE: Record<VehicleType, number> = { sedan: 45, suv: 70 };
const PER_MILE: Record<VehicleType, number> = { sedan: 1.8, suv: 2.25 };
const PER_MINUTE: Record<VehicleType, number> = { sedan: 0.8, suv: 1.0 };
const MINIMUM_FARE: Record<VehicleType, number> = { sedan: 105, suv: 130 };
const DEMAND_COEFFICIENT = 0.15;
const DEFAULT_DEMAND_LEVEL = 1;
const DEFAULT_FEES_DOLLARS = 0;
const ROUND_TO = 5;

// Exported so any UI that needs to *display* the live formula (the admin
// pricing control panel, specifically) reads the real values instead of
// hand-typing a second copy that can go stale - that mismatch (an admin
// panel showing $30/mile-type numbers nobody removed after the formula
// changed) is its own class of bug, independent of what estimateFare()
// actually computes.
export const PRICING_CONSTANTS = {
  baseFare: BASE_FARE,
  perMile: PER_MILE,
  perMinute: PER_MINUTE,
  minimumFare: MINIMUM_FARE,
  demandCoefficient: DEMAND_COEFFICIENT,
  defaultDemandLevel: DEFAULT_DEMAND_LEVEL,
  defaultFeesDollars: DEFAULT_FEES_DOLLARS,
  roundToNearest: ROUND_TO,
} as const;

export interface FareEstimateInput {
  distanceMiles: number;
  durationMinutes: number;
  vehicleType: VehicleType;
  feesDollars?: number;
  demandLevel?: number;
}

export interface FareEstimate {
  basePrice: number; // pre-demand-markup fare; equals totalPrice when the minimum fare applies
  gratuity: number; // demand-adjustment portion; 0 when the minimum fare applies
  totalPrice: number;
  floorApplied: boolean;
}

// Pure, synchronous, and never throws on ordinary bad input (unlike the
// backend's validating counterpart) - this only ever feeds a display
// estimate, never a charge, so a defensive null is more useful here than an
// exception a component would have to catch.
export function estimateFare(input: FareEstimateInput): FareEstimate | null {
  const { distanceMiles, durationMinutes, vehicleType } = input;
  if (
    !Number.isFinite(distanceMiles) ||
    !Number.isFinite(durationMinutes) ||
    distanceMiles < 0 ||
    durationMinutes < 0 ||
    (vehicleType !== "sedan" && vehicleType !== "suv")
  ) {
    return null;
  }
  const feesDollars = input.feesDollars ?? DEFAULT_FEES_DOLLARS;
  const demandLevel = input.demandLevel ?? DEFAULT_DEMAND_LEVEL;

  const linear = BASE_FARE[vehicleType] + PER_MILE[vehicleType] * distanceMiles + PER_MINUTE[vehicleType] * durationMinutes + feesDollars;
  const demandMultiplier = 1 + DEMAND_COEFFICIENT * demandLevel;
  const adaptive = linear * demandMultiplier;
  const minimum = MINIMUM_FARE[vehicleType];

  const floorApplied = minimum >= adaptive;
  const raw = Math.max(minimum, adaptive);
  const totalPrice = Math.round(raw / ROUND_TO) * ROUND_TO;

  if (floorApplied) {
    return { basePrice: totalPrice, gratuity: 0, totalPrice, floorApplied };
  }

  const basePrice = Math.round(linear * 100) / 100;
  const gratuity = Math.round((totalPrice - basePrice) * 100) / 100;
  return { basePrice, gratuity, totalPrice, floorApplied };
}
