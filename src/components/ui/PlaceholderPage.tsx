"use client";
import PageTransition from "@/components/ui/PageTransition";
import { Users, Car, Map, DollarSign, Megaphone, Shield } from "lucide-react";

const placeholders = {
  clients: { icon: Users, title: "Clients", description: "Client management, profiles, and booking history will be available here." },
  drivers: { icon: Users, title: "Drivers", description: "Driver management, assignments, and performance tracking will be available here." },
  fleet: { icon: Car, title: "Fleet", description: "Vehicle inventory, maintenance tracking, and availability management will be available here." },
  map: { icon: Map, title: "Live Map", description: "Real-time driver locations and active trip tracking will be available here." },
  pricing: { icon: DollarSign, title: "Pricing", description: "Pricing configuration, rate equations, and flat zones will be available here." },
  campaigns: { icon: Megaphone, title: "Campaigns", description: "Email campaign management and analytics will be available here." },
  audit: { icon: Shield, title: "Audit Log", description: "Admin action history and system logs will be available here." },
  settings: { icon: Shield, title: "Settings", description: "System configuration and preferences will be available here." },
};

export function createPlaceholderPage(key: keyof typeof placeholders) {
  const { icon: Icon, title, description } = placeholders[key];
  
  return function PlaceholderPage() {
    return (
      <PageTransition>
        <div className="p-4 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <Icon className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-display font-bold text-foreground">{title}</h1>
          </div>
          <div className="glass p-12 rounded-xl border border-white/[0.06] text-center">
            <Icon className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-40" />
            <p className="text-lg font-display text-muted-foreground mb-2">{title} Coming Soon</p>
            <p className="text-sm text-muted-foreground font-body">{description}</p>
          </div>
        </div>
      </PageTransition>
    );
  };
}
