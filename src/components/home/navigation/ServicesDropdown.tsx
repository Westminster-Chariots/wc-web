"use client";

import { ChevronDown } from "lucide-react";

interface ServicesDropdownProps {
  isDark?: boolean;
}

export default function ServicesDropdown({ isDark = false }: ServicesDropdownProps) {
  const services = [
    { name: "Airport Transfer", href: "/services/airport-transfer" },
    { name: "Corporate Car Service", href: "/services/corporate-car-service" },
    { name: "Hourly Car Service", href: "/services/hourly-car-service" },
    { name: "Long Distance Car Service", href: "/services/long-distance" },
    { name: "Night out", href: "/services/night-out" },
    { name: "Concert Transportation", href: "/services/concert-transportation" },
    { name: "Transportation for Wedding", href: "/services/wedding-transportation" },
    { name: "City Tours", href: "/services/city-tours" },
    { name: "Prom Limo Service", href: "/services/prom-limo" },
    { name: "Date Night", href: "/services/date-night" },
  ];

  return (
    <div className="relative group">
      <a 
        href="/services"
        className={`flex items-center gap-1 text-sm font-medium transition-all duration-300 relative group ${
          isDark ? 'text-white/90 hover:text-white' : 'text-foreground/80 hover:text-foreground'
        }`}
      >
        <span className="relative z-10">Services</span>
        <ChevronDown className="h-3 w-3 group-hover:rotate-180 transition-transform duration-300" />
        <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-blue-gradient scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
      </a>
      
      {/* Dropdown Menu */}
      <div className="absolute top-full left-0 mt-2 w-64 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
        <div className={`rounded-xl border p-2 backdrop-blur-xl shadow-2xl ${
          isDark 
            ? 'bg-black/95 border-white/20' 
            : 'bg-white border-border/50 shadow-xl'
        }`}>
          <div className="space-y-0.5">
            {services.map((service) => (
              <a
                key={service.name}
                href={service.href}
                className={`group/item block text-sm px-4 py-3 rounded-lg transition-all duration-200 relative overflow-hidden ${
                  isDark
                    ? 'text-white/80 hover:text-white hover:bg-white/10'
                    : 'text-foreground/70 hover:text-foreground hover:bg-primary/10'
                }`}
              >
                <span className="relative z-10 flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
                    isDark
                      ? 'bg-blue-400/0 group-hover/item:bg-blue-400 group-hover/item:scale-125'
                      : 'bg-primary/0 group-hover/item:bg-primary group-hover/item:scale-125'
                  }`}></span>
                  <span className="font-medium">{service.name}</span>
                </span>
                <span className={`absolute inset-x-0 bottom-0 h-0.5 scale-x-0 group-hover/item:scale-x-100 transition-transform duration-200 origin-left ${
                  isDark ? 'bg-blue-400' : 'bg-primary'
                }`}></span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}