"use client";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { MapPin, Clock, Plane, User, Car, ChevronRight, Play, CheckCircle, XCircle, Navigation, AlertCircle, MoreVertical } from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/primitives";
import { toast } from "sonner";
import { UIBooking, Driver } from "./BookingCard";

const nextActions: Record<string, { label: string; next: UIBooking["status"]; icon: typeof Play; variant: "default" | "destructive" | "success" }[]> = {
  pending: [
    { label: "Cancel", next: "cancelled", icon: XCircle, variant: "destructive" },
  ],
  assigned: [
    { label: "En Route", next: "enroute", icon: Navigation, variant: "default" },
    { label: "Cancel", next: "cancelled", icon: XCircle, variant: "destructive" },
  ],
  enroute: [
    { label: "On Site", next: "onsite", icon: MapPin, variant: "default" },
  ],
  onsite: [
    { label: "Start Trip", next: "inprogress", icon: Play, variant: "default" },
  ],
  inprogress: [
    { label: "Complete", next: "done", icon: CheckCircle, variant: "success" },
  ],
  done: [],
  cancelled: [],
};

const actionVariants = {
  default: "bg-primary/10 text-primary hover:bg-primary/20 border-primary/20",
  destructive: "bg-destructive/10 text-destructive hover:bg-destructive/20 border-destructive/20",
  success: "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/20",
};

interface PremiumBookingCardProps {
  booking: UIBooking;
  index: number;
  drivers?: Driver[];
  onStatusChange?: (bookingId: string, newStatus: UIBooking["status"]) => void;
  onDriverAssign?: (bookingId: string, driverId: string | null) => void;
}

export default function PremiumBookingCard({ booking, index, drivers = [], onStatusChange, onDriverAssign }: PremiumBookingCardProps) {
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
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={() => router.push(`/admin/bookings/${booking.id}`)}
      className={`relative group cursor-pointer ${
        isUrgent ? 'border-status-pending/40' : ''
      }`}
    >
      {/* Background glow for urgent bookings */}
      {isUrgent && (
        <div className="absolute inset-0 bg-gradient-to-r from-status-pending/5 via-transparent to-status-pending/5 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      )}
      
      {/* Main card */}
      <div className="relative glass-strong rounded-2xl p-5 border border-white/[0.12] shadow-glass-elevated hover:shadow-glass-elevated-hover transition-all duration-300 overflow-hidden">
        
        {/* Animated gradient border */}
        <div className="absolute inset-0 rounded-2xl p-[1px] bg-gradient-to-br from-primary/20 via-transparent to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="absolute inset-0 rounded-2xl bg-background" />
        </div>
        
        {/* Urgent indicator */}
        {isUrgent && (
          <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-1 rounded-full bg-status-pending/10 border border-status-pending/20">
            <AlertCircle className="h-3 w-3 text-status-pending-fg" />
            <span className="text-[10px] font-semibold text-status-pending-fg uppercase tracking-wider">Urgent</span>
          </div>
        )}
        
        <div className="relative z-10">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-sm font-mono font-bold text-primary tracking-wide bg-primary/10 px-2 py-1 rounded-lg border border-primary/20">
                  #{booking.reservationNumber}
                </span>
                <StatusBadge status={booking.status} />
              </div>
              
              {booking.groupId && (
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-primary/5 border border-primary/10">
                  <span className="text-[10px] font-mono text-primary font-semibold">
                    Leg {booking.legOrder ?? 1}
                  </span>
                  <span className="text-[10px] text-muted-foreground">·</span>
                  <span className="text-[10px] text-muted-foreground font-mono truncate max-w-[80px]">
                    {booking.groupId}
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-secondary/50 border border-border">
                <Car className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-body font-semibold uppercase tracking-wide">
                  {booking.vehicleType}
                </span>
                {booking.vehicleNumber && (
                  <span className="text-xs text-muted-foreground font-mono">
                    {booking.vehicleNumber}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {/* Client & Driver */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-5 gap-3">
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-foreground font-body">{booking.clientName}</h3>
              {booking.clientCode && (
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-muted-foreground">Code:</span>
                  <span className="text-xs font-mono text-primary bg-primary/5 px-1.5 py-0.5 rounded border border-primary/10">
                    {booking.clientCode}
                  </span>
                </div>
              )}
            </div>
            
            {booking.driver ? (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/50 border border-border">
                <User className="h-3.5 w-3.5 text-primary" />
                <div className="space-y-0.5">
                  <span className="text-sm font-body font-semibold">{booking.driver}</span>
                  <span className="text-[10px] text-muted-foreground">Assigned</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-status-pending/10 border border-status-pending/20">
                <User className="h-3.5 w-3.5 text-status-pending-fg" />
                <div className="space-y-0.5">
                  <span className="text-sm font-body font-semibold text-status-pending-fg">Unassigned</span>
                  <span className="text-[10px] text-status-pending-fg/70">Awaiting driver</span>
                </div>
              </div>
            )}
          </div>
          
          {/* Route */}
          <div className="space-y-3 mb-5">
            <div className="flex items-start gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/10 rounded-full blur-sm" />
                <MapPin className="relative h-4 w-4 text-primary mt-0.5" />
              </div>
              <div className="flex-1">
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-body mb-1">Pickup</p>
                <p className="text-sm text-foreground font-body leading-relaxed">
                  {booking.pickupLocation}
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-muted-foreground/10 rounded-full blur-sm" />
                <MapPin className="relative h-4 w-4 text-muted-foreground mt-0.5" />
              </div>
              <div className="flex-1">
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-body mb-1">Dropoff</p>
                <p className="text-sm text-foreground font-body leading-relaxed">
                  {booking.dropoffLocation}
                </p>
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 border-t border-border/50 gap-3">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-secondary/30">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-sm font-body font-semibold">{booking.pickupTime}</span>
              </div>
              
              {booking.flightTail && (
                <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-secondary/30">
                  <Plane className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-sm font-mono font-semibold">{booking.flightTail}</span>
                </div>
              )}
              
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-secondary/30">
                <span className="text-sm font-body font-semibold">{booking.paxCount}</span>
                <span className="text-xs text-muted-foreground">pax</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-display font-bold text-primary">${booking.price}</span>
                <ChevronRight className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </div>
          </div>
          
          {/* Status Actions */}
          {actions.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-4 mt-4 border-t border-border/50">
              {actions.map(({ label, next, icon: ActionIcon, variant }) => (
                <button
                  key={next}
                  onClick={(e) => handleAction(e, next, label)}
                  className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold font-body transition-all hover:scale-105 active:scale-95 ${actionVariants[variant]}`}
                >
                  <ActionIcon className="h-3.5 w-3.5" />
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Animated bottom border */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/40 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-center" />
      </div>
    </motion.div>
  );
}