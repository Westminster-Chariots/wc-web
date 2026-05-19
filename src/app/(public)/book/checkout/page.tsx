"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useBookingStore, type TripLeg } from "@/hooks/useBookingStore";
import { useAuth } from "@/hooks/useAuth";
import { useRouteDetails, fetchRouteDetails } from "@/hooks/useRouteDetails";
import { usePricing } from "@/hooks/usePricing";
import type { RouteDetails } from "@/types";
import { notify } from "@/lib/notify";
import { bookingService } from "@/lib/services";
import CheckoutSummary from "@/components/booking/CheckoutSummary";

export default function BookingCheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { data, update, addLeg, removeLeg, updateLeg } = useBookingStore();
  const [loading, setLoading] = useState(false);
  const { calculatePrice, getTaxPercent } = usePricing();

  const { route } = useRouteDetails(data.pickup, data.dropoff);
  const basePrice = route && data.selectedVehicle ? calculatePrice(route.distance, route.duration, data.selectedVehicle) || 0 : 0;
  const taxPercent = data.selectedVehicle ? getTaxPercent(data.selectedVehicle) / 100 : 0.2;
  const tax = basePrice * taxPercent;
  const total = basePrice + tax;

  // Fetch routes for additional legs
  const [legRoutes, setLegRoutes] = useState<RouteDetails[]>([]);
  const [isLoadingLegs, setIsLoadingLegs] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function fetchLegRoutes() {
      if ((data.additionalLegs || []).length === 0) {
        setLegRoutes([]);
        return;
      }
      setIsLoadingLegs(true);
      const routes = await Promise.all(
        (data.additionalLegs || []).map(leg => fetchRouteDetails(leg.pickup, leg.dropoff))
      );
      if (isMounted) {
        setLegRoutes(routes.filter(Boolean) as RouteDetails[]);
        setIsLoadingLegs(false);
      }
    }
    fetchLegRoutes();
    return () => { isMounted = false; };
  }, [data.additionalLegs]);

  // Calculate prices for additional legs based on actual route distances
  const legPrices = useMemo(() => {
    const additionalLegsCount = (data.additionalLegs || []).length;
    if (legRoutes.length !== additionalLegsCount) return [];
    return legRoutes.map(legRoute =>
      calculatePrice(legRoute.distance, legRoute.duration, data.selectedVehicle || "sedan") || 0
    );
  }, [legRoutes, data.additionalLegs, data.selectedVehicle, calculatePrice]);

  const grandTotal = basePrice + (legPrices?.reduce((a, b) => a + b, 0) || 0);

  useEffect(() => {
    if (!user) {
      router.push("/book/login");
    } else if (!data.pickup || !data.dropoff || !data.selectedVehicle) {
      router.push("/book");
    }
  }, [user, data.pickup, data.dropoff, data.selectedVehicle, router]);

  const handlePay = async () => {
    if (!route || !data.selectedVehicle || !user) {
      notify.error("Missing booking details. Please go back and review.");
      return;
    }

    setLoading(true);
    try {
      const bookingPayload = {
        pickup: data.pickup,
        dropoff: data.dropoff,
        pickupDate: data.pickupDate,
        pickupTime: data.pickupTime,
        vehicleType: data.selectedVehicle,
        distanceMiles: route.distance,
        durationMinutes: route.duration,
        isAirportPickup: data.isPickupAirport,
        flightNumber: data.flightNumber || undefined,
        specialRequests: data.specialRequests || undefined,
        clientName: user.fullName || user.email?.split("@")[0] || "Guest",
        clientEmail: user.email || "",
        clientPhone: user.phone || undefined,
        bookingForSomeoneElse: data.bookingForSomeoneElse,
        guestFirstName: data.guestFirstName || undefined,
        guestLastName: data.guestLastName || undefined,
        guestEmail: data.guestEmail || undefined,
        guestPhone: data.guestPhone || undefined,
        additionalLegs: data.additionalLegs.length > 0 ? data.additionalLegs.map((leg) => ({
          pickup: leg.pickup,
          dropoff: leg.dropoff,
          pickupDate: leg.pickupDate,
          pickupTime: leg.pickupTime,
          distanceMiles: leg.distanceMiles || 0,
          durationMinutes: leg.durationMinutes || 0,
        })) : undefined,
      };

      const booking = await bookingService.create(bookingPayload as any);
      notify.success("Booking request submitted!");

      sessionStorage.removeItem("wc_booking");

      router.push(`/booking-confirmed?reservation=${booking.reservationNumber}&booking_id=${booking.id}`);
    } catch (err: any) {
      notify.error(err.message || "Checkout failed");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.push("/book/details");
  };

  const handleEditVehicle = () => {
    router.push("/book");
  };

  const handleEditDetails = () => {
    router.push("/book/details");
  };

  const handleAddLeg = (leg: TripLeg) => {
    addLeg(leg);
  };

  const handleRemoveLeg = (index: number) => {
    removeLeg(index);
  };

  const handleUpdateLeg = (index: number, leg: TripLeg) => {
    updateLeg(index, leg);
  };

  if (!user || !data.pickup || !data.dropoff || !data.selectedVehicle || !route) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 pb-24">
        <CheckoutSummary
          pickup={data.pickup}
          dropoff={data.dropoff}
          pickupDate={data.pickupDate}
          pickupTime={data.pickupTime}
          vehicleType={data.selectedVehicle!}
          basePrice={basePrice}
          tax={tax}
          total={total}
          distanceMiles={route.distance}
          durationMinutes={route.duration}
          flightNumber={data.flightNumber}
          specialRequests={data.specialRequests}
          additionalLegs={data.additionalLegs || []}
          legPrices={legPrices || []}
          grandTotal={grandTotal}
          loading={loading}
          bookingForSomeoneElse={data.bookingForSomeoneElse}
          guestFirstName={data.guestFirstName}
          guestLastName={data.guestLastName}
          guestEmail={data.guestEmail}
          guestPhone={data.guestPhone}
          onPay={handlePay}
          onBack={handleBack}
          onEditVehicle={handleEditVehicle}
          onEditDetails={handleEditDetails}
          onAddLeg={handleAddLeg}
          onRemoveLeg={handleRemoveLeg}
          onUpdateLeg={handleUpdateLeg}
        />
      </div>
    </motion.div>
  );
}
