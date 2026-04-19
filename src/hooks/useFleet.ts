"use client";
import { useEffect, useState, useCallback } from "react";
import { fleetService } from "@/lib/services";
import type { FleetVehicle } from "@/types";

export type VehicleClass = "sedan" | "suv";

export function useFleet() {
  const [vehicles, setVehicles] = useState<FleetVehicle[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVehicles = useCallback(async () => {
    try {
      const data = await fleetService.getAll();
      setVehicles(data);
    } catch (error) {
      console.error("Error fetching fleet:", error);
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

  return { vehicles, loading, addVehicle, updateVehicle, deleteVehicle, refetch: fetchVehicles };
}
