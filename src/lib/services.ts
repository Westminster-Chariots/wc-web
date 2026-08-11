import axios from "axios";
import { api } from "./api";
import type { Booking, Driver, FleetVehicle, User, Profile, Invoice, CreateBookingPayload, Service, PricingConfiguration, HourlyPricingConfiguration } from "@/types";

// Service owns no pricing fields (see the Service type's doc comment) - the
// only normalization it still needs is defending against a malformed/
// missing features array.
type RawService = Omit<Service, "features"> & { features: unknown };
function normalizeService(raw: RawService): Service {
  return {
    ...raw,
    features: Array.isArray(raw.features) ? raw.features : [],
  };
}

// Postgres numeric columns (calculationBase/distanceCoefficient/
// timeCoefficient/minimumFare/adjustmentCoefficient/roundingIncrement)
// serialize as strings over the raw API response - mirrors
// normalizeService/normalizeBooking's precedent for the same reason.
type RawPricingConfiguration = Omit<
  PricingConfiguration,
  "calculationBase" | "distanceCoefficient" | "timeCoefficient" | "minimumFare" | "adjustmentCoefficient" | "roundingIncrement"
> & {
  calculationBase: string | number;
  distanceCoefficient: string | number;
  timeCoefficient: string | number;
  minimumFare: string | number;
  adjustmentCoefficient: string | number;
  roundingIncrement: string | number;
};
function normalizePricingConfiguration(raw: RawPricingConfiguration): PricingConfiguration {
  return {
    ...raw,
    calculationBase: parseFloat(String(raw.calculationBase)),
    distanceCoefficient: parseFloat(String(raw.distanceCoefficient)),
    timeCoefficient: parseFloat(String(raw.timeCoefficient)),
    minimumFare: parseFloat(String(raw.minimumFare)),
    adjustmentCoefficient: parseFloat(String(raw.adjustmentCoefficient)),
    roundingIncrement: parseFloat(String(raw.roundingIncrement)),
  };
}

// Postgres numeric columns (baseHourlyRate/roundingIncrement/each option's
// includedMiles) serialize as strings over the raw API response - same
// reasoning as normalizePricingConfiguration above. customPriceCents is a
// plain integer column already (not numeric), so it needs no conversion.
type RawHourlyPricingOption = Omit<HourlyPricingConfiguration["options"][number], "includedMiles"> & { includedMiles: string | number };
type RawHourlyPricingConfiguration = Omit<
  HourlyPricingConfiguration,
  "baseHourlyRate" | "roundingIncrement" | "options"
> & {
  baseHourlyRate: string | number;
  roundingIncrement: string | number;
  options: RawHourlyPricingOption[];
};
function normalizeHourlyPricingConfiguration(raw: RawHourlyPricingConfiguration): HourlyPricingConfiguration {
  return {
    ...raw,
    baseHourlyRate: parseFloat(String(raw.baseHourlyRate)),
    roundingIncrement: parseFloat(String(raw.roundingIncrement)),
    options: (raw.options ?? []).map((o) => ({ ...o, includedMiles: parseFloat(String(o.includedMiles)) })),
  };
}

// ─── Auth Services ───────────────────────────────────────────────────────────
export const authService = {
  login: async (email: string, password: string) => {
    const { data } = await api.post("/auth/login", { email, password });
    if (data.accessToken) {
      localStorage.setItem("access_token", data.accessToken);
      localStorage.setItem("refresh_token", data.refreshToken);
    }
    return data;
  },
  
  loginWithGoogle: async (idToken: string) => {
    const { data } = await api.post("/auth/google/mobile", { 
      idToken, 
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID 
    });
    if (data.accessToken) {
      localStorage.setItem("access_token", data.accessToken);
      localStorage.setItem("refresh_token", data.refreshToken);
    }
    return data;
  },
  
  initiateGoogleOAuth: () => {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "https://wc-backend-ayx0.onrender.com/api/v1";
    window.location.href = `${backendUrl}/auth/google`;
  },
  
  register: async (email: string, password: string, fullName: string, phone?: string) => {
    const { data } = await api.post("/auth/register", { email, password, name: fullName, phone });
    return data;
  },
  
  logout: async () => {
    await api.post("/auth/logout");
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  },
  
  me: async (): Promise<User> => {
    const { data } = await api.get("/auth/me");
    return data;
  },

  updateProfile: async (updates: { displayName?: string; phone?: string }) => {
    const { data } = await api.patch("/auth/profile", updates);
    return data;
  },
  
  forgotPassword: async (email: string) => {
    await api.post("/auth/forgot-password", { email });
  },
  
  resetPassword: async (token: string, password: string) => {
    await api.post("/auth/reset-password", { token, password });
  },
  
  refresh: async () => {
    const { data } = await api.post("/auth/refresh");
    return data;
  },
};

