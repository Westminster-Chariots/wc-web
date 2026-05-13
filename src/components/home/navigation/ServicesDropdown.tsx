"use client";

import { ChevronDown } from "lucide-react";

export default function ServicesDropdown() {
  const services = [
    { name: "Airport Transfer", href: "/services#airport-transfer" },
    { name: "Corporate Car Service", href: "/services#corporate-car-service" },
    { name: "Hourly Car Service", href: "/services#hourly-car-service" },
    { name: "Long Distance Car Service", href: "/services#long-distance-car-service" },
    { name: "Night out", href: "/services#night-out" },
    { name: "Concert Transportation", href: "/services#concert-transportation" },
    { name: "Transportation for Wedding", href: "/services#transportation-for-wedding" },
    { name: "City Tours", href: "/services#city-tours" },
    { name: "Prom Limo Service", href: "/services#prom-limo-service" },
    { name: "Date Night", href: "/services#date-night" },
  ];

  return (
    <div className="relative group">
      <button className="flex items-center gap-1 text-sm text-foreground/80 hover:text-foreground transition-all duration-300 relative group">
        <span className="relative z-10">Services</span>
        <ChevronDown className="h-3 w-3 group-hover:rotate-180 transition-transform duration-300" />
        <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-blue-gradient scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
      </button>
      
      {/* Dropdown Menu */}
      <div className="absolute top-full left-0 mt-2 w-64 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
        <div className="bg-black/95 rounded-xl border border-white/20 p-2 backdrop-blur-xl shadow-2xl">
          <div className="space-y-0.5">
            {services.map((service) => (
              <a
                key={service.name}
                href={service.href}
                className="group block text-sm text-foreground/80 hover:text-foreground px-4 py-3 rounded-lg transition-all duration-300 relative overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400/0 group-hover:bg-blue-400 transition-all duration-300 group-hover:scale-125"></span>
                  <span>{service.name}</span>
                </span>
                <span className="absolute inset-0 bg-blue-gradient/0 group-hover:bg-blue-gradient/5 transition-all duration-300"></span>
                <span className="absolute inset-x-0 -bottom-0.5 h-0.5 bg-blue-gradient scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}