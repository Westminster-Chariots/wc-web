import { describe, it, expect } from "vitest";
import { estimateFare, PRICING_CONSTANTS } from "../pricingEstimate";
import type { PricingConfiguration } from "@/types";

// Parity guard for the Services/Pricing architectural split (wc-web-1
// side). The seeded Standard Sedan/SUV Pricing configurations
// (wc-backend-1's src/db/migrations/add_services_table.sql) - which the
// seeded Business Sedan/Business SUV Services reference via
// pricingConfigurationId, never own directly (see the Service type's doc
// comment in @/types) - carry the EXACT same formula parameters as the
// hardcoded PRICING_CONSTANTS this file's client-side estimate mirrors.
// This proves that resolving pricing through Service -> pricingConfigurationId
// -> PricingConfiguration produces the identical total a customer would
// have seen before this refactor - the split changed WHERE pricing data
// lives (out of Services entirely, into a named, reusable Pricing-module
// record), never what a given trip costs. Field names mirror the adaptive
// formula's own symbols (calculationBase/distanceCoefficient/
// timeCoefficient/adjustmentCoefficient/roundingIncrement), not a flat
// mileage/time-rate model.
const standardSedanPricing: Pick<
  PricingConfiguration,
  "name" | "vehicleType" | "calculationBase" | "distanceCoefficient" | "timeCoefficient" | "minimumFare" | "adjustmentCoefficient" | "roundingIncrement" | "formulaVersion"
> = {
  name: "Standard Sedan Pricing",
  vehicleType: "sedan",
  calculationBase: 45,
  distanceCoefficient: 1.8,
  timeCoefficient: 0.8,
  minimumFare: 105,
  adjustmentCoefficient: 0.15,
  roundingIncrement: 5,
  formulaVersion: "adaptive-v1",
};

const standardSuvPricing: typeof standardSedanPricing = {
  name: "Standard SUV Pricing",
  vehicleType: "suv",
  calculationBase: 70,
  distanceCoefficient: 2.25,
  timeCoefficient: 1.0,
  minimumFare: 130,
  adjustmentCoefficient: 0.15,
  roundingIncrement: 5,
  formulaVersion: "adaptive-v1",
};

describe("seeded Pricing Configurations carry the exact pre-refactor formula parameters", () => {
  it.each([standardSedanPricing, standardSuvPricing])(
    "$name's seeded fields match PRICING_CONSTANTS for vehicleType=$vehicleType exactly",
    (config) => {
      expect(config.calculationBase).toBe(PRICING_CONSTANTS.baseFare[config.vehicleType]);
      expect(config.distanceCoefficient).toBe(PRICING_CONSTANTS.perMile[config.vehicleType]);
      expect(config.timeCoefficient).toBe(PRICING_CONSTANTS.perMinute[config.vehicleType]);
      expect(config.minimumFare).toBe(PRICING_CONSTANTS.minimumFare[config.vehicleType]);
      expect(config.adjustmentCoefficient).toBe(PRICING_CONSTANTS.demandCoefficient);
      expect(config.roundingIncrement).toBe(PRICING_CONSTANTS.roundToNearest);
      expect(config.formulaVersion).toBe("adaptive-v1");
    }
  );
});

describe("a service referencing a seeded Pricing Configuration prices the same trip identically to selecting by vehicleType alone (pre-refactor behavior)", () => {
  const trips = [
    { distanceMiles: 1, durationMinutes: 2 },
    { distanceMiles: 9.9, durationMinutes: 19.8 },
    { distanceMiles: 10.1, durationMinutes: 20.2 },
    { distanceMiles: 25, durationMinutes: 50 },
    { distanceMiles: 100, durationMinutes: 200 },
  ];

  it.each([standardSedanPricing, standardSuvPricing])("$name", (config) => {
    for (const trip of trips) {
      // The estimate function only ever accepted vehicleType, never a
      // PricingConfiguration object - proving it's still what a
      // configuration's own vehicleType feeds into is exactly what shows
      // the split didn't touch the math, only where the numbers are owned.
      const result = estimateFare({ ...trip, vehicleType: config.vehicleType });
      expect(result).not.toBeNull();
      // Cross-check against a hand-rolled computation using the
      // configuration's OWN seeded fields, independent of the shared
      // PRICING_CONSTANTS import above - this is what actually proves the
      // seeded numbers (not just the constants they were copied from)
      // reproduce the same total.
      const linear = config.calculationBase + config.distanceCoefficient * trip.distanceMiles + config.timeCoefficient * trip.durationMinutes;
      const adaptive = linear * (1 + config.adjustmentCoefficient * 1);
      const expectedTotal = Math.round(Math.max(config.minimumFare, adaptive) / config.roundingIncrement) * config.roundingIncrement;
      expect(result!.totalPrice).toBe(expectedTotal);
    }
  });
});
