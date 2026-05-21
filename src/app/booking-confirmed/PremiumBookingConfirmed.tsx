"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ArrowRight, Phone, Mail, MapPin, Clock, Car, Shield, CreditCard, Calendar, Users, Package, Star, Download, Share2, QrCode, Sparkles, ChevronRight, Home, UserCircle, LogOut, Globe, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { notify } from "@/lib/notify";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import ServicesDropdown from "@/components/home/navigation/ServicesDropdown";

interface BookingDetails {
  id: string;
  reservationNumber: string;
  pickupLocation: string;
  dropoffLocation: string;
  pickupDate: string;
  pickupTime: string;
  vehicleType: string;
  totalPrice: string;
  clientName: string;
  clientEmail: string;
  status: string;
  distanceMiles?: number;
  durationMinutes?: number;
  flightNumber?: string;
  specialRequests?: string;
}

function PremiumBookingConfirmed() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAdmin, logout } = useAuth();
  const { lang, cycleLang } = useLanguage();
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const reservationNumber = searchParams.get("reservation");
  const bookingId = searchParams.get("booking_id");

  const displayName = user?.fullName || user?.email?.split("@")[0] || "User";

  const handleSignOut = async () => {
    await logout();
  };

  useEffect(() => {
    if (!reservationNumber && !bookingId) {
      router.push("/");
      return;
    }

    // Fetch booking details
    const fetchBooking = async () => {
      try {
        if (bookingId) {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || "https://wc-backend-ayx0.onrender.com/api/v1"}/bookings/${bookingId}`,
            {
              credentials: "include",
            }
          );

          if (response.ok) {
            const data = await response.json();
            setBooking(data);
          }
        }
      } catch (err) {
        console.error("Failed to fetch booking details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [reservationNumber, bookingId, router]);

  const formatDate = (dateStr: string) => {
    try {
      return new Date(`${dateStr}T00:00:00`).toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const formatTime = (timeStr: string) => {
    try {
      const [hours, minutes] = timeStr.split(":").map(Number);
      const period = hours >= 12 ? "PM" : "AM";
      const displayHours = hours % 12 || 12;
      return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
    } catch {
      return timeStr;
    }
  };

  const handleShareBooking = () => {
    if (navigator.share && booking) {
      navigator.share({
        title: `Westminster Chariots Booking - ${booking.reservationNumber}`,
        text: `I've booked a ${booking.vehicleType} ride with Westminster Chariots. Reservation: ${booking.reservationNumber}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      notify.success("Booking link copied to clipboard!");
    }
  };

  const handleDownloadConfirmation = () => {
    // In a real app, this would generate a PDF
    notify.success("Confirmation PDF will be sent to your email");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="h-16 w-16 rounded-full border-4 border-primary border-t-transparent mx-auto mb-6"
          />
          <p className="text-sm text-muted-foreground font-body">Loading your premium booking details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Premium Navigation Bar - Same as /book */}
      <header className="fixed top-0 w-full z-50 transition-all duration-700 ease-in-out py-3">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="glass-nav-merged rounded-full px-6 py-3 shadow-glass flex items-center justify-between backdrop-blur-xl"
          >
            {/* Logo */}
            <Link href="/" className="group flex items-center gap-3 hover:scale-105 transition-all duration-300">
              <Image 
                src="/assets/wc-logo-full.png" 
                alt="Westminster Chariots" 
                width={40} 
                height={40} 
                className="object-contain transition-all duration-300 group-hover:brightness-110 group-hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" 
              />
            </Link>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden text-foreground hover:text-primary transition-all duration-300 p-2 hover:scale-110 hover:rotate-90" 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <ServicesDropdown isDark={false} />
              
              <a 
                href="/fleet" 
                className="group text-sm text-foreground/80 hover:text-foreground transition-all duration-300 relative"
              >
                <span className="relative z-10">Our Fleet</span>
                <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-blue-gradient scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
              </a>
              
              <a 
                href="/help" 
                className="group text-sm text-foreground/80 hover:text-foreground transition-all duration-300 relative"
              >
                <span className="relative z-10">Help</span>
                <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-blue-gradient scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
              </a>
            </nav>

            {/* User Menu */}
            <div className="flex items-center gap-3 border-l border-white/10 pl-3">
              {user ? (
                <>
                  <Link 
                    href="/account" 
                    className="group hidden md:flex items-center gap-2 text-sm text-foreground/80 hover:text-foreground transition-all duration-300 hover:scale-105"
                  >
                    <UserCircle className="h-4 w-4 group-hover:rotate-12 group-hover:drop-shadow-[0_0_6px_rgba(59,130,246,0.6)] transition-all duration-300" />
                    <span className="hidden lg:inline">{displayName}</span>
                  </Link>
                  {isAdmin && (
                    <Link 
                      href="/admin" 
                      className="group hidden md:block text-sm text-foreground hover:text-primary transition-all duration-300 font-medium relative"
                    >
                      <span className="relative z-10">Dashboard</span>
                      <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-blue-gradient scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
                    </Link>
                  )}
                  <button 
                    onClick={handleSignOut} 
                    className="group hidden md:flex items-center gap-2 text-sm text-foreground/80 hover:text-destructive transition-all duration-300 hover:scale-110"
                  >
                    <LogOut className="h-4 w-4 group-hover:-rotate-12 group-hover:drop-shadow-[0_0_6px_rgba(239,68,68,0.6)] transition-all duration-300" />
                  </button>
                </>
              ) : (
                <Link 
                  href="/auth" 
                  className="hidden md:block btn-primary px-5 py-2 rounded-full text-sm hover:scale-105 active:scale-95 transition-all duration-300"
                >
                  Sign In
                </Link>
              )}
              
              {/* Language Toggle */}
              <button
                onClick={cycleLang}
                className="group flex items-center gap-1.5 text-sm font-semibold text-foreground/80 hover:text-foreground transition-all duration-300 hover:scale-110"
                aria-label={`Switch language - Current: ${lang}`}
              >
                <Globe className="h-4 w-4 group-hover:rotate-12 transition-all duration-300" />
                <span>{lang}</span>
              </button>
            </div>
          </motion.div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            {/* Success Celebration */}
            <div className="text-center space-y-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="inline-flex items-center justify-center"
              >
                <div className="relative">
                  <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary via-blue-500 to-cyan-400 flex items-center justify-center shadow-2xl shadow-primary/30">
                    <Check className="h-12 w-12 text-white" />
                  </div>
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 rounded-full border-4 border-primary/30"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.4, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                    className="absolute inset-0 rounded-full border-2 border-primary/20"
                  />
                </div>
              </motion.div>

              <div className="space-y-2">
                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-4xl sm:text-5xl font-display font-bold bg-gradient-to-r from-primary via-blue-500 to-cyan-400 bg-clip-text text-transparent"
                >
                  Booking Confirmed!
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-lg text-muted-foreground font-body max-w-2xl mx-auto"
                >
                  Your premium ride request has been received. Our dispatch team is reviewing availability.
                </motion.p>
              </div>

              {/* Reservation Badge */}
              {booking && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="inline-flex items-center gap-3 glass-strong rounded-full px-6 py-3 border border-primary/30"
                >
                  <span className="text-sm text-muted-foreground font-body">Reservation</span>
                  <span className="text-xl font-display font-bold text-primary tracking-wider">
                    {booking.reservationNumber}
                  </span>
                  <button
                    onClick={() => setShowQR(!showQR)}
                    className="p-1.5 rounded-lg hover:bg-primary/10 transition-colors"
                    title="Show QR Code"
                  >
                    <QrCode className="h-4 w-4 text-primary" />
                  </button>
                </motion.div>
              )}
            </div>

            {/* QR Code Modal */}
            <AnimatePresence>
              {showQR && booking && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                  onClick={() => setShowQR(false)}
                >
                  <motion.div
                    initial={{ y: 20 }}
                    animate={{ y: 0 }}
                    className="relative glass-strong rounded-2xl p-8 max-w-sm w-full"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="text-center space-y-4">
                      <h3 className="text-lg font-display font-bold text-foreground">Booking QR Code</h3>
                      <div className="h-64 w-64 mx-auto bg-white rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          <div className="h-48 w-48 bg-gradient-to-br from-primary to-blue-500 rounded-lg flex items-center justify-center">
                            <span className="text-white font-mono font-bold text-lg">{booking.reservationNumber}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">Scan for booking details</p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Show this code to your chauffeur for quick verification
                      </p>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: Booking Details */}
              <div className="lg:col-span-2 space-y-6">
                {/* Premium Booking Card */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                  className="glass-strong rounded-2xl border border-primary/20 p-6 sm:p-8 shadow-2xl shadow-primary/10"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-display font-bold text-foreground">Your Premium Ride</h2>
                      <p className="text-sm text-muted-foreground font-body">All details in one place</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleShareBooking}
                        className="p-2 rounded-lg glass-card hover:shadow-glass transition-all duration-300"
                        title="Share booking"
                      >
                        <Share2 className="h-4 w-4 text-primary" />
                      </button>
                      <button
                        onClick={handleDownloadConfirmation}
                        className="p-2 rounded-lg glass-card hover:shadow-glass transition-all duration-300"
                        title="Download confirmation"
                      >
                        <Download className="h-4 w-4 text-primary" />
                      </button>
                    </div>
                  </div>

                  {booking && (
                    <div className="space-y-6">
                      {/* Route Visualization */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <MapPin className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-muted-foreground">Pickup Location</p>
                            <p className="text-lg font-body text-foreground">{booking.pickupLocation}</p>
                          </div>
                        </div>

                        <div className="flex justify-center">
                          <ChevronRight className="h-6 w-6 text-primary rotate-90 lg:rotate-0" />
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                            <MapPin className="h-5 w-5 text-blue-500" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-muted-foreground">Drop-off Location</p>
                            <p className="text-lg font-body text-foreground">{booking.dropoffLocation}</p>
                          </div>
                        </div>
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-border/30">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                            <Calendar className="h-5 w-5 text-amber-500" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-muted-foreground">Date & Time</p>
                            <p className="text-base font-body text-foreground">
                              {formatDate(booking.pickupDate)} at {formatTime(booking.pickupTime)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                            <Car className="h-5 w-5 text-emerald-500" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-muted-foreground">Vehicle</p>
                            <p className="text-base font-body text-foreground capitalize">
                              Business {booking.vehicleType === "suv" ? "SUV" : "Class"}
                            </p>
                          </div>
                        </div>

                        {booking.distanceMiles && (
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-cyan-500/10 flex items-center justify-center">
                              <Sparkles className="h-5 w-5 text-cyan-500" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-muted-foreground">Distance</p>
                              <p className="text-base font-body text-foreground">
                                {booking.distanceMiles.toFixed(1)} miles • {booking.durationMinutes || 0} min
                              </p>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-violet-500/10 flex items-center justify-center">
                            <Users className="h-5 w-5 text-violet-500" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-muted-foreground">Passenger</p>
                            <p className="text-base font-body text-foreground">{booking.clientName || "You"}</p>
                          </div>
                        </div>
                      </div>

                      {/* Special Requests */}
                      {booking.specialRequests && (
                        <div className="pt-6 border-t border-border/30">
                          <div className="flex items-center gap-3 mb-3">
                            <Star className="h-5 w-5 text-primary" />
                            <p className="text-sm font-semibold text-foreground">Special Requests</p>
                          </div>
                          <p className="text-sm font-body text-muted-foreground bg-primary/5 rounded-lg p-4">
                            {booking.specialRequests}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>

                {/* Next Steps Timeline */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 }}
                  className="glass-strong rounded-2xl border border-border/50 p-6 sm:p-8"
                >
                  <h3 className="text-xl font-display font-bold text-foreground mb-6">What Happens Next</h3>
                  
                  <div className="space-y-6">
                    {[
                      {
                        step: 1,
                        title: "Availability Review",
                        description: "Our dispatch team reviews your request and confirms chauffeur availability",
                        icon: Shield,
                        color: "text-primary",
                        bg: "bg-primary/10"
                      },
                      {
                        step: 2,
                        title: "Payment Link",
                        description: "You'll receive a secure payment link via email to confirm your booking",
                        icon: CreditCard,
                        color: "text-blue-500",
                        bg: "bg-blue-500/10"
                      },
                      {
                        step: 3,
                        title: "Chauffeur Assignment",
                        description: "A professional chauffeur is assigned and you'll receive their details",
                        icon: Car,
                        color: "text-emerald-500",
                        bg: "bg-emerald-500/10"
                      },
                      {
                        step: 4,
                        title: "Ride Day",
                        description: "Your chauffeur arrives 15 minutes early for a seamless experience",
                        icon: Star,
                        color: "text-amber-500",
                        bg: "bg-amber-500/10"
                      }
                    ].map((item, index) => (
                      <div key={item.step} className="flex items-start gap-4">
                        <div className={`h-10 w-10 rounded-full ${item.bg} flex items-center justify-center shrink-0`}>
                          <item.icon className={`h-5 w-5 ${item.color}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-semibold text-foreground">Step {item.step}</span>
                            <span className="text-xs text-muted-foreground">•</span>
                            <h4 className="text-base font-display font-semibold text-foreground">{item.title}</h4>
                          </div>
                          <p className="text-sm text-muted-foreground font-body">{item.description}</p>
                        </div>
                        {index < 3 && (
                          <div className="absolute left-5 top-10 h-6 w-0.5 bg-border ml-4" />
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>

              {/* Right Column: Summary & Actions */}
              <div className="space-y-6">
                {/* Price Summary */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                  className="glass-strong rounded-2xl border border-primary/20 p-6 shadow-2xl shadow-primary/10"
                >
                  <h3 className="text-xl font-display font-bold text-foreground mb-6">Price Summary</h3>
                  
                  {booking && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Base fare</span>
                          <span className="font-semibold text-foreground">
                            ${(parseFloat(booking.totalPrice || "0") * 0.8).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Tax (20%)</span>
                          <span className="font-semibold text-foreground">
                            ${(parseFloat(booking.totalPrice || "0") * 0.2).toFixed(2)}
                          </span>
                        </div>
                        <div className="pt-3 border-t border-border/30">
                          <div className="flex justify-between items-center">
                            <span className="text-base font-display font-bold text-foreground">Total Amount</span>
                            <span className="text-2xl font-display font-bold text-primary">
                              ${parseFloat(booking.totalPrice || "0").toFixed(2)}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">All fees, tolls, and taxes included</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="pt-6 border-t border-border/30">
                    <div className="flex items-center gap-3 mb-3">
                      <Shield className="h-5 w-5 text-emerald-500" />
                      <div>
                        <p className="text-sm font-semibold text-foreground">Secure Payment</p>
                        <p className="text-xs text-muted-foreground">Your payment information is protected</p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Contact & Support */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 }}
                  className="glass-strong rounded-2xl border border-border/50 p-6"
                >
                  <h3 className="text-xl font-display font-bold text-foreground mb-6">Need Help?</h3>
                  
                  <div className="space-y-4">
                    <a
                      href="tel:+15714351832"
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-primary/5 transition-colors group"
                    >
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Phone className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">Call Dispatch</p>
                        <p className="text-xs text-muted-foreground">(571) 435-1832</p>
                      </div>
                    </a>

                    <a
                      href="mailto:support@westminsterchariots.com"
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-primary/5 transition-colors group"
                    >
                      <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Mail className="h-5 w-5 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">Email Support</p>
                        <p className="text-xs text-muted-foreground">support@westminsterchariots.com</p>
                      </div>
                    </a>
                  </div>
                </motion.div>

                {/* Action Buttons */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 }}
                  className="space-y-3"
                >
                  <Button
                    onClick={() => router.push("/account")}
                    className="w-full h-12 gap-2 bg-blue-gradient shadow-blue hover:shadow-blue-lg text-base"
                  >
                    <span className="flex items-center gap-2">
                      View Your Booking
                      <ArrowRight className="h-5 w-5" />
                    </span>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => router.push("/")}
                    className="w-full h-11 gap-2"
                  >
                    <Home className="h-4 w-4" />
                    Back to Home
                  </Button>

                  <Button
                    variant="ghost"
                    onClick={() => router.push("/book")}
                    className="w-full h-11 text-primary hover:text-primary/80"
                  >
                    Book Another Ride
                  </Button>
                </motion.div>
              </div>
            </div>

            {/* Footer Note */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="text-center pt-8 border-t border-border/30"
            >
              <p className="text-sm text-muted-foreground font-body">
                Thank you for choosing Westminster Chariots. Your premium experience begins now.
              </p>
              <p className="text-xs text-muted-foreground/70 mt-2">
                You'll receive a confirmation email within 15 minutes.
              </p>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Help Button */}
      <a 
        href="tel:+15714351832" 
        className="fixed bottom-6 right-6 z-40 glass-strong rounded-full p-4 shadow-glass-elevated hover:shadow-glass-elevated-hover transition-all duration-300 hover:scale-110 group"
      >
        <Phone className="h-5 w-5 text-primary group-hover:rotate-12 transition-all duration-300" />
      </a>
    </div>
  );
}

export default PremiumBookingConfirmed;