// Postgres numeric/decimal columns (distanceMiles, basePrice, gratuity,
// totalPrice, paymentAmount, groupTotalPrice, and each leg's totalPrice)
// serialize as STRINGS over the raw JSON API response - this is the single
// place that normalizes them into real, finite numbers (or null if missing
// or not a valid finite number) before a Booking ever reaches a caller.
// Never coerces a bad value to 0 or drops it silently - a non-finite result
// becomes null, an explicit "we don't have a valid number", not a fake
// measurement. A previous direct `.toFixed()` call on an unconverted string
// (distanceMiles) crashed the entire booking-confirmed page; converting ad
// hoc at each call site (or masking it with `?.`) would leave that same
// class of bug free to reappear anywhere else a Booking field is used.
function toFiniteNumberOrNull(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "string" && value.trim() === "") return null;
  // JS's Number() maps "" and whitespace-only strings to 0 - guarded above
  // so a blank/corrupt value never silently becomes a fake zero measurement.
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

function normalizeBooking<T extends Record<string, unknown>>(raw: T): T {
  if (!raw || typeof raw !== "object") return raw;
  return {
    ...raw,
    distanceMiles: toFiniteNumberOrNull(raw.distanceMiles),
    basePrice: toFiniteNumberOrNull(raw.basePrice),
    gratuity: toFiniteNumberOrNull(raw.gratuity),
    totalPrice: toFiniteNumberOrNull(raw.totalPrice),
    ...(raw.includedMiles !== undefined ? { includedMiles: toFiniteNumberOrNull(raw.includedMiles) } : {}),
    // paymentAmount/groupTotalPrice may be legitimately absent (admin-only
    // scoping, or no tripGroupId) - only convert when the key is actually
    // present, so "absent" stays absent rather than becoming an explicit null.
    ...(raw.paymentAmount !== undefined ? { paymentAmount: toFiniteNumberOrNull(raw.paymentAmount) } : {}),
    ...(raw.groupTotalPrice !== undefined ? { groupTotalPrice: toFiniteNumberOrNull(raw.groupTotalPrice) } : {}),
    ...(Array.isArray(raw.legs)
      ? {
          legs: raw.legs.map((leg: Record<string, unknown>) => ({
            ...leg,
            totalPrice: toFiniteNumberOrNull(leg.totalPrice),
          })),
        }
      : {}),
  };
}

// ─── Booking Services ────────────────────────────────────────────────────────
export const bookingService = {
  create: async (bookingData: CreateBookingPayload, signal?: AbortSignal): Promise<Booking> => {
    const { data } = await api.post("/bookings", bookingData, { signal });
    return normalizeBooking(data);
  },

  getAll: async (filters?: { status?: string; startDate?: string; endDate?: string }): Promise<Booking[]> => {
    const { data } = await api.get("/bookings", { params: filters });
    return Array.isArray(data) ? data.map(normalizeBooking) : data;
  },

  getById: async (id: string): Promise<Booking> => {
    const { data } = await api.get(`/bookings/${id}`);
    return normalizeBooking(data);
  },

  update: async (id: string, updates: Partial<Booking>) => {
    const { data } = await api.patch(`/bookings/${id}`, updates);
    return normalizeBooking(data);
  },

  updateStatus: async (id: string, status: string) => {
    const { data } = await api.patch(`/bookings/${id}/status`, { status });
    return data;
  },

  assignDriver: async (id: string, driverId: string) => {
    const { data } = await api.patch(`/bookings/${id}/assign`, { driverId });
    return data;
  },

  cancel: async (id: string, reason?: string) => {
    // Backend registers this as PATCH, not POST - was silently mismatched.
    const { data } = await api.patch(`/bookings/${id}/cancel`, { reason });
    return normalizeBooking(data);
  },
  
  sendPaymentLink: async (id: string, finalPrice: number, paymentLink: string, emailMessage?: string) => {
    const { data } = await api.post(`/bookings/${id}/send-payment-link`, { 
      finalPrice, 
      paymentLink,
      emailMessage 
    });
    return data;
  },
  
  sendManifest: async (id: string) => {
    const { data } = await api.post(`/bookings/${id}/send-manifest`);
    return data;
  },
  
  getMyBookings: async (): Promise<Booking[]> => {
    try {
      const { data } = await api.get("/bookings");
      return data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 500) {
        try {
          const { data } = await api.get("/bookings/my");
          return data;
        } catch {
          // fallback failed, rethrow original server error
        }
      }
      throw error;
    }
  },
};

