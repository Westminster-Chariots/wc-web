import { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://westminsterchariots.com";

export default function sitemap(): MetadataRoute.Sitemap {
  // Static pages
  const staticPages = [
    "",
    "/about-us",
    "/fleet",
    "/services",
    "/help",
    "/book",
    "/auth",
    // "/careers",
    "/privacy",
    "/terms",
  ];

  // Service pages
  const services = [
    "airport-transfer",
    "corporate-car-service",
    "hourly-car-service",
    "long-distance",
    "night-out",
    "concert-transportation",
    "wedding-transportation",
    "city-tours",
    "prom-limo",
    "date-night",
  ];

  return [
    // Static pages
    ...staticPages.map((path) => ({
      url: `${SITE_URL}${path}`,
      lastModified: new Date(),
      changeFrequency: path === "" ? "daily" : "weekly" as const,
      priority: path === "" ? 1.0 : path === "/book" ? 0.9 : 0.8,
    })),
    
    // Service pages
    ...services.map((service) => ({
      url: `${SITE_URL}/services/${service}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
