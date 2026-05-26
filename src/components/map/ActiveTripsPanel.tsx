"use client";
import { useState } from "react";
import type { UIBooking } from "@/hooks/useAdminBookings";
import { routeColors } from "./mapConfig";
import { Navigation, Clock, MapPin, X, ChevronDown, ChevronUp } from "lucide-react";

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
  const [collapsed, setCollapsed] = useState(false);
  const activeBookings = bookings.filter((b) => ACTIVE_STATUSES.includes(b.status));

  if (activeBookings.length === 0) return null;

  return (
    <div className="absolute top-3 right-3 z-20 w-72 max-h-[calc(100%-24px)] overflow-hidden rounded-2xl border border-border bg-white/95 shadow-2xl backdrop-blur-xl">
      <div className="sticky top-0 bg-white/95 backdrop-blur-xl px-4 py-3 border-b border-border flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Navigation className="h-4 w-4 text-primary" />
          <div>
            <p className="text-sm font-display font-semibold text-foreground">Active Trips</p>
            <p className="text-[11px] text-muted-foreground">{activeBookings.length} booking{activeBookings.length === 1 ? "" : "s"} currently active</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setCollapsed((prev) => !prev)}
            className="rounded-md border border-border/80 bg-secondary/80 p-1 hover:bg-secondary transition-colors"
            aria-label={collapsed ? "Expand active trips" : "Collapse active trips"}
          >
            {collapsed ? <ChevronDown className="h-4 w-4 text-foreground" /> : <ChevronUp className="h-4 w-4 text-foreground" />}
          </button>
          {selectedBookingId && (
            <button
              onClick={() => onSelectBooking(null)}
              className="p-1 rounded-md border border-border/80 bg-secondary/80 hover:bg-secondary transition-colors"
              aria-label="Deselect active booking"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>

      {!collapsed && (
        <div className="divide-y divide-border max-h-[calc(100vh-180px)] overflow-y-auto">
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
      )}
    </div>
  );
}
