"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

function CountUp({ to, suffix = "", decimals = 0 }: { to: number; suffix?: string; decimals?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    const duration = 1400;
    const steps = 50;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const eased = 1 - Math.pow(1 - step / steps, 3);
      setCount(to * eased);
      if (step >= steps) clearInterval(timer);
    }, duration / steps);
    return () => clearInterval(timer);
  }, [isInView, to]);

  return (
    <span ref={ref}>
      {decimals > 0 ? count.toFixed(decimals) : Math.floor(count)}{suffix}
    </span>
  );
}

const stats = [
  { value: "24/7", label: "Dispatch & support", countTo: null },
  { value: "4.9★", label: "Average client rating", countTo: 4.9, suffix: "★", decimals: 1 },
  { value: "100%", label: "Licensed & insured", countTo: 100, suffix: "%", decimals: 0 },
];

const features = [
  "Chauffeurs selected for professionalism and discretion",
  "Luxury sedans and SUVs maintained to the highest standard",
  "Punctual service backed by real-time flight tracking",
  "Personalized service tailored to every client and journey",
];

export default function WhyWestminsterSection() {
  return (
    <section id="why-westminster" className="border-t border-white/5 px-6 py-32 md:px-14">
      <div className="mx-auto max-w-[1280px]">

        {/* Header — centered */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl text-center"
        >
          <p className="text-xs font-medium uppercase tracking-[0.45em] text-accent-blue-bright">
            Why Westminster Chariots
          </p>
          <h2 className="mt-4 font-serif text-5xl font-light leading-[1.06] tracking-tight md:text-6xl">
            Built on integrity.<br />Driven by excellence.
          </h2>
        </motion.div>

        {/* Stat strip — Apple style large horizontal numbers */}
        <div className="mt-20 grid grid-cols-3 divide-x divide-white/10 border-t border-b border-white/10">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="cursor-default py-12 text-center"
            >
              <div className="font-serif text-6xl font-light tracking-tight text-foreground md:text-7xl">
                {stat.countTo !== null ? (
                  <CountUp to={stat.countTo!} suffix={stat.suffix!} decimals={stat.decimals!} />
                ) : (
                  stat.value
                )}
              </div>
              <div className="mt-3 text-xs uppercase tracking-[0.3em] text-foreground/45">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Features + pull quote */}
        <div className="mt-20 grid gap-12 md:grid-cols-2 md:items-start">
          <ul className="space-y-6">
            {features.map((line, i) => (
              <motion.li
                key={line}
                initial={{ opacity: 0, x: -14 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="flex items-start gap-4 text-foreground/70"
              >
                <span className="mt-[0.55rem] h-[5px] w-[5px] flex-shrink-0 rounded-full bg-accent-blue-bright" />
                <span className="text-[1.0625rem] leading-relaxed">{line}</span>
              </motion.li>
            ))}
          </ul>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col justify-between rounded-3xl border border-white/8 bg-card/30 p-8 backdrop-blur-md"
          >
            <p className="font-serif text-xl font-light leading-[1.7] text-foreground/80 md:text-2xl">
              "The standard our clients quietly expect — but rarely find elsewhere. We deliver it, without exception."
            </p>
            <Link
              href="/services"
              className="bg-blue-gradient shadow-blue mt-8 inline-flex w-fit items-center gap-2 rounded-full px-7 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02]"
            >
              Explore the Experience <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </div>

      </div>
    </section>
  );
}
