"use client";
import { useCallback, useMemo, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

const STORAGE_KEY = "wc_booking";

export interface TripLeg {
  pickup: string;
  dropoff: string;
  pickupDate: string;
  pickupTime: string;
  distanceMiles?: number;
  durationMinutes?: number;
}

export interface BookingData {
  pickup: string;
  dropoff: string;
  isPickupAirport: boolean;
  pickupDate: string;
  pickupTime: string;
  selectedVehicle: "sedan" | "suv" | null;
  flightNumber: string;
  specialRequests: string;
  additionalLegs: TripLeg[];
  bookingForSomeoneElse: boolean;
  guestFirstName: string;
  guestLastName: string;
  guestEmail: string;
  guestPhone: string;
}

const EMPTY: BookingData = {
  pickup: "", dropoff: "", isPickupAirport: false,
  pickupDate: "", pickupTime: "", selectedVehicle: null,
  flightNumber: "", specialRequests: "", additionalLegs: [],
  bookingForSomeoneElse: false, guestFirstName: "", guestLastName: "",
  guestEmail: "", guestPhone: "",
};

export const STEP_ROUTES = ["/book", "/book/details", "/book/login", "/book/checkout"] as const;
export const STEP_LABELS = ["Service Class", "Pickup Info", "Log In", "Checkout"] as const;

export function getStepIndex(pathname: string): number {
  const idx = STEP_ROUTES.indexOf(pathname as any);
  return idx === -1 ? 0 : idx;
}

function read(): BookingData {
  if (typeof window === "undefined") return { ...EMPTY };
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) return { ...EMPTY, ...JSON.parse(raw) };
  } catch {}
  return { ...EMPTY };
}

function write(data: BookingData) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function clearBookingStore() {
  if (typeof window !== "undefined") sessionStorage.removeItem(STORAGE_KEY);
}

export function seedBookingStore(state: Partial<BookingData>) {
  if (!state?.pickup) return;
  const current = read();
  const changed = !current.pickup || current.pickup !== state.pickup || current.dropoff !== state.dropoff;
  if (changed) write({ ...EMPTY, ...state, selectedVehicle: null, flightNumber: "", specialRequests: "", additionalLegs: [] });
}

export function useBookingStore() {
  const router = useRouter();
  const pathname = usePathname();
  const [revision, setRevision] = useState(0);

  const data = useMemo(() => read(), [pathname, revision]);
  const bump = useCallback(() => setRevision((r) => r + 1), []);

  const update = useCallback((partial: Partial<BookingData>) => {
    write({ ...read(), ...partial });
    bump();
  }, [bump]);

  const addLeg = useCallback((leg: TripLeg) => {
    const c = read();
    write({ ...c, additionalLegs: [...c.additionalLegs, leg] });
    bump();
  }, [bump]);

  const removeLeg = useCallback((index: number) => {
    const c = read();
    const legs = [...c.additionalLegs];
    legs.splice(index, 1);
    write({ ...c, additionalLegs: legs });
    bump();
  }, [bump]);

  const updateLeg = useCallback((index: number, leg: TripLeg) => {
    const c = read();
    const legs = [...c.additionalLegs];
    legs[index] = leg;
    write({ ...c, additionalLegs: legs });
    bump();
  }, [bump]);

  const goToStep = useCallback((stepIndex: number) => {
    router.push(STEP_ROUTES[stepIndex]);
  }, [router]);

  const currentStep = getStepIndex(pathname);

  return { data, update, addLeg, removeLeg, updateLeg, goToStep, currentStep };
}