// ─── Payment Email Status (admin) ────────────────────────────────────────────
// Backed by GET/POST /clover-payments/:bookingId/email-status and
// /resend-emails - both requireAdmin on the backend, and both go through the
// standard authenticated `api` client (unlike the Clover charge call, this
// route has no cookie/production constraint that would need a manual
// Authorization header - see cloverCharge.ts for why that one is different).
export type PaymentEmailState = {
  status: "sent" | "failed" | "not_sent";
  timestamp: string | null;
  category?: string;
  description?: string;
};

export type PaymentEmailStatus = {
  confirmation: PaymentEmailState;
  invoice: PaymentEmailState;
};

export const paymentEmailService = {
  getStatus: async (bookingId: string): Promise<PaymentEmailStatus> => {
    const { data } = await api.get(`/clover-payments/${bookingId}/email-status`);
    return data;
  },

  resend: async (bookingId: string): Promise<{ confirmationEmailSentAt: string | null; invoiceEmailSentAt: string | null }> => {
    const { data } = await api.post(`/clover-payments/${bookingId}/resend-emails`);
    return data;
  },
};

// ─── Driver Services ─────────────────────────────────────────────────────────
export const driverService = {
  getAll: async (): Promise<Driver[]> => {
    const { data } = await api.get("/drivers");
    return data;
  },
  
  getById: async (id: string): Promise<Driver> => {
    const { data } = await api.get(`/drivers/${id}`);
    return data;
  },
  
  create: async (driverData: Partial<Driver>) => {
    const { data } = await api.post("/drivers", driverData);
    return data;
  },
  
  update: async (id: string, updates: Partial<Driver>) => {
    const { data } = await api.patch(`/drivers/${id}`, updates);
    return data;
  },
  
  delete: async (id: string) => {
    await api.delete(`/drivers/${id}`);
  },
  
  updateStatus: async (id: string, status: string) => {
    const { data } = await api.patch(`/drivers/${id}/status`, { status });
    return data;
  },
};

// ─── Fleet Services ──────────────────────────────────────────────────────────
export const fleetService = {
  getAll: async (): Promise<FleetVehicle[]> => {
    const { data } = await api.get("/fleet");
    return data;
  },
  
  getById: async (id: string): Promise<FleetVehicle> => {
    const { data } = await api.get(`/fleet/${id}`);
    return data;
  },
  
  create: async (vehicleData: Partial<FleetVehicle>) => {
    const { data } = await api.post("/fleet", vehicleData);
    return data;
  },
  
  update: async (id: string, updates: Partial<FleetVehicle>) => {
    const { data } = await api.patch(`/fleet/${id}`, updates);
    return data;
  },
  
  delete: async (id: string) => {
    await api.delete(`/fleet/${id}`);
  },
};

// ─── Service (customer-facing booking class) Services ────────────────────────
// Separate from fleetService above by design - see the Service type's
// doc comment in @/types. GET / is the public, active-only listing the
// booking page's pricing cards read from; getAllAdmin() is the admin
// Services module's list view (includes inactive services).
export const serviceService = {
  getAll: async (): Promise<Service[]> => {
    const { data } = await api.get("/services");
    return Array.isArray(data) ? data.map(normalizeService) : data;
  },

  getAllAdmin: async (): Promise<Service[]> => {
    const { data } = await api.get("/services/all");
    return Array.isArray(data) ? data.map(normalizeService) : data;
  },

  getById: async (id: string): Promise<Service> => {
    const { data } = await api.get(`/services/${id}`);
    return normalizeService(data);
  },

  create: async (serviceData: Partial<Service>): Promise<Service> => {
    const { data } = await api.post("/services", serviceData);
    return normalizeService(data);
  },

  update: async (id: string, updates: Partial<Service>): Promise<Service> => {
    const { data } = await api.patch(`/services/${id}`, updates);
    return normalizeService(data);
  },

  // Soft-delete only on the backend (see wc-backend-1 routes/services.ts) -
  // a service with existing bookings is deactivated instead of removed.
  delete: async (id: string): Promise<{ message: string; service?: Service }> => {
    const { data } = await api.delete(`/services/${id}`);
    return data;
  },
};

