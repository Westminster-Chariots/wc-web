"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, ChevronDown } from "lucide-react";
import { SERVICES } from "@/lib/services-data";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRouter } from "next/navigation";
import Navigation from "@/components/home/navigation/Navigation";
import Footer from "@/components/home/sections/Footer";

const serviceBadges = [
  "Premium Service",
  "Executive Travel",
  "Flexible Scheduling",
  "Luxury Experience",
  "Safe & Reliable",
  "VIP Treatment",
  "Elegant Transport",
  "Professional Service",
  "Memorable Journey",
  "Romantic Experience",
  "Respectful Service"
];

export default function ServicesPage() {
  const { user, isAdmin, logout } = useAuth();
  const { lang, cycleLang } = useLanguage();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isScrollingDown, setIsScrollingDown] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isOnLandingPage, setIsOnLandingPage] = useState(true);

  const handleSignOut = async () => {
    await logout();
    router.push("/");
  };

  const displayName = user?.fullName || user?.email?.split("@")[0] || "User";

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const heroHeight = window.innerHeight;
      
      setIsScrolled(currentScrollY > 50);
      const onLanding = currentScrollY < heroHeight - 100;
      setIsOnLandingPage(onLanding);
      setIsScrollingDown(currentScrollY > lastScrollY && currentScrollY > 100);
      setLastScrollY(currentScrollY);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <Navigation
        isOnLandingPage={isOnLandingPage}
        isScrolled={isScrolled}
        isScrollingDown={isScrollingDown}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        user={user}
        isAdmin={isAdmin}
        displayName={displayName}
        handleSignOut={handleSignOut}
        lang={lang}
        cycleLang={cycleLang}
      />

      {/* Hero Section with Background Image */}
      <section className="relative min-h-screen overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/assets/benz-c350.jpg"
            alt="Premium chauffeur service"
            fill
            priority
            className="object-cover scale-105"
          />
          <div className="absolute inset-0 bg-black/25" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/10 to-black/70" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.55)_100%)]" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 mx-auto flex min-h-screen max-w-[1400px] flex-col items-center justify-center px-6 text-center">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-5 text-xs font-medium uppercase tracking-[0.45em] text-white/80"
          >
            Our Premium Services
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="font-serif text-6xl font-light leading-[1.05] tracking-tight text-white/95 drop-shadow-[0_2px_24px_rgba(0,0,0,0.55)] md:text-7xl lg:text-[5.5rem]"
          >
            A ride for every occasion.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-6 max-w-2xl text-lg font-medium text-white/70"
          >
            From a single airport transfer to a full week of executive travel, every Westminster journey is tailored, on time, and impeccably presented.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-10"
          >
            <Link
              href="/book"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-sm font-semibold text-primary-foreground shadow-lg transition-transform hover:scale-[1.02]"
            >
              Book a ride <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="absolute bottom-8 left-1/2 z-20 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="flex flex-col items-center gap-2 text-white/60"
          >
            <span className="text-xs uppercase tracking-wider">Explore Services</span>
            <ChevronDown className="h-5 w-5" />
          </motion.div>
        </motion.div>
      </section>

      {/* Services Grid */}
      <section className="py-16 sm:py-24 border-t border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <p className="text-xs font-medium uppercase tracking-[0.4em] text-primary mb-4">
              Complete Service Portfolio
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-light text-foreground mb-4">
              Crafted for every journey
            </h2>
            <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
              Professional chauffeur services across Washington DC, Maryland, and Virginia.
            </p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((s, index) => (
              <motion.div
                key={s.slug}
                id={s.slug}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
              >
                <Link
                  href={`/services/${s.slug}`}
                  className="group relative block h-[460px] overflow-hidden rounded-2xl border border-border bg-card/40 transition-all duration-300 hover:shadow-2xl hover:border-primary/50"
                >
                  <div className="absolute inset-0">
                    <Image
                      src={s.image}
                      alt={s.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10 transition-opacity duration-500 group-hover:from-black/95 group-hover:via-black/50" />
                  <div className="absolute inset-0 bg-gradient-to-br from-black/30 via-transparent to-transparent" />

                  <div className="absolute left-5 top-5 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/40 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.25em] text-white backdrop-blur-md transition-all duration-300 group-hover:bg-black/60">
                    {serviceBadges[index]}
                  </div>

                  {/* Arrow button on hover */}
                  <div className="absolute right-5 top-5 opacity-0 translate-x-2 translate-y-2 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-300 pointer-events-none">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary shadow-lg">
                      <ArrowUpRight className="h-5 w-5 text-white" />
                    </div>
                  </div>

                  <div className="absolute inset-x-0 bottom-0 p-6">
                    <p className="font-serif text-xl italic text-white/85">{s.tagline}</p>
                    <h3 className="mt-2 font-serif text-3xl leading-tight text-white">{s.title}</h3>
                    <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-white/75">{s.shortDesc}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24 border-t border-border/50 bg-card/40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-serif text-3xl sm:text-4xl font-light text-foreground mb-4">
              Ready when you are.
            </h2>
            <p className="text-lg text-foreground/70 mb-8">
              Reserve in seconds — your chauffeur takes care of the rest.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/book"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-sm font-semibold text-primary-foreground shadow-lg transition-transform hover:scale-[1.02]"
              >
                Book a ride <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/help"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-8 py-4 text-sm font-semibold text-foreground transition-all hover:bg-card hover:border-primary/50"
              >
                Contact Us
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
