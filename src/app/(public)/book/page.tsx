"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Users, Briefcase, Check, ChevronDown, Shield, Phone, MapPin, Clock, X, Edit2, Save, Car } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useBookingStore } from "@/hooks/useBookingStore";
import { getGatekeeperStatus } from "@/lib/pricing";
import { useRouteDetails } from "@/hooks/useRouteDetails";
import { usePricing } from "@/hooks/usePricing";
import { format } from "date-fns";
import Image from "next/image";
import TermsModal from "@/components/booking/TermsModal";
import VehiclePricingDisplay from "@/components/booking/VehiclePricingDisplay";
import { notify } from "@/lib/notify";
import type { FleetVehicle } from "@/types";
import { useLoadScript } from "@react-google-maps/api";
import { Input } from "@/components/ui/input";

const libraries: ("places")[] = ["places"];

const STEPS = ["Service Class", "Pickup Info", "Log In", "Payment", "Checkout"] as const;

export default function BookingPage() {
  const router = useRouter();
  const { data, update } = useBookingStore();
  const { pickup, dropoff, isPickupAirport, pickupDate, pickupTime } = data;

  // Redirect to homepage if no pickup/dropoff selected
  useEffect(() => {
    if (!pickup || !dropoff) {
      router.push("/");
    }
  }, [pickup, dropoff, router]);

  const [currentStep] = useState(0);
  const [selectedVehicle, setSelectedVehicle] = useState<"sedan" | "suv" | null>(data.selectedVehicle);
  const [expandedVehicle, setExpandedVehicle] = useState<"sedan" | "suv" | null>(null);
  const [showTerms, setShowTerms] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [fleetVehicles, setFleetVehicles] = useState<FleetVehicle[]>([]);
  const [loadingFleet, setLoadingFleet] = useState(true);
  const [isEditingTrip, setIsEditingTrip] = useState(false);
  const [editPickup, setEditPickup] = useState(pickup);
  const [editDropoff, setEditDropoff] = useState(dropoff);
  const [editDate, setEditDate] = useState(pickupDate);
  const [editTime, setEditTime] = useState(pickupTime);
  const pickupInputRef = useRef<HTMLInputElement>(null);
  const dropoffInputRef = useRef<HTMLInputElement>(null);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || "",
    libraries,
  });

  const { route, isLoading: isLoadingRoute, error: routeError } = useRouteDetails(pickup, dropoff);
  const { calculatePrice, getTaxPercent, loading: pricingLoading, error: pricingError } = usePricing();

  // Show loading state while redirecting
  if (!pickup || !dropoff) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">Redirecting...</p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    const fetchFleet = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://wc-backend-ayx0.onrender.com/api/v1"}/fleet`, {
          credentials: "include"
        });
        if (response.ok) {
          const data = await response.json();
          setFleetVehicles(data.filter((v: FleetVehicle) => v.status === "available"));
        }
      } catch (error) {
        console.error("Error fetching fleet:", error);
      } finally {
        setLoadingFleet(false);
      }
    };
    fetchFleet();
  }, []);

  const vehiclesByType = useMemo(() => {
    const grouped: Record<string, FleetVehicle[]> = { sedan: [], suv: [] };
    fleetVehicles.forEach((v) => {
      if (grouped[v.vehicleType]) {
        grouped[v.vehicleType].push(v);
      }
    });
    return grouped;
  }, [fleetVehicles]);

  const vehicles = useMemo(() => {
    const result = [];
    if (vehiclesByType.sedan.length > 0) {
      const sedan = vehiclesByType.sedan[0];
      result.push({
        type: "sedan" as const,
        name: "Business Class",
        subtitle: `${sedan.make} ${sedan.model} or similar`,
        passengers: sedan.passengerCapacity || 3,
        luggage: sedan.luggageCapacity || 2,
        image: sedan.imageUrl || "/assets/sedan-profile.png",
        features: ["Leather interior", "Bottled water", "WiFi available", "Privacy partition", "Professional chauffeur"],
      });
    }
    if (vehiclesByType.suv.length > 0) {
      const suv = vehiclesByType.suv[0];
      result.push({
        type: "suv" as const,
        name: "Business SUV",
        subtitle: `${suv.make} ${suv.model} or similar`,
        passengers: suv.passengerCapacity || 5,
        luggage: suv.luggageCapacity || 5,
        image: suv.imageUrl || "/assets/suv-profile.png",
        features: ["Extended legroom", "Extra luggage capacity", "Bottled water", "Executive seating", "Professional chauffeur"],
      });
    }
    return result;
  }, [vehiclesByType]);

  const sedanPrice = route && !pricingLoading ? calculatePrice(route.distance, route.duration, "sedan") : null;
  const suvPrice = route && !pricingLoading ? calculatePrice(route.distance, route.duration, "suv") : null;
  const gatekeeperStatus = useMemo(() => getGatekeeperStatus(pickupDate, pickupTime), [pickupDate, pickupTime]);

  const selectedPrice = selectedVehicle === "sedan" ? sedanPrice : selectedVehicle === "suv" ? suvPrice : null;
  const taxPercent = selectedVehicle ? getTaxPercent(selectedVehicle) / 100 : 0.2;
  const tax = selectedPrice ? selectedPrice * taxPercent : 0;
  const total = selectedPrice ? selectedPrice + tax : 0;

  const formattedDate = pickupDate ? format(new Date(pickupDate + "T00:00:00"), "EEE, MMM d, yyyy") : null;
  const formattedTime = pickupTime ? format(new Date(`2000-01-01T${pickupTime}`), "h:mm a") : null;
  const estimatedArrival =
    route && pickupTime
      ? (() => {
          const [h, m] = pickupTime.split(":").map(Number);
          const arrival = new Date(2000, 0, 1, h, m + route.duration);
          return format(arrival, "h:mm a");
        })()
      : null;

  const handleVehicleContinue = () => {
    if (!selectedVehicle) return;
    if (route && route.distance < 0.1) {
      notify.error("Pickup and dropoff locations are too close or identical. Please select different locations.");
      return;
    }
    update({ selectedVehicle });
    router.push("/book/details");
  };

  const handleSaveEdit = () => {
    if (!editPickup || !editDropoff || !editDate || !editTime) {
      notify.error("Please fill in all fields");
      return;
    }
    update({ 
      pickup: editPickup, 
      dropoff: editDropoff, 
      pickupDate: editDate, 
      pickupTime: editTime 
    });
    setIsEditingTrip(false);
    notify.success("Trip details updated");
  };

  const handleCancelEdit = () => {
    setEditPickup(pickup);
    setEditDropoff(dropoff);
    setEditDate(pickupDate);
    setEditTime(pickupTime);
    setIsEditingTrip(false);
  };

  useEffect(() => {
    if (!isLoaded || !isEditingTrip) return;

    const setupAutocomplete = (input: HTMLInputElement | null, setter: (value: string) => void) => {
      if (!input || !window.google) return;
      
      const autocomplete = new window.google.maps.places.Autocomplete(input, {
        fields: ["formatted_address"],
      });

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (place.formatted_address) {
          setter(place.formatted_address);
        }
      });
    };

    setupAutocomplete(pickupInputRef.current, setEditPickup);
    setupAutocomplete(dropoffInputRef.current, setEditDropoff);
  }, [isLoaded, isEditingTrip]);

  const vehiclesWithPrices = vehicles.map((v) => ({
    ...v,
    price: v.type === "sedan" ? sedanPrice : suvPrice,
  }));

  return (
    <div className="px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      {route && currentStep === 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-xl p-6 sm:p-8 mb-6 sm:mb-10 shadow-glass hover:shadow-blue transition-all duration-300">
            <div className="flex items-start justify-between mb-2 sm:mb-3">
              {!isEditingTrip ? (
                <div className="flex-1">
                  {formattedDate && formattedTime && (
                    <p className="text-sm sm:text-base font-display font-semibold text-foreground">
                      {formattedDate} at {formattedTime} (EST)
                    </p>
                  )}
                </div>
              ) : (
                <div className="flex-1 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="date"
                      value={editDate}
                      onChange={(e) => setEditDate(e.target.value)}
                      className="h-9 text-xs"
                    />
                    <Input
                      type="time"
                      value={editTime}
                      onChange={(e) => setEditTime(e.target.value)}
                      className="h-9 text-xs"
                    />
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2 ml-3">
                {!isEditingTrip ? (
                  <button
                    onClick={() => setIsEditingTrip(true)}
                    className="p-2 rounded-lg glass-card hover:shadow-blue transition-all duration-300 group hover:scale-105"
                    title="Edit trip details"
                  >
                    <Edit2 className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleCancelEdit}
                      className="p-2 rounded-lg glass-card hover:shadow-glass transition-all duration-300 hover:scale-105"
                      title="Cancel"
                    >
                      <X className="h-4 w-4 text-muted-foreground" />
                    </button>
                    <button
                      onClick={handleSaveEdit}
                      className="p-2 rounded-lg bg-blue-gradient shadow-blue hover:scale-105 transition-all duration-300"
                      title="Save changes"
                    >
                      <Save className="h-4 w-4 text-white" />
                    </button>
                  </>
                )}
              </div>
            </div>
            {!isEditingTrip ? (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-sm font-body">
                  <span className="text-primary truncate">{pickup}</span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 hidden sm:block" />
                  <span className="text-muted-foreground text-xs sm:hidden">→</span>
                  <span className="text-muted-foreground truncate">{dropoff}</span>
                </div>
                <div className="flex items-center gap-3 sm:gap-4 mt-2 text-xs text-muted-foreground font-body">
                  {estimatedArrival && <span>Est. arrival {estimatedArrival}</span>}
                  <span>•</span>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-primary" />
                    <span>{route.distance.toFixed(1)} mi</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-primary" />
                    <span>{route.duration} min</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <div>
                  <label className="text-xs text-muted-foreground font-body mb-1 block">Pickup Location</label>
                  <Input
                    ref={pickupInputRef}
                    value={editPickup}
                    onChange={(e) => setEditPickup(e.target.value)}
                    placeholder="Enter pickup address"
                    className="h-9 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground font-body mb-1 block">Dropoff Location</label>
                  <Input
                    ref={dropoffInputRef}
                    value={editDropoff}
                    onChange={(e) => setEditDropoff(e.target.value)}
                    placeholder="Enter dropoff address"
                    className="h-9 text-sm"
                  />
                </div>
              </div>
            )}
            {!isEditingTrip && (
              <button
                onClick={() => setShowMapModal(true)}
                className="mt-3 w-full rounded-lg overflow-hidden border border-border bg-secondary/30 h-32 relative group cursor-pointer hover:border-primary/40 transition-colors"
              >
                <iframe
                  width="100%"
                  height="100%"
                  style={{ border: 0, pointerEvents: 'none' }}
                  loading="lazy"
                  src={`https://www.google.com/maps/embed/v1/directions?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY}&origin=${encodeURIComponent(pickup)}&destination=${encodeURIComponent(dropoff)}&mode=driving`}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                  <span className="text-xs font-body text-white bg-black/60 px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    Click to view larger
                  </span>
                </div>
              </button>
            )}
          </motion.div>
        )}

        <AnimatePresence>
          {currentStep === 0 && gatekeeperStatus === "urgent" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="glass-card rounded-xl border-status-pending/30 px-5 sm:px-6 py-4 sm:py-5 mb-6 sm:mb-8 shadow-glass"
            >
              <p className="text-xs sm:text-sm text-status-pending-fg font-body font-semibold">⚡ Within 12-hour window — dispatcher verification required at checkout</p>
            </motion.div>
          )}
          {currentStep === 0 && gatekeeperStatus === "emergency" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="glass-card rounded-xl border-destructive/30 px-5 sm:px-6 py-4 sm:py-5 mb-6 sm:mb-8 shadow-glass"
            >
              <p className="text-xs sm:text-sm text-destructive font-body font-semibold mb-2">🚨 Under 4 hours — please call dispatch directly</p>
              <p className="text-[11px] text-destructive/80 font-body mb-3">
                For bookings within 4 hours, we require direct coordination with our dispatch team to ensure availability and timely service.
              </p>
              <a href="tel:+15714351832">
                <Button variant="destructive" size="sm" className="gap-2">
                  <Phone className="h-3.5 w-3.5" />
                  Call (571) 435-1832
                </Button>
              </a>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {currentStep === 0 && routeError && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="glass-card rounded-xl border-destructive/30 px-5 sm:px-6 py-4 sm:py-5 mb-6 sm:mb-8 overflow-hidden shadow-glass"
            >
              <p className="text-xs sm:text-sm text-destructive font-body font-semibold">🚨 Route Not Found</p>
              <p className="text-[10px] sm:text-xs text-destructive/80 font-body mt-1">
                We couldn't calculate a driving route between your pickup and drop-off locations. Please return to the homepage and select precise physical addresses.
              </p>
              <Link href="/">
                <Button variant="destructive" size="sm" className="mt-3 gap-2">
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Edit Route
                </Button>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {currentStep === 0 && gatekeeperStatus !== "emergency" && (
            <motion.div key="step0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: -20 }}>
              <div className="mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-display font-bold text-foreground">Select a vehicle class</h2>
                <p className="text-xs sm:text-sm text-muted-foreground font-body mt-1">All prices include estimated fees, tolls, and tax</p>
              </div>

              {pricingError && (
                <div className="mb-4 p-4 rounded-lg border border-destructive/30 bg-destructive/10">
                  <p className="text-sm text-destructive font-semibold">⚠️ Pricing Error</p>
                  <p className="text-xs text-destructive/80 mt-1">{pricingError}</p>
                </div>
              )}

              {vehicles.length === 0 && !loadingFleet && (
                <div className="mb-4 p-6 rounded-lg border border-border bg-card text-center">
                  <Car className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-foreground">No Vehicles Available</p>
                  <p className="text-xs text-muted-foreground mt-1">All vehicles are currently in use. Please try again later or contact us directly.</p>
                  <a href="tel:+15714351832" className="mt-3 inline-block">
                    <Button variant="outline" size="sm" className="gap-2">
                      <Phone className="h-3.5 w-3.5" />
                      Call (571) 435-1832
                    </Button>
                  </a>
                </div>
              )}

              <div className="space-y-3 sm:space-y-4 mb-8 sm:mb-10">
                {vehicles.map((v, i) => {
                  const isSelected = selectedVehicle === v.type;
                  const isExpanded = expandedVehicle === v.type;

                  return (
                    <VehiclePricingDisplay
                      key={v.type}
                      vehicleType={v.type}
                      name={v.name}
                      subtitle={v.subtitle}
                      passengers={v.passengers}
                      luggage={v.luggage}
                      image={v.image}
                      features={v.features}
                      distance={route?.distance || 0}
                      duration={route?.duration || 0}
                      isSelected={isSelected}
                      isExpanded={isExpanded}
                      onSelect={() => setSelectedVehicle(v.type)}
                      onToggleExpand={() => setExpandedVehicle(expandedVehicle === v.type ? null : v.type)}
                    />
                  );
                })}
              </div>

              <div className="flex items-center gap-2 mb-4">
                <Shield className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <p className="text-[10px] sm:text-[11px] text-muted-foreground font-body">$95/hr wait-time fee applies for delays beyond 15 minutes</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      {currentStep === 0 && gatekeeperStatus !== "emergency" && (
        <div className="fixed bottom-0 left-0 right-0 glass-strong border-t border-primary/20 z-40 shadow-glass">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5 flex items-center justify-between">
            <button onClick={() => setShowTerms(true)} className="text-xs sm:text-sm text-muted-foreground font-body hover:text-primary transition-colors underline underline-offset-4 hover:scale-105 transition-all duration-300" type="button">
              Terms & conditions
            </button>
            <Button 
              size="lg" 
              className="gap-2 px-8 sm:px-12 bg-blue-gradient shadow-blue hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100" 
              disabled={!selectedVehicle || !!routeError} 
              onClick={handleVehicleContinue}
            >
              Continue
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
      {showTerms && (
        <TermsModal onClose={() => setShowTerms(false)} />
      )}

      <AnimatePresence>
        {showMapModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowMapModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-4xl h-[80vh] rounded-xl overflow-hidden border border-border bg-background shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute top-0 left-0 right-0 z-10 glass-frosted border-b border-border p-4 flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-display font-semibold text-white mb-1">Route Preview</h3>
                  <div className="flex items-center gap-2 text-xs text-[#09adff] font-body">
                    <span className="truncate">{pickup}</span>
                    <ArrowRight className="h-3 w-3 shrink-0" />
                    <span className="truncate">{dropoff}</span>
                  </div>
                </div>
                <button
                  onClick={() => setShowMapModal(false)}
                  className="ml-4 p-2 rounded-lg hover:bg-secondary/80 transition-colors"
                >
                  <X className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>
              <div className="pt-20 h-full">
                <iframe
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                  src={`https://www.google.com/maps/embed/v1/directions?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY}&origin=${encodeURIComponent(pickup)}&destination=${encodeURIComponent(dropoff)}&mode=driving`}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
