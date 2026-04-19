"use client";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { MapPin, Clock, Plane, User, Car, ChevronRight, Play, CheckCircle, XCircle, Navigation } from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/primitives";
import { toast } from "sonner";

export interface UIBooking {
  id: string;
  reservationNumber: string;
  clientName: string;
  clientEmail?: string;
  pickupDate: string;
  pickupTime: string;
  spotTime: string;
  pickupLocation: string;
  dropoffLocation: string;
  vehicleType: "sedan" | "suv";
  vehicleNumber?: string;
  status: "pending" | "assigned" | "enroute" | "onsite" | "inprogress" | "done" | "cancelled";
  driver?: string;
  driverId?: string;
  paxCount: number;
  flightTail?: string;
  specialRequests?: string;
  price: number;
  isUrgent: boolean;
  distanceMiles?: number;
  durationMinutes?: number;
  groupId?: string;
  legOrder?: number;
  createdAt: string;
  emailPhase?: string;
}

export interface Driver {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  status?: string;
}

const nextActions: Record<string, { label: string; next: UIBooking["status"]; icon: typeof Play }[]> = {
  pending: [
    { label: "Cancel", next: "cancelled", icon: XCircle },
  ],
  assigned: [
    { label: "En Route", next: "enroute", icon: Navigation },
    { label: "Cancel", next: "cancelled", icon: XCircle },
  ],
  enroute: [
    { label: "On Site", next: "onsite", icon: MapPin },
  ],
  onsite: [
    { label: "Start Trip", next: "inprogress", icon: Play },
  ],
  inprogress: [
    { label: "Complete", next: "done", icon: CheckCircle },
  ],
  done: [],
  cancelled: [],
};

const actionStyles: Record<string, string> = {
  assigned: "bg-status-enroute/15 text-status-enroute-fg hover:bg-status-enroute/25 border-status-enroute/30",
  enroute: "bg-status-enroute/15 text-status-enroute-fg hover:bg-status-enroute/25 border-status-enroute/30",
  onsite: "bg-status-onsite/15 text-status-onsite-fg hover:bg-status-onsite/25 border-status-onsite/30",
  inprogress: "bg-status-inprogress/15 text-status-inprogress-fg hover:bg-status-inprogress/25 border-status-inprogress/30",
  done: "bg-status-done/15 text-status-done-fg hover:bg-status-done/25 border-status-done/30",
  cancelled: "bg-destructive/15 text-destructive hover:bg-destructive/25 border-destructive/30",
};

interface BookingCardProps {
  booking: UIBooking;
  index: number;
  drivers?: Driver[];
  onStatusChange?: (bookingId: string, newStatus: UIBooking["status"]) => void;
  onDriverAssign?: (bookingId: string, driverId: string | null) => void;
}

export default function BookingCard({ booking, index, drivers = [], onStatusChange, onDriverAssign }: BookingCardProps) {
  const router = useRouter();
  const isUrgent = booking.isUrgent && booking.status !== 'done' && booking.status !== 'cancelled';
  const actions = nextActions[booking.status] || [];

  const handleAction = (e: React.MouseEvent, next: UIBooking["status"], label: string) => {
    e.stopPropagation();
    onStatusChange?.(booking.id, next);
    toast.success(`${booking.reservationNumber} → ${label}`, {
      description: `${booking.clientName}'s booking updated.`,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={() => router.push(`/admin/bookings/${booking.id}`)}
      className={`glass rounded-lg border p-3 sm:p-4 hover:border-primary/20 transition-all duration-300 cursor-pointer group ${
        isUrgent ? 'border-status-pending/40' : 'border-white/[0.06]'
      }`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs font-mono text-primary font-semibold tracking-wide">
            #{booking.reservationNumber}
          </span>
          <StatusBadge status={booking.status} />
          {booking.groupId && (
            <span className="text-[10px] font-mono bg-primary/10 text-primary px-1.5 py-0.5 rounded border border-primary/20">
              Leg {booking.legOrder ?? 1} · {booking.groupId}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Car className="h-3.5 w-3.5" />
          <span className="text-xs font-body uppercase tracking-wide">
            {booking.vehicleType}{booking.vehicleNumber ? ` ${booking.vehicleNumber}` : ''}
          </span>
        </div>
      </div>

      {/* Client & Driver */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
        <h3 className="text-sm font-semibold text-foreground font-body">{booking.clientName}</h3>
        {booking.driver ? (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <User className="h-3 w-3 text-primary" />
            <span className="font-body">{booking.driver}</span>
          </div>
        ) : (
          <span className="text-xs text-status-pending-fg bg-status-pending/10 rounded-full px-2 py-0.5 font-body">
            Unassigned
          </span>
        )}
      </div>

      {/* Route */}
      <div className="space-y-1.5 mb-3">
        <div className="flex items-start gap-2">
          <MapPin className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
          <p className="text-xs text-muted-foreground font-body leading-relaxed truncate">
            {booking.pickupLocation}
          </p>
        </div>
        <div className="flex items-start gap-2">
          <MapPin className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
          <p className="text-xs text-muted-foreground font-body leading-relaxed truncate">
            {booking.dropoffLocation}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-2 border-t border-border gap-2">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span className="font-body">{booking.pickupTime}</span>
          </div>
          {booking.flightTail && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Plane className="h-3 w-3" />
              <span className="font-mono text-[11px]">{booking.flightTail}</span>
            </div>
          )}
          <span className="text-xs text-muted-foreground font-body">{booking.paxCount} pax</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-primary font-body">${booking.price}</span>
          <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>

      {/* Status Actions */}
      {actions.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-3 mt-3 border-t border-border">
          {actions.map(({ label, next, icon: ActionIcon }) => (
            <button
              key={next}
              onClick={(e) => handleAction(e, next, label)}
              className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-[11px] font-semibold font-body transition-all ${actionStyles[next] || 'bg-secondary text-foreground hover:bg-muted border-border'}`}
            >
              <ActionIcon className="h-3 w-3" />
              {label}
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
}
