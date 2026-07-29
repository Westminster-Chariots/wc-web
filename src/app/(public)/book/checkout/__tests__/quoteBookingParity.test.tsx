import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, waitFor } from "@testing-library/react";
import type { Booking } from "@/types";
import type { QuotePreviewRequest, QuotePreviewResponse } from "@/lib/services";

// Regression test for the root cause found in this review: the quote
// request's `additionalLegs` used to be built from a separate `legRoutes`
// component-state array (populated only after its own async
// fetchRouteDetails() calls resolved), while createBooking() always read
// `data.additionalLegs` from the booking store directly. On a fresh mount
// where the store already held valid, previously-backfilled leg distances/
// durations (e.g. returning from /book/details, or a page refresh) but this
// component's own leg-route fetch hadn't resolved yet, the quote could go
// out (and be accepted) with `additionalLegs: []` - missing every leg's
// cost - moments before createBooking() created the real booking with every
// leg correctly included. This is what made "the initial quote was right,
// the created booking's total was different" reproducible for any multi-
// stop trip loaded from persisted state.
//
// The fix: both the quote request and createBooking() now read
// data.additionalLegs, the same array, so they cannot disagree. This test
// proves it by making the leg-route fetch hang forever (never resolves)
// while the store already has valid leg data - under the old code this
// would have sent a quote with additionalLegs: [], failing the assertion
// below.

const routerPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: routerPush, back: vi.fn(), replace: vi.fn() }),
}));

const BASE_DATA = {
  pickup: "100 Main St",
  dropoff: "200 Oak Ave",
  isPickupAirport: false,
  pickupDate: "2026-09-01",
  pickupTime: "10:00",
  selectedVehicle: "sedan" as const,
  selectedVehicleId: null,
  flightNumber: "",
  specialRequests: "",
  // Already-backfilled, as if this trip's legs were routed in an earlier
  // visit and persisted (the exact precondition for the bug: the store
  // already has real values before this component's own route fetch runs).
  additionalLegs: [
    { pickup: "300 Pine Rd", dropoff: "400 Elm St", pickupDate: "2026-09-01", pickupTime: "14:00", distanceMiles: 8.4, durationMinutes: 17 },
    { pickup: "400 Elm St", dropoff: "500 Cedar Ave", pickupDate: "2026-09-01", pickupTime: "18:00", distanceMiles: 21.2, durationMinutes: 33 },
  ],
  bookingForSomeoneElse: false,
  guestFirstName: "",
  guestLastName: "",
  guestEmail: "",
  guestPhone: "",
};
vi.mock("@/hooks/useBookingStore", () => ({
  useBookingStore: () => ({ data: BASE_DATA, addLeg: vi.fn(), removeLeg: vi.fn(), updateLeg: vi.fn() }),
}));

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ user: { fullName: "Test Client", email: "test@example.com", phone: "555-0100" } }),
}));

vi.mock("@/hooks/useRouteDetails", () => ({
  useRouteDetails: () => ({ route: { distance: 12, duration: 22 } }),
  // Never resolves - simulates this component's own leg-route fetch not
  // having finished yet. Under the pre-fix code, the quote's additionalLegs
  // came from this (still-empty) source instead of the store.
  fetchRouteDetails: vi.fn(() => new Promise(() => {})),
}));

vi.mock("@/hooks/useFleet", () => ({
  useFleet: () => ({ vehicles: [] }),
}));

const getAuthoritativeQuoteMock = vi.fn<(request: QuotePreviewRequest) => Promise<QuotePreviewResponse>>();
vi.mock("@/hooks/usePricing", () => ({
  usePricing: () => ({
    calculatePrice: () => ({ basePrice: 100, gratuity: 15, totalPrice: 115, floorApplied: false }),
    getAuthoritativeQuote: getAuthoritativeQuoteMock,
  }),
}));

const createBookingMock = vi.fn();
vi.mock("@/lib/services", () => ({
  bookingService: {
    create: (...args: unknown[]) => createBookingMock(...args),
    getById: vi.fn(),
  },
}));

vi.mock("@/lib/cloverCharge", () => ({ chargeBooking: vi.fn() }));
vi.mock("@/lib/notify", () => ({ notify: { error: vi.fn(), success: vi.fn() } }));
vi.mock("@/components/booking/CloverPayment", () => ({ default: () => <button>MockPayButton</button> }));
vi.mock("@/components/booking/CheckoutSummary", () => ({ default: () => <div>MockCheckoutSummary</div> }));

const { default: BookingCheckoutPage } = await import("../page");

let quoteCounter = 0;
function quoteResponse(combinedTotalCents: number): QuotePreviewResponse {
  const combinedTotal = combinedTotalCents / 100;
  return {
    legs: [{ basePrice: combinedTotal * 0.8, gratuity: combinedTotal * 0.2, totalPrice: combinedTotal }],
    combinedTotal,
    combinedTotalCents,
    quoteId: `test-quote-${++quoteCounter}`,
    expiresAt: new Date(Date.now() + 20 * 60 * 1000).toISOString(),
  };
}
function bookingResponse(id: string, totalPrice: number): Partial<Booking> {
  return { id, totalPrice, groupTotalPrice: totalPrice, legs: [] };
}

beforeEach(() => {
  routerPush.mockReset();
  getAuthoritativeQuoteMock.mockReset();
  createBookingMock.mockReset();
  getAuthoritativeQuoteMock.mockResolvedValue(quoteResponse(50000));
  createBookingMock.mockResolvedValue(bookingResponse("booking-1", 500));
});

describe("Quote/booking-creation parity (regression for the found mismatch)", () => {
  it("sends the exact same per-leg distance/duration to the quote request as to booking creation, even while the leg-route fetch is still pending", async () => {
    render(<BookingCheckoutPage />);

    await waitFor(() => expect(getAuthoritativeQuoteMock).toHaveBeenCalled());
    await waitFor(() => expect(createBookingMock).toHaveBeenCalled());

    const quoteRequest = getAuthoritativeQuoteMock.mock.calls[0][0];
    const bookingPayload = createBookingMock.mock.calls[0][0];

    // The bug: this used to be [] here (legRoutes hadn't resolved), while
    // bookingPayload.additionalLegs already had both legs.
    expect(quoteRequest.additionalLegs).toHaveLength(2);
    expect(bookingPayload.additionalLegs).toHaveLength(2);

    for (let i = 0; i < 2; i++) {
      expect(quoteRequest.additionalLegs![i].distanceMiles).toBe(BASE_DATA.additionalLegs[i].distanceMiles);
      expect(quoteRequest.additionalLegs![i].durationMinutes).toBe(BASE_DATA.additionalLegs[i].durationMinutes);
      expect(bookingPayload.additionalLegs[i].distanceMiles).toBe(BASE_DATA.additionalLegs[i].distanceMiles);
      expect(bookingPayload.additionalLegs[i].durationMinutes).toBe(BASE_DATA.additionalLegs[i].durationMinutes);
    }

    // Same primary-trip inputs too.
    expect(quoteRequest.distanceMiles).toBe(bookingPayload.distanceMiles);
    expect(quoteRequest.durationMinutes).toBe(bookingPayload.durationMinutes);
  });
});
