"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

interface CTASectionProps {
  ctaSectionRef: React.RefObject<HTMLDivElement | null>;
  scrollToBookingForm: () => void;
}

export default function CTASection({ ctaSectionRef, scrollToBookingForm }: CTASectionProps) {
  return (
    <section ref={ctaSectionRef} className="border-t border-white/5 px-5 py-14 md:px-14 md:py-24">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6 }}
        className="mx-auto flex max-w-[1280px] flex-col items-center justify-between gap-6 rounded-3xl border border-white/8 bg-card/25 p-6 text-center backdrop-blur-md sm:p-10 md:flex-row md:p-16 md:text-left"
      >
        <div>
          <h3 className="font-serif text-3xl font-light leading-[1.1] tracking-tight md:text-4xl lg:text-5xl">
            Travel in luxury.<br />Arrive in style.
          </h3>
          <p className="mt-4 max-w-lg text-base leading-relaxed text-foreground/55">
            From reservation to destination, every detail is handled with care and precision.
          </p>
        </div>
        <button
          onClick={scrollToBookingForm}
          className="bg-blue-gradient shadow-blue inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-full px-8 py-4 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02] sm:w-auto"
        >
          Experience Your Chariot <ArrowRight className="h-4 w-4" />
        </button>
      </motion.div>
    </section>
  );
}