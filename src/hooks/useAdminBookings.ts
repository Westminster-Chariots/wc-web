"use client";
import { useState, useEffect, useCallback } from "react";
import { bookingService } from "@/lib/services";
import { toast } from "sonner";
import type { UIBooking } from "@/components/dashboard/BookingCard";

export function useAdminBookings() {
  const [bookings, setBookings] = useState<UIBooking[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      const data = await bookingService.getAll();
      
      // Transform API data to UIBooking format
      const uiBookings: UIBooking[] = data.map((b: any) => {
        // Calculate if urgent: pickup within next 12 hours
        const pickupDT = new Date(`${b.pickupDate}T${b.pickupTime}`);
        const hoursUntil = (pickupDT.getTime() - Date.now()) / 3600000;
        const isUrgent = hoursUntil > 0 && hoursUntil <= 12 && b.status !== "done" && b.status !== "cancelled";

        // Format time for display
        const [h, m] = b.pickupTime.split(":");
        const hour = parseInt(h);
        const ampm = hour >= 12 ? "PM" : "AM";
        const displayHour = hour % 12 || 12;
        const displayTime = `${displayHour}:${m} ${ampm}`;

        return {
          id: b.id,
          reservationNumber: b.reservationNumber || b.id.slice(0, 8).toUpperCase(),
          clientName: b.clientName || "Unknown",
          clientEmail: b.clientEmail,
          pickupDate: b.pickupDate,
          pickupTime: displayTime,
          spotTime: b.spotTime || displayTime,
          pickupLocation: b.pickupLocation,
          dropoffLocation: b.dropoffLocation,
          vehicleType: b.vehicleType,
          vehicleNumber: b.vehicleNumber,
          status: b.status,
          driver: b.driverName,
          driverId: b.driverId,
          paxCount: b.passengerCount || 1,
          flightTail: b.flightNumber,
          specialRequests: b.specialRequests,
          price: b.totalPrice || b.basePrice || 0,
          isUrgent,
          distanceMiles: b.distanceMiles,
          durationMinutes: b.durationMinutes,
          groupId: b.tripGroupId,
          legOrder: b.legOrder || 1,
          createdAt: b.createdAt,
          emailPhase: b.emailPhase,
        };
      });

      setBookings(uiBookings);
    } catch (error: any) {
      console.error("Failed to fetch bookings:", error);
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
    
    // TODO: Set up Pusher subscription for realtime updates
    // const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
    //   cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    // });
    // const channel = pusher.subscribe('bookings');
    // channel.bind('booking-updated', () => {
    //   fetchBookings();
    // });
    // return () => {
    //   pusher.unsubscribe('bookings');
    // };
  }, [fetchBookings]);

  const updateStatus = useCallback(async (bookingId: string, newStatus: UIBooking["status"]) => {
    try {
      await bookingService.updateStatus(bookingId, newStatus);
      // Optimistically update local state
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: newStatus } : b));
      // Refetch to ensure consistency
      fetchBookings();
    } catch (error: any) {
      console.error("Status update failed:", error);
      toast.error("Failed to update booking status");
    }
  }, [fetchBookings]);

  const assignDriver = useCallback(async (bookingId: string, driverId: string | null) => {
    try {
      if (driverId) {
        await bookingService.assignDriver(bookingId, driverId);
      } else {
        // Unassign driver
        await bookingService.update(bookingId, { driverId: null });
      }
      // Refetch to get updated data
      fetchBookings();
    } catch (error: any) {
      console.error("Driver assignment failed:", error);
      toast.error("Failed to assign driver");
    }
  }, [fetchBookings]);

  return { bookings, loading, updateStatus, assignDriver, refetch: fetchBookings };
}
