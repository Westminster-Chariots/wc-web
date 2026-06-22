"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { Quote, ArrowRight } from "lucide-react";
import Navigation from "@/components/home/navigation/Navigation";
import Footer from "@/components/home/sections/Footer";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";

const values = [
  {
    title: "Radical Simplicity",
    body: "No hidden fees. No complicated processes. No strings attached. Transportation should be a straightforward promise — honoured without exception.",
  },
  {
    title: "Discretion First",
    body: "Every conversation stays in the car. Every detail of your journey is handled with the same quiet professionalism that discerning clients have come to expect.",
  },
  {
    title: "The Personal Standard",
    body: "You are not a booking number. Every client is known. Every preference is remembered. Service is delivered with intention, not routine.",
  },
];

export default function FounderPage() {
  const router = useRouter();
  const { user, isAdmin, logout } = useAuth();
  const { lang, cycleLang } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await logout();
    router.push("/");
  };

  const displayName = user?.fullName || user?.email?.split("@")[0] || "User";

  return (
    <div className="min-h-screen bg-background">
      <Navigation
        isOnLandingPage={false}
        isScrolled={true}
        isScrollingDown={false}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        user={user}
        isAdmin={isAdmin}
        displayName={displayName}
        handleSignOut={handleSignOut}
        lang={lang}
        cycleLang={cycleLang}
      />

      {/* Hero */}
      <section className="relative overflow-hidden pt-32 pb-20 px-6 md:px-14">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,hsl(var(--primary)/0.08),transparent_60%)]" />
        <div className="relative mx-auto max-w-[1280px]">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-3xl"
          >
            <p className="text-xs font-medium uppercase tracking-[0.45em] text-accent-blue-bright">
              A Message from the Founder
            </p>
            <h1 className="mt-5 font-serif text-5xl font-light leading-[1.08] tracking-tight md:text-6xl lg:text-7xl">
              The Westminster Chariots Standard
            </h1>
            <p className="mt-6 text-lg text-foreground/60 max-w-xl leading-relaxed">
              Why I started this company, what I believe, and the promise I make to every client.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="border-t border-white/5 px-6 py-20 md:px-14">
        <div className="mx-auto max-w-[1280px]">
          <div className="grid gap-16 lg:grid-cols-2 lg:gap-24 lg:items-start">

            {/* Photo */}
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="lg:sticky lg:top-28"
            >
              <div className="relative aspect-[3/4] overflow-hidden rounded-3xl border border-white/10">
                <Image
                  src="/assets/Haroon-Hashmat.jpg"
                  alt="Haroon Hashmat, Founder of Westminster Chariots"
                  fill
                  className="object-cover object-top"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
              </div>

              {/* Name card below photo */}
              <div className="mt-6 rounded-2xl border border-white/10 bg-card/40 p-5 backdrop-blur-md">
                <p className="font-serif text-xl">Haroon Hashmat</p>
                <p className="mt-1 text-sm text-foreground/50 uppercase tracking-[0.2em]">
                  Founder & CEO · Westminster Chariots
                </p>
              </div>
            </motion.div>

            {/* Message */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="flex flex-col gap-8"
            >
              {/* Pull quote */}
              <div className="relative rounded-3xl border border-accent-blue-bright/20 bg-accent-blue-bright/5 px-8 py-7">
                <Quote className="absolute left-6 top-5 h-5 w-5 text-accent-blue-bright/40" />
                <p className="font-serif text-xl font-light leading-relaxed text-foreground/90 md:text-2xl pl-4">
                  I believed that luxury transportation should feel effortless, not complicated. That belief became this company.
                </p>
              </div>

              {/* Body */}
              <div className="space-y-6 text-[1.0625rem] leading-[1.85] text-foreground/70">
                <p>
                  When I looked at the black car industry in the Washington DC area, I saw something that bothered me. Not a shortage of options, there were plenty. What was missing was simplicity.
                </p>
                <p>
                  Too many companies had made transportation needlessly complicated. Fine print. Unexpected conditions. Too many strings attached to what should be, at its core, a straightforward promise: <em className="text-foreground/90 font-medium not-italic">I will take you where you need to go, on time, in comfort, without complication.</em>
                </p>
                <p>
                  I also saw a standard, the standard that discerning clients quietly expect but rarely articulate, being consistently unmet. A certain quality of presence. A level of professionalism that does not need to announce itself. The kind of service where everything simply works, and the client can think about other things.
                </p>
                <p>
                  Westminster Chariots was built to close that gap.
                </p>
                <p>
                  Every booking is handled directly. Every commitment is honoured. Every client is known, not merely accounted for. We do not over-promise, and we never under-deliver. What you see is what you receive, and what you receive is the highest standard we know how to provide.
                </p>
                <p>
                  I am proud of what this company has become. And I am more proud of what it will continue to be, because our standard is not a moment in time. It is a permanent commitment.
                </p>
              </div>

              {/* Signature */}
              <div className="border-t border-white/10 pt-8">
                <p className="font-serif text-2xl font-light italic text-foreground/80">
                  — Haroon Hashmat
                </p>
                <p className="mt-1 text-sm text-foreground/40 uppercase tracking-[0.25em]">
                  Founder, Westminster Chariots
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="border-t border-white/5 bg-card/40 px-6 py-24 md:px-14">
        <div className="mx-auto max-w-[1280px]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-14 text-center"
          >
            <p className="text-xs font-medium uppercase tracking-[0.45em] text-accent-blue-bright">
              The principles behind the promise
            </p>
            <h2 className="mt-4 font-serif text-4xl font-light md:text-5xl">
              What we stand for.
            </h2>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-3">
            {values.map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="rounded-3xl border border-white/10 bg-background/60 p-8 backdrop-blur-md cursor-default"
              >
                <div className="mb-1 text-3xl font-serif font-light text-foreground/20 select-none">
                  0{i + 1}
                </div>
                <h3 className="mt-3 font-serif text-xl font-light text-foreground">
                  {v.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-foreground/60">
                  {v.body}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="border-t border-white/5 px-6 py-24 md:px-14"
      >
        <div className="mx-auto flex max-w-[1280px] flex-col items-center justify-between gap-6 rounded-3xl border border-white/10 bg-background/60 p-10 text-center backdrop-blur-md md:flex-row md:p-14 md:text-left">
          <div>
            <h3 className="font-serif text-3xl font-light md:text-4xl">
              Experience the standard for yourself.
            </h3>
            <p className="mt-3 max-w-xl text-foreground/60">
              Every ride is a direct reflection of the principles Haroon built this company on.
            </p>
          </div>
          <button
            onClick={() => router.push("/book")}
            className="bg-blue-gradient shadow-blue inline-flex shrink-0 items-center gap-2 rounded-full px-8 py-4 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02]"
          >
            Book Your Ride <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </motion.section>

      <Footer />
    </div>
  );
}
