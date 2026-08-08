export type BookingStatus =
  | "pending" | "assigned" | "en_route" | "on_site" | "in_progress" | "done" | "cancelled";

export type VehicleType = "sedan" | "suv";

// Customer-facing booking class (e.g. "Business Sedan", "First Class") -
// what a customer actually selects on /book and is priced against. Backed
// by wc-backend-1's `services` table. Owns NO pricing data of its own -
// `pricingConfigurationId` references a named formula profile in the
// Pricing module (see PricingConfiguration below), which is the single
// source of truth for every number the adaptive formula reads. Also has no
// reference to a specific physical vehicle: `vehicleType` is used only as a
// display/dispatch-matching hint against Fleet inventory (and as the
// compatibility check against its assigned configuration's own
// vehicleType, enforced server-side) - never as a link to one specific
// car. See FleetVehicle below for the separate, internal-only
// physical-vehicle entity.
export interface Service {
  id: string;
  name: string;
  slug: string;
  vehicleType: VehicleType;
  pricingConfigurationId: string;
  description: string | null;
  imageUrl: string | null;
  passengerCapacity: number;
  luggageCapacity: number;
  features: string[];
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

// A named, reusable adaptive-formula pricing profile - owned entirely by
// the Pricing module. Field names mirror the formula's own symbols, not a
// flat mileage/time-rate model:
//   P = roundingIncrement * round(
//         max(minimumFare, (calculationBase + distanceCoefficient*D +
//             timeCoefficient*T + F) * (1 + adjustmentCoefficient*A)) /
//         roundingIncrement
//       )
// Multiple Services may reference the same configuration. There is
// deliberately no admin UI to create/edit these yet (see the Services
// form's Pricing Configuration dropdown, which only ever *selects* one) -
// that's deferred to the future Pricing-module redesign.
export interface PricingConfiguration {
  id: string;
  name: string;
  vehicleType: VehicleType;
  // Postgres numeric columns serialize as strings over the raw API
  // response - pricingConfigurationService normalizes these to real
  // numbers before returning a PricingConfiguration to any caller.
  calculationBase: number;
  distanceCoefficient: number;
  timeCoefficient: number;
  minimumFare: number;
  adjustmentCoefficient: number;
  roundingIncrement: number;
  formulaVersion: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

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
  // Which Service (see the Service interface above) this booking is priced
  // against - the customer-facing selection. vehicleType above is still
  // sent alongside it (derived from the selected service's own
  // vehicleType) since the backend's bookings.vehicleType column and
  // dispatch matching still key off it - the backend derives/validates it
  // server-side from the service once serviceId is present, never trusting
  // a conflicting client-submitted value. serviceId is what actually
  // determines the pricing configuration now (see wc-backend-1
  // lib/servicePricing.ts's resolveServicePricingConfiguration).
  serviceId?: string;
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
  // Signed quote token from pricingService.calculate() (see backend
  // lib/quote.ts). When present, the backend locks this booking's price to
  // that quote's amounts instead of recomputing - see checkout/page.tsx for
  // how a stale/mismatched quote is detected and re-requested rather than
  // silently falling back to a different charged amount.
  quoteId?: string;
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
  // Which Service/Class this booking was priced against - null for every
  // booking created before this field existed (see wc-backend-1's additive
  // bookings.service_id migration). Never rewritten for historical bookings;
  // vehicleType above remains fully accurate for those regardless.
  serviceId?: string | null;
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
  // Which signed quote (if any) this booking's price was locked to, and the
  // whole-trip total that quote locked in - set once at creation, never
  // recomputed afterward. Absent/null for a booking created without a
  // quote (see backend POST /bookings' quoteId fallback).
  quoteId?: string | null;
  quotedAmountCents?: number | null;
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
