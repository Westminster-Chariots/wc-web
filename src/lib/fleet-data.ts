export type Vehicle = {
  slug: string;
  name: string;
  category: string;
  passengers: number;
  luggage: number;
  image: string;
  gallery: { src: string; label: string }[];
  description: string;
};

export const FLEET: Vehicle[] = [
  {
    slug: "mercedes-benz-sedan",
    name: "Mercedes-Benz Sedan",
    category: "Luxury Sedan",
    passengers: 2,
    luggage: 2,
    image: "/assets/fleet/fleet-mercedes.jpg",
    gallery: [
      { src: "/assets/fleet/fleet-mercedes.jpg", label: "Exterior" },
      { src: "/assets/fleet/fleet-mercedes-interior.jpg", label: "Interior" },
      { src: "/assets/fleet/fleet-mercedes-rear.jpg", label: "Rear" },
    ],
    description:
      "Executive S-Class refinement with whisper-quiet comfort, leather interiors and impeccable ride quality — the signature of professional chauffeured travel.",
  },
  {
    slug: "cadillac-escalade",
    name: "Cadillac Escalade",
    category: "Luxury SUV",
    passengers: 4,
    luggage: 4,
    image: "/assets/fleet/fleet-escalade.jpg",
    gallery: [
      { src: "/assets/fleet/fleet-escalade.jpg", label: "Exterior" },
      { src: "/assets/fleet/fleet-escalade-interior.jpg", label: "Interior" },
      { src: "/assets/fleet/fleet-escalade-rear.jpg", label: "Rear" },
    ],
    description:
      "Commanding presence and first-class space. The Escalade Platinum pairs bold styling with premium materials for VIP travel and special events.",
  },
  {
    slug: "chevrolet-suburban",
    name: "Chevrolet Suburban",
    category: "Premium SUV",
    passengers: 4,
    luggage: 4,
    image: "/assets/fleet/fleet-suburban.jpg",
    gallery: [
      { src: "/assets/fleet/fleet-suburban.jpg", label: "Exterior" },
      { src: "/assets/fleet/fleet-suburban-interior.jpg", label: "Interior" },
      { src: "/assets/fleet/fleet-suburban-rear.jpg", label: "Rear" },
    ],
    description:
      "Generous cabin and cavernous cargo room for families, group transfers and long-distance travel — smooth, dependable and discreet.",
  },
];
