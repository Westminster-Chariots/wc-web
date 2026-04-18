"use client";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { Clock, MapPin, User } from "lucide-react";
import type { UIBooking } from "@/hooks/useAdminBookings";

const statusColors: Record<string, string> = {
  pending: "bg-amber-500",
  assigned: "bg-blue-500",
  enroute: "bg-cyan-500",
  onsite: "bg-purple-500",
  inprogress: "bg-indigo-500",
  done: "bg-emerald-500",
  cancelled: "bg-red-500",
};

const statusLabels: Record<string, string> = {
  pending: "Pending",
  assigned: "Assigned",
  enroute: "En Route",
  onsite: "On Site",
  inprogress: "In Progress",
  done: "Completed",
  cancelled: "Cancelled",
};

interface Props {
  selectedDate: Date;
  bookingsByDate: Record<string, UIBooking[]>;
}

export default function CalendarDayView({ selectedDate, bookingsByDate }: Props) {
  const router = useRouter();
  const dateKey = format(selectedDate, "yyyy-MM-dd");
  const dayBookings = bookingsByDate[dateKey] || [];

  const hours = Array.from({ length: 19 }, (_, i) => i + 5);

  const bookingsByHour: Record<number, UIBooking[]> = {};
  dayBookings.forEach((b) => {
    const timeParts = b.pickupTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (timeParts) {
      let hour = parseInt(timeParts[1]);
      const ampm = timeParts[3].toUpperCase();
      if (ampm === "PM" && hour !== 12) hour += 12;
      if (ampm === "AM" && hour === 12) hour = 0;
      if (!bookingsByHour[hour]) bookingsByHour[hour] = [];
      bookingsByHour[hour].push(b);
    }
  });

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <div className="bg-secondary border-b border-border px-4 py-3">
        <h4 className="text-sm font-display font-semibold text-foreground">
          {format(selectedDate, "EEEE, MMMM d, yyyy")}
        </h4>
        <p className="text-xs text-muted-foreground mt-0.5">
          {dayBookings.length} booking{dayBookings.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="divide-y divide-border">
        {hours.map((hour) => {
          const hourBookings = bookingsByHour[hour] || [];
          const label = hour === 0 ? "12 AM" : hour < 12 ? `${hour} AM` : hour === 12 ? "12 PM" : `${hour - 12} PM`;

          return (
            <div key={hour} className="flex min-h-[48px]">
              <div className="w-16 md:w-20 shrink-0 px-2 py-2 text-[11px] text-muted-foreground text-right border-r border-border bg-background/50">
                {label}
              </div>
              <div className="flex-1 p-1.5 space-y-1">
                {hourBookings.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => router.push(`/admin/bookings/${b.id}`)}
                    className="w-full text-left rounded-md border border-border bg-card hover:bg-muted/50 p-2 transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`h-2 w-2 rounded-full shrink-0 ${statusColors[b.status]}`} />
                      <span className="text-xs font-semibold text-foreground truncate">{b.reservationNumber}</span>
                      <span className="text-[10px] text-muted-foreground ml-auto">{statusLabels[b.status]}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      <User className="h-3 w-3" />
                      <span className="truncate">{b.clientName}</span>
                      <Clock className="h-3 w-3 ml-2" />
                      <span>{b.pickupTime}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mt-0.5">
                      <MapPin className="h-3 w-3" />
                      <span className="truncate">{b.pickupLocation} → {b.dropoffLocation}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
