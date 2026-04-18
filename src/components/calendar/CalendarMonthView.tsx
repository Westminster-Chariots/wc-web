"use client";
import { useMemo } from "react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay } from "date-fns";
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
  currentMonth: Date;
  bookingsByDate: Record<string, UIBooking[]>;
}

export default function CalendarMonthView({ currentMonth, bookingsByDate }: Props) {
  const router = useRouter();
  const today = new Date();

  const weeks = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const calStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

    const days: Date[] = [];
    let day = calStart;
    while (day <= calEnd) {
      days.push(day);
      day = addDays(day, 1);
    }

    const result: Date[][] = [];
    for (let i = 0; i < days.length; i += 7) {
      result.push(days.slice(i, i + 7));
    }
    return result;
  }, [currentMonth]);

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <div className="grid grid-cols-7 bg-secondary border-b border-border">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="px-2 py-2 text-center text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            {d}
          </div>
        ))}
      </div>

      {weeks.map((week, wi) => (
        <div key={wi} className="grid grid-cols-7 border-b border-border last:border-b-0">
          {week.map((d) => {
            const dateKey = format(d, "yyyy-MM-dd");
            const dayBookings = bookingsByDate[dateKey] || [];
            const isCurrentMonth = isSameMonth(d, currentMonth);
            const isToday = isSameDay(d, today);

            return (
              <div
                key={dateKey}
                className={`min-h-[100px] md:min-h-[120px] border-r border-border last:border-r-0 p-1.5 transition-colors ${
                  isCurrentMonth ? "bg-card" : "bg-background/50"
                } ${isToday ? "ring-1 ring-inset ring-primary/40" : ""}`}
              >
                <div className={`text-xs mb-1 ${
                  isToday ? "text-primary font-bold" : isCurrentMonth ? "text-foreground" : "text-muted-foreground/40"
                }`}>
                  {format(d, "d")}
                </div>
                <div className="space-y-0.5 overflow-y-auto max-h-[80px] md:max-h-[96px]">
                  {dayBookings.slice(0, 5).map((b) => (
                    <button
                      key={b.id}
                      onClick={() => router.push(`/admin/bookings/${b.id}`)}
                      className={`w-full text-left rounded px-1.5 py-0.5 text-[10px] truncate transition-all hover:opacity-80 ${statusColors[b.status]}/20 border border-border`}
                      title={`${b.pickupTime} — ${b.clientName}\n${b.pickupLocation} → ${b.dropoffLocation}`}
                    >
                      <span className={`inline-block h-1.5 w-1.5 rounded-full mr-1 ${statusColors[b.status]}`} />
                      {b.pickupTime} {b.clientName}
                    </button>
                  ))}
                  {dayBookings.length > 5 && (
                    <p className="text-[9px] text-muted-foreground px-1">+{dayBookings.length - 5} more</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
