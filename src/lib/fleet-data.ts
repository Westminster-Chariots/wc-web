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
    slug: "luxury-sedan",
    name: "Sedan",
    category: "Luxury Sedan",
    passengers: 2,
    luggage: 2,
    image: "/assets/fleet/2027-s-class.png",
    gallery: [
      { src: "/assets/fleet/2027-s-class.png", label: "Exterior" },
      { src: "/assets/fleet/2027-s-class-interior.png", label: "Interior" },
      { src: "/assets/fleet/2027-s-class-rear.png", label: "Rear" },
    ],
    description:
      "Travel in refined luxury with our First Class Sedan fleet, featuring prestigious vehicles such as the Mercedes-Benz S-Class and BMW 7 Series for a smooth, seamless, and exceptionally comfortable ride.",
  },
  {
    slug: "luxury-suv",
    name: "SUV",
    category: "Luxury SUV",
    passengers: 4,
    luggage: 4,
    image: "/assets/fleet/fleet-escalade.png",
    gallery: [
      { src: "/assets/fleet/fleet-escalade.png", label: "Exterior" },
      { src: "/assets/fleet/fleet-escalade-interior.png", label: "Interior" },
      { src: "/assets/fleet/fleet-escalade-rear.png", label: "Rear" },
    ],
    description:
      "Experience elevated travel with our First Class SUV fleet, featuring prestigious vehicles such as the Cadillac Escalade and Lincoln Navigator delivering spacious luxury, refined comfort, and the versatility to handle everything from airport transfers to executive and group travel with ease.",
  },
  // {
  //   slug: "business-class-suv",
  //   name: "Business Class SUV",
  //   category: "Grand Carriage",
  //   passengers: 4,
  //   luggage: 4,
  //   image: "/assets/fleet/fleet-suburban.jpg",
  //   gallery: [
  //     { src: "/assets/fleet/fleet-suburban.jpg", label: "Exterior" },
  //     { src: "/assets/fleet/fleet-suburban-interior.jpg", label: "Interior" },
  //     { src: "/assets/fleet/fleet-suburban-rear.jpg", label: "Rear" },
  //   ],
  //   description:
  //     "Our Business SUV fleet, featuring vehicles such as the Chevrolet Suburban and Ford Expedition, delivers spacious, reliable, and professional transportation ideal for airport transfers, corporate travel, and executive group transportation.",
  // },
  // {
  //   slug: "business-class-sedan",
  //   name: "Business Class Sedan",
  //   category: "Carriage",
  //   passengers: 2,
  //   luggage: 2,
  //   image: "/assets/fleet/fleet-mercedes-rear.jpg",
  //   gallery: [
  //     { src: "/assets/fleet/fleet-mercedes.jpg", label: "Exterior" },
  //     { src: "/assets/fleet/fleet-mercedes-interior.jpg", label: "Interior" },
  //     { src: "/assets/fleet/fleet-mercedes-rear.jpg", label: "Rear" },
  //   ],
  //   description:
  //     "Our Business Sedan fleet features executive vehicles such as the Mercedes-Benz E-Class, BMW 5 Series, and Cadillac CT5, blending sleek design, refined comfort, and smooth performance to deliver a polished and relaxing travel experience for corporate travel, airport transfers, and everyday executive transportation.",
  // },
];
