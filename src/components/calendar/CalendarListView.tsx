"use client";
import { format, parseISO } from "date-fns";
import { useRouter } from "next/navigation";
import { Clock, MapPin, User, Car } from "lucide-react";
import type { UIBooking } from "@/hooks/useAdminBookings";
import { Button } from "@/components/ui/button";

const statusColors: Record<string, string> = {
  pending: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  assigned: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  enroute: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  onsite: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  inprogress: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
  done: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  cancelled: "bg-red-500/20 text-red-400 border-red-500/30",
};

interface Props {
  bookings: UIBooking[];
  filterStatus: string;
  onFilterChange: (status: string) => void;
}

export default function CalendarListView({ bookings, filterStatus, onFilterChange }: Props) {
  const router = useRouter();

  const filtered = filterStatus === "all" ? bookings : bookings.filter((b) => b.status === filterStatus);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <Button
          variant={filterStatus === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => onFilterChange("all")}
        >
          All ({bookings.length})
        </Button>
        {["pending", "assigned", "enroute", "onsite", "inprogress", "done", "cancelled"].map((status) => {
          const count = bookings.filter((b) => b.status === status).length;
          return (
            <Button
              key={status}
              variant={filterStatus === status ? "default" : "outline"}
              size="sm"
              onClick={() => onFilterChange(status)}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)} ({count})
            </Button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <Car className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No bookings found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((b) => (
            <button
              key={b.id}
              onClick={() => router.push(`/admin/bookings/${b.id}`)}
              className="w-full text-left rounded-lg border border-border bg-card hover:bg-muted/50 p-4 transition-colors"
            >
              <div className="flex items-start justify-between gap-4 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono text-primary font-medium">{b.reservationNumber}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${statusColors[b.status]}`}>
                    {b.status.replace(/_/g, " ")}
                  </span>
                </div>
                <span className="text-sm font-semibold text-foreground">${b.price?.toFixed(0) || "0"}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" />
                  <span>{b.clientName}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{format(parseISO(b.pickupDate), "MMM d, yyyy")} at {b.pickupTime}</span>
                </div>
                <div className="flex items-center gap-1.5 sm:col-span-2">
                  <MapPin className="h-3.5 w-3.5" />
                  <span className="truncate">{b.pickupLocation} → {b.dropoffLocation}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
