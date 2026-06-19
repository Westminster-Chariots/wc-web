// Service-specific structured data schemas for SEO
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://westminsterchariots.com";

export const serviceSchemas = {
  airportTransfer: {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${SITE_URL}/services/airport-transfer`,
    serviceType: "Airport Transfer Service",
    name: "Airport Transfer Service - DCA, IAD, BWI",
    description:
      "Professional airport transportation to Reagan National (DCA), Dulles (IAD), and BWI airports with flight tracking and meet & greet service.",
    provider: {
      "@type": "Organization",
      name: "Westminster Chariots",
      url: SITE_URL,
    },
    areaServed: [
      {
        "@type": "City",
        name: "Washington",
        "@id": "https://en.wikipedia.org/wiki/Washington,_D.C.",
      },
      {
        "@type": "State",
        name: "Virginia",
      },
      {
        "@type": "State",
        name: "Maryland",
      },
    ],
    availableChannel: {
      "@type": "ServiceChannel",
      serviceUrl: `${SITE_URL}/book`,
      servicePhone: "+1-571-426-6338",
      availableLanguage: ["English", "Spanish"],
    },
    offers: {
      "@type": "Offer",
      priceRange: "$$$$",
      availability: "https://schema.org/InStock",
      availabilityStarts: "00:00",
      availabilityEnds: "23:59",
    },
    termsOfService: `${SITE_URL}/terms`,
  },

  corporateCarService: {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${SITE_URL}/services/corporate-car-service`,
    serviceType: "Corporate Transportation",
    name: "Corporate Car Service - Executive Transportation",
    description:
      "Professional corporate transportation for executives and businesses with monthly billing and dedicated account management.",
    provider: {
      "@type": "Organization",
      name: "Westminster Chariots",
      url: SITE_URL,
    },
    areaServed: [
      {
        "@type": "City",
        name: "Washington",
      },
      {
        "@type": "State",
        name: "Virginia",
      },
      {
        "@type": "State",
        name: "Maryland",
      },
    ],
    availableChannel: {
      "@type": "ServiceChannel",
      serviceUrl: `${SITE_URL}/book`,
      servicePhone: "+1-571-426-6338",
    },
    offers: {
      "@type": "Offer",
      priceRange: "$$$$",
      availability: "https://schema.org/InStock",
    },
  },

  hourlyCarService: {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${SITE_URL}/services/hourly-car-service`,
    serviceType: "Hourly Car Service",
    name: "Hourly Car Service - Chauffeur by the Hour",
    description:
      "Flexible hourly chauffeur service for meetings, events, and city tours with a 3-hour minimum.",
    provider: {
      "@type": "Organization",
      name: "Westminster Chariots",
      url: SITE_URL,
    },
    areaServed: [
      {
        "@type": "City",
        name: "Washington",
      },
      {
        "@type": "State",
        name: "Virginia",
      },
      {
        "@type": "State",
        name: "Maryland",
      },
    ],
    availableChannel: {
      "@type": "ServiceChannel",
      serviceUrl: `${SITE_URL}/book`,
      servicePhone: "+1-571-426-6338",
    },
    offers: {
      "@type": "Offer",
      priceRange: "$$$$",
      availability: "https://schema.org/InStock",
    },
  },

  weddingTransportation: {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${SITE_URL}/services/wedding-transportation`,
    serviceType: "Wedding Transportation",
    name: "Wedding Transportation - Luxury Car Service for Weddings",
    description:
      "Elegant wedding transportation for the bride, groom, and wedding party with Mercedes-Benz luxury vehicles.",
    provider: {
      "@type": "Organization",
      name: "Westminster Chariots",
      url: SITE_URL,
    },
    areaServed: [
      {
        "@type": "City",
        name: "Washington",
      },
      {
        "@type": "State",
        name: "Virginia",
      },
      {
        "@type": "State",
        name: "Maryland",
      },
    ],
    availableChannel: {
      "@type": "ServiceChannel",
      serviceUrl: `${SITE_URL}/book`,
      servicePhone: "+1-571-426-6338",
    },
    offers: {
      "@type": "Offer",
      priceRange: "$$$$",
      availability: "https://schema.org/PreOrder",
    },
  },

  longDistance: {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${SITE_URL}/services/long-distance`,
    serviceType: "Long Distance Transportation",
    name: "Long Distance Car Service - Interstate Transportation",
    description:
      "Comfortable long-distance chauffeur service to New York, Philadelphia, Baltimore, and beyond.",
    provider: {
      "@type": "Organization",
      name: "Westminster Chariots",
      url: SITE_URL,
    },
    areaServed: [
      {
        "@type": "State",
        name: "Virginia",
      },
      {
        "@type": "State",
        name: "Maryland",
      },
      {
        "@type": "State",
        name: "Pennsylvania",
      },
      {
        "@type": "State",
        name: "New York",
      },
      {
        "@type": "State",
        name: "Delaware",
      },
    ],
    availableChannel: {
      "@type": "ServiceChannel",
      serviceUrl: `${SITE_URL}/book`,
      servicePhone: "+1-571-426-6338",
    },
    offers: {
      "@type": "Offer",
      priceRange: "$$$$",
      availability: "https://schema.org/InStock",
    },
  },

  concertTransportation: {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${SITE_URL}/services/concert-transportation`,
    serviceType: "Event Transportation",
    name: "Concert Transportation - Event Car Service",
    description:
      "Stress-free concert and event transportation with drop-off, pickup, and wait service available.",
    provider: {
      "@type": "Organization",
      name: "Westminster Chariots",
      url: SITE_URL,
    },
    areaServed: [
      {
        "@type": "City",
        name: "Washington",
      },
    ],
    availableChannel: {
      "@type": "ServiceChannel",
      serviceUrl: `${SITE_URL}/book`,
      servicePhone: "+1-571-426-6338",
    },
    offers: {
      "@type": "Offer",
      priceRange: "$$$$",
      availability: "https://schema.org/InStock",
    },
  },
};

