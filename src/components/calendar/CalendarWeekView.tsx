"use client";
import { useMemo } from "react";
import { format, startOfWeek, addDays, isSameDay } from "date-fns";
import { useRouter } from "next/navigation";
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

interface Props {
  selectedDate: Date;
  bookingsByDate: Record<string, UIBooking[]>;
}

export default function CalendarWeekView({ selectedDate, bookingsByDate }: Props) {
  const router = useRouter();
  const today = new Date();

  const weekDays = useMemo(() => {
    const start = startOfWeek(selectedDate, { weekStartsOn: 0 });
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  }, [selectedDate]);

  const hours = Array.from({ length: 17 }, (_, i) => i + 6);

  const getHour = (b: UIBooking): number => {
    const parts = b.pickupTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!parts) return 0;
    let h = parseInt(parts[1]);
    const ampm = parts[3].toUpperCase();
    if (ampm === "PM" && h !== 12) h += 12;
    if (ampm === "AM" && h === 12) h = 0;
    return h;
  };

  return (
    <div className="rounded-lg border border-border overflow-hidden overflow-x-auto">
      <div className="grid grid-cols-[60px_repeat(7,1fr)] bg-secondary border-b border-border sticky top-0 z-10 min-w-[800px]">
        <div className="border-r border-border" />
        {weekDays.map((d) => {
          const isToday = isSameDay(d, today);
          return (
            <div key={d.toISOString()} className={`px-2 py-2 text-center border-r border-border last:border-r-0 ${isToday ? "bg-primary/10" : ""}`}>
              <div className="text-[10px] text-muted-foreground uppercase">{format(d, "EEE")}</div>
              <div className={`text-sm ${isToday ? "text-primary font-bold" : "text-foreground"}`}>{format(d, "d")}</div>
            </div>
          );
        })}
      </div>

      <div className="min-w-[800px]">
        {hours.map((hour) => {
          const label = hour === 0 ? "12 AM" : hour < 12 ? `${hour} AM` : hour === 12 ? "12 PM" : `${hour - 12} PM`;
          return (
            <div key={hour} className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-border last:border-b-0 min-h-[50px]">
              <div className="px-1 py-1 text-[10px] text-muted-foreground text-right border-r border-border bg-background/50 flex items-start justify-end pr-2 pt-1">
                {label}
              </div>
              {weekDays.map((d) => {
                const dateKey = format(d, "yyyy-MM-dd");
                const dayBookings = (bookingsByDate[dateKey] || []).filter((b) => getHour(b) === hour);
                return (
                  <div key={dateKey + hour} className="border-r border-border last:border-r-0 p-0.5 bg-card">
                    {dayBookings.map((b) => (
                      <button
                        key={b.id}
                        onClick={() => router.push(`/admin/bookings/${b.id}`)}
                        className="w-full text-left rounded px-1 py-0.5 text-[9px] truncate hover:opacity-80 transition-opacity border border-border bg-card"
                        title={`${b.pickupTime} — ${b.clientName}`}
                      >
                        <span className={`inline-block h-1.5 w-1.5 rounded-full mr-0.5 ${statusColors[b.status]}`} />
                        {b.clientName}
                      </button>
                    ))}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
