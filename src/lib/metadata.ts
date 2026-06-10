import { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://westminsterchariots.com";
const SITE_NAME = "Westminster Chariots";
const SITE_DESCRIPTION = "Premium chauffeur service across Washington DC, Northern Virginia, and Maryland. Professional black car service with Mercedes-Benz fleet, licensed chauffeurs, and 24/7 availability.";

export const defaultMetadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | Luxury Black Car Service DC, VA, MD`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "luxury car service DC",
    "black car service Washington DC",
    "executive transportation",
    "airport transfer DC",
    "chauffeur service Virginia",
    "chauffeur service Maryland",
    "corporate car service",
    "Mercedes-Benz chauffeur",
    "DCA airport transfer",
    "IAD airport transfer",
    "BWI airport transfer",
    "diplomatic transportation",
    "Northern Virginia car service",
    "DMV chauffeur service",
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
    logo: `${SITE_URL}/assets/wc-logo-no-motto-no-bg.png`,
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
};