// Product schema for fleet vehicles
export const vehicleSchemas = {
  mercedesSClass: {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "Mercedes-Benz S-Class - Luxury Sedan",
    description:
      "Premium luxury sedan with seating for up to 3 passengers and 2 luggage pieces. Perfect for executive transportation and airport transfers.",
    brand: {
      "@type": "Brand",
      name: "Mercedes-Benz",
    },
    category: "Luxury Sedan",
    offers: {
      "@type": "Offer",
      availability: "https://schema.org/InStock",
      priceRange: "$$$$",
      priceCurrency: "USD",
      url: `${SITE_URL}/fleet`,
    },
    additionalProperty: [
      {
        "@type": "PropertyValue",
        name: "Passenger Capacity",
        value: "3",
      },
      {
        "@type": "PropertyValue",
        name: "Luggage Capacity",
        value: "2",
      },
      {
        "@type": "PropertyValue",
        name: "Vehicle Type",
        value: "Sedan",
      },
    ],
  },

  mercedesGLS: {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "Mercedes-Benz GLS - Luxury SUV",
    description:
      "Spacious luxury SUV with seating for up to 6 passengers and 5 luggage pieces. Ideal for group transportation and family travel.",
    brand: {
      "@type": "Brand",
      name: "Mercedes-Benz",
    },
    category: "Luxury SUV",
    offers: {
      "@type": "Offer",
      availability: "https://schema.org/InStock",
      priceRange: "$$$$",
      priceCurrency: "USD",
      url: `${SITE_URL}/fleet`,
    },
    additionalProperty: [
      {
        "@type": "PropertyValue",
        name: "Passenger Capacity",
        value: "6",
      },
      {
        "@type": "PropertyValue",
        name: "Luggage Capacity",
        value: "5",
      },
      {
        "@type": "PropertyValue",
        name: "Vehicle Type",
        value: "SUV",
      },
    ],
  },
};

// Helper to generate service schema for any service
export function generateServiceSchema(serviceKey: keyof typeof serviceSchemas) {
  return serviceSchemas[serviceKey];
}

// Helper to generate vehicle schema
export function generateVehicleSchema(vehicleKey: keyof typeof vehicleSchemas) {
  return vehicleSchemas[vehicleKey];
}
