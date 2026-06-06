"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ShieldCheck, ArrowRight } from "lucide-react";

export default function WhyWestminsterSection() {
  const features = [
    "Vetted, professionally trained chauffeurs",
    "Late-model black sedans and SUVs",
    "On-time guarantee with live trip tracking",
    "Transparent flat-rate pricing"
  ];

  const stats = [
    // { value: "15+", label: "Years serving the DMV" },
    { value: "24/7", label: "Dispatch & support" },
    { value: "4.9★", label: "Average client rating" },
    { value: "100%", label: "Licensed & insured" }
  ];

  return (
    <section id="fleet" className="border-t border-white/5 bg-card/40 px-6 py-24 md:px-14 relative z-40">
      <div className="mx-auto max-w-[1280px] grid gap-12 md:grid-cols-2 md:items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="max-w-2xl text-left">
            <p className="text-xs font-medium uppercase tracking-[0.4em] text-accent-blue-bright">
              Why Westminster Chariots?
            </p>
            <h2 className="mt-4 font-serif text-4xl font-light leading-tight md:text-5xl">
              Built on reliability, discretion and exceptional service.
            </h2>
          </div>
          <ul className="mt-8 space-y-5">
            {features.map((line) => (
              <li key={line} className="flex items-start gap-3 text-foreground/80">
                <ShieldCheck className="mt-0.5 h-5 w-5 text-accent-blue-bright" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
          <Link
            href="/services"
            className="bg-blue-gradient shadow-blue mt-10 inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02]"
          >
            Explore services <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-2 gap-4"
        >
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-white/10 bg-background/60 p-6 text-center backdrop-blur-md">
              <div className="font-serif text-4xl">{stat.value}</div>
              <div className="mt-2 text-xs uppercase tracking-[0.2em] text-foreground/60">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}