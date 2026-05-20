"use client";
import { useState, useEffect, useRef } from "react";
import { Loader2, Save, DollarSign, Calculator, MapPin, Calendar, Clock, Car, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { pricingService, fleetService } from "@/lib/services";
import { useLoadScript } from "@react-google-maps/api";
import { useRouteDetails } from "@/hooks/useRouteDetails";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Link from "next/link";
import { X } from "lucide-react";

const libraries: ("places")[] = ["places"];

interface PricingConfig {
  id: string;
  vehicleType: string;
  baseRate: number;
  ratePerMile: number;
  ratePerMinute: number;
  taxPercent: number;
  waitTimeHourly: number;
}

interface FlatZone {
  id: string;
  name: string;
  code: string;
  sedanPrice: number;
  suvPrice: number;
  radiusMiles: number;
  isActive: boolean;
}

interface VehicleSpecificPricing {
  vehicleId: string;
  baseRate?: number;
  ratePerMile?: number;
  ratePerMinute?: number;
  taxPercent?: number;
}

export default function AdminPricingPage() {
  const [activeTab, setActiveTab] = useState<"config" | "calculator">("config");
  const [configs, setConfigs] = useState<PricingConfig[]>([]);
  const [zones, setZones] = useState<FlatZone[]>([]);
  const [vehicles, setVehicles] = useState<FleetVehicle[]>([]);
  const [vehiclePricing, setVehiclePricing] = useState<Record<string, VehicleSpecificPricing>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [usingFallback, setUsingFallback] = useState(false);
  const [initializing, setInitializing] = useState(false);

  // Calculator state
  const [calcPickup, setCalcPickup] = useState("");
  const [calcDropoff, setCalcDropoff] = useState("");
  const [calcDate, setCalcDate] = useState("");
  const [calcTime, setCalcTime] = useState("");
  const [calcVehicle, setCalcVehicle] = useState<string>("");
  const pickupRef = useRef<HTMLInputElement>(null);
  const dropoffRef = useRef<HTMLInputElement>(null);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || "",
    libraries,
  });

  const { route, isLoading: routeLoading } = useRouteDetails(
    calcPickup || "",
    calcDropoff || ""
  );

  useEffect(() => {
    loadPricingData();
  }, []);

  useEffect(() => {
    if (!isLoaded) return;

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

    setupAutocomplete(pickupRef.current, setCalcPickup);
    setupAutocomplete(dropoffRef.current, setCalcDropoff);
  }, [isLoaded]);

  const loadPricingData = async () => {
    setLoading(true);
    try {
      const [configData, zoneData, fleetData, vehiclePricingData] = await Promise.all([
        pricingService.getConfig().catch((err) => {
          console.error("Failed to load pricing config:", err);
          setUsingFallback(true);
          return [
            { id: "fallback-sedan", vehicleType: "sedan", baseRate: "30", ratePerMile: "4.0", ratePerMinute: "1.25", taxPercent: "20", waitTimeHourly: "95" },
            { id: "fallback-suv", vehicleType: "suv", baseRate: "37", ratePerMile: "4.5", ratePerMinute: "1.55", taxPercent: "20", waitTimeHourly: "95" },
          ];
        }),
        pricingService.getZones().catch(() => []),
        fleetService.getAll().catch(() => []),
        pricingService.getVehiclePricing().catch(() => [])
      ]);
      
      const parsedConfigs = configData.map((c: any) => ({
        ...c,
        baseRate: parseFloat(c.baseRate),
        ratePerMile: parseFloat(c.ratePerMile),
        ratePerMinute: parseFloat(c.ratePerMinute),
        taxPercent: parseFloat(c.taxPercent),
        waitTimeHourly: parseFloat(c.waitTimeHourly),
      }));
      
      const parsedZones = zoneData.map((z: any) => ({
        ...z,
        sedanPrice: parseFloat(z.sedanPrice),
        suvPrice: parseFloat(z.suvPrice),
        radiusMiles: parseFloat(z.radiusMiles),
      }));
      
      const parsedVehiclePricing: Record<string, VehicleSpecificPricing> = {};
      vehiclePricingData.forEach((vp: any) => {
        parsedVehiclePricing[vp.vehicleId] = {
          vehicleId: vp.vehicleId,
          baseRate: vp.baseRate ? parseFloat(vp.baseRate) : undefined,
          ratePerMile: vp.ratePerMile ? parseFloat(vp.ratePerMile) : undefined,
          ratePerMinute: vp.ratePerMinute ? parseFloat(vp.ratePerMinute) : undefined,
          taxPercent: vp.taxPercent ? parseFloat(vp.taxPercent) : undefined,
        };
      });
      
      setConfigs(parsedConfigs);
      setZones(parsedZones);
      setVehicles(fleetData);
      setVehiclePricing(parsedVehiclePricing);
      
      if (configData.length > 0 && configData[0]?.id?.startsWith("fallback")) {
        toast.warning("Backend pricing API unavailable. Using read-only default pricing for calculator.", { duration: 5000 });
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to load pricing data");
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async (config: PricingConfig) => {
    if (usingFallback) {
      toast.error("Cannot save pricing. Backend API is unavailable. Please contact support.");
      return;
    }
    setSaving(true);
    try {
      await pricingService.updateConfig(config.id, {
        baseRate: config.baseRate,
        ratePerMile: config.ratePerMile,
        ratePerMinute: config.ratePerMinute,
        taxPercent: config.taxPercent,
        waitTimeHourly: config.waitTimeHourly,
      });
      toast.success(`${config.vehicleType.toUpperCase()} pricing saved`);
    } catch (error: any) {
      toast.error(error.message || "Failed to save pricing");
    } finally {
      setSaving(false);
    }
  };

  const saveZone = async (zone: FlatZone) => {
    if (usingFallback) {
      toast.error("Cannot save zones. Backend API is unavailable. Please contact support.");
      return;
    }
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

  const updateConfig = (id: string, field: keyof PricingConfig, value: number) => {
    setConfigs((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  const updateZone = (id: string, field: keyof FlatZone, value: number | boolean) => {
    setZones((prev) =>
      prev.map((z) => (z.id === id ? { ...z, [field]: value } : z))
    );
  };

  const updateVehiclePricing = (vehicleId: string, field: keyof VehicleSpecificPricing, value: number | undefined) => {
    const updated = { ...vehiclePricing[vehicleId], vehicleId, [field]: value };
    setVehiclePricing((prev) => ({ ...prev, [vehicleId]: updated }));
  };

  const saveVehiclePricing = async (vehicleId: string) => {
    const pricing = vehiclePricing[vehicleId];
    if (!pricing) return;

    setSaving(true);
    try {
      await pricingService.upsertVehiclePricing(vehicleId, {
        baseRate: pricing.baseRate,
        ratePerMile: pricing.ratePerMile,
        ratePerMinute: pricing.ratePerMinute,
        taxPercent: pricing.taxPercent,
      });
      toast.success("Vehicle pricing saved");
    } catch (error: any) {
      toast.error(error.message || "Failed to save vehicle pricing");
    } finally {
      setSaving(false);
    }
  };

  const clearVehiclePricing = async (vehicleId: string) => {
    setSaving(true);
    try {
      await pricingService.deleteVehiclePricing(vehicleId);
      setVehiclePricing((prev) => {
        const updated = { ...prev };
        delete updated[vehicleId];
        return updated;
      });
      toast.success("Reset to category defaults");
    } catch (error: any) {
      toast.error(error.message || "Failed to clear vehicle pricing");
    } finally {
      setSaving(false);
    }
  };

  const initializePricing = async () => {
    setInitializing(true);
    try {
      await Promise.all([
        pricingService.createConfig({
          vehicleType: "sedan",
          baseRate: 30,
          ratePerMile: 4.0,
          ratePerMinute: 1.25,
          taxPercent: 20,
          waitTimeHourly: 95,
        }),
        pricingService.createConfig({
          vehicleType: "suv",
          baseRate: 37,
          ratePerMile: 4.5,
          ratePerMinute: 1.55,
          taxPercent: 20,
          waitTimeHourly: 95,
        }),
      ]);
      
      toast.success("Pricing configurations initialized successfully!");
      setUsingFallback(false);
      await loadPricingData();
    } catch (error: any) {
      toast.error(error.message || "Failed to initialize pricing");
    } finally {
      setInitializing(false);
    }
  };

  const calculatePrice = (distance: number, duration: number, vehicleId: string) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (!vehicle) return null;

    const specificPricing = vehiclePricing[vehicleId];
    const defaultConfig = configs.find(c => c.vehicleType === vehicle.vehicleType);
    if (!defaultConfig) return null;

    const baseRate = specificPricing?.baseRate ?? defaultConfig.baseRate;
    const ratePerMile = specificPricing?.ratePerMile ?? defaultConfig.ratePerMile;
    const ratePerMinute = specificPricing?.ratePerMinute ?? defaultConfig.ratePerMinute;
    const taxPercent = specificPricing?.taxPercent ?? defaultConfig.taxPercent;

    const basePrice = baseRate + (ratePerMile * distance) + (ratePerMinute * duration);
    const tax = basePrice * (taxPercent / 100);
    const total = basePrice + tax;

    return { basePrice, tax, total, taxPercent };
  };

  const calculatedPrice = route && calcVehicle && calcPickup && calcDropoff ? calculatePrice(route.distance, route.duration, calcVehicle) : null;

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
            <div className="flex items-center gap-2 mb-4">
              <Calculator className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-display font-semibold text-foreground">Test Pricing Calculator</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-6">Enter trip details to calculate pricing and test your configurations</p>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs flex items-center gap-1.5 mb-2">
                    <MapPin className="h-3.5 w-3.5 text-primary" />
                    Pickup Location
                  </Label>
                  <Input
                    ref={pickupRef}
                    value={calcPickup}
                    onChange={(e) => setCalcPickup(e.target.value)}
                    placeholder="Enter pickup address"
                    className="h-10"
                  />
                </div>
                <div>
                  <Label className="text-xs flex items-center gap-1.5 mb-2">
                    <MapPin className="h-3.5 w-3.5 text-primary" />
                    Dropoff Location
                  </Label>
                  <Input
                    ref={dropoffRef}
                    value={calcDropoff}
                    onChange={(e) => setCalcDropoff(e.target.value)}
                    placeholder="Enter dropoff address"
                    className="h-10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-xs flex items-center gap-1.5 mb-2">
                    <Calendar className="h-3.5 w-3.5 text-primary" />
                    Date
                  </Label>
                  <Input
                    type="date"
                    value={calcDate}
                    onChange={(e) => setCalcDate(e.target.value)}
                    className="h-10"
                  />
                </div>
                <div>
                  <Label className="text-xs flex items-center gap-1.5 mb-2">
                    <Clock className="h-3.5 w-3.5 text-primary" />
                    Time
                  </Label>
                  <Input
                    type="time"
                    value={calcTime}
                    onChange={(e) => setCalcTime(e.target.value)}
                    className="h-10"
                  />
                </div>
                <div>
                  <Label className="text-xs flex items-center gap-1.5 mb-2">
                    <Car className="h-3.5 w-3.5 text-primary" />
                    Vehicle
                  </Label>
                  <select
                    value={calcVehicle}
                    onChange={(e) => setCalcVehicle(e.target.value)}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="">Select vehicle...</option>
                    {vehicles.filter(v => v.status === "available").map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.make} {v.model} ({v.plate}) - {v.vehicleType.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {route && (
                <div className="glass-card rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <ArrowRight className="h-4 w-4 text-primary" />
                    Route Details
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Distance</p>
                      <p className="font-semibold text-foreground">{route.distance.toFixed(2)} miles</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Duration</p>
                      <p className="font-semibold text-foreground">{route.duration} minutes</p>
                    </div>
                  </div>
                </div>
              )}

              {calculatedPrice && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-strong rounded-xl p-6 shadow-blue"
                >
                  <h4 className="text-base font-display font-semibold text-foreground mb-4">Calculated Pricing</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Base Fare</span>
                      <span className="font-semibold text-foreground">${calculatedPrice.basePrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tax ({calculatedPrice.taxPercent}%)</span>
                      <span className="font-semibold text-foreground">${calculatedPrice.tax.toFixed(2)}</span>
                    </div>
                    <div className="h-px bg-border" />
                    <div className="flex justify-between">
                      <span className="text-base font-semibold text-foreground">Total</span>
                      <span className="text-2xl font-display font-bold text-primary">${calculatedPrice.total.toFixed(2)}</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {routeLoading && (
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
          {usingFallback && (
            <div className="glass-card rounded-xl p-6 mb-6 border-amber-500/30 bg-amber-500/5">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-amber-500/10">
                  <DollarSign className="h-6 w-6 text-amber-500" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-base font-semibold text-foreground mb-2">Pricing Database Not Initialized</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        The pricing configuration table is empty. Initialize default pricing for Sedan and SUV categories first.
                      </p>
                      <p className="text-xs text-muted-foreground mb-4">
                        <strong>What will be created:</strong>
                        <br />• <strong>Sedan Category:</strong> $30 base + $4.00/mile + $1.25/min + 20% tax + $95/hr wait time
                        <br />• <strong>SUV Category:</strong> $37 base + $4.50/mile + $1.55/min + 20% tax + $95/hr wait time
                      </p>
                      <Button
                        onClick={initializePricing}
                        disabled={initializing}
                        size="lg"
                        className="gap-2 bg-blue-gradient shadow-blue"
                      >
                        {initializing ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Initializing Database...
                          </>
                        ) : (
                          <>
                            <DollarSign className="h-4 w-4" />
                            Initialize Pricing Database
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Rate Equations */}
          <section>
            <h3 className="text-base font-display font-semibold text-foreground mb-1">Rate Equations</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Price = Base + (Rate/Mile × distance) + (Rate/Min × duration)
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {configs.map((c) => (
                <div key={c.id} className="rounded-lg border border-border bg-card p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-display font-semibold text-foreground capitalize">
                      Business {c.vehicleType}
                    </h4>
                    <button
                      onClick={() => saveConfig(c)}
                      disabled={saving || usingFallback}
                      className="inline-flex items-center gap-1.5 rounded-md bg-primary text-primary-foreground px-3 py-1.5 text-xs font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      title={usingFallback ? "Cannot save - Backend API unavailable" : "Save pricing configuration"}
                    >
                      <Save className="h-3 w-3" />
                      Save
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {(
                      [
                        ["baseRate", "Base ($)"],
                        ["ratePerMile", "$/Mile"],
                        ["ratePerMinute", "$/Minute"],
                        ["taxPercent", "Tax (%)"],
                        ["waitTimeHourly", "Wait ($/hr)"],
                      ] as const
                    ).map(([field, label]) => (
                      <div key={field}>
                        <label className="text-[10px] text-muted-foreground uppercase tracking-wide">
                          {label}
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={(c as any)[field]}
                          onChange={(e) =>
                            updateConfig(c.id, field as keyof PricingConfig, parseFloat(e.target.value) || 0)
                          }
                          className="w-full mt-0.5 bg-secondary border border-border rounded-md px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="text-[11px] text-muted-foreground bg-secondary/50 rounded px-2 py-1.5">
                    Formula: ${c.baseRate} + (${c.ratePerMile} × miles) + (${c.ratePerMinute} × mins) + {c.taxPercent}% tax
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Vehicle-Specific Pricing */}
          <section>
            <div className="mb-4">
              <h3 className="text-base font-display font-semibold text-foreground mb-1">Vehicle-Specific Pricing Overrides</h3>
              <p className="text-xs text-muted-foreground">
                Set custom pricing for individual vehicles. Fields show category defaults in <span className="text-primary font-semibold">[brackets]</span>. Leave empty to use category pricing.
              </p>
            </div>

            {vehicles.length === 0 ? (
              <div className="glass-card rounded-lg p-8 text-center">
                <Car className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground mb-1">No vehicles in fleet</p>
                <p className="text-xs text-muted-foreground">Add vehicles in <Link href="/admin/fleet" className="text-primary hover:underline">Fleet Management</Link> first</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {vehicles.map((vehicle) => {
                  const defaultConfig = configs.find(c => c.vehicleType === vehicle.vehicleType);
                  const specific = vehiclePricing[vehicle.id];
                  const hasOverride = specific && (specific.baseRate !== undefined || specific.ratePerMile !== undefined || specific.ratePerMinute !== undefined || specific.taxPercent !== undefined);

                  return (
                    <div key={vehicle.id} className={`rounded-lg border p-4 space-y-3 transition-all ${
                      hasOverride ? "border-primary/40 bg-primary/5 shadow-blue" : "border-border bg-card"
                    }`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-sm font-display font-semibold text-foreground">
                            {vehicle.make} {vehicle.model}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {vehicle.plate} • <span className="uppercase font-semibold">{vehicle.vehicleType}</span>
                          </p>
                          {defaultConfig && (
                            <p className="text-[10px] text-muted-foreground mt-1">
                              Category defaults: ${defaultConfig.baseRate} + ${defaultConfig.ratePerMile}/mi + ${defaultConfig.ratePerMinute}/min
                            </p>
                          )}
                        </div>
                        {hasOverride && (
                          <span className="text-[10px] px-2 py-1 rounded-full bg-primary text-primary-foreground font-semibold">
                            CUSTOM
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] text-muted-foreground uppercase tracking-wide block mb-1">
                            Base Rate ($)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={specific?.baseRate ?? ""}
                            onChange={(e) => updateVehiclePricing(vehicle.id, "baseRate", e.target.value ? parseFloat(e.target.value) : undefined)}
                            placeholder={defaultConfig?.baseRate.toString() || "30"}
                            className="w-full bg-secondary border border-border rounded-md px-2 py-1.5 text-sm text-foreground placeholder:text-primary/60 focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-muted-foreground uppercase tracking-wide block mb-1">
                            Rate Per Mile ($)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={specific?.ratePerMile ?? ""}
                            onChange={(e) => updateVehiclePricing(vehicle.id, "ratePerMile", e.target.value ? parseFloat(e.target.value) : undefined)}
                            placeholder={defaultConfig?.ratePerMile.toString() || "4.00"}
                            className="w-full bg-secondary border border-border rounded-md px-2 py-1.5 text-sm text-foreground placeholder:text-primary/60 focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-muted-foreground uppercase tracking-wide block mb-1">
                            Rate Per Minute ($)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={specific?.ratePerMinute ?? ""}
                            onChange={(e) => updateVehiclePricing(vehicle.id, "ratePerMinute", e.target.value ? parseFloat(e.target.value) : undefined)}
                            placeholder={defaultConfig?.ratePerMinute.toString() || "1.25"}
                            className="w-full bg-secondary border border-border rounded-md px-2 py-1.5 text-sm text-foreground placeholder:text-primary/60 focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-muted-foreground uppercase tracking-wide block mb-1">
                            Tax Percent (%)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={specific?.taxPercent ?? ""}
                            onChange={(e) => updateVehiclePricing(vehicle.id, "taxPercent", e.target.value ? parseFloat(e.target.value) : undefined)}
                            placeholder={defaultConfig?.taxPercent.toString() || "20"}
                            className="w-full bg-secondary border border-border rounded-md px-2 py-1.5 text-sm text-foreground placeholder:text-primary/60 focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => saveVehiclePricing(vehicle.id)}
                          disabled={saving || usingFallback}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-md bg-primary text-primary-foreground px-3 py-1.5 text-xs font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <Save className="h-3 w-3" />
                          Save Pricing
                        </button>
                        {hasOverride && (
                          <button
                            onClick={() => clearVehiclePricing(vehicle.id)}
                            disabled={saving}
                            className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-3 py-1.5 text-xs text-muted-foreground hover:text-destructive hover:border-destructive transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <X className="h-3 w-3" />
                            Clear
                          </button>
                        )}
                      </div>

                      {!defaultConfig && (
                        <p className="text-[10px] text-amber-600 bg-amber-500/10 rounded px-2 py-1">
                          ⚠️ No category pricing found for {vehicle.vehicleType}. Initialize pricing first.
                        </p>
                      )}
                    </div>
                  );
                })}
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
                      disabled={saving || usingFallback}
                      className="inline-flex items-center gap-1.5 rounded-md bg-primary text-primary-foreground px-3 py-1.5 text-xs font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      title={usingFallback ? "Cannot save - Backend API unavailable" : "Save zone configuration"}
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
