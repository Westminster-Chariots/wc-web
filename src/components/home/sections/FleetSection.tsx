"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Users, Briefcase, X, Shield, Clock, Star, Wifi, Snowflake, ChevronRight } from "lucide-react";
import { FLEET, type Vehicle } from "@/lib/fleet-data";

const vehicleExtras: Record<string, {
  models: string[];
  features: { icon: React.ElementType; label: string }[];
  highlight: string;
}> = {
  "luxury-sedan": {
    models: ["Mercedes-Benz S-Class", "BMW 7 Series"],
    features: [
      { icon: Star, label: "Premium leather seating" },
      { icon: Snowflake, label: "Four-zone climate control" },
      { icon: Wifi, label: "Complimentary Wi-Fi" },
      { icon: Shield, label: "Privacy partition" },
    ],
    highlight: "For executives who need to think, not navigate.",
  },
  "luxury-suv": {
    models: ["Cadillac Escalade", "Lincoln Navigator"],
    features: [
      { icon: Star, label: "Premium leather seating" },
      { icon: Users, label: "Up to 6 passengers" },
      { icon: Briefcase, label: "Generous luggage capacity" },
      { icon: Snowflake, label: "Dual-zone climate control" },
    ],
    highlight: "Space, presence, and comfort. For groups who expect more.",
  },
};

function VehicleModal({ vehicle, onClose }: { vehicle: Vehicle; onClose: () => void }) {
  const router = useRouter();
  const extras = vehicleExtras[vehicle.slug];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-8"
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-black/75 backdrop-blur-md" />

        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
         className="relative z-10 w-full max-w-3xl max-h-[92vh] overflow-y-auto overflow-x-hidden rounded-3xl border border-white/20 bg-white/[0.08] backdrop-blur-3xl shadow-[0_25px_80px_rgba(0,0,0,0.12)]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute right-5 top-5 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/70 backdrop-blur-md transition hover:bg-white/20 hover:text-white"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Image — Glass Morphism Background */}
          <div className="relative h-36 overflow-hidden bg-white/[0.08] backdrop-blur-2xl sm:h-56 lg:h-72">

            {/* Glass highlight */}
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.28),rgba(255,255,255,0.04)_45%,rgba(255,255,255,0.12))]" />

            {/* Top light reflection */}
            <div className="absolute left-6 top-6 h-20 w-1/2 rounded-full bg-white/20 blur-3xl" />

            {/* Under-car glow */}
            <div className="pointer-events-none absolute bottom-0 left-1/2 h-32 w-3/4 -translate-x-1/2 rounded-full bg-blue-300/20 blur-3xl" />

            <Image
              src={vehicle.image}
              alt={vehicle.name}
              fill
               className="object-contain object-center px-12 pb-2 pt-2 drop-shadow-[0_20px_30px_rgba(0,0,0,0.20)]"
              sizes="(max-width: 768px) 100vw, 768px"
            />

            <div className="absolute bottom-4 left-6">
              <span className="rounded-full border border-white/20 bg-black/40 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.3em] text-white/90 backdrop-blur-md">
                {vehicle.name}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 sm:p-8 bg-white/[0.04] backdrop-blur-xl">
            <h2 className="font-serif text-3xl font-light text-white">{vehicle.category}</h2>

            {extras && (
              <p className="mt-2 text-sm italic text-accent-blue-bright/80">{extras.highlight}</p>
            )}

            <p className="mt-4 text-[0.9375rem] leading-relaxed text-foreground/65">
              {vehicle.description}
            </p>

            {/* Specs row */}
            <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-white/8 pt-6">
              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.25] backdrop-blur-xl
               px-4 py-2 text-sm text-foreground/80">
                <Users className="h-4 w-4 text-accent-blue-bright" />
                {vehicle.passengers} passengers
              </div>
              <div className="flex items-center gap-2 rounded-full border border-white/30 bg-white/[0.25] backdrop-blur-xl
               px-4 py-2 text-sm text-foreground/80">
                <Briefcase className="h-4 w-4 text-accent-blue-bright" />
                {vehicle.luggage} pieces of luggage
              </div>
              <div className="flex items-center gap-2 rounded-full border border-white/30 bg-white/[0.25] backdrop-blur-xl
               px-4 py-2 text-sm text-foreground/80">
                <Clock className="h-4 w-4 text-accent-blue-bright" />
                Available 24/7
              </div>
            </div>

            {/* Models */}
            {extras && (
              <div className="mt-5">
                <p className="text-xs font-medium uppercase tracking-[0.3em] text-foreground/40">Vehicle examples</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {extras.models.map((m) => (
                    <span key={m} className="rounded-md border border-white/18 bg-white/[0.25] backdrop-blur-xl px-3 py-1 text-sm text-foreground/70">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Features */}
            {extras && (
              <div className="mt-5 grid grid-cols-2 gap-3">
                {extras.features.map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-2.5 text-sm text-foreground/60">
                    <Icon className="h-4 w-4 flex-shrink-0 text-accent-blue-bright/70" />
                    {label}
                  </div>
                ))}
              </div>
            )}

            {/* CTA */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => {
                  onClose();
                  router.push("/book");
                }}
                className="bg-blue-gradient shadow-blue inline-flex flex-1 items-center justify-center gap-2 rounded-full px-8 py-4 text-sm font-semibold text-white transition-transform hover:scale-[1.02]"
              >
                Reserve This Ride <ArrowRight className="h-4 w-4" />
              </button>
              <Link
                href="/fleet"
                onClick={onClose}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 px-6 py-4 text-sm font-semibold text-foreground/70 transition hover:border-white/30 hover:text-foreground"
              >
                Full fleet details <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function FleetCard({ v, index, onClick }: { v: Vehicle; index: number; onClick: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.55, delay: index * 0.12 }}
    >
      <button
        onClick={onClick}
        className="group relative block w-full overflow-hidden rounded-3xl border border-white/15 bg-white/[0.06] backdrop-blur-md transition-all duration-500 hover:border-white/25 hover:bg-white/[0.09] text-left cursor-pointer"
      >
        <div className="relative aspect-[16/10] overflow-hidden bg-white">
          <Image
            src={v.image}
            alt={v.name}
            fill
            className="object-contain transition-transform duration-700 group-hover:scale-[1.03]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
          <span className="absolute left-4 top-4 rounded-full border border-white/15 bg-black/50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-white/90 backdrop-blur-md">
            {v.name}
          </span>
          <div className="absolute right-4 top-4 opacity-0 translate-x-2 -translate-y-2 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-300">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/90 shadow-lg">
              <ChevronRight className="h-4 w-4 text-white" />
            </div>
          </div>
        </div>
        <div className="p-7">
          <h3 className="font-serif text-2xl font-light">{v.category}</h3>
          <div className="mt-4 flex items-center gap-6 text-sm text-foreground/60">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>{v.passengers} passengers</span>
            </div>
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              <span>{v.luggage} luggage</span>
            </div>
          </div>
          <p className="mt-3 text-xs font-medium uppercase tracking-[0.2em] text-accent-blue-bright/70 transition-colors duration-300 group-hover:text-accent-blue-bright">
            View profile + reserve
          </p>
        </div>
      </button>
    </motion.div>
  );
}

