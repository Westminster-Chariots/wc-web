import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, waitFor } from "@testing-library/react";
import type { Booking } from "@/types";
import type { QuotePreviewRequest, QuotePreviewResponse } from "@/lib/services";

// Fleet/Services split regression test: checkout must carry the customer's
// selected Service (serviceId) unchanged into BOTH the quote request and
// booking creation - never a fleet vehicleId (which the backend already
// ignored for pricing/storage before this refactor - see wc-backend-1
// routes/bookings.ts's CreateBookingSchema comment - and which the
// customer-facing flow no longer selects at all).

const routerPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: routerPush, back: vi.fn(), replace: vi.fn() }),
}));

const SEEDED_BUSINESS_SEDAN_SERVICE_ID = "11111111-1111-4111-8111-111111111111";

const BASE_DATA = {
  pickup: "100 Main St",
  dropoff: "200 Oak Ave",
  isPickupAirport: false,
  pickupDate: "2026-09-01",
  pickupTime: "10:00",
  selectedVehicle: "sedan" as const,
  selectedServiceId: SEEDED_BUSINESS_SEDAN_SERVICE_ID,
  selectedServiceName: "Business Sedan",
  selectedServiceImage: "/assets/sedan-profile.png",
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

const STABLE_ROUTE = { distance: 12, duration: 22 };
vi.mock("@/hooks/useRouteDetails", () => ({
  useRouteDetails: () => ({ route: STABLE_ROUTE }),
  fetchRouteDetails: vi.fn(() => Promise.resolve(null)),
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

function quoteResponse(combinedTotalCents: number): QuotePreviewResponse {
  const combinedTotal = combinedTotalCents / 100;
  return {
    legs: [{ basePrice: combinedTotal * 0.8, gratuity: combinedTotal * 0.2, totalPrice: combinedTotal }],
    combinedTotal,
    combinedTotalCents,
    quoteId: "test-quote-1",
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
  getAuthoritativeQuoteMock.mockResolvedValue(quoteResponse(15000));
  createBookingMock.mockResolvedValue(bookingResponse("booking-1", 150));
});

describe("serviceId wiring (Fleet/Services split)", () => {
  it("sends the selected serviceId, unchanged, to both the quote request and booking creation - never a vehicleId", async () => {
    render(<BookingCheckoutPage />);

    await waitFor(() => expect(getAuthoritativeQuoteMock).toHaveBeenCalled());
    await waitFor(() => expect(createBookingMock).toHaveBeenCalled());

    const quoteRequest = getAuthoritativeQuoteMock.mock.calls[0][0];
    const bookingPayload = createBookingMock.mock.calls[0][0];

    expect(quoteRequest.serviceId).toBe(SEEDED_BUSINESS_SEDAN_SERVICE_ID);
    expect(bookingPayload.serviceId).toBe(SEEDED_BUSINESS_SEDAN_SERVICE_ID);
    expect("vehicleId" in quoteRequest).toBe(false);
    expect("vehicleId" in bookingPayload).toBe(false);

    // vehicleType is still sent alongside serviceId (derived from the
    // service's own vehicleType) - the backend's bookings.vehicleType
    // column and dispatch matching still key off it. The backend itself
    // re-derives/validates this server-side from the service once
    // serviceId is present - it never trusts a conflicting client value
    // (see the backend's PricingConfiguration resolution tests).
    expect(quoteRequest.vehicleType).toBe("sedan");
    expect(bookingPayload.vehicleType).toBe("sedan");
  });
});
