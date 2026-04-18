"use client";
import { useState, useEffect, useCallback } from "react";
import { driverService } from "@/lib/services";

export interface Driver {
  id: string;
  userId: string | null;
  name: string;
  email: string | null;
  phone: string | null;
  status: string;
  vehicleId: string | null;
  photoUrl: string | null;
  notes: string | null;
  createdAt: string;
}

export function useDrivers() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDrivers = useCallback(async () => {
    try {
      const data = await driverService.getAll();
      setDrivers(data);
    } catch (error) {
      console.error("Error fetching drivers:", error);
      setDrivers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDrivers();
  }, [fetchDrivers]);

  const addDriver = useCallback(async (driver: Omit<Driver, "id" | "createdAt">) => {
    await driverService.create(driver);
    await fetchDrivers();
  }, [fetchDrivers]);

  const updateDriver = useCallback(async (id: string, updates: Partial<Driver>) => {
    await driverService.update(id, updates);
    await fetchDrivers();
  }, [fetchDrivers]);

  const deleteDriver = useCallback(async (id: string) => {
    await driverService.delete(id);
    await fetchDrivers();
  }, [fetchDrivers]);

  return { drivers, loading, addDriver, updateDriver, deleteDriver, refetch: fetchDrivers };
}