export default function FleetSection() {
  const [selected, setSelected] = useState<Vehicle | null>(null);

  return (
    <section className="relative overflow-hidden border-t border-white/5 px-5 py-16 md:px-14 md:py-32">
      <div className="relative mx-auto max-w-[1280px]">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <p className="text-xs font-medium uppercase tracking-[0.4em] text-accent-blue-bright">
              Our Fleet
            </p>
            <h2 className="mt-4 font-serif text-4xl font-light leading-[1.06] tracking-tight md:text-5xl lg:text-6xl">
              A vehicle for every moment.
            </h2>
            <p className="mt-5 text-[1.0625rem] leading-relaxed text-foreground/60">
              Each vehicle in our fleet is meticulously maintained and ready for you. Click any vehicle to see its profile and reserve your ride.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="shrink-0"
          >
            <Link
              href="/fleet"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-foreground/80 transition-all hover:border-white/30 hover:text-foreground"
            >
              Full fleet details <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </div>

        <div className="mt-10 md:mt-14 grid gap-5 md:grid-cols-2">
          {FLEET.map((v, i) => (
            <FleetCard key={v.slug} v={v} index={i} onClick={() => setSelected(v)} />
          ))}
        </div>
      </div>

      {selected && (
        <VehicleModal vehicle={selected} onClose={() => setSelected(null)} />
      )}
    </section>
  );
}
