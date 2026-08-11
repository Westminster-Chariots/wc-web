"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { seedBookingStore } from "@/hooks/useBookingStore";
import { structuredData } from "@/lib/metadata";
import { notify } from "@/lib/notify";
import { hourlyBookingAvailabilityService, serviceService } from "@/lib/services";

// Import Components
import Navigation from "@/components/home/navigation/Navigation";
import HeroSection, { HOURLY_DURATION_DEFAULT_HOURS } from "@/components/home/sections/HeroSection";
import ServicesSection from "@/components/home/sections/ServicesSection";
import WhyWestminsterSection from "@/components/home/sections/WhyWestminsterSection";
import FleetSection from "@/components/home/sections/FleetSection";
import TestimonialSection from "@/components/home/sections/TestimonialSection";
import ContactSection from "@/components/home/sections/ContactSection";
import CTASection from "@/components/home/sections/CTASection";
import Footer from "@/components/home/sections/Footer";
import FloatingCTA from "@/components/home/navigation/FloatingCTA";
import AudioPlayer from "@/components/home/AudioPlayer";
import BookingModals from "@/components/home/BookingModals";

const fullPhrase = "Travel in Luxury · Arrive in Style";

export default function Home() {
  const { user, isAdmin, logout } = useAuth();
  const { lang, cycleLang } = useLanguage();
  const router = useRouter();
  
  // Booking state
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [isPickupAirport, setIsPickupAirport] = useState(false);
  const [pickupDate, setPickupDate] = useState("");
  const [pickupTime, setPickupTime] = useState("");
  const [bookingMode, setBookingMode] = useState<"oneway" | "hourly">("oneway");
  const [durationHours, setDurationHours] = useState(HOURLY_DURATION_DEFAULT_HOURS);
  // Optimistic default (true, matching hourly_booking_settings' own
  // default-enabled seed) so the common case - hourly actually enabled -
  // never flashes "One way only" before the fetch below resolves. In the
  // rare case it's actually disabled, "By the hour" briefly appears then is
  // removed once GET /pricing/hourly-availability responds - the real gate
  // is server-side (resolveHourlyPricingConfiguration rejects the request
  // regardless of what this flag shows), so this can never be bypassed by
  // racing the fetch.
  const [hourlyBookingAvailable, setHourlyBookingAvailable] = useState(true);

  useEffect(() => {
    hourlyBookingAvailabilityService
      .getAvailability()
      .then(({ enabled }) => {
        setHourlyBookingAvailable(enabled);
        // A customer whose persisted booking mode was "hourly" from an
        // earlier session must not be left on a mode that's no longer
        // offered.
        if (!enabled) setBookingMode((mode) => (mode === "hourly" ? "oneway" : mode));
      })
      .catch(() => setHourlyBookingAvailable(false));
  }, []);

  // The homepage's pre-service duration stepper needs to show the real,
  // configured included-mileage allowance for whichever duration is
  // currently selected - never a per-hour multiplier (includedMilesPerHour
  // was removed from the pricing model on purpose - see
  // HourlyPricingSummaryOption's doc comment). Built as a durationMinutes ->
  // includedMiles lookup, straight from each active hourly-bookable
  // service's own hourlyPricing.options (the same server-computed data
  // /book uses) - a direct read, no arithmetic. A duration only gets an
  // entry when every service offering that exact duration agrees on the
  // mileage, since showing one service's number while another's differs
  // would misrepresent the offer before a vehicle is even chosen; durations
  // with no agreement (or no service offering them at all) are simply
  // absent from the map, and the caption stays silent rather than guessing.
  const [hourlyMileageByDurationMinutes, setHourlyMileageByDurationMinutes] = useState<Map<number, number> | null>(null);
  useEffect(() => {
    serviceService
      .getAll()
      .then((services) => {
        const byDuration = new Map<number, number[]>();
        for (const s of services) {
          if (!s.hourlyPricing) continue;
          for (const opt of s.hourlyPricing.options) {
            const list = byDuration.get(opt.durationMinutes) ?? [];
            list.push(opt.includedMiles);
            byDuration.set(opt.durationMinutes, list);
          }
        }
        const agreed = new Map<number, number>();
        for (const [minutes, milesList] of byDuration) {
          if (milesList.every((m) => Math.abs(m - milesList[0]) < 0.01)) {
            agreed.set(minutes, milesList[0]);
          }
        }
        setHourlyMileageByDurationMinutes(agreed);
      })
      .catch(() => setHourlyMileageByDurationMinutes(null));
  }, []);

  // Load persisted booking data on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = sessionStorage.getItem("wc_booking");
        if (saved) {
          const data = JSON.parse(saved);
          if (data.pickup) setPickup(data.pickup);
          if (data.dropoff) setDropoff(data.dropoff);
          if (data.isPickupAirport) setIsPickupAirport(data.isPickupAirport);
          if (data.pickupDate) setPickupDate(data.pickupDate);
          if (data.pickupTime) setPickupTime(data.pickupTime);
          if (data.bookingMode) setBookingMode(data.bookingMode);
          if (data.hourlyDurationMinutes) setDurationHours(Math.round(data.hourlyDurationMinutes / 60));
        }
      } catch (e) {
        console.error('Failed to load booking data:', e);
      }
    }
  }, []);
  
  // Persist booking data whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined" && (pickup || dropoff || pickupDate || pickupTime)) {
      try {
        const saved = sessionStorage.getItem("wc_booking");
        const existing = saved ? JSON.parse(saved) : {};
        const updated = {
          ...existing,
          pickup,
          dropoff,
          isPickupAirport,
          pickupDate,
          pickupTime,
          bookingMode,
          hourlyDurationMinutes: durationHours * 60,
        };
        sessionStorage.setItem("wc_booking", JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save booking data:', e);
      }
    }
  }, [pickup, dropoff, isPickupAirport, pickupDate, pickupTime, bookingMode, durationHours]);
  
  // UI state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [typedText, setTypedText] = useState("");
  const [isMuted, setIsMuted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isScrollingDown, setIsScrollingDown] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isOnLandingPage, setIsOnLandingPage] = useState(true);
  const [showBookCTA, setShowBookCTA] = useState(false);
  const [isServicesFixed, setIsServicesFixed] = useState(false);
  const [servicesScrollProgress, setServicesScrollProgress] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  
  // Modal state
  type ModalType = "pickup" | "dropoff" | "date" | "time" | null;
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [modalOrigin, setModalOrigin] = useState({ x: 0, y: 0 });
  
  // Refs
  const heroRef = useRef<HTMLDivElement>(null);
  const bookingFormRef = useRef<HTMLDivElement>(null);
  const ctaSectionRef = useRef<HTMLDivElement>(null);
  const servicesRef = useRef<HTMLDivElement>(null);
  const whyWestminsterRef = useRef<HTMLDivElement>(null);
  
  // Typing animation effect
  useEffect(() => {
    if (typedText === fullPhrase) {
      setTimeout(() => {
        setTypedText("");
      }, 2000);
      return;
    }

    const timeout = setTimeout(() => {
      setTypedText(fullPhrase.substring(0, typedText.length + 1));
    }, 150);

    return () => clearTimeout(timeout);
  }, [typedText]);

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
      
      // Show book CTA when off landing page
      setShowBookCTA(!onLanding);

      // Scroll progress bar
      const totalScrollable = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(totalScrollable > 0 ? currentScrollY / totalScrollable : 0);
      
      // Services section static effect
      if (servicesRef.current && whyWestminsterRef.current) {
        const servicesRect = servicesRef.current.getBoundingClientRect();
        const whyWestminsterRect = whyWestminsterRef.current.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        
        // When Services section reaches top of viewport
        if (servicesRect.top <= 0 && servicesRect.bottom > windowHeight) {
          setIsServicesFixed(true);
          
          // Calculate scroll progress (0 to 1)
          const servicesHeight = servicesRect.height;
          const scrollProgress = Math.min(Math.max(-servicesRect.top / servicesHeight, 0), 1);
          setServicesScrollProgress(scrollProgress);
        } else {
          setIsServicesFixed(false);
          setServicesScrollProgress(0);
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  // Modal functions
  const openModal = (type: ModalType, event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setModalOrigin({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
    setActiveModal(type);
  };

  const closeModalAndProceed = (nextField?: ModalType) => {
    setActiveModal(null);
    setTimeout(() => {
      if (nextField) {
        const button = document.querySelector(`[data-field="${nextField}"]`) as HTMLElement;
        if (button) {
          const rect = button.getBoundingClientRect();
          setModalOrigin({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
          setActiveModal(nextField);
        }
      }
    }, 300);
  };

  const handlePickupConfirm = () => {
    if (pickup) {
      closeModalAndProceed(bookingMode === "oneway" ? "dropoff" : "date");
    }
  };

  const handleDropoffConfirm = () => {
    if (dropoff) {
      closeModalAndProceed("date");
    }
  };

  const handleDateConfirm = () => {
    if (pickupDate) {
      closeModalAndProceed("time");
    }
  };

  const handleTimeConfirm = () => {
    if (pickupTime) {
      setActiveModal(null);
      setTimeout(() => {
        handleSearch();
      }, 300);
    }
  };

  const scrollToBookingForm = () => {
    bookingFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleSearch = () => {
    if (!pickup) {
      notify.error("Pickup location is required");
      return;
    }
    if (bookingMode === "oneway" && !dropoff) {
      notify.error("Dropoff location is required");
      return;
    }
    if (pickup.toLowerCase().trim() === dropoff.toLowerCase().trim() && bookingMode === "oneway") {
      notify.error("Pickup and dropoff locations must be different");
      return;
    }
    if (!pickupDate) {
      notify.error("Pickup date is required");
      return;
    }
    if (!pickupTime) {
      notify.error("Pickup time is required");
      return;
    }
    
    const today = new Date();
    const searchDateTime = new Date(`${pickupDate}T${pickupTime}`);
    if (searchDateTime < new Date()) {
      notify.error("Please choose a future pickup date and time.");
      return;
    }
    
    const bookingData = {
      pickup,
      dropoff: bookingMode === "hourly" ? "" : dropoff,
      isPickupAirport,
      pickupDate,
      pickupTime,
      bookingMode,
      hourlyDurationMinutes: bookingMode === "hourly" ? durationHours * 60 : 0,
    };
    seedBookingStore(bookingData);
    router.push("/book");
  };

  const handleSignOut = async () => {
    await logout();
    router.push("/");
  };

  const displayName = user?.fullName || user?.email?.split("@")[0] || "User";

  return (
    <div className="min-h-screen bg-background">
      {/* Scroll Progress Bar */}
      <div
        className="fixed top-0 left-0 z-[100] h-[2px] w-full origin-left bg-accent-blue-bright shadow-[0_0_8px_hsl(210_100%_60%/0.7)]"
        style={{ transform: `scaleX(${scrollProgress})` }}
      />

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData.organization) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData.localBusiness) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData.website) }}
      />

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

      {/* Hero Section */}
      <HeroSection
        heroRef={heroRef}
        typedText={typedText}
        bookingMode={bookingMode}
        setBookingMode={setBookingMode}
        pickup={pickup}
        dropoff={dropoff}
        pickupDate={pickupDate}
        pickupTime={pickupTime}
        durationHours={durationHours}
        setDurationHours={setDurationHours}
        hourlyBookingAvailable={hourlyBookingAvailable}
        hourlyMileageByDurationMinutes={hourlyMileageByDurationMinutes}
        bookingFormRef={bookingFormRef}
        openModal={openModal}
        handleSearch={handleSearch}
      />

      {/* Services Section */}
      <div ref={servicesRef} className={`relative ${isServicesFixed ? 'fixed top-0 left-0 w-full z-30' : ''}`}>
        <ServicesSection />
        {isServicesFixed && (
          <div 
            className="absolute inset-0 bg-background transition-opacity duration-300"
            style={{ opacity: servicesScrollProgress }}
          />
        )}
      </div>

      {/* Why Westminster Section */}
      <div ref={whyWestminsterRef}>
        <WhyWestminsterSection />
      </div>

      {/* Fleet Section */}
      <FleetSection />

      {/* Testimonial Section */}
      <TestimonialSection />

      {/* Contact Section */}
      <ContactSection scrollToBookingForm={scrollToBookingForm} />

      {/* CTA Section */}
      <CTASection
        ctaSectionRef={ctaSectionRef}
        scrollToBookingForm={scrollToBookingForm}
      />

      {/* Footer */}
      <Footer />

      {/* Booking Modals */}
      <BookingModals
        activeModal={activeModal}
        modalOrigin={modalOrigin}
        setActiveModal={setActiveModal}
        pickup={pickup}
        dropoff={dropoff}
        pickupDate={pickupDate}
        pickupTime={pickupTime}
        setPickup={setPickup}
        setDropoff={setDropoff}
        setPickupDate={setPickupDate}
        setPickupTime={setPickupTime}
        setIsPickupAirport={setIsPickupAirport}
        bookingMode={bookingMode}
        handlePickupConfirm={handlePickupConfirm}
        handleDropoffConfirm={handleDropoffConfirm}
        handleDateConfirm={handleDateConfirm}
        handleTimeConfirm={handleTimeConfirm}
      />

      {/* Floating CTA */}
      {/* <FloatingCTA
        showBookCTA={showBookCTA}
        isOnLandingPage={isOnLandingPage}
        ctaSectionRef={ctaSectionRef}
        scrollToBookingForm={scrollToBookingForm}
      /> */}

      {/* Audio Player */}
      {/* <AudioPlayer isMuted={isMuted} setIsMuted={setIsMuted} /> */}
    </div>
  );
}