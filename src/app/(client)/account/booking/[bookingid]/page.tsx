"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { bookingService } from "@/lib/services";
import { notify } from "@/lib/notify";
import type { Booking } from "@/types";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Car, CalendarDays, MapPin, Clock, DollarSign, User, Phone, Star, FileText, AlertCircle } from "lucide-react";
import { format, parseISO } from "date-fns";
import AccountHeader from "@/components/account/AccountHeader";
import MapPreview from "@/components/booking/MapPreview";
import Image from "next/image";

const statusColors: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  assigned: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  en_route: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20",
  on_site: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  in_progress: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
  done: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  cancelled: "bg-red-500/10 text-red-600 border-red-500/20",
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

export default function BookingDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();
  const bookingId = params.bookingid as string;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [driverInfo, setDriverInfo] = useState<{name: string; phone?: string; rating?: number} | null>(null);
  const [vehicleInfo, setVehicleInfo] = useState<{make: string; model: string; year?: number; imageUrl?: string} | null>(null);

  const handleSignOut = () => {
    logout();
    router.push("/auth");
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/auth");
      return;
    }
    fetchBookingDetails();
  }, [user, authLoading, bookingId]);

  const fetchBookingDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await bookingService.getById(bookingId);
      setBooking(data);
      
      // Fetch driver info if assigned
      if (data.driverId) {
        const token = localStorage.getItem("access_token");
        const driverResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "https://wc-backend-ayx0.onrender.com/api/v1"}/drivers/${data.driverId}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        if (driverResponse.ok) {
          const driverData = await driverResponse.json();
          setDriverInfo({
            name: driverData.name,
            phone: driverData.phone,
            rating: driverData.rating
          });
        }
      }
      
      // Fetch vehicle info
      const token = localStorage.getItem("access_token");
      const fleetResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "https://wc-backend-ayx0.onrender.com/api/v1"}/fleet`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (fleetResponse.ok) {
        const fleetData = await fleetResponse.json();
        const vehicle = fleetData.find((v: any) => v.vehicleType === data.vehicleType);
        if (vehicle) {
          setVehicleInfo({
            make: vehicle.make,
            model: vehicle.model,
            year: vehicle.year,
            imageUrl: vehicle.imageUrl
          });
        }
      }
    } catch (error: unknown) {
      console.error("Error fetching booking details:", error);
      setError("Failed to load booking details. Please try again.");
      notify.error("Unable to load booking details");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.push("/account");
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <AccountHeader onSignOut={handleSignOut} />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 border-4 border-sky-600 border-t-transparent rounded-full animate-spin" />
          </div>
        </main>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-slate-50">
        <AccountHeader onSignOut={handleSignOut} />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
          <div className="rounded-2xl bg-white p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Booking Not Found</h2>
            <p className="text-slate-600 mb-6">{error || "The booking you're looking for doesn't exist."}</p>
            <Button onClick={handleBack} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Account
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AccountHeader onSignOut={handleSignOut} />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" onClick={handleBack} className="gap-2 mb-6 text-slate-600 hover:text-slate-900">
            <ArrowLeft className="h-4 w-4" />
            Back to Account
          </Button>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-display font-semibold text-slate-900">Booking Details</h1>
              <p className="mt-2 text-slate-600">Reservation #{booking.reservationNumber}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`rounded-full px-4 py-2 text-sm font-semibold ${statusColors[booking.status] || statusColors.pending}`}>
                {statusTitles[booking.status] || booking.status.replace(/_/g, " ")}
              </span>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Trip Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Map Section */}
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="h-5 w-5 text-slate-700" />
                <h2 className="text-lg font-semibold text-slate-900">Route</h2>
              </div>
              <div className="rounded-xl overflow-hidden">
                <MapPreview pickup={booking.pickupLocation} dropoff={booking.dropoffLocation} />
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-900">Pickup Location</p>
                  <p className="mt-1 text-slate-600">{booking.pickupLocation}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-900">Drop-off Location</p>
                  <p className="mt-1 text-slate-600">{booking.dropoffLocation}</p>
                </div>
              </div>
            </div>

            {/* Trip Information */}
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Car className="h-5 w-5 text-slate-700" />
                <h2 className="text-lg font-semibold text-slate-900">Trip Information</h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg bg-slate-50 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CalendarDays className="h-4 w-4 text-slate-500" />
                    <p className="text-sm font-medium text-slate-900">Date & Time</p>
                  </div>
                  <p className="text-slate-600">
                    {booking.pickupDate ? format(parseISO(booking.pickupDate), "EEEE, MMMM d, yyyy") : "—"} · {booking.pickupTime?.slice(0, 5) || "00:00"}
                  </p>
                </div>
                <div className="rounded-lg bg-slate-50 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-slate-500" />
                    <p className="text-sm font-medium text-slate-900">Duration</p>
                  </div>
                  <p className="text-slate-600">{booking.durationMinutes || "—"} minutes</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-900 mb-2">Distance</p>
                  <p className="text-slate-600">{booking.distanceMiles || "—"} miles</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="h-4 w-4 text-slate-500" />
                    <p className="text-sm font-medium text-slate-900">Total Price</p>
                  </div>
                  <p className="text-2xl font-semibold text-slate-900">${booking.totalPrice ? Number(booking.totalPrice).toFixed(0) : "0"}</p>
                </div>
              </div>
            </div>

            {/* Vehicle Details */}
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Car className="h-5 w-5 text-slate-700" />
                <h2 className="text-lg font-semibold text-slate-900">Vehicle Details</h2>
              </div>
              <div className="flex flex-col sm:flex-row gap-6">
                {vehicleInfo?.imageUrl ? (
                  <div className="relative h-48 w-full sm:w-64 rounded-xl overflow-hidden bg-slate-100">
                    <Image src={vehicleInfo.imageUrl} alt={`${vehicleInfo.make} ${vehicleInfo.model}`} fill className="object-cover" />
                  </div>
                ) : (
                  <div className="h-48 w-full sm:w-64 rounded-xl bg-slate-100 flex items-center justify-center">
                    <Car className="h-12 w-12 text-slate-400" />
                  </div>
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900 mb-1">Vehicle Type</p>
                  <p className="text-lg font-semibold text-slate-900 mb-4">{booking.vehicleType === "sedan" ? "Executive Sedan" : "Luxury SUV"}</p>
                  
                  {vehicleInfo && (
                    <>
                      <p className="text-sm font-medium text-slate-900 mb-1">Make & Model</p>
                      <p className="text-slate-600 mb-4">{vehicleInfo.make} {vehicleInfo.model}{vehicleInfo.year ? ` (${vehicleInfo.year})` : ''}</p>
                    </>
                  )}
                  
                  <p className="text-sm font-medium text-slate-900 mb-1">Reservation Number</p>
                  <p className="font-mono text-slate-600">{booking.reservationNumber}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - People & Notes */}
          <div className="space-y-6">
            {/* Driver Information */}
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <User className="h-5 w-5 text-slate-700" />
                <h2 className="text-lg font-semibold text-slate-900">Driver Information</h2>
              </div>
              {driverInfo ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-slate-900 mb-1">Name</p>
                    <p className="text-slate-600">{driverInfo.name}</p>
                  </div>
                  {driverInfo.phone && (
                    <div>
                      <p className="text-sm font-medium text-slate-900 mb-1">Phone</p>
                      <p className="text-slate-600">{driverInfo.phone}</p>
                    </div>
                  )}
                  {driverInfo.rating && (
                    <div>
                      <p className="text-sm font-medium text-slate-900 mb-1">Rating</p>
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                        <p className="text-slate-600">{driverInfo.rating}/5</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : booking.driverId ? (
                <p className="text-slate-600">Driver assigned (details loading...)</p>
              ) : (
                <p className="text-slate-600">No driver assigned yet</p>
              )}
            </div>

            {/* Client Information */}
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <User className="h-5 w-5 text-slate-700" />
                <h2 className="text-lg font-semibold text-slate-900">Client Information</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-slate-900 mb-1">Name</p>
                  <p className="text-slate-600">{booking.clientName || "Guest"}</p>
                </div>
                {booking.clientPhone && (
                  <div>
                    <p className="text-sm font-medium text-slate-900 mb-1">Phone</p>
                    <p className="text-slate-600">{booking.clientPhone}</p>
                  </div>
                )}
                {booking.clientEmail && (
                  <div>
                    <p className="text-sm font-medium text-slate-900 mb-1">Email</p>
                    <p className="text-slate-600">{booking.clientEmail}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Special Requests */}
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="h-5 w-5 text-slate-700" />
                <h2 className="text-lg font-semibold text-slate-900">Special Requests</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-slate-900 mb-1">Requests</p>
                  <p className="text-slate-600">{booking.specialRequests || "No special requests."}</p>
                </div>
                {booking.flightNumber && (
                  <div>
                    <p className="text-sm font-medium text-slate-900 mb-1">Flight Number</p>
                    <p className="text-slate-600">{booking.flightNumber}</p>
                  </div>
                )}
                {booking.dispatcherNotes && (
                  <div>
                    <p className="text-sm font-medium text-slate-900 mb-1">Dispatcher Notes</p>
                    <p className="text-slate-600">{booking.dispatcherNotes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Booking Timeline */}
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Booking Timeline</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-slate-900 mb-1">Created</p>
                  <p className="text-slate-600">{booking.createdAt ? format(parseISO(booking.createdAt), "MMM d, yyyy HH:mm") : "—"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900 mb-1">Last Updated</p>
                  <p className="text-slate-600">{booking.updatedAt ? format(parseISO(booking.updatedAt), "MMM d, yyyy HH:mm") : "—"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}