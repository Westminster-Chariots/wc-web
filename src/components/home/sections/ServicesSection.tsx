"use client";

import { motion } from "framer-motion";
import ServicesCarousel from "./ServicesCarousel";

export default function ServicesSection() {
  return (
    <section id="services" className="relative overflow-hidden border-t border-white/5 px-6 py-32 md:px-14">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.07),transparent_55%)]" />
      <div className="relative mx-auto max-w-[1280px]">
        <div className="mx-auto max-w-3xl text-center">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-xs font-medium uppercase tracking-[0.45em] text-accent-blue-bright"
          >
            Our Services
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-4 font-serif text-5xl font-light leading-[1.06] tracking-tight md:text-6xl"
          >
            Crafted for every journey.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-5 text-[1.0625rem] leading-relaxed text-foreground/55"
          >
            Whether you're traveling for business, celebrating a milestone, or heading to the airport — every Westminster experience is defined by professionalism, discretion, and exceptional attention to detail.
          </motion.p>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16"
        >
          <ServicesCarousel />
        </motion.div>
      </div>
    </section>
  );
}