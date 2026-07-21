import { describe, it, expect, beforeEach, vi } from "vitest";

// checkout/page.tsx is a "use client" page with many hook/component imports;
// none of that code runs at module-eval time (only inside the component
// function, which this test never renders), but next/navigation's router
// hooks throw if actually invoked outside an app-router context - mocked
// here defensively since importing the module pulls in the import graph.
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

const { computeTripFingerprint, resolveCheckoutAttemptId } = await import("../page");

const baseArgs = {
  pickup: "123 Main St",
  dropoff: "456 Oak Ave",
  pickupDate: "2026-08-01",
  pickupTime: "10:00",
  selectedVehicle: "sedan",
  selectedVehicleId: "veh-1",
  additionalLegs: [],
};

beforeEach(() => {
  sessionStorage.clear();
});

describe("computeTripFingerprint", () => {
  it("is stable for identical trip details", () => {
    expect(computeTripFingerprint(baseArgs)).toBe(computeTripFingerprint({ ...baseArgs }));
  });

  it("changes when any trip detail changes", () => {
    const fp1 = computeTripFingerprint(baseArgs);
    const fp2 = computeTripFingerprint({ ...baseArgs, dropoff: "789 Pine Rd" });
    expect(fp1).not.toBe(fp2);
  });

  it("changes when an additional leg is added", () => {
    const fp1 = computeTripFingerprint(baseArgs);
    const fp2 = computeTripFingerprint({
      ...baseArgs,
      additionalLegs: [{ pickup: "A", dropoff: "B", pickupDate: "2026-08-02", pickupTime: "11:00" }],
    });
    expect(fp1).not.toBe(fp2);
  });
});

describe("resolveCheckoutAttemptId", () => {
  it("reuses the stored id across a simulated remount when the fingerprint is unchanged", () => {
    const fingerprint = computeTripFingerprint(baseArgs);
    const first = resolveCheckoutAttemptId(fingerprint);
    const second = resolveCheckoutAttemptId(fingerprint);
    expect(second).toBe(first);
  });

  it("issues a fresh id when the fingerprint changes (edited trip)", () => {
    const fingerprint1 = computeTripFingerprint(baseArgs);
    const first = resolveCheckoutAttemptId(fingerprint1);

    const fingerprint2 = computeTripFingerprint({ ...baseArgs, dropoff: "789 Pine Rd" });
    const second = resolveCheckoutAttemptId(fingerprint2);
    expect(second).not.toBe(first);
  });

  it("persists the id in sessionStorage so a real page refresh (not just a React remount) also reuses it", () => {
    const fingerprint = computeTripFingerprint(baseArgs);
    const first = resolveCheckoutAttemptId(fingerprint);
    expect(sessionStorage.getItem("wc_checkout_attempt_id")).toBe(first);
  });
});
