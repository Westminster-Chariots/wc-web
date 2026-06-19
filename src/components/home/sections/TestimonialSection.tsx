"use client";

import GoogleReviews from "@/components/GoogleReviews";

export default function TestimonialSection() {
  return (
    <section className="border-t border-white/5 bg-card/40 px-6 py-24 md:px-14">
      <div className="mx-auto max-w-[1280px]">
        <div className="mb-14 text-center">
          <p className="text-xs font-medium uppercase tracking-[0.4em] text-accent-blue-bright">
            What our clients say
          </p>
          <h2 className="mt-4 font-serif text-4xl font-light md:text-5xl">In their own words.</h2>
        </div>
        <GoogleReviews />
      </div>
    </section>
  );
}