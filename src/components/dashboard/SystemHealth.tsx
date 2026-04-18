"use client";
import { Wifi, CreditCard, Plane, CheckCircle } from "lucide-react";

const services = [
  { name: 'Maps API', icon: Wifi, status: 'operational' as const },
  { name: 'Stripe', icon: CreditCard, status: 'operational' as const },
  { name: 'Flight Track', icon: Plane, status: 'operational' as const },
];

export default function SystemHealth() {
  return (
    <div className="hidden sm:flex items-center gap-4">
      {services.map(s => (
        <div key={s.name} className="flex items-center gap-1.5">
          <CheckCircle className="h-3 w-3 text-status-confirmed" />
          <span className="text-[10px] text-muted-foreground font-body">{s.name}</span>
        </div>
      ))}
    </div>
  );
}
