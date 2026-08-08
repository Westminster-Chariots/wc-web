"use client";
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { serviceService } from "@/lib/services";
import type { Service } from "@/types";

// Admin-facing hook for the Services module - mirrors useFleet.ts's shape
// exactly, but reads/writes the separate `services` table (customer-facing
// booking classes), never Fleet inventory. getAllAdmin() includes inactive
// services (deactivated ones still need to be visible/editable here, even
// though they no longer appear on the public booking page).
export function useServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchServices = useCallback(async () => {
    setError(null);
    try {
      const data = await serviceService.getAllAdmin();
      setServices(data);
    } catch (err) {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.error || err.message
        : err instanceof Error ? err.message : "Failed to load services";
      console.error("[useServices] Error:", axios.isAxiosError(err) ? err.response?.status : undefined, msg);
      setError(msg);
      setServices([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const addService = useCallback(async (s: Partial<Service>) => {
    await serviceService.create(s);
    await fetchServices();
  }, [fetchServices]);

  const updateService = useCallback(async (id: string, updates: Partial<Service>) => {
    await serviceService.update(id, updates);
    await fetchServices();
  }, [fetchServices]);

  const deleteService = useCallback(async (id: string) => {
    const result = await serviceService.delete(id);
    await fetchServices();
    return result;
  }, [fetchServices]);

  return { services, loading, error, addService, updateService, deleteService, refetch: fetchServices };
}
