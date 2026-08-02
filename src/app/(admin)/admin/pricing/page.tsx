"use client";
import { useState, useEffect, useRef } from "react";
import { Loader2, Save, DollarSign, Calculator, MapPin, Calendar, Clock, Car, ArrowRight, AlertCircle, CheckCircle2, Check } from "lucide-react";
import { toast } from "sonner";
import { pricingService, fleetService } from "@/lib/services";
import { useRouteDetails } from "@/hooks/useRouteDetails";
import { usePricing } from "@/hooks/usePricing";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { format, addDays, parseISO } from "date-fns";
import DatePicker from "@/components/ui/date-picker";
import TimePicker from "@/components/ui/time-picker";
import LocationInput from "@/components/booking/LocationInput";
import { PRICING_CONSTANTS } from "@/lib/pricingEstimate";

interface FlatZone {
  id: string;
  name: string;
  code: string;
  sedanPrice: number;
  suvPrice: number;
  radiusMiles: number;
  isActive: boolean;
}

interface FleetVehicle {
  id: string;
  vehicleType: string;
  make: string;
  model: string;
  plate: string | null;
  color: string | null;
  status: string;
}

// The pricing engine (calculateAdaptiveFareCents in wc-backend-1/src/lib/
// pricing.ts, mirrored on this side by estimateFare in
// src/lib/pricingEstimate.ts) uses fixed, verified constants - it does not
// read the pricing_config/vehicle_pricing tables. The "Live Pricing Formula"
// card below displays those real constants directly from pricingEstimate.ts
// (so it can never drift from what customers are actually charged) instead
// of an editable form backed by database rows that no longer affect price.
// The "Zones" section further below is a separate, pre-existing feature
// (radius-based flat fares) that was never wired into price calculation -
// left as-is, out of scope for this page's pricing-accuracy fix.
export default function AdminPricingPage() {
  const [activeTab, setActiveTab] = useState<"config" | "calculator">("config");
  const [zones, setZones] = useState<FlatZone[]>([]);
  const [vehicles, setVehicles] = useState<FleetVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Automatic gratuity - see backend lib/gratuity.ts. Applied once to a
  // trip's combined subtotal (never per leg, never touching base fare/
  // mileage/duration/minimum-fare/demand/$5-rounding). Off by default
  // (0%) until explicitly turned on here. gratuityDraft holds the
  // in-progress edit; gratuitySaved is what's actually persisted, used to
  // detect unsaved changes and to reset "Cancel".
  const [gratuitySaved, setGratuitySaved] = useState<{ enabled: boolean; percent: number } | null>(null);
  const [gratuityDraft, setGratuityDraft] = useState<{ enabled: boolean; percent: number }>({ enabled: false, percent: 0 });
  const [gratuityLoading, setGratuityLoading] = useState(true);
  const [gratuitySaving, setGratuitySaving] = useState(false);
  const gratuityDirty =
    !!gratuitySaved && (gratuityDraft.enabled !== gratuitySaved.enabled || gratuityDraft.percent !== gratuitySaved.percent);

  // Calculator state
  const [calcPickup, setCalcPickup] = useState("");
  const [calcDropoff, setCalcDropoff] = useState("");
  const [calcDate, setCalcDate] = useState("");
  const [calcTime, setCalcTime] = useState("");
  const [calcVehicle, setCalcVehicle] = useState<string>("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [shouldFetchRoute, setShouldFetchRoute] = useState(false);
  const [vehiclePrices, setVehiclePrices] = useState<Record<string, { basePrice: number; gratuity: number; total: number; quoteId: string } | null>>({});
  const [loadingVehiclePrices, setLoadingVehiclePrices] = useState<Record<string, boolean>>({});

  const { route, isLoading: routeLoading, error: routeError } = useRouteDetails(
    shouldFetchRoute ? calcPickup : "",
    shouldFetchRoute ? calcDropoff : ""
  );

  const { getAuthoritativeQuote } = usePricing();

  useEffect(() => {
    loadPricingData();
    loadGratuitySettings();
  }, []);

  // Close date/time pickers when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.date-picker-container') && !target.closest('input[type="text"]')) {
        setShowDatePicker(false);
        setShowTimePicker(false);
      }
    };

    if (showDatePicker || showTimePicker) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showDatePicker, showTimePicker]);



  const loadPricingData = async () => {
    setLoading(true);
    try {
      const [zoneData, fleetData] = await Promise.all([
        pricingService.getZones().catch(() => []),
        fleetService.getAll().catch(() => []),
      ]);

      const parsedZones = zoneData.map((z: any) => ({
        ...z,
        sedanPrice: parseFloat(z.sedanPrice),
        suvPrice: parseFloat(z.suvPrice),
        radiusMiles: parseFloat(z.radiusMiles),
      }));

      setZones(parsedZones);
      setVehicles(fleetData);
    } catch (error: any) {
      toast.error(error.message || "Failed to load pricing data");
    } finally {
      setLoading(false);
    }
  };

  const loadGratuitySettings = async () => {
    setGratuityLoading(true);
    try {
      const settings = await pricingService.getGratuitySettings();
      setGratuitySaved(settings);
      setGratuityDraft(settings);
    } catch (error: any) {
      toast.error(error.message || "Failed to load gratuity settings");
    } finally {
      setGratuityLoading(false);
    }
  };

  const saveGratuitySettings = async () => {
    setGratuitySaving(true);
    try {
      const updated = await pricingService.updateGratuitySettings(gratuityDraft);
      setGratuitySaved(updated);
      setGratuityDraft(updated);
      // Invalidate any already-calculated results on the Calculator tab -
      // they were computed under the OLD gratuity setting and would
      // otherwise keep showing a stale gratuity figure that contradicts the
      // setting just saved (vehiclePrices lives on this page component, not
      // the Calculator tab, so it survives a tab switch and would not
      // recompute on its own). Mirrors clearCalculator()'s reset, but keeps
      // the entered trip details so the admin only has to press Calculate
      // again, not re-enter the whole form.
      setVehiclePrices({});
      setShouldFetchRoute(false);
      toast.success("Gratuity settings saved");
    } catch (error: any) {
      toast.error(error.message || "Failed to save gratuity settings");
    } finally {
      setGratuitySaving(false);
    }
  };

  const saveZone = async (zone: FlatZone) => {
    setSaving(true);
    try {
      await pricingService.updateZone(zone.id, {
        sedanPrice: zone.sedanPrice,
        suvPrice: zone.suvPrice,
        radiusMiles: zone.radiusMiles,
        isActive: zone.isActive,
      });
      toast.success(`${zone.name} zone saved`);
    } catch (error: any) {
      toast.error(error.message || "Failed to save zone");
    } finally {
      setSaving(false);
    }
  };

  const updateZone = (id: string, field: keyof FlatZone, value: number | boolean) => {
    setZones((prev) =>
      prev.map((z) => (z.id === id ? { ...z, [field]: value } : z))
    );
  };

  const validateCalculator = (): boolean => {
    const errors: Record<string, string> = {};

    if (!calcPickup.trim()) {
      errors.pickup = "Pickup location is required";
    }

    if (!calcDropoff.trim()) {
      errors.dropoff = "Dropoff location is required";
    }

    if (calcPickup.trim() && calcDropoff.trim() && calcPickup.toLowerCase() === calcDropoff.toLowerCase()) {
      errors.dropoff = "Dropoff must be different from pickup";
    }

    if (!calcDate) {
      errors.date = "Date is required";
    } else {
      const selectedDate = new Date(calcDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        errors.date = "Date cannot be in the past";
      }
    }

    if (!calcTime) {
      errors.time = "Time is required";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCalculate = () => {
    if (!validateCalculator()) {
      toast.error("Please fill in all required fields");
      return;
    }
    // Reset route first to ensure fresh calculation
    setShouldFetchRoute(false);
    setTimeout(() => setShouldFetchRoute(true), 0);
  };

  const clearCalculator = () => {
    setCalcPickup("");
    setCalcDropoff("");
    setCalcDate("");
    setCalcTime("");
    setCalcVehicle("");
    setValidationErrors({});
    setShouldFetchRoute(false);
  };

  // Calculate prices for all vehicles when route is available
  useEffect(() => {
    if (!route || !shouldFetchRoute || vehicles.length === 0) {
      setVehiclePrices({});
      return;
    }

    let isActive = true;

    const calculateAllPrices = async () => {
      const newPrices: Record<string, { basePrice: number; gratuity: number; total: number; quoteId: string } | null> = {};
      const newLoadingStates: Record<string, boolean> = {};

      // Set all to loading
      vehicles.forEach(vehicle => {
        newLoadingStates[vehicle.id] = true;
      });
      setLoadingVehiclePrices(newLoadingStates);

      // Calls the same backend-authoritative POST /pricing/calculate every
      // real quote/booking/checkout uses (see usePricing.ts's
      // getAuthoritativeQuote) - never the client-side estimate. This is
      // what makes this calculator immediately reflect the saved admin
      // gratuity toggle/percentage instead of a stale, disconnected number.
      for (const vehicle of vehicles) {
        if (!isActive) break;

        try {
          const quote = await getAuthoritativeQuote({
            vehicleType: vehicle.vehicleType as "sedan" | "suv",
            vehicleId: vehicle.id,
            distanceMiles: route.distance,
            durationMinutes: route.duration,
          });
          const leg = quote.legs[0];

          newPrices[vehicle.id] = leg && {
            basePrice: leg.basePrice,
            gratuity: leg.gratuity,
            total: quote.combinedTotal,
            quoteId: quote.quoteId,
          };
        } catch (error) {
          console.error(`Error calculating price for vehicle ${vehicle.id}:`, error);
          newPrices[vehicle.id] = null;
        }

        newLoadingStates[vehicle.id] = false;
      }

      if (isActive) {
        setVehiclePrices(newPrices);
        setLoadingVehiclePrices(newLoadingStates);
      }
    };

    calculateAllPrices();

    return () => {
      isActive = false;
    };
  }, [route, shouldFetchRoute, vehicles.length, getAuthoritativeQuote]);

  const calculatedPrice = calcVehicle && vehiclePrices[calcVehicle] ? vehiclePrices[calcVehicle] : null;

  const minDate = format(new Date(), "yyyy-MM-dd");
  const maxDate = format(addDays(new Date(), 365), "yyyy-MM-dd");

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <DollarSign className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-display font-bold text-foreground">Pricing Control Panel</h1>
        </div>
        <p className="text-sm text-muted-foreground">Manage rates, vehicle-specific pricing & test calculations</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border">
        <button
          onClick={() => setActiveTab("config")}
          className={`px-4 py-2 text-sm font-medium transition-colors relative ${
            activeTab === "config" ? "text-primary" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Configuration
          {activeTab === "config" && (
            <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("calculator")}
          className={`px-4 py-2 text-sm font-medium transition-colors relative ${
            activeTab === "calculator" ? "text-primary" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Pricing Calculator
          {activeTab === "calculator" && (
            <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
          )}
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : activeTab === "calculator" ? (
        <div className="max-w-4xl space-y-6">
          <div className="glass-card rounded-xl p-6 shadow-glass">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-display font-semibold text-foreground">Test Pricing Calculator</h3>
              </div>
              {(calcPickup || calcDropoff || calcDate || calcTime || calcVehicle) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearCalculator}
                  className="gap-2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                  Clear All
                </Button>
              )}
            </div>
            <p className="text-sm text-muted-foreground mb-6">Enter trip details to calculate pricing and test your configurations</p>

            <div className="space-y-4">
              {/* Location Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs flex items-center gap-1.5 mb-2">
                    <MapPin className="h-3.5 w-3.5 text-primary" />
                    Pickup Location *
                  </Label>
                  <LocationInput
                    placeholder="Enter pickup address"
                    value={calcPickup}
                    onChange={(value) => {
                      setCalcPickup(value);
                      if (validationErrors.pickup) {
                        setValidationErrors(prev => {
                          const updated = { ...prev };
                          delete updated.pickup;
                          return updated;
                        });
                      }
                    }}
                    icon="pickup"
                    light
                  />
                  {validationErrors.pickup && (
                    <div className="flex items-center gap-1 mt-1 text-xs text-destructive">
                      <AlertCircle className="h-3 w-3" />
                      {validationErrors.pickup}
                    </div>
                  )}
                </div>
                <div>
                  <Label className="text-xs flex items-center gap-1.5 mb-2">
                    <MapPin className="h-3.5 w-3.5 text-primary" />
                    Dropoff Location *
                  </Label>
                  <LocationInput
                    placeholder="Enter dropoff address"
                    value={calcDropoff}
                    onChange={(value) => {
                      setCalcDropoff(value);
                      if (validationErrors.dropoff) {
                        setValidationErrors(prev => {
                          const updated = { ...prev };
                          delete updated.dropoff;
                          return updated;
                        });
                      }
                    }}
                    icon="dropoff"
                    light
                  />
                  {validationErrors.dropoff && (
                    <div className="flex items-center gap-1 mt-1 text-xs text-destructive">
                      <AlertCircle className="h-3 w-3" />
                      {validationErrors.dropoff}
                    </div>
                  )}
                </div>
              </div>

              {/* Date, Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <Label className="text-xs flex items-center gap-1.5 mb-2">
                    <Calendar className="h-3.5 w-3.5 text-primary" />
                    Date *
                  </Label>
                  <div className="relative">
                    <Input
                      type="text"
                      value={calcDate ? format(parseISO(calcDate), "MMM d, yyyy") : ""}
                      onClick={() => setShowDatePicker(!showDatePicker)}
                      readOnly
                      placeholder="Select date"
                      className={`h-10 cursor-pointer ${validationErrors.date ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                    />
                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  </div>
                  {validationErrors.date && (
                    <div className="flex items-center gap-1 mt-1 text-xs text-destructive">
                      <AlertCircle className="h-3 w-3" />
                      {validationErrors.date}
                    </div>
                  )}
                  {showDatePicker && (
                    <div className="absolute z-50 mt-2 date-picker-container">
                      <DatePicker
                        value={calcDate}
                        onChange={(date) => {
                          setCalcDate(date);
                          setShowDatePicker(false);
                          if (validationErrors.date) {
                            setValidationErrors(prev => {
                              const updated = { ...prev };
                              delete updated.date;
                              return updated;
                            });
                          }
                        }}
                        minDate={minDate}
                        maxDate={maxDate}
                      />
                    </div>
                  )}
                </div>
                <div className="relative">
                  <Label className="text-xs flex items-center gap-1.5 mb-2">
                    <Clock className="h-3.5 w-3.5 text-primary" />
                    Time *
                  </Label>
                  <div className="relative">
                    <Input
                      type="text"
                      value={calcTime && calcTime.includes(':') ? (() => {
                        try {
                          const timeWithSeconds = calcTime.split(':').length === 2 ? `${calcTime}:00` : calcTime;
                          return format(new Date(`2000-01-01T${timeWithSeconds}`), "h:mm a");
                        } catch {
                          return "";
                        }
                      })() : ""}
                      onClick={() => setShowTimePicker(!showTimePicker)}
                      readOnly
                      placeholder="Select time"
                      className={`h-10 cursor-pointer ${validationErrors.time ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                    />
                    <Clock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  </div>
                  {validationErrors.time && (
                    <div className="flex items-center gap-1 mt-1 text-xs text-destructive">
                      <AlertCircle className="h-3 w-3" />
                      {validationErrors.time}
                    </div>
                  )}
                  {showTimePicker && (
                    <div className="absolute z-50 mt-2 date-picker-container">
                      <TimePicker
                        value={calcTime}
                        onChange={(time) => {
                          setCalcTime(time);
                          setShowTimePicker(false);
                          if (validationErrors.time) {
                            setValidationErrors(prev => {
                              const updated = { ...prev };
                              delete updated.time;
                              return updated;
                            });
                          }
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Calculate Button */}
              <div className="pt-2">
                <Button 
                  onClick={handleCalculate}
                  disabled={routeLoading || (shouldFetchRoute && routeLoading)}
                  className="w-full gap-2 bg-blue-gradient shadow-blue hover:scale-[1.02] transition-all duration-300"
                  size="lg"
                >
                  {(routeLoading && shouldFetchRoute) ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Calculating...
                    </>
                  ) : (
                    <>
                      <Calculator className="h-4 w-4" />
                      Calculate Price
                    </>
                  )}
                </Button>
              </div>

              {/* Route Details */}
              <AnimatePresence mode="wait">
                {routeLoading && shouldFetchRoute && (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="glass-card rounded-lg p-6 text-center"
                  >
                    <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
                    <p className="text-sm font-medium text-foreground">Calculating route and pricing...</p>
                    <p className="text-xs text-muted-foreground mt-1">This may take a few seconds</p>
                  </motion.div>
                )}
                {routeError && shouldFetchRoute && !routeLoading && (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="glass-card rounded-lg p-4 border border-destructive/30 bg-destructive/5"
                  >
                    <div className="flex items-center gap-2 text-sm font-semibold text-destructive mb-2">
                      <AlertCircle className="h-4 w-4" />
                      Route Calculation Failed
                    </div>
                    <p className="text-xs text-muted-foreground">{routeError}</p>
                    <p className="text-xs text-muted-foreground mt-2">Please check that the addresses are valid and try again.</p>
                  </motion.div>
                )}
                {route && calcPickup && calcDropoff && !routeLoading && !routeError && (
                  <motion.div
                    key="results"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    {/* Route Summary */}
                    <div className="glass-card rounded-lg p-4">
                      <div className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        Route Details
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                        <div>
                          <p className="text-xs text-muted-foreground">Distance</p>
                          <p className="font-semibold text-foreground">{route.distance.toFixed(2)} miles</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Duration</p>
                          <p className="font-semibold text-foreground">{route.duration} minutes</p>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground bg-secondary/50 rounded px-3 py-2">
                        <div className="flex items-start gap-2">
                          <MapPin className="h-3 w-3 text-primary mt-0.5 shrink-0" />
                          <div className="space-y-1">
                            <p><span className="font-semibold">From:</span> {calcPickup}</p>
                            <p><span className="font-semibold">To:</span> {calcDropoff}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Vehicle Pricing Cards */}
                    <div>
                      <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                        <Car className="h-4 w-4 text-primary" />
                        Available Vehicles & Pricing
                      </h4>
                      <div className="space-y-3">
                        {vehicles.filter(v => v.status === "available").length === 0 ? (
                          <div className="glass-card rounded-lg p-6 text-center">
                            <Car className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">No vehicles available</p>
                          </div>
                        ) : (
                          vehicles.filter(v => v.status === "available").map((vehicle) => {
                            const price = vehiclePrices[vehicle.id];
                            const isLoading = loadingVehiclePrices[vehicle.id];
                            const isSelected = calcVehicle === vehicle.id;

                            return (
                              <motion.div
                                key={vehicle.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`glass-card rounded-lg p-4 cursor-pointer transition-all duration-300 ${
                                  isSelected ? 'ring-2 ring-primary shadow-blue' : 'hover:shadow-glass'
                                }`}
                                onClick={() => setCalcVehicle(vehicle.id)}
                              >
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <h5 className="text-sm font-semibold text-foreground">
                                        {vehicle.make} {vehicle.model}
                                      </h5>
                                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                                        vehicle.vehicleType === 'sedan' 
                                          ? 'bg-blue-500/10 text-blue-500' 
                                          : 'bg-purple-500/10 text-purple-500'
                                      }`}>
                                        {vehicle.vehicleType.toUpperCase()}
                                      </span>
                                      {isSelected && (
                                        <Check className="h-4 w-4 text-primary" />
                                      )}
                                    </div>
                                    <p className="text-xs text-muted-foreground mb-2">
                                      {vehicle.plate ? `${vehicle.plate} • ` : ''}
                                      {vehicle.color || 'Premium'}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    {isLoading ? (
                                      <div className="flex items-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                        <span className="text-xs text-muted-foreground">Calculating...</span>
                                      </div>
                                    ) : price ? (
                                      <div>
                                        <p className="text-xs text-muted-foreground mb-1">Total Price</p>
                                        <p className="text-2xl font-bold text-primary">${price.total.toFixed(2)}</p>
                                        <p className="text-[10px] text-muted-foreground mt-1">
                                          Base: ${price.basePrice.toFixed(2)} + Gratuity: ${price.gratuity.toFixed(2)}
                                        </p>
                                      </div>
                                    ) : (
                                      <p className="text-xs text-muted-foreground">—</p>
                                    )}
                                  </div>
                                </div>
                              </motion.div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Selected Vehicle Price Breakdown */}
              <AnimatePresence>
                {calculatedPrice && calcVehicle && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="glass-strong rounded-xl p-6 shadow-blue"
                  >
                    <h4 className="text-base font-display font-semibold text-foreground mb-4 flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-primary" />
                      Selected Vehicle Price Breakdown
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Vehicle</span>
                        <span className="font-semibold text-foreground">
                          {vehicles.find(v => v.id === calcVehicle)?.make} {vehicles.find(v => v.id === calcVehicle)?.model}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Base Fare</span>
                        <span className="font-semibold text-foreground">${calculatedPrice.basePrice.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Gratuity</span>
                        <span className="font-semibold text-foreground">${calculatedPrice.gratuity.toFixed(2)}</span>
                      </div>
                      <div className="h-px bg-border" />
                      <div className="flex justify-between">
                        <span className="text-base font-semibold text-foreground">Total</span>
                        <span className="text-2xl font-display font-bold text-primary">${calculatedPrice.total.toFixed(2)}</span>
                      </div>

                      {/* This calculator now calls the real POST
                          /pricing/calculate (see getAuthoritativeQuote in
                          usePricing.ts), so it reflects the saved admin
                          gratuity toggle/percentage immediately, not a
                          disconnected client-side estimate. quoteId is the
                          same signed token a real checkout would carry -
                          shown for traceability only; this calculator never
                          creates a booking or charge with it. */}
                      <div className="pt-3 border-t border-border space-y-1">
                        <p className="text-xs text-muted-foreground flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary text-muted-foreground font-semibold">
                            Live quote
                          </span>
                          Using standard {vehicles.find(v => v.id === calcVehicle)?.vehicleType} pricing
                        </p>
                        <p className="text-[10px] text-muted-foreground font-mono break-all">
                          Quote ID: {calculatedPrice.quoteId}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Loading State */}
              {routeLoading && shouldFetchRoute && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  <span className="ml-2 text-sm text-muted-foreground">Calculating route...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Live Pricing Formula - read-only, sourced directly from
              src/lib/pricingEstimate.ts (the same constants the backend's
              calculateAdaptiveFareCents uses). This replaced an editable
              form backed by pricing_config/vehicle_pricing database rows -
              those tables are no longer read when computing a price, so an
              editable form here could only ever mislead an admin into
              thinking a save had an effect it didn't. See the file header
              comment above for the full explanation. */}
          <section>
            <h3 className="text-base font-display font-semibold text-foreground mb-1">Live Pricing Formula</h3>
            <p className="text-xs text-muted-foreground mb-4">
              total = round-to-nearest-${PRICING_CONSTANTS.roundToNearest}( max( minimum fare, (base + per-mile×distance + per-minute×duration) × (1 + {PRICING_CONSTANTS.demandCoefficient}×demand level) ) ) — read-only; this is what every quote, booking, and charge actually uses.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(["sedan", "suv"] as const).map((vehicleType) => (
                <div key={vehicleType} className="rounded-lg border border-border bg-card p-4 space-y-3">
                  <h4 className="text-sm font-display font-semibold text-foreground capitalize">
                    Business {vehicleType}
                  </h4>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-muted-foreground uppercase tracking-wide">Base fare</label>
                      <div className="w-full mt-0.5 bg-secondary border border-border rounded-md px-3 py-1.5 text-sm text-foreground">
                        ${PRICING_CONSTANTS.baseFare[vehicleType].toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] text-muted-foreground uppercase tracking-wide">Per mile</label>
                      <div className="w-full mt-0.5 bg-secondary border border-border rounded-md px-3 py-1.5 text-sm text-foreground">
                        ${PRICING_CONSTANTS.perMile[vehicleType].toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] text-muted-foreground uppercase tracking-wide">Per minute</label>
                      <div className="w-full mt-0.5 bg-secondary border border-border rounded-md px-3 py-1.5 text-sm text-foreground">
                        ${PRICING_CONSTANTS.perMinute[vehicleType].toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] text-muted-foreground uppercase tracking-wide">Minimum fare</label>
                      <div className="w-full mt-0.5 bg-primary/10 border border-primary/30 rounded-md px-3 py-1.5 text-sm font-semibold text-primary">
                        ${PRICING_CONSTANTS.minimumFare[vehicleType].toFixed(2)}
                      </div>
                    </div>
                  </div>

                  <div className="text-[11px] text-muted-foreground bg-secondary/50 rounded px-2 py-1.5">
                    Applies at every distance - not a short-trip/long-trip switch, and never overridden by a specific fleet vehicle.
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-lg border border-border bg-card p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] text-muted-foreground uppercase tracking-wide">Demand coefficient</label>
                <div className="text-sm text-foreground mt-0.5">{PRICING_CONSTANTS.demandCoefficient} per demand level</div>
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground uppercase tracking-wide">Default demand level</label>
                <div className="text-sm text-foreground mt-0.5">{PRICING_CONSTANTS.defaultDemandLevel} (no live demand signal exists yet - every quote uses this)</div>
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground uppercase tracking-wide">Rounding</label>
                <div className="text-sm text-foreground mt-0.5">Nearest ${PRICING_CONSTANTS.roundToNearest}</div>
              </div>
            </div>
          </section>

          {/* Automatic Gratuity - the only editable pricing control on this
              page; see backend lib/gratuity.ts. Applied once to a trip's
              combined subtotal, never per leg, never touching the formula
              above. Changing this takes effect for quotes issued AFTER
              saving - it never alters an already-issued quote or an
              existing booking. */}
          <section>
            <h3 className="text-base font-display font-semibold text-foreground mb-1">Automatic Gratuity</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Optional, applied once to a trip&apos;s total (not per stop) on top of the pricing formula above. Off by default. Changes only apply to quotes issued after saving - never to a quote a customer already accepted or a booking already created.
            </p>

            {gratuityLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading gratuity settings…
              </div>
            ) : (
              <div className="rounded-lg border border-border bg-card p-4 space-y-4 max-w-md">
                <div className="flex items-center justify-between">
                  <div>
                    <label htmlFor="gratuity-enabled" className="text-sm font-medium text-foreground">
                      Automatic gratuity
                    </label>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {gratuityDraft.enabled ? "On - added to every new quote" : "Off - no gratuity is added"}
                    </p>
                  </div>
                  <button
                    id="gratuity-enabled"
                    role="switch"
                    aria-checked={gratuityDraft.enabled}
                    onClick={() => setGratuityDraft((d) => ({ ...d, enabled: !d.enabled }))}
                    className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                      gratuityDraft.enabled ? "bg-primary" : "bg-secondary"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        gratuityDraft.enabled ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                <div>
                  <label htmlFor="gratuity-percent" className="text-[10px] text-muted-foreground uppercase tracking-wide">
                    Gratuity percentage
                  </label>
                  <div className="relative mt-0.5">
                    <input
                      id="gratuity-percent"
                      type="number"
                      min={0}
                      max={100}
                      step="0.1"
                      value={gratuityDraft.percent}
                      disabled={!gratuityDraft.enabled}
                      onChange={(e) => {
                        const raw = parseFloat(e.target.value);
                        const clamped = Number.isFinite(raw) ? Math.min(100, Math.max(0, raw)) : 0;
                        setGratuityDraft((d) => ({ ...d, percent: clamped }));
                      }}
                      className="w-full bg-secondary border border-border rounded-md px-3 py-1.5 pr-8 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <Button
                    onClick={saveGratuitySettings}
                    disabled={gratuitySaving || !gratuityDirty}
                    size="sm"
                    className="gap-1.5"
                  >
                    {gratuitySaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                    Save
                  </Button>
                  {gratuityDirty && (
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={gratuitySaving}
                      onClick={() => gratuitySaved && setGratuityDraft(gratuitySaved)}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            )}
          </section>

          {/* Flat Rate Zones */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-display font-semibold text-foreground mb-1">Flat Rate Zones</h3>
                <p className="text-xs text-muted-foreground">
                  Airport and special location flat rates
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {zones.map((zone) => (
                <div key={zone.id} className="rounded-lg border border-border bg-card p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-display font-semibold text-foreground">
                        {zone.name}
                      </h4>
                      <p className="text-xs text-muted-foreground font-mono">{zone.code}</p>
                    </div>
                    <button
                      onClick={() => saveZone(zone)}
                      disabled={saving}
                      className="inline-flex items-center gap-1.5 rounded-md bg-primary text-primary-foreground px-3 py-1.5 text-xs font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      title="Save zone configuration"
                    >
                      <Save className="h-3 w-3" />
                      Save
                    </button>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <label className="text-[10px] text-muted-foreground uppercase tracking-wide">
                        Sedan Price ($)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={zone.sedanPrice}
                        onChange={(e) =>
                          updateZone(zone.id, "sedanPrice", parseFloat(e.target.value) || 0)
                        }
                        className="w-full mt-0.5 bg-secondary border border-border rounded-md px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-muted-foreground uppercase tracking-wide">
                        SUV Price ($)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={zone.suvPrice}
                        onChange={(e) =>
                          updateZone(zone.id, "suvPrice", parseFloat(e.target.value) || 0)
                        }
                        className="w-full mt-0.5 bg-secondary border border-border rounded-md px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-muted-foreground uppercase tracking-wide">
                        Radius (miles)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={zone.radiusMiles}
                        onChange={(e) =>
                          updateZone(zone.id, "radiusMiles", parseFloat(e.target.value) || 0)
                        }
                        className="w-full mt-0.5 bg-secondary border border-border rounded-md px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={zone.isActive}
                        onChange={(e) => updateZone(zone.id, "isActive", e.target.checked)}
                        className="h-4 w-4 text-primary"
                      />
                      <label className="text-xs text-foreground">Active</label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
