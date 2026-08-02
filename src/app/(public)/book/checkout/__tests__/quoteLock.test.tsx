import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Booking } from "@/types";
import type { QuotePreviewRequest, QuotePreviewResponse } from "@/lib/services";

// Regression tests for the server-issued signed quote lock: checkout must
// carry the quoteId returned by getAuthoritativeQuote() unchanged into
// booking creation, and must never silently recompute or auto-retry with a
// different amount when the backend rejects a stale/expired/mismatched
// quote - it must fetch a fresh quote and require the customer to
// explicitly re-accept it (Gate 0) before trying again.

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
  additionalLegs: [] as never[],
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

// A stable object reference across renders - unlike a fresh `{ distance,
// duration }` literal returned on every call, this must not itself trigger
// the quote-fetch effect (whose deps include `route`) to refire on every
// re-render, which would make call-count assertions below flaky/inflated.
const STABLE_ROUTE = { distance: 12, duration: 22 };
vi.mock("@/hooks/useRouteDetails", () => ({
  useRouteDetails: () => ({ route: STABLE_ROUTE }),
  fetchRouteDetails: vi.fn(() => Promise.resolve(null)),
}));

vi.mock("@/hooks/useFleet", () => ({
  useFleet: () => ({ vehicles: [] }),
}));

const getAuthoritativeQuoteMock = vi.fn<(request: QuotePreviewRequest) => Promise<QuotePreviewResponse>>();
vi.mock("@/hooks/usePricing", () => ({
  usePricing: () => ({
    calculatePrice: () => ({ basePrice: 100, demandAdjustment: 15, totalPrice: 115, floorApplied: false }),
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
// Shape axios.isAxiosError() actually checks - a plain object with
// isAxiosError: true and a .response, exactly what a real 409 from the
// centralized axios client produces. No real network/axios instance needed.
function quoteRejection(code: string) {
  return { isAxiosError: true, response: { status: 409, data: { code, error: "quote rejected" } } };
}

beforeEach(() => {
  quoteCounter = 0;
  routerPush.mockReset();
  getAuthoritativeQuoteMock.mockReset();
  createBookingMock.mockReset();
});

describe("Quote lock: quoteId carried from quote to booking creation", () => {
  it("createBooking sends the exact quoteId returned by getAuthoritativeQuote, never a client-computed amount", async () => {
    getAuthoritativeQuoteMock.mockResolvedValue(quoteResponse(10500));
    createBookingMock.mockResolvedValue(bookingResponse("booking-1", 105));

    render(<BookingCheckoutPage />);

    await waitFor(() => expect(createBookingMock).toHaveBeenCalled());

    const quoteResult = await getAuthoritativeQuoteMock.mock.results[0].value;
    const bookingPayload = createBookingMock.mock.calls[0][0];
    expect(bookingPayload.quoteId).toBe(quoteResult.quoteId);
    // The payload carries the quote's id, not an amount field of any kind -
    // there is nothing here for the browser to have computed or edited.
    expect(bookingPayload).not.toHaveProperty("amount");
    expect(bookingPayload).not.toHaveProperty("totalPrice");
  });
});

describe("Quote lock: Gate 0 (quote rejected at booking-creation time)", () => {
  it("on a 409 quote_expired, fetches a fresh quote and shows a re-acceptance banner instead of auto-retrying or charging", async () => {
    getAuthoritativeQuoteMock.mockResolvedValueOnce(quoteResponse(10500));
    createBookingMock.mockRejectedValueOnce(quoteRejection("quote_expired"));
    // The fresh quote fetched after rejection - a different amount, so the
    // customer has something concrete to review.
    getAuthoritativeQuoteMock.mockResolvedValueOnce(quoteResponse(11000));

    render(<BookingCheckoutPage />);

    await waitFor(() => expect(createBookingMock).toHaveBeenCalledTimes(1));
    // A second quote request must follow the rejection.
    await waitFor(() => expect(getAuthoritativeQuoteMock).toHaveBeenCalledTimes(2));

    // The re-acceptance banner is shown; the pay button must not be.
    await waitFor(() => expect(screen.getByText(/quote needed to be refreshed/i)).toBeInTheDocument());
    expect(screen.queryByText("MockPayButton")).not.toBeInTheDocument();

    // Must not have silently retried booking creation with the new amount.
    expect(createBookingMock).toHaveBeenCalledTimes(1);
  });

  it("clicking Confirm price and continue retries booking creation with the fresh quote's id", async () => {
    getAuthoritativeQuoteMock.mockResolvedValueOnce(quoteResponse(10500));
    createBookingMock.mockRejectedValueOnce(quoteRejection("quote_mismatch"));
    getAuthoritativeQuoteMock.mockResolvedValueOnce(quoteResponse(11000));
    createBookingMock.mockResolvedValueOnce(bookingResponse("booking-2", 110));

    const user = userEvent.setup();
    render(<BookingCheckoutPage />);

    await waitFor(() => expect(screen.getByText(/quote needed to be refreshed/i)).toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: /confirm price and continue/i }));

    await waitFor(() => expect(createBookingMock).toHaveBeenCalledTimes(2));
    const freshQuote = await getAuthoritativeQuoteMock.mock.results[1].value;
    expect(createBookingMock.mock.calls[1][0].quoteId).toBe(freshQuote.quoteId);

    // Resolved cleanly - payment becomes available, no leftover banner.
    await waitFor(() => expect(screen.getByText("MockPayButton")).toBeInTheDocument());
    expect(screen.queryByText(/quote needed to be refreshed/i)).not.toBeInTheDocument();
  });

  it("a non-quote booking-creation error still shows the generic retry banner, unaffected by Gate 0", async () => {
    getAuthoritativeQuoteMock.mockResolvedValue(quoteResponse(10500));
    createBookingMock.mockRejectedValueOnce(new Error("network down"));

    render(<BookingCheckoutPage />);

    await waitFor(() => expect(screen.getByText(/network down/i)).toBeInTheDocument());
    expect(screen.queryByText(/quote needed to be refreshed/i)).not.toBeInTheDocument();
    // Only the one, non-quote-triggered attempt - Gate 0's re-fetch path
    // must not have fired for an unrelated error.
    expect(getAuthoritativeQuoteMock).toHaveBeenCalledTimes(1);
  });
});
