"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { Shield, Clock, Users, Award, ArrowRight } from "lucide-react";
import Navigation from "@/components/home/navigation/Navigation";
import Footer from "@/components/home/sections/Footer";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";

export default function AboutPage() {
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
      {/* Navigation */}
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

      {/* Hero Section with Background Image */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/assets/home-banner-image.png"
            alt="Westminster Chariots - About Us"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
        </div>

        <div className="relative z-20">
          <Navigation
            isOnLandingPage={false}
            isScrolled={false}
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
        </div>

        <div className="relative z-10 mx-auto max-w-[1280px] px-6 py-24 text-center md:px-14 md:py-32">
          <p className="text-xs font-medium uppercase tracking-[0.45em] text-white/80">
            About Westminster Chariots
          </p>
          <h1 className="mt-5 font-serif text-5xl font-light leading-[1.05] tracking-tight text-white drop-shadow-[0_2px_24px_rgba(0,0,0,0.55)] md:text-7xl">
            Precision. Discretion. Excellence.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/80">
            A private black car service offering a considered and exacting standard of transportation across the DMV.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="border-t border-white/5">
        <div className="max-w-4xl mx-auto px-6 py-20 md:px-14 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="prose prose-sm sm:prose-base max-w-none">
              <p className="text-base sm:text-lg text-muted-foreground font-body leading-relaxed mb-8">
                Westminster Chariots is a private black car service offering a considered and exacting standard of transportation across the DMV. We serve individuals and institutions who require precision, discretion, and the assurance of movement without interruption.
              </p>

              <div className="my-12 rounded-xl overflow-hidden">
                <Image 
                  src="/assets/hero-car.jpg" 
                  alt="Westminster Chariots luxury vehicle" 
                  width={1200} 
                  height={600} 
                  className="w-full h-auto"
                />
              </div>

              <h2 className="text-2xl font-display font-bold text-foreground mt-12 mb-4">Our Philosophy</h2>
              <p className="text-muted-foreground font-body leading-relaxed mb-6">
                Our philosophy is one of quiet discipline. Travel should unfold with certainty—unhurried, composed, and entirely without strain. From the earliest departure to the final arrival, each journey is executed with punctuality, attentiveness, and a level of care that affords ease, comfort, and continuity throughout.
              </p>

              <p className="text-muted-foreground font-body leading-relaxed mb-6">
                We are not defined by a fleet, but by the standard we maintain. Every engagement is conducted with professionalism and restraint. Conversations remain confidential. Commitments are honoured without exception. Service is delivered with a sense of order and intention, never excess.
              </p>

              <h2 className="text-2xl font-display font-bold text-foreground mt-12 mb-4">Who We Serve</h2>
              <p className="text-muted-foreground font-body leading-relaxed mb-6">
                Westminster Chariots supports executives, principals, families, and organisations who expect their arrangements to function without question. The objective is not merely to arrive, but to do so with quiet assurance and complete reliability.
              </p>

              <div className="grid sm:grid-cols-2 gap-6 my-12">
                {[
                  { icon: Shield, title: "Licensed & Insured", desc: "Fully compliant with all regulatory requirements" },
                  { icon: Clock, title: "24/7 Availability", desc: "Round-the-clock service for your convenience" },
                  { icon: Users, title: "Professional Chauffeurs", desc: "Experienced, vetted, and discreet drivers" },
                  { icon: Award, title: "Premium Fleet", desc: "Immaculately maintained luxury vehicles" },
                ].map((item) => (
                  <div key={item.title} className="rounded-2xl border border-white/10 bg-background/60 p-6 backdrop-blur-md">
                    <item.icon className="h-8 w-8 text-accent-blue-bright mb-3" />
                    <h3 className="text-lg font-display font-semibold text-foreground mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground font-body">{item.desc}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-3xl border border-white/10 bg-background/60 backdrop-blur-md p-8 my-12 text-center">
                <p className="text-lg sm:text-xl font-display text-foreground italic">
                  "Because the finest standard of travel is not something announced—<br className="hidden sm:block" />
                  it is something understood."
                </p>
              </div>

              <h2 className="text-2xl font-display font-bold text-foreground mt-12 mb-4">Service Area</h2>
              <p className="text-muted-foreground font-body leading-relaxed mb-6">
                We proudly serve the Washington DC Metropolitan Area, including Virginia, Maryland, and the District of Columbia. Our service extends to all major airports, corporate centers, and residential areas throughout the region.
              </p>

              <div className="mt-12 pt-8 border-t border-border">
                <h2 className="text-2xl font-display font-bold text-foreground mb-4">Contact Us</h2>
                <div className="space-y-2 text-muted-foreground font-body">
                  <p><strong className="text-foreground">Phone:</strong> <a href="tel:+15714266338" className="text-accent-blue-bright hover:underline">(571) 426-6338</a></p>
                  <p><strong className="text-foreground">Email:</strong> <a href="mailto:info@westminsterchariots.com" className="text-accent-blue-bright hover:underline">info@westminsterchariots.com</a></p>
                  <p><strong className="text-foreground">Location:</strong> Triangle, VA · Washington DC Metropolitan Area</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* CTA Section */}
      <section className="border-t border-white/5 px-6 py-24 md:px-14">
        <div className="mx-auto flex max-w-[1280px] flex-col items-center justify-between gap-6 rounded-3xl border border-white/10 bg-background/60 p-10 text-center backdrop-blur-md md:flex-row md:p-14 md:text-left">
          <div>
            <h3 className="font-serif text-3xl font-light md:text-4xl">Ready to experience Westminster?</h3>
            <p className="mt-3 max-w-xl text-foreground/70">
              Book your first ride and discover why discerning clients choose Westminster Chariots for their transportation needs.
            </p>
          </div>
          <button
            onClick={() => router.push("/book")}
            className="bg-blue-gradient shadow-blue inline-flex items-center gap-2 rounded-full px-8 py-4 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02]"
          >
            Book your ride <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
