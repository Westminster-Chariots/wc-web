"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { useTheme } from "@/hooks/useTheme";
import {
  ArrowRight, Phone, Shield, Clock, Star, CheckCircle2, Menu, X, 
  LogOut, UserCircle, MapPin, Plane, Building2, ShieldCheck, ChevronDown,
  Volume2, VolumeX
} from "lucide-react";
import { Button } from "@/components/ui/button";
import LocationInput from "@/components/booking/LocationInput";
import { notify } from "@/lib/notify";
import { useRouteDetails } from "@/hooks/useRouteDetails";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { seedBookingStore } from "@/hooks/useBookingStore";
import { structuredData } from "@/lib/metadata";

const fullPhrase = "Travel in Luxury · Arrive in Style";

type ModalType = "pickup" | "dropoff" | "date" | "time" | null;

export default function Home() {
  const { user, isAdmin, logout } = useAuth();
  const { theme } = useTheme();
  const { lang, toggleLang } = useLanguage();
  const router = useRouter();
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [isPickupAirport, setIsPickupAirport] = useState(false);
  const [pickupDate, setPickupDate] = useState("");
  const [pickupTime, setPickupTime] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [typedText, setTypedText] = useState("");
  const [isMuted, setIsMuted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isScrollingDown, setIsScrollingDown] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isOnLandingPage, setIsOnLandingPage] = useState(true);
  const [showBookCTA, setShowBookCTA] = useState(false);
  const [bookingMode, setBookingMode] = useState<"oneway" | "hourly">("oneway");
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [modalOrigin, setModalOrigin] = useState({ x: 0, y: 0 });
  
  const heroRef = useRef(null);
  const bookingFormRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const isHeroInView = useInView(heroRef, { amount: 0.3 });

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

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const heroHeight = window.innerHeight;
      
      setIsScrolled(currentScrollY > 50);
      const onLanding = currentScrollY < heroHeight - 100;
      setIsOnLandingPage(onLanding);
      setIsScrollingDown(currentScrollY > lastScrollY && currentScrollY > 100);
      setLastScrollY(currentScrollY);
      setShowBookCTA(!onLanding);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

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

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.3;
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {});
      }
    }

    const handleVisibilityChange = () => {
      if (audioRef.current && !document.hidden && !isMuted) {
        audioRef.current.play().catch(() => {});
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isMuted]);

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const displayName = user?.fullName || user?.email?.split("@")[0] || "User";

  const handleSignOut = async () => {
    await logout();
    router.push("/");
  };

  const { route, isLoading: isLoadingRoute, error: routeError } = useRouteDetails(pickup, dropoff);

  const today = new Date();
  const todayIso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const currentTime = `${String(today.getHours()).padStart(2, "0")}:${String(today.getMinutes()).padStart(2, "0")}`;

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
    const searchDateTime = new Date(`${pickupDate}T${pickupTime}`);
    if (searchDateTime < new Date()) {
      notify.error("Please choose a future pickup date and time.");
      return;
    }
    const finalDropoff = bookingMode === "hourly" ? pickup : dropoff;
    const bookingData = { pickup, dropoff: finalDropoff, isPickupAirport, pickupDate, pickupTime };
    seedBookingStore(bookingData);
    router.push("/book");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation - keeping existing code */}
      
      {/* Hero Section - keeping existing code until booking bar */}
      
      {/* Modals */}
      {activeModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6"
          onClick={() => setActiveModal(null)}
        >
          <motion.div
            initial={{ 
              scale: 0,
              x: modalOrigin.x - (typeof window !== 'undefined' ? window.innerWidth / 2 : 0),
              y: modalOrigin.y - (typeof window !== 'undefined' ? window.innerHeight / 2 : 0),
              opacity: 0 
            }}
            animate={{ 
              scale: 1,
              x: 0,
              y: 0,
              opacity: 1 
            }}
            exit={{ 
              scale: 0,
              x: modalOrigin.x - (typeof window !== 'undefined' ? window.innerWidth / 2 : 0),
              y: modalOrigin.y - (typeof window !== 'undefined' ? window.innerHeight / 2 : 0),
              opacity: 0 
            }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="glass-strong rounded-3xl p-8 max-w-2xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {activeModal === "pickup" && (
              <div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <h2 className="text-3xl font-serif text-foreground mb-2">Where are we picking you up?</h2>
                  <p className="text-foreground/70 mb-6">Set your pickup in over 64 countries. We'll be there on time.</p>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <LocationInput 
                    placeholder="Address, airport, hotel, …" 
                    value={pickup}
                    onChange={(v, isAirport) => { 
                      setPickup(v); 
                      if (v) setIsPickupAirport(isAirport); 
                    }} 
                    icon="pickup" 
                  />
                </motion.div>

                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  onClick={handlePickupConfirm}
                  disabled={!pickup}
                  className="w-full mt-6 bg-blue-gradient shadow-blue rounded-full px-8 py-4 text-sm font-semibold text-primary-foreground hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                </motion.button>
              </div>
            )}

            {activeModal === "dropoff" && (
              <div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <h2 className="text-3xl font-serif text-foreground mb-2">Where to?</h2>
                  <p className="text-foreground/70 mb-6">Your destination awaits. Professional service, every mile.</p>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <LocationInput 
                    placeholder="Address, airport, hotel, …" 
                    value={dropoff}
                    onChange={(v) => setDropoff(v)} 
                    icon="dropoff" 
                  />
                </motion.div>

                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  onClick={handleDropoffConfirm}
                  disabled={!dropoff}
                  className="w-full mt-6 bg-blue-gradient shadow-blue rounded-full px-8 py-4 text-sm font-semibold text-primary-foreground hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                </motion.button>
              </div>
            )}

            {activeModal === "date" && (
              <div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <h2 className="text-3xl font-serif text-foreground mb-2">When do you need us?</h2>
                  <p className="text-foreground/70 mb-6">Choose your date. We're available 24/7, every day of the year.</p>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <input 
                    type="date" 
                    value={pickupDate}
                    min={todayIso}
                    onChange={(e) => setPickupDate(e.target.value)}
                    className="w-full bg-white/5 border border-white/20 rounded-2xl px-6 py-4 text-lg text-foreground focus:outline-none focus:border-blue-400 transition-colors"
                  />
                </motion.div>

                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  onClick={handleDateConfirm}
                  disabled={!pickupDate}
                  className="w-full mt-6 bg-blue-gradient shadow-blue rounded-full px-8 py-4 text-sm font-semibold text-primary-foreground hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                </motion.button>
              </div>
            )}

            {activeModal === "time" && (
              <div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <h2 className="text-3xl font-serif text-foreground mb-2">What time?</h2>
                  <p className="text-foreground/70 mb-6">Select your pickup time. Punctuality is our promise.</p>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <input 
                    type="time" 
                    value={pickupTime}
                    min={pickupDate === todayIso ? currentTime : "00:00"}
                    onChange={(e) => setPickupTime(e.target.value)}
                    className="w-full bg-white/5 border border-white/20 rounded-2xl px-6 py-4 text-lg text-foreground focus:outline-none focus:border-blue-400 transition-colors"
                  />
                </motion.div>

                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  onClick={handleTimeConfirm}
                  disabled={!pickupTime}
                  className="w-full mt-6 bg-blue-gradient shadow-blue rounded-full px-8 py-4 text-sm font-semibold text-primary-foreground hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  View Options
                </motion.button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}

      {/* Floating Book CTA - appears when scrolled away from hero */}
      <AnimatePresence>
        {showBookCTA && (
          <motion.button
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ 
              opacity: isOnLandingPage ? 0 : 1, 
              y: isOnLandingPage ? 100 : 0,
              scale: 1
            }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            transition={{ type: "spring", damping: 20, stiffness: 200 }}
            onClick={scrollToBookingForm}
            className="fixed bottom-8 right-8 z-50 bg-blue-gradient shadow-blue rounded-full px-8 py-4 text-sm font-semibold text-primary-foreground hover:scale-110 transition-transform duration-300 flex items-center gap-2"
          >
            <span>Book Your Ride</span>
            <ArrowRight className="h-4 w-4" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Audio and mute button - keeping existing code */}
    </div>
  );
}
