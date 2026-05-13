"use client";

import { ArrowRight } from "lucide-react";

interface CTASectionProps {
  ctaSectionRef: React.RefObject<HTMLDivElement | null>;
  scrollToBookingForm: () => void;
}

export default function CTASection({ ctaSectionRef, scrollToBookingForm }: CTASectionProps) {
  return (
    <section ref={ctaSectionRef} className="border-t border-white/5 bg-card/40 px-6 py-20 md:px-14">
      <div className="mx-auto flex max-w-[1280px] flex-col items-center justify-between gap-6 rounded-2xl border border-white/10 bg-background/60 p-10 text-center backdrop-blur-md md:flex-row md:text-left">
        <div>
          <h3 className="font-serif text-3xl font-light md:text-4xl">Ready when you are.</h3>
          <p className="mt-2 text-foreground/70">
            Reserve in seconds — your chauffeur takes care of the rest.
          </p>
        </div>
        <button
          onClick={scrollToBookingForm}
          className="bg-blue-gradient shadow-blue inline-flex items-center gap-2 rounded-full px-8 py-4 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02]"
        >
          Book a ride <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}