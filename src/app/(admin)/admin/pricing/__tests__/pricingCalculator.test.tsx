import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import type { QuotePreviewRequest, QuotePreviewResponse } from "@/lib/services";

// The admin Test Pricing Calculator used to call calculateVehicleSpecificPrice
// (a client-side, admin-gratuity-unaware estimate) - these tests exist to
// prove it now calls the real, backend-authoritative POST /pricing/calculate
// (via getAuthoritativeQuote) instead, so it immediately reflects whatever
// gratuity setting an admin has saved.

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const getZonesMock = vi.fn().mockResolvedValue([]);
const getAllVehiclesMock = vi.fn().mockResolvedValue([
  { id: "veh-sedan-1", vehicleType: "sedan", make: "Mercedes-Benz", model: "S-Class", plate: "DEV-1", color: "Black", status: "available" },
]);
const getGratuitySettingsMock = vi.fn().mockResolvedValue({ enabled: false, percent: 0 });
const updateGratuitySettingsMock = vi.fn();
vi.mock("@/lib/services", () => ({
  pricingService: {
    getZones: () => getZonesMock(),
    getGratuitySettings: () => getGratuitySettingsMock(),
    updateGratuitySettings: (...args: unknown[]) => updateGratuitySettingsMock(...args),
    updateZone: vi.fn(),
  },
  fleetService: {
    getAll: () => getAllVehiclesMock(),
  },
}));

// A stable object reference (not a fresh literal per call) is required: the
// calculator's useEffect depends on `route` by reference, and a new object
// every render would re-fire it (and re-call getAuthoritativeQuote/setState)
// on every single render indefinitely.
const STABLE_ROUTE = { distance: 24.7, duration: 30 };
vi.mock("@/hooks/useRouteDetails", () => ({
  useRouteDetails: () => ({ route: STABLE_ROUTE, isLoading: false, error: null }),
}));

const getAuthoritativeQuoteMock = vi.fn<(request: QuotePreviewRequest) => Promise<QuotePreviewResponse>>();
vi.mock("@/hooks/usePricing", () => ({
  usePricing: () => ({
    calculatePrice: vi.fn(),
    getAuthoritativeQuote: getAuthoritativeQuoteMock,
  }),
}));

vi.mock("@/components/booking/LocationInput", () => ({
  default: (props: { icon: string; value: string; onChange: (value: string, isAirport: boolean) => void }) => (
    <input
      data-testid={`location-${props.icon}`}
      value={props.value}
      onChange={(e) => props.onChange(e.target.value, false)}
    />
  ),
}));

vi.mock("@/components/ui/date-picker", () => ({
  default: (props: { onChange: (date: string) => void }) => (
    <button type="button" data-testid="date-picker-pick" onClick={() => props.onChange("2026-09-01")}>
      Pick date
    </button>
  ),
}));

vi.mock("@/components/ui/time-picker", () => ({
  default: (props: { onChange: (time: string) => void }) => (
    <button type="button" data-testid="time-picker-pick" onClick={() => props.onChange("10:00")}>
      Pick time
    </button>
  ),
}));

const { default: AdminPricingPage } = await import("../page");

async function fillCalculatorAndCalculate() {
  render(<AdminPricingPage />);

  fireEvent.click(await screen.findByText("Pricing Calculator"));

  fireEvent.change(await screen.findByTestId("location-pickup"), { target: { value: "1600 Pennsylvania Ave NW" } });
  fireEvent.change(screen.getByTestId("location-dropoff"), { target: { value: "Dulles International Airport" } });

  fireEvent.click(screen.getByPlaceholderText("Select date"));
  fireEvent.click(screen.getByTestId("date-picker-pick"));
  fireEvent.click(screen.getByPlaceholderText("Select time"));
  fireEvent.click(screen.getByTestId("time-picker-pick"));

  fireEvent.click(screen.getByRole("button", { name: /calculate price/i }));
}

beforeEach(() => {
  getZonesMock.mockClear();
  getAllVehiclesMock.mockClear();
  getGratuitySettingsMock.mockClear();
  updateGratuitySettingsMock.mockReset();
  getAuthoritativeQuoteMock.mockReset();
});

