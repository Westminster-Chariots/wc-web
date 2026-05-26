// DC / Northern Virginia area — default center
export const DEFAULT_CENTER = { lat: 38.8977, lng: -77.0365 };

// Status → marker color map
export const statusColors: Record<string, string> = {
  available: "#22c55e",
  on_trip: "#3b82f6",
  en_route: "#f59e0b",
  offline: "#6b7280",
  break: "#a855f7",
};

// Route line colors per booking status
export const routeColors: Record<string, string> = {
  assigned: "#3b82f6",
  enroute: "#f59e0b",
  onsite: "#22c55e",
  inprogress: "#a855f7",
};

// Generate colored marker SVG URL
export function markerIcon(color: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40">
    <path d="M16 0C7.16 0 0 7.16 0 16c0 12 16 24 16 24s16-12 16-24C32 7.16 24.84 0 16 0z" fill="${color}"/>
    <circle cx="16" cy="14" r="6" fill="white" opacity="0.9"/>
  </svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

// Pickup/dropoff pin SVGs
export function pickupIcon() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" fill="#22c55e" stroke="white" stroke-width="2"/>
    <text x="12" y="16" text-anchor="middle" fill="white" font-size="12" font-weight="bold">P</text>
  </svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export function dropoffIcon() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" fill="#ef4444" stroke="white" stroke-width="2"/>
    <text x="12" y="16" text-anchor="middle" fill="white" font-size="12" font-weight="bold">D</text>
  </svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

// Mock driver positions (in production, from GPS tracking)
export function getMockPosition(_driverId: string, index: number) {
  const positions = [
    { lat: 38.9072, lng: -77.0369 },
    { lat: 38.8816, lng: -77.0910 },
    { lat: 38.9510, lng: -77.1460 },
    { lat: 38.8462, lng: -77.3064 },
    { lat: 38.9530, lng: -77.4475 },
    { lat: 38.7849, lng: -77.1772 },
    { lat: 38.8048, lng: -77.0469 },
    { lat: 38.9283, lng: -77.1753 },
  ];
  return positions[index % positions.length];
}

export const darkMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#1a1a2e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#1a1a2e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#8b8b8b" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#2a2a3e" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#1a1a2e" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#0e1a2b" }] },
  { featureType: "poi", elementType: "geometry", stylers: [{ color: "#1e1e30" }] },
  { featureType: "transit", elementType: "geometry", stylers: [{ color: "#1e1e30" }] },
];

export const lightMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#f5f7fa" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#5f6774" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#dce0e8" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#d7e6f7" }] },
  { featureType: "poi", elementType: "geometry", stylers: [{ color: "#eef1f6" }] },
  { featureType: "transit", elementType: "geometry", stylers: [{ color: "#f4f7fb" }] },
  { featureType: "landscape", elementType: "geometry.fill", stylers: [{ color: "#ecf0f4" }] },
];

export const containerStyle = { width: "100%", height: "100%", position: "absolute" as const, top: 0, left: 0, right: 0, bottom: 0 };
