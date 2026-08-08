import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import type { QuotePreviewResponse } from "@/lib/services";

// --- Mocks: every hook/service/component checkout/page.tsx depends on -----
// Same pattern as gateA.test.tsx, except CheckoutSummary is mocked to
// EXPOSE the exact numeric props it's given (grandTotal/basePrice/gratuity/
// loading) instead of hiding them - this test is specifically about what
// number reaches that boundary, not about Gate A's accept/pay flow.

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
  selectedServiceId: null,
  flightNumber: "",
  specialRequests: "",
  additionalLegs: [] as { pickup: string; dropoff: string; pickupDate: string; pickupTime: string; distanceMiles?: number; durationMinutes?: number }[],
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
  fetchRouteDetails: vi.fn(),
}));

// calculatePrice is the local, lower-trust estimate (usePricing.ts) - stands
// in for a materially different number than the backend-authoritative quote.
// Returns a flat {basePrice:100, demandAdjustment:20, totalPrice:120}
// regardless of input, giving a deterministic fallbackEstimate.grandTotal of
// 120.00 under the pre-fix code path. demandAdjustment is deliberately
// nonzero here so a test asserting "no gratuity from the fallback" is
// actually exercising something, not trivially true because both are 0.
const getAuthoritativeQuoteMock = vi.fn();
vi.mock("@/hooks/usePricing", () => ({
  usePricing: () => ({
    calculatePrice: () => ({ basePrice: 100, demandAdjustment: 20, totalPrice: 120, floorApplied: false }),
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

vi.mock("@/lib/cloverCharge", () => ({
  chargeBooking: vi.fn(),
}));

vi.mock("@/lib/notify", () => ({
  notify: { error: vi.fn(), success: vi.fn() },
}));

vi.mock("@/components/booking/CloverPayment", () => ({
  default: () => <button>MockPayButton</button>,
}));

const checkoutSummaryProps: { grandTotal?: number; basePrice?: number; gratuity?: number; isEstimate?: boolean; loading?: boolean }[] = [];
vi.mock("@/components/booking/CheckoutSummary", () => ({
  default: (props: { grandTotal: number; basePrice: number; gratuity: number; isEstimate?: boolean; loading: boolean }) => {
    checkoutSummaryProps.push({
      grandTotal: props.grandTotal,
      basePrice: props.basePrice,
      gratuity: props.gratuity,
      isEstimate: props.isEstimate,
      loading: props.loading,
    });
    return (
      <div data-testid="checkout-summary" data-loading={String(props.loading)}>
        Total due: ${Number(props.grandTotal || 0).toFixed(2)}, Gratuity: ${Number(props.gratuity || 0).toFixed(2)}
      </div>
    );
  },
}));

const { default: BookingCheckoutPage } = await import("../page");

beforeEach(() => {
  routerPush.mockReset();
  getAuthoritativeQuoteMock.mockReset();
  createBookingMock.mockReset();
  checkoutSummaryProps.length = 0;
});

describe("Checkout price display - fallback-estimate flicker", () => {
  it("never shows the local fallback estimate as Total due while the authoritative quote is still in flight (not yet errored)", async () => {
    // Simulates the real customer-facing window between the route resolving
    // and the quote request settling (e.g. a slow/cold backend) - the quote
    // promise deliberately never resolves during this test.
    getAuthoritativeQuoteMock.mockReturnValue(new Promise<QuotePreviewResponse>(() => {}));

    render(<BookingCheckoutPage />);

    // Give effects a tick to run and fallbackEstimate/quote state to settle.
    await waitFor(() => expect(checkoutSummaryProps.length).toBeGreaterThan(0));

    for (const snapshot of checkoutSummaryProps) {
      // 120.00 is fallbackEstimate.grandTotal under calculatePrice() -> 100
      // (100 base + flat 20% gratuity). This must never reach the customer
      // as "Total due" while the real quote hasn't resolved AND hasn't
      // errored - that combination means "still loading", not "here is a
      // verified price".
      expect(snapshot.grandTotal).not.toBe(120);
    }
    // The still-loading state must be visibly flagged as such (e.g. a
    // skeleton/placeholder), not presented as a settled total.
    expect(checkoutSummaryProps[checkoutSummaryProps.length - 1].loading).toBe(true);
  });

  it("still shows the labeled fallback estimate once the quote endpoint genuinely errors (unchanged, existing behavior)", async () => {
    getAuthoritativeQuoteMock.mockRejectedValue(new Error("network error"));

    render(<BookingCheckoutPage />);

    await waitFor(() => expect(screen.getByText(/Estimated total/i)).toBeInTheDocument());
    // In the genuine-error case, the fallback number is intentionally shown
    // (clearly labeled as an estimate elsewhere on the page) rather than
    // withheld - this is the one case fallbackEstimate legitimately backs.
    await waitFor(() => {
      const last = checkoutSummaryProps[checkoutSummaryProps.length - 1];
      expect(last.grandTotal).toBe(120);
    });
  });

  it("displays the backend's authoritative gratuity once the quote succeeds", async () => {
    const quote: QuotePreviewResponse = {
      legs: [{ basePrice: 130, gratuity: 19.5, totalPrice: 149.5 }],
      combinedTotal: 149.5,
      combinedTotalCents: 14950,
      quoteId: "signed-quote-token",
      expiresAt: new Date(Date.now() + 20 * 60_000).toISOString(),
    };
    getAuthoritativeQuoteMock.mockResolvedValue(quote);
    // A real quote succeeding triggers this page's own auto-create-booking
    // effect - give it something to resolve to so that unrelated flow
    // doesn't throw and pollute this test with an unrelated bookingError.
    createBookingMock.mockResolvedValue({ id: "booking-1", totalPrice: 149.5, legs: [] });

    render(<BookingCheckoutPage />);

    await waitFor(() => {
      const last = checkoutSummaryProps[checkoutSummaryProps.length - 1];
      expect(last.gratuity).toBe(19.5);
      expect(last.grandTotal).toBe(149.5);
      expect(last.isEstimate).toBeFalsy();
    });
  });

  it("never invents a gratuity figure from the client-side demand-adjustment estimate when the quote endpoint fails", async () => {
    // calculatePrice() (mocked above) returns demandAdjustment:20 - a
    // nonzero value distinct from gratuity, so this test only passes if
    // that number is genuinely never surfaced as "gratuity", not merely
    // coincidentally zero.
    getAuthoritativeQuoteMock.mockRejectedValue(new Error("network error"));

    render(<BookingCheckoutPage />);

    await waitFor(() => expect(screen.getByText(/Estimated total/i)).toBeInTheDocument());
    await waitFor(() => {
      const last = checkoutSummaryProps[checkoutSummaryProps.length - 1];
      expect(last.gratuity).toBe(0);
      expect(last.isEstimate).toBe(true);
    });
  });

  it("disables payment entirely while the quote endpoint has failed (no fallback-priced charge is ever possible)", async () => {
    getAuthoritativeQuoteMock.mockRejectedValue(new Error("network error"));

    render(<BookingCheckoutPage />);

    await waitFor(() => expect(screen.getByText(/Estimated total/i)).toBeInTheDocument());
    // Booking creation is gated on a real `quote` (see the auto-create
    // effect in page.tsx), so bookingId never gets set from the fallback
    // estimate alone - CloverPayment (mocked as "MockPayButton") must never
    // mount in this state.
    expect(screen.queryByText("MockPayButton")).not.toBeInTheDocument();
    expect(createBookingMock).not.toHaveBeenCalled();
  });

  it("replaces the estimate with the authoritative quote once a retry succeeds", async () => {
    // Kept failing (not "Once") until the assertions below confirm the
    // initial error/estimate state has fully settled - queuing a single
    // resolved call with mockResolvedValueOnce would be a race if this
    // effect ever fires more than once before the explicit retry click.
    getAuthoritativeQuoteMock.mockRejectedValue(new Error("network error"));

    render(<BookingCheckoutPage />);

    await waitFor(() => expect(screen.getByText(/Estimated total/i)).toBeInTheDocument());
    await waitFor(() => {
      const last = checkoutSummaryProps[checkoutSummaryProps.length - 1];
      expect(last.isEstimate).toBe(true);
      expect(last.gratuity).toBe(0);
    });

    const quote: QuotePreviewResponse = {
      legs: [{ basePrice: 130, gratuity: 19.5, totalPrice: 149.5 }],
      combinedTotal: 149.5,
      combinedTotalCents: 14950,
      quoteId: "signed-quote-token",
      expiresAt: new Date(Date.now() + 20 * 60_000).toISOString(),
    };
    getAuthoritativeQuoteMock.mockResolvedValue(quote);
    // A real quote succeeding triggers this page's own auto-create-booking
    // effect - give it something to resolve to so that unrelated flow
    // doesn't throw and pollute this test with an unrelated bookingError.
    createBookingMock.mockResolvedValue({ id: "booking-1", totalPrice: 149.5, legs: [] });

    fireEvent.click(screen.getByRole("button", { name: /try again/i }));

    await waitFor(() => {
      const last = checkoutSummaryProps[checkoutSummaryProps.length - 1];
      expect(last.isEstimate).toBeFalsy();
      expect(last.gratuity).toBe(19.5);
      expect(last.grandTotal).toBe(149.5);
    });
  });
});
