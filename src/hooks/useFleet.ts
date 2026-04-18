"use client";
import { useEffect, useState, useCallback } from "react";
import { fleetService } from "@/lib/services";

export type VehicleClass = "sedan" | "suv";

export interface Vehicle {
  id: string;
  vehicleType: VehicleClass;
  make: string;
  model: string;
  plate: string;
  year: number | null;
  color: string | null;
  status: string;
  notes: string | null;
  imageUrl: string | null;
  passengerCapacity: number | null;
  luggageCapacity: number | null;
  createdAt: string;
}

export function useFleet() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
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

  const addVehicle = useCallback(async (v: Omit<Vehicle, "id" | "createdAt">) => {
    await fleetService.create(v);
    await fetchVehicles();
  }, [fetchVehicles]);

  const updateVehicle = useCallback(async (id: string, updates: Partial<Vehicle>) => {
    await fleetService.update(id, updates);
    await fetchVehicles();
  }, [fetchVehicles]);

  const deleteVehicle = useCallback(async (id: string) => {
    await fleetService.delete(id);
    await fetchVehicles();
  }, [fetchVehicles]);

  return { vehicles, loading, addVehicle, updateVehicle, deleteVehicle, refetch: fetchVehicles };
}
