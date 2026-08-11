import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type { UIBooking } from "@/components/dashboard/BookingCard";

// This admin detail page used to show a raw "Dropoff" row (blank for hourly
// bookings), no included-miles anywhere, and a single flat "Price" figure
// with no way to tell whether gratuity was actually charged. These tests
// exist to prove the hourly-aware Charter row and the gratuity-gated
// Base/Gratuity/Total breakdown render from the booking's own stored
// fields - never a client-side guess.

vi.mock("next/navigation", () => ({
  useParams: () => ({ id: "booking-1" }),
  useRouter: () => ({ push: vi.fn(), back: vi.fn() }),
}));

vi.mock("@/hooks/useDrivers", () => ({ useDrivers: () => ({ drivers: [] }) }));
vi.mock("@/hooks/useApi", () => ({
  usePaymentEmailStatus: () => ({ data: undefined }),
  useResendPaymentEmails: () => ({ mutate: vi.fn(), isPending: false }),
}));
vi.mock("@/lib/services", () => ({ bookingService: { sendManifest: vi.fn(), sendPaymentLink: vi.fn() } }));
vi.mock("@/components/booking/PaymentConfirmDialog", () => ({ default: () => null }));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

let mockBookings: UIBooking[] = [];
vi.mock("@/hooks/useAdminBookings", () => ({
  useAdminBookings: () => ({ bookings: mockBookings, loading: false, updateStatus: vi.fn(), assignDriver: vi.fn() }),
}));

function baseBooking(overrides: Partial<UIBooking> = {}): UIBooking {
  return {
    id: "booking-1",
    reservationNumber: "WC-1001",
    clientName: "Jane Doe",
    pickupDate: "2026-09-01",
    pickupTime: "10:00 AM",
    spotTime: "10:00 AM",
    pickupLocation: "1600 Pennsylvania Ave NW",
    dropoffLocation: "",
    vehicleType: "sedan",
    status: "pending",
    paxCount: 1,
    price: 195,
    isUrgent: false,
    createdAt: "2026-08-01T00:00:00.000Z",
    ...overrides,
  };
}

const { default: BookingDetailPage } = await import("../page");

describe("Admin booking detail - hourly-aware display", () => {
  it("shows a Charter row with duration and included miles instead of a blank Dropoff for an hourly booking", async () => {
    mockBookings = [
      baseBooking({
        bookingType: "hourly",
        hourlyDurationMinutes: 180,
        includedMiles: 75,
      }),
    ];
    render(<BookingDetailPage />);

    expect(await screen.findByText(/By the hour - 3h, 75 miles included/)).toBeInTheDocument();
    expect(screen.queryByText("Dropoff")).not.toBeInTheDocument();
  });

  it("shows the real Dropoff row, unchanged, for a one-way booking", async () => {
    mockBookings = [baseBooking({ bookingType: "oneway", dropoffLocation: "Dulles International Airport" })];
    render(<BookingDetailPage />);

    expect(await screen.findByText("Dropoff")).toBeInTheDocument();
    expect(screen.getByText("Dulles International Airport")).toBeInTheDocument();
  });
});

describe("Admin booking detail - gratuity breakdown gated on the booking's own stored value", () => {
  it("shows Base Price + Gratuity + Total Price when this booking's own gratuity is nonzero", async () => {
    mockBookings = [baseBooking({ price: 149.5, basePrice: 130, gratuity: 19.5 })];
    render(<BookingDetailPage />);

    expect(await screen.findByText("Base Price")).toBeInTheDocument();
    expect(screen.getByText("$130.00")).toBeInTheDocument();
    expect(screen.getByText("Gratuity")).toBeInTheDocument();
    expect(screen.getByText("$19.50")).toBeInTheDocument();
    expect(screen.getByText("Total Price")).toBeInTheDocument();
  });

  it("shows a single flat Price row, no Gratuity line, when this booking's stored gratuity is zero", async () => {
    mockBookings = [baseBooking({ price: 130, basePrice: 130, gratuity: 0 })];
    render(<BookingDetailPage />);

    expect(await screen.findByText("Price")).toBeInTheDocument();
    expect(screen.queryByText("Gratuity")).not.toBeInTheDocument();
    expect(screen.queryByText("Base Price")).not.toBeInTheDocument();
  });

  it("shows a single flat Price row when basePrice/gratuity are absent (legacy booking row)", async () => {
    mockBookings = [baseBooking({ price: 130, basePrice: undefined, gratuity: undefined })];
    render(<BookingDetailPage />);

    expect(await screen.findByText("Price")).toBeInTheDocument();
    expect(screen.queryByText("Gratuity")).not.toBeInTheDocument();
  });
});