describe("Admin Test Pricing Calculator - backed by the real quote endpoint", () => {
  it("reflects gratuity off: the real quote's zero gratuity is shown, not a client-side estimate", async () => {
    getAuthoritativeQuoteMock.mockResolvedValue({
      legs: [{ basePrice: 130, gratuity: 0, totalPrice: 130 }],
      combinedTotal: 130,
      combinedTotalCents: 13000,
      quoteId: "quote-off-token",
      expiresAt: new Date(Date.now() + 20 * 60_000).toISOString(),
    });

    await fillCalculatorAndCalculate();

    await waitFor(() => {
      expect(getAuthoritativeQuoteMock).toHaveBeenCalledWith(
        expect.objectContaining({ vehicleType: "sedan", distanceMiles: 24.7, durationMinutes: 30 })
      );
    });
    await waitFor(() => expect(screen.getByText(/Base: \$130\.00 \+ Gratuity: \$0\.00/)).toBeInTheDocument());
  });

  it("reflects a configured gratuity percentage: the real quote's nonzero gratuity is shown", async () => {
    getAuthoritativeQuoteMock.mockResolvedValue({
      legs: [{ basePrice: 130, gratuity: 19.5, totalPrice: 149.5 }],
      combinedTotal: 149.5,
      combinedTotalCents: 14950,
      quoteId: "quote-15pct-token",
      expiresAt: new Date(Date.now() + 20 * 60_000).toISOString(),
    });

    await fillCalculatorAndCalculate();

    await waitFor(() => expect(screen.getByText(/Base: \$130\.00 \+ Gratuity: \$19\.50/)).toBeInTheDocument());
    expect(screen.getByText("$149.50")).toBeInTheDocument();
  });

  it("selecting a vehicle shows its quote ID from the real backend quote, not a fabricated one", async () => {
    getAuthoritativeQuoteMock.mockResolvedValue({
      legs: [{ basePrice: 130, gratuity: 19.5, totalPrice: 149.5 }],
      combinedTotal: 149.5,
      combinedTotalCents: 14950,
      quoteId: "quote-15pct-token",
      expiresAt: new Date(Date.now() + 20 * 60_000).toISOString(),
    });

    await fillCalculatorAndCalculate();

    await waitFor(() => expect(screen.getByText(/Base: \$130\.00 \+ Gratuity: \$19\.50/)).toBeInTheDocument());
    fireEvent.click(screen.getByText("Mercedes-Benz S-Class"));

    await waitFor(() => expect(screen.getByText(/Quote ID: quote-15pct-token/)).toBeInTheDocument());
  });

  it("clears stale calculator results once a gratuity change is saved, instead of leaving the old figure displayed", async () => {
    getAuthoritativeQuoteMock.mockResolvedValue({
      legs: [{ basePrice: 130, gratuity: 0, totalPrice: 130 }],
      combinedTotal: 130,
      combinedTotalCents: 13000,
      quoteId: "quote-off-token",
      expiresAt: new Date(Date.now() + 20 * 60_000).toISOString(),
    });

    await fillCalculatorAndCalculate();
    await waitFor(() => expect(screen.getByText(/Base: \$130\.00 \+ Gratuity: \$0\.00/)).toBeInTheDocument());

    // Switch to Configuration, turn gratuity on, and save - this is the same
    // state change an admin would make from the Calculator tab's sibling
    // tab; vehiclePrices lives on the page component, not the tab, so it
    // would otherwise still show the pre-save ($0.00) figure below.
    updateGratuitySettingsMock.mockResolvedValue({ enabled: true, percent: 15 });
    fireEvent.click(screen.getByText("Configuration"));
    fireEvent.click(await screen.findByRole("switch", { name: /automatic gratuity/i }));
    fireEvent.change(screen.getByRole("spinbutton"), { target: { value: "15" } });
    fireEvent.click(screen.getByRole("button", { name: /^save$/i }));

    await waitFor(() => expect(updateGratuitySettingsMock).toHaveBeenCalledWith({ enabled: true, percent: 15 }));

    // Back on the Calculator tab, the stale pre-save figure must be gone -
    // showing it here would be exactly the mismatch this whole fix removes,
    // just relocated to a tab switch instead of a failed quote.
    fireEvent.click(screen.getByText("Pricing Calculator"));
    expect(screen.queryByText(/Base: \$130\.00 \+ Gratuity: \$0\.00/)).not.toBeInTheDocument();
  });
});
