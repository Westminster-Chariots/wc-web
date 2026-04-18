"use client";
import { useEffect, useRef, useCallback } from "react";
import type { UIBooking } from "@/hooks/useAdminBookings";
import { routeColors } from "./mapConfig";

interface RouteOverlayProps {
  map: google.maps.Map | null;
  bookings: UIBooking[];
  selectedBookingId: string | null;
}

interface RouteResult {
  bookingId: string;
  renderer: google.maps.DirectionsRenderer;
}

const ACTIVE_STATUSES = ["assigned", "enroute", "onsite", "inprogress"];

export default function RouteOverlay({ map, bookings, selectedBookingId }: RouteOverlayProps) {
  const routesRef = useRef<RouteResult[]>([]);
  const directionsService = useRef<google.maps.DirectionsService | null>(null);

  const clearRoutes = useCallback(() => {
    routesRef.current.forEach((r) => r.renderer.setMap(null));
    routesRef.current = [];
  }, []);

  useEffect(() => {
    if (!map) return;
    if (!directionsService.current) {
      directionsService.current = new google.maps.DirectionsService();
    }

    const activeBookings = bookings.filter((b) => ACTIVE_STATUSES.includes(b.status));

    const toRender = selectedBookingId
      ? activeBookings.filter((b) => b.id === selectedBookingId)
      : activeBookings;

    clearRoutes();

    toRender.forEach((booking) => {
      const color = routeColors[booking.status] || "#3b82f6";
      const isHighlighted = booking.id === selectedBookingId;

      directionsService.current!.route(
        {
          origin: booking.pickupLocation,
          destination: booking.dropoffLocation,
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === google.maps.DirectionsStatus.OK && result) {
            const renderer = new google.maps.DirectionsRenderer({
              map,
              directions: result,
              suppressMarkers: true,
              polylineOptions: {
                strokeColor: color,
                strokeWeight: isHighlighted ? 5 : 3,
                strokeOpacity: isHighlighted ? 1 : 0.6,
              },
            });
            routesRef.current.push({ bookingId: booking.id, renderer });
          }
        }
      );
    });

    return () => clearRoutes();
  }, [map, bookings, selectedBookingId, clearRoutes]);

  return null;
}
