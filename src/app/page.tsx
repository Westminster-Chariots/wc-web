"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useScroll, useTransform, useMotionValueEvent, useMotionValue, useSpring } from "framer-motion";
import { useTheme } from "@/hooks/useTheme";
import {
  ArrowRight, Phone, Shield, Clock, Car, Users, MapPin,
  Calendar, Plane, Star, CheckCircle2, Search, Menu, X, LogOut, UserCircle, Sun, Moon, Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import LocationInput from "@/components/booking/LocationInput";
import { notify } from "@/lib/notify";
import { useRouteDetails } from "@/hooks/useRouteDetails";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { seedBookingStore } from "@/hooks/useBookingStore";
import { structuredData } from "@/lib/metadata";

export default function Home() {
  const { user, isAdmin, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { lang, toggleLang, t } = useLanguage();
  const router = useRouter();
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [isPickupAirport, setIsPickupAirport] = useState(false);
  const [pickupDate, setPickupDate] = useState("");
  const [pickupTime, setPickupTime] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [headlightFlash, setHeadlightFlash] = useState(0);
  const [showStickyCTA, setShowStickyCTA] = useState(false);

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

  const displayName = user?.fullName || user?.email?.split("@")[0] || "User";
  const isDarkMode = theme === "dark";

  const handleSignOut = async () => {
    await logout();
    router.push("/");
  };

  const heroRef = useRef<HTMLDivElement>(null);
  const servicesRef = useRef<HTMLElement>(null);
  const fleetRef = useRef<HTMLElement>(null);

  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 1200], [0, -300]);
  const heroOpacity = useTransform(scrollY, [0, 600, 900], [1, 1, 0]);
  const headlightIntensity = useTransform(scrollY, [100, 300, 500, 700], [0, 1, 0.3, 1]);
  const textY = useTransform(scrollY, [0, 800], [0, -80]);
  const badgeY = useTransform(scrollY, [0, 800], [0, -110]);
  const cardY = useTransform(scrollY, [0, 800], [0, -40]);
  const trustY = useTransform(scrollY, [0, 800], [0, -60]);
  const overlayScale = useTransform(scrollY, [0, 600], [1, 1.08]);

  useMotionValueEvent(headlightIntensity, "change", (v) => {
    setHeadlightFlash(v);
  });

  useMotionValueEvent(scrollY, "change", (v) => {
    setShowStickyCTA(v > 600);
  });

  const cardRef = useRef<HTMLDivElement>(null);
  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);
  const springX = useSpring(tiltX, { stiffness: 150, damping: 20 });
  const springY = useSpring(tiltY, { stiffness: 150, damping: 20 });
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50 });

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    tiltX.set((y - 0.5) * -10);
    tiltY.set((x - 0.5) * 10);
    setGlarePos({ x: x * 100, y: y * 100 });
  }, [tiltX, tiltY]);

  const handleMouseLeave = useCallback(() => {
    tiltX.set(0);
    tiltY.set(0);
    setGlarePos({ x: 50, y: 50 });
  }, [tiltX, tiltY]);

  useEffect(() => {
    const handler = (e: DeviceOrientationEvent) => {
      const x = (e.beta ?? 0) / 6;
      const y = (e.gamma ?? 0) / 6;
      tiltX.set(Math.max(-5, Math.min(5, x)));
      tiltY.set(Math.max(-5, Math.min(5, y)));
    };
    window.addEventListener("deviceorientation", handler);
    return () => window.removeEventListener("deviceorientation", handler);
  }, [tiltX, tiltY]);

  const { route, isLoading: isLoadingRoute, error: routeError } = useRouteDetails(pickup, dropoff);

  const today = new Date();
  const todayIso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const currentTime = `${String(today.getHours()).padStart(2, "0")}:${String(today.getMinutes()).padStart(2, "0")}`;

  const handleSearch = () => {
    if (!pickup || !dropoff) {
      if (!pickup) notify.error("Pickup location is required");
      else notify.error("Dropoff location is required");
      return;
    }
    if (pickup.toLowerCase().trim() === dropoff.toLowerCase().trim()) {
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
    const bookingData = { pickup, dropoff, isPickupAirport, pickupDate, pickupTime };
    seedBookingStore(bookingData);
    router.push("/book");
  };

  const scrollToSearch = () => {
    document.getElementById("search-card")?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <div className="min-h-screen bg-background">
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
      <header className="fixed top-0 w-full z-50 glass-frosted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 h-14 sm:h-16 flex items-center justify-between">
          <div className="md:hidden flex items-center min-w-[100px]">
            <button 
              className="text-muted-foreground hover:text-foreground transition-colors p-2 -ml-2" 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          <div className="hidden md:flex items-center gap-4 min-w-[200px]">
            {user ? (
              <div className="flex items-center gap-3">
                <Link href="/account" className="glass-pill px-3 py-1.5 text-xs font-body text-foreground flex items-center gap-1.5 hover:text-primary transition-colors">
                  <UserCircle className="h-3.5 w-3.5" />
                  {lang === "en" ? "Welcome" : "Bienvenido"}, {displayName}
                </Link>
                {isAdmin && (
                  <Link href="/admin" className="text-xs font-body text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wider">
                    {t("nav.dashboard")}
                  </Link>
                )}
                <button onClick={handleSignOut} className="text-xs font-body text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1">
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <a href="#services" className="text-xs font-body text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wider">{t("nav.services")}</a>
                <a href="#fleet" className="text-xs font-body text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wider">{t("nav.fleet")}</a>
                <a href="tel:+15714351832" className="flex items-center gap-2 text-xs font-body text-primary hover:text-primary/80 transition-colors">
                  <Phone className="h-3.5 w-3.5" />
                  (571) 435-1832
                </a>
              </div>
            )}
          </div>

          <Link href="/" className="flex flex-col items-center gap-0.5 absolute left-1/2 -translate-x-1/2">
            <Image src="/assets/wc-logo-white.png" alt="WC" width={36} height={36} loading="eager" className="object-contain" style={{ width: "auto", height: "auto" }} />
            <div className="text-center">
              <h1 className="text-[9px] sm:text-[10px] font-display font-semibold text-foreground leading-none uppercase tracking-[0.15em]">Westminster Chariots</h1>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-2 min-w-[200px] justify-end">
            {!user && (
              <Link href="/auth" className="inline-flex items-center justify-center whitespace-nowrap text-xs font-body font-semibold text-primary-foreground bg-primary hover:bg-primary/90 px-4 py-1.5 rounded-md transition-all duration-200 uppercase tracking-wider shadow-sm">
                {t("nav.signIn")}
              </Link>
            )}
            <button
              onClick={toggleLang}
              className="glass-pill px-2.5 py-1.5 flex items-center gap-1.5 text-xs font-body text-muted-foreground hover:text-foreground transition-colors"
              title={lang === "en" ? "Cambiar a español" : "Switch to English"}
              aria-label={lang === "en" ? "Switch to Spanish" : "Switch to English"}
            >
              <Globe className="h-3.5 w-3.5" />
              {lang === "en" ? "ES" : "EN"}
            </button>
            <button
              onClick={() => setTheme(isDarkMode ? "light" : "dark")}
              className="glass-pill p-2 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
              aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDarkMode ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
            </button>
          </div>

          <div className="md:hidden flex items-center gap-2 min-w-[100px] justify-end">
            <button
              onClick={toggleLang}
              className="glass-pill px-2 py-1.5 flex items-center gap-1 text-[10px] font-body text-muted-foreground hover:text-foreground transition-colors"
              aria-label={lang === "en" ? "Switch to Spanish" : "Switch to English"}
            >
              <Globe className="h-3 w-3" />
              {lang === "en" ? "ES" : "EN"}
            </button>
            <button
              onClick={() => setTheme(isDarkMode ? "light" : "dark")}
              className="glass-pill p-1.5 text-muted-foreground hover:text-foreground transition-colors"
              aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDarkMode ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <>
            <div 
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden" 
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, height: 0 }} 
              animate={{ opacity: 1, height: 'auto' }} 
              className="md:hidden border-t border-border bg-background/95 backdrop-blur-xl relative z-50"
            >
              <div className="px-4 py-4 space-y-3">
                <a href="#services" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-body text-muted-foreground hover:text-foreground">{t("nav.services")}</a>
                <a href="#fleet" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-body text-muted-foreground hover:text-foreground">{t("nav.fleet")}</a>
                <a href="tel:+15714351832" className="flex items-center gap-2 text-sm font-body text-primary">
                  <Phone className="h-4 w-4" />
                  (571) 435-1832
                </a>
                {user ? (
                  <>
                    {isAdmin && (
                      <Link href="/admin" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-body text-primary font-semibold">{t("nav.dashboard")}</Link>
                    )}
                    <div className="flex items-center justify-between">
                      <Link href="/account" onClick={() => setMobileMenuOpen(false)} className="text-sm font-body text-muted-foreground hover:text-foreground flex items-center gap-1.5">
                        <UserCircle className="h-4 w-4" />
                        {displayName}
                      </Link>
                      <button onClick={() => { setMobileMenuOpen(false); handleSignOut(); }} className="text-sm font-body text-muted-foreground hover:text-destructive flex items-center gap-1">
                        <LogOut className="h-4 w-4" /> {t("nav.signOut")}
                      </button>
                    </div>
                  </>
                ) : (
                  <Link href="/auth" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-body font-semibold text-primary-foreground bg-primary hover:bg-primary/90 px-3 py-2 rounded-md transition-colors uppercase tracking-wider">{t("nav.signIn")}</Link>
                )}
              </div>
            </motion.div>
          </>
        )}
      </header>

      <section ref={heroRef} className="relative min-h-[90vh] sm:min-h-[100vh] lg:min-h-[90vh] flex items-center pt-14 sm:pt-16 overflow-hidden" id="main-content">
        <motion.div className="absolute inset-0" style={{ y: heroY, opacity: heroOpacity }}>
          <Image src="/assets/hero-mercedes.jpg" alt="Westminster Chariots luxury sedan" fill className="object-cover" style={{ objectFit: 'cover' }} priority sizes="100vw" />
          <div
            className="absolute inset-0 pointer-events-none transition-opacity duration-500"
            style={{
              background: `radial-gradient(ellipse 30% 40% at 75% 55%, hsla(43, 74%, 53%, ${headlightFlash * 0.35}) 0%, transparent 70%)`,
            }}
          />
          <div 
            className="absolute inset-0" 
            style={{
              background: isDarkMode 
                ? 'linear-gradient(to right, hsla(0, 0%, 4%, 1), hsla(0, 0%, 4%, 0.85), hsla(0, 0%, 4%, 0.4))'
                : 'linear-gradient(to right, hsla(0, 0%, 98%, 0.95), hsla(0, 0%, 98%, 0.8), hsla(0, 0%, 98%, 0.3))'
            }} 
          />

          <div 
            className="absolute inset-0" 
            style={{
              background: isDarkMode
                ? 'linear-gradient(to top, hsla(0, 0%, 4%, 1), transparent, hsla(0, 0%, 4%, 0.3))'
                : 'linear-gradient(to top, hsla(0, 0%, 98%, 0.95), transparent, hsla(0, 0%, 98%, 0.2))'
            }} 
          />  
  </motion.div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 w-full grid lg:grid-cols-2 gap-8 lg:gap-12 items-center py-8 lg:py-0">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="space-y-4 sm:space-y-6"
          >
            <motion.div style={{ y: badgeY }} className="inline-flex items-center gap-2 glass-pill px-3 sm:px-4 py-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-[9px] sm:text-[10px] uppercase tracking-widest text-primary font-body font-medium">
                {t("hero.badge")}
              </span>
            </motion.div>
            <motion.h1 style={{ y: textY }} className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-foreground leading-[1.1]">
              {t("hero.title1")}
              <br />
              <span className="text-primary">{t("hero.title2")}</span>
            </motion.h1>
            <motion.p style={{ y: textY }} className="text-sm sm:text-base text-muted-foreground font-body max-w-md leading-relaxed">
              {t("hero.desc")}
            </motion.p>
            <motion.div style={{ y: trustY }} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 pt-2">
              <Button variant="hero" size="lg" className="gap-2 w-full sm:w-auto group" onClick={scrollToSearch}>
                {t("hero.bookRide")}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </motion.div>
            <motion.div style={{ y: trustY }} className="flex items-center gap-4 sm:gap-6 pt-2 sm:pt-4">
              {[
                { icon: Shield, text: t("hero.licensed") },
                { icon: Clock, text: t("hero.247") },
                { icon: Star, text: t("hero.rated") },
              ].map((b) => (
                <div key={b.text} className="flex items-center gap-1.5 sm:gap-2">
                  <b.icon className="h-3 sm:h-3.5 w-3 sm:w-3.5 text-primary" />
                  <span className="text-[10px] sm:text-[11px] text-muted-foreground font-body">{b.text}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            id="search-card"
            ref={cardRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
              y: cardY,
              rotateX: springX,
              rotateY: springY,
              transformPerspective: 800,
              transformStyle: "preserve-3d",
            }}
          >
            <div className="rounded-2xl glass-heavy glass-specular p-4 sm:p-6 overflow-hidden relative">
              <div
                className="pointer-events-none absolute inset-0 z-10 rounded-2xl opacity-30 transition-all duration-200"
                style={{
                  background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, hsla(42, 46%, 80%, 0.18), transparent 55%)`,
                }}
              />
              <h3 className="text-xs uppercase tracking-widest text-primary font-body font-semibold mb-4 sm:mb-5">
                {t("search.title")}
              </h3>
              <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="space-y-3 sm:space-y-4">
                <LocationInput label={t("search.from")} placeholder={t("search.fromPlaceholder")} value={pickup}
                  onChange={(v, isAirport) => { setPickup(v); if (v) setIsPickupAirport(isAirport); }} icon="pickup" />
                <LocationInput label={t("search.to")} placeholder={t("search.toPlaceholder")} value={dropoff}
                  onChange={(v) => setDropoff(v)} icon="dropoff" />
                <div className="grid grid-cols-2 gap-2 sm:gap-3 overflow-hidden">
                  <div className="min-w-0 overflow-hidden">
                    <label className="block text-xs uppercase tracking-widest text-muted-foreground font-body font-medium mb-2">{t("search.date")}</label>
                    <div className="relative overflow-hidden rounded-lg group">
                      <Calendar className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 h-3.5 sm:h-4 w-3.5 sm:w-4 text-primary pointer-events-none z-10 transition-transform group-hover:scale-110" />
                      <input type="date" value={pickupDate}
                        min={todayIso}
                        onChange={(e) => setPickupDate(e.target.value)}
                        style={{ maxWidth: '100%', boxSizing: 'border-box' }}
                        className="w-full min-w-0 block rounded-lg border border-border bg-secondary/50 pl-3 sm:pl-4 pr-10 sm:pr-12 py-2.5 sm:py-3 text-[11px] sm:text-sm font-body text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 hover:border-primary/30 transition-all appearance-none cursor-pointer" />
                    </div>
                  </div>
                  <div className="min-w-0 overflow-hidden">
                    <label className="block text-xs uppercase tracking-widest text-muted-foreground font-body font-medium mb-2">{t("search.time")}</label>
                    <div className="relative overflow-hidden rounded-lg group">
                      <Clock className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 h-3.5 sm:h-4 w-3.5 sm:w-4 text-primary pointer-events-none z-10 transition-transform group-hover:scale-110" />
                      <input type="time" value={pickupTime}
                        min={pickupDate === todayIso ? currentTime : "00:00"}
                        onChange={(e) => setPickupTime(e.target.value)}
                        style={{ maxWidth: '100%', boxSizing: 'border-box' }}
                        className="w-full min-w-0 block rounded-lg border border-border bg-secondary/50 pl-3 sm:pl-4 pr-10 sm:pr-12 py-2.5 sm:py-3 text-[11px] sm:text-sm font-body text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 hover:border-primary/30 transition-all appearance-none cursor-pointer" />
                    </div>
                  </div>
                </div>
                {isLoadingRoute && (
                  <div className="flex items-center gap-4 text-xs text-muted-foreground font-body pt-1 animate-pulse">
                    <span>{t("search.calculating")}</span>
                  </div>
                )}
                {!isLoadingRoute && route && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground font-body">
                      <span>{route.distance.toFixed(1)} mi</span>
                      <span>·</span>
                      <span>{route.duration} min</span>
                    </div>
                    <div className="rounded-lg overflow-hidden border border-border bg-secondary/30 h-32 relative">
                      <iframe
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        loading="lazy"
                        allowFullScreen
                        referrerPolicy="no-referrer-when-downgrade"
                        src={`https://www.google.com/maps/embed/v1/directions?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY}&origin=${encodeURIComponent(pickup)}&destination=${encodeURIComponent(dropoff)}&mode=driving`}
                      />
                    </div>
                  </div>
                )}
                {!isLoadingRoute && routeError && (
                  <div className="p-2 sm:p-2.5 rounded-md bg-destructive/10 border border-destructive/20 text-[10px] sm:text-xs text-destructive font-body leading-tight">
                    <span className="font-semibold">{routeError}:</span> Please select precise, connectable driving locations.
                  </div>
                )}
                <Button type="submit" variant="hero" className="w-full gap-2" size="lg" disabled={!pickup || !dropoff || !!routeError}>
                  <Search className="h-4 w-4" />
                  {t("search.button")}
                </Button>
                <p className="text-[10px] text-center text-muted-foreground font-body">
                  {t("search.wait")}
                </p>
              </form>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="services" ref={servicesRef} className="relative z-10 py-12 sm:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-8 sm:mb-16">
            <span className="text-xs uppercase tracking-widest text-primary font-body font-medium">{t("services.label")}</span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-foreground mt-3">{t("services.heading")}</h2>
            <p className="text-xs sm:text-sm text-muted-foreground font-body mt-3 sm:mt-4 max-w-lg mx-auto">{t("services.desc")}</p>
          </motion.div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {[
              { icon: Plane, title: t("services.airport"), desc: t("services.airportDesc") },
              { icon: Car, title: t("services.corporate"), desc: t("services.corporateDesc") },
              { icon: MapPin, title: t("services.p2p"), desc: t("services.p2pDesc") },
            ].map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
                whileHover={{
                  scale: 1.04,
                  y: -8,
                  transition: {
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                    mass: 0.8,
                  },
                }}
                whileTap={{ scale: 0.98 }}
                className="rounded-xl glass glass-specular p-6 sm:p-8 group overflow-hidden relative cursor-pointer"
                style={{ transformOrigin: "center center" }}
              >
                <motion.div
                  className="absolute inset-0 rounded-xl pointer-events-none"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  style={{
                    background: "radial-gradient(ellipse 80% 60% at 50% 100%, hsla(42, 46%, 80%, 0.08), transparent 70%)",
                  }}
                />
                <motion.div
                  className="absolute inset-0 rounded-xl pointer-events-none"
                  initial={{ opacity: 0, scale: 1 }}
                  whileHover={{
                    opacity: 1,
                    scale: 1.02,
                    transition: { duration: 0.4, ease: "easeOut" },
                  }}
                  style={{
                    border: "1px solid hsla(42, 46%, 80%, 0.15)",
                    boxShadow: "0 0 30px -5px hsla(42, 46%, 80%, 0.15), inset 0 1px 0 0 hsla(0, 0%, 100%, 0.08)",
                  }}
                />
                <motion.div
                  className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg glass-subtle glass-lens flex items-center justify-center mb-4 sm:mb-5 relative z-10"
                  whileHover={{
                    rotate: [0, -8, 8, -4, 4, 0],
                    scale: 1.1,
                    transition: { duration: 0.5, ease: "easeInOut" },
                  }}
                >
                  <s.icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </motion.div>
                <motion.h3
                  className="text-base sm:text-lg font-display font-semibold text-foreground mb-2 sm:mb-3 relative z-10"
                  initial={{ x: 0 }}
                  whileHover={{ x: 4, transition: { duration: 0.3 } }}
                >
                  {s.title}
                </motion.h3>
                <motion.p
                  className="text-xs sm:text-sm text-muted-foreground font-body leading-relaxed relative z-10"
                  initial={{ opacity: 0.8 }}
                  whileHover={{ opacity: 1, transition: { duration: 0.3 } }}
                >
                  {s.desc}
                </motion.p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="fleet" ref={fleetRef} className="relative z-10 py-12 sm:py-24 bg-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}>
              <span className="text-xs uppercase tracking-widest text-primary font-body font-medium">{t("fleet.label")}</span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-foreground mt-3 mb-4 sm:mb-6">{t("fleet.heading")}</h2>
              <p className="text-xs sm:text-sm text-muted-foreground font-body leading-relaxed mb-6 sm:mb-8">{t("fleet.desc")}</p>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {[
                  { label: t("fleet.sedan"), sub: t("fleet.sedanSub") },
                  { label: t("fleet.suv"), sub: t("fleet.suvSub") },
                  { label: t("fleet.wifi"), sub: t("fleet.wifiSub") },
                  { label: t("fleet.flight"), sub: t("fleet.flightSub") },
                ].map((f, i) => (
                  <motion.div
                    key={f.label}
                    className="flex items-start gap-2 sm:gap-3 p-3 rounded-lg glass-subtle cursor-pointer relative overflow-hidden"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1, duration: 0.4 }}
                    whileHover={{
                      scale: 1.05,
                      y: -4,
                      transition: { type: "spring", stiffness: 300, damping: 20 },
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <motion.div
                      className="absolute inset-0 rounded-lg pointer-events-none"
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      style={{
                        background: "radial-gradient(ellipse 100% 80% at 50% 100%, hsla(42, 46%, 80%, 0.1), transparent 60%)",
                        boxShadow: "inset 0 1px 0 0 hsla(0, 0%, 100%, 0.08), 0 0 20px -5px hsla(42, 46%, 80%, 0.12)",
                      }}
                    />
                    <motion.div
                      whileHover={{ scale: 1.2, rotate: 360, transition: { duration: 0.5 } }}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary mt-0.5 shrink-0 relative z-10" />
                    </motion.div>
                    <div className="relative z-10">
                      <p className="text-xs sm:text-sm font-body font-medium text-foreground">{f.label}</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground font-body">{f.sub}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.6, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }} className="grid grid-cols-2 gap-3 sm:gap-4">
              <motion.div
                className="rounded-xl overflow-hidden relative cursor-pointer glass"
                whileHover={{ scale: 1.04, y: -6, transition: { type: "spring", stiffness: 280, damping: 22 } }}
                whileTap={{ scale: 0.98 }}
              >
                <motion.div
                  className="absolute inset-0 rounded-xl pointer-events-none z-20"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.4 }}
                  style={{
                    border: "1px solid hsla(42, 46%, 80%, 0.2)",
                    boxShadow: "0 0 40px -10px hsla(42, 46%, 80%, 0.2), inset 0 1px 0 0 hsla(0, 0%, 100%, 0.1)",
                  }}
                />
                <motion.div
                  className="absolute top-0 left-0 right-0 h-px z-20 pointer-events-none"
                  initial={{ opacity: 0.3 }}
                  whileHover={{ opacity: 0.6 }}
                  style={{
                    background: "linear-gradient(90deg, transparent, hsla(42, 46%, 80%, 0.4), transparent)",
                  }}
                />
                <div className="relative h-40 sm:h-64">
                  <Image src="/assets/suv-interior.jpg" alt="Luxury SUV interior" fill className="object-cover" sizes="(min-width: 1024px) 45vw, 100vw" />
                </div>
                <motion.div
                  className="absolute inset-0 pointer-events-none"
                  initial={{ opacity: 0.4 }}
                  whileHover={{ opacity: 0.6 }}
                  style={{
                    background: "linear-gradient(to top, hsla(0, 0%, 0%, 0.5) 0%, transparent 50%)",
                  }}
                />
              </motion.div>
              <motion.div
                className="rounded-xl overflow-hidden relative cursor-pointer glass mt-6 sm:mt-8"
                whileHover={{ scale: 1.04, y: -6, transition: { type: "spring", stiffness: 280, damping: 22 } }}
                whileTap={{ scale: 0.98 }}
              >
                <motion.div
                  className="absolute inset-0 rounded-xl pointer-events-none z-20"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.4 }}
                  style={{
                    border: "1px solid hsla(42, 46%, 80%, 0.2)",
                    boxShadow: "0 0 40px -10px hsla(42, 46%, 80%, 0.2), inset 0 1px 0 0 hsla(0, 0%, 100%, 0.1)",
                  }}
                />
                <motion.div
                  className="absolute top-0 left-0 right-0 h-px z-20 pointer-events-none"
                  initial={{ opacity: 0.3 }}
                  whileHover={{ opacity: 0.6 }}
                  style={{
                    background: "linear-gradient(90deg, transparent, hsla(42, 46%, 80%, 0.4), transparent)",
                  }}
                />
                <div className="relative h-40 sm:h-64">
                  <Image src="/assets/chauffeur-service.jpg" alt="Professional chauffeur" fill className="object-cover" sizes="(min-width: 1024px) 45vw, 100vw" />
                </div>
                <motion.div
                  className="absolute inset-0 pointer-events-none"
                  initial={{ opacity: 0.4 }}
                  whileHover={{ opacity: 0.6 }}
                  style={{
                    background: "linear-gradient(to top, hsla(0, 0%, 0%, 0.5) 0%, transparent 50%)",
                  }}
                />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="relative z-10 py-12 sm:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground">{t("why.heading")}</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {[
              { icon: Shield, title: t("why.chauffeurs"), desc: t("why.chauffeursDesc") },
              { icon: Car, title: t("why.fleet"), desc: t("why.fleetDesc") },
              { icon: Clock, title: t("why.ontime"), desc: t("why.ontimeDesc") },
              { icon: Users, title: t("why.corporate"), desc: t("why.corporateDesc") },
            ].map((w, i) => (
              <motion.div key={w.title} initial={{ opacity: 0, y: 25, scale: 0.9 }} whileInView={{ opacity: 1, y: 0, scale: 1 }} viewport={{ once: true, margin: "-40px" }} transition={{ duration: 0.5, delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }} className="text-center group">
                <motion.div
                  className="h-12 w-12 sm:h-14 sm:w-14 rounded-full glass glass-lens flex items-center justify-center mx-auto mb-3 sm:mb-4 overflow-hidden relative"
                  whileHover={{ scale: 1.1, backgroundColor: "hsl(42, 46%, 80%, 0.2)" }}
                  transition={{ duration: 0.2 }}
                >
                  <w.icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </motion.div>
                <h4 className="text-xs sm:text-sm font-display font-semibold text-foreground mb-1 sm:mb-2">{w.title}</h4>
                <p className="text-[10px] sm:text-xs text-muted-foreground font-body">{w.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-border py-6 sm:py-12 pb-32 sm:pb-12 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 sm:gap-8 mb-6">
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
              <div className="flex items-center gap-2">
                <Image src="/assets/wc-logo-white.png" alt="WC" width={32} height={32} loading="eager" className="object-contain" style={{ width: "auto", height: "auto" }} />
                <div className="flex flex-col text-left">
                  <span className="text-[10px] sm:text-xs font-display font-semibold text-foreground leading-none uppercase tracking-[0.15em]">Westminster</span>
                  <span className="text-[8px] sm:text-[9px] text-primary font-body uppercase tracking-[0.2em] leading-tight mt-0.5">Chariots</span>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground font-body sm:border-l border-border sm:pl-4 pl-0 text-center sm:text-left">{t("footer.location")}</p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-[10px] sm:text-xs text-muted-foreground font-body">
              <Link href="/about" className="hover:text-primary transition-colors">About</Link>
              <Link href="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-primary transition-colors">Terms</Link>
              <Link href="/careers" className="hover:text-primary transition-colors">Careers</Link>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-8 text-[10px] sm:text-xs text-muted-foreground font-body border-t border-border pt-6">
            <a href="tel:+15714351832" className="hover:text-primary transition-colors">(571) 435-1832</a>
            <a href="mailto:book@westminsterchariots.com" className="hover:text-primary transition-colors">book@westminsterchariots.com</a>
            <span>© {new Date().getFullYear()} Westminster Chariots LLC</span>
          </div>
        </div>
      </footer>

      <motion.div
        initial={{ y: 100 }}
        animate={{ y: showStickyCTA ? 0 : 100 }}
        transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="fixed bottom-0 left-0 right-0 z-50 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] glass-frosted md:hidden"
      >
        <Button variant="hero" size="lg" className="w-full gap-2 group" onClick={scrollToSearch}>
          <Car className="h-4 w-4" />
          {t("cta.bookNow")}
        </Button>
      </motion.div>
    </div>
  );
}