// ─── Pricing Configuration (Pricing module) Services ──────────────────────────
// Named, reusable adaptive-formula profiles - the Services form's "Pricing
// Configuration" dropdown reads from getAllAdmin() (optionally filtered by
// vehicleType), never hardcodes options. There is deliberately no create/
// edit UI wired to create()/update() yet (out of scope for this task,
// deferred to the Pricing-module redesign) - they exist here only so the
// backend's admin CRUD is reachable if/when that UI is built, and so tests
// can exercise it without a browser.
export const pricingConfigurationService = {
  // vehicleType filters server-side to one class; activeOnly further
  // excludes inactive rows - both are what the Services form's dropdown
  // needs (only active, compatible configurations - see the "DROPDOWN
  // BEHAVIOR" requirement).
  getAllAdmin: async (params?: { vehicleType?: "sedan" | "suv"; activeOnly?: boolean }): Promise<PricingConfiguration[]> => {
    const { data } = await api.get("/pricing/configurations", { params });
    return Array.isArray(data) ? data.map(normalizePricingConfiguration) : data;
  },

  getById: async (id: string): Promise<PricingConfiguration> => {
    const { data } = await api.get(`/pricing/configurations/${id}`);
    return normalizePricingConfiguration(data);
  },

  create: async (configData: Partial<PricingConfiguration>): Promise<PricingConfiguration> => {
    const { data } = await api.post("/pricing/configurations", configData);
    return normalizePricingConfiguration(data);
  },

  update: async (id: string, updates: Partial<PricingConfiguration>): Promise<PricingConfiguration> => {
    const { data } = await api.patch(`/pricing/configurations/${id}`, updates);
    return normalizePricingConfiguration(data);
  },

  delete: async (id: string): Promise<{ message: string }> => {
    const { data } = await api.delete(`/pricing/configurations/${id}`);
    return data;
  },
};

