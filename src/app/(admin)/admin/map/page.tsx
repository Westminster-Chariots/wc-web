"use client";
import { useState, useCallback, useMemo } from "react";
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from "@react-google-maps/api";
import { useDrivers } from "@/hooks/useDrivers";
import { useFleet } from "@/hooks/useFleet";
import { useAdminBookings } from "@/hooks/useAdminBookings";
import { Loader2, MapPin, Car } from "lucide-react";
import RouteOverlay from "@/components/map/RouteOverlay";
import ActiveTripsPanel from "@/components/map/ActiveTripsPanel";
import {
  DEFAULT_CENTER,
  statusColors,
  markerIcon,
  getMockPosition,
  darkMapStyle,
  containerStyle,
} from "@/components/map/mapConfig";

const GOOGLE_MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || "";
const LIBRARIES: ("places")[] = ["places"];

export default function MapPage() {
  const { drivers } = useDrivers();
  const { vehicles } = useFleet();
  const { bookings } = useAdminBookings();
  const [selectedDriver, setSelectedDriver] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<string | null>(null);
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_KEY,
    libraries: LIBRARIES,
  });

  const mapOptions = useMemo(() => ({
    styles: darkMapStyle,
    disableDefaultUI: false,
    zoomControl: true,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: true,
  }), []);

  const onMapLoad = useCallback((map: google.maps.Map) => {
    setMapInstance(map);
  }, []);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    drivers.forEach((d) => {
      counts[d.status] = (counts[d.status] || 0) + 1;
    });
    return counts;
  }, [drivers]);

  const getVehicleLabel = (vehicleId: string | null) => {
    if (!vehicleId) return null;
    const v = vehicles.find((v) => v.id === vehicleId);
    return v ? `${v.year || ""} ${v.make} ${v.model}`.trim() : null;
  };

  return (
    <div className="p-4 md:p-8 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MapPin className="h-5 w-5 text-primary" />
          <div>
            <h2 className="text-lg md:text-xl font-display font-semibold text-foreground">Live Fleet Map</h2>
            <p className="text-xs text-muted-foreground font-body">
              {drivers.length} drivers tracked · {bookings.filter(b => ["assigned","enroute","onsite","inprogress"].includes(b.status)).length} active routes
            </p>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 p-3 rounded-lg border border-border bg-card">
        {Object.entries(statusColors).map(([status, color]) => (
          <div key={status} className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-[11px] font-body text-muted-foreground capitalize">
              {status.replace("_", " ")} ({statusCounts[status] || 0})
            </span>
          </div>
        ))}
      </div>

      {/* Map */}
      <div className="relative rounded-lg overflow-hidden border border-border" style={{ height: "calc(100vh - 280px)", minHeight: "500px" }}>
        {loadError && (
          <div className="absolute inset-0 flex items-center justify-center bg-background z-10">
            <div className="text-center p-8">
              <MapPin className="h-10 w-10 text-destructive mx-auto mb-3" />
              <p className="text-sm text-destructive font-body font-semibold">Failed to load Google Maps</p>
              <p className="text-xs text-muted-foreground font-body mt-1">Check API key and network connection.</p>
            </div>
          </div>
        )}

        {!isLoaded && !loadError && (
          <div className="absolute inset-0 flex items-center justify-center bg-background z-10">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
              <p className="text-sm text-muted-foreground font-body">Loading map…</p>
            </div>
          </div>
        )}

        {isLoaded && (
          <>
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={DEFAULT_CENTER}
              zoom={11}
              options={mapOptions}
              onLoad={onMapLoad}
            >
              {drivers.map((driver, idx) => {
                const pos = getMockPosition(driver.id, idx);
                const color = statusColors[driver.status] || statusColors.offline;

                return (
                  <Marker
                    key={driver.id}
                    position={pos}
                    icon={{
                      url: markerIcon(color),
                      scaledSize: new google.maps.Size(32, 40),
                      anchor: new google.maps.Point(16, 40),
                    }}
                    onClick={() => setSelectedDriver(driver.id)}
                  >
                    {selectedDriver === driver.id && (
                      <InfoWindow onCloseClick={() => setSelectedDriver(null)}>
                        <div style={{ color: "#1a1a1a", fontFamily: "Inter, sans-serif", padding: "4px", minWidth: "140px" }}>
                          <p style={{ fontWeight: 600, fontSize: "13px", margin: 0 }}>{driver.name}</p>
                          <p style={{ fontSize: "11px", margin: "4px 0 0", textTransform: "capitalize", color: "#666" }}>
                            {driver.status.replace("_", " ")}
                          </p>
                          {driver.vehicleId && (
                            <p style={{ fontSize: "11px", margin: "4px 0 0", color: "#888" }}>
                              🚗 {getVehicleLabel(driver.vehicleId)}
                            </p>
                          )}
                          {driver.phone && (
                            <p style={{ fontSize: "10px", margin: "4px 0 0", color: "#999" }}>
                              📞 {driver.phone}
                            </p>
                          )}
                        </div>
                      </InfoWindow>
                    )}
                  </Marker>
                );
              })}

              <RouteOverlay
                map={mapInstance}
                bookings={bookings}
                selectedBookingId={selectedBooking}
              />
            </GoogleMap>

            <ActiveTripsPanel
              bookings={bookings}
              selectedBookingId={selectedBooking}
              onSelectBooking={setSelectedBooking}
            />
          </>
        )}

        {isLoaded && drivers.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/60 z-10 pointer-events-none">
            <div className="text-center">
              <Car className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground font-body">No drivers to display.</p>
              <p className="text-xs text-muted-foreground/60 font-body mt-1">Add drivers to see them on the map.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
