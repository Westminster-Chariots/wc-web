import axios from "axios";
import { api } from "./api";
import type { Booking, Driver, FleetVehicle, User, Profile, Invoice } from "@/types";

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

// ─── Booking Services ────────────────────────────────────────────────────────
export const bookingService = {
  create: async (bookingData: Partial<Booking>) => {
    const { data } = await api.post("/bookings", bookingData);
    return data;
  },
  
  getAll: async (filters?: { status?: string; startDate?: string; endDate?: string }): Promise<Booking[]> => {
    const { data } = await api.get("/bookings", { params: filters });
    return data;
  },
  
  getById: async (id: string): Promise<Booking> => {
    const { data } = await api.get(`/bookings/${id}`);
    return data;
  },
  
  update: async (id: string, updates: Partial<Booking>) => {
    const { data } = await api.patch(`/bookings/${id}`, updates);
    return data;
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
    const { data } = await api.post(`/bookings/${id}/cancel`, { reason });
    return data;
  },
  
  sendPaymentLink: async (id: string, finalPrice: number) => {
    const { data } = await api.post(`/bookings/${id}/send-payment-link`, { finalPrice });
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
export const pricingService = {
  calculate: async (params: { pickup: string; dropoff: string; vehicleType: string; pickupTime: string }) => {
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