// ─── Hourly Pricing Configuration (Pricing module) Services ──────────────────
// One config per Service (serviceId NOT NULL/UNIQUE) - structurally
// parallel to pricingConfigurationService above, but for the separate
// hourly_pricing_configurations table, plus its nested duration-package
// (hourly_pricing_options) sub-resource. Backs Admin -> Pricing's Hourly
// Pricing package builder.
export const hourlyPricingConfigurationService = {
  getAllAdmin: async (params?: { vehicleType?: "sedan" | "suv"; enabledOnly?: boolean }): Promise<HourlyPricingConfiguration[]> => {
    const { data } = await api.get("/pricing/hourly-configurations", { params });
    return Array.isArray(data) ? data.map(normalizeHourlyPricingConfiguration) : data;
  },

  getById: async (id: string): Promise<HourlyPricingConfiguration> => {
    const { data } = await api.get(`/pricing/hourly-configurations/${id}`);
    return normalizeHourlyPricingConfiguration(data);
  },

  // The package-builder UI is service-first ("pick a service, see/build its
  // hourly packages") - null (not a 404) means the service has no
  // configuration yet, a normal state to render around, not an error.
  getByService: async (serviceId: string): Promise<HourlyPricingConfiguration | null> => {
    const { data } = await api.get(`/pricing/hourly-configurations/by-service/${serviceId}`);
    return data ? normalizeHourlyPricingConfiguration(data) : null;
  },

  create: async (configData: {
    serviceId: string; baseHourlyRate: number; enabled?: boolean; durationMode?: "interval" | "custom";
    minimumDurationMinutes?: number; maximumDurationMinutes?: number; incrementMinutes?: number; roundingIncrement?: number;
  }): Promise<HourlyPricingConfiguration> => {
    const { data } = await api.post("/pricing/hourly-configurations", configData);
    return normalizeHourlyPricingConfiguration(data);
  },

  update: async (id: string, updates: Partial<{
    baseHourlyRate: number; enabled: boolean; durationMode: "interval" | "custom";
    minimumDurationMinutes: number; maximumDurationMinutes: number; incrementMinutes: number; roundingIncrement: number;
  }>): Promise<HourlyPricingConfiguration> => {
    const { data } = await api.patch(`/pricing/hourly-configurations/${id}`, updates);
    return normalizeHourlyPricingConfiguration(data);
  },

  delete: async (id: string): Promise<{ message: string }> => {
    const { data } = await api.delete(`/pricing/hourly-configurations/${id}`);
    return data;
  },

  // Interval mode's "Generate" action - syncs hourly_pricing_options to
  // exactly match the given min/max/increment. Existing rows for durations
  // still in range keep their price/mileage edits untouched; rows outside
  // the new range are removed. Returns the full config with its (now
  // regenerated) options embedded.
  generateOptions: async (
    id: string,
    bounds: { minimumDurationMinutes: number; maximumDurationMinutes: number; incrementMinutes: number }
  ): Promise<HourlyPricingConfiguration> => {
    const { data } = await api.post(`/pricing/hourly-configurations/${id}/generate-options`, bounds);
    return normalizeHourlyPricingConfiguration(data);
  },

  addOption: async (
    configId: string,
    option: { durationMinutes: number; includedMiles: number; customPriceCents?: number | null; isActive?: boolean }
  ): Promise<HourlyPricingConfiguration["options"][number]> => {
    const { data } = await api.post(`/pricing/hourly-configurations/${configId}/options`, option);
    return { ...data, includedMiles: parseFloat(String(data.includedMiles)) };
  },

  updateOption: async (
    configId: string,
    optionId: string,
    updates: Partial<{ durationMinutes: number; includedMiles: number; customPriceCents: number | null; isActive: boolean }>
  ): Promise<HourlyPricingConfiguration["options"][number]> => {
    const { data } = await api.patch(`/pricing/hourly-configurations/${configId}/options/${optionId}`, updates);
    return { ...data, includedMiles: parseFloat(String(data.includedMiles)) };
  },

  removeOption: async (configId: string, optionId: string): Promise<{ message: string }> => {
    const { data } = await api.delete(`/pricing/hourly-configurations/${configId}/options/${optionId}`);
    return data;
  },
};

// ─── Global Hourly Booking availability ──────────────────────────────────────
// Whether Hourly Booking exists on the customer-facing site at all -
// distinct from an individual configuration's `enabled` flag, which only
// affects one service. See wc-backend-1's hourlyBookingSettings doc comment.
export const hourlyBookingAvailabilityService = {
  // Public, no auth - the homepage fetches this once to decide whether to
  // show "By the hour" at all.
  getAvailability: async (): Promise<{ enabled: boolean }> => {
    const { data } = await api.get("/pricing/hourly-availability");
    return data;
  },

  getSettingsAdmin: async (): Promise<{ id: string | null; isEnabled: boolean; updatedBy: string | null; updatedAt: string | null }> => {
    const { data } = await api.get("/pricing/hourly-booking-settings");
    return data;
  },

  updateSettingsAdmin: async (isEnabled: boolean) => {
    const { data } = await api.patch("/pricing/hourly-booking-settings", { isEnabled });
    return data;
  },
};

// ─── Client Services ─────────────────────────────────────────────────────────
export const clientService = {
  getAll: async (): Promise<User[]> => {
    const { data } = await api.get("/clients");
    return data;
  },
  
  getById: async (id: string): Promise<User> => {
    const { data } = await api.get(`/clients/${id}`);
    return data;
  },
  
  getProfile: async (): Promise<Profile> => {
    const { data } = await api.get("/clients/profile");
    return data;
  },
  
  updateProfile: async (updates: Partial<Profile>) => {
    const { data } = await api.patch("/clients/profile", updates);
    return data;
  },
};

// ─── Invoice Services ────────────────────────────────────────────────────────
export const invoiceService = {
  getAll: async (): Promise<Invoice[]> => {
    const { data } = await api.get("/invoices");
    return data;
  },
  
  getById: async (id: string): Promise<Invoice> => {
    const { data } = await api.get(`/invoices/${id}`);
    return data;
  },
  
  getMyInvoices: async (): Promise<Invoice[]> => {
    const { data } = await api.get("/invoices/my");
    return data;
  },
  
  create: async (invoiceData: Partial<Invoice>) => {
    const { data } = await api.post("/invoices", invoiceData);
    return data;
  },
  
  update: async (id: string, updates: Partial<Invoice>) => {
    const { data } = await api.patch(`/invoices/${id}`, updates);
    return data;
  },
  
  sendInvoice: async (id: string) => {
    await api.post(`/invoices/${id}/send`);
  },
};

