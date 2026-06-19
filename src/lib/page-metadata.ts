// Page-specific metadata for SEO optimization

export const pageMetadata = {
  home: {
    title: "Westminster Chariots | Luxury Black Car Service DC, VA, MD",
    description:
      "Experience premium chauffeur service with Westminster Chariots. Mercedes-Benz fleet, professional drivers, 24/7 availability. Serving Washington DC, Northern Virginia & Maryland. Book now.",
    keywords: [
      "luxury car service DC",
      "black car service Washington",
      "chauffeur service DMV",
      "airport transfer DC",
      "executive transportation",
    ],
  },

  aboutUs: {
    title: "About Westminster Chariots | Premium Black Car Service",
    description:
      "Learn about Westminster Chariots - Washington DC's premier chauffeur service. Professional drivers, luxury Mercedes-Benz fleet, commitment to excellence. Precision. Discretion. Excellence.",
    keywords: [
      "about Westminster Chariots",
      "luxury car service company",
      "professional chauffeur service",
      "DC transportation company",
    ],
  },

  fleet: {
    title: "Our Fleet | Mercedes-Benz Luxury Vehicles",
    description:
      "Discover our premium fleet of Mercedes-Benz S-Class sedans and GLS SUVs. Immaculately maintained, fully licensed, sanitized before every trip. View our luxury vehicles.",
    keywords: [
      "Mercedes-Benz fleet",
      "luxury sedan DC",
      "executive SUV",
      "S-Class chauffeur",
      "premium vehicles",
    ],
  },

  book: {
    title: "Book a Ride | Westminster Chariots Luxury Car Service",
    description:
      "Book your luxury chauffeur service instantly. Choose from Mercedes-Benz sedans or SUVs, select your date and time, and experience premium transportation across DC, VA, MD.",
    keywords: [
      "book chauffeur online",
      "reserve car service",
      "luxury car booking",
      "instant reservation",
    ],
  },

  services: {
    title: "Our Services | Executive Transportation Solutions",
    description:
      "Comprehensive chauffeur services: Airport transfers, corporate transportation, hourly service, special events, and more. Professional, reliable, luxurious. Available 24/7.",
    keywords: [
      "chauffeur services DC",
      "transportation solutions",
      "executive car service",
      "professional transportation",
    ],
  },

  help: {
    title: "Help & FAQ | Westminster Chariots",
    description:
      "Get answers to frequently asked questions about our luxury chauffeur service. Booking, pricing, policies, and more. Contact our team for assistance.",
    keywords: [
      "chauffeur service FAQ",
      "car service help",
      "booking questions",
      "transportation support",
    ],
  },

  careers: {
    title: "Careers | Join Westminster Chariots",
    description:
      "Join our team of professional chauffeurs. We're seeking experienced, licensed drivers who value excellence, discretion, and customer service. Apply today.",
    keywords: [
      "chauffeur jobs DC",
      "driver careers",
      "transportation jobs",
      "professional driver",
    ],
  },

  // Service-specific pages
  airportTransfer: {
    title: "Airport Transfer Service DC | DCA, IAD, BWI",
    description:
      "Reliable airport transportation to Reagan National (DCA), Dulles (IAD), and BWI airports. Flight tracking, meet & greet service, professional chauffeurs. Book your airport transfer now.",
    keywords: [
      "DCA airport transfer",
      "IAD airport car service",
      "BWI airport pickup",
      "Reagan airport transportation",
      "Dulles car service",
    ],
  },

  corporateCarService: {
    title: "Corporate Car Service DC | Executive Transportation",
    description:
      "Professional corporate transportation for executives and businesses. Monthly billing, dedicated account manager, premium Mercedes-Benz fleet. Serving DMV area.",
    keywords: [
      "corporate car service DC",
      "executive transportation",
      "business car service",
      "company transportation",
    ],
  },

  hourlyCarService: {
    title: "Hourly Car Service DC | Chauffeur by the Hour",
    description:
      "Flexible hourly chauffeur service for meetings, events, and city tours. 3-hour minimum. Professional drivers, luxury vehicles. Available 24/7 in DC, VA, MD.",
    keywords: [
      "hourly car service",
      "chauffeur by the hour",
      "flexible transportation",
      "hourly chauffeur DC",
    ],
  },

  longDistance: {
    title: "Long Distance Car Service | Interstate Transportation",
    description:
      "Comfortable long-distance chauffeur service to New York, Philadelphia, Baltimore, and beyond. Experienced drivers, luxury Mercedes-Benz vehicles, competitive rates.",
    keywords: [
      "long distance car service",
      "interstate transportation",
      "DC to NYC car service",
      "long distance chauffeur",
    ],
  },

  nightOut: {
    title: "Night Out Car Service | Safe Rides in DC",
    description:
      "Enjoy your night out safely with our designated driver service. Perfect for dining, bars, clubs, and entertainment. Reliable, discreet, always on time.",
    keywords: [
      "night out transportation",
      "designated driver DC",
      "safe ride service",
      "nightlife car service",
    ],
  },

  concertTransportation: {
    title: "Concert Transportation | Event Car Service DC",
    description:
      "Stress-free concert and event transportation. Drop-off, pickup, and wait service available. Venues: Capital One Arena, Jiffy Lube Live, Nationals Park, and more.",
    keywords: [
      "concert transportation DC",
      "event car service",
      "Capital One Arena car service",
      "concert shuttle",
    ],
  },

  weddingTransportation: {
    title: "Wedding Transportation | Luxury Car Service for Weddings",
    description:
      "Elegant wedding transportation for the bride, groom, and wedding party. Mercedes-Benz luxury vehicles, professional chauffeurs, stress-free service on your special day.",
    keywords: [
      "wedding transportation DC",
      "wedding car service",
      "bridal car service",
      "luxury wedding transportation",
    ],
  },

  cityTours: {
    title: "City Tours | Washington DC Sightseeing by Car",
    description:
      "Private Washington DC city tours with professional chauffeur. Visit monuments, museums, landmarks in comfort. Customizable itineraries, flexible scheduling.",
    keywords: [
      "DC city tours",
      "Washington DC sightseeing",
      "private tour car service",
      "monument tour transportation",
    ],
  },

  promLimo: {
    title: "Prom Limo Service | Safe Transportation for Prom Night",
    description:
      "Safe, luxurious prom night transportation. Parent-approved, GPS tracked, professional drivers. Mercedes-Benz vehicles for an unforgettable prom experience.",
    keywords: [
      "prom limo service",
      "prom night transportation",
      "high school prom car",
      "safe prom transportation",
    ],
  },

  dateNight: {
    title: "Date Night Car Service | Romantic Transportation DC",
    description:
      "Make your date night special with chauffeur service. Restaurant reservations, theater, events. Focus on your evening, we'll handle the driving.",
    keywords: [
      "date night car service",
      "romantic transportation",
      "dinner car service",
      "anniversary transportation",
    ],
  },
};

// Helper function to get page metadata by key
export function getPageMetadata(pageKey: keyof typeof pageMetadata) {
  return pageMetadata[pageKey];
}
