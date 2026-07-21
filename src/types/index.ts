export type BookingStatus =
  | "pending" | "assigned" | "en_route" | "on_site" | "in_progress" | "done" | "cancelled";

export type VehicleType = "sedan" | "suv";

// Request types for API calls
export interface TripLeg {
  pickup: string;
  dropoff: string;
  pickupDate: string;
  pickupTime: string;
  distanceMiles: number;
  durationMinutes: number;
}

export interface CreateBookingPayload {
  pickup: string;
  dropoff: string;
  pickupDate: string;
  pickupTime: string;
  vehicleType?: VehicleType;
  vehicleId?: string;
  distanceMiles: number;
  durationMinutes: number;
  isAirportPickup?: boolean;
  flightNumber?: string;
  specialRequests?: string;
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  bookingForSomeoneElse?: boolean;
  guestFirstName?: string;
  guestLastName?: string;
  guestEmail?: string;
  guestPhone?: string;
  additionalLegs?: TripLeg[];
  // Idempotency key for automatic pending-booking creation - see backend
  // db/schema/bookings.ts checkoutAttemptId comment for the full rationale.
  checkoutAttemptId?: string;
}

export interface User {
  id: string;
  email: string;
  role: "admin" | "client";
  fullName?: string;
  phone?: string;
  profile?: Profile | null;
}

export interface Profile {
  id: string;
  userId: string;
  displayName: string | null;
  email: string | null;
  phone: string | null;
  isCorporate: boolean | null;
  corporateName: string | null;
  clientCode: string | null;
  avatarUrl: string | null;
  stateAbbrev: string | null;
}

export interface Booking {
  id: string;
  userId: string | null;
  reservationNumber: string;
  pickupLocation: string;
  dropoffLocation: string;
  pickupDate: string;
  pickupTime: string;
  vehicleType: VehicleType;
  isAirportPickup: boolean | null;
  flightNumber: string | null;
  specialRequests: string | null;
  // Postgres numeric/decimal columns serialize as strings over the raw API
  // response - bookingService normalizes these to real, finite numbers (or
  // null if missing/not a valid number) before returning a Booking to any
  // caller, so this type is only accurate for values that went through that
  // normalization. Do not bypass bookingService with a raw fetch for
  // booking data (see PremiumBookingConfirmed.tsx history: a raw fetch
  // there previously left distanceMiles as an unconverted string, and a
  // direct `.toFixed()` call on it crashed the whole confirmation page).
  distanceMiles: number | null;
  durationMinutes: number | null;
  basePrice: number | null;
  gratuity: number | null;
  totalPrice: number | null;
  status: BookingStatus;
  driverId: string | null;
  dispatcherNotes: string | null;
  clientName: string | null;
  clientPhone: string | null;
  clientEmail: string | null;
  clientCode: string | null;
  emailPhase: string | null;
  tripGroupId: string | null;
  legOrder: number | null;
  gatekeeperStatus: string | null;
  createdAt: string;
  updatedAt: string;
  // Derived from the payments table (see backend getPaymentInfo) - never
  // stored redundantly on the booking row itself, so it can't drift out of
  // sync with the actual payment record. paymentMethod/cloverPaymentId/
  // paymentFailureReason/paymentProcessedAt are admin-only (backend scopes
  // them out for non-admin callers).
  paymentStatus?: "pending" | "processing" | "paid" | "failed" | "refunded" | null;
  paymentMethod?: "clover" | "stripe" | null;
  paymentAmount?: number | null;
  cloverPaymentId?: string | null;
  paymentFailureReason?: string | null;
  paymentProcessedAt?: string | null;
  // groupTotalPrice is the authoritative combined total for the whole trip -
  // for a single-leg booking (tripGroupId null) it's identical to totalPrice;
  // for a multi-leg trip it's the sum of every sibling leg's own totalPrice,
  // computed server-side. Present on both list and detail responses.
  groupTotalPrice?: number | null;
  // Sibling legs of the same trip (including this row), sorted by legOrder -
  // only populated on the GET /:id detail response, and only when
  // tripGroupId is set; empty/absent for a single-leg booking.
  legs?: BookingLegSummary[];
}

export interface BookingLegSummary {
  id: string;
  legOrder: number | null;
  pickupLocation: string;
  dropoffLocation: string;
  pickupDate: string;
  pickupTime: string;
  totalPrice: number | null;
  status: BookingStatus;
}

export interface Driver {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  status: "available" | "off_duty" | "on_trip" | "unavailable";
  vehicleId: string | null;
  photoUrl: string | null;
  notes: string | null;
  rating?: number | null;
  tripsCompleted?: number | null;
  createdAt: string;
}

export interface FleetVehicle {
  id: string;
  make: string;
  model: string;
  year: number | null;
  vehicleType: VehicleType;
  color: string | null;
  plate: string | null;
  status: "available" | "in_use" | "maintenance" | "retired" | "in_service";
  passengerCapacity: number | null;
  luggageCapacity: number | null;
  imageUrl: string | null;
  notes: string | null;
  createdAt: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientUserId: string | null;
  clientName: string | null;
  clientEmail: string | null;
  total: number;
  status: "draft" | "sent" | "paid" | "overdue";
  dueDate: string | null;
  createdAt: string;
}

export interface RouteDetails {
  distance: number;
  duration: number;
}
