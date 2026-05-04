"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Users, Briefcase, Check, ChevronDown, Shield, Phone, MapPin, Clock, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useBookingStore } from "@/hooks/useBookingStore";
import { calculatePrice, getGatekeeperStatus } from "@/lib/pricing";
import { useRouteDetails } from "@/hooks/useRouteDetails";
import { format } from "date-fns";
import Image from "next/image";
import TermsModal from "@/components/booking/TermsModal";
import { notify } from "@/lib/notify";
import type { FleetVehicle } from "@/types";

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

  const { route, isLoading: isLoadingRoute, error: routeError } = useRouteDetails(pickup, dropoff);

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

  const sedanPrice = route ? calculatePrice(route.distance, route.duration, "sedan") : null;
  const suvPrice = route ? calculatePrice(route.distance, route.duration, "suv") : null;
  const gatekeeperStatus = useMemo(() => getGatekeeperStatus(pickupDate, pickupTime), [pickupDate, pickupTime]);

  const selectedPrice = selectedVehicle === "sedan" ? sedanPrice : selectedVehicle === "suv" ? suvPrice : null;
  const gratuity = selectedPrice ? selectedPrice * 0.2 : 0;
  const total = selectedPrice ? selectedPrice + gratuity : 0;

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

  const vehiclesWithPrices = vehicles.map((v) => ({
    ...v,
    price: v.type === "sedan" ? sedanPrice : suvPrice,
  }));

  return (
    <>
      {route && currentStep === 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-border bg-card p-4 sm:p-6 mb-6 sm:mb-10">
            {formattedDate && formattedTime && (
              <p className="text-sm sm:text-base font-display font-semibold text-foreground mb-2 sm:mb-3">
                {formattedDate} at {formattedTime} (EST)
              </p>
            )}
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
          </motion.div>
        )}

        <AnimatePresence>
          {currentStep === 0 && gatekeeperStatus === "urgent" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="rounded-lg border border-status-pending/30 bg-status-pending/5 px-4 sm:px-5 py-3 sm:py-4 mb-6 sm:mb-8"
            >
              <p className="text-xs sm:text-sm text-status-pending-fg font-body font-semibold">⚡ Within 12-hour window — dispatcher verification required at checkout</p>
            </motion.div>
          )}
          {currentStep === 0 && gatekeeperStatus === "emergency" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 sm:px-5 py-3 sm:py-4 mb-6 sm:mb-8"
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
              className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 sm:px-5 py-3 sm:py-4 mb-6 sm:mb-8 overflow-hidden"
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
                <p className="text-xs sm:text-sm text-muted-foreground font-body mt-1">All prices include estimated fees, tolls, and 20% gratuity</p>
              </div>

              <div className="space-y-3 sm:space-y-4 mb-8 sm:mb-10">
                {vehiclesWithPrices.map((v, i) => {
                  const isSelected = selectedVehicle === v.type;
                  const isExpanded = expandedVehicle === v.type;
                  const vGratuity = v.price ? v.price * 0.2 : 0;
                  const vTotal = v.price ? v.price + vGratuity : 0;

                  return (
                    <motion.div key={v.type} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.1 }}>
                      <button
                        onClick={() => {
                          setSelectedVehicle(v.type);
                          setExpandedVehicle(expandedVehicle === v.type ? null : v.type);
                        }}
                        className={`w-full rounded-xl border p-3 sm:p-5 text-left transition-all duration-300 ${
                          isSelected ? "border-primary/50 gold-glow bg-primary/5" : "border-border bg-card hover:border-primary/20"
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
                          <div className="w-full sm:w-32 h-24 sm:h-20 shrink-0 rounded-lg overflow-hidden bg-secondary/30 relative">
                            <Image src={v.image} alt={v.name} fill className="object-contain" />
                          </div>
                          <div className="flex items-start justify-between sm:contents">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-sm sm:text-base font-display font-semibold text-foreground">{v.name}</h3>
                              <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground font-body">
                                <span className="flex items-center gap-1">
                                  <Users className="h-3.5 w-3.5" />
                                  {v.passengers}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Briefcase className="h-3.5 w-3.5" />
                                  {v.luggage}
                                </span>
                              </div>
                              <p className="text-[11px] sm:text-xs text-muted-foreground font-body mt-1 hidden sm:block">{v.subtitle}</p>
                            </div>
                            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                              {v.price !== null ? (
                                <span className={`text-lg sm:text-xl font-display font-bold ${isSelected ? "text-primary" : "text-foreground"}`}>
                                  US${vTotal.toFixed(2)}
                                </span>
                              ) : (
                                <div className="h-6 w-20 sm:w-24 rounded bg-secondary animate-pulse" />
                              )}
                              <ChevronDown className={`h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                            </div>
                          </div>
                        </div>
                        <p className="text-[11px] text-muted-foreground font-body mt-2 sm:hidden">{v.subtitle}</p>
                      </button>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                            <div className="px-3 sm:px-5 py-3 sm:py-4 border-x border-b border-border rounded-b-xl bg-card/50 -mt-1">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
                                {v.features.map((f) => (
                                  <div key={f} className="flex items-center gap-2">
                                    <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                                    <span className="text-xs text-muted-foreground font-body">{f}</span>
                                  </div>
                                ))}
                              </div>
                              {v.price !== null && (
                                <div className="mt-3 sm:mt-4 pt-3 border-t border-border space-y-1.5">
                                  <div className="flex justify-between text-xs font-body">
                                    <span className="text-muted-foreground">Base fare</span>
                                    <span className="text-foreground">${v.price.toFixed(2)}</span>
                                  </div>
                                  <div className="flex justify-between text-xs font-body">
                                    <span className="text-muted-foreground">Gratuity (20%)</span>
                                    <span className="text-foreground">${vGratuity.toFixed(2)}</span>
                                  </div>
                                  <div className="flex justify-between text-xs font-body pt-1.5 border-t border-border">
                                    <span className="text-foreground font-semibold">Total</span>
                                    <span className="text-primary font-display font-bold text-base">${vTotal.toFixed(2)}</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
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
        <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-background/90 backdrop-blur-md z-40">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
            <button onClick={() => setShowTerms(true)} className="text-[11px] sm:text-xs text-muted-foreground font-body hover:text-foreground transition-colors underline underline-offset-4" type="button">
              Terms & conditions
            </button>
            <Button variant="hero" size="lg" className="gap-2 px-6 sm:px-10" disabled={!selectedVehicle || !!routeError} onClick={handleVehicleContinue}>
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
                  <h3 className="text-sm font-display font-semibold text-foreground mb-1">Route Preview</h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground font-body">
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
              <iframe
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://www.google.com/maps/embed/v1/directions?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY}&origin=${encodeURIComponent(pickup)}&destination=${encodeURIComponent(dropoff)}&mode=driving`}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
