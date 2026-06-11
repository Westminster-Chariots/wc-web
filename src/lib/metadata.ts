import { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://westminsterchariots.com";
const SITE_NAME = "Westminster Chariots";
const SITE_DESCRIPTION = 
  "Westminster Chariots: Premium black car service serving Washington DC, Northern Virginia, and Maryland. " +
  "Mercedes-Benz fleet, professional chauffeurs, airport transfers, corporate transportation. " +
  "Available 24/7 · Licensed & Insured · Book online instantly.";

export const defaultMetadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | Luxury Black Car Service DC, VA, MD`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    // Location-based keywords
    "luxury car service DC",
    "black car service Washington DC",
    "chauffeur service Northern Virginia",
    "chauffeur service Maryland",
    "DMV car service",
    "Arlington car service",
    "Alexandria car service",
    "Bethesda car service",
    "Tysons car service",
    "McLean chauffeur",
    
    // Service-based keywords
    "airport transfer DC",
    "DCA airport car service",
    "IAD airport transfer",
    "BWI airport pickup",
    "Dulles airport car service",
    "Reagan National airport transfer",
    "corporate car service DC",
    "executive transportation",
    "business car service",
    "hourly car service",
    "point to point service",
    "chauffeur by the hour",
    
    // Vehicle-based keywords
    "Mercedes-Benz chauffeur",
    "luxury sedan service",
    "executive SUV service",
    "S-Class chauffeur",
    "Mercedes GLS service",
    "premium car service",
    
    // Event-based keywords
    "wedding transportation DC",
    "concert transportation",
    "night out car service",
    "date night transportation",
    "prom limousine service",
    "diplomatic transportation",
    "government car service",
    
    // Quality indicators
    "licensed chauffeur DC",
    "professional car service",
    "24/7 car service",
    "VIP car service",
    "luxury black car",
    "private chauffeur",
  ],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  formatDetection: {
    telephone: true,
    email: true,
    address: true,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} | Luxury Black Car Service DC, VA, MD`,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} - Premium Chauffeur Service`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} | Luxury Black Car Service DC, VA, MD`,
    description: SITE_DESCRIPTION,
    images: ["/og-image.png"],
    creator: "@westminsterchariots",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
};

export function generatePageMetadata({
  title,
  description,
  path = "",
  image = "/og-image.png",
  noIndex = false,
}: {
  title: string;
  description: string;
  path?: string;
  image?: string;
  noIndex?: boolean;
}): Metadata {
  const url = `${SITE_URL}${path}`;

  return {
    title,
    description,
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description,
      url,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${SITE_NAME}`,
      description,
      images: [image],
    },
    alternates: {
      canonical: url,
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
        }
      : undefined,
  };
}

export const structuredData = {
  organization: {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/assets/wc-logo-full.png`,
    description: SITE_DESCRIPTION,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Triangle",
      addressRegion: "VA",
      addressCountry: "US",
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+1-571-426-6338",
      contactType: "Customer Service",
      areaServed: ["DC", "VA", "MD"],
      availableLanguage: ["English", "Spanish"],
    },
    sameAs: [
      "https://www.facebook.com/westminsterchariots",
      "https://www.instagram.com/westminsterchariots",
      "https://www.linkedin.com/company/westminsterchariots",
    ],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      reviewCount: "150",
      bestRating: "5",
      worstRating: "1",
    },
  },
  localBusiness: {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": SITE_URL,
    name: SITE_NAME,
    image: `${SITE_URL}/assets/hero-mercedes.jpg`,
    url: SITE_URL,
    telephone: "+1-571-426-6338",
    email: "book@westminsterchariots.com",
    priceRange: "$$$$",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Triangle",
      addressRegion: "VA",
      postalCode: "22172",
      addressCountry: "US",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 38.5449,
      longitude: -77.3211,
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      opens: "00:00",
      closes: "23:59",
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
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Chauffeur Services",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Airport Transfer Service",
            description: "Professional airport pickup and drop-off service to DCA, IAD, and BWI airports.",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Corporate Transportation",
            description: "Executive car service for business meetings, conferences, and corporate events.",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Point-to-Point Service",
            description: "Reliable transportation between any two locations in the DMV area.",
          },
        },
      ],
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      reviewCount: "150",
      bestRating: "5",
      worstRating: "1",
    },
  },
  website: {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/book?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  },

  // FAQ Schema for help/support pages
  faq: {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How far in advance should I book?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "We recommend booking at least 24 hours in advance for guaranteed availability. However, we also accept last-minute bookings based on chauffeur availability. For bookings within 4 hours, please call us directly at (571) 426-6338.",
        },
      },
      {
        "@type": "Question",
        name: "What payment methods do you accept?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "We accept all major credit cards (Visa, Mastercard, American Express, Discover) through our secure Stripe payment system. Corporate accounts can also be set up with monthly billing.",
        },
      },
      {
        "@type": "Question",
        name: "Are your chauffeurs licensed and insured?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, all our chauffeurs are fully licensed, professionally trained, and background-checked. All vehicles are commercially insured with comprehensive coverage for your safety and peace of mind.",
        },
      },
      {
        "@type": "Question",
        name: "What areas do you serve?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "We serve the entire Washington DC Metropolitan Area, including the District of Columbia, Northern Virginia (Arlington, Alexandria, Fairfax, Tysons, McLean), and Maryland (Montgomery County, Prince George's County, Bethesda). We also provide long-distance service to nearby cities.",
        },
      },
      {
        "@type": "Question",
        name: "Do you provide airport transfer services?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, we provide professional airport transfer services to all three major airports: Reagan National (DCA), Dulles International (IAD), and Baltimore/Washington International (BWI). We offer flight tracking and meet & greet services.",
        },
      },
      {
        "@type": "Question",
        name: "What is your cancellation policy?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "You may cancel your reservation up to 24 hours before your scheduled pickup time for a full refund. Cancellations within 24 hours are subject to a cancellation fee. No-shows are non-refundable.",
        },
      },
    ],
  },

  // Breadcrumb helper function
  getBreadcrumb: (items: Array<{ name: string; url: string }>) => ({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.url}`,
    })),
  }),
};
