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
    const backendUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || "https://wc-backend-ayx0.onrender.com";
    window.location.href = `${backendUrl}/api/v1/auth/google`;
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
    const { data } = await api.get("/bookings/my");
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
export const pricingService = {
  calculate: async (params: { pickup: string; dropoff: string; vehicleType: string; pickupTime: string }) => {
    const { data } = await api.post("/pricing/calculate", params);
    return data;
  },
  
  getConfig: async () => {
    const { data } = await api.get("/pricing/config");
    return data;
  },
  
  updateConfig: async (config: any) => {
    const { data } = await api.patch("/pricing/config", config);
    return data;
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
