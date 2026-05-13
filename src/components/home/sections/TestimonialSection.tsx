"use client";

import { Star } from "lucide-react";

export default function TestimonialSection() {
  return (
    <section className="border-t border-white/5 px-6 py-24 md:px-14">
      <div className="mx-auto max-w-[900px] text-center">
        <div className="flex justify-center gap-1 text-accent-blue-bright">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className="h-5 w-5 fill-current" />
          ))}
        </div>
        <p className="mt-6 font-serif text-3xl font-light leading-snug text-foreground/90 md:text-4xl">
          "Westminster turned a stressful airport run into the calmest part of my week.
          Polished cars, polished people."
        </p>
        <p className="mt-6 text-sm uppercase tracking-[0.3em] text-foreground/60">
          — M. Hayes, Senior Counsel
        </p>
      </div>
    </section>
  );
}