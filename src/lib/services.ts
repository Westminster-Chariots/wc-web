import axios from "axios";
import { api } from "./api";
import type { Booking, Driver, FleetVehicle, User, Profile, Invoice, CreateBookingPayload } from "@/types";

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
  vehicleId?: string;
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

export const pricingService = {
  // Backend-authoritative, signed quote - the same calculateAdaptiveFareCents()
  // booking creation itself falls back to, so a quote shown here and a
  // booking's actual created total can never independently drift apart. The
  // returned quoteId locks this exact price; see checkout/page.tsx for how
  // it's carried through to booking creation and re-requested on expiry.
  calculate: async (params: QuotePreviewRequest): Promise<QuotePreviewResponse> => {
    const { data } = await api.post("/pricing/calculate", params);
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
