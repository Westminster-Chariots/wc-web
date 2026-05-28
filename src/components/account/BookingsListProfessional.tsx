"use client";

import { useRouter } from "next/navigation";
import { Car, CalendarDays, XCircle, ChevronRight, MapPin, Clock, DollarSign, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import type { Booking } from "@/types";
import { format, parseISO, differenceInHours } from "date-fns";
import { useState, useMemo, useEffect } from "react";

const statusColors: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-600",
  assigned: "bg-blue-500/10 text-blue-600",
  en_route: "bg-cyan-500/10 text-cyan-600",
  on_site: "bg-purple-500/10 text-purple-600",
  in_progress: "bg-indigo-500/10 text-indigo-600",
  done: "bg-emerald-500/10 text-emerald-600",
  cancelled: "bg-red-500/10 text-red-600",
};

const statusIcons: Record<string, string> = {
  pending: "⏳",
  assigned: "👤",
  en_route: "🚗",
  on_site: "📍",
  in_progress: "🎯",
  done: "✅",
  cancelled: "❌",
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

export default function BookingsListProfessional({ bookings, loading, page, pageSize, onPageChange, onReschedule, onCancel }: BookingsListProps) {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");

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

  const handleViewDetails = (bookingId: string) => {
    router.push(`/account/booking/${bookingId}`);
  };

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      pending: "Pending",
      assigned: "Assigned",
      en_route: "En Route",
      on_site: "On Site",
      in_progress: "In Progress",
      done: "Completed",
      cancelled: "Cancelled",
    };
    return texts[status] || status.replace(/_/g, " ");
  };

  const getVehicleName = (type: string) => {
    return type === "sedan" ? "Executive Sedan" : "Luxury SUV";
  };

  return (
    <section className="space-y-6">
      {/* Header Section */}
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Ride History</h2>
            <p className="mt-1 text-sm text-slate-600">
              Manage your upcoming and completed rides
            </p>
          </div>
          <div className="relative w-full md:w-64">
            <Label htmlFor="booking-search" className="sr-only">Search rides</Label>
            <Input
              id="booking-search"
              placeholder="Search rides..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="w-full"
            />
          </div>
        </div>

        {/* Status Filters */}
        <div className="mt-6 flex flex-wrap gap-2">
          {[
            { label: `All (${statusCounts.all || 0})`, value: "all" },
            { label: `Pending (${statusCounts.pending || 0})`, value: "pending" },
            { label: `Assigned (${statusCounts.assigned || 0})`, value: "assigned" },
            { label: `In Progress (${statusCounts.in_progress || 0})`, value: "in_progress" },
            { label: `Completed (${statusCounts.done || 0})`, value: "done" },
            { label: `Cancelled (${statusCounts.cancelled || 0})`, value: "cancelled" },
          ].map((filter) => (
            <button
              key={filter.value}
              onClick={() => setStatusFilter(filter.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === filter.value
                  ? "bg-sky-600 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}>
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-2xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : searchedBookings.length === 0 ? (
        <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
          <Car className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No rides found</h3>
          <p className="text-sm text-slate-600 mb-4">
            {statusFilter === "all" ? "You haven't booked any rides yet." : `No ${statusFilter.replace(/_/g, " ")} rides were found.`}
          </p>
          <div className="flex gap-4 justify-center">
            {searchTerm && (
              <Button variant="outline" onClick={() => setSearchTerm("")}>
                Clear search
              </Button>
            )}
            {statusFilter !== "all" && (
              <Button variant="outline" onClick={() => setStatusFilter("all")}>
                View all rides
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {paginatedBookings.map((booking) => {
            const pickupDateTime = new Date(`${booking.pickupDate}T${booking.pickupTime}`);
            const hoursUntilPickup = differenceInHours(pickupDateTime, new Date());
            const canReschedule = booking.status === "pending" && hoursUntilPickup >= 24;

            return (
              <div key={booking.id} className="rounded-2xl bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                  {/* Left Column - Booking Info */}
                  <div className="flex-1 space-y-4">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-sm font-mono text-sky-600">{booking.reservationNumber}</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[booking.status] || statusColors.pending}`}>
                            {statusIcons[booking.status] || "⏳"} {getStatusText(booking.status)}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900">{getVehicleName(booking.vehicleType)}</h3>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleViewDetails(booking.id)} className="gap-2">
                          View Details
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Route Information */}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="rounded-lg bg-slate-50 p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin className="h-4 w-4 text-slate-500" />
                          <p className="text-sm font-medium text-slate-900">Pickup</p>
                        </div>
                        <p className="text-slate-600 truncate">{booking.pickupLocation}</p>
                      </div>
                      <div className="rounded-lg bg-slate-50 p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin className="h-4 w-4 text-slate-500" />
                          <p className="text-sm font-medium text-slate-900">Drop-off</p>
                        </div>
                        <p className="text-slate-600 truncate">{booking.dropoffLocation}</p>
                      </div>
                    </div>

                    {/* Time & Price */}
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="rounded-lg bg-slate-50 p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <CalendarDays className="h-4 w-4 text-slate-500" />
                          <p className="text-sm font-medium text-slate-900">Date & Time</p>
                        </div>
                        <p className="text-slate-600">
                          {booking.pickupDate ? format(parseISO(booking.pickupDate), "MMM d") : "—"} · {booking.pickupTime?.slice(0, 5) || "00:00"}
                        </p>
                      </div>
                      <div className="rounded-lg bg-slate-50 p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="h-4 w-4 text-slate-500" />
                          <p className="text-sm font-medium text-slate-900">Duration</p>
                        </div>
                        <p className="text-slate-600">{booking.durationMinutes || "—"} min</p>
                      </div>
                      <div className="rounded-lg bg-slate-50 p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <DollarSign className="h-4 w-4 text-slate-500" />
                          <p className="text-sm font-medium text-slate-900">Total</p>
                        </div>
                        <p className="text-xl font-semibold text-slate-900">${booking.totalPrice ? Number(booking.totalPrice).toFixed(0) : "0"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Actions */}
                  <div className="lg:w-48 space-y-3">
                    {booking.driverId && (
                      <div className="rounded-lg bg-slate-50 p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="h-4 w-4 text-slate-500" />
                          <p className="text-sm font-medium text-slate-900">Driver</p>
                        </div>
                        <p className="text-sm text-slate-600">Assigned</p>
                      </div>
                    )}

                    <div className="flex flex-col gap-2">
                      {booking.status === "pending" && canReschedule && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2 w-full"
                          onClick={() => {
                            // Reschedule logic would go here
                          }}
                        >
                          <CalendarDays className="h-4 w-4" />
                          Reschedule
                        </Button>
                      )}
                      
                      {booking.status === "pending" && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="gap-2 w-full text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                            >
                              <XCircle className="h-4 w-4" />
                              Cancel
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Cancel Ride?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will cancel reservation <span className="font-mono font-medium">{booking.reservationNumber}</span>.
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Keep Booking</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-red-600 text-white hover:bg-red-700"
                                onClick={() => onCancel(booking.id)}
                              >
                                Cancel Ride
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {!loading && searchedBookings.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t border-slate-200">
          <p className="text-sm text-slate-600">
            Showing {paginatedBookings.length} of {searchedBookings.length} rides · Page {Math.min(page + 1, totalPages)} of {totalPages}
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
              disabled={page + 1 >= totalPages} 
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