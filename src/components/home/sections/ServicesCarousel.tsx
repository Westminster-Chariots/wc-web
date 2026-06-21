"use client";

import { useRef, useCallback, useEffect } from "react";
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
  "Respectful Service",
];

export default function ServicesCarousel() {
  const innerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const autoplay = useRef(
    Autoplay({ delay: 4500, stopOnInteraction: false, stopOnMouseEnter: true })
  );
  const [emblaRef, embla] = useEmblaCarousel(
    { loop: true, align: "center", dragFree: false },
    [autoplay.current]
  );

  const updateTweens = useCallback(() => {
    if (!embla) return;
    const snaps = embla.scrollSnapList();
    const progress = embla.scrollProgress();
    const count = snaps.length;

    snaps.forEach((snap, i) => {
      let diff = snap - progress;
      // Shortest-path distance for loop
      if (diff > 0.5) diff -= 1;
      if (diff < -0.5) diff += 1;

      const distSlides = diff * count;
      const absD = Math.min(Math.abs(distSlides), 3.5);

      // Cylindrical wheel: cards rotate away AND recede into screen depth
      const rotateY = distSlides * 30;            // 30deg per slide — dramatic spin
      const translateZ = -(absD * absD) * 55;     // quadratic Z: 0→0px, 1→-55px, 2→-220px
      const scale = Math.max(0.55, 1 - absD * 0.1);
      const translateY = absD * absD * 5;         // arc sag: center sits high, sides drop
      const opacity = Math.max(0.12, 1 - absD * 0.3);

      const el = innerRefs.current[i];
      if (!el) return;
      el.style.transform = `perspective(1600px) rotateY(${rotateY}deg) translateZ(${translateZ}px) scale(${scale}) translateY(${translateY}px)`;
      el.style.opacity = String(opacity);
      el.style.zIndex = String(Math.round(10 - absD * 3));
    });
  }, [embla]);

  useEffect(() => {
    if (!embla) return;
    embla.on("scroll", updateTweens);
    embla.on("reInit", updateTweens);
    updateTweens();
    return () => {
      embla.off("scroll", updateTweens);
      embla.off("reInit", updateTweens);
    };
  }, [embla, updateTweens]);

  const scrollPrev = useCallback(() => embla?.scrollPrev(), [embla]);
  const scrollNext = useCallback(() => embla?.scrollNext(), [embla]);

  return (
    <div className="relative">
      {/* Mask wrapper — edges fade so cards "emerge" from the sides like a turning wheel */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        style={{
          WebkitMaskImage:
            "linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)",
          maskImage:
            "linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)",
        }}
      >
        <div ref={emblaRef} className="overflow-hidden py-14">
          <div className="flex -ml-6">
            {SERVICES.map((s, index) => (
              <div
                key={s.slug}
                className="min-w-0 shrink-0 grow-0 basis-full pl-6 sm:basis-[80%] lg:basis-[50%]"
              >
                <div
                  ref={(el) => {
                    innerRefs.current[index] = el;
                  }}
                  className="relative"
                  style={{
                    transition:
                      "transform 0.55s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.55s ease",
                    willChange: "transform, opacity",
                  }}
                >
                  <ServiceSlide
                    service={s}
                    badge={serviceBadges[index % serviceBadges.length]}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mt-6 flex items-center justify-between gap-4"
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

function ServiceSlide({
  service,
  badge,
}: {
  service: ServiceDetail;
  badge: string;
}) {
  return (
    <Link
      href={`/services/${service.slug}`}
      className="group relative block h-[480px] overflow-hidden rounded-3xl border border-white/10 bg-card/40 transition-shadow duration-300 hover:shadow-[0_0_60px_rgba(59,130,246,0.15)]"
    >
      {/* Image */}
      <div className="absolute inset-0">
        <Image
          src={service.image}
          alt={service.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 50vw"
          className="object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.06]"
          priority={false}
        />
      </div>

      {/* Gradients */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/35 to-black/5" />
      <div className="absolute inset-0 bg-gradient-to-br from-black/25 via-transparent to-transparent" />

      {/* Badge */}
      <div className="absolute left-5 top-5 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/50 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.25em] text-white backdrop-blur-md">
        {badge}
      </div>

      {/* Arrow on hover */}
      <div className="absolute right-5 top-5 opacity-0 -translate-y-2 translate-x-2 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all duration-300 pointer-events-none">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary shadow-lg shadow-primary/30">
          <ArrowUpRight className="h-5 w-5 text-white" />
        </div>
      </div>

      {/* Text */}
      <div className="absolute inset-x-0 bottom-0 p-7">
        <p className="font-serif text-lg italic text-white/70 leading-snug">
          {service.tagline}
        </p>
        <h3 className="mt-2 font-serif text-[1.9rem] leading-tight text-white font-light">
          {service.title}
        </h3>
        <p className="mt-3 line-clamp-2 text-[0.8125rem] leading-relaxed text-white/60">
          {service.shortDesc}
        </p>
        <div className="mt-5 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/50 transition-colors duration-300 group-hover:text-accent-blue-bright">
          Learn more
          <ArrowRight className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
}
