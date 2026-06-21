"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Users, Briefcase } from "lucide-react";
import { FLEET } from "@/lib/fleet-data";

function FleetCard({ v, index }: { v: (typeof FLEET)[0]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.55, delay: index * 0.12 }}
    >
      <Link
        href="/fleet"
        className="group relative block overflow-hidden rounded-3xl border border-white/8 bg-card/30 backdrop-blur-md transition-all duration-500 hover:border-white/20 hover:bg-card/50"
      >
        <div className="relative aspect-[16/10] overflow-hidden">
          <Image
            src={v.image}
            alt={v.name}
            fill
            className="object-contain transition-transform duration-700 group-hover:scale-[1.03]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
          <span className="absolute left-4 top-4 rounded-full border border-white/15 bg-black/50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-white/90 backdrop-blur-md">
            {v.name}
          </span>
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
        </div>
      </Link>
    </motion.div>
  );
}

export default function FleetSection() {
  return (
    <section className="relative overflow-hidden border-t border-white/5 px-6 py-32 md:px-14">
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
            <h2 className="mt-4 font-serif text-5xl font-light leading-[1.06] tracking-tight md:text-6xl">
              A fleet designed to make an impression.
            </h2>
            <p className="mt-5 text-[1.0625rem] leading-relaxed text-foreground/60">
              Meticulously maintained luxury vehicles, professionally chauffeured to deliver exceptional comfort and presence on every journey.
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
              Explore the fleet <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-2">
          {FLEET.map((v, i) => (
            <FleetCard key={v.slug} v={v} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
