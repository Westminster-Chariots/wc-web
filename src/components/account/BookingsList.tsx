"use client";
import Image from "next/image";
import { Car, ChevronRight, CalendarDays, XCircle, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import MapPreview from "@/components/booking/MapPreview";
import RouteVisualization from "@/components/booking/RouteVisualization";
import type { Booking } from "@/types";
import { format, parseISO, differenceInHours } from "date-fns";
import { useState, useMemo, useEffect } from "react";

const statusColors: Record<string, string> = {
  pending: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  assigned: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  en_route: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  on_site: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  in_progress: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
  done: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  cancelled: "bg-red-500/20 text-red-400 border-red-500/30",
};

interface BookingsListProps {
  bookings: Booking[];
  loading: boolean;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onReschedule: (bookingId: string, date: string, time: string) => Promise<void>;
  onCancel: (bookingId: string) => Promise<void>;
}

export default function BookingsList({ bookings, loading, page, pageSize, onPageChange, onReschedule, onCancel }: BookingsListProps) {
  const [rescheduleBooking, setRescheduleBooking] = useState<Booking | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");
  const [rescheduling, setRescheduling] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const vehicleThumbnails: Record<string, string> = {
    sedan: "/assets/sedan-profile.png",
    suv: "/assets/suv-profile.png",
  };

  const vehicleNames: Record<string, string> = {
    sedan: "Executive Sedan",
    suv: "Luxury SUV",
  };

  const statusNextSteps: Record<string, string> = {
    pending: "Our team is confirming your reservation and preparing your chauffeur. Keep your phone handy for updates.",
    assigned: "A driver has been assigned. Expect a check-in message shortly and review your pickup details.",
    en_route: "Your driver is on the way. Please be ready at your pickup point and follow any arrival instructions.",
    on_site: "The driver has arrived. Meet at the pickup location and confirm your ride details.",
    in_progress: "You are on route. Sit back and enjoy the journey while we keep everything on schedule.",
    done: "Your ride is complete. Review your invoice and let us know if you need a follow-up reservation.",
    cancelled: "This ride has been cancelled. Contact concierge if you want to rebook or need assistance.",
  };

  const statusTitles: Record<string, string> = {
    pending: "Pending confirmation",
    assigned: "Driver assigned",
    en_route: "Driver en route",
    on_site: "Driver onsite",
    in_progress: "In progress",
    done: "Completed",
    cancelled: "Cancelled",
  };

  const filteredByStatus = useMemo(() => {
    if (statusFilter === "all") return bookings;
    return bookings.filter((b) => b.status === statusFilter);
  }, [bookings, statusFilter]);

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const searchedBookings = useMemo(() => {
    if (!normalizedSearch) return filteredByStatus;

    const searchParts = normalizedSearch.split(/\s+/).filter(Boolean);

    return filteredByStatus.filter((booking) => {
      const haystack = [
        booking.reservationNumber,
        booking.pickupLocation,
        booking.dropoffLocation,
        booking.status,
        booking.vehicleType,
        booking.clientName,
        booking.clientPhone,
        booking.clientEmail,
        booking.flightNumber,
        booking.specialRequests,
        booking.driverId,
        booking.dispatcherNotes,
        booking.pickupDate,
        booking.pickupTime,
        booking.totalPrice?.toString(),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchParts.every((term) => haystack.includes(term));
    });
  }, [filteredByStatus, normalizedSearch]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: bookings.length };
    bookings.forEach((b) => {
      counts[b.status] = (counts[b.status] || 0) + 1;
    });
    return counts;
  }, [bookings]);

  const totalPages = Math.max(1, Math.ceil(searchedBookings.length / pageSize));
  const paginatedBookings = useMemo(() => {
    if (page < 0) return searchedBookings.slice(0, pageSize);
    const start = page * pageSize;
    return searchedBookings.slice(start, start + pageSize);
  }, [searchedBookings, page, pageSize]);

  useEffect(() => {
    onPageChange(0);
  }, [searchTerm, statusFilter]);

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
    <section className="space-y-6">
      <div className="rounded-4xl bg-white shadow-sm ring-1 ring-slate-200 p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-display font-semibold text-slate-900">Ride History</h2>
            <p className="mt-1 text-sm text-slate-600 max-w-2xl">Track upcoming trips, review completed rides, and manage scheduling in one polished view.</p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_1.8fr] items-center">
          <div className="relative w-full lg:max-w-xs">
            <Label htmlFor="booking-search" className="sr-only">Search rides</Label>
            <Input
              id="booking-search"
              placeholder="Search reservation, pickup, dropoff, driver, notes..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="w-full"
            />
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="flex flex-wrap gap-2">
              {[
                { label: `All (${statusCounts.all || 0})`, value: "all" },
                { label: `Pending (${statusCounts.pending || 0})`, value: "pending" },
                { label: `Assigned (${statusCounts.assigned || 0})`, value: "assigned" },
              ].map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setStatusFilter(filter.value)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold transition ${
                    statusFilter === filter.value
                      ? "bg-sky-500/15 text-sky-700 shadow-sm"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}>
                  {filter.label}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { label: `In Progress (${statusCounts.in_progress || 0})`, value: "in_progress" },
                { label: `Done (${statusCounts.done || 0})`, value: "done" },
                { label: `Cancelled (${statusCounts.cancelled || 0})`, value: "cancelled" },
              ].map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setStatusFilter(filter.value)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold transition ${
                    statusFilter === filter.value
                      ? "bg-sky-500/15 text-sky-700 shadow-sm"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}>
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 rounded-3xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : searchedBookings.length === 0 ? (
        <div className="rounded-4xl bg-white shadow-sm ring-1 ring-slate-200 p-12 text-center">
          <Car className="h-12 w-12 text-slate-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No rides found</h3>
          <p className="text-sm text-slate-600 mb-4">
            {statusFilter === "all" ? "You haven’t booked any rides yet." : `No ${statusFilter.replace(/_/g, " ")} rides were found.`}
          </p>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="text-sky-300 text-sm font-semibold hover:underline"
            >
              Clear search and view all rides →
            </button>
          )}
          {statusFilter !== "all" && (
            <button
              onClick={() => setStatusFilter("all")}
              className="text-sky-300 text-sm font-semibold hover:underline"
            >
              View all rides →
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {paginatedBookings.map((booking) => {
            const pickupDateTime = new Date(`${booking.pickupDate}T${booking.pickupTime}`);
            const hoursUntilPickup = differenceInHours(pickupDateTime, new Date());
            const canReschedule = booking.status === "pending" && hoursUntilPickup >= 24;
            const thumbnail = vehicleThumbnails[booking.vehicleType] || vehicleThumbnails.sedan;

            return (
              <div key={booking.id} className="rounded-4xl bg-slate-50 p-6 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex-1 space-y-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="text-xs font-mono uppercase tracking-[0.3em] text-sky-300">{booking.reservationNumber}</span>
                          <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${statusColors[booking.status] || statusColors.pending}`}>
                            {statusTitles[booking.status] || booking.status.replace(/_/g, " ")}
                          </span>
                        </div>
                        <p className="mt-3 text-sm text-slate-600 max-w-2xl">{statusNextSteps[booking.status]}</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => setSelectedBooking(booking)} className="gap-2 self-start">
                        View details
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                      <div className="rounded-3xl bg-white p-4 ring-1 ring-slate-200">
                        <p className="text-[11px] uppercase tracking-[0.3em] text-slate-500">Pickup</p>
                        <p className="mt-2 text-sm text-slate-900 truncate">{booking.pickupLocation}</p>
                      </div>
                      <div className="rounded-3xl bg-white p-4 ring-1 ring-slate-200">
                        <p className="text-[11px] uppercase tracking-[0.3em] text-slate-500">Drop-off</p>
                        <p className="mt-2 text-sm text-slate-900 truncate">{booking.dropoffLocation}</p>
                      </div>
                      <div className="rounded-3xl bg-white p-4 ring-1 ring-slate-200">
                        <p className="text-[11px] uppercase tracking-[0.3em] text-slate-500">Pickup time</p>
                        <p className="mt-2 text-sm text-slate-900">{booking.pickupDate ? format(parseISO(booking.pickupDate), "MMM d, yyyy") : "—"} · {booking.pickupTime?.slice(0, 5) || "00:00"}</p>
                      </div>
                      <div className="rounded-3xl bg-white p-4 ring-1 ring-slate-200">
                        <p className="text-[11px] uppercase tracking-[0.3em] text-slate-500">Vehicle</p>
                        <div className="mt-3 flex items-center gap-3">
                          <div className="relative h-16 w-24 overflow-hidden rounded-3xl bg-slate-100">
                            <Image src={thumbnail} alt={booking.vehicleType} fill className="object-cover" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{vehicleNames[booking.vehicleType]}</p>
                            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{booking.vehicleType}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-3 lg:grid-cols-[1.4fr_0.9fr]">
                      <div className="rounded-3xl bg-white p-4 ring-1 ring-slate-200">
                        <RouteVisualization pickup={booking.pickupLocation} dropoff={booking.dropoffLocation} />
                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                          <div className="rounded-3xl bg-slate-50 p-3 ring-1 ring-slate-200">
                            <p className="text-[11px] uppercase tracking-[0.3em] text-slate-500">Distance</p>
                            <p className="mt-2 text-sm text-slate-900">{booking.distanceMiles || "—"} mi</p>
                          </div>
                          <div className="rounded-3xl bg-slate-50 p-3 ring-1 ring-slate-200">
                            <p className="text-[11px] uppercase tracking-[0.3em] text-slate-500">Duration</p>
                            <p className="mt-2 text-sm text-slate-900">{booking.durationMinutes ? `${booking.durationMinutes} mins` : "—"}</p>
                          </div>
                        </div>
                      </div>
                      <div className="rounded-3xl bg-white p-4 ring-1 ring-slate-200">
                        <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">Ride overview</p>
                        <div className="mt-4 space-y-2 text-sm text-slate-700">
                          <p><span className="font-semibold text-slate-900">Client:</span> {booking.clientName || "Guest"}</p>
                          <p><span className="font-semibold text-slate-900">Phone:</span> {booking.clientPhone || "—"}</p>
                          <p><span className="font-semibold text-slate-900">Flight:</span> {booking.flightNumber || "N/A"}</p>
                          <p><span className="font-semibold text-slate-900">Requests:</span> {booking.specialRequests || "None"}</p>
                        </div>
                        <div className="mt-4 rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-200">
                          <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">Next step</p>
                          <p className="mt-2 text-sm text-slate-700">{statusNextSteps[booking.status]}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4 shrink-0 text-right">
                    <div className="rounded-3xl bg-white p-4 ring-1 ring-slate-200">
                      <p className="text-2xl font-display font-semibold text-slate-900">${booking.totalPrice ? Number(booking.totalPrice).toFixed(0) : "0"}</p>
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-500 mt-1">{booking.vehicleType}</p>
                    </div>
                    <div className="rounded-3xl bg-white p-4 ring-1 ring-slate-200 text-left">
                      <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">Status details</p>
                      <p className="mt-2 text-sm text-slate-700">{statusTitles[booking.status]}</p>
                    </div>
                    {booking.status === "pending" && canReschedule && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => {
                          setRescheduleBooking(booking);
                          setRescheduleDate(booking.pickupDate);
                          setRescheduleTime(booking.pickupTime || "");
                        }}
                      >
                        <CalendarDays className="h-4 w-4" /> Reschedule
                      </Button>
                    )}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="gap-2 text-destructive hover:bg-destructive/10">
                          <XCircle className="h-4 w-4" /> Cancel
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="glass-heavy border-border">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Cancel Ride?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will cancel <span className="text-primary font-mono font-medium">{booking.reservationNumber}</span>.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Keep</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => onCancel(booking.id)}
                          >
                            Cancel Ride
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={!!selectedBooking} onOpenChange={(open) => !open && setSelectedBooking(null)}>
        <DialogContent className="glass-heavy border-border max-w-5xl">
          <DialogHeader>
            <DialogTitle>Ride details</DialogTitle>
            <DialogDescription>{selectedBooking?.reservationNumber} • {statusTitles[selectedBooking?.status || "pending"]}</DialogDescription>
          </DialogHeader>
          {selectedBooking ? (
            <div className="space-y-6">
              <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-200">
                  <MapPreview pickup={selectedBooking.pickupLocation} dropoff={selectedBooking.dropoffLocation} />
                </div>
                <div className="space-y-4 rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-200">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">Pickup</p>
                    <p className="mt-2 text-sm text-slate-900">{selectedBooking.pickupLocation}</p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">Drop-off</p>
                    <p className="mt-2 text-sm text-slate-900">{selectedBooking.dropoffLocation}</p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">Pickup</p>
                      <p className="mt-2 text-sm text-slate-900">{selectedBooking.pickupDate ? format(parseISO(selectedBooking.pickupDate), "MMM d, yyyy") : "—"}</p>
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">Time</p>
                      <p className="mt-2 text-sm text-slate-900">{selectedBooking.pickupTime?.slice(0, 5) ?? "—"}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <div className="rounded-3xl bg-white p-4 ring-1 ring-slate-200">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">Vehicle</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">{vehicleNames[selectedBooking.vehicleType]}</p>
                </div>
                <div className="rounded-3xl bg-white p-4 ring-1 ring-slate-200">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">Distance</p>
                  <p className="mt-2 text-sm text-slate-900">{selectedBooking.distanceMiles || "—"} mi</p>
                </div>
                <div className="rounded-3xl bg-white p-4 ring-1 ring-slate-200">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">Total</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">${selectedBooking.totalPrice ? Number(selectedBooking.totalPrice).toFixed(0) : "0"}</p>
                </div>
              </div>

              <div className="rounded-3xl bg-white p-4 ring-1 ring-slate-200">
                <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">Notes</p>
                <p className="mt-2 text-sm text-slate-700">{selectedBooking.specialRequests || "No special requests."}</p>
              </div>
            </div>
          ) : null}
          <DialogFooter className="mt-4">
            <Button variant="ghost" onClick={() => setSelectedBooking(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {!loading && searchedBookings.length > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center justify-between mt-4 pt-4 border-t border-white/10 text-slate-400">
          <p className="text-sm">
            Showing {paginatedBookings.length} of {searchedBookings.length} rides · Page {Math.min(page + 1, totalPages)} of {totalPages}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" disabled={page === 0} onClick={() => onPageChange(Math.max(page - 1, 0))}>
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled={page + 1 >= totalPages} onClick={() => onPageChange(page + 1)}>
              Next
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
