"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Shield, Clock, Star, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

interface HeroSectionProps {
  heroRef: React.RefObject<HTMLDivElement | null>;
  typedText: string;
  bookingMode: "oneway" | "hourly";
  setBookingMode: (mode: "oneway" | "hourly") => void;
  pickup: string;
  dropoff: string;
  pickupDate: string;
  pickupTime: string;
  bookingFormRef: React.RefObject<HTMLDivElement | null>;
  openModal: (type: "pickup" | "dropoff" | "date" | "time", event: React.MouseEvent) => void;
  handleSearch: () => void;
}

export default function HeroSection({
  heroRef,
  typedText,
  bookingMode,
  setBookingMode,
  pickup,
  dropoff,
  pickupDate,
  pickupTime,
  bookingFormRef,
  openModal,
  handleSearch,
}: HeroSectionProps) {
  const { t } = useLanguage();
  
  return (
    <section ref={heroRef} className="relative min-h-screen flex items-center pt-20" data-theme="dark">
      <div className="absolute inset-0 z-0">
        <Image 
          src="/assets/home-banner-image.png" 
          alt="Your chauffeur awaits" 
          fill 
          className="object-cover brightness-125" 
          priority 
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/15" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/5 to-black/50" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(0,0,0,0.4)_100%)]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 w-full py-20">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-5 text-xs font-medium uppercase tracking-[0.45em] text-white/90"
          >
            DC's Premier Black Car Service
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="font-serif text-6xl font-light leading-[1.05] tracking-tight text-white drop-shadow-[0_2px_24px_rgba(0,0,0,0.55)] md:text-7xl lg:text-[5.5rem]"
          >
            Your Chariot Awaits.
          </motion.h1>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-6 max-w-xl mx-auto text-sm font-medium uppercase tracking-[0.3em] text-white/80 h-8"
          >
            {typedText}<span className="animate-pulse">|</span>
          </motion.div>
        </div>

        {/* Toggle Buttons */}
        {/* <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-14 mb-4 flex justify-center"
        >
          <div className="inline-flex items-center rounded-full border border-white/15 bg-black/35 p-1 backdrop-blur-md">
            <button 
              onClick={() => setBookingMode("oneway")}
              className={`rounded-full px-7 py-2.5 text-sm font-semibold transition-all duration-300 ${bookingMode === "oneway" ? 'bg-blue-gradient shadow-blue text-white' : 'text-white/85 hover:text-white'}`}
            >
              One way
            </button>
            <button 
              onClick={() => setBookingMode("hourly")}
              className={`rounded-full px-7 py-2.5 text-sm font-semibold transition-all duration-300 ${bookingMode === "hourly" ? 'bg-blue-gradient shadow-blue text-white' : 'text-white/85 hover:text-white'}`}
            >
              By the hour
            </button>
          </div>
        </motion.div> */}

        {/* Booking Form */}
        <motion.div
          ref={bookingFormRef}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-1"
        >
          <div className=" max-w-[1280px] mx-auto glass-strong rounded-md p-0 flex flex-col md:flex-row md:items-center overflow-hidden md:mt-28">
            <div className="flex flex-col md:flex-row md:items-center w-full">
              {/* Pickup */}
              <button
                data-field="pickup"
                onClick={(e) => openModal("pickup", e)}
                className="group block px-6 py-4 transition-colors hover:bg-white/[0.03] flex-1 text-left"
              >
                <div className="text-[12px] font-semibold text-white">{t.booking.pickupLocation}</div>
                <div className="mt-1 border-b border-white/15 pb-1">
                  <div className="text-[14px] text-white">
                    {pickup || <span className="text-white/50">Address, airport, hotel, …</span>}
                  </div>
                </div>
              </button>

              <div className="hidden md:block h-12 w-px bg-white/10" />

              {/* Dropoff (only for oneway) */}
              {bookingMode === "oneway" && (
                <>
                  <button
                    data-field="dropoff"
                    onClick={(e) => openModal("dropoff", e)}
                    className="group block px-6 py-4 transition-colors hover:bg-white/[0.03] flex-1 text-left"
                  >
                    <div className="text-[12px] font-semibold text-white">{t.booking.dropoffLocation}</div>
                    <div className="mt-1 border-b border-white/15 pb-1">
                      <div className="text-[14px] text-white">
                        {dropoff || <span className="text-white/50">Address, airport, hotel, …</span>}
                      </div>
                    </div>
                  </button>
                  <div className="hidden md:block h-12 w-px bg-white/10" />
                </>
              )}

              {/* Date */}
              <button
                data-field="date"
                onClick={(e) => openModal("date", e)}
                className="group block px-6 py-4 transition-colors hover:bg-white/[0.03] md:w-[200px] text-left"
              >
                <div className="text-[12px] font-semibold text-white">{t.booking.pickupDate}</div>
                <div className="mt-1 border-b border-white/15 pb-1">
                  <div className="text-[14px] text-white">
                    {pickupDate || <span className="text-white/50">Select a date</span>}
                  </div>
                </div>
              </button>

              <div className="hidden md:block h-12 w-px bg-white/10" />

              {/* Time */}
              <button
                data-field="time"
                onClick={(e) => openModal("time", e)}
                className="group block px-6 py-4 transition-colors hover:bg-white/[0.03] md:w-[200px] text-left"
              >
                <div className="text-[12px] font-semibold text-white">{t.booking.pickupTime}</div>
                <div className="mt-1 border-b border-white/15 pb-1">
                  <div className="text-[14px] text-white">
                    {pickupTime || <span className="text-white/50">Select time</span>}
                  </div>
                </div>
              </button>

              {/* Submit Button */}
              <div className="p-3 md:p-4">
                <Button
                  onClick={handleSearch}
                  className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-lg shadow-blue-500/50 w-full md:w-auto rounded-full px-10 py-5 text-base font-bold text-white transition-all hover:scale-105 hover:shadow-xl hover:shadow-blue-500/60 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  disabled={!pickup || (bookingMode === "oneway" && !dropoff) || !pickupDate || !pickupTime}
                >
                  {t.hero.bookNow}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Trust Badges */}
        {/* <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-wrap items-center justify-center gap-8 mt-8"
        >
          <div className="flex items-center gap-2 text-white/90">
            <Shield className="h-5 w-5" />
            <span className="text-sm">Licensed & Insured</span>
          </div>
          <div className="flex items-center gap-2 text-white/90">
            <Clock className="h-5 w-5" />
            <span className="text-sm">24/7 Available</span>
          </div>
          <div className="flex items-center gap-2 text-white/90">
            <Star className="h-5 w-5" />
            <span className="text-sm">5-Star Rated</span>
          </div>
        </motion.div> */}
      </div>
    </section>
  );
}