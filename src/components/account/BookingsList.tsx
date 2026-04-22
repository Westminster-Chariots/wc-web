"use client";
import Link from "next/link";
import { Car, ChevronRight, Calendar as CalendarIcon, Clock, MapPin, CalendarDays, XCircle, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import type { Booking } from "@/types";
import { format, parseISO, differenceInHours } from "date-fns";
import { useState, useMemo } from "react";

const statusColors: Record<string, string> = {
  pending: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  assigned: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  en_route: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  on_site: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  in_progress: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
  done: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  cancelled: "bg-red-500/20 text-red-400 border-red-500/30",
};

const liveStatuses = ["assigned", "en_route", "on_site", "in_progress"];

interface BookingsListProps {
  bookings: Booking[];
  loading: boolean;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onReschedule: (bookingId: string, date: string, time: string) => Promise<void>;
  onCancel: (bookingId: string, reservationNumber: string) => Promise<void>;
}

export default function BookingsList({ bookings, loading, page, pageSize, onPageChange, onReschedule, onCancel }: BookingsListProps) {
  const [rescheduleBooking, setRescheduleBooking] = useState<Booking | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");
  const [rescheduling, setRescheduling] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredBookings = useMemo(() => {
    if (statusFilter === "all") return bookings;
    return bookings.filter((b) => b.status === statusFilter);
  }, [bookings, statusFilter]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: bookings.length };
    bookings.forEach((b) => {
      counts[b.status] = (counts[b.status] || 0) + 1;
    });
    return counts;
  }, [bookings]);

  const handleReschedule = async () => {
    if (!rescheduleBooking || !rescheduleDate || !rescheduleTime) return;
    setRescheduling(true);
    try {
      await onReschedule(rescheduleBooking.id, rescheduleDate, rescheduleTime);
      setRescheduleBooking(null);
    } finally {
      setRescheduling(false);
    }
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-display font-semibold text-foreground">Ride History</h2>
        <Link href="/">
          <Button variant="hero" size="sm" className="gap-1.5">
            Book New Ride <ChevronRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      {/* Status Filter */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
        <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
        <button
          onClick={() => setStatusFilter("all")}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
            statusFilter === "all"
              ? "bg-primary/20 text-primary border border-primary/30"
              : "bg-muted/50 text-muted-foreground hover:bg-muted border border-transparent"
          }`}
        >
          All ({statusCounts.all || 0})
        </button>
        <button
          onClick={() => setStatusFilter("pending")}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
            statusFilter === "pending"
              ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
              : "bg-muted/50 text-muted-foreground hover:bg-muted border border-transparent"
          }`}
        >
          Pending ({statusCounts.pending || 0})
        </button>
        <button
          onClick={() => setStatusFilter("assigned")}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
            statusFilter === "assigned"
              ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
              : "bg-muted/50 text-muted-foreground hover:bg-muted border border-transparent"
          }`}
        >
          Assigned ({statusCounts.assigned || 0})
        </button>
        <button
          onClick={() => setStatusFilter("in_progress")}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
            statusFilter === "in_progress"
              ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
              : "bg-muted/50 text-muted-foreground hover:bg-muted border border-transparent"
          }`}
        >
          In Progress ({statusCounts.in_progress || 0})
        </button>
        <button
          onClick={() => setStatusFilter("done")}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
            statusFilter === "done"
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
              : "bg-muted/50 text-muted-foreground hover:bg-muted border border-transparent"
          }`}
        >
          Done ({statusCounts.done || 0})
        </button>
        <button
          onClick={() => setStatusFilter("cancelled")}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
            statusFilter === "cancelled"
              ? "bg-red-500/20 text-red-400 border border-red-500/30"
              : "bg-muted/50 text-muted-foreground hover:bg-muted border border-transparent"
          }`}
        >
          Cancelled ({statusCounts.cancelled || 0})
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-xl glass animate-pulse" />
          ))}
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="rounded-xl glass p-8 text-center">
          <Car className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">
            {statusFilter === "all" ? "No rides yet" : `No ${statusFilter.replace(/_/g, " ")} rides`}
          </p>
          {statusFilter !== "all" && (
            <button
              onClick={() => setStatusFilter("all")}
              className="text-primary text-sm hover:underline mt-2"
            >
              View all rides →
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredBookings.map((booking) => (
            <div
              key={booking.id}
              className="rounded-xl glass p-4 border border-border hover:border-primary/50 transition-colors"
            >
              {liveStatuses.includes(booking.status) && (
                <div className="flex items-center gap-2 mb-3 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 w-fit">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                  </span>
                  <span className="text-xs font-medium text-primary text-nowrap">
                    {booking.status === "en_route" && "On the way"}
                    {booking.status === "on_site" && "Arrived"}
                    {booking.status === "in_progress" && "In progress"}
                    {booking.status === "assigned" && "Driver assigned"}
                  </span>
                </div>
              )}
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="text-xs font-mono text-primary font-medium">
                      {booking.reservationNumber}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full border ${statusColors[booking.status] || statusColors.pending}`}
                    >
                      {booking.status.replace(/_/g, " ")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <CalendarIcon className="h-3.5 w-3.5 shrink-0" />
                    {booking.pickupDate
                      ? format(parseISO(booking.pickupDate), "MMM d, yyyy")
                      : "—"}
                    <Clock className="h-3.5 w-3.5 shrink-0 ml-2" />
                    {booking.pickupTime?.slice(0, 5) || "00:00"}
                  </div>
                  <div className="text-[11px] text-muted-foreground/70 mb-2">
                    Booked: {booking.createdAt ? format(parseISO(booking.createdAt), "MMM d, yyyy 'at' h:mm a") : "—"}
                  </div>
                  <div className="flex items-start gap-2 text-sm text-foreground">
                    <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5 text-primary" />
                    <span className="truncate">{booking.pickupLocation}</span>
                    <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <span className="truncate">{booking.dropoffLocation}</span>
                  </div>
                </div>
                <div className="text-right shrink-0 flex flex-col items-end gap-2">
                  <p className="text-lg font-display font-semibold text-foreground">
                    ${booking.totalPrice ? Number(booking.totalPrice).toFixed(0) : "0"}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {booking.vehicleType}
                  </p>
                  {booking.status === "pending" && (() => {
                    const pickupDateTime = new Date(`${booking.pickupDate}T${booking.pickupTime}`);
                    const hoursUntilPickup = differenceInHours(pickupDateTime, new Date());
                    const canReschedule = hoursUntilPickup >= 24;

                    return (
                      <div className="flex items-center gap-1 mt-2">
                        {canReschedule && (
                          <Dialog open={!!rescheduleBooking} onOpenChange={(open) => !open && setRescheduleBooking(null)}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-primary hover:text-primary hover:bg-primary/10 gap-1 text-xs"
                              onClick={() => {
                                setRescheduleBooking(booking);
                                setRescheduleDate(booking.pickupDate);
                                setRescheduleTime(booking.pickupTime || "");
                              }}
                            >
                              <CalendarDays className="h-3.5 w-3.5" /> Reschedule
                            </Button>

                            <DialogContent className="glass-heavy border-border">
                              <DialogHeader>
                                <DialogTitle>Reschedule Ride</DialogTitle>
                                <DialogDescription>
                                  Change the date and time for {rescheduleBooking?.reservationNumber}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <Label className="text-xs">Date</Label>
                                  <Input
                                    type="date"
                                    value={rescheduleDate}
                                    onChange={(e) => setRescheduleDate(e.target.value)}
                                    className="bg-secondary/50 border-border"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-xs">Time</Label>
                                  <Input
                                    type="time"
                                    value={rescheduleTime}
                                    onChange={(e) => setRescheduleTime(e.target.value)}
                                    className="bg-secondary/50 border-border"
                                  />
                                </div>
                              </div>
                              <DialogFooter className="gap-2">
                                <Button
                                  variant="ghost"
                                  onClick={() => setRescheduleBooking(null)}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  variant="hero"
                                  onClick={handleReschedule}
                                  disabled={rescheduling}
                                >
                                  {rescheduling ? "Rescheduling..." : "Reschedule"}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        )}

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-destructive hover:text-destructive hover:bg-destructive/10 gap-1 text-xs"
                            >
                              <XCircle className="h-3.5 w-3.5" /> Cancel
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="glass-heavy border-border">
                            <AlertDialogHeader>
                              <AlertDialogTitle>Cancel Ride?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will cancel{" "}
                                <span className="text-primary font-mono font-medium">
                                  {booking.reservationNumber}
                                </span>
                                .
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Keep</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                onClick={() =>
                                  onCancel(
                                    booking.id,
                                    booking.reservationNumber
                                  )
                                }
                              >
                                Cancel Ride
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && filteredBookings.length > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center justify-between mt-4 pt-4 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Showing {filteredBookings.length} of {bookings.length} rides · Page {page + 1}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 0}
              onClick={() => onPageChange(Math.max(page - 1, 0))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={bookings.length < pageSize}
              onClick={() => onPageChange(page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
