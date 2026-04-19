"use client";
import { useMemo } from "react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { User, MapPin, AlertTriangle, GripVertical } from "lucide-react";
import type { UIBooking } from "@/hooks/useAdminBookings";
import type { Driver } from "@/hooks/useDrivers";
import { notify } from "@/lib/notify";

const statusColors: Record<string, string> = {
  pending: "bg-amber-500",
  assigned: "bg-blue-500",
  enroute: "bg-cyan-500",
  onsite: "bg-purple-500",
  inprogress: "bg-indigo-500",
  done: "bg-emerald-500",
  cancelled: "bg-red-500",
};

interface Props {
  selectedDate: Date;
  bookingsByDate: Record<string, UIBooking[]>;
  drivers: Driver[];
  onAssignDriver: (bookingId: string, driverId: string) => Promise<void>;
  onUnassignDriver: (bookingId: string) => Promise<void>;
}

function parseHour(pickupTime: string): number {
  const parts = pickupTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!parts) return 0;
  let h = parseInt(parts[1]);
  const ampm = parts[3].toUpperCase();
  if (ampm === "PM" && h !== 12) h += 12;
  if (ampm === "AM" && h === 12) h = 0;
  return h;
}

function parseMinutes(pickupTime: string): number {
  const parts = pickupTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
  return parts ? parseInt(parts[2]) : 0;
}

export default function CalendarDriverTimeline({ selectedDate, bookingsByDate, drivers, onAssignDriver, onUnassignDriver }: Props) {
  const router = useRouter();
  const dateKey = format(selectedDate, "yyyy-MM-dd");
  const dayBookings = bookingsByDate[dateKey] || [];

  const unassigned = useMemo(
    () => dayBookings.filter((b) => !b.driverId && b.status !== "done" && b.status !== "cancelled"),
    [dayBookings]
  );

  const byDriver = useMemo(() => {
    const map: Record<string, UIBooking[]> = {};
    drivers.forEach((d) => (map[d.id] = []));
    dayBookings.forEach((b) => {
      if (b.driverId && map[b.driverId]) map[b.driverId].push(b);
    });
    return map;
  }, [dayBookings, drivers]);

  const activeDrivers = drivers.filter((d) => d.status !== "unavailable");

  return (
    <div className="space-y-4">
      <div className="bg-secondary border border-border rounded-lg px-4 py-3">
        <h4 className="text-sm font-display font-semibold text-foreground">
          {format(selectedDate, "EEEE, MMMM d, yyyy")} — Driver Timeline
        </h4>
        <p className="text-xs text-muted-foreground mt-0.5">
          Assign bookings to drivers
        </p>
      </div>

      <div className="rounded-lg border-2 border-dashed border-amber-500/50 bg-amber-500/5 p-3">
        <h5 className="text-xs font-display font-semibold text-foreground mb-2 flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
          Unassigned ({unassigned.length})
        </h5>
        {unassigned.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {unassigned.map((b) => (
              <button
                key={b.id}
                onClick={() => router.push(`/admin/bookings/${b.id}`)}
                className="rounded-md border border-border bg-card hover:bg-muted/50 p-2 transition-colors text-left w-full"
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <span className={`h-2 w-2 rounded-full shrink-0 ${statusColors[b.status]}`} />
                  <span className="text-[10px] font-semibold text-foreground truncate">
                    {b.reservationNumber}
                  </span>
                  <span className="text-[9px] text-muted-foreground ml-auto">{b.pickupTime}</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <User className="h-2.5 w-2.5" />
                  <span className="truncate">{b.clientName}</span>
                </div>
                <div className="flex items-center gap-1 text-[9px] text-muted-foreground mt-0.5">
                  <MapPin className="h-2.5 w-2.5" />
                  <span className="truncate">{b.pickupLocation} → {b.dropoffLocation}</span>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <p className="text-[10px] text-muted-foreground text-center py-2">
            All bookings assigned
          </p>
        )}
      </div>

      <div className="space-y-2">
        {activeDrivers.map((driver) => {
          const driverBookings = byDriver[driver.id] || [];
          const sorted = [...driverBookings].sort(
            (a, b) => parseHour(a.pickupTime) * 60 + parseMinutes(a.pickupTime) - (parseHour(b.pickupTime) * 60 + parseMinutes(b.pickupTime))
          );

          return (
            <div key={driver.id} className="rounded-lg border border-border bg-card">
              <div className="flex items-center gap-3 px-4 py-2 border-b border-border">
                <div className="h-7 w-7 rounded-full bg-secondary flex items-center justify-center">
                  <User className="h-3.5 w-3.5 text-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-display font-semibold text-foreground">{driver.name}</span>
                  <span className="text-[10px] text-muted-foreground ml-2">
                    {driverBookings.length} trip{driverBookings.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>

              <div className="p-2 min-h-[48px]">
                {sorted.length === 0 ? (
                  <p className="text-[10px] text-muted-foreground text-center py-3">
                    No trips assigned
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {sorted.map((b) => (
                      <button
                        key={b.id}
                        onClick={() => router.push(`/admin/bookings/${b.id}`)}
                        className="rounded-md border border-border bg-card hover:bg-muted/50 p-2 transition-colors text-left"
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className={`h-2 w-2 rounded-full shrink-0 ${statusColors[b.status]}`} />
                          <span className="text-[10px] font-semibold text-foreground truncate">
                            {b.reservationNumber}
                          </span>
                          <span className="text-[9px] text-muted-foreground ml-auto">{b.pickupTime}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <User className="h-2.5 w-2.5" />
                          <span className="truncate">{b.clientName}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[9px] text-muted-foreground mt-0.5">
                          <MapPin className="h-2.5 w-2.5" />
                          <span className="truncate">{b.pickupLocation} → {b.dropoffLocation}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {activeDrivers.length === 0 && (
          <div className="text-center py-8 text-sm text-muted-foreground">
            No active drivers found
          </div>
        )}
      </div>
    </div>
  );
}
