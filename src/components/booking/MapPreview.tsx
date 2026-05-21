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

  useEffect(() => {
    if (!isLoaded) return;
    const geocoder = new google.maps.Geocoder();

    if (pickup) {
      geocoder.geocode({ address: pickup }, (results, status) => {
        if (status === "OK" && results && results[0]) {
          const loc = results[0].geometry.location;
          setPickupPos({ lat: loc.lat(), lng: loc.lng() });
        } else setPickupPos(null);
      });
    } else setPickupPos(null);

    if (dropoff) {
      geocoder.geocode({ address: dropoff }, (results, status) => {
        if (status === "OK" && results && results[0]) {
          const loc = results[0].geometry.location;
          setDropoffPos({ lat: loc.lat(), lng: loc.lng() });
        } else setDropoffPos(null);
      });
    } else setDropoffPos(null);

  }, [isLoaded, pickup, dropoff]);

  const center = useMemo(() => {
    if (pickupPos && dropoffPos) return { lat: (pickupPos.lat + dropoffPos.lat) / 2, lng: (pickupPos.lng + dropoffPos.lng) / 2 };
    return pickupPos || dropoffPos || { lat: 38.9072, lng: -77.0369 };
  }, [pickupPos, dropoffPos]);

  const path = useMemo(() => (pickupPos && dropoffPos ? [pickupPos, dropoffPos] : undefined), [pickupPos, dropoffPos]);

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
              options={{ strokeColor: "#2563EB", strokeOpacity: 0.8, strokeWeight: 3 }}
            />
          )}
        </GoogleMap>
      </div>
    </div>
  );
}
