import { describe, it, expect } from "vitest";
import { estimateFare } from "./pricingEstimate";

// Single continuous adaptive pricing model - see the header comment in
// pricingEstimate.ts. This must stay a mirror of the backend's
// calculateAdaptiveFareCents (wc-backend-1/src/lib/pricing.ts); the parity
// fixture table below is intentionally duplicated in that repo's
// src/routes/__tests__/pricingAndBookings.test.ts - a diff between the two
// tables is the signal that the two formulas have drifted.

describe("estimateFare", () => {
  const T = (D: number) => 2 * D; // 30mph reference speed, just needs *a* consistent duration

  it.each([
    [1, "sedan", 105], [1, "suv", 130],
    [3, "sedan", 105], [3, "suv", 130],
    [5, "sedan", 105], [5, "suv", 130],
    [9, "sedan", 105], [9, "suv", 130],
    [9.9, "sedan", 105], [9.9, "suv", 130],
    [10, "sedan", 105], [10, "suv", 130],
    [10.1, "sedan", 105], [10.1, "suv", 130],
    [11, "sedan", 105], [11, "suv", 135],
    [15, "sedan", 110], [15, "suv", 155],
    [25, "sedan", 150], [25, "suv", 205],
    [50, "sedan", 245], [50, "suv", 325],
    [100, "sedan", 445], [100, "suv", 570],
  ] as const)("distance=%smi vehicle=%s -> total=$%s (no discontinuity at 10mi, no >50mi branch)", (D, vehicleType, expectedTotal) => {
    const result = estimateFare({ distanceMiles: D, durationMinutes: T(D), vehicleType });
    expect(result?.totalPrice).toBe(expectedTotal);
  });

  it("basePrice + demandAdjustment always sums exactly to totalPrice", () => {
    for (const D of [1, 12, 40, 75]) {
      const result = estimateFare({ distanceMiles: D, durationMinutes: T(D), vehicleType: "sedan" });
      expect(Math.round((result!.basePrice + result!.demandAdjustment) * 100) / 100).toBe(result!.totalPrice);
    }
  });

  it("returns demandAdjustment=0 and basePrice=totalPrice when the minimum fare applies", () => {
    const result = estimateFare({ distanceMiles: 1, durationMinutes: 2, vehicleType: "sedan" });
    expect(result?.floorApplied).toBe(true);
    expect(result?.demandAdjustment).toBe(0);
    expect(result?.basePrice).toBe(result?.totalPrice);
  });

  describe("minimum fare behavior", () => {
    it("a zero-distance, zero-duration trip is still the minimum fare, not $0", () => {
      expect(estimateFare({ distanceMiles: 0, durationMinutes: 0, vehicleType: "sedan" })?.totalPrice).toBe(105);
      expect(estimateFare({ distanceMiles: 0, durationMinutes: 0, vehicleType: "suv" })?.totalPrice).toBe(130);
    });
  });

  describe("high-mileage behavior (no >50-mile branch)", () => {
    it("50 vs 51 miles differ by ordinary per-mile/per-minute rates, not a 2x cliff", () => {
      const at50 = estimateFare({ distanceMiles: 50, durationMinutes: 80, vehicleType: "sedan" })!;
      const at51 = estimateFare({ distanceMiles: 51, durationMinutes: 80, vehicleType: "sedan" })!;
      expect(at51.totalPrice - at50.totalPrice).toBeLessThan(5);
      expect(at51.totalPrice).toBeGreaterThanOrEqual(at50.totalPrice);
    });
  });

  describe("duration behavior", () => {
    it("a slower trip over the same distance costs at least as much", () => {
      const slow = estimateFare({ distanceMiles: 20, durationMinutes: 90, vehicleType: "sedan" })!;
      const fast = estimateFare({ distanceMiles: 20, durationMinutes: 20, vehicleType: "sedan" })!;
      expect(slow.totalPrice).toBeGreaterThan(fast.totalPrice);
    });
  });

  describe("demand adjustments", () => {
    it("demandLevel=2 charges more than demandLevel=1 once the floor no longer binds", () => {
      const base = { distanceMiles: 40, durationMinutes: 60, vehicleType: "sedan" as const };
      const noSurge = estimateFare({ ...base, demandLevel: 1 })!;
      const surge = estimateFare({ ...base, demandLevel: 2 })!;
      expect(surge.totalPrice).toBeGreaterThan(noSurge.totalPrice);
    });
  });

  describe("fee adjustments", () => {
    it("fees increase the fare", () => {
      const base = { distanceMiles: 40, durationMinutes: 60, vehicleType: "sedan" as const };
      const noFee = estimateFare(base)!;
      const withFee = estimateFare({ ...base, feesDollars: 10 })!;
      expect(withFee.totalPrice).toBeGreaterThan(noFee.totalPrice);
    });
  });

  describe("rounding", () => {
    it("always rounds to the nearest $5", () => {
      for (const D of [1, 4.3, 7.7, 12.2, 33.9, 61.4, 88.8]) {
        const result = estimateFare({ distanceMiles: D, durationMinutes: D * 1.5, vehicleType: "sedan" });
        expect((result!.totalPrice * 100) % 500).toBe(0);
      }
    });
  });

  describe("vehicle switching", () => {
    it("suv is always at least as expensive as sedan for the same trip", () => {
      for (const D of [1, 10, 25, 60]) {
        const sedan = estimateFare({ distanceMiles: D, durationMinutes: D * 2, vehicleType: "sedan" })!;
        const suv = estimateFare({ distanceMiles: D, durationMinutes: D * 2, vehicleType: "suv" })!;
        expect(suv.totalPrice).toBeGreaterThanOrEqual(sedan.totalPrice);
      }
    });
  });

  describe("invalid input returns null instead of throwing (this is a display estimate, not a charge)", () => {
    it("negative distance", () => {
      expect(estimateFare({ distanceMiles: -1, durationMinutes: 10, vehicleType: "sedan" })).toBeNull();
    });
    it("negative duration", () => {
      expect(estimateFare({ distanceMiles: 10, durationMinutes: -1, vehicleType: "sedan" })).toBeNull();
    });
    it("NaN distance or duration", () => {
      expect(estimateFare({ distanceMiles: NaN, durationMinutes: 10, vehicleType: "sedan" })).toBeNull();
      expect(estimateFare({ distanceMiles: 10, durationMinutes: NaN, vehicleType: "sedan" })).toBeNull();
    });
    it("Infinity distance or duration", () => {
      expect(estimateFare({ distanceMiles: Infinity, durationMinutes: 10, vehicleType: "sedan" })).toBeNull();
      expect(estimateFare({ distanceMiles: 10, durationMinutes: -Infinity, vehicleType: "sedan" })).toBeNull();
    });
    it("an invalid vehicle type", () => {
      // @ts-expect-error - deliberately invalid input
      expect(estimateFare({ distanceMiles: 10, durationMinutes: 10, vehicleType: "limo" })).toBeNull();
    });
  });

  describe("regression: continuity around the old 10-mile cutover", () => {
    it("price never decreases as distance increases, swept from 5 to 20 miles in 0.1mi steps", () => {
      for (const vehicleType of ["sedan", "suv"] as const) {
        for (const mph of [20, 30, 45]) {
          let prevTotal = -Infinity;
          for (let d = 5; d <= 20; d = Math.round((d + 0.1) * 10) / 10) {
            const t = (d / mph) * 60;
            const { totalPrice } = estimateFare({ distanceMiles: d, durationMinutes: t, vehicleType })!;
            expect(totalPrice).toBeGreaterThanOrEqual(prevTotal);
            prevTotal = totalPrice;
          }
        }
      }
    });
  });
});