// ─── Analytics Services ──────────────────────────────────────────────────────
export const analyticsService = {
  getDashboard: async () => {
    const { data } = await api.get("/analytics/dashboard");
    return data;
  },
  
  getRevenue: async (startDate?: string, endDate?: string) => {
    const { data } = await api.get("/analytics/revenue", { params: { startDate, endDate } });
    return data;
  },
  
  getTopRoutes: async (limit = 10) => {
    const { data } = await api.get("/analytics/top-routes", { params: { limit } });
    return data;
  },
};

// ─── Pricing Services ────────────────────────────────────────────────────────
export interface QuotePreviewLeg {
  distanceMiles: number;
  durationMinutes: number;
}
export interface QuotePreviewRequest {
  vehicleType: "sedan" | "suv";
  // Which Service/Class this quote is for - see the Service type's doc
  // comment in @/types. Preferred over vehicleType alone: the backend
  // resolves the actual pricing profile from this when present (see
  // wc-backend-1 lib/servicePricing.ts), falling back to vehicleType's
  // default active service when omitted.
  serviceId?: string;
  distanceMiles: number;
  durationMinutes: number;
  additionalLegs?: QuotePreviewLeg[];
}
export interface QuotePreviewLegResult {
  basePrice: number;
  gratuity: number;
  totalPrice: number;
}
export interface QuotePreviewResponse {
  legs: QuotePreviewLegResult[];
  combinedTotal: number;
  combinedTotalCents: number;
  // Opaque, signed quote token (see backend lib/quote.ts) - the frontend
  // must carry this unchanged into CreateBookingPayload.quoteId and must
  // never compute or submit an amount independently of it. There is no
  // separate lookup: the token itself IS the quote, verified fresh by the
  // backend every time it's presented.
  quoteId: string;
  expiresAt: string;
}

// Structurally parallel to QuotePreviewResponse above but for the hourly
// path - no legs (an hourly booking is never multi-leg), flat basePrice/
// gratuity/total from rate x durationMinutes instead.
export interface QuoteHourlyPreviewResponse {
  basePrice: number;
  gratuity: number;
  totalPrice: number;
  totalCents: number;
  hourlyRate: number;
  durationMinutes: number;
  includedMiles: number;
  // Which pricing style produced this total - "rate" (baseHourlyRate x
  // duration) or "package" (an admin-set fixed price for this duration).
  // Locked in with everything else on the quote - see HourlyQuotePayload.
  priceSource: "rate" | "package";
  quoteId: string;
  expiresAt: string;
}

