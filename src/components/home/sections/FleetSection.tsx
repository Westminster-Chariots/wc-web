"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Users, Briefcase } from "lucide-react";
import { FLEET } from "@/lib/fleet-data";

export default function FleetSection() {
  return (
    <section className="relative overflow-hidden border-t border-white/5 px-6 py-24 md:px-14">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,oklch(0.62_0.19_255_/_0.12),transparent_60%)]" />
      <div className="relative mx-auto max-w-[1280px]">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <p className="text-xs font-medium uppercase tracking-[0.4em] text-accent-blue-bright">
              Our Fleet
            </p>
            <h2 className="mt-4 font-serif text-4xl font-light leading-tight md:text-5xl">
              A fleet built for first-class travel.
            </h2>
            <p className="mt-4 text-foreground/70">
              Late-model luxury sedans and SUVs — immaculate, sanitized and professionally chauffeured.
            </p>
          </div>
          <Link
            href="/fleet"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-foreground/90 transition hover:border-accent-blue-bright/40 hover:text-accent-blue-bright"
          >
            Explore the fleet <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {FLEET.map((v) => (
            <Link
              key={v.slug}
              href="/fleet"
              className="group relative overflow-hidden rounded-3xl border border-white/10 bg-background/60 backdrop-blur-md transition-all hover:-translate-y-1 hover:border-accent-blue-bright/40 hover:shadow-blue"
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                <Image
                  src={v.image}
                  alt={v.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <span className="absolute left-4 top-4 rounded-full border border-white/20 bg-black/40 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-white backdrop-blur-md">
                  {v.name}
                </span>
              </div>
              <div className="p-6">
                <h3 className="font-serif text-2xl">{v.category}</h3>
                <div className="mt-4 flex items-center gap-5 text-sm text-foreground/80">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-accent-blue-bright" />
                    <span>{v.passengers} passengers</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-accent-blue-bright" />
                    <span>{v.luggage} luggage</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
