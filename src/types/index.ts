export type BookingStatus =
  | "pending" | "assigned" | "en_route" | "on_site" | "in_progress" | "done" | "cancelled";

export type VehicleType = "sedan" | "suv";

export interface User {
  id: string;
  email: string;
  role: "admin" | "client";
  fullName?: string;
  phone?: string;
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
  distanceMiles: string | null;
  durationMinutes: number | null;
  basePrice: string | null;
  gratuity: string | null;
  totalPrice: string | null;
  status: BookingStatus;
  driverId: string | null;
  dispatcherNotes: string | null;
  clientName: string | null;
  clientPhone: string | null;
  clientEmail: string | null;
  emailPhase: string | null;
  tripGroupId: string | null;
  legOrder: number | null;
  gatekeeperStatus: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Driver {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  status: "available" | "unavailable" | "on_trip";
  vehicleId: string | null;
  photoUrl: string | null;
  notes: string | null;
  createdAt: string;
}

export interface FleetVehicle {
  id: string;
  make: string;
  model: string;
  year: number | null;
  vehicleType: VehicleType;
  color: string | null;
  licensePlate: string | null;
  status: "available" | "in_service" | "maintenance";
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
