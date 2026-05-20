"use client";
import { useState, useEffect } from "react";
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
  const [configs, setConfigs] = useState<PricingConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPricing();
  }, []);

  const loadPricing = async () => {
    setLoading(true);
    setError(null);
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
      
      setConfigs(parsed);
    } catch (err: any) {
      // Use fallback pricing for public users (401 = not authenticated)
      if (err.response?.status === 401) {
        console.log("Using fallback pricing for unauthenticated user");
        setConfigs(FALLBACK_PRICING);
        FALLBACK_PRICING.forEach((config) => {
          pricingCache[config.vehicleType] = config;
        });
      } else {
        setError(err.message || "Failed to load pricing");
        console.error("Pricing load error:", err);
        // Still use fallback on other errors
        setConfigs(FALLBACK_PRICING);
      }
    } finally {
      setLoading(false);
    }
  };

  const calculatePrice = (distance: number, duration: number, vehicleType: "sedan" | "suv"): number | null => {
    const config = configs.find(c => c.vehicleType === vehicleType);
    if (!config) return null;
    
    const basePrice = config.baseRate + (config.ratePerMile * distance) + (config.ratePerMinute * duration);
    return basePrice;
  };

  const getTaxPercent = (vehicleType: "sedan" | "suv"): number => {
    const config = configs.find(c => c.vehicleType === vehicleType);
    return config?.taxPercent || 20;
  };

  return {
    configs,
    loading,
    error,
    calculatePrice,
    getTaxPercent,
    reload: loadPricing,
  };
}

// Cached version for use outside React components
export function getCachedPricingConfig(vehicleType: string): PricingConfig | null {
  return pricingCache[vehicleType] || null;
}
