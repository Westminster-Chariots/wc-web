"use client";
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { pricingConfigurationService } from "@/lib/services";
import type { PricingConfiguration, VehicleType } from "@/types";

// Admin-facing hook for the Services form's "Pricing Configuration"
// dropdown. Refetches whenever `vehicleType` changes so the list is always
// scoped server-side to configurations compatible with the currently
// selected vehicle class - never a hardcoded Sedan/SUV pair, and never a
// client-side-only filter of a fixed list (a future third/fourth
// configuration for either class appears automatically). Always
// active-only: an inactive configuration is never a valid NEW assignment,
// even though an existing service may still (validly) reference one it was
// assigned before deactivation - see PremiumServicesPage's compatibility-
// check logic for that distinction.
export function usePricingConfigurations(vehicleType: VehicleType) {
  const [configurations, setConfigurations] = useState<PricingConfiguration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConfigurations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await pricingConfigurationService.getAllAdmin({ vehicleType, activeOnly: true });
      setConfigurations(data);
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.error || err.message
        : err instanceof Error ? err.message : "Failed to load pricing configurations";
      console.error("[usePricingConfigurations] Error:", msg);
      setError(msg);
      setConfigurations([]);
    } finally {
      setLoading(false);
    }
  }, [vehicleType]);

  useEffect(() => {
    fetchConfigurations();
  }, [fetchConfigurations]);

  return { configurations, loading, error, refetch: fetchConfigurations };
}
