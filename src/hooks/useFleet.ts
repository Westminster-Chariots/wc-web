"use client";
import { useEffect, useState, useCallback } from "react";
import { fleetService } from "@/lib/services";
import type { FleetVehicle } from "@/types";

export type VehicleClass = "sedan" | "suv";

export function useFleet() {
  const [vehicles, setVehicles] = useState<FleetVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVehicles = useCallback(async () => {
    setError(null);
    const token = localStorage.getItem("access_token");
    console.log("[useFleet] Fetching with token:", token ? `${token.substring(0, 20)}...` : "NO TOKEN");
    try {
      const data = await fleetService.getAll();
      setVehicles(data);
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.message || "Failed to load vehicles";
      console.error("[useFleet] Error:", err?.response?.status, msg);
      setError(msg);
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  const addVehicle = useCallback(async (v: Omit<FleetVehicle, "id" | "createdAt">) => {
    await fleetService.create(v);
    await fetchVehicles();
  }, [fetchVehicles]);

  const updateVehicle = useCallback(async (id: string, updates: Partial<FleetVehicle>) => {
    await fleetService.update(id, updates);
    await fetchVehicles();
  }, [fetchVehicles]);

  const deleteVehicle = useCallback(async (id: string) => {
    await fleetService.delete(id);
    await fetchVehicles();
  }, [fetchVehicles]);

  return { vehicles, loading, error, addVehicle, updateVehicle, deleteVehicle, refetch: fetchVehicles };
}