export const pricingService = {
  // Backend-authoritative, signed quote - the same calculateAdaptiveFareCents()
  // booking creation itself falls back to, so a quote shown here and a
  // booking's actual created total can never independently drift apart. The
  // returned quoteId locks this exact price; see checkout/page.tsx for how
  // it's carried through to booking creation and re-requested on expiry.
  calculate: async (params: QuotePreviewRequest): Promise<QuotePreviewResponse> => {
    const { data } = await api.post("/pricing/calculate", params);
    if (!Array.isArray(data?.legs)) {
      throw new Error(data?.error ?? "Invalid pricing response");
    }
    return data;
  },

  // Hourly counterpart to calculate() above - same "signed token IS the
  // quote, carry it unchanged into booking creation" contract, computed
  // from rate x durationMinutes (see backend lib/hourlyPricing.ts) instead
  // of distance/duration. Requires auth (same as calculate()) - /book's step
  // 0 hourly card shows Service.hourlyPricing's public numbers for a
  // pre-login preview instead of calling this; this is only called once
  // the customer reaches checkout (post-login), mirroring exactly how
  // one-way's real quote is deferred past the local pricingEstimate.ts
  // preview.
  calculateHourly: async (params: { serviceId: string; durationMinutes: number }): Promise<QuoteHourlyPreviewResponse> => {
    const { data } = await api.post("/pricing/calculate-hourly", params);
    if (typeof data?.totalCents !== "number") {
      throw new Error(data?.error ?? "Invalid hourly pricing response");
    }
    return data;
  },

  getConfig: async () => {
    const { data } = await api.get("/pricing/config");
    return data;
  },
  
  createConfig: async (config: { vehicleType: string; baseRate: number; ratePerMile: number; ratePerMinute: number; taxPercent: number; waitTimeHourly: number }) => {
    const { data } = await api.post("/pricing/config", config);
    return data;
  },
  
  updateConfig: async (id: string, config: any) => {
    const { data } = await api.patch(`/pricing/config/${id}`, config);
    return data;
  },
  
  // Admin-configured automatic gratuity (see backend lib/gratuity.ts) -
  // toggle + percentage applied once to a trip's combined subtotal.
  // Changing this never affects an already-issued quote or existing
  // bookings; it only takes effect for quotes issued after the change.
  getGratuitySettings: async (): Promise<{ enabled: boolean; percent: number }> => {
    const { data } = await api.get("/pricing/gratuity");
    return data;
  },

  updateGratuitySettings: async (settings: { enabled: boolean; percent: number }): Promise<{ enabled: boolean; percent: number }> => {
    const { data } = await api.patch("/pricing/gratuity", settings);
    return data;
  },

  getZones: async () => {
    const { data } = await api.get("/pricing/zones");
    return data;
  },
  
  createZone: async (zoneData: any) => {
    const { data } = await api.post("/pricing/zones", zoneData);
    return data;
  },
  
  updateZone: async (id: string, updates: any) => {
    const { data } = await api.patch(`/pricing/zones/${id}`, updates);
    return data;
  },
  
  deleteZone: async (id: string) => {
    await api.delete(`/pricing/zones/${id}`);
  },
  
  getVehiclePricing: async () => {
    const { data } = await api.get("/pricing/vehicles");
    return data;
  },
  
  getVehiclePricingById: async (vehicleId: string) => {
    const { data } = await api.get(`/pricing/vehicles/${vehicleId}`);
    return data;
  },
  
  upsertVehiclePricing: async (vehicleId: string, pricing: { baseRate?: number; ratePerMile?: number; ratePerMinute?: number; taxPercent?: number }) => {
    const { data } = await api.put(`/pricing/vehicles/${vehicleId}`, pricing);
    return data;
  },
  
  deleteVehiclePricing: async (vehicleId: string) => {
    await api.delete(`/pricing/vehicles/${vehicleId}`);
  },
};

// ─── Campaign Services ───────────────────────────────────────────────────────
export const campaignService = {
  getAll: async () => {
    const { data } = await api.get("/campaigns");
    return data;
  },
  
  create: async (campaignData: any) => {
    const { data } = await api.post("/campaigns", campaignData);
    return data;
  },
  
  send: async (id: string) => {
    await api.post(`/campaigns/${id}/send`);
  },
};

// ─── Upload Services ─────────────────────────────────────────────────────────
export const uploadService = {
  uploadFile: async (file: File, type: string) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);
    
    const { data } = await api.post("/uploads", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },
};

// ─── Document Services ───────────────────────────────────────────────────────
export interface Document {
  id: string;
  documentType: "driver_manifest" | "client_invoice" | "trip_confirmation";
  documentNumber: string;
  clientEmail: string;
  clientName: string;
  bookingId?: string;
  userId?: string;
  documentData: any;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDocumentPayload {
  documentType: "driver_manifest" | "client_invoice" | "trip_confirmation";
  documentNumber: string;
  clientEmail: string;
  clientName: string;
  bookingId?: string;
  userId?: string;
  documentData: any;
}

export const documentService = {
  create: async (payload: CreateDocumentPayload): Promise<Document> => {
    const { data } = await api.post("/documents", payload);
    return data;
  },

  getAll: async (filters?: {
    type?: string;
    search?: string;
    clientEmail?: string;
    limit?: number;
    offset?: number;
  }): Promise<Document[]> => {
    const { data } = await api.get("/documents", { params: filters });
    return data;
  },

  getMyDocuments: async (): Promise<Document[]> => {
    const { data } = await api.get("/documents/my-documents");
    return data;
  },

  getById: async (id: string): Promise<Document> => {
    const { data } = await api.get(`/documents/${id}`);
    return data;
  },

  update: async (id: string, payload: Partial<CreateDocumentPayload>): Promise<Document> => {
    const { data } = await api.patch(`/documents/${id}`, payload);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/documents/${id}`);
  },
};
