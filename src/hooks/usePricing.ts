"use client";
import { useState, useEffect, useCallback } from "react";
import { pricingService } from "@/lib/services";

export interface PricingConfig {
  id: string;
  vehicleType: string;
  baseRate: number;
  ratePerMile: number;
  ratePerMinute: number;
  taxPercent: number;
  waitTimeHourly: number;
}

// Fallback pricing for public users (when API requires auth)
const FALLBACK_PRICING: PricingConfig[] = [
  {
    id: "fallback-sedan",
    vehicleType: "sedan",
    baseRate: 30,
    ratePerMile: 4.0,
    ratePerMinute: 1.25,
    taxPercent: 20,
    waitTimeHourly: 95,
  },
  {
    id: "fallback-suv",
    vehicleType: "suv",
    baseRate: 37,
    ratePerMile: 4.5,
    ratePerMinute: 1.55,
    taxPercent: 20,
    waitTimeHourly: 95,
  },
];

const pricingCache: Record<string, PricingConfig> = {};

export function usePricing() {
  const [configs, setConfigs] = useState<PricingConfig[]>(FALLBACK_PRICING);
  const [vehiclePricing, setVehiclePricing] = useState<Record<string, PricingConfig>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPricing();
  }, []);

  const loadPricing = async () => {
    setLoading(true);
    setError(null);
    
    // First try to fetch vehicle pricing publicly (without auth)
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "https://wc-backend-ayx0.onrender.com/api/v1";
      const response = await fetch(`${backendUrl}/pricing/vehicles`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        // No credentials needed for public endpoint
      });
      
      if (response.ok) {
        const vehiclePricingData = await response.json();
        
        if (vehiclePricingData && Array.isArray(vehiclePricingData)) {
          // Create a map of vehicleId -> pricing config
          const pricingMap: Record<string, PricingConfig> = {};
          vehiclePricingData.forEach((item: any) => {
            if (item.vehicleId) {
              pricingMap[item.vehicleId] = {
                id: item.id || item.vehicleId,
                vehicleType: item.vehicleType || "sedan",
                baseRate: parseFloat(item.baseRate || item.base_rate || FALLBACK_PRICING[0].baseRate),
                ratePerMile: parseFloat(item.ratePerMile || item.rate_per_mile || FALLBACK_PRICING[0].ratePerMile),
                ratePerMinute: parseFloat(item.ratePerMinute || item.rate_per_minute || FALLBACK_PRICING[0].ratePerMinute),
                taxPercent: parseFloat(item.taxPercent || item.tax_percent || FALLBACK_PRICING[0].taxPercent),
                waitTimeHourly: parseFloat(item.waitTimeHourly || item.wait_time_hourly || FALLBACK_PRICING[0].waitTimeHourly),
              };
            }
          });
          
          setVehiclePricing(pricingMap);
          
          // Also update configs with vehicle-specific pricing for fallback
          const vehicleConfigs = Object.values(pricingMap);
          if (vehicleConfigs.length > 0) {
            setConfigs(vehicleConfigs);
            vehicleConfigs.forEach((config) => {
              pricingCache[config.vehicleType] = config;
            });
            setLoading(false);
            return; // Success!
          }
        }
      }
    } catch (publicErr) {
      console.log("Public vehicle pricing fetch failed, trying authenticated endpoints:", publicErr);
    }
    
    // If public fetch failed, try authenticated endpoints
    try {
      // Try to get vehicle-specific pricing via service (with auth if available)
      const vehiclePricingData = await pricingService.getVehiclePricing();
      
      if (vehiclePricingData && Array.isArray(vehiclePricingData)) {
        // Create a map of vehicleId -> pricing config
        const pricingMap: Record<string, PricingConfig> = {};
        vehiclePricingData.forEach((item: any) => {
          if (item.vehicleId) {
            pricingMap[item.vehicleId] = {
              id: item.id || item.vehicleId,
              vehicleType: item.vehicleType || "sedan",
              baseRate: parseFloat(item.baseRate || item.base_rate || FALLBACK_PRICING[0].baseRate),
              ratePerMile: parseFloat(item.ratePerMile || item.rate_per_mile || FALLBACK_PRICING[0].ratePerMile),
              ratePerMinute: parseFloat(item.ratePerMinute || item.rate_per_minute || FALLBACK_PRICING[0].ratePerMinute),
              taxPercent: parseFloat(item.taxPercent || item.tax_percent || FALLBACK_PRICING[0].taxPercent),
              waitTimeHourly: parseFloat(item.waitTimeHourly || item.wait_time_hourly || FALLBACK_PRICING[0].waitTimeHourly),
            };
          }
        });
        
        setVehiclePricing(pricingMap);
        
        // Also update configs with vehicle-specific pricing for fallback
        const vehicleConfigs = Object.values(pricingMap);
        if (vehicleConfigs.length > 0) {
          setConfigs(vehicleConfigs);
          vehicleConfigs.forEach((config) => {
            pricingCache[config.vehicleType] = config;
          });
        } else {
          // If no vehicle-specific pricing, use fallback
          setConfigs(FALLBACK_PRICING);
          FALLBACK_PRICING.forEach((config) => { pricingCache[config.vehicleType] = config; });
        }
      } else {
        // Fall back to category pricing config
        try {
          const data = await pricingService.getConfig();
          const parsed = data.map((c: any) => ({
            ...c,
            baseRate: parseFloat(c.baseRate),
            ratePerMile: parseFloat(c.ratePerMile),
            ratePerMinute: parseFloat(c.ratePerMinute),
            taxPercent: parseFloat(c.taxPercent),
            waitTimeHourly: parseFloat(c.waitTimeHourly),
          }));
          
          // Cache by vehicle type
          parsed.forEach((config: PricingConfig) => {
            pricingCache[config.vehicleType] = config;
          });
          
          // If API returned no configs, fall back to built-in defaults
          if (!parsed || parsed.length === 0) {
            setConfigs(FALLBACK_PRICING);
            FALLBACK_PRICING.forEach((config) => { pricingCache[config.vehicleType] = config; });
          } else {
            // Ensure we have entries for both sedan and suv; merge missing types from fallback
            const hasSedan = parsed.some((c: any) => c.vehicleType === "sedan");
            const hasSuv = parsed.some((c: any) => c.vehicleType === "suv");
            const merged = [...parsed];
            if (!hasSedan) merged.push(FALLBACK_PRICING.find(p => p.vehicleType === "sedan")!);
            if (!hasSuv) merged.push(FALLBACK_PRICING.find(p => p.vehicleType === "suv")!);

            merged.forEach((config: PricingConfig) => {
              pricingCache[config.vehicleType] = config;
            });
            setConfigs(merged);
          }
        } catch (configErr: any) {
          // Use fallback pricing
          console.log("Using fallback pricing");
          setConfigs(FALLBACK_PRICING);
          FALLBACK_PRICING.forEach((config) => {
            pricingCache[config.vehicleType] = config;
          });
        }
      }
    } catch (err: any) {
      // Use fallback pricing for any error
      console.log("Pricing load error, using fallback:", err.message);
      setConfigs(FALLBACK_PRICING);
      FALLBACK_PRICING.forEach((config) => {
        pricingCache[config.vehicleType] = config;
      });
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  const calculatePrice = useCallback((distance: number, duration: number, vehicleType: "sedan" | "suv", vehicleId?: string): number | null => {
    // First try to use vehicle-specific pricing if vehicleId is provided
    if (vehicleId && vehiclePricing[vehicleId]) {
      const config = vehiclePricing[vehicleId];
      const basePrice = config.baseRate + (config.ratePerMile * distance) + (config.ratePerMinute * duration);
      return Math.round(basePrice * 100) / 100;
    }
    
    // Fall back to category pricing
    const config = configs.find(c => c.vehicleType === vehicleType);
    if (!config) return null;
    
    const basePrice = config.baseRate + (config.ratePerMile * distance) + (config.ratePerMinute * duration);
    return Math.round(basePrice * 100) / 100; // Round to 2 decimal places
  }, [configs, vehiclePricing]);

  const calculateVehicleSpecificPrice = useCallback(async (distance: number, duration: number, vehicleType: "sedan" | "suv", vehicleId: string): Promise<number | null> => {
    // First check if we already have the vehicle pricing cached
    if (vehiclePricing[vehicleId]) {
      return calculatePrice(distance, duration, vehicleType, vehicleId);
    }
    
    // Try to fetch vehicle-specific pricing directly (public first)
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "https://wc-backend-ayx0.onrender.com/api/v1";
      const response = await fetch(`${backendUrl}/pricing/vehicles/${vehicleId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      
      if (response.ok) {
        const config = await response.json();
        if (config) {
          // Update cache
          const pricingConfig: PricingConfig = {
            id: config.id || vehicleId,
            vehicleType: config.vehicleType || vehicleType,
            baseRate: parseFloat(config.baseRate || config.base_rate || FALLBACK_PRICING[0].baseRate),
            ratePerMile: parseFloat(config.ratePerMile || config.rate_per_mile || FALLBACK_PRICING[0].ratePerMile),
            ratePerMinute: parseFloat(config.ratePerMinute || config.rate_per_minute || FALLBACK_PRICING[0].ratePerMinute),
            taxPercent: parseFloat(config.taxPercent || config.tax_percent || FALLBACK_PRICING[0].taxPercent),
            waitTimeHourly: parseFloat(config.waitTimeHourly || config.wait_time_hourly || FALLBACK_PRICING[0].waitTimeHourly),
          };
          
          // Update state
          setVehiclePricing(prev => ({ ...prev, [vehicleId]: pricingConfig }));
          
          // Calculate price
          const basePrice = pricingConfig.baseRate + (pricingConfig.ratePerMile * distance) + (pricingConfig.ratePerMinute * duration);
          return Math.round(basePrice * 100) / 100;
        }
      }
    } catch (publicErr) {
      console.log("Public vehicle pricing fetch failed, trying authenticated endpoint:", publicErr);
      
      // Try authenticated endpoint
      try {
        const config = await pricingService.getVehiclePricingById(vehicleId);
        if (config) {
          // Update cache
          const pricingConfig: PricingConfig = {
            id: config.id || vehicleId,
            vehicleType: config.vehicleType || vehicleType,
            baseRate: parseFloat(config.baseRate || config.base_rate || FALLBACK_PRICING[0].baseRate),
            ratePerMile: parseFloat(config.ratePerMile || config.rate_per_mile || FALLBACK_PRICING[0].ratePerMile),
            ratePerMinute: parseFloat(config.ratePerMinute || config.rate_per_minute || FALLBACK_PRICING[0].ratePerMinute),
            taxPercent: parseFloat(config.taxPercent || config.tax_percent || FALLBACK_PRICING[0].taxPercent),
            waitTimeHourly: parseFloat(config.waitTimeHourly || config.wait_time_hourly || FALLBACK_PRICING[0].waitTimeHourly),
          };
          
          // Update state
          setVehiclePricing(prev => ({ ...prev, [vehicleId]: pricingConfig }));
          
          // Calculate price
          const basePrice = pricingConfig.baseRate + (pricingConfig.ratePerMile * distance) + (pricingConfig.ratePerMinute * duration);
          return Math.round(basePrice * 100) / 100;
        }
      } catch (authErr) {
        console.log("Authenticated vehicle pricing API also failed, falling back to category pricing:", authErr);
      }
    }
    
    // Fall back to category pricing
    return calculatePrice(distance, duration, vehicleType);
  }, [vehiclePricing, calculatePrice]);

  const getTaxPercent = useCallback((vehicleType: "sedan" | "suv"): number => {
    const config = configs.find(c => c.vehicleType === vehicleType);
    return config?.taxPercent || 20;
  }, [configs]);

  const getVehicleTaxPercent = useCallback((vehicleId?: string): number => {
    if (vehicleId && vehiclePricing[vehicleId]) {
      return vehiclePricing[vehicleId].taxPercent;
    }
    return 20; // Default tax percent
  }, [vehiclePricing]);

  return {
    configs,
    vehiclePricing,
    loading,
    error,
    calculatePrice,
    calculateVehicleSpecificPrice,
    getTaxPercent,
    getVehicleTaxPercent,
    reload: loadPricing,
  };
}

// Cached version for use outside React components
export function getCachedPricingConfig(vehicleType: string): PricingConfig | null {
  return pricingCache[vehicleType] || null;
}
