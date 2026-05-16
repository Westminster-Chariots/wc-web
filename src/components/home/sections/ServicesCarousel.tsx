"use client";

import { useRef, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ArrowRight, ArrowLeft, ArrowUpRight } from "lucide-react";
import { SERVICES, type ServiceDetail } from "@/lib/services-data";

const serviceBadges = [
  "Premium Service",
  "Executive Travel",
  "Flexible Scheduling",
  "Luxury Experience",
  "Safe & Reliable",
  "VIP Treatment",
  "Elegant Transport",
  "Professional Service",
  "Memorable Journey",
  "Romantic Experience",
  "Respectful Service"
];

export default function ServicesCarousel() {
  const autoplay = useRef(
    Autoplay({ delay: 4500, stopOnInteraction: false, stopOnMouseEnter: true })
  );
  const [emblaRef, embla] = useEmblaCarousel(
    { loop: true, align: "start", dragFree: false },
    [autoplay.current]
  );

  const scrollPrev = useCallback(() => {
    if (embla) embla.scrollPrev();
  }, [embla]);

  const scrollNext = useCallback(() => {
    if (embla) embla.scrollNext();
  }, [embla]);

  return (
    <div className="relative">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="overflow-hidden"
        ref={emblaRef}
      >
        <div className="flex -ml-6">
          {SERVICES.map((s, index) => (
            <div
              key={s.slug}
              className="min-w-0 shrink-0 grow-0 basis-full pl-6 sm:basis-1/2 lg:basis-1/3"
            >
              <ServiceSlide service={s} badge={serviceBadges[index]} />
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mt-10 flex items-center justify-between gap-4"
      >
        <Link
          href="/services"
          className="group inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.25em] text-foreground/80 transition hover:text-foreground"
        >
          View all services
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={scrollPrev}
            aria-label="Previous service"
            className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-card/60 backdrop-blur-md border border-border text-foreground transition hover:scale-105 hover:bg-card"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={scrollNext}
            aria-label="Next service"
            className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition hover:scale-105"
          >
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function ServiceSlide({ service, badge }: { service: ServiceDetail; badge: string }) {
  return (
    <Link
      href={`/services/${service.slug}`}
      className="group relative block h-[460px] overflow-hidden rounded-2xl border border-border bg-card/40 transition-all duration-300 hover:shadow-2xl"
    >
      <div className="absolute inset-0">
        <Image
          src={service.image}
          alt={service.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
          priority={false}
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10 transition-opacity duration-500 group-hover:from-black/95 group-hover:via-black/50" />
      <div className="absolute inset-0 bg-gradient-to-br from-black/30 via-transparent to-transparent" />

      <div className="absolute left-5 top-5 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/40 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.25em] text-white backdrop-blur-md transition-all duration-300 group-hover:bg-black/60">
        {badge}
      </div>

      {/* Arrow button on hover */}
      <div className="absolute right-5 top-5 opacity-0 translate-x-2 translate-y-2 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-300 pointer-events-none">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary shadow-lg">
          <ArrowUpRight className="h-5 w-5 text-white" />
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 p-6">
        <p className="font-serif text-xl italic text-white/85">{service.tagline}</p>
        <h3 className="mt-2 font-serif text-3xl leading-tight text-white">{service.title}</h3>
        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-white/75">{service.shortDesc}</p>
      </div>
    </Link>
  );
}
