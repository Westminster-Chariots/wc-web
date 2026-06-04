"use client";

import React, { useEffect, useState, useMemo } from "react";
import { GoogleMap, useJsApiLoader, Marker, Polyline } from "@react-google-maps/api";
import { Loader2, MapPin } from "lucide-react";

const GOOGLE_MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || "";
const LIBRARIES: ("places")[] = ["places"];

interface MapPreviewProps {
  pickup?: string;
  dropoff?: string;
  className?: string;
}

export default function MapPreview({ pickup, dropoff, className }: MapPreviewProps) {
  const { isLoaded, loadError } = useJsApiLoader({ googleMapsApiKey: GOOGLE_MAPS_KEY, libraries: LIBRARIES });
  const [pickupPos, setPickupPos] = useState<google.maps.LatLngLiteral | null>(null);
  const [dropoffPos, setDropoffPos] = useState<google.maps.LatLngLiteral | null>(null);
  const [routePath, setRoutePath] = useState<google.maps.LatLngLiteral[]>([]);

  useEffect(() => {
    if (!isLoaded) return;
    const geocoder = new google.maps.Geocoder();
    const directionsService = new google.maps.DirectionsService();

    const geocodeAndRoute = async () => {
      let pPos: google.maps.LatLngLiteral | null = null;
      let dPos: google.maps.LatLngLiteral | null = null;

      if (pickup) {
        try {
          const results = await geocoder.geocode({ address: pickup });
          if (results.results && results.results[0]) {
            const loc = results.results[0].geometry.location;
            pPos = { lat: loc.lat(), lng: loc.lng() };
            setPickupPos(pPos);
          }
        } catch (error) {
          console.error('Pickup geocode error:', error);
          setPickupPos(null);
        }
      } else {
        setPickupPos(null);
      }

      if (dropoff) {
        try {
          const results = await geocoder.geocode({ address: dropoff });
          if (results.results && results.results[0]) {
            const loc = results.results[0].geometry.location;
            dPos = { lat: loc.lat(), lng: loc.lng() };
            setDropoffPos(dPos);
          }
        } catch (error) {
          console.error('Dropoff geocode error:', error);
          setDropoffPos(null);
        }
      } else {
        setDropoffPos(null);
      }

      // Fetch actual route from Directions API
      if (pPos && dPos) {
        try {
          const result = await directionsService.route({
            origin: pPos,
            destination: dPos,
            travelMode: google.maps.TravelMode.DRIVING,
          });

          if (result.routes && result.routes[0]) {
            const path: google.maps.LatLngLiteral[] = [];
            result.routes[0].overview_path.forEach((point) => {
              path.push({ lat: point.lat(), lng: point.lng() });
            });
            setRoutePath(path);
          }
        } catch (error) {
          console.error('Directions error:', error);
          setRoutePath([]);
        }
      } else {
        setRoutePath([]);
      }
    };

    geocodeAndRoute();
  }, [isLoaded, pickup, dropoff]);

  const center = useMemo(() => {
    if (pickupPos && dropoffPos) return { lat: (pickupPos.lat + dropoffPos.lat) / 2, lng: (pickupPos.lng + dropoffPos.lng) / 2 };
    return pickupPos || dropoffPos || { lat: 38.9072, lng: -77.0369 };
  }, [pickupPos, dropoffPos]);

  const path = useMemo(() => routePath.length > 0 ? routePath : undefined, [routePath]);

  if (loadError) return <div className="rounded-md border border-border bg-card p-4 text-sm text-destructive">Failed to load map</div>;
  if (!isLoaded) return <div className="rounded-md border border-border bg-card p-4 text-sm flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin text-primary"/> Loading map…</div>;

  return (
    <div className={className}>
      <div className="rounded-md overflow-hidden border border-border h-40 sm:h-52">
        <GoogleMap
          mapContainerStyle={{ width: "100%", height: "100%" }}
          center={center}
          zoom={pickupPos && dropoffPos ? 12 : 11}
          options={{ disableDefaultUI: true }}
        >
          {pickupPos && <Marker position={pickupPos} label="P" />}
          {dropoffPos && <Marker position={dropoffPos} label="D" />}
          {path && (
            <Polyline
              path={path}
              options={{ strokeColor: "#2563EB", strokeOpacity: 0.8, strokeWeight: 4 }}
            />
          )}
        </GoogleMap>
      </div>
    </div>
  );
}
