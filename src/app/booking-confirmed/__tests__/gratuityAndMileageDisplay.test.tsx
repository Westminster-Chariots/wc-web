import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type { Booking } from "@/types";

// This confirmation page used to fabricate a "Base fare / Gratuity (20%)"
// split as (total * 0.8) / (total * 0.2) regardless of whether gratuity was
// ever actually charged - a customer with gratuity off (the default, see
// backend lib/gratuity.ts) would still see a fake 20% tip line. These tests
// prove the breakdown now comes from the booking's own stored
// basePrice/gratuity and is only shown when gratuity is genuinely nonzero,
// and that an hourly booking's real included mileage is shown.

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => new URLSearchParams("booking_id=booking-1"),
}));
vi.mock("@/hooks/useAuth", () => ({ useAuth: () => ({ user: null, isAdmin: false, logout: vi.fn() }) }));
vi.mock("@/contexts/LanguageContext", () => ({ useLanguage: () => ({ lang: "en", cycleLang: vi.fn() }) }));
vi.mock("@/components/home/navigation/ServicesDropdown", () => ({ default: () => null }));
vi.mock("@/lib/notify", () => ({ notify: { error: vi.fn(), success: vi.fn() } }));

let mockBooking: Partial<Booking> = {};
vi.mock("@/lib/services", () => ({
  bookingService: { getById: () => Promise.resolve(mockBooking) },
}));

function baseBooking(overrides: Partial<Booking> = {}): Partial<Booking> {
  return {
    id: "booking-1",
    reservationNumber: "WC-1001",
    pickupDate: "2026-09-01",
    pickupTime: "10:00:00",
    pickupLocation: "1600 Pennsylvania Ave NW",
    dropoffLocation: null,
    vehicleType: "sedan",
    paymentStatus: "paid",
    totalPrice: 195,
    groupTotalPrice: null,
    legs: [],
    ...overrides,
  };
}

const { default: PremiumBookingConfirmed } = await import("../PremiumBookingConfirmed");

describe("Booking confirmation - real gratuity breakdown (never a fabricated 20% guess)", () => {
  it("shows no Gratuity line at all when this booking's own stored gratuity is zero", async () => {
    mockBooking = baseBooking({ basePrice: 195, gratuity: 0, totalPrice: 195 });
    render(<PremiumBookingConfirmed />);

    expect(await screen.findByText("Total Amount")).toBeInTheDocument();
    expect(screen.queryByText(/Gratuity/)).not.toBeInTheDocument();
    // The old bug would render exactly this string (total * 0.2 = $39.00) -
    // must never appear even coincidentally.
    expect(screen.queryByText("$39.00")).not.toBeInTheDocument();
  });

  it("shows the real Base fare and Gratuity amounts when this booking's own stored gratuity is nonzero", async () => {
    mockBooking = baseBooking({ basePrice: 130, gratuity: 19.5, totalPrice: 149.5 });
    render(<PremiumBookingConfirmed />);

    expect(await screen.findByText("Gratuity")).toBeInTheDocument();
    expect(screen.getByText("Base fare")).toBeInTheDocument();
    expect(screen.getByText("$130.00")).toBeInTheDocument();
    expect(screen.getByText("$19.50")).toBeInTheDocument();
    // Never the old fabricated 80/20 split of the total (149.5*0.8=119.60, 149.5*0.2=29.90).
    expect(screen.queryByText("$119.60")).not.toBeInTheDocument();
    expect(screen.queryByText("$29.90")).not.toBeInTheDocument();
  });

  it("shows the real configured included mileage for an hourly booking", async () => {
    mockBooking = baseBooking({
      bookingType: "hourly",
      dropoffLocation: null,
      hourlyDurationMinutes: 180,
      includedMiles: 75,
      basePrice: 195,
      gratuity: 0,
      totalPrice: 195,
    });
    render(<PremiumBookingConfirmed />);

    expect(await screen.findByText("Included Miles")).toBeInTheDocument();
    expect(screen.getByText("75 miles included")).toBeInTheDocument();
  });
});
