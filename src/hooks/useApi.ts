"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { bookingService, driverService, fleetService, clientService, invoiceService, analyticsService } from "@/lib/services";
import { toast } from "sonner";
import type { Booking, Driver, FleetVehicle } from "@/types";

// ─── Booking Hooks ───────────────────────────────────────────────────────────
export function useBookings(filters?: { status?: string; startDate?: string; endDate?: string }) {
  return useQuery({
    queryKey: ["bookings", filters],
    queryFn: () => bookingService.getAll(filters),
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute
  });
}

export function useBooking(id: string) {
  return useQuery({
    queryKey: ["booking", id],
    queryFn: () => bookingService.getById(id),
    enabled: !!id,
  });
}

export function useMyBookings() {
  return useQuery({
    queryKey: ["my-bookings"],
    queryFn: () => bookingService.getMyBookings(),
    staleTime: 30000,
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (bookingData: Partial<Booking>) => bookingService.create(bookingData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["my-bookings"] });
      toast.success("Booking created successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create booking");
    },
  });
}

export function useUpdateBooking() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Booking> }) => 
      bookingService.update(id, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["booking", variables.id] });
      toast.success("Booking updated successfully!");
    },
    onError: () => {
      toast.error("Failed to update booking");
    },
  });
}

export function useUpdateBookingStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => 
      bookingService.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      toast.success("Status updated successfully!");
    },
    onError: () => {
      toast.error("Failed to update status");
    },
  });
}

export function useAssignDriver() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ bookingId, driverId }: { bookingId: string; driverId: string }) => 
      bookingService.assignDriver(bookingId, driverId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      toast.success("Driver assigned successfully!");
    },
    onError: () => {
      toast.error("Failed to assign driver");
    },
  });
}

export function useCancelBooking() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => 
      bookingService.cancel(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["my-bookings"] });
      toast.success("Booking cancelled");
    },
    onError: () => {
      toast.error("Failed to cancel booking");
    },
  });
}

// ─── Driver Hooks ────────────────────────────────────────────────────────────
export function useDrivers() {
  return useQuery({
    queryKey: ["drivers"],
    queryFn: () => driverService.getAll(),
    staleTime: 60000, // 1 minute
  });
}

export function useDriver(id: string) {
  return useQuery({
    queryKey: ["driver", id],
    queryFn: () => driverService.getById(id),
    enabled: !!id,
  });
}

export function useCreateDriver() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (driverData: Partial<Driver>) => driverService.create(driverData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
      toast.success("Driver added successfully!");
    },
    onError: () => {
      toast.error("Failed to add driver");
    },
  });
}

export function useUpdateDriver() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Driver> }) => 
      driverService.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
      toast.success("Driver updated successfully!");
    },
    onError: () => {
      toast.error("Failed to update driver");
    },
  });
}

export function useDeleteDriver() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => driverService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
      toast.success("Driver removed");
    },
    onError: () => {
      toast.error("Failed to remove driver");
    },
  });
}

// ─── Fleet Hooks ─────────────────────────────────────────────────────────────
export function useFleet() {
  return useQuery({
    queryKey: ["fleet"],
    queryFn: () => fleetService.getAll(),
    staleTime: 60000,
  });
}

export function useVehicle(id: string) {
  return useQuery({
    queryKey: ["vehicle", id],
    queryFn: () => fleetService.getById(id),
    enabled: !!id,
  });
}

export function useCreateVehicle() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (vehicleData: Partial<FleetVehicle>) => fleetService.create(vehicleData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fleet"] });
      toast.success("Vehicle added successfully!");
    },
    onError: () => {
      toast.error("Failed to add vehicle");
    },
  });
}

export function useUpdateVehicle() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<FleetVehicle> }) => 
      fleetService.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fleet"] });
      toast.success("Vehicle updated successfully!");
    },
    onError: () => {
      toast.error("Failed to update vehicle");
    },
  });
}

export function useDeleteVehicle() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => fleetService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fleet"] });
      toast.success("Vehicle removed");
    },
    onError: () => {
      toast.error("Failed to remove vehicle");
    },
  });
}

// ─── Client Hooks ────────────────────────────────────────────────────────────
export function useClients() {
  return useQuery({
    queryKey: ["clients"],
    queryFn: () => clientService.getAll(),
    staleTime: 60000,
  });
}

export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: () => clientService.getProfile(),
    staleTime: 300000, // 5 minutes
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (updates: any) => clientService.updateProfile(updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Profile updated successfully!");
    },
    onError: () => {
      toast.error("Failed to update profile");
    },
  });
}

// ─── Invoice Hooks ───────────────────────────────────────────────────────────
export function useInvoices() {
  return useQuery({
    queryKey: ["invoices"],
    queryFn: () => invoiceService.getAll(),
    staleTime: 60000,
  });
}

export function useMyInvoices() {
  return useQuery({
    queryKey: ["my-invoices"],
    queryFn: () => invoiceService.getMyInvoices(),
    staleTime: 60000,
  });
}

// ─── Analytics Hooks ─────────────────────────────────────────────────────────
export function useAnalytics() {
  return useQuery({
    queryKey: ["analytics"],
    queryFn: () => analyticsService.getDashboard(),
    staleTime: 30000,
    refetchInterval: 60000,
  });
}
