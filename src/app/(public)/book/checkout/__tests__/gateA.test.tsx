import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Booking } from "@/types";
import type { QuotePreviewResponse } from "@/lib/services";

// --- Mocks: every hook/service/component checkout/page.tsx depends on -----

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

vi.mock("@/hooks/useFleet", () => ({
  useFleet: () => ({ vehicles: [] }),
}));

const getAuthoritativeQuoteMock = vi.fn();
vi.mock("@/hooks/usePricing", () => ({
  usePricing: () => ({
    calculatePrice: () => 100,
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

const chargeBookingMock = vi.fn();
vi.mock("@/lib/cloverCharge", () => ({
  chargeBooking: (...args: unknown[]) => chargeBookingMock(...args),
}));

vi.mock("@/lib/notify", () => ({
  notify: { error: vi.fn(), success: vi.fn() },
}));

// Stubs the real hosted-iframe component with a single button so tests can
// assert whether the payment step is reachable at all, without needing a
// fake Clover SDK (already covered separately in CloverPayment.test.tsx).
vi.mock("@/components/booking/CloverPayment", () => ({
  default: (props: { onSuccess: (token: string) => void }) => (
    <button onClick={() => props.onSuccess("tok_test")}>MockPayButton</button>
  ),
}));

vi.mock("@/components/booking/CheckoutSummary", () => ({
  default: () => <div>MockCheckoutSummary</div>,
}));

const { default: BookingCheckoutPage } = await import("../page");

function quoteResponse(combinedTotalCents: number): QuotePreviewResponse {
  const combinedTotal = combinedTotalCents / 100;
  return {
    legs: [{ basePrice: combinedTotal * 0.8, gratuity: combinedTotal * 0.2, totalPrice: combinedTotal }],
    combinedTotal,
    combinedTotalCents,
  };
}

function bookingResponse(id: string, totalPrice: number, groupTotalPrice?: number): Partial<Booking> {
  return { id, totalPrice, groupTotalPrice: groupTotalPrice ?? totalPrice, legs: [] };
}

beforeEach(() => {
  routerPush.mockReset();
  getAuthoritativeQuoteMock.mockReset();
  createBookingMock.mockReset();
  chargeBookingMock.mockReset();
});

describe("Checkout Gate A - pre-payment mismatch gate", () => {
  it("renders the Pay step when the created booking's total matches the accepted quote", async () => {
    getAuthoritativeQuoteMock.mockResolvedValue(quoteResponse(14640));
    createBookingMock.mockResolvedValue(bookingResponse("booking-1", 146.4));

    render(<BookingCheckoutPage />);

    await waitFor(() => expect(screen.getByText("MockPayButton")).toBeInTheDocument());
    expect(screen.queryByText("Accept updated price")).not.toBeInTheDocument();
    expect(screen.queryByText("Your total has changed")).not.toBeInTheDocument();
  });

  it("blocks the Pay step and shows Gate A when the created total differs from the accepted quote", async () => {
    getAuthoritativeQuoteMock.mockResolvedValue(quoteResponse(14640)); // $146.40 accepted
    createBookingMock.mockResolvedValue(bookingResponse("booking-1", 126.6)); // backend actually created $126.60

    render(<BookingCheckoutPage />);

    await waitFor(() => expect(screen.getByText("Accept updated price")).toBeInTheDocument());
    expect(screen.queryByText("MockPayButton")).not.toBeInTheDocument();
    expect(chargeBookingMock).not.toHaveBeenCalled();
  });

  it("accepting the updated price only updates local state - no charge, then requires a separate Pay click", async () => {
    getAuthoritativeQuoteMock.mockResolvedValue(quoteResponse(14640));
    createBookingMock.mockResolvedValue(bookingResponse("booking-1", 126.6));

    render(<BookingCheckoutPage />);
    await waitFor(() => expect(screen.getByText("Accept updated price")).toBeInTheDocument());

    const user = userEvent.setup();
    await user.click(screen.getByText("Accept updated price"));

    // Accepting alone must never call chargeBooking.
    expect(chargeBookingMock).not.toHaveBeenCalled();
    expect(routerPush).not.toHaveBeenCalledWith(expect.stringContaining("booking-confirmed"));

    // The gate clears and the Pay step becomes reachable - but only via an
    // explicit, separate click on it.
    await waitFor(() => expect(screen.getByText("MockPayButton")).toBeInTheDocument());
    expect(chargeBookingMock).not.toHaveBeenCalled(); // still not called merely by becoming visible

    await user.click(screen.getByText("MockPayButton"));
    await waitFor(() => expect(chargeBookingMock).toHaveBeenCalledTimes(1));
  });

  it("labels the total as an estimate and never creates a booking when the quote endpoint is unavailable", async () => {
    getAuthoritativeQuoteMock.mockRejectedValue(new Error("network error"));

    render(<BookingCheckoutPage />);

    await waitFor(() => expect(screen.getByText(/Estimated total/i)).toBeInTheDocument());
    expect(createBookingMock).not.toHaveBeenCalled();
    expect(screen.queryByText("MockPayButton")).not.toBeInTheDocument();
  });

  it("regression: a charge-time mismatch (Gate B) never auto-charges or navigates to booking-confirmed", async () => {
    getAuthoritativeQuoteMock.mockResolvedValue(quoteResponse(14640));
    createBookingMock.mockResolvedValue(bookingResponse("booking-1", 146.4)); // matches accepted quote - Gate A passes

    chargeBookingMock.mockResolvedValue({
      kind: "mismatch",
      token: "tok_test",
      authoritativeAmount: 150.0,
      authoritativeAmountCents: 15000,
      previousAmountCents: 14640,
      differenceCents: 15000 - 14640,
      reason: "The price for this trip was updated since you last saw it.",
      legs: [{ legOrder: 1, pickupLocation: "100 Main St", dropoffLocation: "200 Oak Ave", totalPrice: 150.0 }],
    });

    render(<BookingCheckoutPage />);
    await waitFor(() => expect(screen.getByText("MockPayButton")).toBeInTheDocument());

    const user = userEvent.setup();
    await user.click(screen.getByText("MockPayButton"));

    await waitFor(() => expect(screen.getByText("Your total has changed")).toBeInTheDocument());
    expect(routerPush).not.toHaveBeenCalledWith(expect.stringContaining("booking-confirmed"));
    expect(chargeBookingMock).toHaveBeenCalledTimes(1); // the one deliberate click, not auto-retried
  });
});
