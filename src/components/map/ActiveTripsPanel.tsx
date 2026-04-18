"use client";
import type { UIBooking } from "@/hooks/useAdminBookings";
import { routeColors } from "./mapConfig";
import { Navigation, Clock, MapPin, X } from "lucide-react";

interface ActiveTripsPanelProps {
  bookings: UIBooking[];
  selectedBookingId: string | null;
  onSelectBooking: (id: string | null) => void;
}

const ACTIVE_STATUSES = ["assigned", "enroute", "onsite", "inprogress"];

const statusLabels: Record<string, string> = {
  assigned: "Assigned",
  enroute: "En Route",
  onsite: "On Site",
  inprogress: "In Progress",
};

export default function ActiveTripsPanel({ bookings, selectedBookingId, onSelectBooking }: ActiveTripsPanelProps) {
  const activeBookings = bookings.filter((b) => ACTIVE_STATUSES.includes(b.status));

  if (activeBookings.length === 0) return null;

  return (
    <div className="absolute top-3 right-3 z-20 w-72 max-h-[calc(100%-24px)] overflow-auto rounded-xl border border-border bg-card/95 backdrop-blur-lg shadow-xl">
      <div className="sticky top-0 bg-card/95 backdrop-blur-lg px-4 py-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Navigation className="h-4 w-4 text-primary" />
          <span className="text-sm font-display font-semibold text-foreground">
            Active Trips ({activeBookings.length})
          </span>
        </div>
        {selectedBookingId && (
          <button
            onClick={() => onSelectBooking(null)}
            className="p-1 rounded hover:bg-muted transition-colors"
          >
            <X className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        )}
      </div>

      <div className="divide-y divide-border">
        {activeBookings.map((booking) => {
          const isSelected = booking.id === selectedBookingId;
          const color = routeColors[booking.status] || "#3b82f6";

          return (
            <button
              key={booking.id}
              onClick={() => onSelectBooking(isSelected ? null : booking.id)}
              className={`w-full text-left px-4 py-3 transition-colors hover:bg-muted/50 ${
                isSelected ? "bg-primary/10 border-l-2 border-l-primary" : ""
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-mono font-semibold text-foreground">
                  {booking.reservationNumber}
                </span>
                <span
                  className="text-[10px] px-1.5 py-0.5 rounded border font-semibold"
                  style={{ borderColor: color, color }}
                >
                  {statusLabels[booking.status] || booking.status}
                </span>
              </div>

              <p className="text-xs font-body text-foreground/80 truncate mb-1">
                {booking.clientName}
              </p>

              <div className="flex items-start gap-1.5 mb-1">
                <MapPin className="h-3 w-3 text-green-500 mt-0.5 shrink-0" />
                <span className="text-[11px] text-muted-foreground font-body truncate">
                  {booking.pickupLocation}
                </span>
              </div>

              <div className="flex items-start gap-1.5">
                <MapPin className="h-3 w-3 text-red-500 mt-0.5 shrink-0" />
                <span className="text-[11px] text-muted-foreground font-body truncate">
                  {booking.dropoffLocation}
                </span>
              </div>

              <div className="flex items-center gap-1.5 mt-1.5">
                <Clock className="h-3 w-3 text-muted-foreground/60" />
                <span className="text-[10px] text-muted-foreground/80 font-body">
                  {booking.pickupDate} · {booking.pickupTime}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
