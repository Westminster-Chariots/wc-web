"use client";

import { motion } from "framer-motion";
import GoogleReviews from "@/components/GoogleReviews";

export default function TestimonialSection() {
  return (
    <section className="border-t border-white/5 bg-card/40 px-6 py-24 md:px-14">
      <div className="mx-auto max-w-[1280px]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-14 text-center"
        >
          <p className="text-xs font-medium uppercase tracking-[0.4em] text-accent-blue-bright">
            What our clients say
          </p>
          <h2 className="mt-4 font-serif text-4xl font-light md:text-5xl">In their own words.</h2>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          <GoogleReviews />
        </motion.div>
      </div>
    </section>
  );
}
