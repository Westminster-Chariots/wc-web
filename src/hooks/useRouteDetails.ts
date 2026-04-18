"use client";
import { useState, useEffect, useRef } from "react";
import { useJsApiLoader } from "@react-google-maps/api";
import type { RouteDetails } from "@/types";

const routeCache: Record<string, RouteDetails> = {};
const LIBRARIES: ("places")[] = ["places"];

export function useRouteDetails(pickup: string, dropoff: string) {
  const [route, setRoute] = useState<RouteDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const serviceRef = useRef<google.maps.DistanceMatrixService | null>(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY ?? "",
    libraries: LIBRARIES,
  });

  useEffect(() => {
    if (!pickup || !dropoff) { setRoute(null); setError(null); return; }
    if (!isLoaded) return;

    const cacheKey = `${pickup}|${dropoff}`;
    if (routeCache[cacheKey]) { setRoute(routeCache[cacheKey]); return; }

    let mounted = true;
    const timer = setTimeout(async () => {
      setIsLoading(true); setError(null);
      try {
        if (!serviceRef.current) serviceRef.current = new google.maps.DistanceMatrixService();
        const res = await serviceRef.current.getDistanceMatrix({
          origins: [pickup], destinations: [dropoff],
          travelMode: google.maps.TravelMode.DRIVING,
          unitSystem: google.maps.UnitSystem.IMPERIAL,
        });
        const el = res.rows[0]?.elements[0];
        if (!el || el.status !== "OK") throw new Error("Route not found");
        const r = { distance: Number((el.distance.value * 0.000621371).toFixed(1)), duration: Math.ceil(el.duration.value / 60) };
        routeCache[cacheKey] = r;
        if (mounted) setRoute(r);
      } catch (err: any) {
        if (mounted) setError(err.message ?? "Failed to calculate route");
      } finally {
        if (mounted) setIsLoading(false);
      }
    }, 800);

    return () => { mounted = false; clearTimeout(timer); };
  }, [pickup, dropoff, isLoaded]);

  return { route, isLoading, error };
}

export async function fetchRouteDetails(pickup: string, dropoff: string): Promise<RouteDetails | null> {
  if (!pickup || !dropoff) return null;
  const cacheKey = `${pickup}|${dropoff}`;
  if (routeCache[cacheKey]) return routeCache[cacheKey];
  if (typeof google === "undefined") return null;
  try {
    const svc = new google.maps.DistanceMatrixService();
    const res = await svc.getDistanceMatrix({
      origins: [pickup], destinations: [dropoff],
      travelMode: google.maps.TravelMode.DRIVING,
      unitSystem: google.maps.UnitSystem.IMPERIAL,
    });
    const el = res.rows[0]?.elements[0];
    if (!el || el.status !== "OK") return null;
    const r = { distance: Number((el.distance.value * 0.000621371).toFixed(1)), duration: Math.ceil(el.duration.value / 60) };
    routeCache[cacheKey] = r;
    return r;
  } catch { return null; }
}
