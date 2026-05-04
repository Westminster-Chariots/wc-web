"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Shield, Clock, Users, Award } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 w-full z-50 glass-frosted border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 h-14 sm:h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back to Home</span>
          </Link>
          <Link href="/" className="flex items-center gap-2">
            <Image src="/assets/wc-logo-white.png" alt="WC" width={32} height={32} className="object-contain" />
            <span className="text-xs font-display font-semibold text-foreground uppercase tracking-wider">Westminster Chariots</span>
          </Link>
          <div className="w-20" />
        </div>
      </header>

      <main className="pt-20 sm:pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-foreground mb-6">
              About Westminster Chariots
            </h1>

            <div className="prose prose-sm sm:prose-base max-w-none">
              <p className="text-base sm:text-lg text-muted-foreground font-body leading-relaxed mb-8">
                Westminster Chariots is a private black car service offering a considered and exacting standard of transportation across the DMV. We serve individuals and institutions who require precision, discretion, and the assurance of movement without interruption.
              </p>

              <div className="my-12 rounded-xl overflow-hidden">
                <Image 
                  src="/assets/hero-mercedes.jpg" 
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
                  <div key={item.title} className="glass rounded-xl p-6">
                    <item.icon className="h-8 w-8 text-primary mb-3" />
                    <h3 className="text-lg font-display font-semibold text-foreground mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground font-body">{item.desc}</p>
                  </div>
                ))}
              </div>

              <div className="glass rounded-xl p-8 my-12 text-center">
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
                  <p><strong className="text-foreground">Phone:</strong> <a href="tel:+15714266338" className="text-primary hover:underline">(571) 426-6338</a></p>
                  <p><strong className="text-foreground">Email:</strong> <a href="mailto:book@westminsterchariots.com" className="text-primary hover:underline">book@westminsterchariots.com</a></p>
                  <p><strong className="text-foreground">Location:</strong> Triangle, VA · Washington DC Metropolitan Area</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
