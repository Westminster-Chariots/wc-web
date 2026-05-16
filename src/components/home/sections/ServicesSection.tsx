"use client";

import { motion } from "framer-motion";
import ServicesCarousel from "./ServicesCarousel";

export default function ServicesSection() {
  return (
    <section id="services" className="relative overflow-hidden border-t border-border/50 px-6 py-24 md:px-14">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.12),transparent_60%)]" />
      <div className="relative mx-auto max-w-[1280px]">
        <div className="max-w-2xl mx-auto text-center">
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-xs font-medium uppercase tracking-[0.4em] text-primary"
          >
            Our Services
          </motion.p>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-4 font-serif text-4xl font-light leading-tight md:text-5xl"
          >
            Crafted for every journey.
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-4 text-foreground/70"
          >
            From flight-tracked airport runs to wedding-day choreography — every Westminster ride is built on safety, comfort and quiet excellence.
          </motion.p>
        </div>
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-14"
        >
          <ServicesCarousel />
        </motion.div>
      </div>
    </section>
  );
}